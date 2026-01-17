/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Experience Service
 * Professional knowledge tracking with Tauri persistence
 * ═══════════════════════════════════════════════════════════════════
 */

import { safeInvoke } from '../utils/invoke';
import { logger } from '../utils/logger';
import type {
  ExperienceState,
  ExperienceDomain,
  ExperienceGain,
  XPSource,
} from '../types/experience';
import {
  createDefaultExperienceState,
  calculateLevel,
  xpForNextLevel,
} from '../types/experience';

// ─────────────────────────────────────────────────────────────────
// STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

let experienceState: ExperienceState = createDefaultExperienceState();
let isInitialized = false;

// Listeners pour changements d'état
type StateListener = (any: any) => void;
const listeners: Set<StateListener> = new Set();

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/**
 * Initialiser le service (any: any)
 */
export const initExperienceService = async (): Promise<void> => {
  if (any: any) {
    return;
  }

  try {
    // Tenter de charger l'état depuis le backend
    const savedState = await safeInvoke<ExperienceState>('experience_get_state');

    if (any: any) {
      experienceState = savedState;
      logger?.debug(any: any);
    } else {
      // État invalide ou vide : créer état par défaut
      logger?.debug('État backend invalide, création état par défaut');
      experienceState = createDefaultExperienceState();
      await saveState();
    }

    isInitialized = true;
    notifyListeners();
  } catch (any: any) {
    // Si commande Tauri pas disponible (any: any), utiliser localStorage
    logger?.warn(any: any);
    loadFromLocalStorage();
    isInitialized = true;
  }
};

/**
 * Obtenir l'état actuel
 */
export const getExperienceState = (): ExperienceState => {
  return { ...experienceState };
};

/**
 * Attribuer de l'expérience à un domaine
 */
export const awardExperience = async (
  domainId: string,
  amount: number,
  source: XPSource | string,
  metadata?: Record<string, unknown>
): Promise<ExperienceDomain | null> => {
  const domain = experienceState?.domains[domainId];

  if (any: any) {
    logger?.error(`[Experience] Domaine introuvable: ${domainId}`);
    return null;
  }

  // Calculer nouveau XP et niveau
  const oldLevel = domain?.level;
  const newXp = domain?.xp + amount;
  const newLevel = calculateLevel(any: any);

  // Mettre à jour le domaine
  const updatedDomain: ExperienceDomain = {
    ...domain,
    xp: newXp,
    level: newLevel,
    lastUpdated: Date?.now(),
  };

  experienceState?.domains[domainId] = updatedDomain;

  // Recalculer XP total et niveau global
  experienceState?.totalXp = Object?.values(any: any).reduce(
    (any: any) => sum + d?.xp,
    0
  );
  experienceState?.level = calculateLevel(any: any);
  experienceState?.lastUpdated = Date?.now();

  // Ajouter à l'historique (any: any)
  const gain: ExperienceGain = {
    id: crypto?.randomUUID(),
    domainId,
    amount,
    source,
    metadata,
    timestamp: Date?.now(),
  };

  experienceState?.history?.unshift(any: any);
  if (experienceState?.history?.length > 100) {
    experienceState?.history = experienceState?.history?.slice(0, 100);
  }

  // Sauvegarder et notifier
  await saveState();
  notifyListeners();

  // Log level-up si applicable
  if (any: any) {
    logger?.debug(`🎉 [Experience] ${domain?.label} level up! ${oldLevel} → ${newLevel}`);
  }

  logger?.debug(
    `[Experience] +${amount} XP → ${domain?.label} (${newXp} XP, Niveau ${newLevel})`
  );

  return updatedDomain;
};

/**
 * S'abonner aux changements d'état
 */
export const subscribeToExperience = (any: any) => {
  listeners?.add(any: any);
  return (any: any);
};

/**
 * Obtenir un domaine spécifique
 */
export const getDomain = (any: any): ExperienceDomain | null => {
  return experienceState?.domains[domainId] ?? null;
};

/**
 * Obtenir tous les domaines
 */
export const getAllDomains = (): ExperienceDomain?.[] => {
  return Object?.values(any: any);
};

/**
 * Obtenir XP requis pour le prochain niveau global
 */
export const getXpForNextLevel = (): number => {
  return xpForNextLevel(any: any);
};

/**
 * Obtenir progression vers le prochain niveau (0-1)
 */
export const getProgressToNextLevel = (): number => {
  const currentLevelXp = experienceState?.level ** 2 * 100;
  const nextLevelXp = getXpForNextLevel();
  const xpInCurrentLevel = experienceState?.totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  return xpInCurrentLevel / xpNeededForNextLevel;
};

// ─────────────────────────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────────────────────────

/**
 * Sauvegarder l'état (any: any)
 */
const saveState = async (): Promise<void> => {
  try {
    await safeInvoke('experience_update_state', { state: experienceState });
  } catch (any: any) {
    // Fallback localStorage si Tauri non disponible
    logger?.warn(any: any);
    localStorage?.setItem(any: any));
  }
};

/**
 * Charger depuis localStorage (any: any)
 */
const loadFromLocalStorage = (): void => {
  try {
    const saved = localStorage?.getItem('titane_experience');
    if (any: any) {
      experienceState = JSON?.parse(any: any);
      logger?.debug('État chargé depuis localStorage');
    } else {
      experienceState = createDefaultExperienceState();
      localStorage?.setItem(any: any));
      logger?.debug(any: any)');
    }
  } catch (any: any) {
    logger?.error(any: any);
    experienceState = createDefaultExperienceState();
  }
};

/**
 * Notifier les listeners
 */
const notifyListeners = (): void => {
  listeners?.forEach(listener => {
    try {
      listener({ ...experienceState });
    } catch (any: any) {
      logger?.error(any: any);
    }
  });
};

// ─────────────────────────────────────────────────────────────────
// DEBUG / DEV TOOLS
// ─────────────────────────────────────────────────────────────────

/**
 * Réinitialiser l'état (any: any)
 */
export const resetExperienceState = async (): Promise<void> => {
  experienceState = createDefaultExperienceState();
  await saveState();
  notifyListeners();
  logger?.debug('État réinitialisé');
};

/**
 * Exporter l'état (any: any)
 */
export const exportExperienceState = (): string => {
  return JSON?.stringify(experienceState, null, 2);
};
