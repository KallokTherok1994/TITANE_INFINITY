/**
 * TITANE∞ v31.2.38 — CanonicalDiscernmentKernel: OMEGA Auto-Selection Tests
 * Phase B: explicit OMEGA trigger signals → profileId === 'OMEGA'
 *          double escalation (high complexity + high coherence) → OMEGA
 *          normal messages → never accidentally reach OMEGA
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CanonicalDiscernmentKernel } from '@/services/ai/canonicalDiscernmentKernel';
import type { DiscernmentInput } from '@/services/ai/canonicalDiscernmentKernel';
import type { MemoryContext } from '@/services/ai/memoryIntegration';

const emptyMemory: MemoryContext = {
  activeProjects: [],
  recentDecisions: [],
  relevantKnowledge: [],
  activeRituals: [],
  timeline: [],
};

const baseInput: DiscernmentInput = {
  message: '',
  mode: 'default',
  memoryContext: emptyMemory,
  preferences: [],
  userDepthPreference: null,
  providerPreference: 'auto',
};

describe('Phase B — OMEGA auto-selection', () => {
  let kernel: CanonicalDiscernmentKernel;

  beforeEach(() => {
    kernel = new CanonicalDiscernmentKernel();
  });

  it('activates OMEGA profile on "godmod" signal when base profile is ARCHITECT', () => {
    const decision = kernel.discern({
      ...baseInput,
      message:
        "godmod actif — analyse complète de l'architecture sans limite avec orchestration complète de l'agenda et du pipeline",
      runtimeState: { singularityCoherence: 0.9 },
    });
    // Message has "godmod" + architect-level complexity → OMEGA expected
    expect(decision.profileId).toBe('OMEGA');
    const omegaSig = decision.signals.find(s => s.type === 'omega_intent');
    expect(omegaSig).toBeDefined();
  });

  it('activates OMEGA profile on "plein potentiel" signal', () => {
    const decision = kernel.discern({
      ...baseInput,
      message:
        "utilise plein potentiel et fais une analyse complète de l'architecture stratégique, plan d'action, axes prioritaires, incohérences",
      runtimeState: { singularityCoherence: 0.88 },
    });
    expect(decision.profileId).toBe('OMEGA');
  });

  it('activates OMEGA profile on "sans limite" signal', () => {
    const decision = kernel.discern({
      ...baseInput,
      message:
        'raisonnement sans limite — architecture, stratégie, orchestration, analyse croisée, décisions structurelles',
      runtimeState: { singularityCoherence: 0.85 },
    });
    expect(decision.profileId).toBe('OMEGA');
  });

  it('does NOT activate OMEGA on a normal short message', () => {
    const decision = kernel.discern({
      ...baseInput,
      message: "c'est quoi TypeScript ?",
    });
    expect(decision.profileId).not.toBe('OMEGA');
  });

  it('does NOT activate OMEGA on a simple repair message', () => {
    const decision = kernel.discern({
      ...baseInput,
      message: "j'ai une erreur TypeScript dans mon fichier, comment la corriger ?",
    });
    expect(decision.profileId).not.toBe('OMEGA');
  });

  it('logs omega_intent signal when OMEGA is triggered by keyword', () => {
    const decision = kernel.discern({
      ...baseInput,
      message:
        'omega mode — architecture complète de la singularité avec stratégie et axes',
      runtimeState: { singularityCoherence: 0.9 },
    });
    if (decision.profileId === 'OMEGA') {
      const sig = decision.signals.find(
        s => s.type === 'omega_intent' || s.type === 'omega_double_escalation'
      );
      expect(sig).toBeDefined();
    }
  });
});
