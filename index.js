import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'
import chalk from 'chalk'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const { name, author } = require('./package.json')

console.log('Starting...')

cfonts.say('Gawr Gura', {
  font: 'block',
  align: 'center',
  gradient: ['cyan', 'blue']
})
cfonts.say(`'${name}' By ${author}`, {
  font: 'console',
  align: 'center',
  gradient: ['cyan', 'blue']
})

let isRunning = false

function start(file) {
  if (isRunning) return
  isRunning = true
  const args = [join(__dirname, file), ...process.argv.slice(2)]

  console.log(chalk.yellow.bold('✔️ Activating bot, please wait...'))

  setupMaster({
    exec: args[0],
    args: args.slice(1),
  })

  let p = fork()
  p.on('message', data => {
    console.log(chalk.cyan.bold('[RECEIVED]'), data)
    switch (data) {
      case 'reset':
        p.kill()
        isRunning = false
        start.apply(this, arguments)
        break
      case 'uptime':
        p.send(process.uptime())
        break
    }
  })

  p.on('exit', code => {
    isRunning = false
    console.error(chalk.red.bold('An unexpected error occurred:'), code)

    if (code === 0) return

    watchFile(args[0], () => {
      unwatchFile(args[0])
      start(file)
    })
  })
}

start('main.js')