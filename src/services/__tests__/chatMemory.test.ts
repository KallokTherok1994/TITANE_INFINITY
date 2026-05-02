/**
 * TITANE∞ — chatMemory unit tests (Rule 16 coverage)
 *
 * Validates: loadChatHistory, saveChatHistory, clearChatHistory,
 * addMessageToHistory, getRecentContext — pure localStorage logic.
 * happy-dom provides localStorage in this test environment.
 */
import { beforeEach, describe, it, expect } from 'vitest';
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  addMessageToHistory,
  getRecentContext,
} from '../chatMemory';
import type { AIMessage } from '../ai/types';

const makeMsg = (role: 'user' | 'assistant', content: string): AIMessage => ({
  role,
  content,
  id: crypto.randomUUID(),
  timestamp: Date.now(),
});

describe('chatMemory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadChatHistory returns [] when storage is empty', () => {
    expect(loadChatHistory()).toEqual([]);
  });

  it('saveChatHistory then loadChatHistory round-trips messages', () => {
    const msgs: AIMessage[] = [makeMsg('user', 'hello'), makeMsg('assistant', 'hi')];
    saveChatHistory(msgs);
    const loaded = loadChatHistory();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].content).toBe('hello');
    expect(loaded[1].content).toBe('hi');
  });

  it('clearChatHistory empties the history', () => {
    saveChatHistory([makeMsg('user', 'test')]);
    clearChatHistory();
    expect(loadChatHistory()).toEqual([]);
  });

  it('addMessageToHistory appends and persists', () => {
    const msg = makeMsg('user', 'new message');
    const history = addMessageToHistory(msg);
    expect(history).toHaveLength(1);
    expect(loadChatHistory()).toHaveLength(1);
    expect(loadChatHistory()[0].content).toBe('new message');
  });

  it('getRecentContext returns last N messages', () => {
    const msgs: AIMessage[] = Array.from({ length: 10 }, (_, i) =>
      makeMsg('user', `msg-${i}`)
    );
    saveChatHistory(msgs);
    const recent = getRecentContext(3);
    expect(recent).toHaveLength(3);
    expect(recent[2].content).toBe('msg-9');
  });

  it('saveChatHistory limits to 100 messages', () => {
    const msgs: AIMessage[] = Array.from({ length: 110 }, (_, i) =>
      makeMsg('user', `msg-${i}`)
    );
    saveChatHistory(msgs);
    expect(loadChatHistory()).toHaveLength(100);
  });
});
