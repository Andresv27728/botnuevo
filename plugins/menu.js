import { commands } from '../index.js';
import config from '../config.js';

export default {
  name: 'menu',
  aliases: ['help', 'commands'],
  description: 'Displays the menu of available commands.',
  category: 'general',

  async run({ sock, msg }) {
    const botName = config.botName || 'Gawr Gura Ultra';
    let menuText = `*${botName}* - Command Menu\n\n`;

    const categories = {};

    // Group commands by category
    commands.forEach(cmd => {
      const category = cmd.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(cmd.name);
    });

    // Build the menu string
    for (const category in categories) {
      menuText += `*${category.charAt(0).toUpperCase() + category.slice(1)}*\n`;
      menuText += `\`\`\`${categories[category].join(', ')}\`\`\`\n\n`;
    }

    menuText += `Use any command without a prefix. For example: *ping*.`;

    await sock.sendMessage(msg.key.remoteJid, { text: menuText });
  }
};