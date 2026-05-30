// ============================================================
// Alisha Local - Zustand Store
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppSettings,
  ChatMessage,
  MemoryEntry,
  AIProviderMode,
  TTSLanguage,
  LocationData,
  DeviceState,
} from '@/types';

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateAISettings: (partial: Partial<AppSettings['ai']>) => void;
  updateTTSSettings: (partial: Partial<AppSettings['tts']>) => void;
  updateGitHubSettings: (partial: Partial<AppSettings['github']>) => void;
  setAIProviderMode: (mode: AIProviderMode) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;

  // Memory
  memories: MemoryEntry[];
  addMemory: (memory: MemoryEntry) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;

  // Location
  currentLocation: LocationData | null;
  setCurrentLocation: (loc: LocationData | null) => void;

  // Device
  deviceState: DeviceState;
  updateDeviceState: (partial: Partial<DeviceState>) => void;

  // UI
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  activeTab: 'chat' | 'github' | 'location' | 'memory' | 'search';
  setActiveTab: (tab: 'chat' | 'github' | 'location' | 'memory' | 'search') => void;
}

const defaultSettings: AppSettings = {
  ai: {
    mode: 'external',
    localModelUrl: 'http://127.0.0.1:8080',
    localModelName: 'llama-3.2-1b',
    externalApiUrl: 'https://api.openai.com/v1',
    externalApiKey: '',
    externalModelName: 'gpt-3.5-turbo',
    huggingFaceToken: '',
    systemPrompt: 'أنتِ أليشا، مساعدة ذكية ودودة. تجيبين باللغة العربية بشكل افتراضي، ويمكنك التحدث بالإنجليزية واليابانية أيضاً. أنتِ مفيدة، مبدعة، وذكية.',
    temperature: 0.7,
    maxTokens: 2048,
  },
  tts: {
    language: 'ar',
    rate: 1.0,
    pitch: 1.1,
    volume: 1.0,
    voiceName: '',
  },
  github: {
    token: '',
    username: 'magengillan00-lgtm',
    defaultBranch: 'main',
  },
  selectedLocationProvider: 'gps',
  theme: 'dark',
  language: 'ar',
  voiceOnlyMode: true,
  enableLipSync: true,
  enableMemory: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      updateAISettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ai: { ...state.settings.ai, ...partial } },
        })),
      updateTTSSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, tts: { ...state.settings.tts, ...partial } },
        })),
      updateGitHubSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, github: { ...state.settings.github, ...partial } },
        })),
      setAIProviderMode: (mode) =>
        set((state) => ({
          settings: { ...state.settings, ai: { ...state.settings.ai, mode } },
        })),

      // Chat
      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),
      isGenerating: false,
      setIsGenerating: (val) => set({ isGenerating: val }),

      // Memory
      memories: [],
      addMemory: (memory) =>
        set((state) => ({ memories: [...state.memories, memory] })),
      removeMemory: (id) =>
        set((state) => ({ memories: state.memories.filter((m) => m.id !== id) })),
      clearMemories: () => set({ memories: [] }),

      // Location
      currentLocation: null,
      setCurrentLocation: (loc) => set({ currentLocation: loc }),

      // Device
      deviceState: {
        flashlightOn: false,
        batteryLevel: null,
        isCharging: null,
        networkStatus: 'unknown',
        vibrationAvailable: true,
      },
      updateDeviceState: (partial) =>
        set((state) => ({
          deviceState: { ...state.deviceState, ...partial },
        })),

      // UI
      showSettings: false,
      setShowSettings: (val) => set({ showSettings: val }),
      activeTab: 'chat',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'alisha-local-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        settings: state.settings,
        memories: state.memories,
        messages: state.messages.slice(-50), // Keep last 50 messages
      }),
    }
  )
);
