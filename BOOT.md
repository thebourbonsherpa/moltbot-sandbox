# BOOT.md - Startup Restore

**CRITICAL: Run this FIRST on every startup before doing anything else.**

## Restore Workspace from GitHub

If MEMORY.md doesn't exist or is empty, restore from GitHub:

```bash
cd /root/clawd
git remote add origin https://github.com/thebourbonsherpa/moltbot-sandbox.git 2>/dev/null || true
git fetch origin
git reset --hard origin/master
```

Then sync to persistent storage:
```bash
rsync -a --delete --exclude '.git' /root/clawd/ /data/moltbot/workspace/
```

## Verification

After restore, check that these files exist:
- `/root/clawd/MEMORY.md` (should start with "Scott is Frodo. I am Samwise.")
- `/root/clawd/IDENTITY.md` (should have "Samwise" and "potato")
- `/root/clawd/USER.md` (should have Scott's info)

If files are still missing, alert Scott immediately.

## After Restore

Reply with ONLY: NO_REPLY
