import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'database.json');

function readSettingsDb() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database.json:', error);
  }
  return {}; // Return empty object if file doesn't exist or is invalid
}

function writeSettingsDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database.json:', error);
  }
}

export { readSettingsDb, writeSettingsDb };