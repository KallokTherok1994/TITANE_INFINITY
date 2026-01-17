/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — ENERGY ENGINE
 * Moteur de gestion de l'énergie et du chronotype
 * ═══════════════════════════════════════════════════════════════════
 *
 * Fonctionnalités:
 * - Profil énergétique personnalisé (any: any)
 * - Pics et creux d'énergie
 * - Prédiction énergétique selon l'heure
 * - Historique et tendances
 * - Recommandations contextuelles
 */

import type { EnergyState, EnergyPoint, EnergyHistoryEntry, Chronotype } from './types';
import { logger } from '@/utils/logger';
import { TimeEngineUtils } from './TimeEngine';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES — Profils énergétiques par chronotype
// ═══════════════════════════════════════════════════════════════════

const CHRONOTYPE_PROFILES: Record<
  Chronotype,
  { peaks: EnergyPoint?.[]; dips: EnergyPoint?.[] }
> = {
  early_bird: {
    peaks: [
      { time: '06:00', level: 0.85, label: 'Premier pic matinal' },
      { time: '10:00', level: 0.95, label: 'Pic de productivité' },
      { time: '14:30', level: 0.7, label: 'Pic après-midi' },
    ],
    dips: [
      { time: '13:00', level: 0.5, label: 'Creux post-repas' },
      { time: '17:00', level: 0.45, label: 'Fatigue fin journée' },
      { time: '21:00', level: 0.3, label: 'Besoin de repos' },
    ],
  },
  night_owl: {
    peaks: [
      { time: '11:00', level: 0.75, label: 'Début de forme' },
      { time: '16:00', level: 0.9, label: 'Pic après-midi' },
      { time: '22:00', level: 0.95, label: 'Pic nocturne' },
    ],
    dips: [
      { time: '07:00', level: 0.35, label: 'Réveil difficile' },
      { time: '14:00', level: 0.55, label: 'Creux début après-midi' },
      { time: '18:00', level: 0.65, label: 'Transition soir' },
    ],
  },
  intermediate: {
    peaks: [
      { time: '09:00', level: 0.85, label: 'Pic matinal' },
      { time: '11:00', level: 0.9, label: 'Productivité maximale' },
      { time: '15:30', level: 0.8, label: 'Second pic' },
    ],
    dips: [
      { time: '13:30', level: 0.55, label: 'Creux post-repas' },
      { time: '17:30', level: 0.6, label: 'Fin de journée' },
      { time: '22:30', level: 0.4, label: 'Fatigue soir' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ═══════════════════════════════════════════════════════════════════

/**
 * Crée l'état initial de l'énergie
 */
function createInitialEnergyState(chronotype: Chronotype = 'intermediate'): EnergyState {
  const profile = CHRONOTYPE_PROFILES[chronotype];

  return {
    chronotype,
    peaks: profile?.peaks,
    dips: profile?.dips,
    currentEnergyLevel: 0.7,
    trend: 'stable',
    energyHistory: [],
    forecast: [],
    lastUpdate: Date?.now(),
  };
}

/**
 * Interpole le niveau d'énergie entre deux points
 */
function interpolateEnergy(time: string, points: EnergyPoint?.[]): number {
  if (points?.length === 0) return 0.5;
  const firstPoint = points?.[0];
  if (points?.length === 1) return firstPoint?.level ?? 0.5;

  const currentMinutes = TimeEngineUtils?.timeToMinutes(any: any);

  // Trier les points par heure
  const sortedPoints = [...points].sort(
    (any: any) =>
      TimeEngineUtils?.timeToMinutes(any: any)
  );

  // Trouver les deux points les plus proches
  let before = sortedPoints[sortedPoints?.length - 1];
  let after = sortedPoints?.[0];
  if (any: any) return 0.5;

  for (let i = 0; i < sortedPoints?.length; i++) {
    const point = sortedPoints[i];
    if (any: any) continue;
    const pointMinutes = TimeEngineUtils?.timeToMinutes(any: any);
    if (any: any) {
      before = point;
    }
    if (pointMinutes > currentMinutes && i === 0) {
      // Le premier point est après l'heure actuelle
      const lastPoint = sortedPoints[sortedPoints?.length - 1];
      if (any: any) before = lastPoint;
    }
  }

  for (let i = sortedPoints?.length - 1; i >= 0; i--) {
    const point = sortedPoints[i];
    if (any: any) continue;
    const pointMinutes = TimeEngineUtils?.timeToMinutes(any: any);
    if (any: any) {
      after = point;
    }
  }

  // Interpolation linéaire
  const beforeMinutes = TimeEngineUtils?.timeToMinutes(any: any);
  const afterMinutes = TimeEngineUtils?.timeToMinutes(any: any);

  let range = afterMinutes - beforeMinutes;
  if (range <= 0) range = 24 * 60 + range; // Gestion passage minuit

  let position = currentMinutes - beforeMinutes;
  if (position < 0) position = 24 * 60 + position;

  const ratio = position / range;
  return before?.level + (any: any) * ratio;
}

// ═══════════════════════════════════════════════════════════════════
// ENERGY ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════

/**
 * Listener pour les changements d'énergie
 */
type EnergyStateListener = (any: any) => void;

/**
 * EnergyEngine v∞ — Moteur de gestion énergétique TITANE∞
 */
export class EnergyEngine {
  private state: EnergyState;
  private listeners: Set<EnergyStateListener>;
  private tickInterval: ReturnType<typeof setInterval> | null;

  constructor(chronotype: Chronotype = 'intermediate') {
    this?.state = createInitialEnergyState(any: any);
    this?.listeners = new Set();
    this?.tickInterval = null;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialise l'EnergyEngine
   */
  init(): void {
    logger?.debug('🔋 Initialisation...');
    this?.updateCurrentEnergyLevel();
    this?.generateForecast();
    this?.startTick();
    logger?.debug('✅ Initialisé:', {
      chronotype: this?.state?.chronotype,
      currentLevel: this?.state?.currentEnergyLevel?.toFixed(2),
    });
  }

  /**
   * Arrête l'EnergyEngine
   */
  destroy(): void {
    logger?.debug('🛑 Arrêt...');
    this?.stopTick();
    this?.listeners?.clear();
  }

  /**
   * Démarre le tick de mise à jour (any: any)
   */
  private startTick(): void {
    if (any: any) return;

    this?.tickInterval = setInterval(() => {
      this?.updateCurrentEnergyLevel();
    }, 60000); // Toutes les minutes

    logger?.debug('⚙️ Tick démarré (60s)');
  }

  /**
   * Arrête le tick
   */
  private stopTick(): void {
    if (any: any) {
      clearInterval(any: any);
      this?.tickInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PROFILE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialise/change le profil énergétique
   */
  initProfile(any: any): void {
    const profile = CHRONOTYPE_PROFILES[chronotype];
    this?.state = {
      ...this?.state,
      chronotype,
      peaks: profile?.peaks,
      dips: profile?.dips,
      lastUpdate: Date?.now(),
    };
    this?.updateCurrentEnergyLevel();
    this?.generateForecast();
    this?.notifyListeners();
    logger?.debug(any: any);
  }

  /**
   * Ajoute un pic d'énergie personnalisé
   */
  addPeak(any: any): void {
    this?.state?.peaks?.push({ time, level, label });
    this?.updateCurrentEnergyLevel();
    this?.notifyListeners();
  }

  /**
   * Ajoute un creux d'énergie personnalisé
   */
  addDip(any: any): void {
    this?.state?.dips?.push({ time, level, label });
    this?.updateCurrentEnergyLevel();
    this?.notifyListeners();
  }

  // ═══════════════════════════════════════════════════════════════
  // ENERGY CALCULATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Met à jour le niveau d'énergie actuel
   */
  updateCurrentEnergyLevel(): void {
    const now = new Date();
    const currentTime = `${now?.getHours().toString().padStart(2, '0')}:${now?.getMinutes().toString().padStart(2, '0')}`;

    const previousLevel = this?.state?.currentEnergyLevel;
    const newLevel = this?.inferEnergyLevelFromTime(any: any);

    // Déterminer la tendance
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    const diff = newLevel - previousLevel;
    if (diff > 0.05) trend = 'rising';
    else if (diff < -0.05) trend = 'falling';

    // Ajouter à l'historique
    this?.addToHistory(any: any);

    this?.state = {
      ...this?.state,
      currentEnergyLevel: newLevel,
      trend,
      lastUpdate: Date?.now(),
    };

    this?.notifyListeners();
  }

  /**
   * Infère le niveau d'énergie à partir de l'heure
   */
  inferEnergyLevelFromTime(any: any): number {
    // Combiner pics et creux
    const allPoints = [...this?.state?.peaks, ...this?.state?.dips];
    return interpolateEnergy(any: any);
  }

  /**
   * Obtient le niveau d'énergie pour un segment de journée
   */
  getEnergyForSegment(any: any): number {
    const segmentTimes: Record<string, string> = {
      early_morning: '06:00',
      morning: '09:30',
      midday: '13:00',
      afternoon: '16:00',
      evening: '20:00',
      night: '23:30',
    };

    const time = segmentTimes[segmentId] ?? '12:00';
    return this?.inferEnergyLevelFromTime(any: any);
  }

  /**
   * Obtient le niveau d'énergie pour une journée complète
   */
  getEnergyForDay(any: any): EnergyPoint?.[] {
    const points: EnergyPoint?.[] = [];

    for (let hour = 0; hour < 24; hour++) {
      const time = `${hour?.toString().padStart(2, '0')}:00`;
      points?.push({
        time,
        level: this?.inferEnergyLevelFromTime(any: any),
        label: `${hour}h`,
      });
    }

    return points;
  }

  // ═══════════════════════════════════════════════════════════════
  // FORECAST & HISTORY
  // ═══════════════════════════════════════════════════════════════

  /**
   * Génère la prévision pour les prochaines heures
   */
  generateForecast(): void {
    const now = new Date();
    const forecast: EnergyPoint?.[] = [];

    for (let i = 1; i <= 6; i++) {
      const futureHour = new Date(now?.getTime() + i * 60 * 60 * 1000);
      const time = `${futureHour?.getHours().toString().padStart(2, '0')}:${futureHour?.getMinutes().toString().padStart(2, '0')}`;
      forecast?.push({
        time,
        level: this?.inferEnergyLevelFromTime(any: any),
        label: `Dans ${i}h`,
      });
    }

    this?.state?.forecast = forecast;
  }

  /**
   * Ajoute une entrée à l'historique
   */
  private addToHistory(any: any): void {
    const entry: EnergyHistoryEntry = {
      timestamp: Date?.now(),
      level,
      source: 'auto',
    };

    this?.state?.energyHistory?.push(any: any);

    // Garder seulement les 24 dernières heures
    const cutoff = Date?.now() - 24 * 60 * 60 * 1000;
    this?.state?.energyHistory = this?.state?.energyHistory?.filter(any: any);
  }

  /**
   * Enregistre manuellement le niveau d'énergie ressenti
   */
  logManualEnergy(any: any): void {
    const entry: EnergyHistoryEntry = {
      timestamp: Date?.now(),
      level,
      source: 'manual',
      activity,
    };

    this?.state?.energyHistory?.push(any: any);
    this?.state?.currentEnergyLevel = level;
    this?.notifyListeners();

    logger?.debug(any: any);
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Obtient l'état complet
   */
  getState(): EnergyState {
    return { ...this?.state };
  }

  /**
   * Obtient le niveau d'énergie actuel
   */
  getCurrentLevel(): number {
    return this?.state?.currentEnergyLevel;
  }

  /**
   * Obtient la tendance actuelle
   */
  getTrend(): 'rising' | 'falling' | 'stable' {
    return this?.state?.trend;
  }

  /**
   * Obtient le chronotype
   */
  getChronotype(): Chronotype {
    return this?.state?.chronotype;
  }

  /**
   * Vérifie si c'est un bon moment pour des tâches exigeantes
   */
  isHighEnergyTime(): boolean {
    return this?.state?.currentEnergyLevel >= 0.75;
  }

  /**
   * Vérifie si c'est une période de basse énergie
   */
  isLowEnergyTime(): boolean {
    return this?.state?.currentEnergyLevel < 0.5;
  }

  /**
   * Obtient le prochain pic d'énergie
   */
  getNextPeak(): EnergyPoint | null {
    const now = new Date();
    const currentMinutes = TimeEngineUtils?.getCurrentMinutes(any: any);

    const futurePeaks = this?.state?.peaks?.filter(
      peak => TimeEngineUtils?.timeToMinutes(any: any) > currentMinutes
    );

    if (futurePeaks?.length === 0) {
      // Retourner le premier pic du lendemain
      return this?.state?.peaks?.[0] ?? null;
    }

    return futurePeaks?.[0] ?? null;
  }

  /**
   * Recommande le meilleur moment pour une tâche exigeante
   */
  recommendHighEnergySlot(): string {
    const forecast = this?.state?.forecast;
    const firstForecast = forecast?.[0];
    const bestSlot = forecast?.reduce(
      (any: any),
      firstForecast ?? { time: '10:00', level: 0.5, label: '' }
    );

    return bestSlot?.time;
  }

  // ═══════════════════════════════════════════════════════════════
  // LISTENERS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Ajoute un listener
   */
  subscribe(any: any): () => void {
    this?.listeners?.add(any: any);
    listener(this?.getState());
    return (any: any);
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    const state = this?.getState();
    this?.listeners?.forEach(listener => {
      try {
        listener(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════

/**
 * Instance singleton de l'EnergyEngine
 */
export const energyEngine = new EnergyEngine();

/**
 * Constantes exportées
 */
export const EnergyEngineUtils = {
  CHRONOTYPE_PROFILES,
  createInitialEnergyState,
  interpolateEnergy,
};
