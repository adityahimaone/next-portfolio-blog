#!/bin/bash
# Portfolio Service Restart Script
# Dipanggil oleh Uptime Kuma webhook atau manual saat perlu restart services

set -e

LOG_FILE="$HOME/restart-services.log"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Service restart triggered ==="

# Check PM2 is installed
if ! command -v pm2 &> /dev/null; then
    log "❌ PM2 not found!"
    exit 1
fi

# Restart production
if pm2 list | grep -q portfolio-blog; then
    log "Restarting portfolio-blog (production)..."
    pm2 restart portfolio-blog
    sleep 2
    HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
    if [[ "$HTTP_CODE" =~ ^2 ]]; then
        log "✅ portfolio-blog is up (HTTP $HTTP_CODE)"
    else
        log "❌ portfolio-blog returned HTTP $HTTP_CODE"
    fi
else
    log "⚠️  portfolio-blog process not found in PM2"
fi

# Restart staging
if pm2 list | grep -q portfolio-blog-dev; then
    log "Restarting portfolio-blog-dev (staging)..."
    pm2 restart portfolio-blog-dev
    sleep 2
    HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3002)
    if [[ "$HTTP_CODE" =~ ^2 ]]; then
        log "✅ portfolio-blog-dev is up (HTTP $HTTP_CODE)"
    else
        log "❌ portfolio-blog-dev returned HTTP $HTTP_CODE"
    fi
else
    log "⚠️  portfolio-blog-dev process not found in PM2"
fi

log "=== Service restart completed ==="
