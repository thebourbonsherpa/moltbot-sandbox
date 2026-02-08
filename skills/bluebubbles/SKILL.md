# BlueBubbles Channel Plugin

**Integrate iMessage with Clawdbot through BlueBubbles server.**

## Overview

This skill provides a Clawdbot channel plugin that connects to a [BlueBubbles](https://bluebubbles.app/) server, enabling:
- Receiving iMessages through Clawdbot
- Sending iMessage replies via the BlueBubbles Private API
- Two-way conversation bridging between iMessage and other Clawdbot channels

## Requirements

1. **BlueBubbles Server** running and accessible
   - MacOS machine with iMessage configured
   - BlueBubbles server installed and running
   - Server accessible via HTTP/HTTPS
   - API authentication enabled

2. **Clawdbot** v0.9.0 or later
   - Node.js 18+
   - Gateway running

## Installation

### 1. Install the Plugin

**Option A: Global Install (Recommended)**
```bash
cd /root/clawd/skills/bluebubbles/plugin
npm link
```

**Option B: Local Path**
Add the plugin directory to your gateway config:
```yaml
plugins:
  discovery:
    - /root/clawd/skills/bluebubbles/plugin
```

### 2. Configure Gateway

Add to your `config.yaml`:

```yaml
channels:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://YOUR_SERVER:1234"
    password: "YOUR_API_PASSWORD"
    pollIntervalMs: 5000  # Optional, default 5000

sessions:
  main:
    channels:
      - bluebubbles
    owners:
      - "YOUR_TELEGRAM_ID"  # For permission mapping
```

### 3. Restart Gateway

```bash
clawdbot gateway restart
```

## Configuration

### Required Settings

- **`serverUrl`**: Your BlueBubbles server URL (e.g., `http://192.168.1.100:1234`)
- **`password`**: API password from BlueBubbles server settings

### Optional Settings

- **`pollIntervalMs`**: How often to check for new messages (default: 5000ms)

## Usage

Once configured, Clawdbot will:
1. **Automatically poll** for new iMessages from your BlueBubbles server
2. **Route inbound messages** to the appropriate session
3. **Send replies** back through iMessage when you respond

### Sending Messages

From Clawdbot, you can send iMessages using the standard message interface:

```javascript
// The chat GUID is the iMessage identifier
// Format: iMessage;-;+1234567890 or iMessage;-;email@example.com
{
  to: "iMessage;-;+436644068787",
  text: "Hello from Clawdbot!"
}
```

### Finding Chat GUIDs

To discover available chats and their GUIDs:

```bash
curl -H "Authorization: Bearer YOUR_PASSWORD" \
  http://YOUR_SERVER:1234/api/v1/chat
```

Look for the `guid` field in each chat object.

## BlueBubbles API Reference

The plugin uses these BlueBubbles API endpoints:

- **GET `/api/v1/ping`** - Health check
- **GET `/api/v1/chat`** - List available chats
- **POST `/api/v1/message/query`** - Fetch messages
- **POST `/api/v1/message/text`** - Send text message

Full API docs: https://docs.bluebubbles.app/server/api/

## Troubleshooting

### Connection Issues

**Problem**: "BlueBubbles connection failed"

**Solutions**:
- Verify server URL is correct and accessible
- Check API password matches BlueBubbles settings
- Confirm server is running: `curl http://SERVER:PORT/api/v1/ping`
- Check firewall rules allow connection

### No Messages Received

**Problem**: Messages sent to iMessage but Clawdbot doesn't see them

**Solutions**:
- Check gateway logs: `journalctl -u clawdbot-gateway -f`
- Verify polling is active (look for "BlueBubbles poll" in logs)
- Confirm messages aren't from yourself (`isFromMe: true` are filtered)
- Check `lastMessageDate` isn't too far in the future

### Can't Send Messages

**Problem**: "BlueBubbles send failed"

**Solutions**:
- Verify chat GUID format is correct
- Check BlueBubbles server has Private API enabled
- Confirm recipient is in your iMessage contacts
- Review BlueBubbles server logs for errors

### Authentication Errors

**Problem**: HTTP 401 or 403 responses

**Solutions**:
- Regenerate API password in BlueBubbles settings
- Update `password` in gateway config
- Restart gateway after config changes

## Architecture

### Message Flow

**Inbound (iMessage → Clawdbot)**:
1. Plugin polls `/api/v1/message/query` every `pollIntervalMs`
2. New messages are filtered (not from self, has text)
3. Messages passed to `context.handleInbound()`
4. Clawdbot routes to appropriate session

**Outbound (Clawdbot → iMessage)**:
1. Session calls `send({ to, text })`
2. Plugin POSTs to `/api/v1/message/text`
3. BlueBubbles server sends via iMessage
4. Returns message GUID on success

### State Management

The plugin maintains minimal state:
- `lastMessageDate`: Timestamp of last seen message (prevents duplicates)
- `polling`: Boolean flag for poll loop status
- `pollTimer`: Timer handle for cleanup

State is ephemeral - resets on gateway restart.

## Security Considerations

- **API Password**: Store securely, treat like a private key
- **Server Access**: Use HTTPS in production, or secure network
- **Message Privacy**: All iMessage content flows through the server
- **Authentication**: BlueBubbles uses bearer token auth (no OAuth)

## Development

### Testing Locally

```bash
# Start gateway with local plugin
cd /root/clawd
clawdbot gateway restart

# Watch logs
journalctl -u clawdbot-gateway -f

# Send test message from iPhone to iMessage chat
```

### Plugin Structure

```
plugin/
├── bluebubbles.mjs    # Main plugin implementation
└── package.json       # NPM package manifest
```

### Required Exports

Channel plugins must export:
- `id`: Unique channel identifier
- `name`: Human-readable name
- `capabilities`: Feature flags
- `init(config, context)`: Setup function
- `send(message)`: Send message handler
- `cleanup()`: Shutdown handler (optional)

## Examples

### Basic Configuration

```yaml
channels:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://192.168.1.5:1234"
    password: "sk-abc123xyz"
```

### With Multiple Channels

```yaml
channels:
  telegram:
    plugin: telegram
    token: "YOUR_TOKEN"
  
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://SERVER:1234"
    password: "YOUR_PASSWORD"

sessions:
  main:
    channels:
      - telegram
      - bluebubbles
```

### Testing Connection

```bash
# Test server connectivity
curl -H "Authorization: Bearer YOUR_PASSWORD" \
  http://SERVER:1234/api/v1/ping

# List available chats
curl -H "Authorization: Bearer YOUR_PASSWORD" \
  http://SERVER:1234/api/v1/chat

# Query recent messages
curl -X POST \
  -H "Authorization: Bearer YOUR_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{"limit":10,"sort":"DESC"}' \
  http://SERVER:1234/api/v1/message/query
```

## Resources

- **BlueBubbles**: https://bluebubbles.app/
- **API Documentation**: https://docs.bluebubbles.app/server/api/
- **GitHub**: https://github.com/BlueBubblesApp
- **Clawdbot Docs**: https://docs.clawd.bot

## Support

For BlueBubbles server issues:
- BlueBubbles Discord: https://discord.gg/hbx7EhNFjp
- Documentation: https://docs.bluebubbles.app/

For Clawdbot plugin issues:
- Clawdbot Discord: https://discord.com/invite/clawd
- Check gateway logs: `journalctl -u clawdbot-gateway -f`

## License

MIT
