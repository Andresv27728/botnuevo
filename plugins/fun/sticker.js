import { sticker } from '../../lib/sticker.js'

const handler = async (m, { conn, text }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        if (/webp|image|video/g.test(mime)) {
            let img = await q.download?.()
            if (!img) throw `Reply to a sticker/image/video`
            stiker = await sticker(img, false, global.packname, global.author)
        } else if (/enlace|url/i.test(text)) {
            stiker = await sticker(false, text, global.packname, global.author)
        }
    } catch (e) {
        console.error(e)
        stiker = e
    } finally {
        if (stiker) {
            m.reply(stiker)
        } else {
            throw 'Conversion failed'
        }
    }
}

handler.command = ['sticker', 's']
handler.description = 'Create a sticker from an image or video.'
handler.category = 'fun'

export default handler;