// ============================================================
// Alisha Local - Local AI Provider (HuggingFace Inference API)
// ============================================================
import type { AIConfig, AIResponse, ChatMessage } from '@/types';

export async function queryLocalAI(
  config: AIConfig,
  messages: ChatMessage[]
): Promise<AIResponse> {
  const { huggingFaceToken, localModelName, temperature, maxTokens } = config;

  if (!huggingFaceToken) {
    throw new Error('رمز HuggingFace غير مُعد. يرجى إدخاله في الإعدادات.');
  }

  // Use HuggingFace Inference API as the "local" AI provider
  const modelId = getLocalModelId(localModelName);
  const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

  // Format messages for the model
  const prompt = formatChatPrompt(messages);
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${huggingFaceToken}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature,
        max_new_tokens: maxTokens,
        return_full_text: false,
        do_sample: true,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 503) {
      throw new Error('النموذج قيد التحميل. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.');
    }
    throw new Error(
      `خطأ في HuggingFace API (${response.status}): ${errorData.error || response.statusText}`
    );
  }

  const data = await response.json();
  const content = Array.isArray(data)
    ? data[0]?.generated_text || ''
    : data.generated_text || '';

  return {
    content: cleanGeneratedText(content, prompt),
    provider: 'local',
    model: localModelName,
  };
}

function getLocalModelId(name: string): string {
  const modelMap: Record<string, string> = {
    'llama-3.2-1b': 'meta-llama/Llama-3.2-1B-Instruct',
    'llama-3.2-3b': 'meta-llama/Llama-3.2-3B-Instruct',
    'phi-3-mini': 'microsoft/Phi-3-mini-4k-instruct',
    'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3',
    'qwen-2.5-1.5b': 'Qwen/Qwen2.5-1.5B-Instruct',
    'gemma-2-2b': 'google/gemma-2-2b-it',
  };
  return modelMap[name] || 'meta-llama/Llama-3.2-1B-Instruct';
}

function formatChatPrompt(messages: ChatMessage[]): string {
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `<|system|>\n${msg.content}</s>\n`;
    } else if (msg.role === 'user') {
      prompt += `<|user|>\n${msg.content}</s>\n`;
    } else if (msg.role === 'assistant') {
      prompt += `<|assistant|\n${msg.content}</s>\n`;
    }
  }
  prompt += '<|assistant|\\n';
  return prompt;
}

function cleanGeneratedText(text: string, _prompt: string): string {
  // Remove any remaining special tokens
  return text
    .replace(/<\|[^|]+\|>/g, '')
    .replace(/<\/s>/g, '')
    .trim();
}
