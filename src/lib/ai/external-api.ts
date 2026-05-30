// ============================================================
// Alisha Local - External API Provider (OpenAI-compatible)
// ============================================================
import type { AIConfig, AIResponse, ChatMessage } from '@/types';

export async function queryExternalAPI(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<AIResponse> {
  const { externalApiUrl, externalApiKey, externalModelName, temperature, maxTokens } = config;

  if (!externalApiKey) {
    throw new Error('مفتاح API الخارجي غير مُعد. يرجى إدخاله في الإعدادات.');
  }

  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch(`${externalApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${externalApiKey}`,
    },
    body: JSON.stringify({
      model: externalModelName,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `خطأ في API الخارجي (${response.status}): ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    provider: 'external',
    model: externalModelName,
    tokens: data.usage?.total_tokens,
  };
}

export async function queryExternalAPIStream(
  config: AIConfig,
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<AIResponse> {
  const { externalApiUrl, externalApiKey, externalModelName, temperature, maxTokens } = config;

  if (!externalApiKey) {
    throw new Error('مفتاح API الخارجي غير مُعد. يرجى إدخاله في الإعدادات.');
  }

  const apiMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch(`${externalApiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${externalApiKey}`,
    },
    body: JSON.stringify({
      model: externalModelName,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `خطأ في API الخارجي (${response.status}): ${errorData.error?.message || response.statusText}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('فشل في قراءة الاستجابة');

  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullContent += delta;
          onChunk(delta);
        }
      } catch {
        // Skip invalid JSON chunks
      }
    }
  }

  return {
    content: fullContent,
    provider: 'external',
    model: externalModelName,
  };
}
