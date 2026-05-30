// ============================================================
// Alisha Local - DuckDuckGo Search
// ============================================================
import type { SearchResult } from '@/types';

const DDGS_API = 'https://api.duckduckgo.com/';
const HTML_SCRAPER = 'https://html.duckduckgo.com/html/';

export async function searchDuckDuckGo(query: string, maxResults: number = 8): Promise<SearchResult[]> {
  try {
    // Try the instant answer API first
    const instantUrl = `${DDGS_API}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(instantUrl);
    
    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    // Add abstract if available
    if (data.AbstractText) {
      results.push({
        title: data.AbstractSource || 'DuckDuckGo',
        url: data.AbstractURL || '',
        snippet: data.AbstractText,
      });
    }

    // Add related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, maxResults)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.slice(0, 60) + '...',
            url: topic.FirstURL,
            snippet: topic.Text,
          });
        }
      }
    }

    // If we got results, return them
    if (results.length > 0) {
      return results.slice(0, maxResults);
    }

    // Fallback: try the HTML endpoint for web results
    return await searchDDGHtml(query, maxResults);
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    // Final fallback
    return await searchDDGHtml(query, maxResults);
  }
}

async function searchDDGHtml(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const response = await fetch(HTML_SCRAPER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(query)}&b=`,
    });

    if (!response.ok) return [];

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse HTML results
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>(.*?)<\/a>/gi;

    const urls: { url: string; title: string }[] = [];
    let match;

    while ((match = resultRegex.exec(html)) !== null && urls.length < maxResults) {
      urls.push({
        url: match[1],
        title: match[2].replace(/<[^>]*>/g, '').trim(),
      });
    }

    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < maxResults) {
      snippets.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    for (let i = 0; i < urls.length; i++) {
      results.push({
        title: urls[i].title,
        url: urls[i].url,
        snippet: snippets[i] || '',
      });
    }

    return results;
  } catch {
    return [];
  }
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return 'لم أجد نتائج للبحث.';
  }

  return results
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.url}`)
    .join('\n\n');
}
