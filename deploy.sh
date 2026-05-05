#!/bin/bash
set -e

# Portfolio Auto-Deploy Script with Rollback & Notifications
# Triggered by GitHub Actions

APP_DIR="/home/adityahimaone/apps/next-portfolio-blog"
LOG_FILE="$HOME/portfolio-deploy.log"
ROLLBACK_DIR="$HOME/portfolio-rollback"
TELEGRAM_BOT_TOKEN="$1"  # passed from GitHub Actions
TELEGRAM_CHAT_ID="$2"    # passed from GitHub Actions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ── Log Rotation Setup ───────────────────────────────────────────────────
# Keep max 5 rotated logs (portfolio-deploy.log.1, .2, ...), each ~1MB max
rotate_logs() {
    local logfile="$1"
    local max_size=$((1024 * 1024))  # 1 MB
    local max_rotates=5

    if [[ ! -f "$logfile" ]]; then
        return 0
    fi

    local size=$(stat -c%s "$logfile" 2>/dev/null || echo 0)
    if [[ $size -lt $max_size ]]; then
        return 0
    fi

    # Rotate: .5 → delete, .4 → .5, .3 → .4, .2 → .3, .1 → .2, current → .1
    for ((i = max_rotates; i >= 1; i--)); do
        local next=$((i + 1))
        if [[ -f "${logfile}.${i}" ]]; then
            if [[ $i -eq $max_rotates ]]; then
                rm -f "${logfile}.${i}"
            else
                mv -f "${logfile}.${i}" "${logfile}.${next}"
            fi
        fi
    done

    if [[ -f "$logfile" ]]; then
        mv -f "$logfile" "${logfile}.1"
    fi
}

# Rotate logs before starting (best effort, don't fail if rotation error)
rotate_logs "$LOG_FILE" || true

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

send_telegram_photo() {
    local photo_url="$1"
    local caption="$2"
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "photo=${photo_url}" \
            -d "caption=${caption}" \
            -d "parse_mode=Markdown" > /dev/null 2>&1 || true
    fi
}

log "=== Deploy started ==="

cd "$APP_DIR"

# ── Pre-deploy checks ──────────────────────────────────────────────────────
log "Running pre-deploy checks..."

# Check disk space
DISK_FREE=$(df -h "$APP_DIR" | awk 'NR==2 {print $5}' | tr -d '%')
if [[ "$DISK_FREE" -gt 90 ]]; then
    log "⚠️  WARNING: Low disk space (${DISK_FREE}% used)"
    send_telegram "🚨 *Portfolio Deploy Blocked*\nDisk space critical: ${DISK_FREE}% used"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
log "Node.js version: $NODE_VERSION"

# Check PM2 status
if ! pm2 list | grep -q portfolio-blog; then
    log "❌ PM2 process 'portfolio-blog' not found!"
    send_telegram "🚨 *Deploy Failed*\nPM2 process 'portfolio-blog' not found"
    exit 1
fi

# Save current commit for rollback
CURRENT_COMMIT=$(git rev-parse HEAD)
log "Current commit: $CURRENT_COMMIT"
mkdir -p "$ROLLBACK_DIR"
echo "$CURRENT_COMMIT" > "$ROLLBACK_DIR/last_known_good.commit"

# ── Pull latest code ───────────────────────────────────────────────────────
log "Pulling latest changes..."

# Ensure we have full history (unshallow if needed)
if [ -f ".git/shallow" ]; then
    log "Repository is shallow, fetching full history..."
    git fetch --unshallow || true
fi

# Fetch only the main branch from origin (clean, no tag/other branch noise)
git fetch origin main

# Get the commit we just fetched
REMOTE_COMMIT=$(git rev-parse FETCH_HEAD)
log "Remote commit: $REMOTE_COMMIT"

# Compare with current HEAD
CURRENT_HEAD=$(git rev-parse HEAD)
log "Local commit: $CURRENT_HEAD"

# Always ensure local matches remote exactly
git reset --hard FETCH_HEAD
NEW_COMMIT=$(git rev-parse HEAD)
log "Active commit after reset: $NEW_COMMIT"

if [ "$CURRENT_HEAD" = "$REMOTE_COMMIT" ]; then
    log "No new commits, but forcing rebuild to ensure latest content (blog posts, etc.)"
else
    log "New commits detected, rebuilding..."
fi

# ── Install dependencies ────────────────────────────────────────────────────
log "Installing dependencies..."
npm ci

# ── Build ───────────────────────────────────────────────────────────────────
log "Building Next.js app..."
if ! npm run build; then
    log "❌ Build failed! Initiating rollback..."
    send_telegram "🚨 *Deploy Failed - Build Error*\nCommit: \`$NEW_COMMIT\`\nRolling back to \`$CURRENT_COMMIT\`"

    # Rollback
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog
    log "✓ Rollback completed"
    send_telegram "✅ *Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

# ── Pre-restart health check (old version) ─────────────────────────────────
log "Checking old version health before reload..."
sleep 2
if curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "^2"; then
    log "✓ Old version healthy (HTTP 2xx)"
else
    log "⚠️  Old version not responding (might be first deploy)"
fi

# ── Restart PM2 ─────────────────────────────────────────────────────────────
log "Reloading PM2 process (zero-downtime)..."
pm2 reload portfolio-blog

# ── Post-deploy health check ────────────────────────────────────────────────
sleep 3
HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" http://127.0.0.1:3000)
if [[ "$HTTP_CODE" =~ ^2 ]]; then
    log "✅ Deploy SUCCESS - Portfolio responding (HTTP $HTTP_CODE)"
    send_telegram "✅ *Portfolio Deploy Success*\nCommit: \`$NEW_COMMIT\`\nHTTP Status: $HTTP_CODE\nURL: https://adityahimaone.space"
else
    log "❌ Deploy FAILED - Portfolio NOT responding (HTTP $HTTP_CODE)"
    send_telegram "🚨 *Deploy Failed - Health Check*\nCommit: \`$NEW_COMMIT\`\nHTTP Status: $HTTP_CODE\nInitiating rollback..."

    # Rollback
    git reset --hard "$CURRENT_COMMIT"
    npm ci
    npm run build
    pm2 reload portfolio-blog
    log "✓ Rollback completed"
    send_telegram "✅ *Rollback Complete*\nRestored to \`$CURRENT_COMMIT\`"
    exit 1
fi

log "=== Deploy completed successfully ==="
