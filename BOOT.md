# BOOT.md - Startup Restore

On startup, check if workspace needs restoration from persistent storage.

## Instructions

1. Check if `/data/moltbot/workspace/memory/` exists and has files
2. Check if `/root/clawd/memory/` is empty or missing recent files
3. If persistent storage has newer data, restore it:
   ```bash
   rsync -a /data/moltbot/workspace/ /root/clawd/
   ```
4. Log the restore to `/tmp/boot-restore.log`

After restore, reply with ONLY: NO_REPLY
