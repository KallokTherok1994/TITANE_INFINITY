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
} from '../services/automation/automations.config';
import type {
  AutomationId,
  AutomationCategory,
  SecurityLevel,
} from '../services/automation/automations.config';
import type { ChatModeId, PermissionLevel, ToolPermissions } from '../services/ai/chatModes.config';

describe('automations.config.ts', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTRY TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('AUTOMATION_REGISTRY', () => {
    it('contient toutes les 16 automations définies', () => {
      const automationIds = Object.keys(AUTOMATION_REGISTRY);
      expect(automationIds).toHaveLength(16);
    });

    it('chaque automation a un ID unique et valide', () => {
      const ids = new Set<string>();
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        expect(ids.has(automation.id)).toBe(false);
        ids.add(automation.id);
        expect(automation.id).toMatch(/^auto_[a-z_]+$/);
      }
    });

    it('chaque automation a toutes les propriétés requises', () => {
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        expect(automation.id).toBeDefined();
        expect(automation.name).toBeTruthy();
        expect(automation.description).toBeTruthy();
        expect(automation.icon).toBeTruthy();
        expect(automation.category).toBeDefined();
        expect(automation.executionType).toBeDefined();
        expect(automation.securityLevel).toBeDefined();
        expect(typeof automation.requiredPermission).toBe('number');
        expect(typeof automation.baseXpReward).toBe('number');
        expect(typeof automation.requiresConfirmation).toBe('boolean');
        expect(typeof automation.timeout).toBe('number');
        expect(typeof automation.cooldown).toBe('number');
        expect(Array.isArray(automation.tags)).toBe(true);
        expect(automation.version).toBeDefined();
      }
    });

    it('les niveaux de sécurité sont cohérents avec les permissions', () => {
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        // Safe automations ne devraient pas nécessiter permission > 1
        if (automation.securityLevel === 'safe') {
          expect(automation.requiredPermission).toBeLessThanOrEqual(1);
        }
        // Critical automations devraient nécessiter au moins permission 3
        if (automation.securityLevel === 'critical') {
          expect(automation.requiredPermission).toBeGreaterThanOrEqual(3);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getAutomation', () => {
    it('retourne l\'automation correcte par ID', () => {
      const automation = getAutomation('auto_backup');
      expect(automation).toBeDefined();
      expect(automation.id).toBe('auto_backup');
      expect(automation.name).toBe('Sauvegarde Automatique');
    });

    it('retourne toutes les automations existantes', () => {
      const allIds = getAllAutomationIds();
      for (const id of allIds) {
        const automation = getAutomation(id);
        expect(automation).toBeDefined();
        expect(automation.id).toBe(id);
      }
    });
  });

  describe('getAutomationsByCategory', () => {
    it('retourne les automations de la catégorie maintenance', () => {
      const maintenanceAutomations = getAutomationsByCategory('maintenance');
      expect(maintenanceAutomations.length).toBeGreaterThan(0);
      for (const auto of maintenanceAutomations) {
        expect(auto.category).toBe('maintenance');
      }
    });

    it('retourne les automations de la catégorie code_quality', () => {
      const codeQualityAutomations = getAutomationsByCategory('code_quality');
      expect(codeQualityAutomations.length).toBeGreaterThan(0);
      for (const auto of codeQualityAutomations) {
        expect(auto.category).toBe('code_quality');
      }
    });

    it('chaque catégorie a au moins une automation', () => {
      for (const category of CATEGORY_DISPLAY_ORDER) {
        const automations = getAutomationsByCategory(category);
        expect(automations.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('getAutomationsForMode', () => {
    it('retourne les automations disponibles pour le mode dev', () => {
      const devAutomations = getAutomationsForMode('dev');
      expect(devAutomations.length).toBeGreaterThan(5);

      // Dev mode devrait avoir accès aux automations de code
      const hasFormat = devAutomations.some(a => a.id === 'auto_format');
      const hasTypeCheck = devAutomations.some(a => a.id === 'auto_type_check');
      expect(hasFormat).toBe(true);
      expect(hasTypeCheck).toBe(true);
    });

    it('retourne les automations disponibles pour le mode default', () => {
      const defaultAutomations = getAutomationsForMode('default');
      // Default devrait avoir accès aux automations universelles (allowedModes: null)
      const hasGitStatus = defaultAutomations.some(a => a.id === 'auto_git_status');
      const hasHealthCheck = defaultAutomations.some(a => a.id === 'auto_health_check');
      expect(hasGitStatus).toBe(true);
      expect(hasHealthCheck).toBe(true);
    });

    it('mode admin a accès à plus d\'automations que default', () => {
      const adminAutomations = getAutomationsForMode('admin');
      const defaultAutomations = getAutomationsForMode('default');
      expect(adminAutomations.length).toBeGreaterThanOrEqual(defaultAutomations.length);
    });
  });

  describe('getAutomationsForPermission', () => {
    it('permission 0 donne accès aux automations safe uniquement', () => {
      const perm0Automations = getAutomationsForPermission(0);
      for (const auto of perm0Automations) {
        expect(auto.requiredPermission).toBe(0);
      }
    });

    it('permission 5 donne accès à toutes les automations', () => {
      const perm5Automations = getAutomationsForPermission(5);
      const allAutomations = Object.values(AUTOMATION_REGISTRY);
      expect(perm5Automations.length).toBe(allAutomations.length);
    });

    it('permissions plus élevées incluent les automations de niveaux inférieurs', () => {
      const perm1 = getAutomationsForPermission(1);
      const perm2 = getAutomationsForPermission(2);
      const perm3 = getAutomationsForPermission(3);

      expect(perm2.length).toBeGreaterThanOrEqual(perm1.length);
      expect(perm3.length).toBeGreaterThanOrEqual(perm2.length);
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

    it('autorise auto_git_status pour n\'importe quel mode avec permission 0', () => {
      const result = canExecuteAutomation('auto_git_status', 'default', 0, fullTools);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('refuse auto_backup pour mode default (non autorisé)', () => {
      const result = canExecuteAutomation('auto_backup', 'default', 5, fullTools);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('non autorisé');
    });

    it('refuse auto_backup pour permission insuffisante', () => {
      const result = canExecuteAutomation('auto_backup', 'dev', 1, fullTools);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Permission insuffisante');
    });

    it('autorise auto_backup pour dev avec permission 2', () => {
      const result = canExecuteAutomation('auto_backup', 'dev', 2, fullTools);
      expect(result.allowed).toBe(true);
    });

    it('refuse si outil requis manquant', () => {
      const limitedTools: Partial<ToolPermissions> = {};
      const result = canExecuteAutomation('auto_backup', 'dev', 5, limitedTools);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('non disponible');
    });

    it('retourne erreur pour automation inconnue', () => {
      const result = canExecuteAutomation('unknown_automation' as AutomationId, 'dev', 5, fullTools);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('inconnue');
    });
  });

  describe('calculateAutomationXP', () => {
    it('calcule l\'XP de base correctement', () => {
      const xp = calculateAutomationXP('auto_git_status', 'default', true);
      expect(xp).toBe(5); // baseXpReward de auto_git_status
    });

    it('retourne 0 si l\'exécution a échoué', () => {
      const xp = calculateAutomationXP('auto_backup', 'dev', false);
      expect(xp).toBe(0);
    });

    it('applique le multiplicateur de mode correctement', () => {
      // auto_audit avec mode audit a un multiplicateur de 2.0
      const xpAudit = calculateAutomationXP('auto_audit', 'audit', true);
      const xpDefault = calculateAutomationXP('auto_audit', 'default', true);

      expect(xpAudit).toBe(100); // 50 * 2.0
      expect(xpDefault).toBe(50); // Pas de multiplicateur
    });

    it('le multiplicateur dev augmente l\'XP pour auto_type_check', () => {
      const xpDev = calculateAutomationXP('auto_type_check', 'dev', true);
      const xpDefault = calculateAutomationXP('auto_type_check', 'default', true);

      expect(xpDev).toBeGreaterThan(xpDefault);
    });
  });

  describe('searchAutomationsByTag', () => {
    it('trouve les automations par tag exact', () => {
      const results = searchAutomationsByTag('git');
      expect(results.length).toBeGreaterThan(0);
      for (const auto of results) {
        expect(auto.tags.some(t => t.toLowerCase().includes('git'))).toBe(true);
      }
    });

    it('recherche insensible à la casse', () => {
      const resultsLower = searchAutomationsByTag('test');
      const resultsUpper = searchAutomationsByTag('TEST');
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('retourne un tableau vide pour tag inexistant', () => {
      const results = searchAutomationsByTag('nonexistent_tag_xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('getAutomationsSummary', () => {
    it('retourne le compte correct par catégorie', () => {
      const summary = getAutomationsSummary();

      // Vérifier que toutes les catégories sont présentes
      for (const category of CATEGORY_DISPLAY_ORDER) {
        expect(summary[category]).toBeDefined();
        expect(typeof summary[category]).toBe('number');
      }

      // Le total devrait être 16
      const total = Object.values(summary).reduce((a, b) => a + b, 0);
      expect(total).toBe(16);
    });
  });

  describe('getAllAutomationsSorted', () => {
    it('retourne toutes les automations triées par catégorie puis nom', () => {
      const sorted = getAllAutomationsSorted();
      expect(sorted).toHaveLength(16);

      // Vérifier le tri par catégorie
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const curr = sorted[i];

        if (prev.category === curr.category) {
          // Même catégorie: trié par nom
          expect(prev.name.localeCompare(curr.name)).toBeLessThanOrEqual(0);
        } else {
          // Catégorie différente: trié par catégorie
          expect(prev.category.localeCompare(curr.category)).toBeLessThan(0);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTANTS TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Constants', () => {
    it('CATEGORY_DISPLAY_ORDER contient 8 catégories', () => {
      expect(CATEGORY_DISPLAY_ORDER).toHaveLength(8);
    });

    it('CATEGORY_LABELS a un label pour chaque catégorie', () => {
      for (const category of CATEGORY_DISPLAY_ORDER) {
        expect(CATEGORY_LABELS[category]).toBeDefined();
        expect(CATEGORY_LABELS[category].label).toBeTruthy();
        expect(CATEGORY_LABELS[category].icon).toBeTruthy();
      }
    });

    it('SECURITY_LEVEL_LABELS a un label pour chaque niveau', () => {
      const levels: SecurityLevel[] = ['safe', 'moderate', 'elevated', 'critical'];
      for (const level of levels) {
        expect(SECURITY_LEVEL_LABELS[level]).toBeDefined();
        expect(SECURITY_LEVEL_LABELS[level].label).toBeTruthy();
        expect(SECURITY_LEVEL_LABELS[level].color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });

    it('MAX_CONCURRENT_EXECUTIONS est raisonnable', () => {
      expect(MAX_CONCURRENT_EXECUTIONS).toBeGreaterThanOrEqual(1);
      expect(MAX_CONCURRENT_EXECUTIONS).toBeLessThanOrEqual(10);
    });

    it('AUTOMATION_SYSTEM_VERSION est un semver valide', () => {
      expect(AUTOMATION_SYSTEM_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Integration', () => {
    it('toutes les automations sont accessibles par au moins un mode', () => {
      const allModes: ChatModeId[] = [
        'default', 'brainstorming', 'synthesis', 'planning',
        'journal', 'debug_cognitive', 'coach', 'dev', 'admin', 'strategy', 'audit'
      ];

      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        let accessible = false;

        for (const mode of allModes) {
          const automationsForMode = getAutomationsForMode(mode);
          if (automationsForMode.some(a => a.id === automation.id)) {
            accessible = true;
            break;
          }
        }

        expect(accessible).toBe(true);
      }
    });

    it('les automations avec confirmation ne sont pas de niveau safe', () => {
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        if (automation.requiresConfirmation) {
          expect(['moderate', 'elevated', 'critical']).toContain(automation.securityLevel);
        }
      }
    });

    it('les timeouts sont raisonnables (1s - 10min)', () => {
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        expect(automation.timeout).toBeGreaterThanOrEqual(1000);
        expect(automation.timeout).toBeLessThanOrEqual(600000);
      }
    });

    it('les cooldowns sont raisonnables (5s - 5min)', () => {
      for (const automation of Object.values(AUTOMATION_REGISTRY)) {
        expect(automation.cooldown).toBeGreaterThanOrEqual(5000);
        expect(automation.cooldown).toBeLessThanOrEqual(300000);
      }
    });
  });
});
