import i18n from 'i18next';

const N8N_AI_ASSISTANT_WEBHOOK_URL = import.meta.env.VITE_N8N_AI_ASSISTANT_WEBHOOK_URL || 'https://deepanshu1997.app.n8n.cloud/webhook/chat-assistant';

export interface ChatMessagePayload {
  message: string;
  language: string;
}

/**
 * Sends the user message and current language code to the n8n AI webhook.
 */
export async function sendChatMessage(message: string, language?: string): Promise<string> {
  const currentLang = language || i18n.language || 'en';
  const payload: ChatMessagePayload = {
    message,
    language: currentLang
  };

  try {
    const response = await fetch(N8N_AI_ASSISTANT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Server returned error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    let replyText = '';

    // Handle string responses or diverse JSON outputs returned by n8n workflows
    if (typeof data === 'string') {
      replyText = data;
    } else if (data && typeof data === 'object') {
      if (data.output) replyText = data.output;
      else if (data.response) replyText = data.response;
      else if (data.text) replyText = data.text;
      else if (data.message) replyText = data.message;
      else if (data.reply) replyText = data.reply;
      else if (Array.isArray(data) && data[0]) {
        const item = data[0];
        if (typeof item === 'string') replyText = item;
        else if (item.output) replyText = item.output;
        else if (item.response) replyText = item.response;
        else if (item.text) replyText = item.text;
        else if (item.message) replyText = item.message;
        else if (item.reply) replyText = item.reply;
      }
    }

    if (!replyText) {
      // Fallback if no expected keys match, stringify the raw object or return a default response
      replyText = data.text || JSON.stringify(data) || 'No text response returned by the assistant.';
    }

    return replyText;
  } catch (error: any) {
    console.error('Error communicating with n8n AI Webhook:', error);
    if (error.message && error.message.includes('fetch')) {
      throw new Error('Network error. Please verify your connection to the AI server.');
    }
    throw error;
  }
}
