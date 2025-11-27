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

/**
 * Moteur XP global TITANE∞
 *
 * Gère l'expérience, la progression et l'historique
 * Tous les gains XP passent par ce système unifié
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
  gain(amount: number, source = "system", description?: string) {
    const event: XPEvent = {
      source,
      amount,
      timestamp: Date.now(),
      description,
    };

    XP.state.total += amount;
    XP.state.history.push(event);

    // Limiter l'historique à 1000 événements pour éviter la saturation mémoire
    if (XP.state.history.length > 1000) {
      XP.state.history = XP.state.history.slice(-1000);
    }

    const previousLevel = XP.state.level;
    XP.updateLevel();

    // Log level-up
    if (XP.state.level > previousLevel) {
      console.log(`🎉 [XP] Level UP! ${previousLevel} → ${XP.state.level}`);
    }

    XP.persist();
  },

  /**
   * Calculer le niveau actuel basé sur l'XP total
   * Formule: Level = 1 + floor(total_xp / 500)
   */
  updateLevel() {
    XP.state.level = Math.floor(1 + XP.state.total / 500);
  },

  /**
   * Sauvegarder l'état dans localStorage
   */
  persist() {
    try {
      localStorage.setItem("xp_state", JSON.stringify(XP.state));
    } catch (e) {
      console.error("[XP] Erreur sauvegarde localStorage:", e);
    }
  },

  /**
   * Charger l'état depuis localStorage
   */
  load() {
    try {
      const s = localStorage.getItem("xp_state");
      if (s) {
        const loaded = JSON.parse(s);
        XP.state = {
          total: loaded.total || 0,
          level: loaded.level || 1,
          history: loaded.history || [],
        };
        console.log(`[XP] État chargé: Level ${XP.state.level}, ${XP.state.total} XP`);
      } else {
        console.log("[XP] Nouvel état initialisé");
      }
    } catch (e) {
      console.error("[XP] Erreur chargement localStorage:", e);
    }
  },

  /**
   * Obtenir la progression vers le prochain niveau (0-100%)
   */
  getProgressToNextLevel(): number {
    const xpInCurrentLevel = XP.state.total % 500;
    return (xpInCurrentLevel / 500) * 100;
  },

  /**
   * Obtenir l'XP nécessaire pour le prochain niveau
   */
  getXPToNextLevel(): number {
    return 500 - (XP.state.total % 500);
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
      stats[event.source].count++;
      stats[event.source].total += event.amount;
    }

    return stats;
  },

  /**
   * Réinitialiser l'état (dev uniquement)
   */
  reset() {
    XP.state = {
      total: 0,
      level: 1,
      history: [],
    };
    XP.persist();
    console.warn("[XP] État réinitialisé");
  }
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
    XP.persist();
  }, 60000); // Every 60s

  console.log('[XP] Auto-save activé (60s)');
}

/**
 * Arrêter l'auto-save (cleanup)
 */
export function stopAutoSave() {
  if (autoSaveIntervalId !== null) {
    clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = null;
    console.log('[XP] Auto-save désactivé');
  }
}

// Initialisation automatique
if (typeof window !== 'undefined') {
  XP.load();
  startAutoSave();
}
