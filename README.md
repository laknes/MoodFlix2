# 🎬 Moodflix - AI Movie Intelligence

Moodflix is a high-performance, AI-driven cinematic analysis platform.

---

## 🚨 Fixing 502 Bad Gateway (Priority)

If you are seeing a 502 error, follow these steps:

1. **Verify PM2 is running**: `pm2 status`. The app status should be `online`.
2. **Check App Logs**: `pm2 logs`. Look for "EADDRINUSE" or "Permission Denied".
3. **Verify Port Matching**:
   - Check Nginx: `cat /etc/nginx/sites-enabled/YOUR_DOMAIN`
   - Check PM2: `pm2 env YOUR_DOMAIN | grep PORT`
   - These **must** match.
4. **Firewall**: Ensure your server allows internal traffic on the chosen port:
   - `sudo ufw allow 3000/tcp` (if using port 3000)

---

## 🛠 Installation with `server.js`

To prevent 502 errors, we use a lightweight `server.js` (Node.js) instead of relying on `npm start` which might behave differently in production.

### Step 1: Prepare Files
Ensure `server.js`, `index.html`, and `index.tsx` are in the same root directory.

### Step 2: Run Fixer Script
```bash
chmod +x install.sh
sudo ./install.sh
```
Select **Option 1**. The script will automatically kill conflicting processes and restart Nginx.

---

## 👤 Admin Access
- **Email**: `admin@moodflix.com`
- **Password**: Any (during initial signup)
- **Features**: Syncing, System Logs, and User Management.

---
© 2024 Moodflix AI - Global Emotional Cinema Platform
