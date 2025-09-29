export default {
  name: 'say',
  aliases: ['echo'],
  description: 'Makes the bot repeat a message.',
  category: 'fun',

  async run({ sock, msg, text }) {
    const messageToSay = text.replace(this.name, '').trim();
    if (!messageToSay) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a message for me to say.' });
      return;
    }
    await sock.sendMessage(msg.key.remoteJid, { text: messageToSay });
  }
};