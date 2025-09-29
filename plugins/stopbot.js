import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: 'stopbot',
  aliases: ['deletesession', 'endsubbot'],
  description: 'Deletes your current sub-bot session.',
  category: 'owner',
  owner: true,

  async run({ sock, msg }) {
    const senderJid = (msg.key.participant || msg.key.remoteJid);
    const subBotDir = path.join(__dirname, '../subbots/', senderJid.split('@')[0]);

    if (fs.existsSync(subBotDir)) {
      try {
        // Find and close the active connection for this sub-bot, if it exists
        const subBotConn = global.conns.find(c => c.user?.id.startsWith(senderJid.split('@')[0]));
        if (subBotConn) {
          await subBotConn.logout();
          // Remove from the global connections array
          const index = global.conns.indexOf(subBotConn);
          if (index > -1) {
            global.conns.splice(index, 1);
          }
        }

        // Delete the session directory
        fs.rmSync(subBotDir, { recursive: true, force: true });
        await sock.sendMessage(msg.key.remoteJid, { text: '✅ Your sub-bot session has been successfully deleted. You can now create a new one with the `serbot` command.' });
      } catch (e) {
        console.error("Error deleting sub-bot session:", e);
        await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred while deleting your session. Please try again.' });
      }
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: 'You do not have an active sub-bot session.' });
    }
  }
};