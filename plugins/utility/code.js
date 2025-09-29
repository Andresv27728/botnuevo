import { promises as fs } from 'fs';
import path from 'path';

const subbotsDir = path.join(process.cwd(), 'subbots');

// Ensure the subbots directory exists
fs.mkdir(subbotsDir, { recursive: true }).catch(console.error);

function generateCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const handler = async (m, { conn, text }) => {
    const userJid = m.sender;
    const code = generateCode();
    const filePath = path.join(subbotsDir, `${userJid.split('@')[0]}.json`);

    try {
        const subbotData = {
            jid: userJid,
            code: code,
            createdAt: new Date().toISOString()
        };

        await fs.writeFile(filePath, JSON.stringify(subbotData, null, 2));

        await conn.sendMessage(userJid, { text: `Your sub-bot linking code is: *${code}*\n\nUse this code to link your sub-bot.` });
        m.reply('I have sent the linking code to your private chat.');

    } catch (error) {
        console.error('Failed to generate sub-bot code:', error);
        m.reply('I could not generate a linking code. Please try again later.');
    }
};

handler.command = ['code', 'linkcode'];
handler.description = 'Generates a code to link a sub-bot.';
handler.category = 'utility';
handler.private = true; // Recommended to be used in private chat

export default handler;