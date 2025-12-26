
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

const calculateAge = (bday) => {
  const today = new Date();
  const birthDate = new Date(bday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

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

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (urlPath.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Register
    if (urlPath === '/api/auth/register' && req.method === 'POST') {
      try {
        const { email, password, name, birthday } = await getJSONBody(req);
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
          birthday, 
          joinedAt: new Date().toISOString(),
          favoriteGenres: [],
          preferredActors: [],
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

    // Login
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

    // User Profile Update
    if (urlPath === '/api/user/update' && req.method === 'POST') {
      try {
        const data = await getJSONBody(req);
        const users = readDB(USERS_FILE);
        const userIdx = users.findIndex(u => u.id === data.id);
        if (userIdx === -1) {
          res.writeHead(404);
          return res.end(JSON.stringify({ error: 'User not found' }));
        }
        
        users[userIdx] = { ...users[userIdx], ...data };
        writeDB(USERS_FILE, users);
        
        const { password: _, ...safeUser } = users[userIdx];
        res.writeHead(200);
        return res.end(JSON.stringify(safeUser));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: 'Failed to update user' }));
      }
    }

    // Recommendations
    if (urlPath === '/api/recommendations' && req.method === 'POST') {
      try {
        const state = await getJSONBody(req);
        
        // Admin overrides if provided from client settings
        const activeModel = state.settings?.activeModel || 'gemini-3-flash-preview';
        const apiKey = state.apiKey || process.env.API_KEY;
        const systemInstructionOverride = state.settings?.customSystemPrompt;

        const ai = new GoogleGenAI({ apiKey });
        
        const userContext = state.userContext || {};
        const age = userContext.birthday ? calculateAge(userContext.birthday) : 18;
        const favGenres = userContext.favoriteGenres?.length ? `Favorite Genres: ${userContext.favoriteGenres.join(', ')}` : '';
        const prefActors = userContext.preferredActors?.length ? `Preferred Actors: ${userContext.preferredActors.join(', ')}` : '';

        const baseSystemPrompt = systemInstructionOverride || "You are an AI cinema therapist. Provide recommendations that fit the emotional layers perfectly.";

        const prompt = `
          ${baseSystemPrompt}
          User Context:
          - Language: ${state.language === 'fa' ? 'Farsi/Persian' : 'English'}
          - Current Mood: ${state.primaryMood} (Intensity: ${state.intensity})
          - Energy State: ${state.energy}
          - Cognitive Focus: ${state.mentalState}
          - Age: ${age}
          - ${favGenres}
          - ${prefActors}

          Safety Rules: 
          - If age < 17, DO NOT suggest R-rated movies.
          - If age < 13, DO NOT suggest PG-13 or R-rated movies.

          Output Format: JSON only.
          {
            "quote": "An emotional quote for this vibe",
            "packTitle": "Title of the recommendation pack",
            "movies": [
              {
                "title": "Movie Name",
                "year": "Year",
                "genre": "Genres",
                "reason": "Why it fits in ${state.language === 'fa' ? 'Farsi' : 'English'}",
                "category": "SAFE or CHALLENGING or DEEP",
                "imdb_id": "ttXXXXXXX"
              }
            ]
          }
        `;

        const response = await ai.models.generateContent({
          model: activeModel,
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
