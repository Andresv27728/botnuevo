import मूडी from 'cfonts'

const handler = async (m, { conn }) => {
  const commands = Object.values(global.plugins)
    .filter(p => p.command)
    .map(p => {
      const cmd = Array.isArray(p.command) ? p.command[0] : p.command;
      return {
        command: cmd,
        category: p.category || 'Unknown',
        description: p.description || 'No description',
      };
    });

  const categories = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) {
      acc[cmd.category] = [];
    }
    acc[cmd.category].push(cmd.command);
    return acc;
  }, {});

  const name = conn.user.name

  let menuText = `Hi, I'm ${name}, your WhatsApp bot.\n\nHere are the available commands:\n\n`;

  for (const category in categories) {
    menuText += `*${category.toUpperCase()}*\n`;
    menuText += `\`\`\`${categories[category].join(', ')}\`\`\`\n\n`;
  }

  menuText += `Use any command without a prefix. For example: *ping*.`;

  conn.sendMessage(m.key.remoteJid, { text: menuText }, { quoted: m });
};

handler.command = ['menu', 'help'];
handler.description = 'Displays the menu of available commands.';
handler.category = 'general';

export default handler;