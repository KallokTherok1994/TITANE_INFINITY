import { fireEvent, render, screen } from '@/test-utils';
import { describe, expect, it } from 'vitest';

import { ThinkingPanel } from '../ThinkingPanel';
import type { CognitiveRuntimeTrace } from '@/services/ai/cognitiveRuntimeTrace';

const baseTrace: CognitiveRuntimeTrace = {
  traceId: 'test-trace-001',
  timestamp: Date.now(),
  input: {
    messageLength: 42,
    requiresFreshness: true,
    requiresWeb: true,
    requiresMemory: true,
    taskFamily: 'research',
  },
  canonical: {
    attached: true,
    mode: 'BALANCED',
    canonicalMode: 'BALANCED',
    profileId: 'BALANCED',
    inferenceState: 'SAFE_TO_INFER',
    truthStatus: 'STABLE_PARTIAL',
    confidence: 0.82,
    messageComplexity: 0.5,
    signalCount: 0,
  },
  memory: {
    injected: true,
    sources: ['memory:present', 'route:/titane'],
    reasonCode: 'ltm_match',
    relevance: 'medium',
    sourceCount: 2,
    risk: 'none',
  },
  generation: {
    providerRequested: 'ollama',
    providerUsed: 'ollama',
    modelRequested: 'gemma2:2b',
    modelUsed: 'gemma2:2b',
    fallbackUsed: false,
    latencyMs: 1240,
  },
  web: {
    needed: true,
    attempted: true,
    available: true,
    sourceCount: 3,
    limitations: [],
    reasonCode: 'web_success',
  },
  reflection: {
    verifierEnabled: true,
    verified: true,
    factualClaimsDetected: true,
    shouldRevise: false,
    correctionsApplied: false,
    confidence: 0.8,
  },
  quality: {
    evaluated: true,
    alignmentScore: 0.78,
    completenessScore: 0.78,
    depthMatchScore: 0.78,
    overallScore: 0.78,
    shouldEnhance: false,
    enhancementHint: '',
  },
  metaCognition: {
    evaluated: false,
    coherenceScore: 0.8,
    anomalyDetected: false,
  },
  policy: {
    version: 'v2',
    webTruth: {
      evaluated: true,
      need: 'freshness_required',
      status: 'attempted_success',
      shouldUseWeb: true,
      shouldWarnUser: false,
    },
    qualityAction: {
      evaluated: true,
      action: 'none',
      minimumVerdict: 'PASS',
      reasonCode: 'quality_pass',
      warnUser: false,
    },
  },
  final: {
    verdict: 'PASS',
    limitations: [],
    safeToRemember: true,
    shouldAskClarification: false,
  },
};

const baseProps = {
  isThinking: false,
  compact: false,
  state: 'done' as const,
  provider: 'Ollama (OMEGA)',
  modeLabel: 'LOCAL',
  elapsedTime: 1.5,
  steps: [],
};

function renderExpert(trace: CognitiveRuntimeTrace | null | undefined) {
  const { container } = render(<ThinkingPanel {...baseProps} cognitiveTrace={trace} />);
  fireEvent.click(screen.getByTestId('reasoning-progress'));
  fireEvent.click(screen.getByText('Expert'));
  return container;
}

describe('ThinkingPanel cognitive trace', () => {
  it('renders cognitive trace verdict in expert view', () => {
    renderExpert(baseTrace);
    expect(screen.getByTestId('reasoning-cognitive-trace')).toBeInTheDocument();
    expect(screen.getByTestId('reasoning-cognitive-verdict')).toHaveTextContent('PASS');
  });

  it('renders memory reasonCode and source count', () => {
    renderExpert(baseTrace);
    const memEl = screen.getByTestId('reasoning-cognitive-memory');
    expect(memEl).toHaveTextContent('ltm_match');
    expect(memEl).toHaveTextContent('2 sources');
  });

  it('renders web state and web policy', () => {
    renderExpert(baseTrace);
    expect(screen.getByTestId('reasoning-cognitive-web')).toHaveTextContent('Requise');
    expect(screen.getByTestId('reasoning-cognitive-web')).toHaveTextContent('3 sources');
    expect(screen.getByTestId('reasoning-cognitive-web-policy')).toHaveTextContent(
      'freshness_required'
    );
    expect(screen.getByTestId('reasoning-cognitive-web-policy')).toHaveTextContent(
      'attempted_success'
    );
  });

  it('renders quality score and quality action', () => {
    renderExpert(baseTrace);
    expect(screen.getByTestId('reasoning-cognitive-quality')).toHaveTextContent('78%');
    expect(screen.getByTestId('reasoning-cognitive-quality-action')).toHaveTextContent(
      'none'
    );
    expect(screen.getByTestId('reasoning-cognitive-quality-action')).toHaveTextContent(
      'min PASS'
    );
  });

  it('renders web limitation when present', () => {
    const traceWithLimit: CognitiveRuntimeTrace = {
      ...baseTrace,
      web: { ...baseTrace.web, limitations: ['reseau indisponible'] },
    };
    renderExpert(traceWithLimit);
    expect(screen.getByTestId('reasoning-cognitive-web')).toHaveTextContent(
      'reseau indisponible'
    );
  });

  it('does not render forbidden raw reasoning fields', () => {
    const traceWithForbidden = {
      ...baseTrace,
      chainOfThought: 'LEAKED_INTERNAL_THOUGHTS',
      rawReasoning: 'LEAKED_RAW',
      hiddenThoughts: 'LEAKED_HIDDEN',
    } as unknown as CognitiveRuntimeTrace;
    const container = renderExpert(traceWithForbidden);
    expect(container).not.toHaveTextContent('LEAKED_INTERNAL_THOUGHTS');
    expect(container).not.toHaveTextContent('LEAKED_RAW');
    expect(container).not.toHaveTextContent('LEAKED_HIDDEN');
  });

  it('preserves reasoning-progress selectors when cognitiveTrace is provided', () => {
    const { container } = render(
      <ThinkingPanel {...baseProps} cognitiveTrace={baseTrace} />
    );
    const progress = container.querySelector('[data-testid="reasoning-progress"]');
    expect(progress).not.toBeNull();
    expect(progress).toHaveAttribute('data-cognitive-verdict', 'PASS');
    expect(progress).toHaveAttribute('data-cognitive-memory', 'true');
    expect(progress).toHaveAttribute('data-cognitive-web', 'true');
    expect(progress).toHaveAttribute('data-cognitive-quality', '78%');
  });

  it('works safely when cognitiveTrace is null', () => {
    render(<ThinkingPanel {...baseProps} cognitiveTrace={null} />);
    const progress = screen.getByTestId('reasoning-progress');
    expect(progress).toHaveAttribute('data-cognitive-verdict', '');
    expect(progress).toHaveAttribute('data-cognitive-web', '');
    expect(progress).toHaveAttribute('data-cognitive-memory', '');
    expect(progress).toHaveAttribute('data-cognitive-quality', '');
    expect(screen.queryByTestId('reasoning-cognitive-trace')).toBeNull();
  });

  // ── MetaCognitionGuard UI tests ─────────────────────────────────────────
  it('does not render meta-guard section when metaCognition.evaluated is false', () => {
    renderExpert(baseTrace); // baseTrace has metaCognition.evaluated = false
    expect(screen.queryByTestId('reasoning-cognitive-meta-guard')).toBeNull();
  });

  it('renders meta-guard section when metaCognition.evaluated is true with guardAction', () => {
    const traceWithGuard: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        coherenceScore: 0.75,
        anomalyDetected: false,
        guardAction: 'none',
        freezeMemorySave: false,
        issues: [],
      },
    };
    renderExpert(traceWithGuard);
    const el = screen.getByTestId('reasoning-cognitive-meta-guard');
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('Action: none');
    expect(el).toHaveTextContent('Cohérence: 75%');
  });

  it('renders anomaly and frozen memory in meta-guard when present', () => {
    const traceWithAnomaly: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        coherenceScore: 0.5,
        anomalyDetected: true,
        guardAction: 'add_limitation',
        freezeMemorySave: true,
        issues: [],
      },
    };
    renderExpert(traceWithAnomaly);
    const el = screen.getByTestId('reasoning-cognitive-meta-guard');
    expect(el).toHaveTextContent('Anomalie');
    expect(el).toHaveTextContent('Mémoire gelée');
  });

  it('does not crash when metaCognition is undefined', () => {
    const traceNoMeta: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: { evaluated: false },
    };
    expect(() => renderExpert(traceNoMeta)).not.toThrow();
    expect(screen.queryByTestId('reasoning-cognitive-meta-guard')).toBeNull();
  });

  // ── MetaCognitionEnforcer v2 component tests ──────────────────────────────

  it('renders reasoning-cognitive-meta-enforcement when enforcementApplied=true', () => {
    const traceWithEnforcement: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        guardAction: 'freeze_memory_save',
        freezeMemorySave: true,
        coherenceScore: 0.85,
        anomalyDetected: false,
        issues: [],
        enforcementApplied: true,
        enforcementEffects: ['memory_save_frozen'],
        responseDirective: 'leave_response',
      },
    };
    renderExpert(traceWithEnforcement);
    const el = screen.getByTestId('reasoning-cognitive-meta-enforcement');
    expect(el).toBeInTheDocument();
    expect(el).toHaveTextContent('Effets');
    expect(el).toHaveTextContent('Directive');
    expect(el).toHaveTextContent('Mémoire sauvegardable');
  });

  it('does not render reasoning-cognitive-meta-enforcement when enforcementApplied=undefined', () => {
    const traceNoEnforcement: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        guardAction: 'none',
        freezeMemorySave: false,
        coherenceScore: 0.95,
        anomalyDetected: false,
        issues: [],
        // enforcementApplied: undefined — intentionally absent
      },
    };
    renderExpert(traceNoEnforcement);
    expect(screen.queryByTestId('reasoning-cognitive-meta-enforcement')).toBeNull();
  });

  it('prior reasoning-cognitive-meta-guard selector is preserved (regression check)', () => {
    const traceWithBoth: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        guardAction: 'add_limitation',
        freezeMemorySave: false,
        coherenceScore: 0.75,
        anomalyDetected: false,
        issues: [],
        enforcementApplied: true,
        enforcementEffects: ['limitation_added'],
        responseDirective: 'append_limitation',
      },
    };
    renderExpert(traceWithBoth);
    // Both selectors must be present
    expect(screen.getByTestId('reasoning-cognitive-meta-guard')).toBeInTheDocument();
    expect(
      screen.getByTestId('reasoning-cognitive-meta-enforcement')
    ).toBeInTheDocument();
  });

  it('enforcement block does not expose forbidden raw reasoning strings', () => {
    const FORBIDDEN = [
      'chainOfThought',
      'hiddenThoughts',
      'rawReasoning',
      'privateReasoning',
      'internalReasoningSteps',
    ];
    const traceWithEnforcement: CognitiveRuntimeTrace = {
      ...baseTrace,
      metaCognition: {
        evaluated: true,
        guardAction: 'block_response',
        freezeMemorySave: true,
        coherenceScore: 0.3,
        anomalyDetected: true,
        issues: [],
        enforcementApplied: true,
        enforcementEffects: ['response_blocked', 'memory_save_frozen'],
        responseDirective: 'block_response',
      },
    };
    renderExpert(traceWithEnforcement);
    const el = screen.getByTestId('reasoning-cognitive-meta-enforcement');
    const content = el.textContent ?? '';
    for (const forbidden of FORBIDDEN) {
      expect(content).not.toContain(forbidden);
    }
  });
});
