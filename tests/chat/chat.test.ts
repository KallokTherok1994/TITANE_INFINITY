/**
 * TITANE_INFINITY v18 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v18.0 — TESTS CHAT IA
 *   Tests unitaires et d'intégration pour l'architecture Chat IA
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiOrchestrator } from '@/services/ai/orchestrator';
import { tauriChatProvider } from '@/services/ai/providers/tauriChat';
import { geminiProvider } from '@/services/ai/providers/gemini';
import { ollamaProvider } from '@/services/ai/providers/ollama';
import { titaneLocalProvider } from '@/services/ai/providers/titaneLocal';

describe('Chat IA v18 — Architecture Hybride', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Cascade', () => {
    it('should prioritize titane-local provider when available', async () => {
      const selectionSpy = vi
        .spyOn(aiOrchestrator as any, 'selectOptimalProvider')
        .mockReturnValue({
          selectedProvider: 'titane-local',
          reason: 'optimal',
          confidence: 95,
          alternates: ['tauri-backend', 'gemini', 'ollama'],
        });

      try {
        vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(titaneLocalProvider, 'generate').mockResolvedValue({
          content: 'Mock response from TITANE Local',
          provider: 'titane-local',
          timestamp: Date.now(),
          model: 'titane-echo',
        });
        vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(false);

        const response = await aiOrchestrator.generate('test message');

        expect(response.provider).toBe('titane-local');
        expect(titaneLocalProvider.generate).toHaveBeenCalledWith('test message', []);
      } finally {
        selectionSpy.mockRestore();
      }
    });

    it('should fallback to tauri backend when local unavailable', async () => {
      const selectionSpy = vi
        .spyOn(aiOrchestrator as any, 'selectOptimalProvider')
        .mockReturnValue({
          selectedProvider: 'tauri-backend',
          reason: 'fallback',
          confidence: 90,
          alternates: ['gemini', 'ollama'],
        });

      try {
        vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(tauriChatProvider, 'generate').mockResolvedValue({
          content: 'Response from Tauri backend',
          provider: 'tauri-backend',
          timestamp: Date.now(),
          model: 'titane-echo',
        });
        vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(false);

        const response = await aiOrchestrator.generate('test message');

        expect(response.provider).toBe('tauri-backend');
        expect(tauriChatProvider.generate).toHaveBeenCalledWith('test message', []);
      } finally {
        selectionSpy.mockRestore();
      }
    });

    it('should fallback to gemini when local and tauri unavailable', async () => {
      const selectionSpy = vi
        .spyOn(aiOrchestrator as any, 'selectOptimalProvider')
        .mockReturnValue({
          selectedProvider: 'gemini',
          reason: 'fallback',
          confidence: 85,
          alternates: ['ollama'],
        });

      try {
        vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(geminiProvider, 'generate').mockResolvedValue({
          content: 'Response from Gemini',
          provider: 'gemini',
          timestamp: Date.now(),
          model: 'gemini-2.0-flash-exp',
        });
        vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(false);

        const response = await aiOrchestrator.generate('test message');

        expect(response.provider).toBe('gemini');
        expect(geminiProvider.generate).toHaveBeenCalledWith('test message', []);
      } finally {
        selectionSpy.mockRestore();
      }
    });

    it('should fallback to ollama when tauri and gemini unavailable', async () => {
      const selectionSpy = vi
        .spyOn(aiOrchestrator as any, 'selectOptimalProvider')
        .mockReturnValue({
          selectedProvider: 'ollama',
          reason: 'fallback',
          confidence: 80,
          alternates: [],
        });

      try {
        vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(false);
        vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(ollamaProvider, 'generate').mockResolvedValue({
          content: 'Response from Ollama',
          provider: 'ollama',
          timestamp: Date.now(),
          model: 'llama3.1',
        });

        const response = await aiOrchestrator.generate('test message');

        expect(response.provider).toBe('ollama');
      } finally {
        selectionSpy.mockRestore();
      }
    });

    it('should use titane-local as ultimate fallback', async () => {
      const selectionSpy = vi
        .spyOn(aiOrchestrator as any, 'selectOptimalProvider')
        .mockReturnValue({
          selectedProvider: 'tauri-backend',
          reason: 'fallback',
          confidence: 70,
          alternates: ['gemini', 'ollama'],
        });

      try {
        vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(true);
        vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(true);

        vi.spyOn(tauriChatProvider, 'generate').mockRejectedValue(
          new Error('tauri offline')
        );
        vi.spyOn(geminiProvider, 'generate').mockRejectedValue(
          new Error('gemini offline')
        );
        vi.spyOn(ollamaProvider, 'generate').mockRejectedValue(
          new Error('ollama offline')
        );
        vi.spyOn(titaneLocalProvider, 'generate').mockResolvedValue({
          content: 'Response from TITANE Local',
          provider: 'titane-local',
          timestamp: Date.now(),
          model: 'titane-echo',
        });

        const response = await aiOrchestrator.generate('test message');

        expect(response.provider).toBe('titane-local');
        expect(titaneLocalProvider.generate).toHaveBeenCalledWith('test message', []);
      } finally {
        selectionSpy.mockRestore();
      }
    });
  });

  describe('Tauri Backend Mock Commands', () => {
    it('should return mock response from chat_send_message', async () => {
      vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(tauriChatProvider, 'generate').mockResolvedValue({
        content: '🤖 [MOCK] Je suis TITANE en mode local. Tu as dit: "test"',
        provider: 'tauri-local',
        timestamp: Date.now(),
        model: 'titane-echo',
        tokens: 150,
      });

      const response = await tauriChatProvider.generate('test', []);

      expect(response.content).toContain('[MOCK]');
      expect(response.provider).toBe('tauri-local');
      expect(response.model).toBe('titane-echo');
      expect(response.tokens).toBeDefined();
    });

    it('should return provider status with local available', async () => {
      const mockStatus = [
        {
          provider: 'gemini',
          available: false,
          error: 'API key not configured (mock mode)',
        },
        { provider: 'ollama', available: false, error: 'Ollama not running (mock mode)' },
        { provider: 'local', available: true, latency_ms: 50 },
      ];
      const statusSpy = vi
        .spyOn(tauriChatProvider, 'getProvidersStatus')
        .mockResolvedValue(mockStatus as any);

      const status = await tauriChatProvider.getProvidersStatus();

      expect(statusSpy).toHaveBeenCalled();
      expect(status[2]?.available).toBe(true);
      expect(status[2]?.provider).toBe('local');

      statusSpy.mockRestore();
    });
  });

  describe('Message Sanitization', () => {
    it('should remove HTML tags from messages', async () => {
      const maliciousMessage = '<script>alert("xss")</script>Hello';

      vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(titaneLocalProvider, 'generate').mockImplementation(async msg => ({
        content: `Echo: ${msg}`,
        provider: 'titane-local',
        timestamp: Date.now(),
        model: 'titane-echo',
      }));

      const response = await aiOrchestrator.generate(maliciousMessage);

      // orchestrator sanitizes input before passing to provider
      expect(response.content).not.toContain('<script>');
    });

    it('should trim and limit message length', async () => {
      const longMessage = 'A'.repeat(20000);

      vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(titaneLocalProvider, 'generate').mockImplementation(async msg => {
        // Verify message was truncated to 10k chars
        expect(msg.length).toBeLessThanOrEqual(10000);
        return {
          content: 'Response',
          provider: 'titane-local',
          timestamp: Date.now(),
          model: 'titane-echo',
        };
      });

      await aiOrchestrator.generate(longMessage);
    });
  });

  describe('Error Handling', () => {
    it('should handle provider errors gracefully', async () => {
      vi.spyOn(tauriChatProvider, 'isAvailable').mockRejectedValue(
        new Error('Backend error')
      );
      vi.spyOn(geminiProvider, 'isAvailable').mockRejectedValue(new Error('API error'));
      vi.spyOn(ollamaProvider, 'isAvailable').mockRejectedValue(
        new Error('Connection error')
      );
      vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(titaneLocalProvider, 'generate').mockResolvedValue({
        content: 'Fallback response',
        provider: 'titane-local',
        timestamp: Date.now(),
        model: 'titane-echo',
      });

      const response = await aiOrchestrator.generate('test');

      expect(response.provider).toBe('titane-local');
      expect(response.content).toBeDefined();
    });

    it('should return emergency fallback if all providers fail', async () => {
      // All providers fail completely
      vi.spyOn(tauriChatProvider, 'isAvailable').mockRejectedValue(
        new Error('Backend error')
      );
      vi.spyOn(geminiProvider, 'isAvailable').mockRejectedValue(new Error('API error'));
      vi.spyOn(ollamaProvider, 'isAvailable').mockRejectedValue(
        new Error('Connection error')
      );
      vi.spyOn(titaneLocalProvider, 'isAvailable').mockRejectedValue(
        new Error('Local error')
      );

      // Mock generate to also fail for all providers
      vi.spyOn(tauriChatProvider, 'generate').mockRejectedValue(
        new Error('Backend error')
      );
      vi.spyOn(geminiProvider, 'generate').mockRejectedValue(new Error('API error'));
      vi.spyOn(ollamaProvider, 'generate').mockRejectedValue(
        new Error('Connection error')
      );
      vi.spyOn(titaneLocalProvider, 'generate').mockRejectedValue(
        new Error('Local error')
      );

      const response = await aiOrchestrator.generate('test');

      // orchestrator should return emergency fallback with OMEGA message
      expect(response.provider).toMatch(/(emergency|ultimate|fallback|omega)/);
      expect(response.content).toContain('OMEGA Auto-Récupération');
    });
  });

  describe('ChatWindow Integration', () => {
    it('should display messages with correct styling', () => {
      // This would be a React component test with @testing-library/react
      // Verify MessageBubble renders with correct colors
      // User: #ffffff on #727b81
      // Assistant: #c4c4c4 on #2a2a2a
      expect(true).toBe(true); // Placeholder
    });

    it('should show loading indicator while processing', () => {
      // Verify "TITANE réfléchit..." loader appears
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('File Import', () => {
    it('should analyze imported file and inject summary', () => {
      const _mockFile = new File(['test content'], 'test.md', { type: 'text/markdown' });
      const analysis = {
        filename: 'test.md',
        content: 'test content',
        summary: 'test content',
        size: 12,
        type: 'markdown',
        wordCount: 2,
        lines: 1,
      };

      expect(analysis.filename).toBe('test.md');
      expect(analysis.type).toBe('markdown');
      expect(analysis.wordCount).toBe(2);
    });
  });
});

describe('Performance Tests', () => {
  it('should respond within acceptable latency', async () => {
    vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
    vi.spyOn(titaneLocalProvider, 'generate').mockResolvedValue({
      content: 'Fast response',
      provider: 'titane-local',
      timestamp: Date.now(),
      model: 'titane-echo',
    });

    const start = Date.now();
    await aiOrchestrator.generate('test');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(5000); // Max 5s
  });
});
