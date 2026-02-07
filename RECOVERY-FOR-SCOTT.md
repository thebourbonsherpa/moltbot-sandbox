# How to Recover Samwise
**For Scott - Non-Technical Recovery Guide**

*If Samwise loses memory again or something breaks, follow these steps.*

---

## 🚨 Signs Something is Wrong

Samwise will seem "broken" if:
- ❌ He asks "what did we do yesterday?" again
- ❌ He doesn't remember R2 backups are set up
- ❌ He tries to "fix" things that are already fixed
- ❌ He acts like it's the first time talking to you

---

## ✅ Quick Fix (80% of problems)

### Step 1: Point him to his memory
Send this message to Samwise:

```
Read these files before doing anything:
- /root/clawd/memory/2026-02-06.md
- /root/clawd/RECOVERY-PLAN.md
- /root/clawd/R2-SAFETY-RULES.md

Then tell me what day it is and what you last remember.
```

This usually fixes memory issues. He'll read the files and remember.

---

## 🔧 If That Doesn't Work

### Step 2: Check if backups exist

Copy-paste this command into the Clawdbot chat:

```
exec ls -lh /root/clawd/memory/*.md && echo "---" && rclone ls r2:clawdbot-backups/workspace/ | wc -l
```

**What you should see:**
```
-rw-r--r-- ... 2026-02-06.md
-rw-r--r-- ... credentials.md
---
81
```

If you see dates and a number (like 81), backups exist. ✅

If you see errors, backups are broken. ❌ Go to Step 4.

---

## 📂 Step 3: Restore from R2 Backup

If backups exist but Samwise is confused, restore from R2:

**Copy-paste this command:**
```
exec cd /root/clawd && rclone copy r2:clawdbot-backups/workspace/ . --dry-run
```

Look at the output. If it says "Transferred: 0 B", everything is already synced. ✅

If it shows files to copy, run without `--dry-run`:
```
exec cd /root/clawd && rclone copy r2:clawdbot-backups/workspace/ .
```

Then tell Samwise:
```
Your workspace has been restored from R2. Read memory/2026-02-06.md and tell me what you remember.
```

---

## 📋 Step 4: Check Git History

Your workspace has git version control. See what happened:

**Copy-paste:**
```
exec cd /root/clawd && git log --oneline -10
```

**What you'll see:**
```
839ecaa Safety: R2 backup script...
fe41f6d Final status report...
99a9e10 R2 backups working...
```

This shows all changes. You can restore to any point:

**To restore to a specific version:**
```
exec cd /root/clawd && git checkout 839ecaa
```

Replace `839ecaa` with the commit ID you want.

---

## 🔄 Step 5: Restart Everything

Sometimes you just need to restart:

**Copy-paste:**
```
gateway restart
```

Wait 30 seconds, then reconnect to the UI.

---

## 🆘 Step 6: Nuclear Option (Start Fresh)

If everything is broken and nothing works:

### 6a. Save what you can
```
exec cd /root && tar -czf clawd-backup-$(date +%Y%m%d).tar.gz clawd/
```

This creates a backup file in `/root/clawd-backup-YYYYMMDD.tar.gz`

### 6b. Download backup via R2
Log into Cloudflare Dashboard → R2 → clawdbot-backups

You'll see:
- `workspace/` folder (your files)
- `config/` folder (Clawdbot settings)

Click "Download" on any files you need.

### 6c. Start over
Follow the original Clawdbot setup guide. You can restore from the backup once it's running.

---

## 📊 Health Check (Copy-Paste Anytime)

Want to verify everything is working? Copy-paste this:

```
exec echo "=== Git Status ===" && cd /root/clawd && git log --oneline -1 && echo "=== Memory Files ===" && ls -lh memory/*.md | tail -3 && echo "=== R2 Backup ===" && rclone size r2:clawdbot-backups/workspace/ && echo "=== Cron Jobs ===" && clawdbot cron list | grep -E "daily-memory|nightly-backup"
```

**Expected output:**
- Git: Recent commit with date
- Memory: Files from today/yesterday
- R2: "Total size: XXX KB"
- Cron: Two jobs listed

If you see all four sections, everything is healthy. ✅

---

## 🔍 What Each Backup Contains

### Git (Local)
- **Location:** `/root/clawd/.git/`
- **Contains:** Every version of workspace files
- **Restore:** `git log` then `git checkout <commit>`
- **Speed:** Instant (local)

### R2 (Cloud)
- **Location:** `r2:clawdbot-backups/`
- **Contains:** Current + accumulated backups
- **Restore:** `rclone copy r2:clawdbot-backups/workspace/ /root/clawd/`
- **Speed:** ~30 seconds (depends on internet)

### Local Config Backups
- **Location:** `/root/.clawdbot/*.backup-*`
- **Contains:** Timestamped clawdbot.json files
- **Restore:** `cp /root/.clawdbot/clawdbot.json.backup-YYYYMMDD-HHMMSS /root/.clawdbot/clawdbot.json`
- **Speed:** Instant

---

## 💬 How to Send Commands to Samwise

**Option 1: In Chat (Telegram/Admin UI)**
Just type the command starting with `exec`:
```
exec ls -la /root/clawd
```

**Option 2: Via Control UI**
1. Open http://your-gateway-ip:18789/
2. Click "Chat" in sidebar
3. Paste commands there

---

## ⏰ Automated Backups Schedule

These run automatically every night:

**23:55 UTC** (6:55 PM EST)
- Daily memory log updates

**03:00 UTC** (10:00 PM EST previous day)
- Git commits all changes
- Backs up config
- Syncs to R2

You don't need to do anything. Just check occasionally that they're working.

---

## 📞 When to Ask for Help

**You can handle:**
- ✅ Samwise forgetting things → Point him to memory files
- ✅ Checking backups exist → Copy-paste health check
- ✅ Restarting the gateway → `gateway restart`

**Ask for help if:**
- ❌ R2 backups show errors (not just "0 files")
- ❌ Git commands fail
- ❌ Gateway won't start after restart
- ❌ Files are actually deleted (not just Samwise confused)

---

## 🎯 TL;DR (Too Long, Didn't Read)

**If Samwise is confused:**
1. Tell him: "Read /root/clawd/memory/2026-02-06.md"
2. If still broken: `exec cd /root/clawd && rclone copy r2:clawdbot-backups/workspace/ .`
3. If still broken: `gateway restart`
4. If still broken: Ask for help

**Check backups are working:**
```
exec cd /root/clawd && git log -1 && rclone size r2:clawdbot-backups/workspace/
```

**That's it.** You have 3 layers of backup. Something will work.

---

*Created: 2026-02-06 16:48 UTC*  
*Keep this file. You'll need it eventually.*
