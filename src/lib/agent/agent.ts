// ============================================================
// Alisha Local - AI Agent with Tools
// ============================================================
import type { AgentTool, ChatMessage } from '@/types';
import { searchDuckDuckGo, formatSearchResults } from '@/lib/search/duckduckgo';
import { getGPSLocation, reverseGeocodeOSM, geocodeOSM } from '@/lib/location/providers';
import { getMemoryStore } from '@/lib/memory/memory-store';
import { createGitHubClient } from '@/lib/github/github-client';
import type { GitHubConfig } from '@/types';

// Define all agent tools
export const agentTools: AgentTool[] = [
  {
    name: 'web_search',
    description: 'Search the web using DuckDuckGo. Returns search results for a query.',
    parameters: {
      query: { type: 'string', description: 'The search query', required: true },
    },
    execute: async (params) => {
      const results = await searchDuckDuckGo(params.query as string);
      return formatSearchResults(results);
    },
  },
  {
    name: 'get_location',
    description: 'Get the current GPS location of the device.',
    parameters: {},
    execute: async () => {
      const loc = await getGPSLocation();
      const address = await reverseGeocodeOSM(loc.latitude, loc.longitude);
      return `الموقع الحالي: ${loc.latitude}, ${loc.longitude}\nالعنوان: ${address}\nالدقة: ${loc.accuracy}m`;
    },
  },
  {
    name: 'search_location',
    description: 'Search for a location by name and get coordinates.',
    parameters: {
      query: { type: 'string', description: 'Location name to search for', required: true },
    },
    execute: async (params) => {
      const results = await geocodeOSM(params.query as string);
      return results
        .map((r) => `${r.display} (${r.lat}, ${r.lon})`)
        .join('\n');
    },
  },
  {
    name: 'save_memory',
    description: 'Save important information to permanent memory.',
    parameters: {
      category: { type: 'string', description: 'Category: conversation, preference, fact, instruction', required: true },
      content: { type: 'string', description: 'The content to remember', required: true },
    },
    execute: async (params) => {
      const store = getMemoryStore();
      const entry = store.add(
        params.category as 'conversation' | 'preference' | 'fact' | 'instruction',
        params.content as string
      );
      return `تم الحفظ في الذاكرة: ${entry.content}`;
    },
  },
  {
    name: 'recall_memory',
    description: 'Search permanent memory for relevant information.',
    parameters: {
      query: { type: 'string', description: 'What to recall', required: true },
    },
    execute: async (params) => {
      const store = getMemoryStore();
      const results = store.getRelevant(params.query as string);
      if (results.length === 0) return 'لا توجد ذكريات متعلقة.';
      return results.map((r) => `[${r.category}] ${r.content}`).join('\n');
    },
  },
  {
    name: 'github_list_repos',
    description: 'List the user GitHub repositories.',
    parameters: {},
    execute: async (_params, context) => {
      const gh = createGitHubClient((context as { github: GitHubConfig }).github);
      const repos = await gh.listRepos();
      return repos.map((r) => `${r.name} (${r.private ? 'خاص' : 'عام'}) - ${r.html_url}`).join('\n');
    },
  },
  {
    name: 'github_create_file',
    description: 'Create or update a file in a GitHub repository.',
    parameters: {
      owner: { type: 'string', description: 'Repository owner', required: true },
      repo: { type: 'string', description: 'Repository name', required: true },
      path: { type: 'string', description: 'File path in repo', required: true },
      content: { type: 'string', description: 'File content', required: true },
      message: { type: 'string', description: 'Commit message', required: true },
    },
    execute: async (params, context) => {
      const gh = createGitHubClient((context as { github: GitHubConfig }).github);
      await gh.createFile(
        params.owner as string,
        params.repo as string,
        params.path as string,
        params.content as string,
        params.message as string
      );
      return `تم إنشاء/تحديث الملف: ${params.path}`;
    },
  },
  {
    name: 'github_create_issue',
    description: 'Create a new issue in a GitHub repository.',
    parameters: {
      owner: { type: 'string', description: 'Repository owner', required: true },
      repo: { type: 'string', description: 'Repository name', required: true },
      title: { type: 'string', description: 'Issue title', required: true },
      body: { type: 'string', description: 'Issue body', required: true },
    },
    execute: async (params, context) => {
      const gh = createGitHubClient((context as { github: GitHubConfig }).github);
      const issue = await gh.createIssue(
        params.owner as string,
        params.repo as string,
        params.title as string,
        params.body as string
      );
      return `تم إنشاء المشكلة: #${issue.number} - ${issue.html_url}`;
    },
  },
  {
    name: 'calculate',
    description: 'Evaluate a mathematical expression.',
    parameters: {
      expression: { type: 'string', description: 'Math expression to evaluate', required: true },
    },
    execute: async (params) => {
      try {
        // Safe eval using Function constructor (limited scope)
        const expr = (params.expression as string).replace(/[^0-9+\-*/().%\s]/g, '');
        const result = new Function(`return ${expr}`)();
        return `النتيجة: ${result}`;
      } catch {
        return 'خطأ في حساب التعبير الرياضي.';
      }
    },
  },
  {
    name: 'get_time',
    description: 'Get the current date and time.',
    parameters: {
      timezone: { type: 'string', description: 'Timezone (e.g. Africa/Khartoum)', required: false },
    },
    execute: async (params) => {
      const tz = (params.timezone as string) || 'Africa/Khartoum';
      const now = new Date();
      const formatted = now.toLocaleString('ar-SA', { timeZone: tz, dateStyle: 'full', timeStyle: 'long' });
      return `الوقت الحالي (${tz}): ${formatted}`;
    },
  },
];

// Tool execution context
export interface ToolContext {
  github: GitHubConfig;
  messages: ChatMessage[];
}

// Parse AI response for tool calls
export function parseToolCalls(response: string): Array<{ tool: string; parameters: Record<string, unknown> }> {
  const toolCalls: Array<{ tool: string; parameters: Record<string, unknown> }> = [];
  
  // Look for tool call patterns in the response
  const toolRegex = /\[TOOL:(\w+)(?::(.+?))?\]/g;
  let match;
  
  while ((match = toolRegex.exec(response)) !== null) {
    const toolName = match[1];
    let params: Record<string, unknown> = {};
    
    if (match[2]) {
      try {
        params = JSON.parse(match[2]);
      } catch {
        params = { query: match[2] };
      }
    }
    
    toolCalls.push({ tool: toolName, parameters: params });
  }
  
  return toolCalls;
}

// Execute a tool by name
export async function executeTool(
  toolName: string,
  parameters: Record<string, unknown>,
  context: ToolContext
): Promise<unknown> {
  const tool = agentTools.find((t) => t.name === toolName);
  if (!tool) {
    return `أداة غير معروفة: ${toolName}`;
  }
  
  try {
    return await tool.execute(parameters, context);
  } catch (error) {
    return `خطأ في تنفيذ الأداة ${toolName}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`;
  }
}

// Get tool descriptions for system prompt
export function getToolDescriptions(): string {
  return agentTools
    .map((t) => {
      const params = Object.entries(t.parameters)
        .map(([k, v]) => `${k}: ${v.description}${v.required ? ' (مطلوب)' : ''}`)
        .join(', ');
      return `- ${t.name}: ${t.description}${params ? ` | المعاملات: ${params}` : ''}`;
    })
    .join('\n');
}
