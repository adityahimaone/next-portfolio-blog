#!/bin/bash
# Portfolio Service Restart Script
# Dipanggil oleh Uptime Kuma webhook atau manual saat perlu restart services

set -e

LOG_FILE="$HOME/restart-services.log"

# ── Log Rotation ───────────────────────────────────────────────────────────
rotate_logs() {
    local logfile="$1"
    local max_size=$((1024 * 1024))  # 1 MB
    local max_rotates=5

    [[ -f "$logfile" ]] || return 0

    local size=$(stat -c%s "$logfile" 2>/dev/null || echo 0)
    [[ $size -lt $max_size ]] && return 0

    for ((i = max_rotates; i >= 1; i--)); do
        local next=$((i + 1))
        if [[ -f "${logfile}.${i}" ]]; then
            [[ $i -eq $max_rotates ]] && rm -f "${logfile}.${i}" || mv -f "${logfile}.${i}" "${logfile}.${next}"
        fi
    done

    [[ -f "$logfile" ]] && mv -f "$logfile" "${logfile}.1"
}

rotate_logs "$LOG_FILE" || true
# ────────────────────────────────────────────────────────────────────────────
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
