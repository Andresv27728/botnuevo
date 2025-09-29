import { readSettingsDb, writeSettingsDb } from '../lib/database.js';

export default {
  name: 'welcome',
  aliases: ['setwelcome'],
  description: 'Manages welcome messages for new group members.',
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
        return sock.sendMessage(groupId, { text: 'Usage:\n\n*welcome on* - Enable welcome messages\n*welcome off* - Disable welcome messages\n*welcome <message>* - Set a custom message. Use @user as a placeholder for the new member.' });
      }

      const db = readSettingsDb();
      if (!db[groupId]) {
        db[groupId] = {};
      }

      if (option === 'on') {
        db[groupId].welcome = true;
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: '✅ Welcome messages have been enabled.' });
      } else if (option === 'off') {
        db[groupId].welcome = false;
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: '❌ Welcome messages have been disabled.' });
      } else {
        const message = args.join(' ');
        if (!message.includes('@user')) {
            return sock.sendMessage(groupId, { text: 'Your welcome message must include the "@user" placeholder.' });
        }
        db[groupId].welcomeMessage = message;
        db[groupId].welcome = true; // Also enable it when a message is set
        writeSettingsDb(db);
        await sock.sendMessage(groupId, { text: `✅ Welcome message has been set to:\n\n${message}` });
      }
    } catch (e) {
      console.error("Error in 'welcome' command:", e);
      await sock.sendMessage(groupId, { text: 'An error occurred while processing your request.' });
    }
  }
};