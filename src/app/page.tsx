'use client';

// ============================================================
// Alisha Local - Main Page
// ============================================================
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import Live2DAvatar from '@/components/Live2DAvatar';
import ChatInterface from '@/components/ChatInterface';
import SettingsPanel from '@/components/SettingsPanel';
import LocationPanel from '@/components/LocationPanel';
import GitHubPanel from '@/components/GitHubPanel';
import MemoryPanel from '@/components/MemoryPanel';
import SearchPanel from '@/components/SearchPanel';

export default function HomePage() {
  const [mouthValue, setMouthValue] = useState(0);
  const showSettings = useAppStore((s) => s.showSettings);
  const setShowSettings = useAppStore((s) => s.setShowSettings);
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const settings = useAppStore((s) => s.settings);

  return (
    <div className="h-full flex flex-col safe-top safe-bottom">
      {/* Status Bar */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Alisha Local</h1>
            <div className="flex items-center gap-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  settings.ai.mode === 'local' ? 'bg-green-400' : 'bg-purple-400'
                }`}
              />
              <span className="text-[10px] text-slate-400">
                {settings.ai.mode === 'local' ? 'AI محلي' : 'API خارجي'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showSettings ? (
          <div className="flex-1 overflow-hidden">
            <SettingsPanel />
          </div>
        ) : (
          <>
            {/* Avatar Section */}
            {activeTab === 'chat' && (
              <div className="h-[40%] min-h-[200px] max-h-[350px] relative bg-gradient-to-b from-slate-800 to-slate-900">
                <Live2DAvatar
                  mouthValue={mouthValue}
                  className="w-full h-full"
                />
                {/* Glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent" />
              </div>
            )}

            {/* Panel Content */}
            <div className="flex-1 min-h-0">
              {activeTab === 'chat' && <ChatInterface onMouthValue={setMouthValue} />}
              {activeTab === 'search' && <SearchPanel />}
              {activeTab === 'github' && <GitHubPanel />}
              {activeTab === 'location' && <LocationPanel />}
              {activeTab === 'memory' && <MemoryPanel />}
            </div>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {!showSettings && (
        <nav className="bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 px-1 py-1 flex items-center justify-around safe-bottom">
          {[
            { id: 'chat' as const, icon: '💬', label: 'دردشة' },
            { id: 'search' as const, icon: '🔍', label: 'بحث' },
            { id: 'github' as const, icon: '💻', label: 'GitHub' },
            { id: 'location' as const, icon: '📍', label: 'موقع' },
            { id: 'memory' as const, icon: '🧠', label: 'ذاكرة' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
