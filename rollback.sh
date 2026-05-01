#!/bin/bash
# Portfolio Rollback Script
# Manually rollback to last known good commit

APP_DIR="/home/adityahimaone/apps/next-portfolio-blog"
ROLLBACK_DIR="$HOME/portfolio-rollback"
LOG_FILE="$HOME/portfolio-rollback.log"

echo "=== Rollback started at $(date) ===" | tee -a "$LOG_FILE"

cd "$APP_DIR"

# Check if rollback commit exists
if [[ ! -f "$ROLLBACK_DIR/last_known_good.commit" ]]; then
    echo "❌ No rollback commit found at $ROLLBACK_DIR/last_known_good.commit"
    exit 1
fi

ROLLBACK_COMMIT=$(cat "$ROLLBACK_DIR/last_known_good.commit")
CURRENT_COMMIT=$(git rev-parse HEAD)

echo "Current commit: $CURRENT_COMMIT" | tee -a "$LOG_FILE"
echo "Rolling back to: $ROLLBACK_COMMIT" | tee -a "$LOG_FILE"

if [[ "$CURRENT_COMMIT" == "$ROLLBACK_COMMIT" ]]; then
    echo "Already at rollback commit. Nothing to do." | tee -a "$LOG_FILE"
    exit 0
fi

# Rollback
git reset --hard "$ROLLBACK_COMMIT"
npm ci
npm run build

# Restart PM2
pm2 reload portfolio-blog

sleep 3
if curl -sf http://127.0.0.1:3000 > /dev/null; then
    echo "✓ Rollback successful - Portfolio is responding" | tee -a "$LOG_FILE"
    echo "=== Rollback completed at $(date) ===" | tee -a "$LOG_FILE"
    exit 0
else
    echo "❌ Rollback failed - Portfolio not responding" | tee -a "$LOG_FILE"
    exit 1
fi
