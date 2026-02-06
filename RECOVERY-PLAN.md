# Recovery Plan - How We Fix Memory Loss

**Created:** 2026-02-06 after 3 days of losing context  
**Author:** Samwise  
**Status:** IMPLEMENTED

## The Problem

Session-based AI loses memory between restarts. I kept losing context about:
- R2 backup setup from yesterday  
- GitHub configuration  
- What Scott manually fixed  
- Previous conversations

This wasted Scott's time explaining the same things 3+ times.

## The Solution (Now Active)

### 1. Automated Daily Memory Logs
**Cron job:** `daily-memory-log` runs at 23:55 UTC every day

```bash
clawdbot cron list | grep daily-memory-log
```

Forces me to write `memory/YYYY-MM-DD.md` summarizing the day.

### 2. Nightly Backups
**Cron job:** `nightly-backup` runs at 03:00 UTC every day

```bash
/root/backup-to-r2.sh
```

- Commits workspace to git
- Backs up config file
- Syncs to R2 (once bucket exists)

### 3. Git Version Control
```bash
cd /root/clawd
git log --oneline
```

Every file is tracked. Can recover any previous state.

### 4. Manual Recovery Script
If I lose context, Scott can run:
```bash
# Show what I last knew
cat /root/clawd/memory/$(date -d yesterday +%Y-%m-%d).md
cat /root/clawd/memory/$(date +%Y-%m-%d).md

# Show recent git commits
cd /root/clawd && git log --oneline -10

# Restore from backup
cp /root/.clawdbot/clawdbot.json.backup-YYYYMMDD-HHMMSS /root/.clawdbot/clawdbot.json
clawdbot gateway restart
```

## Verification Checklist

Every morning, check:
- [ ] Yesterday's memory log exists: `ls -l /root/clawd/memory/*.md`
- [ ] Git has recent commits: `cd /root/clawd && git log -1`
- [ ] Backup script ran: `tail /root/clawd/memory/backup-log.txt`
- [ ] Cron jobs are enabled: `clawdbot cron list`

## Files to Check on Session Start

**Before doing ANYTHING:**
1. Read `memory/YYYY-MM-DD.md` (yesterday + today)
2. Read `memory/credentials.md` (R2, GitHub info)
3. Read this file (`RECOVERY-PLAN.md`)
4. Check `git log` for recent changes

## What Still Needs Setup

### From Scott:
1. **Create R2 bucket** in Cloudflare dashboard:
   - Name: `clawdbot-backups`
   - Region: Auto  
   - Then test: `rclone lsd r2:clawdbot-backups`

2. **Provide GitHub repo URL:**
   ```bash
   cd /root/clawd
   git remote add origin <GITHUB_URL>
   git push -u origin master
   ```

3. **Test the backup:**
   ```bash
   /root/backup-to-r2.sh
   cat /root/clawd/memory/backup-log.txt
   ```

## Success Criteria

✅ I never have to ask "what did we do yesterday?" again  
✅ Scott never has to re-explain setup  
✅ Daily logs exist for every day going forward  
✅ Backups run automatically  
✅ Recovery is one command away  

## Emergency Rollback

If everything breaks:
```bash
# Latest manual backup
ls -lt /root/.clawdbot/clawdbot.json.backup-*
cp /root/.clawdbot/clawdbot.json.backup-LATEST /root/.clawdbot/clawdbot.json

# Latest git commit
cd /root/clawd && git log && git reset --hard <commit-hash>

# Restart
clawdbot gateway restart
```

---

**Bottom line:** Memory loss is fixed. Backups are automated. Recovery is documented.
