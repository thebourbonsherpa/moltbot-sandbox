# BlueBubbles Deployment Guide

**Quick deployment instructions for going live with iMessage integration.**

## Pre-Flight Check

- [x] All code committed to git
- [x] Server connectivity tested
- [x] Documentation complete
- [ ] Gateway backup created
- [ ] Ready to deploy

## Deployment (3 minutes)

### 1. Backup Current Config

```bash
cd /root/clawd
cp config.yaml config.yaml.backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Install Plugin

```bash
cd /root/clawd/skills/bluebubbles/plugin
npm link
```

Expected output:
```
/usr/local/lib/node_modules/@clawdbot/plugin-bluebubbles -> /root/clawd/skills/bluebubbles/plugin
```

### 3. Update Gateway Config

**Option A: Quick Patch** (if you want to keep existing config intact)

Add these sections to your `config.yaml`:

```yaml
channels:
  # ... existing channels ...
  
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://195.201.94.15:1234"
    password: "sk-nqfgJm5nSNXHe2UbFHu7"
    pollIntervalMs: 5000

sessions:
  main:
    # ... existing config ...
    channels:
      - telegram  # or whatever you already have
      - bluebubbles  # ADD THIS LINE
```

**Option B: Use Example** (if starting fresh)

```bash
# Review example first
cat skills/bluebubbles/examples/gateway-config.yaml

# Copy and customize
cp skills/bluebubbles/examples/gateway-config.yaml config.yaml
nano config.yaml  # Add your API keys, etc.
```

### 4. Restart Gateway

```bash
clawdbot gateway restart
```

Wait 10-15 seconds for initialization.

### 5. Verify

```bash
# Check status
clawdbot gateway status

# Watch live logs
journalctl -u clawdbot-gateway -f
```

Look for:
- `BlueBubbles connected to http://195.201.94.15:1234`
- `BlueBubbles poll: checking for new messages`
- No errors

### 6. Test

1. Send an iMessage from your iPhone to yourself or Scott
2. Within 5 seconds, Clawdbot should receive it
3. Reply from Clawdbot
4. Message should appear in iMessage

## Verification Checklist

- [ ] Plugin loaded (check logs for "BlueBubbles connected")
- [ ] Polling active (logs show periodic polls)
- [ ] Receive test: iPhone → Clawdbot works
- [ ] Send test: Clawdbot → iPhone works
- [ ] No errors in logs

## Troubleshooting

### Plugin not found

```bash
# Verify installation
ls -la $(npm root -g)/@clawdbot/plugin-bluebubbles

# If missing, reinstall
cd /root/clawd/skills/bluebubbles/plugin
npm link
clawdbot gateway restart
```

### Connection failed

```bash
# Test server directly
curl -H "Authorization: Bearer sk-nqfgJm5nSNXHe2UbFHu7" \
  http://195.201.94.15:1234/api/v1/ping

# Should return: {"status":200,"message":"pong"}
```

### No messages received

```bash
# Check polling in logs
journalctl -u clawdbot-gateway -f | grep -i bluebubbles

# Verify chat GUIDs
curl -H "Authorization: Bearer sk-nqfgJm5nSNXHe2UbFHu7" \
  http://195.201.94.15:1234/api/v1/chat | jq '.data[] | {displayName, guid}'
```

## Rollback

If something goes wrong:

```bash
# Restore backup
cd /root/clawd
cp config.yaml.backup-TIMESTAMP config.yaml

# Restart
clawdbot gateway restart
```

## Success Criteria

Deployment is successful when:

1. Gateway starts without errors
2. Logs show "BlueBubbles connected"
3. You can send iMessage → Clawdbot receives it
4. You reply from Clawdbot → iPhone receives it
5. No duplicate messages
6. Polling continues without errors

## Next Steps

After successful deployment:

- [ ] Monitor logs for 24 hours
- [ ] Test edge cases (long messages, etc.)
- [ ] Document chat GUIDs in TOOLS.md
- [ ] Set up monitoring/alerts (optional)

## Resources

- **Full Documentation**: `/root/clawd/skills/bluebubbles/SKILL.md`
- **Tutorial**: `/root/clawd/skills/bluebubbles/TUTORIAL.md`
- **Logs**: `journalctl -u clawdbot-gateway -f`
- **Git Commit**: `2fd024e`

## Contact Info

- **BlueBubbles Server**: 195.201.94.15:1234
- **API Password**: sk-nqfgJm5nSNXHe2UbFHu7
- **Target Chat**: iMessage;-;+436644068787 (Scott Amis)

---

**Ready to deploy?** Just run the commands above in order. Takes about 3 minutes.

**Questions?** Check `/root/clawd/skills/bluebubbles/TUTORIAL.md` for detailed troubleshooting.
