'use client';

// ============================================================
// Alisha Local - Chat Interface Component
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { queryAI } from '@/lib/ai/ai-provider';
import { getTTSEngine } from '@/lib/tts/tts-engine';
import { getMemoryStore } from '@/lib/memory/memory-store';
import { parseToolCalls, executeTool, getToolDescriptions, type ToolContext } from '@/lib/agent/agent';
import { v4 as uuidv4 } from 'uuid';
import type { ChatMessage } from '@/types';

export default function ChatInterface({ onMouthValue }: { onMouthValue?: (v: number) => void }) {
  const [input, setInput] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const settings = useAppStore((s) => s.settings);
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const isGenerating = useAppStore((s) => s.isGenerating);
  const setIsGenerating = useAppStore((s) => s.setIsGenerating);
  const voiceOnlyMode = useAppStore((s) => s.settings.voiceOnlyMode);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating) return;

    setInput('');
    setStreamingText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setIsGenerating(true);

    try {
      // Prepare messages with system prompt and memory context
      const memory = getMemoryStore();
      const memoryContext = memory.formatForContext(5);
      
      const toolDesc = getToolDescriptions();
      const systemContent = `${settings.ai.systemPrompt}\n\nأدوات متاحة (استخدم الصيغة [TOOL:tool_name:{"param":"value"}] لاستدعاء أداة):\n${toolDesc}${memoryContext ? '\n\n' + memoryContext : ''}`;

      const chatMessages: ChatMessage[] = [
        { id: 'system', role: 'system', content: systemContent, timestamp: Date.now() },
        ...messages.filter((m) => m.role !== 'system'),
        userMsg,
      ];

      // Query AI with streaming
      const onChunk = (chunk: string) => {
        setStreamingText((prev) => prev + chunk);
      };

      let response;
      try {
        response = await queryAI(settings.ai, chatMessages, onChunk);
      } catch {
        // Fallback without streaming
        response = await queryAI(settings.ai, chatMessages);
      }

      const content = response.content || streamingText || 'عذراً، لم أتمكن من الإجابة.';

      // Check for tool calls
      const toolCalls = parseToolCalls(content);
      let finalContent = content;

      if (toolCalls.length > 0) {
        const toolContext: ToolContext = {
          github: settings.github,
          messages: chatMessages,
        };

        const toolResults: string[] = [];
        for (const call of toolCalls) {
          const result = await executeTool(call.tool, call.parameters, toolContext);
          toolResults.push(`${call.tool}: ${result}`);
        }

        // If we have tool results, query again with the results
        if (toolResults.length > 0) {
          const toolResultContent = toolResults.join('\n');
          const followUpMessages: ChatMessage[] = [
            ...chatMessages,
            { id: uuidv4(), role: 'assistant', content: finalContent, timestamp: Date.now() },
            { id: uuidv4(), role: 'user', content: `نتائج الأدوات:\n${toolResultContent}\n\nبناءً على هذه النتائج، أجب على سؤالي الأصلي.`, timestamp: Date.now() },
          ];

          setStreamingText('');
          const followUp = await queryAI(settings.ai, followUpMessages);
          finalContent = followUp.content;
        }
      }

      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: finalContent,
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);

      // Save to memory if enabled
      if (settings.enableMemory) {
        const mem = getMemoryStore();
        mem.add('conversation', `المستخدم: ${text}`, 0.5);
        mem.add('conversation', `أليشا: ${finalContent.slice(0, 200)}`, 0.5);
      }

      // Speak the response using TTS
      if (voiceOnlyMode || true) {
        const tts = getTTSEngine();
        tts.setLipSyncCallback((v) => onMouthValue?.(v));
        tts.speak(finalContent, settings.tts, () => {
          onMouthValue?.(0);
        });
      }

      setStreamingText('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'حدث خطأ غير معروف';
      addMessage({
        id: uuidv4(),
        role: 'assistant',
        content: `خطأ: ${errorMsg}`,
        timestamp: Date.now(),
      });
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  }, [input, isGenerating, messages, settings, addMessage, setIsGenerating, voiceOnlyMode, onMouthValue, streamingText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-600">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 mt-16">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-lg font-semibold">أليشا جاهزة</p>
            <p className="text-sm mt-2">اكتب رسالتك أو اطلب مني أي شيء</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-bl-md'
                  : 'bg-slate-700 text-slate-100 rounded-br-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[10px] opacity-50 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {streamingText && (
          <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-slate-700 text-slate-100 text-sm leading-relaxed">
              <p className="whitespace-pre-wrap">{streamingText}</p>
              <span className="inline-block w-2 h-4 bg-slate-300 animate-pulse ml-1" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-700 bg-slate-800/80 backdrop-blur">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] max-h-[120px]"
            rows={1}
            dir="auto"
            disabled={isGenerating}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {isGenerating ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'إرسال'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
