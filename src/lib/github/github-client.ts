// ============================================================
// Alisha Local - GitHub Client
// ============================================================
import type { GitHubConfig, GitHubRepo, GitHubFile } from '@/types';

const GITHUB_API = 'https://api.github.com';

class GitHubClient {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private async request(endpoint: string, options?: RequestInit) {
    const url = `${GITHUB_API}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options?.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `GitHub API Error (${response.status}): ${error.message || response.statusText}`
      );
    }

    if (response.status === 204) return null;
    return response.json();
  }

  // --- User ---
  async getCurrentUser() {
    return this.request('/user');
  }

  // --- Repositories ---
  async listRepos(page = 1, perPage = 30): Promise<GitHubRepo[]> {
    return this.request(`/user/repos?page=${page}&per_page=${perPage}&sort=updated`);
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request(`/repos/${owner}/${repo}`);
  }

  async createRepo(name: string, description?: string, isPrivate = false): Promise<GitHubRepo> {
    return this.request('/user/repos', {
      method: 'POST',
      body: JSON.stringify({ name, description, private: isPrivate, auto_init: true }),
    });
  }

  async deleteRepo(owner: string, repo: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}`, { method: 'DELETE' });
  }

  // --- Files ---
  async listFiles(owner: string, repo: string, path: string = '', branch?: string): Promise<GitHubFile[]> {
    const ref = branch || this.config.defaultBranch;
    return this.request(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
  }

  async getFileContent(owner: string, repo: string, path: string, branch?: string): Promise<string> {
    const ref = branch || this.config.defaultBranch;
    const data = await this.request(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`);
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\n/g, ''));
    }
    return data.content;
  }

  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch?: string
  ): Promise<unknown> {
    const ref = branch || this.config.defaultBranch;
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        branch: ref,
      }),
    });
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch?: string
  ): Promise<unknown> {
    const ref = branch || this.config.defaultBranch;
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: btoa(unescape(encodeURIComponent(content))),
        sha,
        branch: ref,
      }),
    });
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ): Promise<unknown> {
    const ref = branch || this.config.defaultBranch;
    return this.request(`/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      body: JSON.stringify({ message, sha, branch: ref }),
    });
  }

  // --- Issues ---
  async listIssues(owner: string, repo: string, state = 'open') {
    return this.request(`/repos/${owner}/${repo}/issues?state=${state}`);
  }

  async createIssue(owner: string, repo: string, title: string, body: string) {
    return this.request(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body }),
    });
  }

  // --- Pull Requests ---
  async listPRs(owner: string, repo: string, state = 'open') {
    return this.request(`/repos/${owner}/${repo}/pulls?state=${state}`);
  }

  async createPR(
    owner: string,
    repo: string,
    title: string,
    body: string,
    head: string,
    base: string
  ) {
    return this.request(`/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, body, head, base }),
    });
  }

  // --- Branches ---
  async listBranches(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}/branches`);
  }

  async createBranch(owner: string, repo: string, branch: string, fromBranch?: string) {
    const from = fromBranch || this.config.defaultBranch;
    // Get SHA of the source branch
    const ref = await this.request(`/repos/${owner}/${repo}/git/ref/heads/${from}`);
    const sha = ref.object.sha;
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha }),
    });
  }

  // --- Releases ---
  async listReleases(owner: string, repo: string) {
    return this.request(`/repos/${owner}/${repo}/releases`);
  }

  async createRelease(
    owner: string,
    repo: string,
    tagName: string,
    name: string,
    body: string,
    draft = false
  ) {
    return this.request(`/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      body: JSON.stringify({
        tag_name: tagName,
        name,
        body,
        draft,
        target_commitish: this.config.defaultBranch,
      }),
    });
  }

  async uploadReleaseAsset(
    uploadUrl: string,
    filePath: string,
    fileName: string,
    fileContent: ArrayBuffer
  ): Promise<unknown> {
    const url = uploadUrl.replace(/\{.*\}/, '') + `?name=${fileName}`;
    return fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.token}`,
        'Content-Type': 'application/octet-stream',
      },
      body: fileContent,
    }).then((r) => r.json());
  }
}

// Factory
export function createGitHubClient(config: GitHubConfig): GitHubClient {
  return new GitHubClient(config);
}

export { GitHubClient };
