'use client';

// ============================================================
// Alisha Local - GitHub Panel Component
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { createGitHubClient } from '@/lib/github/github-client';
import type { GitHubRepo, GitHubFile } from '@/types';

export default function GitHubPanel() {
  const settings = useAppStore((s) => s.settings);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createModal, setCreateModal] = useState<'repo' | 'file' | 'issue' | null>(null);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDesc, setNewRepoDesc] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueBody, setNewIssueBody] = useState('');

  const gh = createGitHubClient(settings.github);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const repoList = await gh.listRepos();
      setRepos(repoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل المستودعات');
    } finally {
      setLoading(false);
    }
  }, [settings.github]);

  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  const loadFiles = useCallback(
    async (repoName: string, path: string = '') => {
      setLoading(true);
      setError('');
      try {
        const fileList = await gh.listFiles(settings.github.username, repoName, path);
        setFiles(fileList as GitHubFile[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تحميل الملفات');
      } finally {
        setLoading(false);
      }
    },
    [settings.github.username, gh]
  );

  const loadFileContent = useCallback(
    async (repoName: string, path: string) => {
      setLoading(true);
      setError('');
      try {
        const content = await gh.getFileContent(settings.github.username, repoName, path);
        setFileContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في تحميل محتوى الملف');
      } finally {
        setLoading(false);
      }
    },
    [settings.github.username, gh]
  );

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return;
    setLoading(true);
    try {
      await gh.createRepo(newRepoName, newRepoDesc, false);
      setCreateModal(null);
      setNewRepoName('');
      setNewRepoDesc('');
      loadRepos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء المستودع');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async () => {
    if (!selectedRepo || !newFilePath.trim()) return;
    setLoading(true);
    try {
      await gh.createFile(
        settings.github.username,
        selectedRepo,
        newFilePath,
        newFileContent,
        `Create ${newFilePath}`
      );
      setCreateModal(null);
      setNewFilePath('');
      setNewFileContent('');
      loadFiles(selectedRepo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء الملف');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    if (!selectedRepo || !newIssueTitle.trim()) return;
    setLoading(true);
    try {
      await gh.createIssue(settings.github.username, selectedRepo, newIssueTitle, newIssueBody);
      setCreateModal(null);
      setNewIssueTitle('');
      setNewIssueBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إنشاء المشكلة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">💻 GitHub</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCreateModal('repo')}
            className="text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 transition-colors"
          >
            + مستودع
          </button>
          {selectedRepo && (
            <>
              <button
                onClick={() => setCreateModal('file')}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                + ملف
              </button>
              <button
                onClick={() => setCreateModal('issue')}
                className="text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                + مشكلة
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-xs text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Back button */}
        {selectedRepo && (
          <button
            onClick={() => {
              setSelectedRepo(null);
              setFiles([]);
              setFileContent(null);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 mb-2"
          >
            ← العودة للمستودعات
          </button>
        )}

        {/* Repos List */}
        {!selectedRepo && !loading && (
          repos.map((repo) => (
            <button
              key={repo.id}
              onClick={() => {
                setSelectedRepo(repo.name);
                loadFiles(repo.name);
              }}
              className="w-full text-left bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{repo.private ? '🔒' : '📂'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{repo.name}</p>
                  <p className="text-xs text-slate-400 truncate">{repo.description || 'بدون وصف'}</p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(repo.updated_at).toLocaleDateString('ar')}
                </span>
              </div>
            </button>
          ))
        )}

        {/* Files List */}
        {selectedRepo && !fileContent && !loading && (
          files.map((file) => (
            <button
              key={file.path}
              onClick={() => {
                if (file.type === 'dir') {
                  loadFiles(selectedRepo, file.path);
                } else {
                  loadFileContent(selectedRepo, file.path);
                }
              }}
              className="w-full text-left bg-slate-700/50 hover:bg-slate-700 rounded-lg p-2.5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{file.type === 'dir' ? '📁' : '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{file.size} bytes</p>
                </div>
              </div>
            </button>
          ))
        )}

        {/* File Content */}
        {fileContent && (
          <div className="bg-slate-900 rounded-lg p-3">
            <button
              onClick={() => setFileContent(null)}
              className="text-xs text-blue-400 hover:text-blue-300 mb-2"
            >
              ← العودة للملفات
            </button>
            <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap font-mono" dir="ltr">
              {fileContent}
            </pre>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModal && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-4 w-full max-w-sm space-y-3" dir="rtl">
            <h4 className="font-bold text-white text-sm">
              {createModal === 'repo' ? 'إنشاء مستودع جديد' : createModal === 'file' ? 'إنشاء ملف جديد' : 'إنشاء مشكلة جديدة'}
            </h4>

            {createModal === 'repo' && (
              <>
                <input
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="اسم المستودع"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="ltr"
                />
                <input
                  type="text"
                  value={newRepoDesc}
                  onChange={(e) => setNewRepoDesc(e.target.value)}
                  placeholder="الوصف (اختياري)"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  dir="auto"
                />
              </>
            )}

            {createModal === 'file' && (
              <>
                <input
                  type="text"
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                  placeholder="مسار الملف (مثال: src/app.ts)"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  dir="ltr"
                />
                <textarea
                  value={newFileContent}
                  onChange={(e) => setNewFileContent(e.target.value)}
                  placeholder="محتوى الملف"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none font-mono"
                  dir="ltr"
                  rows={5}
                />
              </>
            )}

            {createModal === 'issue' && (
              <>
                <input
                  type="text"
                  value={newIssueTitle}
                  onChange={(e) => setNewIssueTitle(e.target.value)}
                  placeholder="عنوان المشكلة"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  dir="auto"
                />
                <textarea
                  value={newIssueBody}
                  onChange={(e) => setNewIssueBody(e.target.value)}
                  placeholder="وصف المشكلة"
                  className="w-full bg-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] resize-none"
                  dir="auto"
                  rows={4}
                />
              </>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (createModal === 'repo') handleCreateRepo();
                  else if (createModal === 'file') handleCreateFile();
                  else if (createModal === 'issue') handleCreateIssue();
                }}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                إنشاء
              </button>
              <button
                onClick={() => setCreateModal(null)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
