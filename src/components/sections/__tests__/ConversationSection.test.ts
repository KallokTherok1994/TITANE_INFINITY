import { describe, expect, it } from 'vitest';

import {
  buildConversationTransparencyReply,
  buildConversationLoadingLabel,
  mapReasonCodeToNodeStatus,
  resolveConversationPendingInput,
  buildConversationRuntimeBadges,
  buildConversationRuntimeSummary,
  getConversationViewportHeight,
  isConversationTransparencyPrompt,
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

  it('falls back to buffered or DOM input when the React state has not flushed yet', () => {
    expect(resolveConversationPendingInput('', 'Android UI smoke message', null)).toBe(
      'Android UI smoke message'
    );
    expect(resolveConversationPendingInput('', '', 'Android DOM value')).toBe(
      'Android DOM value'
    );
  });

  it('treats rate limit reason codes as blocked conversation runtime states', () => {
    expect(mapReasonCodeToNodeStatus('RATE_LIMIT')).toBe('blocked');
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
    expect(shouldUseConversationCompactLayout(980, true)).toBe(true);
    expect(shouldUseConversationCompactLayout(1080, true)).toBe(false);
    expect(shouldUseConversationCompactLayout(0, true)).toBe(false);
    expect(shouldUseConversationCompactLayout(920, false)).toBe(false);
  });

  it('prefers visualViewport height and clamps tiny values to the minimum', () => {
    const originalVisualViewport = window.visualViewport;
    const descriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 240 },
    });

    expect(getConversationViewportHeight()).toBe(320);

    if (descriptor) {
      Object.defineProperty(window, 'visualViewport', descriptor);
    } else {
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
    }
  });

  it('caps visualViewport to innerHeight when zoom makes it larger than the real window', () => {
    const originalVisualViewport = window.visualViewport;
    const visualViewportDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 1500 },
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });

    expect(getConversationViewportHeight()).toBe(900);

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    if (visualViewportDescriptor) {
      Object.defineProperty(window, 'visualViewport', visualViewportDescriptor);
    } else {
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
    }
  });

  it('falls back to innerHeight when visualViewport is unavailable', () => {
    const originalVisualViewport = window.visualViewport;
    const descriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 777,
    });

    expect(getConversationViewportHeight()).toBe(777);

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
    if (descriptor) {
      Object.defineProperty(window, 'visualViewport', descriptor);
    } else {
      Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalVisualViewport,
      });
    }
  });

  it('detects when the conversation is already near the bottom edge', () => {
    expect(isConversationNearBottom(860, 320, 1240)).toBe(true);
    expect(isConversationNearBottom(620, 320, 1240)).toBe(false);
    expect(isConversationNearBottom(0, 0, 0)).toBe(true);
  });

  it('only exposes the return-to-bottom CTA when the history really overflows', () => {
    expect(shouldShowConversationScrollToBottom(620, 320, 1240)).toBe(true);
    expect(shouldShowConversationScrollToBottom(860, 320, 1240)).toBe(false);
    expect(shouldShowConversationScrollToBottom(0, 320, 420)).toBe(false);
  });

  it('detects descriptive transparency prompts without treating them as artifact requests', () => {
    expect(
      isConversationTransparencyPrompt(
        "Sans inventer, reponds en 3 points: provider reel utilise, si le reseau a ete utilise, et ce que l'UI permet d'exporter."
      )
    ).toBe(true);
  });

  it('builds a literal transparency reply from the latest runtime truth', () => {
    const reply = buildConversationTransparencyReply({
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

    expect(reply).toContain(
      '1. Provider reel utilise: Ollama (OMEGA+Singularity) (mode LOCAL)'
    );
    expect(reply).toContain('2. Reseau utilise: non, reason OK');
    expect(reply).toContain('la conversation en JSON');
    expect(reply).toContain('la conversation en Markdown');
    expect(reply).toContain('copie presse-papiers');
    expect(reply).toContain('voie artefact avec manifeste canonique');
  });

  it('keeps the transparency reply honest when no runtime metadata exists yet', () => {
    const reply = buildConversationTransparencyReply(null);

    expect(reply).toContain('Provider reel utilise: indisponible');
    expect(reply).toContain('Reseau utilise: indisponible');
  });
});
