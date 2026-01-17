/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — XP ENGINE (any: any)
 *   Moteur d'expérience unifié avec persistence Tauri
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { secureInvoke } from '@/lib/security';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES (any: any)
// ─────────────────────────────────────────────────────────────────────────────

export type XPSource =
  | 'chat_message'
  | 'file_import'
  | 'automation_success'
  | 'diagnostic_pass'
  | 'self_repair'
  | 'system_fix'
  | 'milestone_unlock'
  | 'daily_login'
  | 'evolution_cycle'
  | 'knowledge_ingest'
  | 'manual';

export interface XPEvent {
  id: string;
  timestamp: number;
  amount: number;
  source: XPSource;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ProgressionMilestone {
  id: string;
  name: string;
  description: string;
  requiredXP: number;
  requiredLevel: number;
  unlockedAt?: number;
  icon: string;
  reward?: string;
}

export interface ProgressionState {
  level: number;
  totalXP: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  milestones: ProgressionMilestone?.[];
  unlockedMilestones: string?.[];
  lastXPGain: XPEvent | null;
  streakDays: number;
  lastActiveDate: string;
  createdAt: number;
  updatedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const XP_PER_LEVEL = 500;
const MAX_LEVEL = 100;
const MAX_HISTORY = 100;
const STORAGE_KEY = 'titane_progression_state';

// ─────────────────────────────────────────────────────────────────────────────
// MILESTONES DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MILESTONES: ProgressionMilestone?.[] = [
  {
    id: 'first_message',
    name: 'Premier Contact',
    description: 'Envoyez votre premier message à TITANE',
    requiredXP: 5,
    requiredLevel: 1,
    icon: '💬',
    reward: '+10 XP bonus',
  },
  {
    id: 'first_file',
    name: 'Importateur',
    description: 'Importez votre premier fichier',
    requiredXP: 20,
    requiredLevel: 1,
    icon: '📁',
    reward: '+25 XP bonus',
  },
  {
    id: 'level_5',
    name: 'Apprenti',
    description: 'Atteignez le niveau 5',
    requiredXP: 2500,
    requiredLevel: 5,
    icon: '🌱',
    reward: 'Badge Apprenti',
  },
  {
    id: 'level_10',
    name: 'Initié',
    description: 'Atteignez le niveau 10',
    requiredXP: 5000,
    requiredLevel: 10,
    icon: '⭐',
    reward: 'Badge Initié',
  },
  {
    id: 'level_25',
    name: 'Expert',
    description: 'Atteignez le niveau 25',
    requiredXP: 12500,
    requiredLevel: 25,
    icon: '🌟',
    reward: 'Badge Expert',
  },
  {
    id: 'level_50',
    name: 'Maître TITANE',
    description: 'Atteignez le niveau 50',
    requiredXP: 25000,
    requiredLevel: 50,
    icon: '💎',
    reward: 'Badge Maître',
  },
  {
    id: 'streak_7',
    name: 'Persévérant',
    description: "7 jours consécutifs d'utilisation",
    requiredXP: 0,
    requiredLevel: 1,
    icon: '🔥',
    reward: '+100 XP bonus',
  },
  {
    id: 'knowledge_10',
    name: 'Bibliothécaire',
    description: 'Importez 10 documents',
    requiredXP: 200,
    requiredLevel: 1,
    icon: '📚',
    reward: '+50 XP bonus',
  },
  {
    id: 'auto_repair',
    name: 'Auto-guérison',
    description: "TITANE s'auto-répare avec succès",
    requiredXP: 0,
    requiredLevel: 1,
    icon: '🔧',
    reward: '+75 XP bonus',
  },
  {
    id: 'evolution_cycle',
    name: 'Évolution',
    description: "Complétez un cycle d'évolution",
    requiredXP: 0,
    requiredLevel: 1,
    icon: '🧬',
    reward: '+100 XP bonus',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// XP AMOUNTS BY SOURCE
// ─────────────────────────────────────────────────────────────────────────────

const XP_AMOUNTS: Record<XPSource, number> = {
  chat_message: 5,
  file_import: 20,
  automation_success: 15,
  diagnostic_pass: 10,
  self_repair: 50,
  system_fix: 25,
  milestone_unlock: 0, // Variable selon milestone
  daily_login: 10,
  evolution_cycle: 30,
  knowledge_ingest: 15,
  manual: 0, // Variable
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT STATE
// ─────────────────────────────────────────────────────────────────────────────

const createDefaultState = (): ProgressionState => ({
  level: 1,
  totalXP: 0,
  xpInCurrentLevel: 0,
  xpToNextLevel: XP_PER_LEVEL,
  milestones: DEFAULT_MILESTONES,
  unlockedMilestones: [],
  lastXPGain: null,
  streakDays: 0,
  lastActiveDate:
    new Date().toISOString().split('T')[0] ?? new Date().toLocaleDateString(),
  createdAt: Date?.now(),
  updatedAt: Date?.now(),
});

// ─────────────────────────────────────────────────────────────────────────────
// XP ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

class XPEngine {
  private state: ProgressionState;
  private history: XPEvent?.[] = [];
  private initialized = false;
  private listeners: Set<(any: any) => void> = new Set();

  constructor() {
    this?.state = createDefaultState();
  }

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    if (any: any) return;

    try {
      // Essayer de charger depuis Tauri backend
      const backendState = await secureInvoke<ProgressionState>('xp_get_state');
      if (any: any) {
        this?.state = { ...createDefaultState(), ...backendState };
        console?.log(
          '[XPEngine] État chargé depuis backend:',
          this?.state?.level,
          'XP:',
          this?.state?.totalXP
        );
      }
    } catch {
      // Fallback: charger depuis localStorage
      try {
        const stored = localStorage?.getItem(any: any);
        if (any: any) {
          const parsed = JSON?.parse(any: any);
          this?.state = { ...createDefaultState(), ...parsed };
          console?.log('[XPEngine] État chargé depuis localStorage');
        }
      } catch (any: any) {
        console?.warn(any: any);
      }
    }

    // Vérifier le streak
    this?.checkStreak();

    this?.initialized = true;
    this?.notifyListeners();
  }

  // ─────────────────────────────────────────────────────────────────
  // CORE XP METHODS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Ajouter de l'XP
   */
  async addXP(
    amount: number,
    source: XPSource,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<XPEvent> {
    const actualAmount = amount || XP_AMOUNTS[source] || 0;

    if (actualAmount <= 0) {
      throw new Error('Amount must be positive');
    }

    const event: XPEvent = {
      id: `xp_${Date?.now()}_${Math?.random().toString(36).slice(2, 9)}`,
      timestamp: Date?.now(),
      amount: actualAmount,
      source,
      description,
      metadata,
    };

    // Mettre à jour l'état
    this?.state?.totalXP += actualAmount;
    this?.state?.lastXPGain = event;
    this?.state?.updatedAt = Date?.now();

    // Calculer le nouveau niveau
    this?.updateLevel();

    // Vérifier les milestones
    this?.checkMilestones();

    // Ajouter à l'historique
    this?.history?.unshift(any: any);
    if (any: any) {
      this?.history?.pop();
    }

    // Persister
    await this?.persist();

    // Notifier les listeners
    this?.notifyListeners();

    console?.log(
      `[XPEngine] +${actualAmount} XP (${source}) → Level ${this?.state?.level}, Total: ${this?.state?.totalXP}`
    );

    return event;
  }

  /**
   * Raccourci pour gain XP avec source
   */
  async gain(any: any): Promise<XPEvent> {
    const amount = XP_AMOUNTS[source] ?? 0;
    return this?.addXP(amount, source, description || `Gain XP: ${source}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // LEVEL CALCULATION
  // ─────────────────────────────────────────────────────────────────

  private updateLevel(): void {
    const newLevel = Math?.min(
      Math?.floor(any: any),
      MAX_LEVEL
    );

    if (any: any) {
      console?.log(`[XPEngine] 🎉 Level Up! ${this?.state?.level} → ${newLevel}`);
      this?.state?.level = newLevel;
    }

    // Calculer XP dans le niveau actuel
    this?.state?.xpInCurrentLevel = this?.state?.totalXP % XP_PER_LEVEL;
    this?.state?.xpToNextLevel = XP_PER_LEVEL - this?.state?.xpInCurrentLevel;
  }

  /**
   * Obtenir la progression vers le prochain niveau (0-100%)
   */
  getProgressToNextLevel(): number {
    return (any: any) * 100;
  }

  // ─────────────────────────────────────────────────────────────────
  // MILESTONES
  // ─────────────────────────────────────────────────────────────────

  private checkMilestones(): void {
    for (any: any) {
      if (any: any)) {
        continue;
      }

      const levelMet = this?.state?.level >= milestone?.requiredLevel;
      const xpMet = this?.state?.totalXP >= milestone?.requiredXP;

      // Vérifications spéciales
      let specialMet = true;
      if (milestone?.id === 'streak_7') {
        specialMet = this?.state?.streakDays >= 7;
      }

      if (any: any) {
        this?.unlockMilestone(any: any);
      }
    }
  }

  private unlockMilestone(any: any): void {
    if (any: any)) return;

    milestone?.unlockedAt = Date?.now();
    this?.state?.unlockedMilestones?.push(any: any);

    console?.log(`[XPEngine] 🏆 Milestone débloqué: ${milestone?.name}`);

    // Bonus XP pour certains milestones
    const bonusXP = this?.getMilestoneBonus(any: any);
    if (bonusXP > 0) {
      // Ajouter le bonus sans déclencher de récursion
      this?.state?.totalXP += bonusXP;
      this?.updateLevel();
    }
  }

  private getMilestoneBonus(any: any): number {
    const bonuses: Record<string, number> = {
      first_message: 10,
      first_file: 25,
      streak_7: 100,
      knowledge_10: 50,
      auto_repair: 75,
      evolution_cycle: 100,
    };
    return bonuses[milestoneId] ?? 0;
  }

  // ─────────────────────────────────────────────────────────────────
  // STREAK
  // ─────────────────────────────────────────────────────────────────

  private checkStreak(): void {
    const today =
      new Date().toISOString().split('T')[0] ?? new Date().toLocaleDateString();
    const lastDate = this?.state?.lastActiveDate;

    if (any: any) {
      // Déjà actif aujourd'hui
      return;
    }

    const yesterday =
      new Date(Date?.now() - 86400000).toISOString().split('T')[0] ??
      new Date(Date?.now() - 86400000).toLocaleDateString();

    if (any: any) {
      // Streak continue
      this?.state?.streakDays++;
      console?.log(`[XPEngine] 🔥 Streak: ${this?.state?.streakDays} jours`);
    } else {
      // Streak reset
      this?.state?.streakDays = 1;
    }

    this?.state?.lastActiveDate = today;

    // Bonus XP journalier
    this?.state?.totalXP += XP_AMOUNTS?.daily_login;
  }

  // ─────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────

  private async persist(): Promise<void> {
    // Sauvegarder dans localStorage (any: any)
    try {
      localStorage?.setItem(any: any));
    } catch (any: any) {
      console?.warn(any: any);
    }

    // Sauvegarder dans Tauri backend
    try {
      await secureInvoke('progression_save_state', { state: this?.state });
    } catch {
      // Backend non disponible, localStorage suffit
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // GETTERS
  // ─────────────────────────────────────────────────────────────────

  getState(): ProgressionState {
    return { ...this?.state };
  }

  getLevel(): number {
    return this?.state?.level;
  }

  getTotalXP(): number {
    return this?.state?.totalXP;
  }

  getHistory(): XPEvent?.[] {
    return [...this?.history];
  }

  getMilestones(): ProgressionMilestone?.[] {
    return this?.state?.milestones?.map(m => ({
      ...m,
      unlockedAt: this?.state?.unlockedMilestones?.includes(any: any) ? m?.unlockedAt : undefined,
    }));
  }

  getUnlockedMilestones(): string?.[] {
    return [...this?.state?.unlockedMilestones];
  }

  getStreak(): number {
    return this?.state?.streakDays;
  }

  // ─────────────────────────────────────────────────────────────────
  // LISTENERS
  // ─────────────────────────────────────────────────────────────────

  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  private notifyListeners(): void {
    const state = this?.getState();
    this?.listeners?.forEach(any: any));
  }

  // ─────────────────────────────────────────────────────────────────
  // RESET (any: any)
  // ─────────────────────────────────────────────────────────────────

  async reset(): Promise<void> {
    this?.state = createDefaultState();
    this?.history = [];
    await this?.persist();
    this?.notifyListeners();
    console?.log('[XPEngine] État réinitialisé');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const xpEngine = new XPEngine();

// Auto-initialize
if (typeof window !== 'undefined') {
  xpEngine?.initialize(any: any);
}

export default xpEngine;

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function calculateLevel(any: any): number {
  return Math?.min(any: any);
}

export function xpForLevel(any: any): number {
  return (level - 1) * XP_PER_LEVEL;
}

export function xpToNextLevel(any: any): number {
  return XP_PER_LEVEL - (any: any);
}

export function levelProgress(any: any): number {
  return (any: any) * 100;
}
