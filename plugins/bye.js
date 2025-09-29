import { readSettingsDb, writeSettingsDb } from '../lib/database.js';

export default {
  name: 'bye',
  aliases: ['setbye'],
  description: 'Manages farewell messages for departing group members.',
  category: 'group',

  async run({ sock, msg, args }) {
    if (!msg.key.remoteJid.endsWith('@g.us')) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'This command can only be used in groups.' });
    }

    const groupId = msg.key.remoteJid;
    const senderId = msg.key.participant;

    try {
      const groupMetadata = await sock.groupMetadata(groupId);
      const senderIsAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

      if (!senderIsAdmin) {
        return sock.sendMessage(groupId, { text: 'You must be a group admin to use this command.' });
      }

      const option = args[0]?.toLowerCase();
      if (!option) {
        return sock.sendMessage(groupId, { text: 'Usage:\n\n*bye on* - Enable farewell messages\n*bye off* - Disable farewell messages\n*bye <message>* - Set a custom message. Use @user as a placeholder for the departing member.' });
      }

      const db = readSettingsDb();
      if (!db[groupId]) {
        db[groupId] = {};
      }

      if (option === 'on') {
        db[groupId].bye = true;
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: '✅ Farewell messages have been enabled.' });
      } else if (option === 'off') {
        db[groupId].bye = false;
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: '❌ Farewell messages have been disabled.' });
      } else {
        const message = args.join(' ');
        if (!message.includes('@user')) {
            return sock.sendMessage(groupId, { text: 'Your farewell message must include the "@user" placeholder.' });
        }
        db[groupId].byeMessage = message;
        db[groupId].bye = true; // Also enable it when a message is set
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: `✅ Farewell message has been set to:\n\n${message}` });
      }
    } catch (e) {
      console.error("Error in 'bye' command:", e);
      await sock.sendMessage(groupId, { text: 'An error occurred while processing your request.' });
    }
  }
};