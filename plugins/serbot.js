import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rtx = `
❀ *Become a Sub-Bot*

✦ Scan this QR from your WhatsApp:
  More options → Linked devices → Link a new device → Link with QR code

☁︎ *Important:* This QR is only valid for a short time.
`.trim();

const rtx2 = `
❀ *Become a Sub-Bot*

✧ Use this code manually:
  More options → Linked devices → Link a new device → Link with phone number

☁︎ *Important:* This code is only valid for a short time.
`.trim();

async function startSubBot(options) {
    const { subBotDir, m, conn, command } = options;
    const isCodeCommand = command === 'code';

    const { state, saveCreds } = await useMultiFileAuthState(subBotDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const msgRetryCounterCache = new NodeCache();

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        msgRetryCounterCache,
        browser: ['GawrGura-SubBot', 'Chrome', '1.0.0'],
        version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            if (isCodeCommand) {
                try {
                    const secret = await sock.requestPairingCode(m.sender.split('@')[0]);
                    await conn.sendMessage(m.key.remoteJid, { text: rtx2 });
                    await conn.sendMessage(m.key.remoteJid, { text: secret.match(/.{1,4}/g)?.join('-') || secret });
                } catch (e) {
                    console.error("Failed to request pairing code:", e);
                    await conn.sendMessage(m.key.remoteJid, { text: "Failed to generate pairing code. Please try again later." });
                }
            } else {
                const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 });
                await conn.sendMessage(m.key.remoteJid, { image: qrBuffer, caption: rtx });
            }
        }

        if (connection === 'open') {
            const userName = sock.user.name || 'Sub-Bot';
            const userJid = sock.user.id.split(':')[0];
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${userJid}) connected successfully.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`));
            global.conns.push(sock);
            await conn.sendMessage(m.key.remoteJid, { text: `✅ Sub-bot connected successfully for +${userJid}` });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.yellow(`Sub-bot for +${m.sender.split('@')[0]} disconnected. Reason: ${reason}`));

            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log(chalk.yellow("Attempting to reconnect sub-bot..."));
                setTimeout(() => startSubBot(options), 5000);
            } else {
                console.log(chalk.red("Sub-bot logged out. Removing session."));
                fs.rmSync(subBotDir, { recursive: true, force: true });
            }
        }
    }

    sock.ev.on('connection.update', connectionUpdate);
    sock.ev.on('creds.update', saveCreds);
}

export default {
    name: 'serbot',
    aliases: ['qr', 'code'],
    description: 'Creates a sub-bot session to use the bot from another number.',
    category: 'owner',
    owner: true,

    async run({ conn, m, command }) {
        const subBotDir = path.join(__dirname, '../subbots/', m.sender.split('@')[0]);

        if (fs.existsSync(subBotDir)) {
            await conn.sendMessage(m.key.remoteJid, { text: 'You already have an active sub-bot session. To create a new one, please delete the old session first.' });
            return;
        }

        fs.mkdirSync(subBotDir, { recursive: true });

        const options = { subBotDir, m, conn, command };
        await startSubBot(options);
    }
};