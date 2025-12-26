# 🎬 Moodflix - Full Stack AI Movie Intelligence

Moodflix is a sophisticated movie recommendation platform that utilizes the Gemini API to analyze emotional layers. It features a Node.js backend with a JSON-based database for persistence.

---

## 🚀 One-Click Deployment Script

This script automates the entire process: installing dependencies, setting up the file-based database, configuring Nginx as a reverse proxy, and launching the application with PM2.

### `setup.sh`

```bash
#!/bin/bash
# MOODFLIX FULL-STACK DEPLOYMENT SCRIPT v1.0
# Bridges Frontend & Backend + Initializes Database

set -e
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}1. System Preparation...${NC}"
sudo apt-get update && sudo apt-get install -y nginx curl lsof psmisc

# Ensure Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
sudo npm install -g pm2 || true

echo -e "${BLUE}2. Database Initialization...${NC}"
# Create database directory for persistence
mkdir -p db
touch db/users.json
touch db/history.json

# Initialize JSON files if empty
if [ ! -s db/users.json ]; then echo "[]" > db/users.json; fi
if [ ! -s db/history.json ]; then echo "[]" > db/history.json; fi
chmod -R 777 db

echo -e "${BLUE}3. Application Launch...${NC}"
# Kill existing processes on port 3000
sudo fuser -k 3000/tcp || true

# Install local dependencies
npm install

# Start the server with PM2
pm2 delete moodflix 2>/dev/null || true
pm2 start server.js --name "moodflix"
pm2 save

echo -e "${BLUE}4. Nginx Reverse Proxy Configuration...${NC}"
# Configure Nginx to route Port 80 traffic to Port 3000 (Backend API & Frontend)
sudo rm -f /etc/nginx/sites-enabled/default
CONF_PATH="/etc/nginx/sites-available/moodflix"

sudo bash -c "cat > $CONF_PATH <<EOF
server {
    listen 80;
    server_name _; # Accept all incoming traffic on Port 80

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
        
        # Security & Stability
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
EOF"

sudo ln -sf "$CONF_PATH" "/etc/nginx/sites-enabled/"
sudo nginx -t && sudo systemctl restart nginx

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}SUCCESS! Moodflix is now live on Port 80.${NC}"
echo -e "Frontend and Backend are connected via Port 3000."
echo -e "Database is initialized in: $(pwd)/db/"
echo -e "Check logs with: pm2 logs moodflix"
echo -e "${GREEN}==============================================${NC}"
```

---

## 🏗 System Architecture

- **Frontend**: React (TSX) served as static files by the Node.js server.
- **Backend**: Node.js `http` server handling API requests (`/api/auth`, `/api/history`, `/api/recommendations`).
- **Database**: Flat JSON files (`db/users.json`, `db/history.json`) handled with atomic read/write operations for high performance in small-to-medium scale environments.
- **AI Engine**: Gemini 3 Flash for fast, multi-layered emotional analysis.

## 👤 Admin Identity
- **Default Admin Email**: `admin@moodflix.com`
- **Setup**: Sign up with this specific email to automatically unlock the Admin Management Dashboard.

---
© 2025 Moodflix AI - The Cinematic Intelligence Platform