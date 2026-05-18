/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞.D - XP ENGINE Core
 * ═══════════════════════════════════════════════════════════════════
 *
 * Moteur d'expérience unifié, progression intelligente et persistante
 */

export interface XPEvent {
  source: string;
  amount: number;
  timestamp: number;
  description?: string;
}

export interface XPState {
  total: number;
  level: number;
  history: XPEvent[];
}

let unsubscribeExperienceMirror: (() => void) | null = null;

/**
 * Moteur XP global TITANE∞
 *
 * Facade legacy. La verite persistante est maintenant experienceService.
 */
export const XP = {
  state: {
    total: 0,
    level: 1,
    history: [] as XPEvent[],
  },

  /**
   * Gagner de l'XP
   * @param amount Quantité d'XP à gagner
   * @param source Source du gain (message_user, file_import, etc.)
   * @param description Description optionnelle
   */
  gain(amount: number, source = 'system', description?: string) {
    if (amount <= 0) {
      return;
    }

    try {
      import('../../services/experienceService')
        .then(({ awardExperience }) => {
          const domain = XP.mapSourceToDomain(source);
          return awardExperience(domain, amount, source, { description });
        })
        .then(() => {
          XP.load();
        })
        .catch(() => {
          // Legacy facade: XP gain is non-critical for callers.
        });
    } catch {
      // Legacy facade: keep runtime stable if dynamic import is unavailable.
    }
  },

  /**
   * Mapper la source XP vers un domaine experienceService
   */
  mapSourceToDomain(source: string): string {
    const map: Record<string, string> = {
      message_user: 'chat',
      chat_message: 'chat',
      response_ai: 'cognitive',
      file_import: 'memory',
      file_analysis: 'memory',
      memory_promote: 'memory',
      memory_archive: 'memory',
      system_update: 'system',
      engine_load: 'system',
    };
    return map[source] || 'system';
  },

  /**
   * Recharger le miroir depuis la source canonique.
   */
  updateLevel() {
    XP.load();
  },

  /**
   * Compat: aucune persistance propre; la persistance est experienceService.
   */
  persist() {
    XP.load();
  },

  /**
   * Charger le miroir depuis experienceService.
   */
  load() {
    try {
      import('../../services/experienceService')
        .then(({ getExperienceState, subscribeToExperience }) => {
          XP.syncFromExperienceState(getExperienceState());

          if (unsubscribeExperienceMirror === null) {
            unsubscribeExperienceMirror = subscribeToExperience(state => {
              XP.syncFromExperienceState(state);
            });
          }
        })
        .catch(() => {
          // Keep previous mirror if the canonical service is unavailable.
        });
    } catch {
      // Keep previous mirror if dynamic import is unavailable.
    }
  },

  syncFromExperienceState(state: {
    totalXp: number;
    level: number;
    history: Array<{
      source: string;
      amount: number;
      timestamp: number;
      metadata?: Record<string, unknown>;
      domainId?: string;
    }>;
  }) {
    XP.state = {
      total: state.totalXp,
      level: state.level,
      history: state.history.slice(0, 1000).map(event => ({
        source: event.source,
        amount: event.amount,
        timestamp: event.timestamp,
        description:
          typeof event.metadata?.description === 'string'
            ? event.metadata.description
            : event.domainId,
      })),
    };
  },

  getLevelStartXP(): number {
    return XP.state.level * XP.state.level * 100;
  },

  getNextLevelXP(): number {
    return (XP.state.level + 1) * (XP.state.level + 1) * 100;
  },

  getXPInCurrentLevel(): number {
    return Math.max(0, XP.state.total - XP.getLevelStartXP());
  },

  getXPSpanForLevel(): number {
    return Math.max(1, XP.getNextLevelXP() - XP.getLevelStartXP());
  },

  getStats() {
    try {
      import('../../services/experienceService')
        .then(({ getExperienceState }) => {
          XP.syncFromExperienceState(getExperienceState());
        })
        .catch(() => undefined);
    } catch {
      // no-op
    }

    return {
      total: XP.state.total,
      level: XP.state.level,
      history: XP.state.history,
      progress: XP.getProgressToNextLevel(),
      xpToNext: XP.getXPToNextLevel(),
    };
  },

  teardown() {
    if (unsubscribeExperienceMirror !== null) {
      unsubscribeExperienceMirror();
      unsubscribeExperienceMirror = null;
    }
  },

  getCanonicalStorageKey(): string {
    return 'titane_experience';
  },

  getLegacyStorageKey(): string {
    return 'xp_state';
  },

  clearLegacyLocalStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(XP.getLegacyStorageKey());
      }
    } catch {
      // no-op
    }
  },

  /**
   * Obtenir la progression vers le prochain niveau (0-100%)
   */
  getProgressToNextLevel(): number {
    return (XP.getXPInCurrentLevel() / XP.getXPSpanForLevel()) * 100;
  },

  /**
   * Obtenir l'XP nécessaire pour le prochain niveau
   */
  getXPToNextLevel(): number {
    return Math.max(0, XP.getNextLevelXP() - XP.state.total);
  },

  /**
   * Obtenir les statistiques par source
   */
  getStatsBySource(): Record<string, { count: number; total: number }> {
    const stats: Record<string, { count: number; total: number }> = {};

    for (const event of XP.state.history) {
      if (!stats[event.source]) {
        stats[event.source] = { count: 0, total: 0 };
      }
      const sourceStat = stats[event.source];
      if (sourceStat) {
        sourceStat.count++;
        sourceStat.total += event.amount;
      }
    }

    return stats;
  },

  /**
   * Réinitialiser l'état (dev uniquement)
   */
  reset() {
    try {
      import('../../services/experienceService')
        .then(({ resetExperienceState }) => resetExperienceState())
        .then(() => XP.load())
        .catch(() => undefined);
    } catch {
      // no-op
    }
  },
};

// ─────────────────────────────────────────────────────────────────
// Auto-save interval (v24.20: with cleanup)
// ─────────────────────────────────────────────────────────────────

let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Démarrer l'auto-save (appelé automatiquement)
 */
function startAutoSave() {
  if (autoSaveIntervalId !== null) return; // Already running

  autoSaveIntervalId = setInterval(() => {
      XP.load();
  }, 60000); // Every 60s

  console.warn('[XP] Miroir experienceService activé (60s)');
}

/**
 * Arrêter l'auto-save (cleanup)
 */
export function stopAutoSave() {
  if (autoSaveIntervalId !== null) {
    clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = null;
    console.warn('[XP] Miroir experienceService désactivé');
  }
}

// Initialisation automatique
if (typeof window !== 'undefined') {
  XP.load();
  startAutoSave();
}
