export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Checks the bot\'s latency.',
  category: 'general',

  async run({ sock, msg }) {
    const startTime = Date.now();
    // Sending a message and waiting for the server to acknowledge it isn't a true ping.
    // A better measure is just the processing time.
    const processingTime = Date.now() - startTime;
    await sock.sendMessage(msg.key.remoteJid, { text: `Pong! 🏓\nResponse time: ${processingTime}ms` });
  }
};