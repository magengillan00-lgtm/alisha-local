// ============================================================
// Alisha Local - Memory Store (Persistent Local Storage)
// ============================================================
import type { MemoryEntry } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const MEMORY_KEY = 'alisha_memory_store';

class MemoryStore {
  private entries: MemoryEntry[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(MEMORY_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.error('Failed to save memory:', e);
    }
  }

  add(category: MemoryEntry['category'], content: string, relevance: number = 0.5): MemoryEntry {
    const entry: MemoryEntry = {
      id: uuidv4(),
      category,
      content,
      timestamp: Date.now(),
      relevance,
    };
    this.entries.push(entry);
    this.save();
    return entry;
  }

  remove(id: string): void {
    this.entries = this.entries.filter((e) => e.id !== id);
    this.save();
  }

  getAll(): MemoryEntry[] {
    return [...this.entries];
  }

  getByCategory(category: MemoryEntry['category']): MemoryEntry[] {
    return this.entries.filter((e) => e.category === category);
  }

  search(query: string, limit: number = 10): MemoryEntry[] {
    const lower = query.toLowerCase();
    return this.entries
      .filter((e) => e.content.toLowerCase().includes(lower))
      .sort((a, b) => b.relevance - a.relevance || b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getRelevant(query: string, limit: number = 5): MemoryEntry[] {
    // Simple relevance scoring based on word overlap
    const queryWords = query.toLowerCase().split(/\s+/);
    
    return this.entries
      .map((entry) => {
        const contentWords = entry.content.toLowerCase().split(/\s+/);
        const overlap = queryWords.filter((w) => contentWords.includes(w)).length;
        const score = overlap / Math.max(queryWords.length, 1);
        return { ...entry, relevance: score };
      })
      .filter((e) => e.relevance > 0.1)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  clear(): void {
    this.entries = [];
    this.save();
  }

  getStats(): { total: number; byCategory: Record<string, number> } {
    const byCategory: Record<string, number> = {};
    for (const entry of this.entries) {
      byCategory[entry.category] = (byCategory[entry.category] || 0) + 1;
    }
    return { total: this.entries.length, byCategory };
  }

  formatForContext(maxEntries: number = 10): string {
    const recent = this.entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxEntries);
    
    if (recent.length === 0) return '';
    
    return 'ذاكرة سابقة:\n' + recent
      .map((e) => `[${e.category}] ${e.content}`)
      .join('\n');
  }
}

let memoryInstance: MemoryStore | null = null;

export function getMemoryStore(): MemoryStore {
  if (!memoryInstance) {
    memoryInstance = new MemoryStore();
  }
  return memoryInstance;
}

export { MemoryStore };
