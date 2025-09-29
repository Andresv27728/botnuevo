import { performance } from 'perf_hooks';
import os from 'os';

export default {
  name: 'info',
  aliases: ['botinfo', 'status'],
  description: 'Displays information about the bot.',
  category: 'utility',

  async run({ sock, msg }) {
    const uptime = process.uptime();
    const ramUsage = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB`;

    // The new structure doesn't expose all chats directly, so we'll omit chat counts for now.
    // This can be expanded later if a store is implemented.

    const old = performance.now();
    // A simple operation to measure speed
    const neww = performance.now();
    const speed = `${(neww - old).toFixed(4)} ms`;

    const infoText = `*Bot Information*

- *RAM Usage:* ${ramUsage}
- *Speed:* ${speed}
- *Uptime:* ${toReadableTime(uptime)}
- *Operating System:* ${os.type()} ${os.release()}
- *Node.js Version:* ${process.version}`;

    await sock.sendMessage(msg.key.remoteJid, { text: infoText }, { quoted: msg });
  }
};

function toReadableTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
}