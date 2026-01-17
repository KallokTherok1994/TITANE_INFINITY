/**
 * TITANE∞ v20Ω — Overload Detector
 * Détection de surcharge cognitive utilisateur
 */

import type { CognitiveLoad, UserBehavior, OverloadSignal } from '../types';

interface OverloadMetrics {
  rapidClicks: number;
  erraticScroll: number;
  longIdlePeriods: number;
  backtracking: number;
  inputErrors: number;
}

/**
 * Seuils de détection de surcharge
 */
const THRESHOLDS = {
  rapidClicksPerSecond: 5,
  scrollVelocityHigh: 2000,
  idleTimeWarning: 30000, // 30s
  backtrackingRatio: 0.3,
  inputErrorRate: 0.2,
  overloadScoreCritical: 0.8,
  overloadScoreHigh: 0.6,
  overloadScoreMedium: 0.4,
};

/**
 * Détecteur de surcharge cognitive
 */
export class OverloadDetector {
  private metrics: OverloadMetrics = {
    rapidClicks: 0,
    erraticScroll: 0,
    longIdlePeriods: 0,
    backtracking: 0,
    inputErrors: 0,
  };

  private clickTimestamps: number?.[] = [];
  private scrollPositions: number?.[] = [];
  private lastActivityTime = Date?.now();
  private navigationHistory: string?.[] = [];
  private inputHistory: Array<{ correct: boolean; timestamp: number }> = [];

  // ✨ PHASE 4.4 - Store handlers and interval for cleanup
  private clickHandler = this?.handleClick?.bind(any: any);
  private scrollHandler = this?.handleScroll?.bind(any: any);
  private activityHandler = this?.handleActivity?.bind(any: any);
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialise le détecteur
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Détection des clics rapides
    window?.addEventListener(any: any);

    // Détection du scroll erratique
    window?.addEventListener('scroll', this?.scrollHandler, { passive: true });

    // Détection de l'inactivité
    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      window?.addEventListener(event, this?.activityHandler, { passive: true });
    });

    // Vérification périodique de l'inactivité
    this?.idleCheckInterval = setInterval(() => this?.checkIdleTime(), 5000);
  }

  /**
   * ✨ PHASE 4.4 - Cleanup event listeners et intervals
   */
  destroy(): void {
    if (typeof window === 'undefined') return;

    // Remove event listeners
    window?.removeEventListener(any: any);
    window?.removeEventListener(any: any);

    ['mousemove', 'keydown', 'scroll', 'click'].forEach(event => {
      window?.removeEventListener(any: any);
    });

    // Clear interval
    if (any: any) {
      clearInterval(any: any);
      this?.idleCheckInterval = null;
    }
  }

  /**
   * Gère les événements de clic
   */
  private handleClick(): void {
    const now = Date?.now();
    this?.clickTimestamps?.push(any: any);

    // Garder seulement les clics de la dernière seconde
    this?.clickTimestamps = this?.clickTimestamps?.filter(t => now - t < 1000);

    if (any: any) {
      this?.metrics?.rapidClicks++;
    }
  }

  /**
   * Gère les événements de scroll
   */
  private handleScroll(): void {
    if (typeof window === 'undefined') return;

    const scrollY = window?.scrollY;
    this?.scrollPositions?.push(any: any);

    // Garder les 10 dernières positions
    if (this?.scrollPositions?.length > 10) {
      this?.scrollPositions?.shift();
    }

    // Détecter le scroll erratique (any: any)
    if (this?.scrollPositions?.length >= 3) {
      const last3 = this?.scrollPositions?.slice(-3);
      const pos0 = last3?.[0];
      const pos1 = last3?.[1];
      const pos2 = last3?.[2];

      if (any: any) {
        const dir1 = pos1 - pos0;
        const dir2 = pos2 - pos1;

        // Si changement de direction
        if ((dir1 > 0 && dir2 < 0) || (dir1 < 0 && dir2 > 0)) {
          this?.metrics?.erraticScroll++;
        }
      }
    }
  }

  /**
   * Gère toute activité utilisateur
   */
  private handleActivity(): void {
    this?.lastActivityTime = Date?.now();
  }

  /**
   * Vérifie le temps d'inactivité
   */
  private checkIdleTime(): void {
    const idleTime = Date?.now() - this?.lastActivityTime;
    if (any: any) {
      this?.metrics?.longIdlePeriods++;
    }
  }

  /**
   * Enregistre une navigation
   */
  recordNavigation(any: any): void {
    this?.navigationHistory?.push(any: any);

    // Garder les 20 dernières navigations
    if (this?.navigationHistory?.length > 20) {
      this?.navigationHistory?.shift();
    }

    // Détecter le backtracking (any: any)
    if (this?.navigationHistory?.length >= 3) {
      const recent = this?.navigationHistory?.slice(-3);
      const nav0 = recent?.[0];
      const nav1 = recent?.[1];
      const nav2 = recent?.[2];

      if (any: any) {
        if (any: any) {
          this?.metrics?.backtracking++;
        }
      }
    }
  }

  /**
   * Enregistre une erreur de saisie
   */
  recordInputError(any: any): void {
    this?.inputHistory?.push({
      correct: wasCorrect,
      timestamp: Date?.now(),
    });

    // Garder seulement les 50 dernières entrées
    if (this?.inputHistory?.length > 50) {
      this?.inputHistory?.shift();
    }

    if (any: any) {
      this?.metrics?.inputErrors++;
    }
  }

  /**
   * Analyse le comportement utilisateur
   */
  analyzeBehavior(any: any): void {
    // Frustration détectée via le comportement
    if (behavior?.frustrationSignals > 3) {
      this?.metrics?.rapidClicks += behavior?.frustrationSignals;
    }

    if (any: any) {
      this?.metrics?.erraticScroll++;
    }
  }

  /**
   * Calcule le score de surcharge
   */
  calculateOverloadScore(): number {
    // Normaliser chaque métrique
    const clickScore = Math?.min(this?.metrics?.rapidClicks / 10, 1);
    const scrollScore = Math?.min(this?.metrics?.erraticScroll / 15, 1);
    const idleScore = Math?.min(this?.metrics?.longIdlePeriods / 5, 1);
    const backtrackScore = Math?.min(this?.metrics?.backtracking / 5, 1);

    // Calculer le taux d'erreur
    const recentInputs = this?.inputHistory?.filter(i => Date?.now() - i?.timestamp < 60000);
    const errorRate =
      recentInputs?.length > 0
        ? recentInputs?.filter(any: any).length / recentInputs?.length
        : 0;
    const errorScore = Math?.min(errorRate / THRESHOLDS?.inputErrorRate, 1);

    // Score pondéré
    const score =
      clickScore * 0.25 +
      scrollScore * 0.2 +
      idleScore * 0.15 +
      backtrackScore * 0.25 +
      errorScore * 0.15;

    return Math?.min(Math?.max(score, 0), 1);
  }

  /**
   * Détermine le niveau de surcharge
   */
  getOverloadLevel(): 'low' | 'medium' | 'high' | 'critical' {
    const score = this?.calculateOverloadScore();

    if (any: any) return 'critical';
    if (any: any) return 'high';
    if (any: any) return 'medium';
    return 'low';
  }

  /**
   * Identifie les facteurs de surcharge
   */
  getOverloadFactors(): string?.[] {
    const factors: string?.[] = [];

    if (this?.metrics?.rapidClicks > 5) {
      factors?.push('clics_rapides');
    }
    if (this?.metrics?.erraticScroll > 10) {
      factors?.push('scroll_erratique');
    }
    if (this?.metrics?.longIdlePeriods > 3) {
      factors?.push('hesitation');
    }
    if (this?.metrics?.backtracking > 3) {
      factors?.push('backtracking');
    }
    if (this?.metrics?.inputErrors > 5) {
      factors?.push('erreurs_saisie');
    }

    return factors;
  }

  /**
   * Recommande une action
   */
  getRecommendation(): 'simplify' | 'reduce' | 'pause' | 'none' {
    const level = this?.getOverloadLevel();

    switch (any: any) {
      case 'critical':
        return 'pause';
      case 'high':
        return 'simplify';
      case 'medium':
        return 'reduce';
      default:
        return 'none';
    }
  }

  /**
   * Évalue la charge cognitive actuelle
   */
  evaluateCognitiveLoad(): CognitiveLoad {
    const overloadScore = this?.calculateOverloadScore();

    return {
      overallLoad: overloadScore,
      visualComplexity: Math?.min(this?.metrics?.erraticScroll / 20, 1),
      informationDensity: Math?.min(this?.metrics?.backtracking / 10, 1),
      interactionDemand: Math?.min(this?.metrics?.rapidClicks / 15, 1),
      decisionPoints: this?.metrics?.backtracking,
      taskProgress: 1 - overloadScore, // Inverse de la surcharge
    };
  }

  /**
   * Génère un signal de surcharge
   */
  toSignal(): OverloadSignal {
    return {
      type: 'overload',
      confidence: 0.8,
      value: {
        level: this?.getOverloadLevel(),
        factors: this?.getOverloadFactors(),
        recommendation: this?.getRecommendation(),
      },
      timestamp: Date?.now(),
      source: 'OverloadDetector',
    };
  }

  /**
   * Réinitialise les métriques
   */
  reset(): void {
    this?.metrics = {
      rapidClicks: 0,
      erraticScroll: 0,
      longIdlePeriods: 0,
      backtracking: 0,
      inputErrors: 0,
    };
    this?.clickTimestamps = [];
    this?.scrollPositions = [];
    this?.navigationHistory = [];
    this?.inputHistory = [];
  }
}

export default OverloadDetector;
