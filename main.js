import { Boom } from '@hapi/boom'
import NodeCache from 'node-cache'
import cfonts from 'cfonts'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import pino from 'pino'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  jidNormalizedUser,
  Browsers,
} from '@whiskeysockets/baileys'

const logger = pino({ level: 'silent' })
const store = makeInMemoryStore({ logger })

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// External session file
const sesion = './lib/session/gawr-gura-ultra.json'
const { state, saveCreds } = await useMultiFileAuthState(sesion)

// Cache for plugins
const pluginFolder = path.join(__dirname, 'plugins');
global.plugins = {};

async function filesInit() {
    const categories = fs.readdirSync(pluginFolder);
    for (const category of categories) {
        const categoryPath = path.join(pluginFolder, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            for (const file of files) {
                const filePath = path.join(categoryPath, file);
                try {
                    const module = await import(filePath);
                    const pluginName = file.replace('.js', '');
                    global.plugins[pluginName] = { ...module.default, category: category, pluginName: pluginName };
                } catch (e) {
                    console.error(chalk.red(`Error loading plugin '${file}':`), e);
                }
            }
        }
    }
    console.log(chalk.blue.bold('✔️  Plugins loaded successfully!'));
}

filesInit();

const connectToWhatsApp = async () => {
  const conn = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: Browsers.macOS('Desktop'),
    auth: state,
    getMessage: async (key) => {
      const jid = jidNormalizedUser(key.remoteJid)
      const msg = await store.loadMessage(jid, key.id)
      return msg?.message || ""
    },
  })

  store.bind(conn.ev)

  conn.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const m = chatUpdate.messages[0]
        if (!m.message) return
        if (m.key.fromMe) return

        await conn.readMessages([m.key])

        const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const command = text.split(' ')[0].toLowerCase()
        const args = text.split(' ').slice(1)
        const isCmd = command.length > 0

        if (!isCmd) return

        const pluginName = Object.keys(global.plugins).find(key =>
            global.plugins[key].command && global.plugins[key].command.includes(command)
        )

        if (pluginName) {
            const plugin = global.plugins[pluginName]
            const isOwner = global.owner.some(owner => owner[0] === m.sender.split('@')[0])
            const isGroup = m.key.remoteJid.endsWith('@g.us')
            let participants = isGroup ? await conn.groupMetadata(m.key.remoteJid).then(md => md.participants) : []
            const groupAdmins = isGroup ? participants.filter(p => p.admin).map(p => p.id) : []
            const isBotAdmin = isGroup ? groupAdmins.includes(conn.user.id) : false
            const isAdmin = isGroup ? groupAdmins.includes(m.sender) : false

            if (plugin.owner && !isOwner) {
                return m.reply('This command can only be used by the bot owner.')
            }
            if (plugin.admin && !isAdmin) {
                return m.reply('This command can only be used by group admins.')
            }
            if (plugin.botAdmin && !isBotAdmin) {
                return m.reply('The bot must be an admin to use this command.')
            }
            if (plugin.group && !isGroup) {
                return m.reply('This command can only be used in groups.')
            }
            if (plugin.private && isGroup) {
                return m.reply('This command can only be used in private chat.')
            }

            try {
                await plugin.handler(m, { conn, text, args, command, isOwner, isAdmin, isBotAdmin, participants })
            } catch (e) {
                console.error(e)
                m.reply(`An error occurred while executing the command: ${e.message}`)
            }
        }
    } catch (err) {
        console.error(chalk.red.bold('Error in messages.upsert event:'), err)
    }
})

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
      if (shouldReconnect) {
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log(chalk.green.bold('✔️ Connection successfully established'))
    }
  })

  conn.ev.on('creds.update', saveCreds)

  return conn
}

connectToWhatsApp()

// Watch for plugin changes
fs.watch(pluginFolder, (event, filename) => {
  if (pluginFilter(filename)) {
    const file = path.join(pluginFolder, filename)
    if (file in require.cache) {
      delete require.cache[file]
      console.log(chalk.yellow(`Plugin '${filename}' updated`))
    } else {
      console.log(chalk.green(`New plugin '${filename}' added`))
    }
    import(file).then(module => {
      global.plugins[filename] = module.default
    }).catch(e => console.error(e))
  }
})