
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// --- Mock Database Simulation ---
const DB_PATH = path.join(__dirname, 'db');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);

const USERS_FILE = path.join(DB_PATH, 'users.json');
const HISTORY_FILE = path.join(DB_PATH, 'history.json');

const readDB = (file) => {
  if (!fs.existsSync(file)) return [];
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
};

const writeDB = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`),
  request: (req, res, duration) => {
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}${req.method} ${req.url} ${status}\x1b[0m - ${duration}ms`);
  }
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.tsx': 'text/javascript',
  '.ts': 'text/javascript',
};

const getJSONBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch (e) { reject(e); }
  });
});

const server = http.createServer(async (req, res) => {
  const start = Date.now();
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const urlPath = parsedUrl.pathname;

  // Set default CORS headers for development/environment flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ROUTES
  if (urlPath.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Auth: Register
    if (urlPath === '/api/auth/register' && req.method === 'POST') {
      try {
        const { email, password, name, age } = await getJSONBody(req);
        const users = readDB(USERS_FILE);
        if (users.find(u => u.email === email)) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: 'کاربری با این ایمیل قبلاً ثبت شده است.' }));
        }
        const newUser = { 
          id: Date.now().toString(), 
          email, 
          password, 
          name, 
          age: parseInt(age) || 18, 
          joinedAt: new Date().toISOString(),
          isAdmin: email === 'admin@moodflix.com'
        };
        users.push(newUser);
        writeDB(USERS_FILE, users);
        const { password: _, ...safeUser } = newUser;
        res.writeHead(201);
        return res.end(JSON.stringify(safeUser));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }

    // Auth: Login
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      try {
        const { email, password } = await getJSONBody(req);
        const users = readDB(USERS_FILE);
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
          res.writeHead(401);
          return res.end(JSON.stringify({ error: 'ایمیل یا رمز عبور اشتباه است.' }));
        }
        const { password: _, ...safeUser } = user;
        res.writeHead(200);
        return res.end(JSON.stringify(safeUser));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }

    // History: Get
    if (urlPath === '/api/history' && req.method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId');
      if (!userId) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Missing userId' }));
      }
      const history = readDB(HISTORY_FILE).filter(h => h.userId === userId);
      res.writeHead(200);
      return res.end(JSON.stringify(history));
    }

    // History: Save
    if (urlPath === '/api/history' && req.method === 'POST') {
      try {
        const entry = await getJSONBody(req);
        const history = readDB(HISTORY_FILE);
        const newEntry = { ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() };
        history.push(newEntry);
        writeDB(HISTORY_FILE, history);
        res.writeHead(201);
        return res.end(JSON.stringify(newEntry));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Failed to save history' }));
      }
    }

    // Recommendations
    if (urlPath === '/api/recommendations' && req.method === 'POST') {
      try {
        const state = await getJSONBody(req);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
          Context: Mood-based movie recommendation platform.
          User Mood: ${state.primaryMood}
          Intensity: ${state.intensity}
          Energy Level: ${state.energy}
          Focus: ${state.mentalState}
          Language: ${state.language === 'fa' ? 'Persian/Farsi' : 'English'}

          Task: Suggest 2-3 movies. 
          Return ONLY valid JSON in this format:
          {
            "quote": "A single emotional quote matching this vibe",
            "packTitle": "Creative title for this mood set",
            "movies": [
              {
                "title": "Movie Title",
                "year": "2023",
                "genre": "Drama/Sci-Fi",
                "reason": "Explain why this fits the user's mood layers in ${state.language === 'fa' ? 'Farsi' : 'English'}",
                "rating": "8.5",
                "category": "SAFE or CHALLENGING or DEEP",
                "imdb_id": "tt1234567"
              }
            ]
          }
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' }
        });

        res.writeHead(200);
        res.end(response.text);
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      }
      logger.request(req, res, Date.now() - start);
      return;
    }
  }

  // STATIC ASSETS
  let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
  
  if (!fs.existsSync(filePath)) {
    const possibleExts = ['.tsx', '.ts', '.js', '.jsx'];
    for (const ext of possibleExts) {
      if (fs.existsSync(filePath + ext)) {
        filePath += ext;
        break;
      }
    }
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA Fallback
      fs.readFile(path.join(__dirname, 'index.html'), (err2, indexData) => {
        if (err2) {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        }
      });
    } else {
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
      res.end(data);
    }
    logger.request(req, res, Date.now() - start);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Moodflix Server running at http://localhost:${PORT}`);
});
