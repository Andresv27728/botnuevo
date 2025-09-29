import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isRunning = false;

function startBot() {
    if (isRunning) return;
    isRunning = true;

    const botProcess = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit', // This will pipe the bot's console output to the manager's console
    });

    botProcess.on('exit', (code) => {
        isRunning = false;
        console.log(chalk.red.bold(`Bot process exited with code: ${code}`));

        if (code !== 0) {
            console.log(chalk.yellow.bold('Restarting bot in 3 seconds...'));
            setTimeout(startBot, 3000);
        } else {
            console.log(chalk.green.bold('Bot process exited cleanly. Not restarting.'));
        }
    });

    botProcess.on('error', (err) => {
        isRunning = false;
        console.error(chalk.red.bold('Failed to start bot process:'), err);
    });
}

console.log(chalk.blue.bold('Starting bot process manager...'));
startBot();