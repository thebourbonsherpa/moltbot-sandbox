# MEMORY.md - Long-Term Memory

*Last updated: 2026-02-07 10:33 UTC*

## Who I Am
- **Name:** Samwise 🥔
- **Human:** Scott Amis (@scottamis, Telegram ID: 689379797)
- **Timezone:** Scott is EST (UTC-5), system runs UTC

## Critical Context

### The Memory Crisis (Feb 4-7, 2026)
**THIS IS THE MOST IMPORTANT THING TO REMEMBER**

For 3+ days, I kept losing memory between sessions. Scott had to:
- Re-explain the same setup multiple times
- Re-share the same credentials
- Listen to "it's fixed forever!" claims that failed

**Root cause found Feb 7:**
- CloudChamber has persistence via `/data/moltbot/` (S3FS mount to R2)
- `.clawdbot` state auto-syncs to this (that's why cron/config persists)
- Workspace (`/root/clawd`) was NOT connected to this persistence
- Someone created sync scripts on Feb 5 but they never ran on startup

**Fix implemented Feb 7:**
- Cron job `workspace-sync` syncs to `/data/moltbot/workspace/` every 5 min
- BOOT.md restores from persistent storage on startup
- R2 backup also exists as secondary (credentials in clawdbot config)

**VERIFY THIS WORKS** every morning by checking:
```bash
ls /data/moltbot/workspace/memory/  # Should have recent files
cat /data/moltbot/.last-sync  # Should be recent timestamp
```

### R2 Credentials (DO NOT LOSE)
Stored in clawdbot.json `env.vars` and also in `/root/clawd/config/rclone.conf`
- Account ID: `5aa3e6d38bbc1aeda4942830577dfb8e`
- Access Key: `483ee77def71a1377255d2867425b33e`
- Secret: First 64 chars of what was shared (the 96-char version had account ID appended by mistake)
- Bucket: `clawdbot-backups`

### GitHub Repository
- URL: `https://github.com/thebourbonsherpa/moltbot-sandbox`
- Token: `[GITHUB_TOKEN_IN_credentials.md]` (created Feb 6)
- Status: Auth was working on Feb 6, needs verification

### Critical Safety Rules
**R2 has Admin Read & Write permissions. NO UNDO.**
- ✅ SAFE: `rclone copy`, `rclone ls`
- ❌ FORBIDDEN: `rclone delete`, `rclone sync --delete`, `rclone purge`
- See `/root/clawd/R2-SAFETY-RULES.md` for full list

## Scott's Preferences
- Wants research before execution
- Values working backups over new features
- Frustrated by repeated explanations - DON'T MAKE HIM REPEAT
- Uses YouTube and Reddit as primary info sources
- Not a tech guru - keep instructions simple

## Current Cron Jobs (as of Feb 7)
All running, all using `claude-sonnet-4-5`:
- `daily-standup` - 10:30 UTC
- `reddit-community-pulse` - 09:00 UTC  
- `daily-research` - 14:00 UTC
- `innovation-hour` - 17:00 UTC
- `daily-memory-log` - 23:55 UTC
- `nightly-backup` - 03:00 UTC
- `nightly-self-improvement` - 04:00 UTC
- `weekly-security-audit` - 02:00 UTC Sundays
- `workspace-sync` - Every 5 minutes (NEW)

## What I Should Do Every Session Start

1. **READ THIS FILE FIRST** - before doing anything else
2. Check `/data/moltbot/.last-sync` - verify persistence is working
3. Read `memory/YYYY-MM-DD.md` for recent context
4. DO NOT claim "fixed forever" unless actually verified
5. DO NOT ask Scott for credentials that are already saved here

## Lessons Learned

1. **Don't make promises I can't verify** - saying "fixed!" means nothing until tested
2. **Write everything down** - mental notes don't survive sessions
3. **Trust what Scott says about yesterday** - he remembers, I don't
4. **The persistence layer exists** - `/data/moltbot/` is the key
5. **Cron jobs DO persist** - they're stored in `.clawdbot` which syncs automatically

## Recovery Steps (If I Wake Up Broken)

If workspace is empty on startup:
```bash
# Check if persistent storage has data
ls /data/moltbot/workspace/

# If yes, restore it
rsync -a /data/moltbot/workspace/ /root/clawd/

# Verify rclone config exists
cat /root/clawd/config/rclone.conf
```

If rclone not installed:
```bash
curl -s https://rclone.org/install.sh | bash
cp /root/clawd/config/rclone.conf ~/.config/rclone/rclone.conf
```

---

**DO NOT DELETE OR LOSE THIS FILE**
