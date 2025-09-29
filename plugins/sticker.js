import { sticker } from '../lib/sticker.js';
import config from '../config.js';

export default {
  name: 'sticker',
  aliases: ['s'],
  description: 'Create a sticker from an image, video, or URL.',
  category: 'fun',

  async run({ sock, msg, text }) {
    let stiker = false;
    try {
      const q = msg.quoted ? msg.quoted : msg;
      const mime = (q.msg || q).mimetype || q.mediaType || '';

      if (/webp|image|video/g.test(mime)) {
        const img = await sock.downloadMediaMessage(q);
        if (!img) throw new Error('Failed to download media.');
        stiker = await sticker(img, false, config.botName, config.owner[0][1]);
      } else if (/url/i.test(text)) {
        const url = text.split(' ').find(s => s.startsWith('http'));
        if (!url) throw new Error('No valid URL found.');
        stiker = await sticker(null, url, config.botName, config.owner[0][1]);
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Reply to an image/video or provide a URL to create a sticker.' });
        return;
      }

      if (stiker) {
        await sock.sendMessage(msg.key.remoteJid, { sticker: stiker });
      } else {
        throw new Error('Sticker conversion failed.');
      }
    } catch (e) {
      console.error(e);
      await sock.sendMessage(msg.key.remoteJid, { text: `Error: ${e.message}` });
    }
  }
};