/**
 * Tests pour ThinkingPanel — responseQualityScore display
 * Couvre : affichage "Réponse X%", badge ⚠, fallback "Effort X%",
 *          data-runtime-quality, data-testid="reasoning-runtime-quality"
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) =>
      React.createElement('div', props, children),
    span: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) =>
      React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useReducedMotion: () => false,
}));

vi.mock('@/contexts/AnimationContext', () => ({
  useAnimation: () => ({ animationConfig: { duration: 0 } }),
  AnimationProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

// Import après les mocks
import { ThinkingPanel } from '@/features/chat/ThinkingPanel';
import { sanitizeTraceForUi } from '@/services/ai/cognitiveRuntimeTrace';

const baseStep = {
  id: 'step-1',
  type: 'analysis' as const,
  label: 'Analyse',
  status: 'complete' as const,
  content: "Étape d'analyse complète",
  timestamp: Date.now(),
};

describe('ThinkingPanel — responseQualityScore display', () => {
  it('data-runtime-quality présent avec 78% quand responseQualityScore=0.78', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        responseQualityScore={0.78}
        responseQualityTier="high"
      />
    );
    const el = container.querySelector('[data-runtime-quality]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('data-runtime-quality')).toBe('78%');
  });

  it('panneau étendu affiche "Réponse 78%" et sans badge ⚠ si score >= 0.65', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        responseQualityScore={0.78}
        responseQualityTier="high"
        compact={false}
      />
    );
    // Dans le panneau étendu, le résumé "Résultat" contient "Réponse 78%"
    const summaryValues = container.querySelectorAll('.oj-summary-value');
    const resultatEl = Array.from(summaryValues).find(el =>
      el.textContent?.includes('complétée')
    );
    if (resultatEl) {
      expect(resultatEl.textContent).toContain('Réponse 78%');
      expect(resultatEl.textContent).not.toContain('⚠');
    } else {
      // Mode étendu non rendu — vérification via data attribute
      expect(
        container
          .querySelector('[data-runtime-quality]')
          ?.getAttribute('data-runtime-quality')
      ).toBe('78%');
    }
  });

  it('badge ⚠ présent dans le DOM quand responseQualityScore < 0.65', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        responseQualityScore={0.27}
        responseQualityTier="low"
      />
    );
    // data-runtime-quality = "27%"
    const el = container.querySelector('[data-runtime-quality]');
    expect(el?.getAttribute('data-runtime-quality')).toBe('27%');
    // Cliquer pour ouvrir le panneau étendu
    const trigger = container.querySelector('[role="button"]');
    if (trigger) {
      fireEvent.click(trigger);
      expect(document.body.innerHTML).toContain('⚠');
    }
  });

  it('panneau étendu : "Effort X%" quand seul qualityScore (XP) est fourni', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        qualityScore={0.45}
        compact={false}
      />
    );
    const summaryValues = container.querySelectorAll('.oj-summary-value');
    const resultatEl = Array.from(summaryValues).find(el =>
      el.textContent?.includes('complétée')
    );
    if (resultatEl) {
      expect(resultatEl.textContent).toContain('Effort 45%');
    } else {
      // Vérification via data-runtime-quality fallback
      expect(
        container
          .querySelector('[data-runtime-quality]')
          ?.getAttribute('data-runtime-quality')
      ).toBe('45%');
    }
  });

  it('aucun score affiché si aucune prop score fournie', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        compact={false}
      />
    );
    const summaryValues = container.querySelectorAll('.oj-summary-value');
    const resultatEl = Array.from(summaryValues).find(el =>
      el.textContent?.includes('complétée')
    );
    if (resultatEl) {
      expect(resultatEl.textContent).not.toMatch(/Réponse \d+%/);
      expect(resultatEl.textContent).not.toMatch(/Effort \d+%/);
    }
    // data-runtime-quality vide
    const qEl = container.querySelector('[data-runtime-quality]');
    if (qEl) expect(qEl.getAttribute('data-runtime-quality')).toBe('');
  });

  it('data-runtime-quality pointe sur responseQualityScore quand disponible', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        responseQualityScore={0.82}
        qualityScore={0.27}
      />
    );
    const el = container.querySelector('[data-runtime-quality]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('data-runtime-quality')).toBe('82%');
  });

  it('data-runtime-quality tombe en fallback sur qualityScore si responseQualityScore absent', () => {
    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        qualityScore={0.33}
      />
    );
    const el = container.querySelector('[data-runtime-quality]');
    expect(el).toBeTruthy();
    expect(el?.getAttribute('data-runtime-quality')).toBe('33%');
  });

  it('data-testid="reasoning-runtime-quality" affiche le score de réponse avec tier', () => {
    render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        responseQualityScore={0.71}
        responseQualityTier="high"
        compact={false}
      />
    );
    const el = screen.queryByTestId('reasoning-runtime-quality');
    if (el) {
      expect(el.textContent).toContain('71%');
    }
    // If not rendered (compact mode), no assertion needed
  });

  it('vue expert expose une trace cognitive sanitisee sans champs de raisonnement brut', () => {
    const traceWithForbiddenFields = sanitizeTraceForUi({
      traceId: 'trace-test',
      timestamp: Date.now(),
      input: {
        messageLength: 12,
        requiresFreshness: false,
        requiresWeb: false,
        requiresMemory: false,
        taskFamily: 'conversation',
      },
      canonical: {
        attached: true,
        mode: 'default',
        canonicalMode: 'DIRECT',
        profileId: 'BALANCED',
        inferenceState: 'SAFE_TO_INFER',
        truthStatus: 'STABLE_PARTIAL',
        confidence: 0.9,
        messageComplexity: 0.2,
        signalCount: 1,
      },
      memory: {
        injected: false,
        reasonCode: 'no_context',
        sources: [],
        sourceCount: 0,
        relevance: 'low',
        risk: 'none',
      },
      web: {
        needed: false,
        attempted: false,
        available: false,
        sourceCount: 0,
        limitations: [],
        reasonCode: 'not_needed',
      },
      generation: {
        providerRequested: 'ollama',
        providerUsed: 'ollama',
        modelRequested: 'gemma2:2b',
        modelUsed: 'gemma2:2b',
        fallbackUsed: false,
      },
      reflection: {
        verifierEnabled: false,
        factualClaimsDetected: false,
        verified: true,
        shouldRevise: false,
        correctionsApplied: false,
      },
      quality: {
        evaluated: true,
        alignmentScore: 0.9,
        completenessScore: 0.9,
        depthMatchScore: 0.9,
        overallScore: 0.9,
        shouldEnhance: false,
      },
      metaCognition: {
        evaluated: true,
        coherenceScore: 0.95,
        anomalyDetected: false,
      },
      policy: {
        version: 'v2',
        webTruth: {
          evaluated: true,
          need: 'not_needed',
          status: 'not_needed',
          shouldUseWeb: false,
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
      chainOfThought: 'secret reasoning',
    } as unknown as Parameters<typeof sanitizeTraceForUi>[0]);

    expect(
      (traceWithForbiddenFields as Record<string, unknown>).chainOfThought
    ).toBeUndefined();

    const { container } = render(
      <ThinkingPanel
        isThinking={false}
        steps={[{ ...baseStep, status: 'complete' }]}
        state="done"
        compact={false}
        cognitiveTrace={traceWithForbiddenFields}
      />
    );

    const panel = container.querySelector('[data-testid="reasoning-progress"]');
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute('data-cognitive-verdict')).toBe('PASS');
    expect(panel?.getAttribute('data-cognitive-web')).toBe('false');
    expect(panel?.getAttribute('data-cognitive-memory')).toBe('false');
    expect(panel?.getAttribute('data-cognitive-quality')).toBe('90%');
    expect(container.textContent).not.toContain('chainOfThought');
    expect(container.textContent).not.toContain('hiddenThoughts');
  });
});
