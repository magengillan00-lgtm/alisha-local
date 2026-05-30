'use client';

// ============================================================
// Alisha Local - Search Panel Component
// ============================================================
import React, { useState, useCallback } from 'react';
import { searchDuckDuckGo, formatSearchResults } from '@/lib/search/duckduckgo';
import type { SearchResult } from '@/types';

export default function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const searchResults = await searchDuckDuckGo(query);
      setResults(searchResults);
      if (searchResults.length === 0) {
        setError('لم يتم العثور على نتائج');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في البحث');
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Search Bar */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث في الويب..."
            className="flex-1 bg-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="auto"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? '🔍' : 'بحث'}
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {results.map((result, i) => (
          <a
            key={i}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-700/50 hover:bg-slate-700 rounded-xl p-3 transition-colors"
          >
            <p className="text-sm font-semibold text-blue-400 hover:text-blue-300 truncate">
              {result.title}
            </p>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{result.snippet}</p>
            <p className="text-[10px] text-slate-500 mt-1 truncate" dir="ltr">
              {result.url}
            </p>
          </a>
        ))}

        {results.length === 0 && !loading && !error && (
          <div className="text-center text-slate-500 mt-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">ابحث عن أي شيء في الويب</p>
          </div>
        )}
      </div>
    </div>
  );
}
