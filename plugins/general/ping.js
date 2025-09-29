const handler = async (m) => {
  const startTime = new Date();
  await m.reply('Pinging...');
  const endTime = new Date();
  const latency = endTime - startTime;
  m.reply(`Pong! Latency: ${latency}ms`);
};

handler.command = ['ping'];
handler.description = 'Check the bot\'s response time.';
handler.category = 'general';

export default handler;