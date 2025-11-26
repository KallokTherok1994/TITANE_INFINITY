/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v24 - Experience Service
 * Professional knowledge tracking with Tauri persistence
 * ═══════════════════════════════════════════════════════════════════
 */

import { safeInvoke } from '../utils/invoke';
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
type StateListener = (state: ExperienceState) => void;
const listeners: Set<StateListener> = new Set();

// ─────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────

/**
 * Initialiser le service (charger état depuis Tauri)
 */
export const initExperienceService = async (): Promise<void> => {
  if (isInitialized) {
    return;
  }

  try {
    // Tenter de charger l'état depuis le backend
    const savedState = await safeInvoke<ExperienceState | null>('experience_get_state');

    if (savedState) {
      experienceState = savedState;
      console.log('[Experience] État chargé depuis Tauri:', experienceState);
    } else {
      // Premier démarrage : sauvegarder l'état par défaut
      experienceState = createDefaultExperienceState();
      await saveState();
      console.log('[Experience] État initial créé');
    }

    isInitialized = true;
    notifyListeners();
  } catch (err) {
    // Si commande Tauri pas disponible (mode browser), utiliser localStorage
    console.warn('[Experience] Tauri non disponible, fallback localStorage:', err);
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
  const domain = experienceState.domains[domainId];

  if (!domain) {
    console.error(`[Experience] Domaine introuvable: ${domainId}`);
    return null;
  }

  // Calculer nouveau XP et niveau
  const oldLevel = domain.level;
  const newXp = domain.xp + amount;
  const newLevel = calculateLevel(newXp);

  // Mettre à jour le domaine
  const updatedDomain: ExperienceDomain = {
    ...domain,
    xp: newXp,
    level: newLevel,
    lastUpdated: Date.now(),
  };

  experienceState.domains[domainId] = updatedDomain;

  // Recalculer XP total et niveau global
  experienceState.totalXp = Object.values(experienceState.domains).reduce(
    (sum, d) => sum + d.xp,
    0
  );
  experienceState.level = calculateLevel(experienceState.totalXp);
  experienceState.lastUpdated = Date.now();

  // Ajouter à l'historique (garder 100 derniers)
  const gain: ExperienceGain = {
    id: crypto.randomUUID(),
    domainId,
    amount,
    source,
    metadata,
    timestamp: Date.now(),
  };

  experienceState.history.unshift(gain);
  if (experienceState.history.length > 100) {
    experienceState.history = experienceState.history.slice(0, 100);
  }

  // Sauvegarder et notifier
  await saveState();
  notifyListeners();

  // Log level-up si applicable
  if (newLevel > oldLevel) {
    console.log(`🎉 [Experience] ${domain.label} level up! ${oldLevel} → ${newLevel}`);
  }

  console.log(
    `[Experience] +${amount} XP → ${domain.label} (${newXp} XP, Niveau ${newLevel})`
  );

  return updatedDomain;
};

/**
 * S'abonner aux changements d'état
 */
export const subscribeToExperience = (listener: StateListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Obtenir un domaine spécifique
 */
export const getDomain = (domainId: string): ExperienceDomain | null => {
  return experienceState.domains[domainId] ?? null;
};

/**
 * Obtenir tous les domaines
 */
export const getAllDomains = (): ExperienceDomain[] => {
  return Object.values(experienceState.domains);
};

/**
 * Obtenir XP requis pour le prochain niveau global
 */
export const getXpForNextLevel = (): number => {
  return xpForNextLevel(experienceState.level);
};

/**
 * Obtenir progression vers le prochain niveau (0-1)
 */
export const getProgressToNextLevel = (): number => {
  const currentLevelXp = experienceState.level ** 2 * 100;
  const nextLevelXp = getXpForNextLevel();
  const xpInCurrentLevel = experienceState.totalXp - currentLevelXp;
  const xpNeededForNextLevel = nextLevelXp - currentLevelXp;
  return xpInCurrentLevel / xpNeededForNextLevel;
};

// ─────────────────────────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────────────────────────

/**
 * Sauvegarder l'état (Tauri ou localStorage)
 */
const saveState = async (): Promise<void> => {
  try {
    await safeInvoke('experience_update_state', { state: experienceState });
  } catch (err) {
    // Fallback localStorage si Tauri non disponible
    console.warn('[Experience] Tauri save failed, using localStorage:', err);
    localStorage.setItem('titane_experience', JSON.stringify(experienceState));
  }
};

/**
 * Charger depuis localStorage (fallback)
 */
const loadFromLocalStorage = (): void => {
  try {
    const saved = localStorage.getItem('titane_experience');
    if (saved) {
      experienceState = JSON.parse(saved);
      console.log('[Experience] État chargé depuis localStorage');
    } else {
      experienceState = createDefaultExperienceState();
      localStorage.setItem('titane_experience', JSON.stringify(experienceState));
      console.log('[Experience] État initial créé (localStorage)');
    }
  } catch (err) {
    console.error('[Experience] Erreur chargement localStorage:', err);
    experienceState = createDefaultExperienceState();
  }
};

/**
 * Notifier les listeners
 */
const notifyListeners = (): void => {
  listeners.forEach(listener => {
    try {
      listener({ ...experienceState });
    } catch (err) {
      console.error('[Experience] Erreur listener:', err);
    }
  });
};

// ─────────────────────────────────────────────────────────────────
// DEBUG / DEV TOOLS
// ─────────────────────────────────────────────────────────────────

/**
 * Réinitialiser l'état (dev only)
 */
export const resetExperienceState = async (): Promise<void> => {
  experienceState = createDefaultExperienceState();
  await saveState();
  notifyListeners();
  console.log('[Experience] État réinitialisé');
};

/**
 * Exporter l'état (debug)
 */
export const exportExperienceState = (): string => {
  return JSON.stringify(experienceState, null, 2);
};
