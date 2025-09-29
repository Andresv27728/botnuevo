export default {
  name: 'restart',
  aliases: ['reboot'],
  description: 'Restarts the bot.',
  category: 'owner',
  owner: true, // Flag for owner-only command

  async run({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Restarting bot...' });
    // The process manager (e.g., pm2, or the logic in index.js) should handle the restart.
    // Exiting the process is a common way to trigger this.
    process.exit(0);
  }
};