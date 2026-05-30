// ============================================================
// Alisha Local - Type Definitions
// ============================================================

// --- AI Provider Types ---
export type AIProviderMode = 'local' | 'external';

export interface AIConfig {
  mode: AIProviderMode;
  localModelUrl: string;
  localModelName: string;
  externalApiUrl: string;
  externalApiKey: string;
  externalModelName: string;
  huggingFaceToken: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  voiceUrl?: string;
}

export interface AIResponse {
  content: string;
  provider: AIProviderMode;
  model: string;
  tokens?: number;
}

// --- TTS Types ---
export type TTSLanguage = 'ar' | 'en' | 'ja';

export interface TTSConfig {
  language: TTSLanguage;
  rate: number;
  pitch: number;
  volume: number;
  voiceName: string;
}

// --- Location Types ---
export interface LocationProvider {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  accuracy: 'high' | 'medium' | 'low';
  requiresApiKey: boolean;
  apiKeyName?: string;
  website: string;
  enabled: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  provider: string;
  timestamp: number;
}

// --- GitHub Types ---
export interface GitHubConfig {
  token: string;
  username: string;
  defaultBranch: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  updated_at: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url: string | null;
}

// --- Agent Types ---
export interface AgentAction {
  tool: string;
  parameters: Record<string, unknown>;
  result?: unknown;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  execute: (params: Record<string, unknown>, context?: unknown) => Promise<unknown>;
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
}

// --- Memory Types ---
export interface MemoryEntry {
  id: string;
  category: 'conversation' | 'preference' | 'fact' | 'instruction';
  content: string;
  timestamp: number;
  relevance: number;
}

// --- App Settings ---
export interface AppSettings {
  ai: AIConfig;
  tts: TTSConfig;
  github: GitHubConfig;
  selectedLocationProvider: string;
  theme: 'dark' | 'light';
  language: 'ar' | 'en' | 'ja';
  voiceOnlyMode: boolean;
  enableLipSync: boolean;
  enableMemory: boolean;
}

// --- Search Types ---
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// --- Device Control Types ---
export interface DeviceState {
  flashlightOn: boolean;
  batteryLevel: number | null;
  isCharging: boolean | null;
  networkStatus: string;
  vibrationAvailable: boolean;
}
