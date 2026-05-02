---
title: "Deploying My Portfolio Website: From Zero to Production with VPS, Staging, and GitHub Actions"
description: "A complete guide to deploying a Next.js portfolio website on a VPS (Tencent Cloud Lighthouse) with staging environment, PM2, Nginx, SSL, and automated CI/CD via GitHub Actions."
published: "2026-05-02"
tags: ["deployment", "nextjs", "vps", "devops", "portfolio", "github-actions", "staging"]
## Intro

Gw Adit, frontend dev yang stack utama Next.js + Tailwind + shadcn/ui. Tahun lalu gw bikin portfolio pake Next.js App Router, DAW-inspired design (timeline, tracks, clips), sama feature-based folder structure. Tapi selama ini portfolio cuma live di **Vercel**. Gak ada control penuh ke infrastructure.

Jadi gw mutusin: **Deploy ke VPS sendiri**. Gw pake **Tencent Cloud Lighthouse** karena low-cost, performa solid buat workload kecil. Setup **staging environment** (staging subdomain), otomasi **CI/CD** via GitHub Actions, plus **monitoring** (Prometheus + Grafana + Uptime Kuma) sama **Telegram notifications** buat health checks sama deploy alerts.

Artikel ini dokumen lengkapnya, dari nol (beli VPS) sampai production live, sama staging pipeline yang reliable. Jadi kalo lo juga mau deploy portfolio ke VPS, bisa follow step-by-step ini.

---

## 📦 Tech Stack & Prerequisites

**Core:**
- Frontend: Next.js 15 (App Router), React, Tailwind CSS, shadcn/ui
- Backend/Server: Node.js 22 LTS, PM2 buat process management, Nginx sebagai reverse proxy
- Infrastructure: Tencent Cloud Lighthouse (Ubuntu 24.04 LTS) dengan Cloudflare DNS
- CI/CD: GitHub Actions pake appleboy/ssh-action sama telegram-action
- Monitoring: Prometheus + Node Exporter + Nginx Exporter + Alertmanager (ngirim alert ke Telegram), plus Uptime Kuma buat monitor uptime sama bisa trigger service restart

**Domain & SSL:**
- Domain pake Cloudflare, contoh: `YOUR_DOMAIN.com`
- Production: `YOUR_DOMAIN.com` → port 3000 (Next.js)
- Staging: `staging.YOUR_DOMAIN.com` → port 3002 (Next.js dev mode)
- SSL: Let's Encrypt pake DNS-01 challenge (Cloudflare plugin) karena HTTP-01 gabisa karena Basic Auth di nginx

**Notifications:**
- Telegram bot (`@YOUR_BOT_USERNAME`) ke chat_id `YOUR_CHAT_ID`
- Notif untuk deploy success/failure, health checks, sama rollback alerts

---

## ☁️ 1. Tencent Cloud Lighthouse Setup

**Why Lighthouse?** Lighthouse pilihannya karena harganya murah, cuma ~$2-3/month buat 2 vCPU, 2 GB RAM, plus 40 GB SSD. Performanya solid untuk workload kecil kayak portfolio. Lokasi Singapore, latency ke Jakarta oke. Include bandwidth 500GB per bulan, more than enough.

### Step 1: Buy Lighthouse Instance
1. Login ke Tencent Cloud Console → Cloud Virtual Machine (CVM) → Lighthouse
2. Create instance:
   - **OS:** Ubuntu 24.04 LTS
   - **Region:** Singapore
   - **Instance type:** Lighthouse (2 vCPU, 2 GB RAM, 40 GB SSD)
   - **System disk:** 40 GB SSD (included)
   - **Network:** Assign public IP, enable port 22 (SSH), 80/443 (HTTP/HTTPS), plus monitoring ports (9090, 4000, 8384, 9113, 9652)
   - **Security group:** Allow inbound 22 (SSH), 80 (HTTP), 443 (HTTPS), and monitoring ports
3. Create → generate SSH key or password (disarankan SSH key)

### Step 2: SSH Setup & Initial Security
```bash
# Connect via SSH (ganti IP)
ssh root@YOUR_VPS_IP

# Buat user non-root (disarankan untuk production)
adduser YOUR_USERNAME
usermod -aG sudo YOUR_USERNAME
```

**Security tweaks:**
- Change SSH port (optional, 22 → custom port misal 2222)
- Disable password auth, pake SSH key only
- Install `ufw` atau `fail2ban` (opsional)

---

## 🐧 2. VPS Provisioning: System Packages & Tools

Login sebagai user `YOUR_USERNAME`, install dependencies:

```bash
# Update & upgrade
sudo apt update && sudo apt upgrade -y

# Node.js 22 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 (process manager)
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# Certbot untuk SSL (Cloudflare DNS-01 challenge nanti)
sudo apt install -y certbot python3-certbot-dns-cloudflare

# Monitoring tools
sudo apt install -y wget curl git docker.io docker-compose

# Uptime Kuma (via npm for simplicity, atau docker)
sudo npm install -g wtfismyip
```

Buat folder structure untuk apps:
```bash
mkdir -p ~/apps
mkdir -p ~/apps/next-portfolio-blog      # production
mkdir -p ~/apps/next-portfolio-blog-dev  # staging
mkdir -p ~/dashboard/monitoring          # Prometheus, Grafana, exporters, Uptime Kuma
```

---

## 🔧 3. Next.js App: Build & Run Configuration

**Project setup (local/dev):**
```bash
cd ~/projects/next-portfolio-blog
npm ci
npm run build  # build production
npm run dev    # dev build untuk staging
```

**PM2 config:** File `ecosystem.config.js` di root project:

```javascript
module.exports = {
  apps: [
    {
      name: "portfolio-blog",           // production
      cwd: "/home/YOUR_USERNAME/apps/next-portfolio-blog",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    },
    {
      name: "portfolio-blog-dev",       // staging
      cwd: "/home/YOUR_USERNAME/apps/next-portfolio-blog-dev",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
        PORT: 3002
      }
    }
  ]
};
```

Start both:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # generate startup script (rerun after reboot)
```

---

## 🌐 4. Nginx Reverse Proxy + SSL

**Why Nginx?**  
- Port 80/443 → single entry point (better security + SSL termination)
- Rate limiting, security headers, gzip compression
- Multiple apps via subpath/subdomain (nanti bisa scale)

**Nginx config untuk production (`/etc/nginx/sites-available/portfolio.conf`):**

```nginx
upstream portfolio_prod {
    server 127.0.0.1:3000;
}

upstream portfolio_dev {
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        proxy_pass http://portfolio_prod;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uptime Kuma dashboard (optional, behind auth if needed)
    # Uncomment if Uptime Kuma running on port 3001
    # location /uptime/ {
    #     proxy_pass http://127.0.0.1:3001;
    #     proxy_set_header Host $host;
    #     proxy_set_header X-Real-IP $remote_addr;
    # }
}

server {
    listen 80;
    server_name staging.YOUR_DOMAIN.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.YOUR_DOMAIN.com;

    # SSL cert untuk staging (subdomain)
    ssl_certificate /etc/letsencrypt/live/staging.YOUR_DOMAIN.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.YOUR_DOMAIN.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Staging: NO security headers (so devtools ga kena CSP)
    location / {
        proxy_pass http://portfolio_dev;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable & test:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🪪 5. SSL Certificate with Certbot (DNS-01 Challenge)

Karena production domain pake **Cloudflare**, dan nginx sudah pake Basic Auth (monitoring subdomains), HTTP-01 challenge gagal. Solusi: pake **DNS-01 challenge** via Cloudflare API.

**Setup Cloudflare API token:**
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → Edit zone DNS → Zone: `YOUR_DOMAIN.com`
3. Copy token

**Issue cert untuk production:**
```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d YOUR_DOMAIN.com \
  -d www.YOUR_DOMAIN.com \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

`~/.secrets/cloudflare.ini`:
```
dns_cloudflare_email = your-email@example.com
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
```

**Issue cert untuk staging (`staging` subdomain):**
```bash
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/cloudflare.ini \
  -d staging.YOUR_DOMAIN.com \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

Auto-renew (crontab):
```bash
sudo crontab -e
# Monthly renew
0 3 1 * * certbot renew --quiet && systemctl reload nginx
```

---

## 🚀 6. GitHub Actions CI/CD Pipeline

### Workflow Production (`deploy.yml`)

Path: `.github/workflows/deploy.yml`

```yaml
name: Deploy Portfolio

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            /home/YOUR_USERNAME/apps/next-portfolio-blog/deploy.sh "${{ secrets.TELEGRAM_BOT_TOKEN }}" "${{ secrets.TELEGRAM_CHAT_ID }}"

  notify-failure:
    runs-on: ubuntu-latest
    needs: deploy
    if: failure()
    steps:
      - name: Notify Telegram on Failure
        uses: appleboy/telegram-action@v1.0.0
        with:
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          message: |
            🚨 *Portfolio Deploy FAILED*
            Branch: `main`
            Commit: \`${{ github.sha }}\`
            Repository: ${{ github.repository }}
            Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Workflow Staging (`deploy-dev.yml`)

```yaml
name: Deploy Portfolio Dev

on:
  push:
    branches: [dev]

jobs:
  deploy-dev:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          ref: dev

      - name: Deploy to VPS (staging) via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          script: |
            /home/YOUR_USERNAME/apps/next-portfolio-blog-dev/deploy.sh "${{ secrets.TELEGRAM_BOT_TOKEN }}" "${{ secrets.TELEGRAM_CHAT_ID }}"

  notify-failure:
    runs-on: ubuntu-latest
    needs: deploy-dev
    if: failure()
    steps:
      - name: Notify Telegram on Failure (Dev)
        uses: appleboy/telegram-action@v1.0.0
        with:
          token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
          message: |
            🚨 *Dev Deploy FAILED*
            Branch: `dev`
            Commit: \`${{ github.sha }}\`
            Repository: ${{ github.repository }}
            Check logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

**GitHub Secrets:**
- `VPS_HOST`: `YOUR_VPS_IP`
- `VPS_USER`: `YOUR_USERNAME`
- `VPS_SSH_KEY`: Private SSH key (RSA 4096) untuk akses VPS
- `TELEGRAM_BOT_TOKEN`: Token bot Telegram
- `TELEGRAM_CHAT_ID`: `YOUR_CHAT_ID`

---

## 📜 7. Deploy Script: Production & Staging

### Production Deploy Script (`/home/YOUR_USERNAME/apps/next-portfolio-blog/deploy.sh`)

```bash
#!/bin/bash
set -e

APP_DIR="/home/YOUR_USERNAME/apps/next-portfolio-blog"
LOG_FILE="$HOME/portfolio-deploy.log"
ROLLBACK_DIR="$HOME/portfolio-rollback"
TELEGRAM_BOT_TOKEN="$1"
TELEGRAM_CHAT_ID="$2"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_telegram() {
    local message="$1"
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${message}" \
            -d "parse_mode=Markdown" > /dev/null 2>&1 || true
    fi
}

log "=== Deploy started ==="

cd "$APP_DIR"

# Pre-deploy checks
DISK_FREE=$(df -h "$APP_DIR" | awk 'NR==2 {print $5}' | tr -d '%')
if [[ "$DISK_FREE" -gt 90 ]]; then
    log "⚠️  Low disk space (${DISK_FREE}% used)"
    send_telegram "🚨 *Deploy Blocked*\nDisk space critical: ${DISK_FREE}% used"
    exit 1
fi

if ! pm2 list | grep -q portfolio-blog; then
    log "❌ PM2 process 'portfolio-blog' not found!"
    send_telegram "🚨 *Deploy Failed*\nPM2 process 'portfolio-blog' not found"
    exit 1
fi

CURRENT_COMMIT=$(git rev-parse HEAD)
log "Current commit: $CURRENT_COMMIT"
mkdir -p "$ROLLBACK_DIR"
echo "$CURRENT_COMMIT" > "$ROLLBACK_DIR/last_known_good.commit"

log "Pulling main branch..."
git pull origin main
NEW_COMMIT=$(git rev-parse HEAD)
log "New commit: $NEW_COMMIT"

if [[ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]]; then
    log "No changes detected"
    send_telegram "✅ *Deploy*\nNo new changes\nCommit: \`$NEW_COMMIT\`"
    exit 0
fi

log "Installing dependencies..."
npm ci --omit=dev --ignore-scripts

log "Building..."
if ! npm run build; then
    log "❌ Build failed! Rolling back..."
    send_telegram "🚨 *Deploy Failed - Build*\nCommit: \`$NEW_COMMIT\`\nRolling back to \`$CURRENT_COMMIT\`"
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog
    send_telegram "✅ *Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

sleep 2
log "Reloading PM2 (portfolio-blog)..."
pm2 reload portfolio-blog

sleep 3
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
if [[ "$HTTP_CODE" =~ ^2 ]]; then
    log "✅ Deploy SUCCESS (HTTP $HTTP_CODE)"
    send_telegram "✅ *Deploy Success*\nCommit: \`$NEW_COMMIT\`\nHTTP: $HTTP_CODE\nURL: https://YOUR_DOMAIN.com"
else
    log "❌ Deploy FAILED (HTTP $HTTP_CODE)"
    send_telegram "🚨 *Deploy Failed - Health*\nCommit: \`$NEW_COMMIT\`\nHTTP: $HTTP_CODE\nRolling back..."
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog
    send_telegram "✅ *Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

log "=== Deploy completed ==="
```

### Staging Deploy Script (`/home/YOUR_USERNAME/apps/next-portfolio-blog-dev/deploy.sh`)

```bash
#!/bin/bash
set -e

APP_DIR="/home/YOUR_USERNAME/apps/next-portfolio-blog-dev"
LOG_FILE="$HOME/portfolio-deploy-dev.log"
ROLLBACK_DIR="$HOME/portfolio-rollback-dev"
TELEGRAM_BOT_TOKEN="$1"
TELEGRAM_CHAT_ID="$2"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

send_telegram() {
    local message="$1"
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${message}" \
            -d "parse_mode=Markdown" > /dev/null 2>&1 || true
    fi
}

log "=== Deploy (dev) started ==="

cd "$APP_DIR"

# Pre-deploy checks
DISK_FREE=$(df -h "$APP_DIR" | awk 'NR==2 {print $5}' | tr -d '%')
if [[ "$DISK_FREE" -gt 90 ]]; then
    log "⚠️  Low disk space (${DISK_FREE}% used)"
    send_telegram "🚨 *Dev Deploy Blocked*\nDisk space critical: ${DISK_FREE}% used"
    exit 1
fi

if ! pm2 list | grep -q portfolio-blog-dev; then
    log "❌ PM2 process 'portfolio-blog-dev' not found!"
    send_telegram "🚨 *Dev Deploy Failed*\nPM2 process 'portfolio-blog-dev' not found"
    exit 1
fi

CURRENT_COMMIT=$(git rev-parse HEAD)
log "Current commit: $CURRENT_COMMIT"
mkdir -p "$ROLLBACK_DIR"
echo "$CURRENT_COMMIT" > "$ROLLBACK_DIR/last_known_good.commit"

log "Pulling dev branch..."
git pull origin dev
NEW_COMMIT=$(git rev-parse HEAD)
log "New commit: $NEW_COMMIT"

if [[ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]]; then
    log "No changes detected"
    send_telegram "✅ *Dev Deploy*\nNo new changes\nCommit: \`$NEW_COMMIT\`"
    exit 0
fi

log "Installing dependencies..."
npm ci

log "Building..."
if ! npm run build; then
    log "❌ Build failed! Rolling back..."
    send_telegram "🚨 *Dev Deploy Failed - Build*\nCommit: \`$NEW_COMMIT\`\nRolling back to \`$CURRENT_COMMIT\`"
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog-dev
    send_telegram "✅ *Dev Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

sleep 2
log "Reloading PM2 (portfolio-blog-dev)..."
pm2 reload portfolio-blog-dev

sleep 3
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3002)
if [[ "$HTTP_CODE" =~ ^2 ]]; then
    log "✅ Dev deploy SUCCESS (HTTP $HTTP_CODE)"
    send_telegram "✅ *Dev Deploy Success*\nCommit: \`$NEW_COMMIT\`\nHTTP: $HTTP_CODE\nURL: https://staging.YOUR_DOMAIN.com"
else
    log "❌ Dev deploy FAILED (HTTP $HTTP_CODE)")
    send_telegram "🚨 *Dev Deploy Failed - Health*\nCommit: \`$NEW_COMMIT\`\nHTTP: $HTTP_CODE\nRolling back..."
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog-dev
    send_telegram "✅ *Dev Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

log "=== Dev deploy completed ==="
```

**Key differences prod vs staging:**
- Prod: `npm ci --omit=dev --ignore-scripts` (faster, no dev deps)
- Staging: `npm ci` (full dev deps for hot reload, dev mode)
- Prod: Next.js start (static build) vs Staging: `npm run dev` (dev server)
- Port: 3000 (prod) vs 3002 (staging)
- PM2 process name: `portfolio-blog` vs `portfolio-blog-dev`

---

## 📊 8. Monitoring Stack (Prometheus + Grafana + Uptime Kuma)

**Architecture:**
```
VPS (YOUR_VPS_IP)
├── Prometheus (9090)        → scrapes metrics
├── Alertmanager (9093)      → alerts → Telegram
├── Grafana (4000, /grafana/) → dashboards (Basic Auth)
├── Node Exporter (9100)     → system metrics
├── Nginx Exporter (9113)    → nginx metrics
├── PM2 Exporter (9652)      → app process metrics
└── Uptime Kuma (3001)       → uptime monitoring, service restart capabilities
```

**Deploy monitoring?** Bisa pake docker-compose atau manual services. Prometheus juga bisa jalan sebagai systemd service atau via PM2.

**Uptime Kuma Setup:** Tool ini penting buat monitor uptime sama bisa trigger restart service otomatis. Cara setup:
- Install via npm: `npm install -g uptime-kuma` (atau pake Docker: `docker run -d --restart=always -p 3001:3001 -v /path/to/data:/app/data louislam/uptime-kuma`)
- Akses: `http://YOUR_VPS_IP:3001`
- Tambah monitors:
  - HTTP(s) ke `https://YOUR_DOMAIN.com` (production)
  - HTTP(s) ke `https://staging.YOUR_DOMAIN.com` (staging)
  - TCP ke `YOUR_VPS_IP:3000` (Next.js prod)
  - TCP ke `YOUR_VPS_IP:3002` (Next.js dev)
  - Ping ke `YOUR_VPS_IP`
- **Service restart:** Uptime Kuma bisa setup webhook → GitHub Actions atau custom script yang otomatis restart PM2 services kalo downtime terdeteksi.
- **Status page:** Bisa enable public status page di Uptime Kuma kalo perlu share uptime ke client.

**Prometheus config snippet (`/home/YOUR_USERNAME/dashboard/monitoring/prometheus.yml`):**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'nginx'
    static_configs:
      - targets: ['localhost:9113']

  - job_name: 'pm2'
    static_configs:
      - targets: ['localhost:9652']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

**Grafana access:** `http://YOUR_VPS_IP:4000` (Basic Auth: `YOUR_GRAFANA_USER` (default: admin))

**Alertmanager rules → Telegram** jika:
- CPU > 85% for 5m
- Memory < 10% free
- HTTP 5xx from nginx exporter
- PM2 process down

(Rinci setup monitoring ini di dokumentasi terpisah, tapi intinya semua metrics dikumpul dan visualisasi di Grafana, plus uptime tracking via Uptime Kuma.)

---

## 🔄 9. Rollback & Recovery Strategy

**Git-based rollback (built into deploy script):**
- Setiap deploy: simpan commit hash ke `$ROLLBACK_DIR/last_known_good.commit`
- Kalau build/health check gagal → `git reset --hard $CURRENT_COMMIT` + rebuild + reload PM2
- Rollback juga terkirim Telegram notification

**Manual rollback script (`rollback.sh` untuk production, `rollback-dev.sh` untuk staging):**

```bash
#!/bin/bash
APP_DIR="/home/YOUR_USERNAME/apps/next-portfolio-blog"
ROLLBACK_DIR="$HOME/portfolio-rollback"

if [[ ! -f "$ROLLBACK_DIR/last_known_good.commit" ]]; then
    echo "❌ No rollback point found!"
    exit 1
fi

ROLLBACK_COMMIT=$(cat "$ROLLBACK_DIR/last_known_good.commit")
echo "🔄 Rolling back to commit: $ROLLBACK_COMMIT"

cd "$APP_DIR"
git reset --hard "$ROLLBACK_COMMIT"
npm ci
npm run build
pm2 reload portfolio-blog

echo "✅ Rollback complete"
```

**Database/backup?** Portfolio ini statis (Markdown content, no DB). Tapi kalo ada data (misal transactions ledger via Zenstack), setup backup routine (cron + remote storage).

---

## 🏗️ 10. Directory Structure on VPS

```
/home/YOUR_USERNAME/
├── apps/
│   ├── next-portfolio-blog/          # production (branch: main)
│   │   ├── .git/
│   │   ├── .next/                    # build output
│   │   ├── node_modules/
│   │   ├── ecosystem.config.js       # PM2 config
│   │   └── deploy.sh                 # production deploy script
│   │
│   └── next-portfolio-blog-dev/       # staging (branch: dev)
│       ├── .git/
│       ├── .next/
│       ├── node_modules/
│       ├── ecosystem.config.js
│       └── deploy.sh                 # staging deploy script
│
├── dashboard/
│   └── monitoring/                    # Prometheus, Grafana, exporters configs
│
├── portfolio-deploy.log               # centralized deploy logs
├── portfolio-rollback/                 # last commit hash (prod)
└── portfolio-rollback-dev/             # last commit hash (staging)
```

---

## 📝 11. Feature-Based Folder Structure (Codebase Convention)

Untuk maintainability, repo pake **feature-based structure** (bukan page-based):

```
/src
├── features/
│   ├── landing-page/                  # homepage route (/)
│   │   ├── sections/                  # ALL landing page sections grouped
│   │   │   ├── hero/
│   │   │   ├── about/
│   │   │   ├── work/
│   │   │   ├── contact/
│   │   │   └── index.ts               # export all sections
│   │   ├── page.tsx                   # landing page composable
│   │   └── layout.tsx
│   │
│   ├── blog/                          # /blog route
│   │   ├── page.tsx
│   │   └── components/
│   │
│   └── projects/                      # /projects/[slug] route
│       ├── page.tsx
│       └── ProjectDetail/
│
├── components/
│   ├── ui/                            # shadcn/ui components (reusable)
│   ├── layout/                        # Navbar, Footer, etc.
│   └── theme/                         # ThemeProvider, DarkMode
│
├── lib/                               # utilities (only if shared by 2+ features)
│   ├── utils.ts
│   └── constants.ts
│
├── content/                           # Markdown content (blog posts, projects)
├── public/                            # static assets
└── styles/                            # global CSS
```

**Rule of thumb:**
- Each feature = route/page group
- `sections/` only exist di feature yang punya many sections (like landing-page)
- `_shared/` untuk utils yang dipakai >2 feature (bukan di `lib/`)
- Data local ke feature, jangan global state kecuali truly shared

---

## ✅ 12. Checklist & Verification

Before claiming "deploy done", verify:

- [ ] VPS processos PM2 running (`pm2 list`, both portfolio-blog & portfolio-blog-dev)
- [ ] Nginx config valid (`sudo nginx -t`)
- [ ] SSL certs active (`sudo certbot certificates`)
- [ ] Domain DNS mengarah ke VPS IP (Cloudflare A record)
- [ ] HTTP health check: `curl -I https://YOUR_DOMAIN.com` → 200 OK
- [ ] Staging health: `curl -I https://staging.YOUR_DOMAIN.com` → 200 OK
- [ ] PM2 resurrect on boot: `pm2 startup` + `pm2 save`
- [ ] GitHub Actions triggers successfully (check Actions tab)
- [ ] Telegram notifications terkirim (sukses/gagal)
- [ ] Monitoring accessible (Grafana: 4000, Prometheus: 9090)
- [ ] Rollback script tested manually (fasilitas recovery)

---

## 🎯 Conclusion

Dengan setup ini, portfolio **auto-deploy** setiap push ke:
- `main` → production (`YOUR_DOMAIN.com`)
- `dev` → staging (`staging.YOUR_DOMAIN.com`)

**Kenapa setup ini worth it?**

- **Isolation:** Staging terpisah dari production. Break things tanpa takut bikin production down.
- **Speed:** Staging jalan di dev mode (`npm run dev`), gak perlu build step, hot reload langsung.
- **Safety:** Auto rollback kalo build atau health check gagal, plus Telegram alerts.
- **Observability:** Prometheus + Grafana dashboards lengkap, ditambah Uptime Kuma buat tracking uptime.
- **Cost-effective:** Cuma perlu satu Lighthouse VPS, ~$2-3/bulan.
- **Full control:** Bisa custom apapun, dari security headers sampe performance tuning.

**Next improvements yang bisa ditambahkan:**
- Blue-green deployment (dual directories, swap symlink). Zero downtime
- Preview deployments per PR (temporary subdomain `pr-123.staging.YOUR_DOMAIN.com`)
- Cache optimization (nginx caching, Next.js Image Optimization pake Cloudinary)
- CDN integration (Cloudflare Pages untuk static assets)

---

## 📚 Resources & References

- [Tencent Cloud CVM Documentation](https://cloud.tencent.com/document/product/213)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Certbot DNS-01 with Cloudflare](https://certbot.eff.org/docs/using.html#dns-plugins)
- [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- [Prometheus + Grafana Stack](https://prometheus.io/docs/introduction/overview/)

---

*Written by Adit — Frontend Developer, Jakarta Selatan.  
Portfolio: https://YOUR_DOMAIN.com | GitHub: @YOUR_GITHUB_USERNAME*  
