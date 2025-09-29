export default {
  name: 'kick',
  aliases: ['remove'],
  description: 'Removes a user from the group.',
  category: 'group',

  async run({ sock, msg, text, args }) {
    if (!msg.key.remoteJid.endsWith('@g.us')) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'This command can only be used in groups.' }, { quoted: msg });
      return;
    }

    try {
      const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
      const botIsAdmin = groupMetadata.participants.some(p => p.id === sock.user.id.split(':')[0] + '@s.whatsapp.net' && p.admin);
      const senderIsAdmin = groupMetadata.participants.some(p => p.id === msg.key.participant && p.admin);

      if (!botIsAdmin) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'I need to be an admin to remove members.' }, { quoted: msg });
        return;
      }
      if (!senderIsAdmin) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'You need to be an admin to use this command.' }, { quoted: msg });
        return;
      }

      let users = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
      if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
        users.push(msg.message.extendedTextMessage.contextInfo.participant);
      }

      if (users.length === 0) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Please mention a user to kick.' }, { quoted: msg });
        return;
      }

      // Prevent kicking the bot itself or the owner
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      if (users.includes(botId)) {
        await sock.sendMessage(msg.key.remoteJid, { text: "I can't kick myself!" }, { quoted: msg });
        return;
      }

      const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, users, 'remove');
      const success = response.every(res => res.status >= 200 && res.status < 300);

      if (success) {
        await sock.sendMessage(msg.key.remoteJid, { text: `Successfully removed user(s).` }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `Failed to remove some users.` }, { quoted: msg });
      }

    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: `An error occurred: ${e.message}` }, { quoted: msg });
    }
  }
};