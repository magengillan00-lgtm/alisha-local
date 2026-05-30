'use client';

// ============================================================
// Alisha Local - Settings Panel Component
// ============================================================
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { LOCAL_MODELS, EXTERNAL_PROVIDERS } from '@/lib/ai/ai-provider';
import { LOCATION_PROVIDERS } from '@/lib/location/providers';
import type { AIProviderMode, TTSLanguage } from '@/types';

export default function SettingsPanel() {
  const settings = useAppStore((s) => s.settings);
  const updateAISettings = useAppStore((s) => s.updateAISettings);
  const updateTTSSettings = useAppStore((s) => s.updateTTSSettings);
  const updateGitHubSettings = useAppStore((s) => s.updateGitHubSettings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const setAIProviderMode = useAppStore((s) => s.setAIProviderMode);

  const [activeSection, setActiveSection] = useState<'ai' | 'tts' | 'location' | 'github' | 'general'>('ai');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGithubToken, setShowGithubToken] = useState(false);

  return (
    <div className="h-full flex flex-col bg-slate-800 text-white" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-lg font-bold">الإعدادات</h2>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-slate-700 overflow-x-auto">
        {(['ai', 'tts', 'location', 'github', 'general'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors ${
              activeSection === section
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {section === 'ai' && '🤖 الذكاء الاصطناعي'}
            {section === 'tts' && '🔊 الصوت'}
            {section === 'location' && '📍 الموقع'}
            {section === 'github' && '💻 GitHub'}
            {section === 'general' && '⚙️ عام'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* AI Settings */}
        {activeSection === 'ai' && (
          <div className="space-y-5">
            {/* Provider Mode Toggle */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-3">وضع الذكاء الاصطناعي</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAIProviderMode('local')}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    settings.ai.mode === 'local'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  🏠 AI محلي
                  <span className="block text-xs mt-1 opacity-75">HuggingFace Inference</span>
                </button>
                <button
                  onClick={() => setAIProviderMode('external')}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    settings.ai.mode === 'external'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                >
                  🌐 API خارجي
                  <span className="block text-xs mt-1 opacity-75">OpenAI-compatible</span>
                </button>
              </div>
            </div>

            {/* Local AI Settings */}
            {settings.ai.mode === 'local' && (
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold mb-2">رمز HuggingFace</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.ai.huggingFaceToken}
                      onChange={(e) => updateAISettings({ huggingFaceToken: e.target.value })}
                      className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="hf_..."
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      {showApiKey ? 'إخفاء' : 'إظهار'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold mb-2">النموذج المحلي</label>
                  <select
                    value={settings.ai.localModelName}
                    onChange={(e) => updateAISettings({ localModelName: e.target.value })}
                    className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {LOCAL_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.size})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* External API Settings */}
            {settings.ai.mode === 'external' && (
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold mb-2">مزود API</label>
                  <select
                    value={settings.ai.externalApiUrl}
                    onChange={(e) => {
                      const provider = EXTERNAL_PROVIDERS.find((p) => p.url === e.target.value);
                      updateAISettings({
                        externalApiUrl: e.target.value,
                        externalModelName: provider?.defaultModel || settings.ai.externalModelName,
                      });
                    }}
                    className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {EXTERNAL_PROVIDERS.map((p) => (
                      <option key={p.id} value={p.url}>
                        {p.name} {p.url ? `- ${p.url}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold mb-2">مفتاح API</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.ai.externalApiKey}
                      onChange={(e) => updateAISettings({ externalApiKey: e.target.value })}
                      className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="sk-..."
                      dir="ltr"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      {showApiKey ? 'إخفاء' : 'إظهار'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-xl p-4">
                  <label className="block text-sm font-semibold mb-2">اسم النموذج</label>
                  <input
                    type="text"
                    value={settings.ai.externalModelName}
                    onChange={(e) => updateAISettings({ externalModelName: e.target.value })}
                    className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="gpt-3.5-turbo"
                    dir="ltr"
                  />
                </div>

                {settings.ai.externalApiUrl === '' && (
                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <label className="block text-sm font-semibold mb-2">رابط API مخصص</label>
                    <input
                      type="url"
                      value={settings.ai.externalApiUrl}
                      onChange={(e) => updateAISettings({ externalApiUrl: e.target.value })}
                      className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://api.example.com/v1"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Common AI Settings */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">التعليمات النظامية</label>
              <textarea
                value={settings.ai.systemPrompt}
                onChange={(e) => updateAISettings({ systemPrompt: e.target.value })}
                className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                dir="auto"
                rows={4}
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">درجة الحرارة: {settings.ai.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.ai.temperature}
                onChange={(e) => updateAISettings({ temperature: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* TTS Settings */}
        {activeSection === 'tts' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">لغة الصوت</label>
              <div className="grid grid-cols-3 gap-2">
                {(['ar', 'en', 'ja'] as TTSLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateTTSSettings({ language: lang })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.tts.language === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : '日本語'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">السرعة: {settings.tts.rate.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.tts.rate}
                onChange={(e) => updateTTSSettings({ rate: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">النغمة: {settings.tts.pitch.toFixed(1)}</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.tts.pitch}
                onChange={(e) => updateTTSSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">مستوى الصوت: {Math.round(settings.tts.volume * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.tts.volume}
                onChange={(e) => updateTTSSettings({ volume: parseFloat(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
        )}

        {/* Location Providers */}
        {activeSection === 'location' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-2">اختر مزود خدمة الموقع:</p>
            {LOCATION_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                onClick={() => updateSettings({ selectedLocationProvider: provider.id })}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  settings.selectedLocationProvider === provider.id
                    ? 'bg-blue-600/30 border border-blue-500'
                    : 'bg-slate-700/50 border border-transparent hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{provider.nameAr}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          provider.accuracy === 'high'
                            ? 'bg-green-500/20 text-green-400'
                            : provider.accuracy === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {provider.accuracy === 'high'
                          ? 'دقة عالية'
                          : provider.accuracy === 'medium'
                          ? 'دقة متوسطة'
                          : 'دقة منخفضة'}
                      </span>
                      {provider.requiresApiKey && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                          يحتاج مفتاح
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{provider.descriptionAr}</p>
                  </div>
                  {settings.selectedLocationProvider === provider.id && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GitHub Settings */}
        {activeSection === 'github' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">رمز GitHub</label>
              <div className="relative">
                <input
                  type={showGithubToken ? 'text' : 'password'}
                  value={settings.github.token}
                  onChange={(e) => updateGitHubSettings({ token: e.target.value })}
                  className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="ghp_..."
                  dir="ltr"
                />
                <button
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  {showGithubToken ? 'إخفاء' : 'إظهار'}
                </button>
              </div>
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">اسم المستخدم</label>
              <input
                type="text"
                value={settings.github.username}
                onChange={(e) => updateGitHubSettings({ username: e.target.value })}
                className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="username"
                dir="ltr"
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">الفرع الافتراضي</label>
              <input
                type="text"
                value={settings.github.defaultBranch}
                onChange={(e) => updateGitHubSettings({ defaultBranch: e.target.value })}
                className="w-full bg-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold">وضع الصوت فقط</label>
                <p className="text-xs text-slate-400 mt-0.5">تشغيل الردود صوتياً تلقائياً</p>
              </div>
              <ToggleSwitch
                checked={settings.voiceOnlyMode}
                onChange={(val) => updateSettings({ voiceOnlyMode: val })}
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold">مزامنة الشفاه</label>
                <p className="text-xs text-slate-400 mt-0.5">تحريك فم الأفاتار مع الصوت</p>
              </div>
              <ToggleSwitch
                checked={settings.enableLipSync}
                onChange={(val) => updateSettings({ enableLipSync: val })}
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold">الذاكرة الدائمة</label>
                <p className="text-xs text-slate-400 mt-0.5">حفظ المحادثات والتفضيلات</p>
              </div>
              <ToggleSwitch
                checked={settings.enableMemory}
                onChange={(val) => updateSettings({ enableMemory: val })}
              />
            </div>

            <div className="bg-slate-700/50 rounded-xl p-4">
              <label className="block text-sm font-semibold mb-2">لغة الواجهة</label>
              <div className="grid grid-cols-3 gap-2">
                {(['ar', 'en', 'ja'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSettings({ language: lang })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.language === lang
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                  >
                    {lang === 'ar' ? 'العربية' : lang === 'en' ? 'English' : '日本語'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-slate-500'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
