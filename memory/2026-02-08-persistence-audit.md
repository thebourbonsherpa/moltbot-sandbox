# Persistence Audit - 2026-02-08 13:50 UTC

## Current State (Before Brother Claude's Guide)

### What's Working
✅ R2 is mounted at `/data/moltbot`
✅ Mount is active: `s3fs on /data/moltbot type fuse.s3fs`
✅ Files are persisting to R2
✅ Local workspace at `/root/clawd` with git repository

### Issues Identified
❌ Using **s3fs** (slow) instead of **goofys** (recommended)
❌ **SANDBOX_SLEEP_AFTER** not set (container can reset anytime)
❌ No AWS/R2 credentials visible in environment variables
❌ Duplicate `.git` directory on R2 at `/data/moltbot/workspace/.git` (shouldn't be there)

### Environment Variables
```
SANDBOX_SLEEP_AFTER: [empty]
CLOUDFLARE_* variables: Present
AWS_ACCESS_KEY_ID: [not visible]
AWS_SECRET_ACCESS_KEY: [not visible]
R2_ENDPOINT: [not visible]
R2_BUCKET_NAME: [not visible]
```

### Directory Structure
```
/data/moltbot/           # R2 mount (s3fs)
├── workspace/           # Full copy including .git (bad)
├── AGENTS.md
├── MEMORY.md
└── ... (other files)

/root/clawd/             # Local workspace
├── .git/                # Local git repo (good)
├── memory/
├── skills/
└── ... (all project files)
```

### Findings
1. Someone already set up s3fs mounting
2. R2 credentials must exist somewhere (s3fs is working)
3. But credentials aren't in environment variables (might be in .credentials.env or passed another way)
4. Git repo is duplicated on R2 (inefficient, will be slow)

## Brother Claude's Guide - Action Items

### Priority 1: Set SANDBOX_SLEEP_AFTER=never
- Prevents container resets
- Must be set in Cloudflare Workers environment variables
- **Requires Scott's action** (Workers dashboard access)

### Priority 2: Switch from s3fs to goofys
- goofys is faster for small file operations
- Better for git operations (though git should stay local)
- Need to unmount s3fs and remount with goofys

### Priority 3: Fix Directory Structure
- Remove `/data/moltbot/workspace/.git` (git should only be local)
- Reorganize R2 to only store: memory/, config/, logs/, backups/
- Keep git operations fast by keeping .git local

### Priority 4: Add Startup Scripts
- Script to mount R2 on boot (@reboot cron)
- Script to restore symlinks on boot
- Script to backup git bundle every 15 min

### Priority 5: Find/Set R2 Credentials
- Discover how s3fs is getting credentials
- Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY as Environment Variables
- Verify they appear in `env` command

## Next Steps

**Waiting for:**
1. Scott to set `SANDBOX_SLEEP_AFTER=never` in Workers dashboard
2. Scott to verify R2 credentials are set as Environment Variables (not Secrets)

**Ready to do:**
1. Check where s3fs is getting credentials from
2. Switch to goofys
3. Reorganize R2 storage structure
4. Create startup/backup scripts

## Notes
- Current setup is "working" but not optimal
- Main risk: container reset will lose everything (SANDBOX_SLEEP_AFTER not set)
- Secondary issue: s3fs is slower than goofys
- Tertiary issue: git on R2 will cause performance problems
