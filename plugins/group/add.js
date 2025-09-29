const handler = async (m, { conn, text, participants }) => {
  let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!users) throw 'Please mention or reply to a user to add.'

  try {
    await conn.groupParticipantsUpdate(m.chat, [users], 'add')
    m.reply(`Successfully added @${users.split('@')[0]}`, null, { mentions: [users] })
  } catch (e) {
    console.error(e)
    m.reply('Failed to add user. Am I an admin?')
  }
}

handler.command = ['add']
handler.description = 'Add a user to the group.'
handler.category = 'group'
handler.admin = true
handler.botAdmin = true

export default handler;