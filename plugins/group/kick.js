const handler = async (m, { conn, text, participants }) => {
  let users = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  if (!users) throw 'Please mention or reply to a user to kick.'

  try {
    await conn.groupParticipantsUpdate(m.chat, [users], 'remove')
    m.reply(`Successfully kicked @${users.split('@')[0]}`, null, { mentions: [users] })
  } catch (e) {
    console.error(e)
    m.reply('Failed to kick user. Am I an admin?')
  }
}

handler.command = ['kick']
handler.description = 'Remove a user from the group.'
handler.category = 'group'
handler.admin = true
handler.botAdmin = true

export default handler;