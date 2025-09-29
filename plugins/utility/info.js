import { performance } from 'perf_hooks';

const handler = async (m, { conn }) => {
  const Gc = conn.chats.all().filter(v => v.id.endsWith('@g.us')).length
  const personal = conn.chats.all().filter(v => v.id.endsWith('@s.whatsapp.net')).length
  const ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB`
  const old = performance.now()
  const neww = performance.now()
  const speed = `${(neww - old).toFixed(4)} ms`

  m.reply(`
*Bot Information*

- *Groups:* ${Gc}
- *Private Chats:* ${personal}
- *RAM Usage:* ${ram}
- *Speed:* ${speed}
- *Uptime:* ${toReadableTime(process.uptime())}
  `);
};

handler.command = ['info', 'botinfo'];
handler.description = 'Displays information about the bot.';
handler.category = 'utility';

export default handler;

function toReadableTime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return `${days}d ${hours}h ${minutes}m ${Math.floor(seconds)}s`;
}