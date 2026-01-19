/**
 * TITANE∞ v19.2Ω — Evolution IA Config Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  CAPABILITY_REGISTRY,
  EVOLUTION_PHASES,
  getCapability,
  getPhase,
  getCapabilitiesByCategory,
  getCapabilitiesByTier,
  getUnlockableCapabilities,
  canTransitionToPhase,
  getNextPhase,
  getPhaseProgress,
  createInitialEvolutionState,
  getAllCapabilitiesSorted,
  countCapabilitiesByStatus,
  TOTAL_CAPABILITIES,
  TOTAL_PHASES,
  CAPABILITY_CATEGORY_LABELS,
  TIER_COLORS,
  EVOLUTION_SYSTEM_VERSION,
} from '../services/evolution/evolutionIA.config';
import type {
  EvolutionPhaseId,
  CapabilityCategory,
  CapabilityTier,
  EvolutionStats,
} from '../services/evolution/evolutionIA.config';

describe('evolutionIA.config.ts', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // CAPABILITY REGISTRY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CAPABILITY_REGISTRY', () => {
    it('contient le nombre correct de capabilities', () => {
      const count = Object.keys(CAPABILITY_REGISTRY).length;
      expect(count).toBe(TOTAL_CAPABILITIES);
      expect(count).toBeGreaterThanOrEqual(25); // Au moins 25+ capabilities
    });

    it('chaque capability a toutes les propriétés requises', () => {
      for (const cap of Object.values(CAPABILITY_REGISTRY)) {
        expect(cap.id).toBeTruthy();
        expect(cap.name).toBeTruthy();
        expect(cap.description).toBeTruthy();
        expect(cap.icon).toBeTruthy();
        expect(cap.category).toBeDefined();
        expect(cap.tier).toBeGreaterThanOrEqual(1);
        expect(cap.tier).toBeLessThanOrEqual(5);
        expect(cap.requiredPhase).toBeDefined();
        expect(cap.requiredLevel).toBeGreaterThanOrEqual(1);
        expect(Array.isArray(cap.prerequisites)).toBe(true);
        expect(typeof cap.talentCost).toBe('number');
        expect(Array.isArray(cap.bonuses)).toBe(true);
        expect(Array.isArray(cap.tags)).toBe(true);
      }
    });

    it('les IDs de capabilities sont uniques', () => {
      const ids = Object.keys(CAPABILITY_REGISTRY);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('chaque prérequis référence une capability existante', () => {
      for (const cap of Object.values(CAPABILITY_REGISTRY)) {
        for (const prereq of cap.prerequisites) {
          expect(CAPABILITY_REGISTRY[prereq]).toBeDefined();
        }
      }
    });

    it("les capabilities de tier 1 n'ont pas de prérequis ou seulement des capabilities gratuites", () => {
      for (const cap of Object.values(CAPABILITY_REGISTRY)) {
        if (cap.tier === 1 && cap.talentCost === 0) {
          expect(cap.prerequisites).toHaveLength(0);
        }
      }
    });

    it('les tiers sont cohérents avec les phases requises', () => {
      const phaseOrder = Object.fromEntries(
        Object.values(EVOLUTION_PHASES).map(p => [p.id, p.order])
      );

      for (const cap of Object.values(CAPABILITY_REGISTRY)) {
        const phase = phaseOrder[cap.requiredPhase];
        // Tier 1-2: phases 1-3, Tier 3-4: phases 3-6, Tier 5: phases 6-8
        if (cap.tier <= 2) {
          expect(phase).toBeLessThanOrEqual(4);
        }
        if (cap.tier === 5) {
          expect(phase).toBeGreaterThanOrEqual(6);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION PHASES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('EVOLUTION_PHASES', () => {
    it('contient 8 phases', () => {
      const count = Object.keys(EVOLUTION_PHASES).length;
      expect(count).toBe(TOTAL_PHASES);
      expect(count).toBe(8);
    });

    it('les phases sont ordonnées de 1 à 8', () => {
      const orders = Object.values(EVOLUTION_PHASES)
        .map(p => p.order)
        .sort((a, b) => a - b);
      expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('chaque phase a toutes les propriétés requises', () => {
      for (const phase of Object.values(EVOLUTION_PHASES)) {
        expect(phase.id).toBeTruthy();
        expect(phase.order).toBeGreaterThanOrEqual(1);
        expect(phase.name).toBeTruthy();
        expect(phase.description).toBeTruthy();
        expect(phase.icon).toBeTruthy();
        expect(phase.color).toMatch(/^#[0-9a-f]{6}$/i);
        expect(typeof phase.requiredLevel).toBe('number');
        expect(typeof phase.requiredTotalXP).toBe('number');
        expect(Array.isArray(phase.requiredCapabilities)).toBe(true);
        expect(typeof phase.minCapabilitiesUnlocked).toBe('number');
        expect(Array.isArray(phase.unlockedCapabilities)).toBe(true);
        expect(Array.isArray(phase.unlockedFeatures)).toBe(true);
        expect(typeof phase.xpMultiplier).toBe('number');
        expect(phase.transitionMessage).toBeTruthy();
      }
    });

    it('les niveaux requis augmentent avec les phases', () => {
      const phases = Object.values(EVOLUTION_PHASES).sort((a, b) => a.order - b.order);
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].requiredLevel).toBeGreaterThan(phases[i - 1].requiredLevel);
        expect(phases[i].requiredTotalXP).toBeGreaterThan(phases[i - 1].requiredTotalXP);
      }
    });

    it('les multiplicateurs XP augmentent avec les phases', () => {
      const phases = Object.values(EVOLUTION_PHASES).sort((a, b) => a.order - b.order);
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i].xpMultiplier).toBeGreaterThanOrEqual(phases[i - 1].xpMultiplier);
      }
    });

    it('phase OMEGA a le multiplicateur XP le plus élevé', () => {
      const omega = EVOLUTION_PHASES.phase_omega;
      for (const phase of Object.values(EVOLUTION_PHASES)) {
        expect(omega.xpMultiplier).toBeGreaterThanOrEqual(phase.xpMultiplier);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getCapability', () => {
    it('retourne la capability correcte par ID', () => {
      const cap = getCapability('basic_reasoning');
      expect(cap).toBeDefined();
      expect(cap!.id).toBe('basic_reasoning');
    });

    it('retourne undefined pour ID inexistant', () => {
      const cap = getCapability('nonexistent_capability');
      expect(cap).toBeUndefined();
    });
  });

  describe('getPhase', () => {
    it('retourne la phase correcte par ID', () => {
      const phase = getPhase('phase_1_nascent');
      expect(phase.id).toBe('phase_1_nascent');
      expect(phase.name).toBe('Naissance');
    });

    it('retourne la phase OMEGA', () => {
      const omega = getPhase('phase_omega');
      expect(omega.id).toBe('phase_omega');
      expect(omega.name).toBe('OMEGA');
      expect(omega.order).toBe(8);
    });
  });

  describe('getCapabilitiesByCategory', () => {
    it('retourne les capabilities de chaque catégorie', () => {
      const categories: CapabilityCategory[] = [
        'cognition',
        'creativity',
        'memory',
        'automation',
        'analysis',
        'communication',
        'integration',
        'meta',
      ];

      for (const category of categories) {
        const caps = getCapabilitiesByCategory(category);
        expect(caps.length).toBeGreaterThan(0);
        for (const cap of caps) {
          expect(cap.category).toBe(category);
        }
      }
    });
  });

  describe('getCapabilitiesByTier', () => {
    it('retourne les capabilities de chaque tier', () => {
      const tiers: CapabilityTier[] = [1, 2, 3, 4, 5];

      for (const tier of tiers) {
        const caps = getCapabilitiesByTier(tier);
        expect(caps.length).toBeGreaterThan(0);
        for (const cap of caps) {
          expect(cap.tier).toBe(tier);
        }
      }
    });

    it('tier 1 a plus de capabilities que tier 5', () => {
      const tier1 = getCapabilitiesByTier(1);
      const tier5 = getCapabilitiesByTier(5);
      expect(tier1.length).toBeGreaterThan(tier5.length);
    });
  });

  describe('getUnlockableCapabilities', () => {
    it('retourne les capabilities débloquables au niveau 1, phase 1', () => {
      const initial = EVOLUTION_PHASES.phase_1_nascent.unlockedCapabilities;
      const unlockable = getUnlockableCapabilities(3, 'phase_1_nascent', initial);

      // Devrait trouver context_awareness (niveau 3, phase 1)
      const hasContextAwareness = unlockable.some(c => c.id === 'context_awareness');
      expect(hasContextAwareness).toBe(true);
    });

    it('ne retourne pas les capabilities déjà débloquées', () => {
      const unlockedIds = ['basic_reasoning', 'context_awareness'];
      const unlockable = getUnlockableCapabilities(10, 'phase_2_learning', unlockedIds);

      for (const cap of unlockable) {
        expect(unlockedIds).not.toContain(cap.id);
      }
    });

    it('respecte les prérequis', () => {
      // Sans basic_reasoning débloqué, context_awareness ne devrait pas être disponible
      const unlockable = getUnlockableCapabilities(10, 'phase_2_learning', []);
      const hasContextAwareness = unlockable.some(c => c.id === 'context_awareness');
      expect(hasContextAwareness).toBe(false);
    });
  });

  describe('canTransitionToPhase', () => {
    const defaultStats: EvolutionStats = {
      totalCapabilitiesUnlocked: 5,
      totalCapabilitiesMastered: 0,
      totalPhaseTransitions: 1,
      totalDaysActive: 30,
      totalAutomationsRun: 50,
      totalMessagesSent: 100,
      totalProjectsAnalyzed: 5,
      firstActivation: Date.now() - 30 * 24 * 60 * 60 * 1000,
      lastActivity: Date.now(),
    };

    it('phase 1 est toujours accessible', () => {
      const result = canTransitionToPhase('phase_1_nascent', 1, 0, [], defaultStats);
      expect(result.possible).toBe(true);
    });

    it('phase 2 nécessite niveau 5 et 2000 XP', () => {
      // Pas assez de niveau/XP
      const result1 = canTransitionToPhase(
        'phase_2_learning',
        3,
        1000,
        ['basic_reasoning'],
        defaultStats
      );
      expect(result1.possible).toBe(false);

      // Assez de niveau/XP et capabilities
      const result2 = canTransitionToPhase(
        'phase_2_learning',
        5,
        2500,
        ['basic_reasoning', 'short_term_memory', 'basic_response'],
        defaultStats
      );
      expect(result2.possible).toBe(true);
    });

    it('retourne les exigences manquantes', () => {
      const result = canTransitionToPhase('phase_3_assistant', 5, 3000, [], defaultStats);
      expect(result.possible).toBe(false);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
    });
  });

  describe('getNextPhase', () => {
    it('retourne la prochaine phase', () => {
      expect(getNextPhase('phase_1_nascent')).toBe('phase_2_learning');
      expect(getNextPhase('phase_4_partner')).toBe('phase_5_expert');
      expect(getNextPhase('phase_7_transcendent')).toBe('phase_omega');
    });

    it('retourne null pour phase OMEGA', () => {
      expect(getNextPhase('phase_omega')).toBeNull();
    });
  });

  describe('getPhaseProgress', () => {
    it('retourne 100% si déjà à OMEGA', () => {
      const progress = getPhaseProgress('phase_omega', 50, 150000, []);
      expect(progress).toBe(100);
    });

    it('calcule le pourcentage de progression', () => {
      const progress = getPhaseProgress('phase_1_nascent', 3, 1000, ['basic_reasoning']);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });

  describe('createInitialEvolutionState', () => {
    it('crée un état initial valide', () => {
      const state = createInitialEvolutionState();

      expect(state.currentPhase).toBe('phase_1_nascent');
      expect(state.phaseEnteredAt).toBeLessThanOrEqual(Date.now());
      expect(Object.keys(state.capabilities).length).toBe(3); // 3 capabilities initiales
      expect(state.transitionHistory).toHaveLength(0);
      expect(state.stats.totalCapabilitiesUnlocked).toBe(3);
    });

    it('les capabilities initiales sont débloquées', () => {
      const state = createInitialEvolutionState();

      expect(state.capabilities['basic_reasoning']).toBeDefined();
      expect(state.capabilities['basic_reasoning'].status).toBe('unlocked');
      expect(state.capabilities['short_term_memory'].status).toBe('unlocked');
      expect(state.capabilities['basic_response'].status).toBe('unlocked');
    });
  });

  describe('getAllCapabilitiesSorted', () => {
    it('trie par tier puis par catégorie', () => {
      const sorted = getAllCapabilitiesSorted();

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (prev.tier === curr.tier) {
          expect(prev.category.localeCompare(curr.category)).toBeLessThanOrEqual(0);
        } else {
          expect(prev.tier).toBeLessThan(curr.tier);
        }
      }
    });
  });

  describe('countCapabilitiesByStatus', () => {
    it('compte correctement les statuts', () => {
      const capabilities = {
        cap1: { capabilityId: 'cap1', status: 'unlocked' as const, usageCount: 0 },
        cap2: { capabilityId: 'cap2', status: 'mastered' as const, usageCount: 10 },
      };

      const counts = countCapabilitiesByStatus(capabilities);

      expect(counts.unlocked).toBe(1);
      expect(counts.mastered).toBe(1);
      expect(counts.locked).toBe(TOTAL_CAPABILITIES - 2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('CAPABILITY_CATEGORY_LABELS a toutes les catégories', () => {
      const categories: CapabilityCategory[] = [
        'cognition',
        'creativity',
        'memory',
        'automation',
        'analysis',
        'communication',
        'integration',
        'meta',
      ];

      for (const cat of categories) {
        expect(CAPABILITY_CATEGORY_LABELS[cat]).toBeDefined();
        expect(CAPABILITY_CATEGORY_LABELS[cat].label).toBeTruthy();
        expect(CAPABILITY_CATEGORY_LABELS[cat].icon).toBeTruthy();
      }
    });

    it('TIER_COLORS a toutes les couleurs', () => {
      const tiers: CapabilityTier[] = [1, 2, 3, 4, 5];

      for (const tier of tiers) {
        expect(TIER_COLORS[tier]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('EVOLUTION_SYSTEM_VERSION est un semver valide', () => {
      expect(EVOLUTION_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
