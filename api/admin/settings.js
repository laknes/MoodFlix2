const db = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end(JSON.stringify({}));

  try {
    if (req.method === 'GET') {
      const settings = await db.getSettings();
      return res.end(JSON.stringify(settings));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', async () => {
        await db.setSettings(JSON.parse(body));
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
