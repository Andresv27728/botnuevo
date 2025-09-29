const handler = async (m, { conn, text }) => {
  if (!text) throw 'Please provide a message to say.'
  conn.sendMessage(m.key.remoteJid, { text: text }, { quoted: m })
}

handler.command = ['say']
handler.description = 'Make the bot repeat a message.'
handler.category = 'fun'

export default handler;