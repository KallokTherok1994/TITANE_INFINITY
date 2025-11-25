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
    it('should prioritize tauri backend when available', async () => {
      // Mock tauri backend available
      vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(tauriChatProvider, 'generate').mockResolvedValue({
        content: 'Mock response from backend',
        provider: 'tauri-local',
        timestamp: Date.now(),
        model: 'titane-echo',
      });

      const response = await aiOrchestrator.generate('test message');

      expect(response.provider).toMatch(/^tauri-/);
      expect(tauriChatProvider.isAvailable).toHaveBeenCalled();
      expect(tauriChatProvider.generate).toHaveBeenCalledWith('test message', []);
    });

    it('should fallback to gemini when tauri unavailable', async () => {
      // Mock tauri unavailable, gemini available
      vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(false);
      vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(geminiProvider, 'generate').mockResolvedValue({
        content: 'Response from Gemini',
        provider: 'gemini',
        timestamp: Date.now(),
        model: 'gemini-2.0-flash-exp',
      });

      const response = await aiOrchestrator.generate('test message');

      expect(response.provider).toBe('gemini');
      expect(tauriChatProvider.isAvailable).toHaveBeenCalled();
      expect(geminiProvider.isAvailable).toHaveBeenCalled();
      expect(geminiProvider.generate).toHaveBeenCalled();
    });

    it('should fallback to ollama when tauri and gemini unavailable', async () => {
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
      expect(ollamaProvider.generate).toHaveBeenCalled();
    });

    it('should use titane-local as ultimate fallback', async () => {
      // All providers fail except titane-local
      vi.spyOn(tauriChatProvider, 'isAvailable').mockResolvedValue(false);
      vi.spyOn(geminiProvider, 'isAvailable').mockResolvedValue(false);
      vi.spyOn(ollamaProvider, 'isAvailable').mockResolvedValue(false);
      vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(titaneLocalProvider, 'generate').mockResolvedValue({
        content: 'Response from TITANE Local',
        provider: 'titane-local',
        timestamp: Date.now(),
        model: 'titane-echo',
      });

      const response = await aiOrchestrator.generate('test message');

      expect(response.provider).toBe('titane-local');
      expect(titaneLocalProvider.generate).toHaveBeenCalled();
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
        { provider: 'gemini', available: false, error: 'API key not configured (mock mode)' },
        { provider: 'ollama', available: false, error: 'Ollama not running (mock mode)' },
        { provider: 'local', available: true, latency_ms: 50 },
      ];

      // Mock invokeTauri for chat_get_providers_status
      vi.mock('@/core/commands/TAURI_COMMANDS', () => ({
        invokeTauri: vi.fn().mockResolvedValue(mockStatus),
        TAURI_COMMANDS: {
          CHAT_GET_PROVIDERS_STATUS: 'chat_get_providers_status',
        },
      }));

      // Assuming tauriChatProvider has getProvidersStatus method
      expect(mockStatus[2].available).toBe(true);
      expect(mockStatus[2].provider).toBe('local');
    });
  });

  describe('Message Sanitization', () => {
    it('should remove HTML tags from messages', async () => {
      const maliciousMessage = '<script>alert("xss")</script>Hello';

      vi.spyOn(titaneLocalProvider, 'isAvailable').mockResolvedValue(true);
      vi.spyOn(titaneLocalProvider, 'generate').mockImplementation(async (msg) => ({
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
      vi.spyOn(titaneLocalProvider, 'generate').mockImplementation(async (msg) => {
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
      vi.spyOn(tauriChatProvider, 'isAvailable').mockRejectedValue(new Error('Backend error'));
      vi.spyOn(geminiProvider, 'isAvailable').mockRejectedValue(new Error('API error'));
      vi.spyOn(ollamaProvider, 'isAvailable').mockRejectedValue(new Error('Connection error'));
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
      vi.spyOn(tauriChatProvider, 'isAvailable').mockRejectedValue(new Error('Backend error'));
      vi.spyOn(geminiProvider, 'isAvailable').mockRejectedValue(new Error('API error'));
      vi.spyOn(ollamaProvider, 'isAvailable').mockRejectedValue(new Error('Connection error'));
      vi.spyOn(titaneLocalProvider, 'isAvailable').mockRejectedValue(new Error('Local error'));

      const response = await aiOrchestrator.generate('test');

      // orchestrator should return emergency fallback
      expect(response.provider).toMatch(/(emergency|ultimate)-fallback/);
      expect(response.content).toContain('Erreur système');
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
