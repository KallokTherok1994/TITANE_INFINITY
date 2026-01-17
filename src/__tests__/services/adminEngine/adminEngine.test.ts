/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Tests Unitaires
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        adminEngine.test.ts
 * @version     vΩ∞Ω+
 *
 * Tests complets pour l'Admin & Monitoring Engine
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  // Types & Interfaces
  HealthLevel,
  LogSeverity,
  LogCategory,
  ModuleHealthStatus,
  TitaneModule,
  AdminRole,
  ActionResult,
  SystemMode,
  AdminVitals,
  ModuleStatus,
  AdminSnapshot,
  AdminLogRecord,
  AdminEvent,
  AdminActionDefinition,
  AlertThresholds,

  // Constantes
  ADMIN_ACTIONS_CATALOG,
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_RETENTION_CONFIG,
  DEFAULT_DASHBOARD_CONFIG,
  MODULE_DISPLAY_NAMES,
  MODULE_ICONS,
  HEALTH_LEVEL_COLORS,
  LOG_SEVERITY_COLORS,
  MODULE_STATUS_COLORS,

  // Fonctions utilitaires
  generateAdminId,
  determineHealthLevel,
  hasPermission,
  getActionsForRole,
  checkPreconditions,
  calculateHealthScore,
  scoreToGrade,
  formatDuration,
  formatBytes,
  formatTimestamp,
  createEmptySnapshot,
  createLogRecord,
  createAdminEvent,

  // Services
  LogEngine,
  getLogEngine,
  resetLogEngine,
  ActionsEngine,
  getActionsEngine,
  resetActionsEngine,
  AdminEngine,
  getAdminEngine,
  resetAdminEngine,
} from '../../../services/adminEngine';

// =============================================================================
// SETUP / TEARDOWN
// =============================================================================

beforeEach(() => {
  // Reset toutes les instances singleton
  resetLogEngine();
  resetActionsEngine();
  resetAdminEngine();
});

afterEach(() => {
  vi.clearAllMocks();
});

// =============================================================================
// TESTS - TYPES & CONSTANTES
// =============================================================================

describe('Admin Engine - Types & Constantes', () => {
  describe('ADMIN_ACTIONS_CATALOG', () => {
    it('devrait contenir au moins 10 actions', () => {
      expect(ADMIN_ACTIONS_CATALOG.length).toBeGreaterThanOrEqual(10);
    });

    it('chaque action devrait avoir un ID unique', () => {
      const ids = ADMIN_ACTIONS_CATALOG.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('chaque action devrait avoir les propriétés requises', () => {
      for (const action of ADMIN_ACTIONS_CATALOG) {
        expect(action).toHaveProperty('id');
        expect(action).toHaveProperty('displayName');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('category');
        expect(action).toHaveProperty('permissionLevel');
        expect(action).toHaveProperty('reversible');
        expect(action).toHaveProperty('requiresConfirmation');
        expect(action).toHaveProperty('icon');
        expect(action).toHaveProperty('tags');
        expect(Array.isArray(action.tags)).toBe(true);
      }
    });

    it('devrait contenir des actions pour chaque catégorie', () => {
      const categories = new Set(ADMIN_ACTIONS_CATALOG.map(a => a.category));
      expect(categories.has('CACHE')).toBe(true);
      expect(categories.has('RESET')).toBe(true);
      expect(categories.has('CONFIG')).toBe(true);
      expect(categories.has('HEALING')).toBe(true);
      expect(categories.has('PERFORMANCE')).toBe(true);
      expect(categories.has('SYSTEM')).toBe(true);
    });
  });

  describe('DEFAULT_ALERT_THRESHOLDS', () => {
    it('devrait avoir des seuils CPU raisonnables', () => {
      expect(DEFAULT_ALERT_THRESHOLDS.cpuWarning).toBeLessThan(
        DEFAULT_ALERT_THRESHOLDS.cpuCritical
      );
      expect(DEFAULT_ALERT_THRESHOLDS.cpuWarning).toBeGreaterThan(0);
      expect(DEFAULT_ALERT_THRESHOLDS.cpuCritical).toBeLessThanOrEqual(100);
    });

    it('devrait avoir des seuils RAM raisonnables', () => {
      expect(DEFAULT_ALERT_THRESHOLDS.ramWarning).toBeLessThan(
        DEFAULT_ALERT_THRESHOLDS.ramCritical
      );
      expect(DEFAULT_ALERT_THRESHOLDS.ramWarning).toBeGreaterThan(0);
      expect(DEFAULT_ALERT_THRESHOLDS.ramCritical).toBeLessThanOrEqual(100);
    });

    it('devrait avoir des seuils FPS raisonnables', () => {
      expect(DEFAULT_ALERT_THRESHOLDS.fpsWarning).toBeGreaterThan(
        DEFAULT_ALERT_THRESHOLDS.fpsCritical
      );
      expect(DEFAULT_ALERT_THRESHOLDS.fpsCritical).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MODULE_DISPLAY_NAMES', () => {
    it('devrait avoir un nom pour chaque module', () => {
      const modules: TitaneModule[] = [
        'selfHealing',
        'performance',
        'memory',
        'prompt',
        'cognitive',
        'tools',
        'search',
        'xp',
        'evolution',
        'tts',
        'avatar',
        'chat',
        'ollama',
        'gemini',
        'tauri',
        'vite',
        'admin',
      ];

      for (const module of modules) {
        expect(MODULE_DISPLAY_NAMES[module]).toBeDefined();
        expect(typeof MODULE_DISPLAY_NAMES[module]).toBe('string');
      }
    });
  });

  describe('Couleurs', () => {
    it('HEALTH_LEVEL_COLORS devrait avoir toutes les couleurs', () => {
      expect(HEALTH_LEVEL_COLORS.OK).toBeDefined();
      expect(HEALTH_LEVEL_COLORS.WARNING).toBeDefined();
      expect(HEALTH_LEVEL_COLORS.ALERT).toBeDefined();
      expect(HEALTH_LEVEL_COLORS.CRITICAL).toBeDefined();
    });

    it('LOG_SEVERITY_COLORS devrait avoir toutes les couleurs', () => {
      expect(LOG_SEVERITY_COLORS.DEBUG).toBeDefined();
      expect(LOG_SEVERITY_COLORS.INFO).toBeDefined();
      expect(LOG_SEVERITY_COLORS.WARN).toBeDefined();
      expect(LOG_SEVERITY_COLORS.ERROR).toBeDefined();
      expect(LOG_SEVERITY_COLORS.CRITICAL).toBeDefined();
    });

    it('MODULE_STATUS_COLORS devrait avoir toutes les couleurs', () => {
      expect(MODULE_STATUS_COLORS.HEALTHY).toBeDefined();
      expect(MODULE_STATUS_COLORS.DEGRADED).toBeDefined();
      expect(MODULE_STATUS_COLORS.CRITICAL).toBeDefined();
      expect(MODULE_STATUS_COLORS.OFFLINE).toBeDefined();
      expect(MODULE_STATUS_COLORS.RECOVERING).toBeDefined();
      expect(MODULE_STATUS_COLORS.UNKNOWN).toBeDefined();
    });
  });
});

// =============================================================================
// TESTS - FONCTIONS UTILITAIRES
// =============================================================================

describe('Admin Engine - Fonctions Utilitaires', () => {
  describe('generateAdminId', () => {
    it('devrait générer un ID unique', () => {
      const id1 = generateAdminId();
      const id2 = generateAdminId();
      expect(id1).not.toBe(id2);
    });

    it('devrait utiliser le prefix spécifié', () => {
      const id = generateAdminId('test');
      expect(id.startsWith('test_')).toBe(true);
    });

    it('devrait utiliser le prefix par défaut "adm"', () => {
      const id = generateAdminId();
      expect(id.startsWith('adm_')).toBe(true);
    });
  });

  describe('determineHealthLevel', () => {
    it('devrait retourner CRITICAL pour CPU très élevé', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 95,
        cpuGlobal: 80,
        ramProcess: 0,
        ramProcessPercent: 50,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 0,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 60,
        threadsActive: 0,
        uptime: 0,
      };
      expect(determineHealthLevel(vitals)).toBe('CRITICAL');
    });

    it('devrait retourner WARNING pour CPU modérément élevé', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 75,
        cpuGlobal: 60,
        ramProcess: 0,
        ramProcessPercent: 50,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 0,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 60,
        threadsActive: 0,
        uptime: 0,
      };
      expect(determineHealthLevel(vitals)).toBe('WARNING');
    });

    it('devrait retourner OK pour des métriques normales', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 30,
        cpuGlobal: 40,
        ramProcess: 0,
        ramProcessPercent: 50,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 50,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 60,
        threadsActive: 0,
        uptime: 0,
      };
      expect(determineHealthLevel(vitals)).toBe('OK');
    });

    it('devrait retourner CRITICAL pour FPS très bas', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 30,
        cpuGlobal: 40,
        ramProcess: 0,
        ramProcessPercent: 50,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 50,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 10,
        threadsActive: 0,
        uptime: 0,
      };
      expect(determineHealthLevel(vitals)).toBe('CRITICAL');
    });
  });

  describe('hasPermission', () => {
    const adminOnlyAction: AdminActionDefinition = {
      id: 'test_admin',
      displayName: 'Test Admin',
      description: 'Test',
      category: 'SYSTEM',
      targetModule: null,
      permissionLevel: 'ADMIN_ONLY',
      reversible: false,
      requiresConfirmation: false,
      icon: 'Settings',
      color: 'neutral',
      preconditions: [],
      estimatedDuration: 0,
      tags: [],
    };

    const devOrAdminAction: AdminActionDefinition = {
      ...adminOnlyAction,
      id: 'test_dev',
      permissionLevel: 'DEV_OR_ADMIN',
    };

    const allAction: AdminActionDefinition = {
      ...adminOnlyAction,
      id: 'test_all',
      permissionLevel: 'ALL',
    };

    it('ADMIN devrait avoir accès à toutes les actions', () => {
      expect(hasPermission('ADMIN', adminOnlyAction)).toBe(true);
      expect(hasPermission('ADMIN', devOrAdminAction)).toBe(true);
      expect(hasPermission('ADMIN', allAction)).toBe(true);
    });

    it('DEV devrait avoir accès aux actions DEV_OR_ADMIN et ALL', () => {
      expect(hasPermission('DEV', adminOnlyAction)).toBe(false);
      expect(hasPermission('DEV', devOrAdminAction)).toBe(true);
      expect(hasPermission('DEV', allAction)).toBe(true);
    });

    it('USER devrait seulement avoir accès aux actions ALL', () => {
      expect(hasPermission('USER', adminOnlyAction)).toBe(false);
      expect(hasPermission('USER', devOrAdminAction)).toBe(false);
      expect(hasPermission('USER', allAction)).toBe(true);
    });
  });

  describe('getActionsForRole', () => {
    it('ADMIN devrait avoir toutes les actions', () => {
      const actions = getActionsForRole('ADMIN');
      expect(actions.length).toBe(ADMIN_ACTIONS_CATALOG.length);
    });

    it("DEV devrait avoir moins d'actions que ADMIN", () => {
      const adminActions = getActionsForRole('ADMIN');
      const devActions = getActionsForRole('DEV');
      expect(devActions.length).toBeLessThan(adminActions.length);
    });

    it('USER devrait avoir très peu ou aucune action', () => {
      const userActions = getActionsForRole('USER');
      expect(userActions.length).toBe(0);
    });
  });

  describe('checkPreconditions', () => {
    const snapshot = createEmptySnapshot();

    it('devrait valider une action sans préconditions', () => {
      const action: AdminActionDefinition = {
        id: 'test',
        displayName: 'Test',
        description: 'Test',
        category: 'SYSTEM',
        targetModule: null,
        permissionLevel: 'ADMIN_ONLY',
        reversible: false,
        requiresConfirmation: false,
        icon: 'Settings',
        color: 'neutral',
        preconditions: [],
        estimatedDuration: 0,
        tags: [],
      };

      const result = checkPreconditions(action, snapshot);
      expect(result.valid).toBe(true);
      expect(result.failedConditions).toHaveLength(0);
    });

    it('devrait échouer pour un mode système incorrect', () => {
      const action: AdminActionDefinition = {
        id: 'test',
        displayName: 'Test',
        description: 'Test',
        category: 'SYSTEM',
        targetModule: null,
        permissionLevel: 'ADMIN_ONLY',
        reversible: false,
        requiresConfirmation: false,
        icon: 'Settings',
        color: 'neutral',
        preconditions: [
          {
            type: 'SYSTEM_MODE',
            expectedValue: ['PROFILING'],
            failureMessage: 'Mode profiling requis',
          },
        ],
        estimatedDuration: 0,
        tags: [],
      };

      const result = checkPreconditions(action, snapshot);
      expect(result.valid).toBe(false);
      expect(result.failedConditions).toContain('Mode profiling requis');
    });
  });

  describe('calculateHealthScore', () => {
    it('devrait retourner 100 pour un système parfait', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 20,
        cpuGlobal: 30,
        ramProcess: 0,
        ramProcessPercent: 40,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 50,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 60,
        threadsActive: 0,
        uptime: 0,
      };

      const emptyModules = createEmptySnapshot().modules;
      // Mettre tous les modules en HEALTHY
      for (const key of Object.keys(emptyModules)) {
        emptyModules[key as TitaneModule].status = 'HEALTHY';
      }

      const score = calculateHealthScore(vitals, emptyModules);
      expect(score).toBe(100);
    });

    it('devrait pénaliser un CPU élevé', () => {
      const vitals: AdminVitals = {
        timestamp: Date.now(),
        cpuProcess: 95,
        cpuGlobal: 30,
        ramProcess: 0,
        ramProcessPercent: 40,
        ramSystemUsed: 0,
        ramSystemTotal: 0,
        ioReadRate: 0,
        ioWriteRate: 0,
        tauriLatency: 50,
        ollamaLatency: 100,
        geminiLatency: 100,
        fps: 60,
        threadsActive: 0,
        uptime: 0,
      };

      const emptyModules = createEmptySnapshot().modules;
      for (const key of Object.keys(emptyModules)) {
        emptyModules[key as TitaneModule].status = 'HEALTHY';
      }

      const score = calculateHealthScore(vitals, emptyModules);
      expect(score).toBeLessThan(100);
    });
  });

  describe('scoreToGrade', () => {
    it('devrait retourner S pour score >= 95', () => {
      expect(scoreToGrade(100)).toBe('S');
      expect(scoreToGrade(95)).toBe('S');
    });

    it('devrait retourner A pour score 85-94', () => {
      expect(scoreToGrade(94)).toBe('A');
      expect(scoreToGrade(85)).toBe('A');
    });

    it('devrait retourner B pour score 70-84', () => {
      expect(scoreToGrade(84)).toBe('B');
      expect(scoreToGrade(70)).toBe('B');
    });

    it('devrait retourner C pour score 55-69', () => {
      expect(scoreToGrade(69)).toBe('C');
      expect(scoreToGrade(55)).toBe('C');
    });

    it('devrait retourner D pour score 40-54', () => {
      expect(scoreToGrade(54)).toBe('D');
      expect(scoreToGrade(40)).toBe('D');
    });

    it('devrait retourner F pour score < 40', () => {
      expect(scoreToGrade(39)).toBe('F');
      expect(scoreToGrade(0)).toBe('F');
    });
  });

  describe('formatDuration', () => {
    it('devrait formater les millisecondes', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('devrait formater les secondes', () => {
      expect(formatDuration(5000)).toBe('5.0s');
    });

    it('devrait formater les minutes', () => {
      expect(formatDuration(120000)).toBe('2.0min');
    });

    it('devrait formater les heures', () => {
      expect(formatDuration(3600000)).toBe('1.0h');
    });
  });

  describe('formatBytes', () => {
    it('devrait formater 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('devrait formater les bytes', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('devrait formater les KB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('devrait formater les MB', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });

    it('devrait formater les GB', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('createEmptySnapshot', () => {
    it('devrait créer un snapshot avec un ID', () => {
      const snapshot = createEmptySnapshot();
      expect(snapshot.id).toBeDefined();
      expect(snapshot.id.startsWith('snap_')).toBe(true);
    });

    it('devrait avoir le niveau de santé OK par défaut', () => {
      const snapshot = createEmptySnapshot();
      expect(snapshot.healthLevel).toBe('OK');
    });

    it('devrait avoir un score de santé de 100', () => {
      const snapshot = createEmptySnapshot();
      expect(snapshot.healthScore).toBe(100);
    });

    it('devrait avoir le mode NORMAL par défaut', () => {
      const snapshot = createEmptySnapshot();
      expect(snapshot.systemMode).toBe('NORMAL');
    });

    it('devrait avoir tous les modules initialisés', () => {
      const snapshot = createEmptySnapshot();
      expect(Object.keys(snapshot.modules).length).toBeGreaterThanOrEqual(15);
    });
  });

  describe('createLogRecord', () => {
    it('devrait créer un log avec les propriétés correctes', () => {
      const log = createLogRecord('INFO', 'SYSTEM', 'admin', 'Test message');
      expect(log.severity).toBe('INFO');
      expect(log.category).toBe('SYSTEM');
      expect(log.moduleId).toBe('admin');
      expect(log.message).toBe('Test message');
      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeDefined();
    });
  });

  describe('createAdminEvent', () => {
    it('devrait créer un événement avec les propriétés correctes', () => {
      const event = createAdminEvent(
        'SYSTEM',
        'TEST',
        'admin',
        'Test Event',
        'Description'
      );
      expect(event.source).toBe('SYSTEM');
      expect(event.type).toBe('TEST');
      expect(event.moduleId).toBe('admin');
      expect(event.title).toBe('Test Event');
      expect(event.description).toBe('Description');
      expect(event.resolved).toBe(false);
    });
  });
});

// =============================================================================
// TESTS - LOG ENGINE
// =============================================================================

describe('Admin Engine - LogEngine', () => {
  let logEngine: LogEngine;

  beforeEach(() => {
    logEngine = getLogEngine();
  });

  describe('Ajout de logs', () => {
    it('devrait ajouter un log via log()', () => {
      const record = logEngine.log('INFO', 'SYSTEM', 'admin', 'Test');
      expect(record.message).toBe('Test');

      const logs = logEngine.getRecentLogs(10);
      expect(logs.length).toBe(1);
    });

    it('devrait ajouter un log via debug()', () => {
      logEngine.debug('admin', 'Debug message');
      const logs = logEngine.getRecentLogs(10);
      expect(logs[0].severity).toBe('DEBUG');
    });

    it('devrait ajouter un log via info()', () => {
      logEngine.info('admin', 'Info message');
      const logs = logEngine.getRecentLogs(10);
      expect(logs[0].severity).toBe('INFO');
    });

    it('devrait ajouter un log via warn()', () => {
      logEngine.warn('admin', 'Warning message');
      const logs = logEngine.getRecentLogs(10);
      expect(logs[0].severity).toBe('WARN');
    });

    it('devrait ajouter un log via error()', () => {
      logEngine.error('admin', 'Error message', 'Details');
      const logs = logEngine.getRecentLogs(10);
      expect(logs[0].severity).toBe('ERROR');
      expect(logs[0].details).toBe('Details');
    });

    it('devrait ajouter un log via critical()', () => {
      logEngine.critical('admin', 'Critical message');
      const logs = logEngine.getRecentLogs(10);
      expect(logs[0].severity).toBe('CRITICAL');
    });
  });

  describe('Recherche de logs', () => {
    beforeEach(() => {
      logEngine.info('admin', 'Admin message', { key: 'value' });
      logEngine.warn('performance', 'Performance warning');
      logEngine.error('memory', 'Memory error');
    });

    it('devrait filtrer par sévérité', () => {
      const result = logEngine.searchLogs({ severities: ['ERROR'] });
      expect(result.logs.length).toBe(1);
      expect(result.logs[0].severity).toBe('ERROR');
    });

    it('devrait filtrer par module', () => {
      const result = logEngine.searchLogs({ modules: ['admin'] });
      expect(result.logs.length).toBe(1);
      expect(result.logs[0].moduleId).toBe('admin');
    });

    it('devrait rechercher par texte', () => {
      const result = logEngine.searchLogs({ searchText: 'warning' });
      expect(result.logs.length).toBe(1);
      expect(result.logs[0].message).toContain('warning');
    });

    it('devrait retourner le nombre total', () => {
      const result = logEngine.searchLogs({});
      expect(result.totalCount).toBe(3);
    });
  });

  describe('Événements', () => {
    it('devrait ajouter un événement', () => {
      const event = logEngine.addEvent(
        'SYSTEM',
        'TEST',
        'admin',
        'Test Event',
        'Description'
      );
      expect(event.title).toBe('Test Event');

      const events = logEngine.getRecentEvents(10);
      expect(events.length).toBe(1);
    });

    it('devrait résoudre un événement', () => {
      const event = logEngine.addEvent('SYSTEM', 'TEST', 'admin', 'Test', 'Desc');
      expect(event.resolved).toBe(false);

      const success = logEngine.resolveEvent(event.id);
      expect(success).toBe(true);

      const events = logEngine.getRecentEvents(10);
      expect(events[0].resolved).toBe(true);
    });
  });

  describe('Purge', () => {
    it('devrait purger les logs anciens', () => {
      // Ajouter des logs
      logEngine.info('admin', 'Test 1');
      logEngine.info('admin', 'Test 2');

      // Purger (tout devrait rester car récent)
      const result = logEngine.purgeLogs(7);
      expect(result.success).toBe(true);
    });
  });

  describe('Statistiques', () => {
    beforeEach(() => {
      logEngine.info('admin', 'Info 1');
      logEngine.info('admin', 'Info 2');
      logEngine.warn('performance', 'Warning');
      logEngine.error('memory', 'Error');
    });

    it('devrait calculer les statistiques correctement', () => {
      const stats = logEngine.getLogStats();
      expect(stats.total).toBe(4);
      expect(stats.bySeverity.INFO).toBe(2);
      expect(stats.bySeverity.WARN).toBe(1);
      expect(stats.bySeverity.ERROR).toBe(1);
    });
  });

  describe('Listeners', () => {
    it('devrait notifier les listeners de nouveaux logs', () => {
      const callback = vi.fn();
      const unsubscribe = logEngine.onLog(callback);

      logEngine.info('admin', 'Test');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ message: 'Test' }));

      unsubscribe();
    });

    it('devrait notifier les listeners de nouveaux événements', () => {
      const callback = vi.fn();
      const unsubscribe = logEngine.onEvent(callback);

      logEngine.addEvent('SYSTEM', 'TEST', 'admin', 'Test', 'Desc');

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
    });
  });
});

// =============================================================================
// TESTS - ACTIONS ENGINE
// =============================================================================

describe('Admin Engine - ActionsEngine', () => {
  let actionsEngine: ActionsEngine;

  beforeEach(() => {
    actionsEngine = getActionsEngine();
  });

  describe('Catalogue', () => {
    it('devrait retourner les actions disponibles pour ADMIN', () => {
      const actions = actionsEngine.getAvailableActions('ADMIN');
      expect(actions.length).toBe(ADMIN_ACTIONS_CATALOG.length);
    });

    it("devrait retourner moins d'actions pour DEV", () => {
      const adminActions = actionsEngine.getAvailableActions('ADMIN');
      const devActions = actionsEngine.getAvailableActions('DEV');
      expect(devActions.length).toBeLessThan(adminActions.length);
    });

    it('devrait retourner une action par ID', () => {
      const action = actionsEngine.getActionById('purge_tts_cache');
      expect(action).toBeDefined();
      expect(action?.displayName).toBe('Purger Cache TTS');
    });

    it('devrait filtrer par catégorie', () => {
      const cacheActions = actionsEngine.getActionsByCategory('CACHE');
      expect(cacheActions.every(a => a.category === 'CACHE')).toBe(true);
    });

    it('devrait rechercher des actions', () => {
      const results = actionsEngine.searchActions('cache');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(a => a.tags.includes('cache'))).toBe(true);
    });
  });

  describe('Vérification', () => {
    it('devrait vérifier si une action peut être exécutée', async () => {
      const snapshot = createEmptySnapshot();
      const result = actionsEngine.canExecute('force_gc', 'DEV', snapshot);
      expect(result.canExecute).toBe(true);
    });

    it('devrait refuser une action sans permission', async () => {
      const snapshot = createEmptySnapshot();
      const result = actionsEngine.canExecute('enable_safe_mode', 'DEV', snapshot);
      expect(result.canExecute).toBe(false);
      expect(result.reason).toContain('Permission');
    });
  });

  describe('Historique', () => {
    it('devrait être vide au départ', () => {
      const history = actionsEngine.getActionHistory();
      expect(history.length).toBe(0);
    });

    it("devrait permettre de vider l'historique", () => {
      actionsEngine.clearHistory();
      const history = actionsEngine.getActionHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('Handlers personnalisés', () => {
    it("devrait permettre d'enregistrer un handler", () => {
      const handler = vi.fn().mockResolvedValue({
        requestId: 'test',
        actionId: 'custom',
        result: 'SUCCESS' as ActionResult,
        message: 'OK',
        startedAt: Date.now(),
        completedAt: Date.now(),
        duration: 0,
        rollbackAvailable: false,
      });

      actionsEngine.registerHandler('custom_action', handler);
      actionsEngine.unregisterHandler('custom_action');
    });
  });
});

// =============================================================================
// TESTS - ADMIN ENGINE (FACADE)
// =============================================================================

describe('Admin Engine - Facade', () => {
  let adminEngine: AdminEngine;

  beforeEach(() => {
    adminEngine = getAdminEngine();
  });

  describe('Initialisation', () => {
    it("devrait s'initialiser correctement", () => {
      adminEngine.initialize();
      // Pas d'erreur = succès
      expect(true).toBe(true);
    });

    it('devrait être idempotent', () => {
      adminEngine.initialize();
      adminEngine.initialize();
      // Pas d'erreur = succès
      expect(true).toBe(true);
    });
  });

  describe('Logs', () => {
    it('devrait logger via la facade', () => {
      adminEngine.info('admin', 'Test message');
      const logs = adminEngine.getRecentLogs(10);
      expect(logs.length).toBe(1);
    });

    it('devrait rechercher les logs', () => {
      adminEngine.info('admin', 'Info');
      adminEngine.warn('performance', 'Warning');

      const result = adminEngine.searchLogs({ severities: ['INFO'] });
      expect(result.logs.length).toBe(1);
    });
  });

  describe('Événements', () => {
    it('devrait ajouter un événement via la facade', () => {
      const event = adminEngine.addEvent(
        'SYSTEM',
        'TEST',
        'admin',
        'Test',
        'Description'
      );
      expect(event.title).toBe('Test');

      const events = adminEngine.getRecentEvents(10);
      expect(events.length).toBe(1);
    });
  });

  describe('Actions', () => {
    it('devrait récupérer les actions disponibles', () => {
      const actions = adminEngine.getAvailableActions('ADMIN');
      expect(actions.length).toBeGreaterThan(0);
    });

    it('devrait vérifier si une action peut être exécutée', async () => {
      const result = await adminEngine.canExecuteAction('force_gc', 'ADMIN');
      expect(result.canExecute).toBe(true);
    });
  });

  describe('Statistiques', () => {
    it('devrait retourner les stats des logs', () => {
      adminEngine.info('admin', 'Test');
      const stats = adminEngine.getLogStats();
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe('Cleanup', () => {
    it('devrait disposer correctement', () => {
      adminEngine.initialize();
      adminEngine.dispose();
      // Pas d'erreur = succès
      expect(true).toBe(true);
    });
  });
});

// =============================================================================
// TESTS - SINGLETON
// =============================================================================

describe('Admin Engine - Singleton', () => {
  it('getAdminEngine devrait retourner la même instance', () => {
    const engine1 = getAdminEngine();
    const engine2 = getAdminEngine();
    expect(engine1).toBe(engine2);
  });

  it('resetAdminEngine devrait créer une nouvelle instance', () => {
    const engine1 = getAdminEngine();
    resetAdminEngine();
    const engine2 = getAdminEngine();
    expect(engine1).not.toBe(engine2);
  });

  it('getLogEngine devrait retourner la même instance', () => {
    const engine1 = getLogEngine();
    const engine2 = getLogEngine();
    expect(engine1).toBe(engine2);
  });

  it('getActionsEngine devrait retourner la même instance', () => {
    const engine1 = getActionsEngine();
    const engine2 = getActionsEngine();
    expect(engine1).toBe(engine2);
  });
});
