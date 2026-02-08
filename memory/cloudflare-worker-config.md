# Cloudflare Worker Configuration

*Last verified: 2026-02-08*

## Environment Variables & Secrets

### Secrets (encrypted)
1. **ANTHROPIC_API_KEY** - Claude API access
2. **CF_ACCESS_AUD** - Cloudflare Access audience
3. **CF_ACCESS_TEAM_DOMAIN** - Cloudflare Access team domain  
4. **CF_ACCOUNT_ID** - Cloudflare account identifier
5. **MOLTBOT_GATEWAY_TOKEN** - Gateway authentication token
6. **R2_ACCESS_KEY_ID** - R2 storage access key
7. **R2_SECRET_ACCESS_KEY** - R2 storage secret key

### Plaintext Variables
8. **SANDBOX_SLEEP_AFTER** = `never`
   - **Purpose:** Prevents container from sleeping/resetting
   - **Added:** 2026-02-08 to solve memory loss issue
   - **Cost:** Unknown - monitor billing
   - **Alternative values:** `12h`, `24h` if cost becomes issue

## Configuration Purpose

The `SANDBOX_SLEEP_AFTER=never` setting was added to prevent container resets that were causing memory loss. 

**Before this change:**
- Container would reset on inactivity
- Even with R2 backup, workspace files were lost
- Had to restore from GitHub on every restart

**After this change:**
- Container should stay alive indefinitely
- `/data/moltbot` should persist
- Memory loss should stop (theoretically)

## Verification

To confirm the setting is active:
```bash
env | grep SANDBOX_SLEEP_AFTER
```

Should output: `SANDBOX_SLEEP_AFTER=never`

## Monitoring

**Watch for:**
1. Does memory persist after inactivity?
2. Any increase in Cloudflare billing?
3. Container uptime (should be continuous now)

**If cost becomes an issue:**
- Change to `24h` (resets once daily overnight)
- Boot-check cron + GitHub restore should handle daily resets

## Related Files
- `/root/clawd/.credentials.env` - Local copy of credentials
- `/root/clawd/scripts/boot-restore.sh` - Startup restore script
- Boot-check cron - Restores from GitHub if MEMORY.md missing

---

*This configuration is critical to memory persistence. Don't remove SANDBOX_SLEEP_AFTER without understanding the consequences.*
