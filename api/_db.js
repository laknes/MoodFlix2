const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'db');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

let usingPg = false;
let pool = null;
if (process.env.DATABASE_URL) {
  try {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
    usingPg = true;
    (async () => {
      await pool.query(`CREATE TABLE IF NOT EXISTS users (id text PRIMARY KEY, name text, email text UNIQUE, is_admin boolean);`);
      await pool.query(`CREATE TABLE IF NOT EXISTS history (id text PRIMARY KEY, user_id text, data jsonb, timestamp timestamptz);`);
      await pool.query(`CREATE TABLE IF NOT EXISTS settings (id serial PRIMARY KEY, data jsonb);`);
      const res = await pool.query('SELECT COUNT(*) FROM settings');
      if (parseInt(res.rows[0].count, 10) === 0) {
        await pool.query('INSERT INTO settings (data) VALUES ($1)', [JSON.stringify({ activeModel: 'gemini-3-pro-preview' })]);
      }
    })().catch(err => console.error('DB init error', err));
  } catch (e) {
    console.warn('pg not available or failed to initialize, falling back to file DB', e.message);
    usingPg = false;
  }
}

const readFile = (file) => {
  try {
    const p = path.join(DB_PATH, file);
    if (!fs.existsSync(p)) return file.includes('settings') ? { activeModel: 'gemini-3-pro-preview' } : [];
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return file.includes('settings') ? { activeModel: 'gemini-3-pro-preview' } : [];
  }
};

const writeFile = (file, data) => {
  fs.writeFileSync(path.join(DB_PATH, file), JSON.stringify(data, null, 2));
};

const getUsers = async () => {
  if (usingPg) {
    const r = await pool.query('SELECT id, name, email, is_admin FROM users');
    return r.rows.map(r => ({ id: r.id, name: r.name, email: r.email, isAdmin: r.is_admin }));
  }
  return readFile('users.json');
};

const findUserByEmail = async (email) => {
  if (usingPg) {
    const r = await pool.query('SELECT id, name, email, is_admin FROM users WHERE email = $1 LIMIT 1', [email]);
    if (!r.rows[0]) return null;
    const u = r.rows[0];
    return { id: u.id, name: u.name, email: u.email, isAdmin: u.is_admin };
  }
  const users = readFile('users.json');
  return users.find(u => u.email === email) || null;
};

const addUser = async (user) => {
  if (usingPg) {
    await pool.query('INSERT INTO users (id, name, email, is_admin) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING', [user.id, user.name, user.email, !!user.isAdmin]);
    return user;
  }
  const users = readFile('users.json');
  users.push(user);
  writeFile('users.json', users);
  return user;
};

const updateUser = async (userId, updates) => {
  if (usingPg) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const k of Object.keys(updates)) {
      fields.push(`${k} = $${idx++}`);
      values.push(updates[k]);
    }
    if (fields.length === 0) return null;
    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    const r = await pool.query('SELECT id, name, email, is_admin FROM users WHERE id = $1 LIMIT 1', [userId]);
    if (!r.rows[0]) return null;
    const u = r.rows[0];
    return { id: u.id, name: u.name, email: u.email, isAdmin: u.is_admin };
  }
  const users = readFile('users.json');
  const i = users.findIndex(u => u.id === userId);
  if (i === -1) return null;
  users[i] = { ...users[i], ...updates };
  writeFile('users.json', users);
  return users[i];
};

const setUserStatus = async (userId, fields) => {
  // fields may contain isAdmin or other flags
  return updateUser(userId, { isAdmin: fields.isAdmin === undefined ? undefined : !!fields.isAdmin, ...fields });
};

const getHistory = async (userId) => {
  if (usingPg) {
    const r = await pool.query('SELECT id, user_id, data, timestamp FROM history WHERE user_id = $1 ORDER BY timestamp DESC', [userId]);
    return r.rows.map(row => ({ id: row.id, userId: row.user_id, ...row.data, timestamp: row.timestamp }));
  }
  const history = readFile('history.json');
  return history.filter(h => h.userId === userId);
};

const addHistory = async (entry) => {
  if (usingPg) {
    await pool.query('INSERT INTO history (id, user_id, data, timestamp) VALUES ($1,$2,$3,$4)', [entry.id, entry.userId, entry, entry.timestamp]);
    return entry;
  }
  const history = readFile('history.json');
  history.push(entry);
  writeFile('history.json', history);
  return entry;
};

const getSettings = async () => {
  if (usingPg) {
    const r = await pool.query('SELECT data FROM settings ORDER BY id LIMIT 1');
    return r.rows[0] ? r.rows[0].data : { activeModel: 'gemini-3-pro-preview' };
  }
  return readFile('settings.json');
};

const setSettings = async (settings) => {
  if (usingPg) {
    await pool.query('UPDATE settings SET data = $1', [settings]);
    return { success: true };
  }
  writeFile('settings.json', settings);
  return { success: true };
};

module.exports = { getUsers, findUserByEmail, addUser, getHistory, addHistory, getSettings, setSettings };
