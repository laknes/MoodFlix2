# 🎬 Moodflix - AI Movie Intelligence

Moodflix is a high-performance, AI-driven cinematic analysis platform powered by Gemini 3 Pro.

---

## 🚨 Fixing "Conflicting Server Name" & 502 Errors

If you see the warning `conflicting server name "xxx" ignored`, it means multiple Nginx files are trying to handle port 80 for the same IP. 

**This script will:**
1. **Force Port 80**: Sets this app as the `default_server`, taking priority over all other configs.
2. **Auto-Cleanup**: Automatically deletes `/etc/nginx/sites-enabled/default` and any other conflicting files.
3. **Redirect Logic**: Ensures all traffic on port 80 is correctly routed to your Node.js app.

---

## 🛠 Complete Installation Script (`install.sh`)

Copy the block below, save as `install.sh`, and run with `sudo bash install.sh`.

```bash
#!/bin/bash
# MOODFLIX DEFINITIVE INSTALLER v7.0
# Solves: Nginx Conflicts, 502 Gateway, & Port 80 Redirects

set -e
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Run as root (sudo).${NC}"
  exit 1
fi

echo -e "${BLUE}Step 1: Installing System Dependencies...${NC}"
apt-get update && apt-get install -y git curl nginx lsof psmisc
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
npm install -g pm2 || true

echo -e "\n${BLUE}--- Configuration ---${NC}"
read -p "Enter Domain or IP (e.g. 185.187.154.156): " DOMAIN
read -p "Enter App Port (e.g. 3000): " PORT
PORT=${PORT:-3000}

echo -e "${BLUE}Step 2: Aggressive Nginx Conflict Resolution...${NC}"
# 1. Disable the default Nginx 'Welcome' page
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-available/default

# 2. Search and remove ANY file containing this Domain/IP to stop the "Conflicting Name" warning
CONFLICTS=$(grep -rl "server_name.*$DOMAIN" /etc/nginx/sites-enabled/ | grep -v "$DOMAIN" || true)
if [ ! -z "$CONFLICTS" ]; then
    echo -e "${YELLOW}Removing conflicting Nginx files: $CONFLICTS${NC}"
    for f in $CONFLICTS; do rm -f "$f"; done
fi

echo -e "${BLUE}Step 3: Process Management...${NC}"
# Kill any existing process on the app port
fuser -k $PORT/tcp || true
pm2 delete "$DOMAIN" 2>/dev/null || true

# Start server.js via PM2
PORT=$PORT pm2 start server.js --name "$DOMAIN"
pm2 save

echo -e "${BLUE}Step 4: Configuring Nginx with default_server...${NC}"
CONF_PATH="/etc/nginx/sites-available/$DOMAIN"
cat > $CONF_PATH <<EOF
# Main Server Block
server {
    # 'default_server' ensures this block handles all traffic on port 80
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Stability Timeouts
        proxy_read_timeout 150;
        proxy_connect_timeout 150;
    }
}
EOF

ln -sf "$CONF_PATH" "/etc/nginx/sites-enabled/"

echo -e "${BLUE}Step 5: Applying Changes...${NC}"
# Double check Nginx syntax
nginx -t 
systemctl restart nginx

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}SUCCESS! Site live at http://$DOMAIN${NC}"
echo -e "Nginx Warning Fix: 'default_server' active."
echo -e "Port Redirect: All Port 80 traffic routed to App ($PORT)."
echo -e "${GREEN}==========================================${NC}"
```

---

## 👤 Admin Identity
- **Default Admin Email**: `admin@moodflix.com`
- **Setup**: Sign up with this email on the Profile page to unlock the Management Dashboard.

---
© 2024 Moodflix AI - Global Emotional Cinema Platform