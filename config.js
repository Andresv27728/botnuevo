import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

const file = fileURLToPath(import.meta.url)

global.owner = [['573133374132', 'yo soy yo', true]]
global.botName = 'gawr gura ultra'
global.prems = ['573133374132']

watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})