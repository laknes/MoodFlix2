const db = require('./_db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end(JSON.stringify({}));

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET') {
      const uid = url.searchParams.get('userId');
      const history = await db.getHistory(uid);
      return res.end(JSON.stringify(history));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', async () => {
        const entry = { ...JSON.parse(body), id: Date.now().toString(), userId: JSON.parse(body).userId, timestamp: new Date().toISOString() };
        await db.addHistory(entry);
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
