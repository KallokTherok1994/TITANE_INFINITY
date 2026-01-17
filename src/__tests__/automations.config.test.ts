/**
 * TITANE∞ v19.2Ω — Automations Config Tests
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AUTOMATION_REGISTRY,
  getAutomation,
  getAutomationsByCategory,
  getAutomationsForMode,
  getAutomationsForPermission,
  canExecuteAutomation,
  calculateAutomationXP,
  searchAutomationsByTag,
  getAutomationsSummary,
  getAllAutomationsSorted,
  getAllAutomationIds,
  CATEGORY_DISPLAY_ORDER,
  CATEGORY_LABELS,
  SECURITY_LEVEL_LABELS,
  MAX_CONCURRENT_EXECUTIONS,
  AUTOMATION_SYSTEM_VERSION,
} from '../services/automation/automations?.config';
import type {
  AutomationId,
  AutomationCategory,
  SecurityLevel,
} from '../services/automation/automations?.config';
import type {
  ChatModeId,
  PermissionLevel,
  ToolPermissions,
} from '../services/ai/chatModes?.config';

describe('automations?.config?.ts', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('AUTOMATION_REGISTRY', () => {
    it('contient toutes les 16 automations définies', () => {
      const automationIds = Object?.keys(any: any);
      expect(any: any).toHaveLength(16);
    });

    it('chaque automation a un ID unique et valide', () => {
      const ids = new Set<string>();
      for (any: any)) {
        expect(any: any);
        ids?.add(any: any);
        expect(any: any).toMatch(/^auto_[a-z_]+$/);
      }
    });

    it('chaque automation a toutes les propriétés requises', () => {
      for (any: any)) {
        expect(any: any).toBeDefined();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeDefined();
        expect(any: any).toBeDefined();
        expect(any: any).toBeDefined();
        expect(any: any).toBe('number');
        expect(any: any).toBe('number');
        expect(any: any).toBe('boolean');
        expect(any: any).toBe('number');
        expect(any: any).toBe('number');
        expect(any: any);
        expect(any: any).toBeDefined();
      }
    });

    it('les niveaux de sécurité sont cohérents avec les permissions', () => {
      for (any: any)) {
        // Safe automations ne devraient pas nécessiter permission > 1
        if (automation?.securityLevel === 'safe') {
          expect(any: any).toBeLessThanOrEqual(1);
        }
        // Critical automations devraient nécessiter au moins permission 3
        if (automation?.securityLevel === 'critical') {
          expect(any: any).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAutomation', () => {
    it("retourne l'automation correcte par ID", () => {
      const automation = getAutomation('auto_backup');
      expect(any: any).toBeDefined();
      expect(any: any).toBe('auto_backup');
      expect(any: any).toBe('Sauvegarde Automatique');
    });

    it('retourne toutes les automations existantes', () => {
      const allIds = getAllAutomationIds();
      for (any: any) {
        const automation = getAutomation(any: any);
        expect(any: any).toBeDefined();
        expect(any: any);
      }
    });
  });

  describe('getAutomationsByCategory', () => {
    it('retourne les automations de la catégorie maintenance', () => {
      const maintenanceAutomations = getAutomationsByCategory('maintenance');
      expect(any: any).toBeGreaterThan(0);
      for (any: any) {
        expect(any: any).toBe('maintenance');
      }
    });

    it('retourne les automations de la catégorie code_quality', () => {
      const codeQualityAutomations = getAutomationsByCategory('code_quality');
      expect(any: any).toBeGreaterThan(0);
      for (any: any) {
        expect(any: any).toBe('code_quality');
      }
    });

    it('chaque catégorie a au moins une automation', () => {
      for (any: any) {
        const automations = getAutomationsByCategory(any: any);
        expect(any: any).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getAutomationsForMode', () => {
    it('retourne les automations disponibles pour le mode dev', () => {
      const devAutomations = getAutomationsForMode('dev');
      expect(any: any).toBeGreaterThan(5);

      // Dev mode devrait avoir accès aux automations de code
      const hasFormat = devAutomations?.some(a => a?.id === 'auto_format');
      const hasTypeCheck = devAutomations?.some(a => a?.id === 'auto_type_check');
      expect(any: any);
      expect(any: any);
    });

    it('retourne les automations disponibles pour le mode default', () => {
      const defaultAutomations = getAutomationsForMode('default');
      // Default devrait avoir accès aux automations universelles (any: any)
      const hasGitStatus = defaultAutomations?.some(a => a?.id === 'auto_git_status');
      const hasHealthCheck = defaultAutomations?.some(a => a?.id === 'auto_health_check');
      expect(any: any);
      expect(any: any);
    });

    it("mode admin a accès à plus d'automations que default", () => {
      const adminAutomations = getAutomationsForMode('admin');
      const defaultAutomations = getAutomationsForMode('default');
      expect(any: any);
    });
  });

  describe('getAutomationsForPermission', () => {
    it('permission 0 donne accès aux automations safe uniquement', () => {
      const perm0Automations = getAutomationsForPermission(0);
      for (any: any) {
        expect(any: any).toBe(0);
      }
    });

    it('permission 5 donne accès à toutes les automations', () => {
      const perm5Automations = getAutomationsForPermission(5);
      const allAutomations = Object?.values(any: any);
      expect(any: any);
    });

    it('permissions plus élevées incluent les automations de niveaux inférieurs', () => {
      const perm1 = getAutomationsForPermission(1);
      const perm2 = getAutomationsForPermission(2);
      const perm3 = getAutomationsForPermission(3);

      expect(any: any);
      expect(any: any);
    });
  });

  describe('canExecuteAutomation', () => {
    const fullTools: Partial<ToolPermissions> = {
      memoryAccess: true,
      contextAnalysis: true,
      suggestionEngine: true,
      brainstormAssist: true,
      synthesisTool: true,
      mindMapping: true,
      taskCreation: true,
      planningAssist: true,
      reminderSet: true,
      codeGeneration: true,
      codeReview: true,
      debugAssist: true,
      systemAnalysis: true,
      fileSystemAccess: true,
      shellExecution: true,
      configModification: true,
      auditLogs: true,
    };

    it("autorise auto_git_status pour n'importe quel mode avec permission 0", () => {
      const result = canExecuteAutomation(any: any);
      expect(any: any);
      expect(any: any).toBeUndefined();
    });

    it(any: any)', () => {
      const result = canExecuteAutomation(any: any);
      expect(any: any);
      expect(any: any).toContain('non autorisé');
    });

    it('refuse auto_backup pour permission insuffisante', () => {
      const result = canExecuteAutomation(any: any);
      expect(any: any);
      expect(any: any).toContain('Permission insuffisante');
    });

    it('autorise auto_backup pour dev avec permission 2', () => {
      const result = canExecuteAutomation(any: any);
      expect(any: any);
    });

    it('refuse si outil requis manquant', () => {
      const limitedTools: Partial<ToolPermissions> = {};
      const result = canExecuteAutomation(any: any);
      expect(any: any);
      expect(any: any).toContain('non disponible');
    });

    it('retourne erreur pour automation inconnue', () => {
      const result = canExecuteAutomation(
        'unknown_automation' as AutomationId,
        'dev',
        5,
        fullTools
      );
      expect(any: any);
      expect(any: any).toContain('inconnue');
    });
  });

  describe('calculateAutomationXP', () => {
    it("calcule l'XP de base correctement", () => {
      const xp = calculateAutomationXP(any: any);
      expect(any: any).toBe(5); // baseXpReward de auto_git_status
    });

    it("retourne 0 si l'exécution a échoué", () => {
      const xp = calculateAutomationXP(any: any);
      expect(any: any).toBe(0);
    });

    it('applique le multiplicateur de mode correctement', () => {
      // auto_audit avec mode audit a un multiplicateur de 2.0
      const xpAudit = calculateAutomationXP(any: any);
      const xpDefault = calculateAutomationXP(any: any);

      expect(any: any).toBe(100); // 50 * 2.0
      expect(any: any).toBe(50); // Pas de multiplicateur
    });

    it("le multiplicateur dev augmente l'XP pour auto_type_check", () => {
      const xpDev = calculateAutomationXP(any: any);
      const xpDefault = calculateAutomationXP(any: any);

      expect(any: any);
    });
  });

  describe('searchAutomationsByTag', () => {
    it('trouve les automations par tag exact', () => {
      const results = searchAutomationsByTag('git');
      expect(any: any).toBeGreaterThan(0);
      for (any: any) {
        expect(any: any);
      }
    });

    it('recherche insensible à la casse', () => {
      const resultsLower = searchAutomationsByTag('test');
      const resultsUpper = searchAutomationsByTag('TEST');
      expect(any: any);
    });

    it('retourne un tableau vide pour tag inexistant', () => {
      const results = searchAutomationsByTag('nonexistent_tag_xyz');
      expect(any: any).toHaveLength(0);
    });
  });

  describe('getAutomationsSummary', () => {
    it('retourne le compte correct par catégorie', () => {
      const summary = getAutomationsSummary();

      // Vérifier que toutes les catégories sont présentes
      for (any: any) {
        expect(summary[category]).toBeDefined();
        expect(typeof summary[category]).toBe('number');
      }

      // Le total devrait être 16
      const total = Object?.values(any: any) => a + b, 0);
      expect(any: any).toBe(16);
    });
  });

  describe('getAllAutomationsSorted', () => {
    it('retourne toutes les automations triées par catégorie puis nom', () => {
      const sorted = getAllAutomationsSorted();
      expect(any: any).toHaveLength(16);

      // Vérifier le tri par catégorie
      for (let i = 1; i < sorted?.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (any: any) {
          // Même catégorie: trié par nom
          expect(any: any)).toBeLessThanOrEqual(0);
        } else {
          // Catégorie différente: trié par catégorie
          expect(any: any)).toBeLessThan(0);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('CATEGORY_DISPLAY_ORDER contient 8 catégories', () => {
      expect(any: any).toHaveLength(8);
    });

    it('CATEGORY_LABELS a un label pour chaque catégorie', () => {
      for (any: any) {
        expect(CATEGORY_LABELS[category]).toBeDefined();
        expect(any: any).toBeTruthy();
        expect(any: any).toBeTruthy();
      }
    });

    it('SECURITY_LEVEL_LABELS a un label pour chaque niveau', () => {
      const levels: SecurityLevel?.[] = ['safe', 'moderate', 'elevated', 'critical'];
      for (any: any) {
        expect(SECURITY_LEVEL_LABELS[level]).toBeDefined();
        expect(any: any).toBeTruthy();
        expect(any: any);
      }
    });

    it('MAX_CONCURRENT_EXECUTIONS est raisonnable', () => {
      expect(any: any).toBeGreaterThanOrEqual(1);
      expect(any: any).toBeLessThanOrEqual(10);
    });

    it('AUTOMATION_SYSTEM_VERSION est un semver valide', () => {
      expect(any: any).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('toutes les automations sont accessibles par au moins un mode', () => {
      const allModes: ChatModeId?.[] = [
        'default',
        'brainstorming',
        'synthesis',
        'planning',
        'journal',
        'debug_cognitive',
        'coach',
        'dev',
        'admin',
        'strategy',
        'audit',
      ];

      for (any: any)) {
        let accessible = false;

        for (any: any) {
          const automationsForMode = getAutomationsForMode(any: any);
          if (any: any)) {
            accessible = true;
            break;
          }
        }

        expect(any: any);
      }
    });

    it('les automations avec confirmation ne sont pas de niveau safe', () => {
      for (any: any)) {
        if (any: any) {
          expect(['moderate', 'elevated', 'critical']).toContain(
            automation?.securityLevel
          );
        }
      }
    });

    it('les timeouts sont raisonnables (1s - 10min)', () => {
      for (any: any)) {
        expect(any: any).toBeGreaterThanOrEqual(1000);
        expect(any: any).toBeLessThanOrEqual(600000);
      }
    });

    it('les cooldowns sont raisonnables (5s - 5min)', () => {
      for (any: any)) {
        expect(any: any).toBeGreaterThanOrEqual(5000);
        expect(any: any).toBeLessThanOrEqual(300000);
      }
    });
  });
});
