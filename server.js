
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// --- Database Logic ---
const DB_PATH = path.join(__dirname, 'db');
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

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.tsx': 'text/javascript; charset=UTF-8', // Babel Standalone can handle this
  '.ts': 'text/javascript; charset=UTF-8',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const urlPath = url.pathname;

  // --- API Routing ---
  if (urlPath.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      if (urlPath === '/api/history' && req.method === 'GET') {
        const uid = url.searchParams.get('userId');
        const history = readDB('history.json');
        return res.end(JSON.stringify(history.filter(h => h.userId === uid)));
      }

      if (urlPath === '/api/history' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          const hist = readDB('history.json');
          hist.push({ ...JSON.parse(body), id: Date.now().toString(), timestamp: new Date().toISOString() });
          writeDB('history.json', hist);
          res.end(JSON.stringify({ success: true }));
        });
        return;
      }

      // Simple Auth
      if (urlPath === '/api/auth/login' && req.method === 'POST') {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
          const { email } = JSON.parse(body);
          const users = readDB('users.json');
          let user = users.find(u => u.email === email);
          if (!user) {
            user = { id: Date.now().toString(), name: email.split('@')[0], email, isAdmin: email.includes('admin') };
            users.push(user);
            writeDB('users.json', users);
          }
          res.end(JSON.stringify(user));
        });
        return;
      }

      if (urlPath === '/api/admin/settings') {
        if (req.method === 'GET') return res.end(JSON.stringify(readDB('settings.json')));
        if (req.method === 'POST') {
           let body = '';
           req.on('data', c => body += c);
           req.on('end', () => {
             writeDB('settings.json', JSON.parse(body));
             res.end(JSON.stringify({ success: true }));
           });
           return;
        }
      }
    } catch (e) {
      res.writeHead(500);
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // --- Static File Serving ---
  let fp = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  
  // SPA Fallback for routes that don't exist as files
  if (!fs.existsSync(fp)) {
    const ext = path.extname(urlPath);
    if (!ext || ext === '.html') {
      fp = path.join(__dirname, 'index.html');
    } else {
      res.writeHead(404);
      return res.end('Not Found');
    }
  }

  const ext = path.extname(fp).toLowerCase();
  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading asset');
    } else {
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Moodflix Sovereign Server active at http://localhost:${PORT}`);
});
