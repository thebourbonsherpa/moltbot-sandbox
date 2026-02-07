#!/bin/bash
# Run this on a fresh container to restore everything

set -e

echo "=== Clawdbot Workspace Restore ==="

# Install rclone if missing
if ! command -v rclone &> /dev/null; then
    echo "Installing rclone..."
    curl -s https://rclone.org/install.sh | bash
fi

# Restore rclone config from workspace (if exists) or prompt for manual setup
WORKSPACE_RCLONE="/root/clawd/config/rclone.conf"
SYSTEM_RCLONE="$HOME/.config/rclone/rclone.conf"

if [ -f "$WORKSPACE_RCLONE" ]; then
    echo "Restoring rclone config from workspace..."
    mkdir -p "$(dirname $SYSTEM_RCLONE)"
    cp "$WORKSPACE_RCLONE" "$SYSTEM_RCLONE"
else
    echo "⚠️  No rclone config in workspace. Need manual R2 credentials."
    exit 1
fi

# Test R2 connection
echo "Testing R2 connection..."
if rclone ls r2:clawdbot-backups/ --max-depth 1 &>/dev/null; then
    echo "✅ R2 connection works"
else
    echo "❌ R2 connection failed"
    exit 1
fi

# Restore workspace from R2
echo "Restoring workspace from R2..."
cd /root/clawd
rclone copy r2:clawdbot-backups/workspace/ . 

echo "=== Restore Complete ==="
echo "Now read: memory/$(date +%Y-%m-%d).md or yesterday's log"
