/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v30.0.0 - Experience Service
 * Professional knowledge tracking with Tauri persistence
 * ═══════════════════════════════════════════════════════════════════
 */

import { safeInvoke } from '../utils/invoke';
import { createLogger } from '../utils/logger';
import { isTauriRuntimeAvailable } from '../utils/tauriProtector';
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

const logger = createLogger('Experience');
const EXPERIENCE_STORAGE_KEY = 'titane_experience';

// ─────────────────────────────────────────────────────────────────
// STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────

let experienceState: ExperienceState = createDefaultExperienceState();
let isInitialized = false;

// Listeners pour changements d'état
type StateListener = (state: ExperienceState) => void;
const listeners: Set<StateListener> = new Set();

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const isValidExperienceState = (value: unknown): value is ExperienceState => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.totalXp === 'number' &&
    typeof value.level === 'number' &&
    isRecord(value.domains) &&
    Array.isArray(value.history)
  );
};

const hasRecordedExperience = (state: ExperienceState = experienceState): boolean => {
  return (
    state.totalXp > 0 ||
    state.history.length > 0 ||
    Object.values(state.domains).some(domain => domain.xp > 0)
  );
};

const readLocalStorageState = (): ExperienceState | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(EXPERIENCE_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return isValidExperienceState(parsed) ? parsed : null;
  } catch (err) {
    logger.error('Erreur lecture localStorage XP:', err);
    return null;
  }
};

const writeLocalStorageState = (state: ExperienceState = experienceState): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(
      EXPERIENCE_STORAGE_KEY,
      JSON.stringify(normalizeExperienceState(state))
    );
  } catch (err) {
    logger.warn('Erreur sauvegarde localStorage XP:', err);
  }
};

const selectFreshestExperienceState = (
  backendState: ExperienceState | null,
  localState: ExperienceState | null
): ExperienceState | null => {
  if (!backendState) {
    return localState;
  }

  if (!localState) {
    return backendState;
  }

  const backendHasXp = hasRecordedExperience(backendState);
  const localHasXp = hasRecordedExperience(localState);

  if (localHasXp && !backendHasXp) {
    return localState;
  }

  if (backendHasXp && !localHasXp) {
    return backendState;
  }

  if (backendHasXp && localHasXp) {
    return localState.lastUpdated > backendState.lastUpdated ? localState : backendState;
  }

  return backendState.lastUpdated >= localState.lastUpdated ? backendState : localState;
};

const normalizeExperienceState = (state: ExperienceState): ExperienceState => {
  const defaults = createDefaultExperienceState();
  const now = Date.now();
  const domains: ExperienceState['domains'] = { ...defaults.domains };

  for (const [domainId, domain] of Object.entries(state.domains)) {
    const fallback = defaults.domains[domainId];
    const xp = Number.isFinite(domain.xp) ? Math.max(0, domain.xp) : 0;
    domains[domainId] = {
      ...(fallback ?? domain),
      ...domain,
      id: domain.id || domainId,
      xp,
      level: calculateLevel(xp),
      lastUpdated: Number.isFinite(domain.lastUpdated) ? domain.lastUpdated : now,
    };
  }

  const totalXp = Object.values(domains).reduce((sum, domain) => sum + domain.xp, 0);

  return {
    ...defaults,
    ...state,
    domains,
    totalXp,
    level: calculateLevel(totalXp),
    history: state.history.slice(0, 100),
    lastUpdated: Number.isFinite(state.lastUpdated) ? state.lastUpdated : now,
    version: state.version || defaults.version,
  };
};

const setExperienceState = (state: ExperienceState): void => {
  experienceState = normalizeExperienceState(state);
};

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

  if (hasRecordedExperience()) {
    isInitialized = true;
    await saveState();
    notifyListeners();
    return;
  }

  const localState = readLocalStorageState();

  if (!isTauriRuntimeAvailable()) {
    if (localState) {
      setExperienceState(localState);
    } else {
      setExperienceState(createDefaultExperienceState());
      writeLocalStorageState();
    }
    isInitialized = true;
    notifyListeners();
    return;
  }

  try {
    // Tenter de charger l'état depuis le backend
    const savedState = await safeInvoke<ExperienceState>('experience_get_state');
    const backendState = isValidExperienceState(savedState) ? savedState : null;
    const selectedState = selectFreshestExperienceState(backendState, localState);

    if (selectedState) {
      setExperienceState(selectedState);
      logger.info('État XP chargé:', {
        source: selectedState === localState ? 'localStorage' : 'tauri',
        totalXp: experienceState.totalXp,
        lastUpdated: experienceState.lastUpdated,
      });
    } else {
      logger.info('État backend invalide, fallback localStorage');
      setExperienceState(createDefaultExperienceState());
    }

    await saveState();

    isInitialized = true;
    notifyListeners();
  } catch (err) {
    // Si commande Tauri pas disponible (mode browser), utiliser localStorage
    logger.warn('Tauri non disponible, fallback localStorage:', err);
    if (localState) {
      setExperienceState(localState);
    } else {
      loadFromLocalStorage();
    }
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
  if (!isInitialized && !hasRecordedExperience()) {
    await initExperienceService();
  }

  const domain = experienceState.domains[domainId];

  if (!domain) {
    logger.error(`Domaine introuvable: ${domainId}`);
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
    logger.info(`🎉 ${domain.label} level up! ${oldLevel} → ${newLevel}`);
  }

  logger.info(`+${amount} XP → ${domain.label} (${newXp} XP, Niveau ${newLevel})`);

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
  // NaN guard: avoid division by zero if level thresholds are equal
  return xpNeededForNextLevel > 0 ? xpInCurrentLevel / xpNeededForNextLevel : 0;
};

// ─────────────────────────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────────────────────────

/**
 * Sauvegarder l'état (Tauri ou localStorage)
 */
const saveState = async (): Promise<void> => {
  try {
    writeLocalStorageState();

    if (!isTauriRuntimeAvailable()) {
      return;
    }
    await safeInvoke('experience_update_state', { state: experienceState });
  } catch (err) {
    // Fallback localStorage si Tauri non disponible
    logger.warn('Tauri save failed, using localStorage:', err);
    writeLocalStorageState();
  }
};

/**
 * Charger depuis localStorage (fallback)
 */
const loadFromLocalStorage = (): void => {
  try {
    const parsed = readLocalStorageState();

    if (parsed) {
      setExperienceState(parsed);
      logger.info('État chargé depuis localStorage');
    } else if (!hasRecordedExperience()) {
      setExperienceState(createDefaultExperienceState());
      writeLocalStorageState();
      logger.info('État initial créé (localStorage)');
    }
  } catch (err) {
    logger.error('Erreur chargement localStorage:', err);
    if (!hasRecordedExperience()) {
      setExperienceState(createDefaultExperienceState());
    }
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
      logger.error('Erreur listener:', err);
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
  setExperienceState(createDefaultExperienceState());
  await saveState();
  notifyListeners();
  logger.info('État réinitialisé');
};

/**
 * Exporter l'état (debug)
 */
export const exportExperienceState = (): string => {
  return JSON.stringify(experienceState, null, 2);
};
