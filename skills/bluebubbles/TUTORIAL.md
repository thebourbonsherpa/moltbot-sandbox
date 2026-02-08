# BlueBubbles + Clawdbot Setup Tutorial

**Step-by-step guide to getting iMessage working with your Clawdbot.**

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] MacOS machine with iMessage configured
- [ ] BlueBubbles server installed and running
- [ ] Server accessible from your Clawdbot machine
- [ ] API authentication enabled in BlueBubbles
- [ ] Clawdbot gateway running (v0.9.0+)

## Part 1: BlueBubbles Server Setup

### Step 1: Install BlueBubbles Server

1. Download from https://bluebubbles.app/
2. Install on your Mac
3. Sign in to iMessage if not already

### Step 2: Configure API Access

1. Open BlueBubbles Server settings
2. Navigate to **"API & Webhooks"**
3. Enable **"API"**
4. Enable **"Private API"** (required for sending)
5. Set or copy the **API Password** (looks like `sk-...`)
6. Note the **Port** (default: 1234)

### Step 3: Test Server Accessibility

From your Clawdbot machine:

```bash
# Replace SERVER_IP and PASSWORD with your values
curl -H "Authorization: Bearer YOUR_PASSWORD" \
  http://SERVER_IP:1234/api/v1/ping
```

Expected response:
```json
{
  "status": 200,
  "message": "pong"
}
```

**If it fails:**
- Check Mac firewall settings
- Verify network connectivity
- Confirm BlueBubbles server is running
- Try using the Mac's local IP (find in System Settings → Network)

## Part 2: Plugin Installation

### Step 4: Install the Plugin

SSH to your Clawdbot machine and run:

```bash
cd /root/clawd/skills/bluebubbles/plugin
npm link
```

This makes the plugin available globally as `@clawdbot/plugin-bluebubbles`.

**Verify installation:**
```bash
ls -la $(npm root -g)/@clawdbot/plugin-bluebubbles
```

You should see the plugin files listed.

## Part 3: Gateway Configuration

### Step 5: Backup Current Config

```bash
cd /root/clawd
cp config.yaml config.yaml.backup
```

### Step 6: Edit Gateway Config

Option A: **Manual Edit** (if comfortable with YAML)

```bash
nano config.yaml
```

Add the BlueBubbles channel section:

```yaml
channels:
  # Your existing channels (telegram, etc.)
  telegram:
    plugin: telegram
    token: "..."
  
  # Add this:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://YOUR_SERVER_IP:1234"
    password: "sk-YOUR_PASSWORD_HERE"
    pollIntervalMs: 5000
```

Update your session to include bluebubbles:

```yaml
sessions:
  main:
    agent: main
    channels:
      - telegram
      - bluebubbles  # Add this line
    owners:
      - "YOUR_TELEGRAM_ID"
```

Option B: **Use Example Config**

```bash
# Review the example first
cat skills/bluebubbles/examples/gateway-config.yaml

# Copy and customize
cp skills/bluebubbles/examples/gateway-config.yaml config.yaml
nano config.yaml  # Update your specific values
```

### Step 7: Validate Config

Check for YAML syntax errors:

```bash
# This command will parse the config and show errors if any
clawdbot gateway config.get
```

## Part 4: Deployment

### Step 8: Restart Gateway

```bash
clawdbot gateway restart
```

Wait 10-15 seconds for the gateway to fully initialize.

### Step 9: Check Status

```bash
clawdbot gateway status
```

Look for:
- Gateway is running
- No errors in recent logs
- BlueBubbles plugin loaded successfully

**Watch live logs:**
```bash
journalctl -u clawdbot-gateway -f
```

You should see messages like:
```
[info] BlueBubbles connected to http://SERVER:1234
[info] BlueBubbles poll: checking for new messages...
```

## Part 5: Testing

### Step 10: Send Test Message

From your iPhone, send an iMessage to one of your contacts (yourself or another number).

Within 5 seconds (the poll interval), you should see Clawdbot receive it in the logs:

```
[info] BlueBubbles: Received message from +1234567890
```

### Step 11: Reply from Clawdbot

In your Clawdbot chat (Telegram, web, etc.), type a reply.

It should:
1. Route through BlueBubbles channel
2. Appear as an iMessage from your Mac
3. Show success in the logs

### Step 12: Verify Two-Way Communication

Send a few messages back and forth to confirm:
- iPhone → Clawdbot works reliably
- Clawdbot → iPhone delivers correctly
- Message threading is preserved
- No duplicate messages appear

## Troubleshooting

### Problem: "Plugin not found"

**Symptoms**: Gateway logs show "Unknown plugin: @clawdbot/plugin-bluebubbles"

**Solution**:
```bash
# Verify npm link succeeded
npm list -g @clawdbot/plugin-bluebubbles

# If missing, re-run:
cd /root/clawd/skills/bluebubbles/plugin
npm link

# Restart gateway
clawdbot gateway restart
```

### Problem: "Connection failed"

**Symptoms**: "BlueBubbles connection failed" in logs

**Solution**:
1. Verify server URL in config (no trailing slash)
2. Test connectivity: `curl http://SERVER:1234/api/v1/ping`
3. Check API password matches BlueBubbles settings
4. Confirm Mac isn't asleep (or enable "Prevent sleep")

### Problem: No messages received

**Symptoms**: You send iMessage but Clawdbot doesn't respond

**Solution**:
1. Check gateway logs: `journalctl -u clawdbot-gateway -f`
2. Verify polling is active (logs show periodic polls)
3. Confirm message isn't from yourself (self-messages are filtered)
4. Check chat GUID matches:
   ```bash
   curl -H "Authorization: Bearer PASSWORD" \
     http://SERVER:1234/api/v1/chat
   ```

### Problem: Can't send messages

**Symptoms**: Clawdbot tries to reply but messages don't appear in iMessage

**Solution**:
1. Verify Private API is enabled in BlueBubbles settings
2. Check chat GUID format: `iMessage;-;+1234567890`
3. Review BlueBubbles server logs for send errors
4. Confirm recipient is in your iMessage contacts

### Problem: Duplicate messages

**Symptoms**: Each message appears twice in Clawdbot

**Solution**:
1. Check if multiple gateway instances are running: `ps aux | grep clawdbot`
2. Verify only one session has bluebubbles channel
3. Restart gateway to reset polling state

## Advanced Configuration

### Filtering Specific Chats

To only monitor certain iMessage conversations:

```yaml
channels:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://SERVER:1234"
    password: "sk-..."
    allowedChats:
      - "iMessage;-;+1234567890"
      - "iMessage;-;email@example.com"
```

(Note: This requires adding filtering logic to the plugin)

### Webhook Alternative

Instead of polling, you can configure BlueBubbles webhooks for instant delivery:

1. In BlueBubbles → API & Webhooks → Add Webhook
2. URL: `http://YOUR_CLAWDBOT:PORT/webhook/bluebubbles`
3. Event: "New Message"

(Note: This requires adding webhook handler to the plugin)

### Multiple BlueBubbles Servers

To support multiple Mac/iMessage accounts:

```yaml
channels:
  bluebubbles_personal:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://MAC1:1234"
    password: "sk-..."
  
  bluebubbles_work:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://MAC2:1234"
    password: "sk-..."
```

## Next Steps

Now that BlueBubbles is working:

- [ ] Add to your production config
- [ ] Set up monitoring/alerts for connection failures
- [ ] Document your chat GUIDs in TOOLS.md
- [ ] Consider webhook setup for instant delivery
- [ ] Test edge cases (images, reactions, group messages)

## Getting Help

**BlueBubbles Issues:**
- Discord: https://discord.gg/hbx7EhNFjp
- Docs: https://docs.bluebubbles.app/

**Clawdbot Issues:**
- Discord: https://discord.com/invite/clawd
- Docs: https://docs.clawd.bot
- GitHub: https://github.com/clawdbot/clawdbot

**Plugin Bugs:**
- Check this skill's GitHub issues
- Review gateway logs: `journalctl -u clawdbot-gateway -f`
- Enable debug logging in Clawdbot config

## Success! 🎉

If you've made it here and messages are flowing both ways, congratulations! You now have iMessage integrated with your Clawdbot.

Consider documenting your setup in `TOOLS.md` for future reference:

```markdown
### BlueBubbles
- Server: 192.168.1.5:1234
- Contacts:
  - Scott: iMessage;-;+436644068787
  - Mom: iMessage;-;+1234567890
```

Happy messaging! 💬
