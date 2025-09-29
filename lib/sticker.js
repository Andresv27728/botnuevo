import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import webp from 'node-webpmux'
import { fileTypeFromBuffer } from 'file-type'

const __dirname = dirname(fileURLToPath(import.meta.url))

const execPromise = promisify(exec)

async function imageToWebp(media) {
    const tmpFileOut = join(tmpdir(), `${Date.now()}.webp`)
    const tmpFileIn = join(tmpdir(), `${Date.now()}.jpg`)

    await fs.writeFile(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tmpFileIn} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${tmpFileOut}`, (err) => {
            fs.unlink(tmpFileIn)
            if (err) return reject(err)
            resolve()
        })
    })

    const buff = await fs.readFile(tmpFileOut)
    await fs.unlink(tmpFileOut)
    return buff
}

async function videoToWebp(media) {
    const tmpFileOut = join(tmpdir(), `${Date.now()}.webp`)
    const tmpFileIn = join(tmpdir(), `${Date.now()}.mp4`)

    await fs.writeFile(tmpFileIn, media)

    await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tmpFileIn} -vcodec libwebp -filter:v fps=fps=20 -s 512:512 -preset default -an -vsync 0 ${tmpFileOut}`, (err) => {
            fs.unlink(tmpFileIn)
            if (err) return reject(err)
            resolve()
        })
    })

    const buff = await fs.readFile(tmpFileOut)
    await fs.unlink(tmpFileOut)
    return buff
}

async function writeExif(media, packname, author) {
    let webpSticker = await (media.endsWith('.webp') ? fs.readFile(media) : media)
    const img = new webp.Image()
    const json = { "sticker-pack-id": `https://github.com/gawr-gura-ultra`, "sticker-pack-name": packname, "sticker-pack-publisher": author, "emojis": [""] }
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)
    await img.load(webpSticker)
    img.exif = exif
    return await img.save(null)
}


async function sticker(media, url, packname, author) {
    let stiker = false
    if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw await res.text()
        media = await res.arrayBuffer()
    }

    let type = await fileTypeFromBuffer(media) || { mime: 'application/octet-stream', ext: 'bin' }
    if (/webp/.test(type.mime)) {
        stiker = media
    } else if (/image/.test(type.mime)) {
        stiker = await imageToWebp(media)
    } else if (/video/.test(type.mime)) {
        stiker = await videoToWebp(media)
    }

    if (stiker) {
        stiker = await writeExif(stiker, packname, author)
    }
    return stiker
}

export { sticker, imageToWebp, videoToWebp, writeExif }