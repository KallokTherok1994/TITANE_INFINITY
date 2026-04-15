import { describe, expect, it } from 'vitest';

import {
  buildConversationLoadingLabel,
  buildConversationRuntimeBadges,
  buildConversationRuntimeSummary,
  isConversationNearBottom,
  resolveConversationDisplayProvider,
  shouldShowConversationScrollToBottom,
  shouldUseConversationCompactLayout,
} from '../ConversationSection';

describe('ConversationSection runtime provider label', () => {
  it('prefers the actual runtime provider over the selected UI provider', () => {
    expect(
      resolveConversationDisplayProvider('ollama', 'Ollama (OMEGA+Singularity)')
    ).toBe('Ollama (OMEGA+Singularity)');
  });

  it('falls back to the selected provider label before runtime truth exists', () => {
    expect(resolveConversationDisplayProvider('openai', null)).toBe('OpenAI');
  });

  it('preserves unknown provider ids honestly', () => {
    expect(
      resolveConversationDisplayProvider('gemini', 'Experimental Router Override')
    ).toBe('Experimental Router Override');
  });

  it('includes the requested provider when runtime resolves to a different provider', () => {
    const summary = buildConversationRuntimeSummary('Ollama', {
      providerMeta: {
        provider_used: 'Ollama (OMEGA+Singularity)',
        provider_class: 'local',
        mode: 'LOCAL',
        reason_code: 'OK',
        latency_ms_total: 42,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
      },
      tags: [],
      runtimeSignals: {
        orchestratorState: 'running',
        memoryState: 'present',
      },
    });

    expect(summary).toContain('Requested: Ollama');
    expect(summary).toContain('Provider: Ollama (OMEGA+Singularity)');
  });

  it('builds an honest loading label from requested route and mode only', () => {
    expect(buildConversationLoadingLabel('Ollama', 'Normal')).toBe(
      'Route demandee: Ollama | Mode: Normal'
    );
  });

  it('includes requested provider and policy in runtime badges when execution differs', () => {
    const badges = buildConversationRuntimeBadges('Ollama', {
      providerMeta: {
        provider_used: 'Ollama (OMEGA+Singularity)',
        provider_class: 'local',
        mode: 'LOCAL',
        reason_code: 'OK',
        latency_ms_total: 42,
        timeout_ms: 30000,
        retries: 0,
        attempts: [],
        network_used: false,
        cache_hit: false,
        policy: 'web_research_inline',
      },
      tags: ['memory:present'],
      runtimeSignals: {
        orchestratorState: 'running',
        memoryState: 'present',
      },
    });

    expect(badges).toContain('requested:Ollama');
    expect(badges).toContain('Ollama (OMEGA+Singularity)');
    expect(badges).toContain('policy:web_research_inline');
  });

  it('switches to compact layout when fullscreen zoom reduces the viewport height', () => {
    expect(shouldUseConversationCompactLayout(920, true)).toBe(true);
    expect(shouldUseConversationCompactLayout(1080, true)).toBe(false);
    expect(shouldUseConversationCompactLayout(920, false)).toBe(false);
  });

  it('detects when the conversation is already near the bottom edge', () => {
    expect(isConversationNearBottom(860, 320, 1240)).toBe(true);
    expect(isConversationNearBottom(620, 320, 1240)).toBe(false);
  });

  it('only exposes the return-to-bottom CTA when the history really overflows', () => {
    expect(shouldShowConversationScrollToBottom(620, 320, 1240)).toBe(true);
    expect(shouldShowConversationScrollToBottom(860, 320, 1240)).toBe(false);
    expect(shouldShowConversationScrollToBottom(0, 320, 420)).toBe(false);
  });
});
