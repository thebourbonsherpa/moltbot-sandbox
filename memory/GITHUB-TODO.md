# GitHub Authentication TODO

**Status:** SSH KEY READY - Just needs Scott to add it to GitHub

## 🎯 ONE STEP FOR SCOTT

SSH key is generated and ready. Scott just needs to add it to GitHub:

1. **Go to:** https://github.com/settings/ssh/new
2. **Title:** `Samwise (Clawdbot)`
3. **Key:** Copy-paste this exact line:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILpRTKISvlf7yniPDgLxpH5Pxg2kAh/codtf5mfVjV7D samwise@clawd.bot
```
4. **Click "Add SSH key"**

That's it! Once added, GitHub pushes will work automatically.

## Current State (Updated 2026-02-06 17:02 UTC)

**What I did during Innovation Hour:**
- ✅ Installed openssh-client
- ✅ Generated ED25519 SSH key for `samwise@clawd.bot`
- ✅ Added github.com to known_hosts
- ✅ Changed git remote from HTTPS to SSH: `git@github.com:thebourbonsherpa/moltbot-sandbox.git`

**Current Backup Status:**
- ✅ Local git commits: Working
- ✅ R2 backups: Working (103 objects, 131KB)
- ⏳ GitHub pushes: SSH key ready, waiting for Scott to add to GitHub

## To Test After Scott Adds Key

Samwise can run:
```bash
cd /root/clawd && git push -u origin master
```

Or just wait for the next nightly backup (03:00 UTC) - it will push automatically.

## Key Files Reference
- **Private key:** `/root/.ssh/id_ed25519` (NEVER share this)
- **Public key:** `/root/.ssh/id_ed25519.pub` (safe to share)
- **Known hosts:** `/root/.ssh/known_hosts`

---
*Updated: 2026-02-06 17:02 UTC (Innovation Hour)*
