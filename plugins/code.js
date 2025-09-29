import { promises as fs } from 'fs';
import path from 'path';

const subbotsDir = path.join(process.cwd(), 'subbots');

// Ensure the subbots directory exists at startup
fs.mkdir(subbotsDir, { recursive: true }).catch(console.error);

function generateCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default {
  name: 'code',
  aliases: ['link', 'subbot'],
  description: 'Generates a code to link a sub-bot.',
  category: 'utility',

  async run({ sock, msg }) {
    const userJid = msg.key.remoteJid.endsWith('@g.us') ? msg.key.participant : msg.key.remoteJid;
    const code = generateCode();
    const filePath = path.join(subbotsDir, `${userJid.split('@')[0]}.json`);

    try {
      const subbotData = {
        jid: userJid,
        code: code,
        createdAt: new Date().toISOString()
      };

      await fs.writeFile(filePath, JSON.stringify(subbotData, null, 2));

      await sock.sendMessage(userJid, { text: `Your sub-bot linking code is: *${code}*\n\nUse this code to link your sub-bot.` });

      if (msg.key.remoteJid.endsWith('@g.us')) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'I have sent the linking code to your private chat.' });
      }

    } catch (error) {
      console.error('Failed to generate sub-bot code:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: 'I could not generate a linking code. Please try again later.' });
    }
  }
};