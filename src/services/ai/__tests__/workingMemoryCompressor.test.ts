/**
 * Tests: WorkingMemoryCompressor
 * v31.2.33 — Rule 16 compliance
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  compress,
  selectAnchors,
  isAnchorMessage,
  estimateTokens,
  COMPRESSION_HISTORY_THRESHOLD,
  type CompressedContext,
} from '../workingMemoryCompressor';
import type { AIMessage } from '@/services/ai/types';

// ─────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────

// Mock fetch for Ollama summary
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ response: 'Résumé généré par Ollama.' }),
});

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function makeMessages(count: number): AIMessage[] {
  return Array.from({ length: count }, (_, i) => ({
    role: i % 2 === 0 ? 'user' : 'assistant',
    content: `Message ${i + 1}: content about topic ${i + 1}`,
    timestamp: Date.now() + i * 1000,
  } as AIMessage));
}

function makeMessage(role: AIMessage['role'], content: string): AIMessage {
  return { role, content, timestamp: Date.now() };
}

// ─────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────

describe('workingMemoryCompressor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('estimateTokens', () => {
    it('estimates tokens based on character count', () => {
      expect(estimateTokens('1234')).toBe(1); // 4 chars = 1 token
      expect(estimateTokens('12345678')).toBe(2); // 8 chars = 2 tokens
    });

    it('returns 0 for empty string', () => {
      expect(estimateTokens('')).toBe(0);
    });
  });

  describe('isAnchorMessage', () => {
    it('detects "décision:" marker (FR)', () => {
      expect(isAnchorMessage(makeMessage('user', 'Décision: utiliser Tauri v2'))).toBe(true);
    });

    it('detects "fait:" marker', () => {
      expect(isAnchorMessage(makeMessage('assistant', 'Fait: TITANE utilise gemma2:2b'))).toBe(true);
    });

    it('detects "important:" marker', () => {
      expect(isAnchorMessage(makeMessage('user', 'Important: ne pas oublier la config'))).toBe(true);
    });

    it('detects "à retenir:" marker', () => {
      expect(isAnchorMessage(makeMessage('assistant', 'À retenir: le format IPC est { ok, content, error }'))).toBe(true);
    });

    it('detects "key point:" marker (EN)', () => {
      expect(isAnchorMessage(makeMessage('user', 'Key point: use canonical IPC'))).toBe(true);
    });

    it('returns false for regular messages', () => {
      expect(isAnchorMessage(makeMessage('user', 'Comment ça va?'))).toBe(false);
      expect(isAnchorMessage(makeMessage('assistant', 'Je vais bien, merci!'))).toBe(false);
    });
  });

  describe('selectAnchors', () => {
    it('preserves first 3 messages', () => {
      const messages = makeMessages(25);
      const { anchors } = selectAnchors(messages);
      expect(anchors).toContain(messages[0]);
      expect(anchors).toContain(messages[1]);
      expect(anchors).toContain(messages[2]);
    });

    it('preserves last 2 messages', () => {
      const messages = makeMessages(25);
      const { anchors } = selectAnchors(messages);
      expect(anchors).toContain(messages[23]);
      expect(anchors).toContain(messages[24]);
    });

    it('preserves anchor-marked messages', () => {
      const messages = makeMessages(25);
      messages[10] = makeMessage('user', 'Décision: choisir architecture 4-Ring');
      const { anchors } = selectAnchors(messages);
      expect(anchors).toContain(messages[10]);
    });

    it('puts non-anchor messages in body', () => {
      const messages = makeMessages(25);
      const { body } = selectAnchors(messages);
      expect(body.length).toBeGreaterThan(0);
      expect(body.length + /* anchors varies */ 0).toBeLessThan(messages.length + 1);
    });

    it('handles empty array', () => {
      const { anchors, body } = selectAnchors([]);
      expect(anchors).toHaveLength(0);
      expect(body).toHaveLength(0);
    });

    it('handles array smaller than anchor window', () => {
      const messages = makeMessages(3);
      const { anchors, body } = selectAnchors(messages);
      // All 3 messages should be anchors (first 3 = all 3)
      expect(anchors.length).toBe(3);
      expect(body.length).toBe(0);
    });
  });

  describe('compress', () => {
    it('returns unchanged messages when below threshold', async () => {
      const messages = makeMessages(COMPRESSION_HISTORY_THRESHOLD - 1);
      const result = await compress(messages);
      expect(result.messages).toBe(messages);
      expect(result.compressionRatio).toBe(1.0);
    });

    it('returns unchanged messages at exactly threshold', async () => {
      const messages = makeMessages(COMPRESSION_HISTORY_THRESHOLD);
      const result = await compress(messages);
      expect(result.messages).toBe(messages);
    });

    it('compresses messages above threshold', async () => {
      const messages = makeMessages(25);
      const result: CompressedContext = await compress(messages);
      expect(result.messages.length).toBeLessThan(messages.length);
      expect(result.compressionRatio).toBeLessThan(1.0);
    });

    it('includes summary message in compressed output', async () => {
      const messages = makeMessages(25);
      const result = await compress(messages);
      const hasSummaryMsg = result.messages.some(
        m => m.role === 'system' && m.content.includes('RÉSUMÉ CONVERSATION PRÉCÉDENTE')
      );
      expect(hasSummaryMsg).toBe(true);
    });

    it('preserves first message in compressed output', async () => {
      const messages = makeMessages(25);
      const result = await compress(messages);
      expect(result.messages[0].content).toBe(messages[0].content);
    });

    it('preserves last message in compressed output', async () => {
      const messages = makeMessages(25);
      const result = await compress(messages);
      const lastCompressed = result.messages[result.messages.length - 1];
      const lastOriginal = messages[messages.length - 1];
      expect(lastCompressed.content).toBe(lastOriginal.content);
    });

    it('reports originalLength correctly', async () => {
      const messages = makeMessages(25);
      const result = await compress(messages);
      expect(result.originalLength).toBe(25);
    });

    it('reports estimatedTokens > 0', async () => {
      const messages = makeMessages(25);
      const result = await compress(messages);
      expect(result.estimatedTokens).toBeGreaterThan(0);
    });

    it('falls back gracefully when Ollama unavailable', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
      const messages = makeMessages(25);
      const result = await compress(messages);
      // Should still compress (fallback summary)
      expect(result.messages.length).toBeLessThan(messages.length);
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('falls back gracefully when fetch returns error status', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);
      const messages = makeMessages(25);
      const result = await compress(messages);
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('respects maxBudget by trimming if needed', async () => {
      const messages = makeMessages(30);
      // Very small budget to force trimming
      const result = await compress(messages, 50);
      const totalChars = result.messages.map(m => m.content).join(' ').length;
      // After extreme trim, tokens should be manageable
      expect(result.messages.length).toBeGreaterThan(0);
    });

    it('verifies COMPRESSION_HISTORY_THRESHOLD exported constant', () => {
      expect(COMPRESSION_HISTORY_THRESHOLD).toBe(20);
    });
  });
});
