import { exec } from 'child_process';

const handler = async (m, { conn, text }) => {
  if (!global.owner.some(owner => owner[0] === m.sender.split('@')[0])) {
    return m.reply('This command is for the owner only.');
  }

  m.reply('Updating bot from repository...');

  exec('git pull', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return m.reply(`Error during update:\n${stderr}`);
    }
    let response = '';
    if (stdout) response += `*Stdout:*\n${stdout}`;
    if (stderr) response += `*Stderr:*\n${stderr}`;

    m.reply(response || 'Update complete, but no output was returned.');

    if (stdout.includes('Already up to date.')) return;

    conn.sendMessage(m.chat, { text: 'Update applied. Restarting...' }).then(() => {
        process.send('reset');
    });
  });
};

handler.command = ['update'];
handler.description = 'Update the bot from the official repository.';
handler.category = 'owner';

export default handler;