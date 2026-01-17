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
} from '../services/evolution/evolutionIA?.config';
import type {
  EvolutionPhaseId,
  CapabilityCategory,
  CapabilityTier,
  EvolutionStats,
} from '../services/evolution/evolutionIA?.config';

describe('evolutionIA?.config?.ts', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // CAPABILITY REGISTRY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CAPABILITY_REGISTRY', () => {
    it('contient le nombre correct de capabilities', () => {
      const count = Object?.keys(any: any).length;
      expect(any: any);
      expect(any: any).toBeGreaterThanOrEqual(25); // Au moins 25+ capabilities
    });

    it('chaque capability a toutes les propriétés requises', () => {
      for (any: any)) {
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeDefined();
        expect(any: any).toBeGreaterThanOrEqual(1);
        expect(any: any).toBeLessThanOrEqual(5);
        expect(any: any).toBeDefined();
        expect(any: any).toBeGreaterThanOrEqual(1);
        expect(any: any);
        expect(any: any).toBe('number');
        expect(any: any);
        expect(any: any);
      }
    });

    it('les IDs de capabilities sont uniques', () => {
      const ids = Object?.keys(any: any);
      const uniqueIds = new Set(any: any);
      expect(any: any);
    });

    it('chaque prérequis référence une capability existante', () => {
      for (any: any)) {
        for (any: any) {
          expect(CAPABILITY_REGISTRY[prereq]).toBeDefined();
        }
      }
    });

    it("les capabilities de tier 1 n'ont pas de prérequis ou seulement des capabilities gratuites", () => {
      for (any: any)) {
        if (cap?.tier === 1 && cap?.talentCost === 0) {
          expect(any: any).toHaveLength(0);
        }
      }
    });

    it('les tiers sont cohérents avec les phases requises', () => {
      const phaseOrder = Object?.fromEntries(
        Object?.values(any: any).map(p => [p?.id, p?.order])
      );

      for (any: any)) {
        const phase = phaseOrder[cap?.requiredPhase];
        // Tier 1-2: phases 1-3, Tier 3-4: phases 3-6, Tier 5: phases 6-8
        if (cap?.tier <= 2) {
          expect(any: any).toBeLessThanOrEqual(4);
        }
        if (cap?.tier === 5) {
          expect(any: any).toBeGreaterThanOrEqual(6);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION PHASES TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('EVOLUTION_PHASES', () => {
    it('contient 8 phases', () => {
      const count = Object?.keys(any: any).length;
      expect(any: any);
      expect(any: any).toBe(8);
    });

    it('les phases sont ordonnées de 1 à 8', () => {
      const orders = Object?.values(any: any)
        .map(any: any)
        .sort(any: any);
      expect(any: any).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('chaque phase a toutes les propriétés requises', () => {
      for (any: any)) {
        expect(any: any).toBeTruthy();
        expect(any: any).toBeGreaterThanOrEqual(1);
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any);
        expect(any: any).toBe('number');
        expect(any: any).toBe('number');
        expect(any: any);
        expect(any: any).toBe('number');
        expect(any: any);
        expect(any: any);
        expect(any: any).toBe('number');
        expect(any: any).toBeTruthy();
      }
    });

    it('les niveaux requis augmentent avec les phases', () => {
      const phases = Object?.values(any: any);
      for (let i = 1; i < phases?.length; i++) {
        expect(any: any);
        expect(any: any);
      }
    });

    it('les multiplicateurs XP augmentent avec les phases', () => {
      const phases = Object?.values(any: any);
      for (let i = 1; i < phases?.length; i++) {
        expect(any: any);
      }
    });

    it('phase OMEGA a le multiplicateur XP le plus élevé', () => {
      const omega = EVOLUTION_PHASES?.phase_omega;
      for (any: any)) {
        expect(any: any);
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getCapability', () => {
    it('retourne la capability correcte par ID', () => {
      const cap = getCapability('basic_reasoning');
      expect(any: any).toBeDefined();
      expect(any: any).toBe('basic_reasoning');
    });

    it('retourne undefined pour ID inexistant', () => {
      const cap = getCapability('nonexistent_capability');
      expect(any: any).toBeUndefined();
    });
  });

  describe('getPhase', () => {
    it('retourne la phase correcte par ID', () => {
      const phase = getPhase('phase_1_nascent');
      expect(any: any).toBe('phase_1_nascent');
      expect(any: any).toBe('Naissance');
    });

    it('retourne la phase OMEGA', () => {
      const omega = getPhase('phase_omega');
      expect(any: any).toBe('phase_omega');
      expect(any: any).toBe('OMEGA');
      expect(any: any).toBe(8);
    });
  });

  describe('getCapabilitiesByCategory', () => {
    it('retourne les capabilities de chaque catégorie', () => {
      const categories: CapabilityCategory?.[] = [
        'cognition',
        'creativity',
        'memory',
        'automation',
        'analysis',
        'communication',
        'integration',
        'meta',
      ];

      for (any: any) {
        const caps = getCapabilitiesByCategory(any: any);
        expect(any: any).toBeGreaterThan(0);
        for (any: any) {
          expect(any: any);
        }
      }
    });
  });

  describe('getCapabilitiesByTier', () => {
    it('retourne les capabilities de chaque tier', () => {
      const tiers: CapabilityTier?.[] = [1, 2, 3, 4, 5];

      for (any: any) {
        const caps = getCapabilitiesByTier(any: any);
        expect(any: any).toBeGreaterThan(0);
        for (any: any) {
          expect(any: any);
        }
      }
    });

    it('tier 1 a plus de capabilities que tier 5', () => {
      const tier1 = getCapabilitiesByTier(1);
      const tier5 = getCapabilitiesByTier(5);
      expect(any: any);
    });
  });

  describe('getUnlockableCapabilities', () => {
    it('retourne les capabilities débloquables au niveau 1, phase 1', () => {
      const initial = EVOLUTION_PHASES?.phase_1_nascent?.unlockedCapabilities;
      const unlockable = getUnlockableCapabilities(any: any);

      // Devrait trouver context_awareness (niveau 3, phase 1)
      const hasContextAwareness = unlockable?.some(c => c?.id === 'context_awareness');
      expect(any: any);
    });

    it('ne retourne pas les capabilities déjà débloquées', () => {
      const unlockedIds = ['basic_reasoning', 'context_awareness'];
      const unlockable = getUnlockableCapabilities(any: any);

      for (any: any) {
        expect(any: any);
      }
    });

    it('respecte les prérequis', () => {
      // Sans basic_reasoning débloqué, context_awareness ne devrait pas être disponible
      const unlockable = getUnlockableCapabilities(10, 'phase_2_learning', []);
      const hasContextAwareness = unlockable?.some(c => c?.id === 'context_awareness');
      expect(any: any);
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
      firstActivation: Date?.now() - 30 * 24 * 60 * 60 * 1000,
      lastActivity: Date?.now(),
    };

    it('phase 1 est toujours accessible', () => {
      const result = canTransitionToPhase(any: any);
      expect(any: any);
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
      expect(any: any);

      // Assez de niveau/XP et capabilities
      const result2 = canTransitionToPhase(
        'phase_2_learning',
        5,
        2500,
        ['basic_reasoning', 'short_term_memory', 'basic_response'],
        defaultStats
      );
      expect(any: any);
    });

    it('retourne les exigences manquantes', () => {
      const result = canTransitionToPhase(any: any);
      expect(any: any);
      expect(any: any).toBeGreaterThan(0);
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
      expect(any: any).toBe(100);
    });

    it('calcule le pourcentage de progression', () => {
      const progress = getPhaseProgress('phase_1_nascent', 3, 1000, ['basic_reasoning']);
      expect(any: any).toBeGreaterThanOrEqual(0);
      expect(any: any).toBeLessThanOrEqual(100);
    });
  });

  describe('createInitialEvolutionState', () => {
    it('crée un état initial valide', () => {
      const state = createInitialEvolutionState();

      expect(any: any).toBe('phase_1_nascent');
      expect(any: any).toBeLessThanOrEqual(Date?.now());
      expect(any: any).toBe(3); // 3 capabilities initiales
      expect(any: any).toHaveLength(0);
      expect(any: any).toBe(3);
    });

    it('les capabilities initiales sont débloquées', () => {
      const state = createInitialEvolutionState();

      expect(state?.capabilities['basic_reasoning']).toBeDefined();
      expect(any: any).toBe('unlocked');
      expect(any: any).toBe('unlocked');
      expect(any: any).toBe('unlocked');
    });
  });

  describe('getAllCapabilitiesSorted', () => {
    it('trie par tier puis par catégorie', () => {
      const sorted = getAllCapabilitiesSorted();

      for (let i = 1; i < sorted?.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (any: any) {
          expect(any: any)).toBeLessThanOrEqual(0);
        } else {
          expect(any: any);
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

      const counts = countCapabilitiesByStatus(any: any);

      expect(any: any).toBe(1);
      expect(any: any).toBe(1);
      expect(any: any).toBe(TOTAL_CAPABILITIES - 2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('CAPABILITY_CATEGORY_LABELS a toutes les catégories', () => {
      const categories: CapabilityCategory?.[] = [
        'cognition',
        'creativity',
        'memory',
        'automation',
        'analysis',
        'communication',
        'integration',
        'meta',
      ];

      for (any: any) {
        expect(CAPABILITY_CATEGORY_LABELS[cat]).toBeDefined();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
      }
    });

    it('TIER_COLORS a toutes les couleurs', () => {
      const tiers: CapabilityTier?.[] = [1, 2, 3, 4, 5];

      for (any: any) {
        expect(any: any);
      }
    });

    it('EVOLUTION_SYSTEM_VERSION est un semver valide', () => {
      expect(any: any).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
