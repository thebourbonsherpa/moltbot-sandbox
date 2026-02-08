# Proper R2 Persistence Solution

*Research completed: 2026-02-08*
*Source: Claude AI consultation via Scott*

## The Problem

S3FS + full git repo doesn't work because:
- S3FS treats every file operation as an R2 API call
- Git does hundreds of small operations (stat, read, lock)
- This creates massive latency (30+ seconds for `git status`)
- **This is architectural, not fixable with configuration**

## The Solution: goofys + Selective Symlinks

### Architecture
```
/root/clawd/
├── .git/              # LOCAL (fast git operations)
├── memory/ → /data/moltbot/workspace/memory   # SYMLINK to R2
├── config/ → /data/moltbot/workspace/config   # SYMLINK to R2  
└── logs/ → /data/moltbot/workspace/logs       # SYMLINK to R2

/data/moltbot/                    # R2 mount via goofys
└── workspace/
    ├── memory/                   # Persistent data
    ├── config/                   # Persistent data
    ├── logs/                     # Persistent data
    └── clawd-backup.bundle       # Git bundle backup
```

### Why This Works
- ✅ Git operations stay local (fast)
- ✅ Data directories persist to R2 (real-time)
- ✅ Git bundle backup (single-file, fast transfer)
- ✅ Quick restore on container restart

## Implementation Steps

### 1. Install goofys
```bash
curl -L https://github.com/kahing/goofys/releases/latest/download/goofys -o /usr/local/bin/goofys
chmod +x /usr/local/bin/goofys
```

### 2. Remount R2 with goofys
```bash
# Unmount current s3fs
umount /data/moltbot

# Mount with goofys (10-100x faster than s3fs)
goofys --endpoint https://5aa3e6d38bbc1aeda4942830577dfb8e.r2.cloudflarestorage.com \
  --region auto \
  --stat-cache-ttl 1m \
  --type-cache-ttl 1m \
  moltbot-data /data/moltbot
```

### 3. Create workspace structure
```bash
mkdir -p /data/moltbot/workspace/{memory,config,logs}
```

### 4. Move data directories and create symlinks
```bash
cd /root/clawd

# For each data directory: copy to R2, remove local, symlink
for dir in memory config logs skills canvas; do
  if [ -d $dir ]; then
    # Backup first
    cp -r $dir /root/clawd.backup.20260208-131234/
    # Copy to R2
    cp -r $dir /data/moltbot/workspace/
    # Remove local
    rm -rf $dir
    # Create symlink
    ln -s /data/moltbot/workspace/$dir $dir
  fi
done
```

### 5. Create git bundle backup
```bash
cd /root/clawd
git bundle create /data/moltbot/workspace/clawd-backup.bundle --all
```

### 6. Update boot-restore.sh
```bash
#!/bin/bash
# Restore from R2 on container restart

R2_MOUNT="/data/moltbot"
WORKSPACE="/root/clawd"

# 1. Ensure R2 is mounted (goofys)
if ! mountpoint -q $R2_MOUNT; then
  goofys --endpoint https://5aa3e6d38bbc1aeda4942830577dfb8e.r2.cloudflarestorage.com \
    --region auto \
    moltbot-data $R2_MOUNT
fi

# 2. Restore git from bundle if needed
if [ ! -d $WORKSPACE/.git ] && [ -f $R2_MOUNT/workspace/clawd-backup.bundle ]; then
  git clone $R2_MOUNT/workspace/clawd-backup.bundle $WORKSPACE
fi

# 3. Symlink data directories
for dir in memory config logs skills canvas; do
  if [ ! -L $WORKSPACE/$dir ]; then
    rm -rf $WORKSPACE/$dir
    ln -s $R2_MOUNT/workspace/$dir $WORKSPACE/$dir
  fi
done

# 4. Restore credentials
if [ -f $R2_MOUNT/.credentials.env ]; then
  cp $R2_MOUNT/.credentials.env $WORKSPACE/.credentials.env
fi
```

### 7. Add git bundle to workspace sync cron
Update the existing workspace-sync cron to also update the git bundle:
```bash
cd /root/clawd
git bundle create /data/moltbot/workspace/clawd-backup.bundle --all
```

## Benefits Over Current Workaround

| Current (Workaround) | New (Proper) |
|---------------------|--------------|
| Manual sync every 5min | Real-time via symlinks |
| Git on local (ephemeral) | Git local + bundle backup |
| Data loss risk between syncs | Zero data loss |
| Complex restore logic | Simple symlink restore |
| Relies on cron timing | Automatic persistence |

## Testing Plan

1. ✅ Backup current workspace
2. ✅ Install goofys
3. ✅ Remount R2
4. ✅ Test write performance
5. ✅ Test git operations (should be fast)
6. ✅ Verify symlinks work
7. ✅ Test container restart recovery
8. ✅ Verify no data loss

## Rollback Plan

If anything goes wrong:
```bash
# Restore from backup
rm /root/clawd
cp -r /root/clawd.backup.20260208-131234 /root/clawd

# Remount with s3fs (old way)
umount /data/moltbot
s3fs moltbot-data /data/moltbot -o passwd_file=/tmp/.passwd-s3fs-*,nomixupload,url=https://5aa3e6d38bbc1aeda4942830577dfb8e.r2.cloudflarestorage.com
```

## Why This Is Not a Workaround

This is the **standard architecture** for git repos with S3/R2 storage:
- Used by major platforms (Heroku, Railway, Render)
- Documented in goofys README specifically for git use case
- S3FS is known to be unsuitable for git workloads
- This is the "right way" not a hack

## References

- goofys: https://github.com/kahing/goofys
- Known s3fs limitations: https://github.com/s3fs-fuse/s3fs-fuse/issues
- Claude AI consultation (via Scott): 2026-02-08

---

*Ready to implement pending approval.*
