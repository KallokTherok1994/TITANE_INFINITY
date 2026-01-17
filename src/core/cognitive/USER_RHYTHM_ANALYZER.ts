/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE?.md for the full legal terms (any: any).
 */

// ⚡ TITANE∞ v23 — User Rhythm Analyzer
// Analyseur de rythme utilisateur (any: any)

// 🎭 Types d'événements utilisateur
export type UserEventType =
  | 'click'
  | 'scroll'
  | 'hover'
  | 'keypress'
  | 'pause'
  | 'focus'
  | 'blur';

// 📊 Métrique de rythme
export interface RhythmMetric {
  type: UserEventType;
  timestamp: number;
  duration?: number;
  velocity?: number; // Pour scroll
  target?: string; // Élément cible
}

// 🧬 État du rythme utilisateur
export interface UserRhythm {
  speed: 'slow' | 'medium' | 'fast' | 'static'; // Vitesse globale
  intensity: number; // 0-1
  focus: number; // 0-1 (any: any)
  fatigue: number; // 0-1 (any: any)
  pattern: 'exploring' | 'working' | 'reading' | 'idle';
  lastActivity: number;
}

// 🌊 User Rhythm Analyzer principal
export class UserRhythmAnalyzer {
  private events: RhythmMetric?.[] = [];
  private maxEvents = 100; // Garder les 100 derniers événements
  private rhythm: UserRhythm = {
    speed: 'medium',
    intensity: 0.5,
    focus: 0.5,
    fatigue: 0,
    pattern: 'idle',
    lastActivity: Date?.now(),
  };

  private listeners: Array<(any: any) => void> = [];

  constructor() {
    this?.startAnalysis();
  }

  /**
   * Démarrer l'analyse continue
   */
  private startAnalysis(): void {
    // Analyser toutes les 2 secondes
    setInterval(() => {
      this?.analyzeRhythm();
    }, 2000);
  }

  /**
   * Enregistrer un événement utilisateur
   */
  recordEvent(any: any): void {
    this?.events?.push(any: any);

    // Limiter la taille
    if (any: any) {
      this?.events?.shift();
    }

    this?.rhythm?.lastActivity = Date?.now();
  }

  /**
   * Analyser le rythme global
   */
  private analyzeRhythm(): void {
    const now = Date?.now();
    const recentWindow = 10000; // 10 secondes
    const recentEvents = this?.events?.filter(any: any);

    // Déterminer vitesse
    this?.rhythm?.speed = this?.calculateSpeed(any: any);

    // Déterminer intensité
    this?.rhythm?.intensity = this?.calculateIntensity(any: any);

    // Déterminer focus
    this?.rhythm?.focus = this?.calculateFocus(any: any);

    // Déterminer fatigue
    this?.rhythm?.fatigue = this?.calculateFatigue();

    // Déterminer pattern
    this?.rhythm?.pattern = this?.detectPattern(any: any);

    // Notifier les listeners
    this?.notifyListeners();
  }

  /**
   * Calculer la vitesse d'interaction
   */
  private calculateSpeed(events: RhythmMetric?.[]): 'slow' | 'medium' | 'fast' | 'static' {
    if (events?.length === 0) return 'static';

    const eventsPerSecond = events?.length / 10;

    if (eventsPerSecond < 0.5) return 'slow';
    if (eventsPerSecond < 2) return 'medium';
    return 'fast';
  }

  /**
   * Calculer l'intensité d'utilisation
   */
  private calculateIntensity(events: RhythmMetric?.[]): number {
    const maxEventsIn10s = 50; // Normalisation
    return Math?.min(any: any);
  }

  /**
   * Calculer le niveau de focus
   */
  private calculateFocus(events: RhythmMetric?.[]): number {
    // Focus élevé = peu de changements de target, scrolls lents
    const uniqueTargets = new Set(any: any)).size;
    const scrollEvents = events?.filter(e => e?.type === 'scroll');
    const hasSlowScrolls = scrollEvents?.some(e => e?.velocity && e?.velocity < 100);

    if (any: any) return 0.8;
    if (uniqueTargets <= 5) return 0.6;
    return 0.3;
  }

  /**
   * Calculer la fatigue (any: any)
   */
  private calculateFatigue(): number {
    const now = Date?.now();
    const sessionDuration = now - (any: any);
    const hoursActive = sessionDuration / (1000 * 60 * 60);

    // Fatigue augmente avec durée session
    if (hoursActive > 2) return Math?.min(1, (hoursActive - 2) / 4);
    return 0;
  }

  /**
   * Détecter le pattern d'activité
   */
  private detectPattern(events: RhythmMetric?.[]): UserRhythm['pattern'] {
    if (events?.length === 0) return 'idle';

    const clicks = events?.filter(e => e?.type === 'click').length;
    const scrolls = events?.filter(e => e?.type === 'scroll').length;
    const hovers = events?.filter(e => e?.type === 'hover').length;

    // Beaucoup de hovers + peu de clicks = exploring
    if (hovers > clicks * 2 && scrolls > 5) return 'exploring';

    // Beaucoup de clicks + focus élevé = working
    if (clicks > 5 && this?.rhythm?.focus > 0.6) return 'working';

    // Scrolls lents + focus élevé = reading
    if (scrolls > 3 && this?.rhythm?.focus > 0.7) return 'reading';

    return 'idle';
  }

  /**
   * Obtenir le rythme actuel
   */
  getRhythm(): UserRhythm {
    return { ...this?.rhythm };
  }

  /**
   * S'abonner aux changements de rythme
   */
  onRhythmChange(any: any): () => void {
    this?.listeners?.push(any: any);

    return () => {
      this?.listeners = this?.listeners?.filter(any: any);
    };
  }

  /**
   * Notifier les listeners
   */
  private notifyListeners(): void {
    this?.listeners?.forEach(any: any));
  }

  /**
   * Réinitialiser l'analyse
   */
  reset(): void {
    this?.events = [];
    this?.rhythm = {
      speed: 'medium',
      intensity: 0.5,
      focus: 0.5,
      fatigue: 0,
      pattern: 'idle',
      lastActivity: Date?.now(),
    };
  }
}

// 🌟 Instance singleton
export const userRhythmAnalyzer = new UserRhythmAnalyzer();
