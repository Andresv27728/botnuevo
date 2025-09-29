import { Boom } from '@hapi/boom'
import { commands, aliases, cooldowns } from './index.js'
import config from './config.js'

const COOLDOWN_SECONDS = 5;

export async function handler(m, isSubBot) {
  if (!m.messages || m.messages.length === 0) return;

  const msg = m.messages[0];
  if (msg.key.fromMe && !isSubBot) return;
  if (!msg.message) return;

  const { message } = msg;
  const text = message.conversation || message.extendedTextMessage?.text || '';
  if (!text.trim()) return;

  const [commandName, ...args] = text.trim().split(/\s+/);
  const lowerCaseCommand = commandName.toLowerCase();

  const command = commands.get(lowerCaseCommand) || commands.get(aliases.get(lowerCaseCommand));

  if (!command) return;

  const userId = msg.key.remoteJid.endsWith('@g.us') ? msg.key.participant : msg.key.remoteJid;

  // Cooldown check
  const now = Date.now();
  const userCooldowns = cooldowns.get(userId) || new Map();
  const lastUsed = userCooldowns.get(command.name) || 0;

  if (now - lastUsed < COOLDOWN_SECONDS * 1000) {
    const timeLeft = ((lastUsed + COOLDOWN_SECONDS * 1000 - now) / 1000).toFixed(1);
    await this.sendMessage(msg.key.remoteJid, { text: `Please wait ${timeLeft}s before using this command again.` }, { quoted: msg });
    return;
  }

  // Update cooldown timestamp
  userCooldowns.set(command.name, now);
  cooldowns.set(userId, userCooldowns);

  // Permission checks
  const isOwner = config.owner.some(o => o[0] === userId.split('@')[0]);
  if (command.owner && !isOwner) {
    await this.sendMessage(msg.key.remoteJid, { text: 'This command is for the bot owner only.' }, { quoted: msg });
    return;
  }

  try {
    await command.run({
      sock: this,
      msg,
      args,
      text,
      commandName: lowerCaseCommand,
      isOwner,
    });
  } catch (error) {
    console.error(`Error executing command '${command.name}':`, error);
    const errorMessage = error instanceof Boom ? error.output.payload.message : 'An unexpected error occurred.';
    await this.sendMessage(msg.key.remoteJid, { text: `Error: ${errorMessage}` }, { quoted: msg });
  }
}