const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'db');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

const readDB = (file) => {
  try {
    const p = path.join(DB_PATH, file);
    if (!fs.existsSync(p)) return file.includes('settings') ? { activeModel: 'gemini-3-pro-preview' } : [];
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return file.includes('settings') ? { activeModel: 'gemini-3-pro-preview' } : [];
  }
};

const writeDB = (file, data) => {
  fs.writeFileSync(path.join(DB_PATH, file), JSON.stringify(data, null, 2));
};

module.exports = { readDB, writeDB };
