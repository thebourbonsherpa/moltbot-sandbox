# R2 Safety Rules - READ BEFORE TOUCHING R2

## ⚠️ CRITICAL WARNING

The R2 API token has **Admin Read & Write** permissions.
**There is NO UNDO.** If you delete something, it's gone forever.
Scott cannot recover deleted files.

---

## 🚫 NEVER DO THESE

### Absolutely Forbidden Commands:
```bash
# ❌ NEVER delete from R2
rclone delete r2:clawdbot-backups/...
rclone purge r2:clawdbot-backups/...
rclone deletefile r2:...

# ❌ NEVER use sync with --delete flags
rclone sync ... --delete-before
rclone sync ... --delete-after
rclone sync ... --delete-during

# ❌ NEVER move (deletes source)
rclone move ...

# ❌ NEVER cleanup operations
rclone cleanup r2:...
rclone rmdirs r2:...
```

---

## ✅ SAFE OPERATIONS ONLY

### What You CAN Do:
```bash
# ✅ List files (read-only)
rclone ls r2:clawdbot-backups/
rclone lsd r2:
rclone size r2:clawdbot-backups/workspace/

# ✅ Copy TO R2 (adds files, doesn't delete)
rclone copy /root/clawd r2:clawdbot-backups/workspace/

# ✅ Download FROM R2 (read-only)
rclone copy r2:clawdbot-backups/workspace/ /tmp/restore/

# ✅ Check what WOULD sync (dry-run)
rclone sync /root/clawd r2:clawdbot-backups/workspace/ --dry-run
```

---

## 🛡️ Current Backup Strategy

### What `/root/backup-to-r2.sh` Does:
1. ✅ Commits to git (local, safe)
2. ✅ Copies config locally (safe)
3. ✅ Uses `rclone copy` with `--ignore-existing` (safe, no deletions)

### Why This is Safe:
- **`copy` never deletes** from destination
- **`--ignore-existing`** skips files already on R2 (won't overwrite)
- **Only adds new files** to R2
- **Old versions stay on R2** (manual cleanup needed eventually)

### Trade-off:
- R2 storage will grow over time (old backups accumulate)
- This is MUCH better than accidentally deleting everything
- Scott can manually clean up old backups when needed

---

## 🔍 Before ANY R2 Command

**Ask yourself:**
1. Does this command DELETE anything?
2. Does this command OVERWRITE anything?
3. Could this command LOSE data?

**If YES to any:** DON'T DO IT without Scott's explicit approval.

---

## 📋 Recovery Procedure (If You Mess Up)

1. **STOP immediately**
2. **Do NOT try to fix it yourself**
3. **Tell Scott exactly what happened**
4. **Show the exact command you ran**
5. **Check git for local recovery:** `cd /root/clawd && git log`

---

## ✅ Automated Cron Jobs are SAFE

The nightly backup script uses safe `copy` operations only.
No deletions. No overwrites. Just adds new/changed files.

**Cron schedule:**
- `nightly-backup` runs `/root/backup-to-r2.sh` at 03:00 UTC daily
- Safe by design

---

## 🎯 Summary

**Golden Rule:** R2 operations are **write-once, accumulate forever**.
- ✅ Add files: Safe
- ✅ Read files: Safe
- ❌ Delete files: FORBIDDEN
- ❌ Overwrite files: Avoid

**When in doubt:** Use `--dry-run` first, or ask Scott.

---

*Last updated: 2026-02-06 16:47 UTC*  
*This is your ONE JOB. Don't break it.*
