import { describe, expect, it } from 'vitest';

import {
  buildConversationJournalSaveLabel,
  buildConversationJournalSearchLabel,
  buildConversationTransparencyReply,
  buildConversationLoadingLabel,
  getEffectiveViewportHeight,
  mapReasonCodeToNodeStatus,
  resolveConversationPendingInput,
  buildConversationRuntimeBadges,
  buildConversationRuntimeSummary,
  resolveConversationOllamaModel,
  getConversationViewportHeight,
  isConversationTransparencyPrompt,
  isConversationNearBottom,
  sanitizeConversationInput,
  resolveConversationCitations,
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
    const summary = buildConversationRuntimeSummary(
      'Ollama',
      {
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
        modelRequested: 'llama3.1:latest',
        modelUsed: 'llama3.2:latest',
        fallbackUsed: true,
        tags: [],
        runtimeSignals: {
          orchestratorState: 'running',
          memoryState: 'present',
        },
      },
      'default',
      'default'
    );

    expect(summary).toContain('Requested: Ollama');
    expect(summary).toContain('Model requested: llama3.1:latest');
    expect(summary).toContain('Model used: llama3.2:latest');
    expect(summary).toContain('Model fallback: true');
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
    const badges = buildConversationRuntimeBadges(
      'Ollama',
      {
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
        modelRequested: 'llama3.1:latest',
        modelUsed: 'llama3.2:latest',
        fallbackUsed: true,
        runtimeSignals: {
          orchestratorState: 'running',
          memoryState: 'present',
        },
      },
      'default',
      'default'
    );

    expect(badges).toContain('requested:Ollama');
    expect(badges).toContain('Ollama (OMEGA+Singularity)');
    expect(badges).toContain('policy:web_research_inline');
    expect(badges).toContain('model-requested:llama3.1:latest');
    expect(badges).toContain('model-used:llama3.2:latest');
    expect(badges).toContain('model-fallback:true');
  });

  it('includes conversation mode truth in runtime summary and badges helpers', () => {
    const runtime = {
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
      modelRequested: 'gemma2:2b',
      modelUsed: 'gemma2:2b',
      fallbackUsed: false,
      runtimeSignals: {
        orchestratorState: 'running',
        memoryState: 'present',
      },
    };

    const summary = buildConversationRuntimeSummary(
      'Ollama',
      runtime,
      'planning',
      'planning'
    );
    const badges = buildConversationRuntimeBadges(
      'Ollama',
      runtime,
      'planning',
      'planning'
    );

    expect(summary).toContain('Conversation mode: planning');
    expect(summary).toContain('Store mode: planning');
    expect(badges).toContain('conversation-mode:planning');
    expect(badges).toContain('chat-store-mode:planning');
  });

  it('publishes the governed Ollama model from runtime truth before falling back to defaults', () => {
    expect(
      resolveConversationOllamaModel('ollama', {
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
        modelRequested: 'gemma2:2b',
        modelUsed: 'gemma2:2b',
        fallbackUsed: false,
        tags: [],
        runtimeSignals: {
          orchestratorState: 'running',
          memoryState: 'present',
        },
      })
    ).toBe('gemma2:2b');

    expect(resolveConversationOllamaModel('ollama', null)).toBe('gemma2:2b');
    expect(resolveConversationOllamaModel('openai', null)).toBe('unknown');
  });

  it('publishes explicit journal labels for save and search states', () => {
    expect(buildConversationJournalSaveLabel('saved')).toBe(
      'Sauvegarde persistante validee'
    );
    expect(buildConversationJournalSaveLabel(undefined)).toBe(
      'Aucun statut de sauvegarde capture'
    );
    expect(buildConversationJournalSearchLabel('used', 2, true)).toBe(
      '2 sources inline capturees'
    );
    expect(buildConversationJournalSearchLabel('unused', 0, false)).toBe(
      'Non utilisee sur ce tour'
    );
  });

  it('retains only structurally valid inline citations for the active conversation surface', () => {
    const citations = resolveConversationCitations([
      {
        url: 'https://example.com/source-a',
        title: 'Source A',
        excerpt: 'Extrait A',
        accessed_at: '2026-04-18T10:00:00Z',
      },
      {
        url: '',
        excerpt: 'Invalide',
        accessed_at: '2026-04-18T10:00:00Z',
      },
      {
        url: 'https://example.com/source-b',
        excerpt: '',
        accessed_at: '2026-04-18T10:00:00Z',
      },
    ]);

    expect(citations).toHaveLength(1);
    expect(citations[0]?.title).toBe('Source A');
  });

  it('switches to compact layout when fullscreen zoom reduces the viewport height', () => {
    expect(shouldUseConversationCompactLayout(920, true)).toBe(true);
    expect(shouldUseConversationCompactLayout(980, true)).toBe(true);
    expect(shouldUseConversationCompactLayout(1080, true)).toBe(false);
    expect(shouldUseConversationCompactLayout(0, true)).toBe(false);
    expect(shouldUseConversationCompactLayout(920, false)).toBe(false);
  });

  it('derives the effective viewport height from innerHeight and visualViewport scale', () => {
    const originalVisualViewport = window.visualViewport;
    const visualViewportDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'visualViewport'
    );
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 1500, scale: 1.25 },
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 900,
    });

    expect(getEffectiveViewportHeight()).toBe(720);
    expect(getConversationViewportHeight()).toBe(720);

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

  it('clamps tiny effective heights to the minimum viewport threshold', () => {
    const originalVisualViewport = window.visualViewport;
    const visualViewportDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'visualViewport'
    );
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 240, scale: 2 },
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 240,
    });

    expect(getEffectiveViewportHeight()).toBe(320);
    expect(getConversationViewportHeight()).toBe(320);

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

    expect(getEffectiveViewportHeight()).toBe(777);
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

  it('preserves ultra-long prompts instead of slicing them at 10000 chars', () => {
    const ultraLongPrompt = `ULTRA-START ${'segment ultra long '.repeat(900)}ULTRA-END`;

    const sanitized = sanitizeConversationInput(ultraLongPrompt);

    expect(sanitized).toContain('ULTRA-START');
    expect(sanitized).toContain('ULTRA-END');
    expect(sanitized.length).toBe(ultraLongPrompt.length);
  });

  it('falls back to visualViewport height when innerHeight is unavailable', () => {
    const originalVisualViewport = window.visualViewport;
    const visualViewportDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'visualViewport'
    );
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 612, scale: 1.15 },
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: undefined,
    });

    expect(getEffectiveViewportHeight()).toBe(612);
    expect(getConversationViewportHeight()).toBe(612);

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
