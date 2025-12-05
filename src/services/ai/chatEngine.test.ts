/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatEngine, type ChatEngineConfig } from './chatEngine';
import type { MemoryContext } from './memoryIntegration';

const { mockLoadContext, mockSaveInteraction, mockGenerate } = vi.hoisted(() => ({
  mockLoadContext: vi.fn(),
  mockSaveInteraction: vi.fn(),
  mockGenerate: vi.fn(),
}));

vi.mock('./memoryIntegration', () => ({
  memoryIntegration: {
    loadContext: mockLoadContext,
    saveInteraction: mockSaveInteraction,
  },
}));

vi.mock('./orchestrator', () => ({
  aiOrchestrator: {
    generate: mockGenerate,
  },
}));

const baseContext: MemoryContext = {
  activeProjects: [],
  recentDecisions: [],
  relevantKnowledge: [],
  activeRituals: [],
  timeline: [],
};

const baseResponse = {
  content: 'Réponse test',
  provider: 'titane-local' as const,
  timestamp: 42,
  model: 'mock',
};

describe('ChatEngine Omega', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadContext.mockReset();
    mockSaveInteraction.mockReset();
    mockGenerate.mockReset();
    mockLoadContext.mockResolvedValue(baseContext);
    mockSaveInteraction.mockResolvedValue(undefined);
    mockGenerate.mockResolvedValue(baseResponse);
  });

  describe('Input validation', () => {
    it('auto-heals when message is empty', async () => {
      const response = await chatEngine.generate('', []);
      expect(response.metadata?.auto_heal).toBe(true);
      expect(response.omegaMetadata?.failureHandled).toBe(true);
    });

    it('accepts sanitized valid messages', async () => {
      const response = await chatEngine.generate('Bonjour TITANE∞', []);
      expect(response.content).toBe('Réponse test');
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mode handling', () => {
    it('defaults to Standard mode', async () => {
      await chatEngine.generate('Test', []);

      const [, enrichedHistory, aiConfig] = mockGenerate.mock.calls[0];
      expect(enrichedHistory[0].role).toBe('system');
      expect(aiConfig.promptProfileId).toBe('core');
      expect(aiConfig.promptContext?.modeName).toBe('Standard');
    });

    it('uses mode-specific profile and context', async () => {
      const config: Partial<ChatEngineConfig> = { mode: 'brainstorming' };
      await chatEngine.generate('Idées', [], config);

      const [, , aiConfig] = mockGenerate.mock.calls[0];
      expect(aiConfig.promptProfileId).toBe('architecte_projet');
      expect(aiConfig.promptContext?.modeIcon).toBe('💡');
    });
  });

  describe('Memory Core integration', () => {
    it('passes context sources to loader', async () => {
      const config: Partial<ChatEngineConfig> = {
        contextSources: {
          includeProjects: false,
          includeDecisions: true,
          includeRituals: false,
          maxHistory: 2,
        },
      };

      await chatEngine.generate('Avec contexte', [], config);
      expect(mockLoadContext).toHaveBeenCalledWith(config.contextSources);
    });

    it('recovers gracefully when context loading fails', async () => {
      mockLoadContext.mockRejectedValueOnce(new Error('backend down'));

      const response = await chatEngine.generate('Fallback', []);
      expect(response.contextUsed).toEqual([]);
      expect(response.omegaMetadata?.autoHealed).toBe(true);
    });
  });

  describe('Memory persistence', () => {
    it('saves each interaction to memory core', async () => {
      await chatEngine.generate('Question test', []);

      expect(mockSaveInteraction).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Question test',
          aiResponse: 'Réponse test',
          mode: 'default',
        })
      );
    });

    it('keeps responding if save operation fails', async () => {
      mockSaveInteraction.mockRejectedValueOnce(new Error('disk full'));

      const response = await chatEngine.generate('Test', []);
      expect(response.content).toBe('Réponse test');
      expect(response.omegaMetadata?.autoHealed).toBe(true);
    });
  });

  describe('Suggestions and metadata', () => {
    it('injects predefined default suggestions in response', async () => {
      const response = await chatEngine.generate('Suggestion request', []);

      expect(response.suggestions).toEqual([
        'Passe en mode Brainstorming OMEGA pour explorer',
        'Active le mode Journal pour réflexion TITANE∞',
        'Besoin de planifier ? Essaie le mode Planning OMEGA',
      ]);
    });

    it('returns pipeline telemetry', async () => {
      const response = await chatEngine.generate('Metrics', []);
      expect(response.omegaMetadata?.pipelineSteps).toContain('input-validation');
      expect(response.omegaMetadata?.processingTime).toBeGreaterThanOrEqual(0);
    });
  });
});
