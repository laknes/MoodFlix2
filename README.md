# 🎬 Moodflix - AI Movie Intelligence

Moodflix is a high-end, emotional-intelligence-driven movie recommendation platform. It utilizes the **Gemini 3 Pro** engine to analyze complex "Mood Layers" (Emotion, Intensity, Energy, and Mental State) to curate the perfect cinematic experience.

---

## 🛠 1. Full Installation Guide (Server-Side)

This guide assumes you are deploying to a Linux VPS (Ubuntu/Debian).

### Prerequisites
- **Domain Name** pointed to your server IP.
- **Node.js v18+** & **NPM**.
- **Nginx** (Reverse Proxy).
- **PM2** (Process Management).

### Automated Deployment Script: `install.sh`
We provide a management utility that handles dependency installation, Nginx configuration, port conflict resolution, and PM2 process isolation.

#### How to Use:
1. **Create the file**: `nano install.sh`
2. **Paste the code below** (See Section 4).
3. **Execute**:
   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```

---

## 🗄 2. Database & Data Layer

### Static Movie Database
The core cinematic data is stored in `data/movies.ts`. To expand the database:
1. Open `data/movies.ts`.
2. Add new movie objects following the `Movie` interface.
3. The AI Scoring Engine (`services/scoringEngine.ts`) will automatically incorporate new entries into its calculations.

### User Persistence
Currently, Moodflix uses a **Decentralized Local Storage** approach for high privacy:
- **User Profiles**: Stored in the browser's `localStorage` under `moodflix_user`.
- **Viewing History**: Stored in `localStorage` under `mood_history`.
- **Production Note**: For a global database (PostgreSQL/MongoDB), you would replace the `localStorage` calls in `App.tsx` with API fetches to your backend.

---

## 🔑 3. Admin & API Configuration

### Setting Up the Admin User
Admin privileges are granted based on the email address used during sign-up.
1. **The Primary Admin**: By default, the system recognizes `admin@moodflix.com` as the Super Admin.
2. **Login/Signup**: Go to the Profile tab, click "Sign Up", and use the email `admin@moodflix.com`.
3. **Admin Panel**: Once logged in as admin, the "Admin Panel" will appear in your sidebar, allowing you to sync IMDB data and manage system status.

### Gemini API Key
The application requires a Google Gemini API Key.
- The key must be provided via the environment variable `process.env.API_KEY`.
- In production (using PM2), this is injected by the `install.sh` script into the process environment.

---

## 📜 4. Complete `install.sh` Source Code

```bash
#!/bin/bash
# MOODFLIX - ROBUST DEPLOYMENT UTILITY v2.1

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
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then return 0; else return 1; fi
}

check_nginx_conflicts() {
    local SEARCH_NAME=$1
    local CONFLICTS=$(grep -rl "server_name.*$SEARCH_NAME" /etc/nginx/sites-enabled/ || true)
    if [ ! -z "$CONFLICTS" ]; then
        echo -e "${YELLOW}[CONFLICT]${NC} '$SEARCH_NAME' is already used in: $CONFLICTS"
        read -p "Disable conflicting configs? (y/n): " DISABLE_CONF
        if [ "$DISABLE_CONF" == "y" ]; then
            for file in $CONFLICTS; do rm -f "$file"; done
        fi
    fi
}

show_menu() {
    echo -e "\n${BLUE}==========================================${NC}"
    echo -e "${YELLOW}       MOODFLIX MANAGEMENT SYSTEM        ${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "1) Full Installation"
    echo -e "2) Update Application"
    echo -e "3) SSL (Certbot) Setup"
    echo -e "4) System Status"
    echo -e "5) Exit"
    echo -n "Selection: "
}

full_install() {
    echo -e "${CYAN}Installing core dependencies...${NC}"
    apt-get update && apt-get install -y git curl nginx lsof
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    npm install -g pm2

    read -p "Enter Domain or IP: " DOMAIN
    check_nginx_conflicts "$DOMAIN"

    read -p "Enter Internal Port (default 3000): " PORT
    PORT=${PORT:-3000}
    while check_port $PORT; do
        read -p "Port $PORT in use! Enter new port: " PORT
    done

    echo -e "${CYAN}Building Moodflix...${NC}"
    npm install && npm run build

    pm2 delete "$DOMAIN" 2>/dev/null || true
    PORT=$PORT pm2 start npm --name "$DOMAIN" -- start -- -p $PORT
    pm2 save

    echo -e "${CYAN}Configuring Nginx Reverse Proxy...${NC}"
    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    cat > $NGINX_CONF <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    nginx -t && systemctl restart nginx
    echo -e "${GREEN}SUCCESS! Site live at http://$DOMAIN${NC}"
}

while true; do
    show_menu
    read choice
    case $choice in
        1) full_install ;;
        2) git pull && npm install && npm run build && pm2 restart all ;;
        3) apt install certbot python3-certbot-nginx && certbot --nginx ;;
        4) pm2 list && nginx -t && systemctl status nginx --no-pager ;;
        5) exit 0 ;;
    esac
done
```

---

## 🆘 Troubleshooting

### 502 Bad Gateway
- **Cause**: The Node.js app is not running or the port is mismatched.
- **Fix**: Run `pm2 status`. If the app is `errored`, check logs with `pm2 logs`.

### Conflicting Server Name
- **Cause**: Multiple Nginx config files use the same IP or Domain.
- **Fix**: The `install.sh` script handles this, but you can manually check with:
  `grep -r "your_ip" /etc/nginx/sites-enabled/` and remove duplicates.

---
© 2024 Moodflix AI - Emotional Intelligence Cinema
