const db = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.end(JSON.stringify({}));

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body);
      const { id, ...updates } = payload;
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'User id is required' }));
      }
      const updated = await db.updateUser(id, updates);
      if (!updated) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'User not found' }));
      }
      res.end(JSON.stringify(updated));
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
};
