
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.ts': 'text/javascript',
  '.tsx': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let urlPath = parsedUrl.pathname;
  
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  let filePath = path.join(__dirname, urlPath);

  // Helper to serve file
  const serveFile = (targetPath) => {
    const extname = String(path.extname(targetPath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    fs.readFile(targetPath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  };

  // Logic to handle extensionless imports or missing files
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      serveFile(filePath);
    } else {
      // Try adding extensions for modules
      const extensions = ['.tsx', '.ts', '.js'];
      let found = false;
      for (const ext of extensions) {
        if (fs.existsSync(filePath + ext)) {
          serveFile(filePath + ext);
          found = true;
          break;
        }
      }

      if (!found) {
        // SPA Fallback: Serve index.html
        fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
          if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      }
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Moodflix Server is running at http://0.0.0.0:${PORT}/`);
});
