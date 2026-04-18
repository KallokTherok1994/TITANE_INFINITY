/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   useAppInitialization — Initialisation des services au démarrage
 *   Extrait de App.tsx (Phase 3 — Shell mince)
 *   Regroupe les useEffects d'init de services non-UI de AppRouter
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { initializeOllama } from '../services/ai/providers/ollama';
import { consoleMonitor } from '../services/monitoring/consoleMonitor';
import { initMonitoringAsync } from '../services/monitoring';
import { presenceOS } from '../engines/presence/_stubs';
import { loadSavedZoom } from './useZoomControl';
import { logger } from '../lib/logger';

const OLLAMA_ENABLED_STORAGE_KEY = 'titane_ollama_enabled';
const EXTERNAL_AI_STORAGE_KEY = 'titane.enable_external_ai';
const PREFERRED_PROVIDER_STORAGE_KEY = 'omega-chat-preferred-provider';

export const useAppInitialization = (): void => {
  // ─── AI runtime defaults (localStorage) ───────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storage = window.localStorage;
      let updated = false;

      if (!storage.getItem(OLLAMA_ENABLED_STORAGE_KEY)) {
        storage.setItem(OLLAMA_ENABLED_STORAGE_KEY, '1');
        updated = true;
      }

      if (!storage.getItem(PREFERRED_PROVIDER_STORAGE_KEY)) {
        storage.setItem(PREFERRED_PROVIDER_STORAGE_KEY, 'auto');
        updated = true;
      }

      if (!storage.getItem(EXTERNAL_AI_STORAGE_KEY)) {
        storage.setItem(EXTERNAL_AI_STORAGE_KEY, '1');
        updated = true;
      }

      if (updated) {
        logger.info('AI runtime defaults activated', {
          component: 'App',
          ollamaEnabled: storage.getItem(OLLAMA_ENABLED_STORAGE_KEY) ?? '0',
          preferredProvider: storage.getItem(PREFERRED_PROVIDER_STORAGE_KEY) ?? 'auto',
          externalAIEnabled: storage.getItem(EXTERNAL_AI_STORAGE_KEY) ?? '0',
        });
      }
    } catch (error) {
      logger.warn('Unable to seed AI runtime defaults', {
        component: 'App',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  // ─── Monitoring lazy loader boot ──────────────────────────────────────────
  useEffect(() => {
    let active = true;

    void initMonitoringAsync('boot').then(initialized => {
      if (!active) {
        return;
      }

      if (initialized) {
        logger.info('Monitoring lazy loader requested from canonical boot', {
          component: 'Monitoring',
          source: 'boot',
        });
        return;
      }

      logger.warn('Monitoring lazy loader boot request did not complete', {
        component: 'Monitoring',
        source: 'boot',
      });
    });

    return () => {
      active = false;
    };
  }, []);

  // ─── Ollama local AI provider ──────────────────────────────────────────────
  useEffect(() => {
    const envEnabled = import.meta.env.VITE_OLLAMA_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_ollama_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    if (!envEnabled && !userEnabled) {
      return;
    }

    logger.info('Initializing local AI provider', {
      component: 'Ollama',
      optIn: envEnabled ? 'env' : 'user',
    });

    initializeOllama().catch((error: unknown) => {
      logger.error(
        'Failed to initialize OLLAMA',
        { component: 'App', service: 'Ollama' },
        error as Error
      );
      toast.warning('Ollama non disponible', {
        description:
          "Le moteur IA local est inaccessible. Vérifiez qu'Ollama est installé et démarré (ollama serve).",
        duration: 8000,
      });
    });
  }, []);

  // ─── Console monitor (dev only) ────────────────────────────────────────────
  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.info(
        '🔍 [CONSOLE-MONITOR] Starting console monitoring & auto-heal integration...'
      );
      try {
        consoleMonitor.start();
        logger.info('Console monitor started', {
          component: 'App',
          service: 'ConsoleMonitor',
        });
      } catch (error) {
        logger.error(
          'Failed to start console monitor',
          { component: 'App', service: 'ConsoleMonitor' },
          error as Error
        );
      }
    }

    return () => {
      if (import.meta.env.DEV) {
        consoleMonitor.stop();
      }
    };
  }, []);

  // ─── Zoom restore + local network security mode ────────────────────────────
  useEffect(() => {
    loadSavedZoom();

    import('../lib/security')
      .then(({ enableLocalNetworkMode }) => {
        enableLocalNetworkMode();
        logger.info('Local network mode enabled - reduced restrictions', {
          component: 'Security',
        });
      })
      .catch(err => {
        logger.warn('Failed to enable local network mode', {
          component: 'Security',
          error: err,
        });
      });
  }, []);

  // ─── Auto-backup service ───────────────────────────────────────────────────
  useEffect(() => {
    const envEnabled = import.meta.env.VITE_AUTO_BACKUP_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_auto_backup_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

    import('../services/backup/AutoBackupService')
      .then(({ autoBackupService }) => {
        autoBackupService.initialize();
        logger.info('💾 [BACKUP] Auto-backup service initialized (6h intervals)');
      })
      .catch(err => {
        logger.warn('⚠️ [BACKUP] Failed to initialize auto-backup:', err);
      });
  }, []);

  // ─── i18n lazy init ────────────────────────────────────────────────────────
  useEffect(() => {
    import('../i18n')
      .then(({ initI18nAsync }) => {
        initI18nAsync();
      })
      .catch(error => {
        logger.warn('i18n lazy initialization failed', {
          component: 'i18n',
          error,
        });
      });
  }, []);

  // ─── Cognitive cache → SingularityKernel ──────────────────────────────────
  useEffect(() => {
    logger.info('🧠 [COGNITIVE-CACHE] Connecting to SingularityKernel...');

    Promise.all([import('../services/ai/singularityKernel'), import('../services/ai')])
      .then(([{ singularityKernel }, { connectCacheToSingularity }]) => {
        try {
          connectCacheToSingularity(singularityKernel);
          logger.info('✅ [COGNITIVE-CACHE] Connected successfully');
        } catch (error) {
          logger.error(
            'Connection failed',
            { component: 'App', service: 'CognitiveCache' },
            error as Error
          );
        }
      })
      .catch(error => {
        logger.warn('Failed to load cognitive cache', {
          component: 'CognitiveCache',
          error,
        });
      });
  }, []);

  // ─── Auto-audit engine ─────────────────────────────────────────────────────
  useEffect(() => {
    let started = false;

    const envEnabled = import.meta.env.VITE_AUTO_AUDIT_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_auto_audit_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

    logger.info('🔍 [AUTO-AUDIT] Loading automatic audits...');
    import('../services/autoAuditEngine')
      .then(({ autoAuditEngine }) => {
        if (!started) {
          autoAuditEngine.start();
          started = true;
          logger.info('✅ [AUTO-AUDIT] Started');
        }

        return () => {
          autoAuditEngine.stop();
        };
      })
      .catch(err => {
        logger.warn('⚠️ [AUTO-AUDIT] Failed to load:', err);
      });
  }, []);

  // ─── Telemetry + self-healing singletons ───────────────────────────────────
  useEffect(() => {
    import('../utils/telemetryEngine').catch(err => {
      logger.warn('⚠️ [TELEMETRY] Failed to load:', err);
    });
  }, []);

  // ─── Cognitive Layout Engine ───────────────────────────────────────────────
  useEffect(() => {
    let started = false;

    const envEnabled = import.meta.env.VITE_COGNITIVE_LAYOUT_ENGINE_ENABLED === '1';
    let userEnabled = false;
    try {
      const raw = localStorage.getItem('titane_cognitive_layout_engine_enabled');
      userEnabled = raw === '1' || raw === 'true';
    } catch {
      userEnabled = false;
    }

    const enabled = import.meta.env.DEV || envEnabled || userEnabled;
    if (!enabled) {
      return;
    }

    logger.info('🧠 [COGNITIVE] Loading Cognitive Layout Engine...');
    import('../engines/cognitive/cognitiveLayoutEngine')
      .then(({ cognitiveLayoutEngine }) => {
        if (!started) {
          cognitiveLayoutEngine.start();
          started = true;
          logger.info('✅ [COGNITIVE] Cognitive Layout Engine started');
        }

        return () => {
          cognitiveLayoutEngine.stop();
        };
      })
      .catch(err => {
        logger.warn('Failed to load Cognitive Layout Engine', {
          component: 'CognitiveLayout',
          error: err,
        });
      });
  }, []);

  // ─── UI Micro-interactions ─────────────────────────────────────────────────
  useEffect(() => {
    logger.info('Loading TITANE∞ micro-interactions', {
      component: 'UIPolish',
    });
    import('../ui/motion')
      .then(({ initializeMicroInteractions }) => {
        try {
          initializeMicroInteractions();
          logger.info(
            'Micro-interactions initialized (Ripple, Magnetism, Focus Glow, Tooltips)',
            { component: 'UIPolish' }
          );
        } catch (error) {
          logger.error(
            'Failed to initialize micro-interactions',
            { component: 'App', service: 'UIPolish' },
            error as Error
          );
        }
      })
      .catch(err => {
        logger.warn('Failed to load motion module', {
          component: 'UIPolish',
          error: err,
        });
      });
  }, []);

  // ─── Presence OS ──────────────────────────────────────────────────────────
  useEffect(() => {
    logger.info('🌐 [PRESENCE] Starting Presence OS...');
    logger.info('═══════════════════════════════════════════════════');

    presenceOS.start();
    logger.info('  ✅ Presence OS active (30Hz, 8 signature modes)');
    logger.info(
      '  ✅ 7 layers: Cognitive, Affective, Expression, Aura, Spatial, Autonomic, Evolution'
    );
    logger.info('  ✅ Unified identity orchestration across 6 engines');

    return () => {
      logger.info('🛑 [PRESENCE] Stopping Presence OS...');
      presenceOS.stop();
    };
  }, []);
};
