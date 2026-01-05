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
      const { email } = payload;
      if (!email) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Email is required' }));
      }
      const existing = await db.findUserByEmail(email);
      if (existing) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'User already exists' }));
      }
      const user = { id: Date.now().toString(), name: payload.name || email.split('@')[0], email, isAdmin: !!payload.isAdmin };
      await db.addUser(user);
      res.end(JSON.stringify(user));
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
};
