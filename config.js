import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'

const config = {
  owner: [['573133374132', 'yo soy yo', true]],
  botName: 'gawr gura ultra',
  prems: ['573133374132'],
  authDir: 'session_gawr_gura', // Nombre de la carpeta de sesión
  // Otras configuraciones globales que puedas necesitar
};

export default config;

const file = new URL(import.meta.url).pathname;
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright("Update 'config.js'"));
  import(`${file}?update=${Date.now()}`);
});