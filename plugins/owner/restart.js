const handler = async (m, { conn }) => {
  if (!global.owner.some(owner => owner[0] === m.sender.split('@')[0])) {
    return m.reply('This command is for the owner only.');
  }

  m.reply('Restarting bot...').then(() => {
    process.send('reset');
  });
};

handler.command = ['restart'];
handler.description = 'Restart the bot.';
handler.category = 'owner';

export default handler;