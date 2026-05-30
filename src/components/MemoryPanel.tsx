'use client';

// ============================================================
// Alisha Local - Memory Panel Component
// ============================================================
import React, { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getMemoryStore } from '@/lib/memory/memory-store';
import type { MemoryEntry } from '@/types';

export default function MemoryPanel() {
  const memories = useAppStore((s) => s.memories);
  const removeMemory = useAppStore((s) => s.removeMemory);
  const clearMemories = useAppStore((s) => s.clearMemories);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const memoryStore = getMemoryStore();
  const stats = memoryStore.getStats();

  const filteredMemories = memories
    .filter((m) => filterCategory === 'all' || m.category === filterCategory)
    .filter(
      (m) =>
        !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const categoryLabels: Record<string, string> = {
    conversation: 'محادثة',
    preference: 'تفضيل',
    fact: 'حقيقة',
    instruction: 'تعليمات',
  };

  const categoryColors: Record<string, string> = {
    conversation: 'bg-blue-500/20 text-blue-400',
    preference: 'bg-purple-500/20 text-purple-400',
    fact: 'bg-green-500/20 text-green-400',
    instruction: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-white">🧠 الذاكرة</h3>
          <button
            onClick={() => {
              if (confirm('هل تريد مسح جميع الذكريات؟')) {
                clearMemories();
                memoryStore.clear();
              }
            }}
            className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg px-3 py-1 transition-colors"
          >
            مسح الكل
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1 text-center mb-2">
          {Object.entries(stats.byCategory).map(([cat, count]) => (
            <div key={cat} className="bg-slate-700/50 rounded-lg p-1.5">
              <p className="text-xs font-bold text-white">{count}</p>
              <p className="text-[9px] text-slate-400">{categoryLabels[cat] || cat}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في الذاكرة..."
          className="w-full bg-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          dir="auto"
        />

        {/* Category Filter */}
        <div className="flex gap-1 mt-2 overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${
              filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}
          >
            الكل ({memories.length})
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterCategory(key)}
              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${
                filterCategory === key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredMemories.length === 0 && (
          <p className="text-center text-slate-500 text-xs mt-8">لا توجد ذكريات محفوظة</p>
        )}
        {filteredMemories.map((memory) => (
          <div key={memory.id} className="bg-slate-700/50 rounded-lg p-3 group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    categoryColors[memory.category] || 'bg-slate-500/20 text-slate-400'
                  }`}
                >
                  {categoryLabels[memory.category] || memory.category}
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">{memory.content}</p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(memory.timestamp).toLocaleString('ar')}
                </p>
              </div>
              <button
                onClick={() => {
                  removeMemory(memory.id);
                  memoryStore.remove(memory.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
