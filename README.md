
# 🎬 Moodflix - AI Movie Intelligence

Moodflix is a premium cinematic recommendation platform that analyzes deep emotional layers using the Gemini API and persists your journey via a dedicated neural backend.

---

## 🚀 One-Click Installation & SSL Setup

This script is designed for **Ubuntu/Debian** environments. It automates the installation of Node.js (via NodeSource to avoid dependency conflicts), Nginx, Database setup, and Cloudflare Tunnel for SSL.

### 📜 `install.sh`

```bash
#!/bin/bash
# MOODFLIX ULTIMATE INSTALLER v5.0
# Supports: Node.js 20+, Nginx Reverse Proxy, Cloudflare Tunnel (SSL)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}[1/7] Updating system and installing prerequisites...${NC}"
sudo apt-get update
sudo apt-get install -y curl gnupg build-essential

echo -e "${BLUE}[2/7] Installing Node.js 20 (NodeSource)...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo -e "${BLUE}[3/7] Setting up Database...${NC}"
mkdir -p db
[ ! -f db/users.json ] && echo "[]" > db/users.json
[ ! -f db/history.json ] && echo "[]" > db/history.json
[ ! -f db/settings.json ] && echo "{\"activeModel\": \"gemini-3-pro-preview\", \"maintenanceMode\": false}" > db/settings.json
chmod -R 777 db

echo -e "${BLUE}[4/7] Installing Project Dependencies...${NC}"
npm install
sudo npm install -g pm2

echo -e "${BLUE}[5/7] Configuring Nginx Reverse Proxy...${NC}"
sudo apt-get install -y nginx
IP_ADDR=$(hostname -I | awk '{print $1}')
read -p "Enter your Domain or Public IP [default $IP_ADDR]: " DOMAIN
DOMAIN=${DOMAIN:-$IP_ADDR}

sudo tee /etc/nginx/sites-available/moodflix <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/moodflix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
echo -e "${GREEN}Nginx configured at http://$DOMAIN${NC}"

echo -e "${BLUE}[6/7] Cloudflare SSL Tunnel Setup (Optional)...${NC}"
read -p "Do you want to enable Cloudflare SSL Tunnel? (y/n): " CF_ENABLE
if [[ $CF_ENABLE == "y" ]]; then
    if ! command -v cloudflared &> /dev/null; then
        curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared.deb
        rm cloudflared.deb
    fi
    echo -e "${BLUE}Follow the browser instructions to login to Cloudflare...${NC}"
    ## ▶️ Deploy to Vercel

     - Ensure dependencies are installed locally or let Vercel install them during deploy.
     - Build command: `npm run build` (this runs `vite build`).
     - Vercel will use `vercel.json` included in the repo to serve the `dist` folder as a static SPA and map `/api/*` to serverless functions under `api/` if present.

    Quick local test:

    ```bash
    npm install
    npm run build
    npm run preview
    ```

    To deploy:

    ```bash
    # Install Vercel CLI (optional)
    npm i -g vercel
    vercel login
    vercel --prod
    ```

    Notes:
     - The original `server.js` is a long-running server and is not used on Vercel as-is. For server-side API endpoints, convert routes into `/api` serverless functions. The repo currently prepares static hosting for the Vite-built frontend.
    cloudflared tunnel login
    
    TUNNEL_NAME="moodflix-$(date +%s)"
    cloudflared tunnel create $TUNNEL_NAME
    TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
    
    # Route the tunnel to the provided domain (requires manual DNS setup in CF panel usually, or use --hostname)
    # pm2 will handle the tunnel run command
    echo -e "${GREEN}Tunnel $TUNNEL_NAME ($TUNNEL_ID) created successfully.${NC}"
fi

echo -e "${BLUE}[7/7] Starting Application...${NC}"
pm2 delete moodflix 2>/dev/null || true
pm2 start server.js --name "moodflix"

if [[ $CF_ENABLE == "y" ]]; then
    pm2 delete cf-tunnel 2>/dev/null || true
    pm2 start cloudflared --name "cf-tunnel" -- tunnel run $TUNNEL_NAME
fi

pm2 save

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}    Moodflix is now LIVE and fully configured!${NC}"
echo -e "    Local URL: http://localhost:3000"
echo -e "    Public URL: http://$DOMAIN"
echo -e "${GREEN}==================================================${NC}"
```

---

## 🏗 System Architecture
- **Frontend**: React 19 + Tailwind CSS + Babel Standalone (Client-side TSX transpilation).
- **Backend**: Node.js Native HTTP Server.
- **Database**: Atomic JSON Persistence.
- **Proxy/SSL**: Nginx + Cloudflare Zero Trust Tunnels.
