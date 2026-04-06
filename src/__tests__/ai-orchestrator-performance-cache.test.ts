import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aiOrchestrator } from '@/services/ai/orchestrator';
import * as promptBuilder from '@/core/prompts';

describe('AI orchestrator short-lived status caching', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const orchestrator = aiOrchestrator as any;
    orchestrator.providersStatusCache = { data: null, timestamp: 0 };
    orchestrator.healthCheckCache = { data: null, timestamp: 0 };
  });

  it('reuses provider status snapshot for near-identical calls', async () => {
    const first = await aiOrchestrator.getProvidersStatus();
    const second = await aiOrchestrator.getProvidersStatus();

    expect(first.providers.length).toBeGreaterThan(0);
    expect(first).toBe(second);
    expect(second.timestamp).toBe(first.timestamp);
  });

  it('reuses healthCheck snapshot for near-identical calls', async () => {
    const first = await aiOrchestrator.healthCheck();
    const second = await aiOrchestrator.healthCheck();

    expect(first).toBe(second);
  });

  it('reuses provider-specific prompt history inside a single request cache', () => {
    const buildSystemPromptSpy = vi.spyOn(promptBuilder, 'buildSystemPrompt');
    const orchestrator = aiOrchestrator as any;
    const historyCache = new Map<string, unknown>();
    const history = [{ role: 'user', content: 'hello', timestamp: 1 }];

    const first = orchestrator.buildHistoryForProvider(
      history,
      'openai',
      'core',
      undefined,
      historyCache
    );
    const second = orchestrator.buildHistoryForProvider(
      history,
      'copilot',
      'core',
      undefined,
      historyCache
    );

    expect(first).toBe(second);
    expect(buildSystemPromptSpy).toHaveBeenCalledTimes(1);
  });
});
