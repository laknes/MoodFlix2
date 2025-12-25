# Moodflix - AI Movie Intelligence

Moodflix is a sophisticated, mood-based movie recommendation engine that uses Gemini AI to analyze your emotional layers and provide the perfect cinematic match.

## 🚀 Quick Start (Installation)

We have provided a comprehensive shell script to handle installation, updates, and SSL configuration, optimized for multi-site servers.

### Deployment Script: `install.sh`

The `install.sh` script automates the entire process of setting up Moodflix on a Linux server using **PM2** for process management and **Nginx** for reverse proxy.

#### Features:
1.  **PM2 Integration**: Ensures the app runs in the background and restarts on failure (prevents 502 errors).
2.  **Port Conflict Detection**: Prevents 502 errors by ensuring the chosen port is free.
3.  **Multi-Site Ready**: Uses `sites-available` architecture to play nice with other domains on the same server.

### How to use:

1.  **Create the script**: Copy the code below and save it as `install.sh` in your project root.
2.  **Give it execution permissions**:
    ```bash
    chmod +x install.sh
    ```
3.  **Run the script as root**:
    ```bash
    sudo ./install.sh
    ```

---

## 🆘 Troubleshooting 502 Bad Gateway

If you are seeing a **502 Bad Gateway** after installation:

1.  **App not running**: Run `pm2 list`. If your domain status is `errored`, run `pm2 logs`.
2.  **Port mismatch**: Ensure the port in your application matches the port Nginx is trying to reach. Check `/etc/nginx/sites-available/yourdomain`.
3.  **Internal Loop**: Check if the application is bound to `127.0.0.1` or `0.0.0.0`. `127.0.0.1` is usually preferred for security when behind Nginx.
4.  **Multi-Site Port Collision**: Make sure no two sites use the same internal port (e.g., both trying to use 3000).

---

## 📄 Full Script Source Code (`install.sh`)

```bash
#!/bin/bash

# Moodflix - AI Movie Intelligence
# Robust Deployment Utility for Multi-site Servers

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Please run as root.${NC}"
  exit 1
fi

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

show_menu() {
    echo -e "\n${BLUE}==========================================${NC}"
    echo -e "${YELLOW}       MOODFLIX MANAGEMENT SYSTEM        ${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "1) Full Installation"
    echo -e "2) Update Site"
    echo -e "3) SSL Configuration"
    echo -e "4) Check Status"
    echo -e "5) Exit"
    echo -n "Select an option: "
}

full_install() {
    apt-get update && apt-get install -y git curl nginx lsof
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi

    read -p "Domain (e.g. site.com): " DOMAIN
    read -p "Port (default 3000): " PORT
    PORT=${PORT:-3000}

    while check_port $PORT; do
        echo -e "${RED}Port $PORT in use!${NC}"
        read -p "New port: " PORT
    done

    npm install && npm run build

    pm2 delete "$DOMAIN" 2>/dev/null || true
    pm2 start npm --name "$DOMAIN" -- start -- -p $PORT
    pm2 save

    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    nginx -t && systemctl restart nginx
    echo -e "${GREEN}Site live at http://$DOMAIN${NC}"
}

update_site() {
    git pull && npm install && npm run build && pm2 restart all
}

ssl_setup() {
    apt-get install -y certbot python3-certbot-nginx
    read -p "Domain: " SSL_DOMAIN
    certbot --nginx -d $SSL_DOMAIN -d www.$SSL_DOMAIN
}

while true; do
    show_menu
    read choice
    case $choice in
        1) full_install ;;
        2) update_site ;;
        3) ssl_setup ;;
        4) pm2 list && nginx -t ;;
        5) exit 0 ;;
    esac
done
```

## 🛠 Project Features

- **Primary Mood Analysis**: Layers Emotional Mood, Intensity, and Energy.
- **Gemini AI Integration**: Real-time reasoning for every recommendation.
- **Admin Dashboard**: Manage API keys, monitor system status, and sync IMDB data.
- **User Personalization**: Save favorites and set preferred actors/genres.
- **Responsive UI**: Fully optimized for mobile and desktop with a cinematic aesthetic.

---
© 2024 Moodflix AI - Emotional Intelligence Cinema
