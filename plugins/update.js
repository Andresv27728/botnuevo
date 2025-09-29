import { exec } from 'child_process';

export default {
  name: 'update',
  aliases: ['gitpull'],
  description: 'Updates the bot from the git repository.',
  category: 'owner',
  owner: true, // Flag for owner-only command

  async run({ sock, msg }) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Updating bot from repository...' }, { quoted: msg });

    exec('git pull', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        sock.sendMessage(msg.key.remoteJid, { text: `Update failed:\n\`\`\`${stderr}\`\`\`` }, { quoted: msg });
        return;
      }

      let response = `*Update Result:*\n\n\`\`\`${stdout || 'No output'}\`\`\``;
      if (stderr) {
        response += `\n\n*Stderr:*\n\`\`\`${stderr}\`\`\``;
      }

      sock.sendMessage(msg.key.remoteJid, { text: response }, { quoted: msg }).then(() => {
        if (stdout && !stdout.includes('Already up to date')) {
          sock.sendMessage(msg.key.remoteJid, { text: 'Update downloaded. Restarting to apply changes...' }, { quoted: msg }).then(() => {
            // The new index.js has a maintenance task that restarts hourly.
            // For an immediate update, we can exit the process.
            process.exit(0);
          });
        }
      });
    });
  }
};