const { readDB, writeDB } = require('../../api/_db');

module.exports = (req, res) => {
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
  req.on('end', () => {
    try {
      const { email } = JSON.parse(body);
      const users = readDB('users.json');
      let user = users.find(u => u.email === email);
      if (!user) {
        user = { id: Date.now().toString(), name: email.split('@')[0], email, isAdmin: email.includes('admin') };
        users.push(user);
        writeDB('users.json', users);
      }
      res.end(JSON.stringify(user));
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
};
