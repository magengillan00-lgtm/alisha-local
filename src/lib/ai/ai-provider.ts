// ============================================================
// Alisha Local - Unified AI Provider
// ============================================================
import type { AIConfig, AIResponse, ChatMessage } from '@/types';
import { queryExternalAPI, queryExternalAPIStream } from './external-api';
import { queryLocalAI } from './local-ai';

export type AIProviderEngine = {
  query: (config: AIConfig, messages: ChatMessage[]) => Promise<AIResponse>;
  queryStream?: (
    config: AIConfig,
    messages: ChatMessage[],
    onChunk: (text: string) => void
  ) => Promise<AIResponse>;
};

const externalProvider: AIProviderEngine = {
  query: queryExternalAPI,
  queryStream: queryExternalAPIStream,
};

const localProvider: AIProviderEngine = {
  query: queryLocalAI,
  // No streaming for local (HuggingFace) provider
};

export function getAIProvider(mode: 'local' | 'external'): AIProviderEngine {
  return mode === 'local' ? localProvider : externalProvider;
}

export async function queryAI(
  config: AIConfig,
  messages: ChatMessage[],
  onChunk?: (text: string) => void
): Promise<AIResponse> {
  const provider = getAIProvider(config.mode);

  if (onChunk && provider.queryStream) {
    return provider.queryStream(config, messages, onChunk);
  }

  return provider.query(config, messages);
}

// Available models for each provider
export const LOCAL_MODELS = [
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', size: '1.2 GB' },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', size: '3.2 GB' },
  { id: 'phi-3-mini', name: 'Phi-3 Mini 4K', size: '3.8 GB' },
  { id: 'mistral-7b', name: 'Mistral 7B v0.3', size: '7.2 GB' },
  { id: 'qwen-2.5-1.5b', name: 'Qwen 2.5 1.5B', size: '1.5 GB' },
  { id: 'gemma-2-2b', name: 'Gemma 2 2B', size: '2.0 GB' },
];

export const EXTERNAL_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', url: 'https://api.openai.com/v1', defaultModel: 'gpt-3.5-turbo' },
  { id: 'groq', name: 'Groq', url: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.2-1b-preview' },
  { id: 'together', name: 'Together AI', url: 'https://api.together.xyz/v1', defaultModel: 'meta-llama/Llama-3.2-3B-Instruct-Turbo' },
  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', defaultModel: 'meta-llama/llama-3.2-3b-instruct:free' },
  { id: 'deepinfra', name: 'DeepInfra', url: 'https://api.deepinfra.com/v1/openai', defaultModel: 'meta-llama/Meta-Llama-3.2-3B-Instruct' },
  { id: 'custom', name: 'مخصص (Custom)', url: '', defaultModel: '' },
];
