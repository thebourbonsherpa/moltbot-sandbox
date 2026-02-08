#!/bin/bash
# Boot Restore Script - Run on container startup
# Restores workspace from GitHub (primary) or persistent storage (fallback)

LOG="/tmp/boot-restore.log"
WORKSPACE="/root/clawd"
PERSISTENT="/data/moltbot/workspace"
GITHUB_REPO="https://github.com/thebourbonsherpa/moltbot-sandbox.git"

echo "$(date -Iseconds) - Boot restore starting" >> $LOG

cd $WORKSPACE

# Step 1: Ensure git remote is configured
if ! git remote get-url origin &>/dev/null; then
    echo "$(date -Iseconds) - Adding GitHub remote" >> $LOG
    git remote add origin $GITHUB_REPO
fi

# Step 2: Try to restore from GitHub (primary source of truth)
echo "$(date -Iseconds) - Fetching from GitHub..." >> $LOG
if git fetch origin 2>>$LOG; then
    echo "$(date -Iseconds) - Resetting to origin/master" >> $LOG
    git reset --hard origin/master 2>>$LOG
    
    if [ -f "$WORKSPACE/MEMORY.md" ]; then
        echo "$(date -Iseconds) - SUCCESS: Restored from GitHub" >> $LOG
        
        # Update persistent storage with good data
        echo "$(date -Iseconds) - Syncing to persistent storage" >> $LOG
        rsync -a --delete --exclude '.git' $WORKSPACE/ $PERSISTENT/
        
        echo "$(date -Iseconds) - Boot restore complete (GitHub)" >> $LOG
        exit 0
    fi
fi

# Step 3: Fallback to persistent storage if GitHub fails
echo "$(date -Iseconds) - GitHub restore failed, trying persistent storage" >> $LOG
if [ -f "$PERSISTENT/MEMORY.md" ]; then
    echo "$(date -Iseconds) - Restoring from persistent storage" >> $LOG
    rsync -a $PERSISTENT/ $WORKSPACE/
    echo "$(date -Iseconds) - Boot restore complete (persistent)" >> $LOG
    exit 0
fi

# Step 4: Nothing to restore - fresh start
echo "$(date -Iseconds) - WARNING: No backup found, starting fresh" >> $LOG
exit 1
