export default {
  name: 'add',
  aliases: [],
  description: 'Adds a user to the group.',
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
        await sock.sendMessage(msg.key.remoteJid, { text: 'I need to be an admin to add members.' }, { quoted: msg });
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

      const numbers = args.join(' ').match(/\d+/g);
      if (numbers) {
        users = users.concat(numbers.map(n => `${n}@s.whatsapp.net`));
      }

      if (users.length === 0) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Please mention a user or provide a number to add.' }, { quoted: msg });
        return;
      }

      const response = await sock.groupParticipantsUpdate(msg.key.remoteJid, users, 'add');

      // The response structure can be complex, so we check for success codes
      const success = response.every(res => res.status >= 200 && res.status < 300);

      if (success) {
        await sock.sendMessage(msg.key.remoteJid, { text: `Successfully added user(s).` }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `Failed to add some users. They may have blocked the bot or have privacy settings enabled.` }, { quoted: msg });
      }

    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: `An error occurred: ${e.message}` }, { quoted: msg });
    }
  }
};