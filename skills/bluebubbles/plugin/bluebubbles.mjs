/**
 * BlueBubbles Channel Plugin for Clawdbot
 * Provides iMessage integration through BlueBubbles server API
 * 
 * @see https://docs.bluebubbles.app/server/api/
 */

export const id = 'bluebubbles';
export const name = 'BlueBubbles';
export const capabilities = { inlineButtons: false };

let state = {
  serverUrl: '',
  password: '',
  pollIntervalMs: 5000,
  lastMessageDate: Date.now(),
  polling: false,
  pollTimer: null
};

/**
 * Initialize the plugin with configuration
 */
export async function init(config, context) {
  state.serverUrl = config.serverUrl?.replace(/\/$/, '');
  state.password = config.password;
  state.pollIntervalMs = config.pollIntervalMs || 5000;
  
  if (!state.serverUrl || !state.password) {
    throw new Error('BlueBubbles: serverUrl and password are required');
  }

  // Test connection
  try {
    const pingUrl = `${state.serverUrl}/api/v1/ping`;
    const response = await fetch(pingUrl, {
      headers: { 'Authorization': `Bearer ${state.password}` }
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    if (data.status !== 200) {
      throw new Error(`Ping failed: ${data.message || 'Unknown error'}`);
    }
    
    context.log('info', `BlueBubbles connected to ${state.serverUrl}`);
  } catch (error) {
    throw new Error(`BlueBubbles connection failed: ${error.message}`);
  }

  // Start polling for new messages
  startPolling(context);
}

/**
 * Send a message through BlueBubbles
 */
export async function send(message) {
  const { to, text, replyTo } = message;
  
  if (!to) {
    throw new Error('BlueBubbles: "to" (chat GUID) is required');
  }

  const sendUrl = `${state.serverUrl}/api/v1/message/text`;
  const payload = {
    chatGuid: to,
    message: text || '',
    method: 'private-api'
  };

  // Add reply reference if provided
  if (replyTo) {
    payload.selectedMessageGuid = replyTo;
  }

  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.status !== 200) {
      throw new Error(result.message || 'Send failed');
    }

    return {
      messageId: result.data?.guid || `${Date.now()}`,
      success: true
    };
  } catch (error) {
    throw new Error(`BlueBubbles send failed: ${error.message}`);
  }
}

/**
 * Start polling for new messages
 */
function startPolling(context) {
  if (state.polling) return;
  
  state.polling = true;
  
  const poll = async () => {
    try {
      const messages = await fetchNewMessages(context);
      
      for (const msg of messages) {
        context.handleInbound({
          from: msg.from,
          text: msg.text,
          chatId: msg.chatGuid,
          messageId: msg.guid,
          timestamp: msg.dateCreated,
          raw: msg
        });
      }
      
      if (messages.length > 0) {
        state.lastMessageDate = Math.max(...messages.map(m => m.dateCreated));
      }
    } catch (error) {
      context.log('error', `BlueBubbles poll error: ${error.message}`);
    }
    
    if (state.polling) {
      state.pollTimer = setTimeout(poll, state.pollIntervalMs);
    }
  };
  
  poll();
}

/**
 * Fetch new messages since last poll
 */
async function fetchNewMessages(context) {
  const messagesUrl = `${state.serverUrl}/api/v1/message/query`;
  
  const query = {
    with: ['chat', 'handle'],
    after: state.lastMessageDate,
    sort: 'ASC',
    limit: 100
  };

  try {
    const response = await fetch(messagesUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.password}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status !== 200) {
      throw new Error(result.message || 'Query failed');
    }

    const messages = result.data || [];
    
    // Filter out messages from self and empty messages
    return messages
      .filter(msg => !msg.isFromMe && msg.text)
      .map(msg => ({
        guid: msg.guid,
        text: msg.text,
        dateCreated: msg.dateCreated,
        chatGuid: msg.chats?.[0]?.guid || 'unknown',
        from: msg.handle?.id || 'unknown',
        isFromMe: msg.isFromMe,
        raw: msg
      }));
  } catch (error) {
    context.log('error', `BlueBubbles fetch error: ${error.message}`);
    return [];
  }
}

/**
 * Clean up on plugin shutdown
 */
export async function cleanup() {
  state.polling = false;
  if (state.pollTimer) {
    clearTimeout(state.pollTimer);
    state.pollTimer = null;
  }
}
