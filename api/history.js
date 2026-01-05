const { readDB, writeDB } = require('./_db');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end(JSON.stringify({}));

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET') {
      const uid = url.searchParams.get('userId');
      const history = readDB('history.json');
      return res.end(JSON.stringify(history.filter(h => h.userId === uid)));
    }

    if (req.method === 'POST') {
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

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: e.message }));
  }
};
