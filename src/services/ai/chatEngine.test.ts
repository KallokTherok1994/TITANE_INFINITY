/**
 * TITANE_INFINITY v13 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v17.3.0 — CHAT ENGINE TESTS
 *   Tests unitaires ChatEngine (6 modes + validation + Memory Core)
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chatEngine, type ChatEngineConfig } from './chatEngine';
import { memoryService } from '../api';

// Mock services
vi.mock('../api', () => ({
  memoryService: {
    getActiveProjects: vi.fn(),
    getRecentDecisions: vi.fn(),
    getKnowledge: vi.fn(),
    getActiveRituals: vi.fn(),
    getTimeline: vi.fn(),
    saveChatInteraction: vi.fn(),
  },
}));

vi.mock('./orchestrator', () => ({
  aiOrchestrator: {
    generate: vi.fn(),
    stream: vi.fn(),
  },
}));

describe('ChatEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // VALIDATION MESSAGE
  // ═══════════════════════════════════════════════════════════════
  describe('Message Validation', () => {
    it('devrait rejeter message vide', async () => {
      await expect(
        chatEngine.sendMessage('', [])
      ).rejects.toThrow('Message vide ou invalide');
    });

    it('devrait rejeter message trop court (< 2 chars)', async () => {
      await expect(
        chatEngine.sendMessage('a', [])
      ).rejects.toThrow('Message vide ou invalide');
    });

    it('devrait rejeter message trop long (> 10000 chars)', async () => {
      const longMessage = 'a'.repeat(10001);
      await expect(
        chatEngine.sendMessage(longMessage, [])
      ).rejects.toThrow('Message trop long');
    });

    it('devrait accepter message valide', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse test',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
        finishReason: 'stop',
        model: 'test-model',
      });

      const response = await chatEngine.sendMessage('Message valide test', []);
      expect(response).toBeDefined();
      expect(response.content).toBe('Réponse test');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MODES CHAT (6 modes)
  // ═══════════════════════════════════════════════════════════════
  describe('Chat Modes', () => {
    it('devrait utiliser mode default si non spécifié', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      await chatEngine.sendMessage('Test', []);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('TITANE∞');
    });

    it('devrait utiliser mode brainstorming', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Idées créatives',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const config: ChatConfig = { mode: 'brainstorming' };
      await chatEngine.sendMessage('Générer des idées', [], config);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('BRAINSTORMING');
      expect(systemMessage?.content).toContain('DIVERGENCE');
    });

    it('devrait utiliser mode synthesis', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Synthèse structurée',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const config: ChatConfig = { mode: 'synthesis' };
      await chatEngine.sendMessage('Synthétiser ces idées', [], config);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('SYNTHESIS');
      expect(systemMessage?.content).toContain('CONVERGENCE');
    });

    it('devrait utiliser mode planning', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Plan d\'action',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const config: ChatConfig = { mode: 'planning' };
      await chatEngine.sendMessage('Créer un plan', [], config);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('PLANNING');
      expect(systemMessage?.content).toContain('STRATÉGIQUE');
    });

    it('devrait utiliser mode journal', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réflexion introspective',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const config: ChatConfig = { mode: 'journal' };
      await chatEngine.sendMessage('Comment je me sens', [], config);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('JOURNAL');
      expect(systemMessage?.content).toContain('INTROSPECTION');
    });

    it('devrait utiliser mode debug_cognitive', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Analyse détaillée',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const config: ChatConfig = { mode: 'debug_cognitive' };
      await chatEngine.sendMessage('Analyser mon raisonnement', [], config);

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const enrichedHistory = call[1] as Array<{ role: string; content: string }>;
      const systemMessage = enrichedHistory.find(m => m.role === 'system');

      expect(systemMessage?.content).toContain('DEBUG COGNITIF');
      expect(systemMessage?.content).toContain('META-ANALYSE');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // MEMORY CORE INTEGRATION
  // ═══════════════════════════════════════════════════════════════
  describe('Memory Core Integration', () => {
    it('devrait charger contexte Memory Core', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      vi.mocked(memoryService.getActiveProjects).mockResolvedValue([
        { id: '1', name: 'Projet Test', status: 'active', priority: 1, lastActivity: '2025-11-22', tags: ['test'] },
      ]);

      const config: ChatConfig = {
        contextSources: { activeProjects: 1 },
      };

      await chatEngine.sendMessage('Test avec contexte', [], config);

      expect(memoryService.getActiveProjects).toHaveBeenCalledWith(1);
    });

    it('devrait gérer erreur Memory Core gracieusement', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      vi.mocked(memoryService.getActiveProjects).mockRejectedValue(new Error('Backend error'));

      const config: ChatConfig = {
        contextSources: { activeProjects: 5 },
      };

      // Ne devrait PAS throw, contexte vide en fallback
      await expect(
        chatEngine.sendMessage('Test', [], config)
      ).resolves.toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SAUVEGARDE INTERACTIONS
  // ═══════════════════════════════════════════════════════════════
  describe('Save Interactions', () => {
    it('devrait sauvegarder interaction après envoi', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse AI',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      vi.mocked(memoryService.saveChatInteraction).mockResolvedValue();

      await chatEngine.sendMessage('Question test', []);

      expect(memoryService.saveChatInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Question test',
          aiResponse: 'Réponse AI',
          mode: 'default',
        })
      );
    });

    it('devrait continuer même si sauvegarde échoue', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: 'Réponse',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      vi.mocked(memoryService.saveChatInteraction).mockRejectedValue(
        new Error('Save failed')
      );

      const response = await chatEngine.sendMessage('Test', []);

      // Devrait retourner réponse malgré échec sauvegarde
      expect(response.content).toBe('Réponse');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // SUGGESTIONS GÉNÉRATION
  // ═══════════════════════════════════════════════════════════════
  describe('Generate Suggestions', () => {
    it('devrait générer 3 suggestions par défaut', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: '1. Suggestion A\n2. Suggestion B\n3. Suggestion C',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const suggestions = await chatEngine.generateSuggestions('Contexte test', 'default');

      expect(suggestions).toHaveLength(3);
      expect(suggestions[0]).toBe('Suggestion A');
      expect(suggestions[1]).toBe('Suggestion B');
      expect(suggestions[2]).toBe('Suggestion C');
    });

    it('devrait générer nombre custom de suggestions', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: '1. Suggestion 1\n2. Suggestion 2\n3. Suggestion 3\n4. Suggestion 4\n5. Suggestion 5',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const suggestions = await chatEngine.generateSuggestions('Contexte', 'default', 5);

      expect(suggestions).toHaveLength(5);
    });

    it('devrait adapter suggestions au mode brainstorming', async () => {
      const { aiOrchestrator } = await import('../orchestration/aiOrchestrator');
      vi.mocked(aiOrchestrator.generate).mockResolvedValue({
        content: '1. Idée créative\n2. Perspective originale\n3. Connexion inattendue',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        finishReason: 'stop',
        model: 'test',
      });

      const suggestions = await chatEngine.generateSuggestions('Test', 'brainstorming');

      const call = vi.mocked(aiOrchestrator.generate).mock.calls[0];
      const prompt = call[0] as string;

      expect(prompt).toContain('brainstorming');
    });
  });
});
