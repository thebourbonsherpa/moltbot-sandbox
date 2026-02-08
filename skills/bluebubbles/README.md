# @clawdbot/plugin-bluebubbles

**iMessage integration for Clawdbot via BlueBubbles**

Connects your Clawdbot instance to [BlueBubbles](https://bluebubbles.app/) server for two-way iMessage communication.

## Quick Start

### 1. Install

```bash
npm link
```

### 2. Configure

Add to your Clawdbot `config.yaml`:

```yaml
channels:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://YOUR_SERVER:1234"
    password: "YOUR_API_PASSWORD"
```

### 3. Add to Session

```yaml
sessions:
  main:
    channels:
      - bluebubbles
```

### 4. Restart

```bash
clawdbot gateway restart
```

## Features

- ✅ Receive iMessages in Clawdbot
- ✅ Send iMessage replies via Private API
- ✅ Automatic polling for new messages
- ✅ Chat GUID-based routing
- ✅ Reply threading support
- ⚠️ No attachments yet (text only)
- ⚠️ No group message support yet
- ⚠️ No reactions/tapbacks yet

## Requirements

- BlueBubbles server running on MacOS
- BlueBubbles API enabled with authentication
- BlueBubbles Private API enabled (for sending)
- Clawdbot v0.9.0 or later
- Node.js 18+

## Documentation

- **[SKILL.md](./SKILL.md)** - Complete skill reference
- **[TUTORIAL.md](./TUTORIAL.md)** - Step-by-step setup guide
- **[examples/](./examples/)** - Configuration examples

## Configuration Options

### Required

- `serverUrl` - BlueBubbles server URL (e.g., `http://192.168.1.5:1234`)
- `password` - API password from BlueBubbles settings

### Optional

- `pollIntervalMs` - Polling interval in milliseconds (default: `5000`)

## API Reference

The plugin implements the Clawdbot channel interface:

- `init(config, context)` - Initialize and test connection
- `send(message)` - Send message via BlueBubbles API
- `cleanup()` - Stop polling and clean up

## Message Format

### Inbound (iMessage → Clawdbot)

```javascript
{
  from: "+1234567890",          // Phone number or email
  text: "Message content",
  chatId: "iMessage;-;+1234567890",  // Chat GUID
  messageId: "guid-here",
  timestamp: 1234567890000,
  raw: { /* full BlueBubbles message object */ }
}
```

### Outbound (Clawdbot → iMessage)

```javascript
{
  to: "iMessage;-;+1234567890",  // Chat GUID
  text: "Message to send",
  replyTo: "parent-guid"          // Optional: reply to specific message
}
```

## Finding Chat GUIDs

To discover available chats:

```bash
curl -H "Authorization: Bearer YOUR_PASSWORD" \
  http://YOUR_SERVER:1234/api/v1/chat | jq '.data[] | {displayName, guid}'
```

Output:
```json
{
  "displayName": "Scott Amis",
  "guid": "iMessage;-;+436644068787"
}
```

## Troubleshooting

### Connection failed

- Verify `serverUrl` is accessible: `curl http://SERVER:PORT/api/v1/ping`
- Check API password matches BlueBubbles settings
- Confirm BlueBubbles server is running on Mac

### No messages received

- Check gateway logs: `journalctl -u clawdbot-gateway -f`
- Verify polling is active (look for "BlueBubbles poll")
- Confirm Private API is enabled in BlueBubbles

### Can't send messages

- Check chat GUID format matches exactly
- Verify recipient is in iMessage contacts
- Review BlueBubbles server logs for errors

## Examples

### Basic Setup

```yaml
channels:
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://192.168.1.5:1234"
    password: "sk-abc123"
    pollIntervalMs: 5000

sessions:
  main:
    agent: main
    channels:
      - bluebubbles
```

### With Telegram Bridge

```yaml
channels:
  telegram:
    plugin: telegram
    token: "YOUR_TOKEN"
  
  bluebubbles:
    plugin: "@clawdbot/plugin-bluebubbles"
    serverUrl: "http://192.168.1.5:1234"
    password: "sk-abc123"

sessions:
  main:
    channels:
      - telegram
      - bluebubbles  # Messages flow between both
```

## Architecture

The plugin operates as follows:

1. **Initialization**: Test connection with `/api/v1/ping`
2. **Polling Loop**: Query `/api/v1/message/query` every `pollIntervalMs`
3. **Filtering**: Remove self-messages and duplicates
4. **Inbound**: Pass new messages to `context.handleInbound()`
5. **Outbound**: POST to `/api/v1/message/text` when sending

State is ephemeral - resets on gateway restart.

## Security

- API password is sent as Bearer token in Authorization header
- All communication is unencrypted HTTP by default
- Consider using HTTPS or secure network tunnel in production
- Password stored in Clawdbot gateway config (treat as sensitive)

## Limitations

Current version does not support:

- Attachments (images, videos, files)
- Group messages/chats
- Reactions (tapbacks)
- Read receipts
- Typing indicators
- Message editing
- Message deletion

These may be added in future versions.

## Contributing

To extend the plugin:

1. Clone/fork the skill repository
2. Modify `plugin/bluebubbles.mjs`
3. Test with `npm link` and gateway restart
4. Document changes in SKILL.md

## Resources

- **BlueBubbles**: https://bluebubbles.app/
- **API Docs**: https://docs.bluebubbles.app/server/api/
- **Clawdbot**: https://docs.clawd.bot
- **Support**: https://discord.com/invite/clawd

## License

MIT

## Version History

- **1.0.0** (2026-02-08): Initial release
  - Text message send/receive
  - Polling-based message fetch
  - Basic error handling
