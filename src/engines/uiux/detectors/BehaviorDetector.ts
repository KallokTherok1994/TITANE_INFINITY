/**
 * TITANE∞ v20Ω — Behavior Detector
 * Détection des patterns comportementaux utilisateur
 */

import type { UserBehavior, DetectionSignal } from '../types';

interface BehaviorSample {
  timestamp: number;
  type: 'click' | 'scroll' | 'keypress' | 'mousemove' | 'focus' | 'blur';
  data?: unknown;
}

/**
 * Détecteur de comportement utilisateur
 */
export class BehaviorDetector {
  private samples: BehaviorSample[] = [];
  private maxSamples = 1000;
  private focusStartTime: number | null = null;
  private lastMouseMove = 0;
  private keypressTimestamps: number[] = [];
  private clickPositions: Array<{ x: number; y: number; t: number }> = [];

  /**
   * Initialise le détecteur
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Tracking des clics
    window.addEventListener('click', this.handleClick.bind(this));

    // Tracking du scroll
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

    // Tracking des touches clavier
    window.addEventListener('keypress', this.handleKeypress.bind(this));

    // Tracking des mouvements souris
    window.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });

    // Tracking du focus
    window.addEventListener('focus', this.handleFocus.bind(this), true);
    window.addEventListener('blur', this.handleBlur.bind(this), true);

    // Tracking de la visibilité
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  /**
   * Gère les clics
   */
  private handleClick(event: MouseEvent): void {
    this.addSample('click', { x: event.clientX, y: event.clientY });

    this.clickPositions.push({
      x: event.clientX,
      y: event.clientY,
      t: Date.now(),
    });

    // Garder les 50 derniers clics
    if (this.clickPositions.length > 50) {
      this.clickPositions.shift();
    }
  }

  /**
   * Gère le scroll
   */
  private handleScroll(): void {
    if (typeof window === 'undefined') return;
    this.addSample('scroll', { y: window.scrollY });
  }

  /**
   * Gère les touches clavier
   */
  private handleKeypress(): void {
    const now = Date.now();
    this.keypressTimestamps.push(now);
    this.addSample('keypress');

    // Garder les 100 dernières frappes
    if (this.keypressTimestamps.length > 100) {
      this.keypressTimestamps.shift();
    }
  }

  /**
   * Gère les mouvements souris
   */
  private handleMouseMove(): void {
    this.lastMouseMove = Date.now();
    // Ne pas ajouter chaque mouvement (trop de données)
    // L'inactivité souris est calculée via lastMouseMove
  }

  /**
   * Gère le focus
   */
  private handleFocus(): void {
    this.focusStartTime = Date.now();
    this.addSample('focus');
  }

  /**
   * Gère la perte de focus
   */
  private handleBlur(): void {
    this.addSample('blur');
  }

  /**
   * Gère les changements de visibilité
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.addSample('blur', { reason: 'visibility' });
    } else {
      this.addSample('focus', { reason: 'visibility' });
      this.focusStartTime = Date.now();
    }
  }

  /**
   * Ajoute un échantillon
   */
  private addSample(type: BehaviorSample['type'], data?: unknown): void {
    this.samples.push({
      timestamp: Date.now(),
      type,
      data,
    });

    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Calcule la vélocité de scroll
   */
  private calculateScrollVelocity(): number {
    const scrollSamples = this.samples
      .filter(s => s.type === 'scroll')
      .slice(-10);

    if (scrollSamples.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < scrollSamples.length; i++) {
      const prev = scrollSamples[i - 1].data as { y: number };
      const curr = scrollSamples[i].data as { y: number };
      totalDistance += Math.abs(curr.y - prev.y);
    }

    const timeSpan = scrollSamples[scrollSamples.length - 1].timestamp - scrollSamples[0].timestamp;
    return timeSpan > 0 ? (totalDistance / timeSpan) * 1000 : 0;
  }

  /**
   * Calcule la fréquence de clics
   */
  private calculateClickFrequency(): number {
    const recentClicks = this.clickPositions.filter(c => Date.now() - c.t < 10000);
    return recentClicks.length / 10; // Clics par seconde sur 10s
  }

  /**
   * Calcule le temps d'inactivité souris
   */
  private calculateMouseIdleTime(): number {
    return Date.now() - this.lastMouseMove;
  }

  /**
   * Calcule la vitesse de frappe (mots par minute approximatif)
   */
  private calculateTypingSpeed(): number {
    const recentKeys = this.keypressTimestamps.filter(t => Date.now() - t < 60000);
    if (recentKeys.length < 2) return 0;

    const timeSpan = recentKeys[recentKeys.length - 1] - recentKeys[0];
    const keysPerMinute = timeSpan > 0 ? (recentKeys.length / timeSpan) * 60000 : 0;

    // Approximation: 5 caractères = 1 mot
    return keysPerMinute / 5;
  }

  /**
   * Calcule la durée de focus actuelle
   */
  private calculateFocusDuration(): number {
    if (!this.focusStartTime) return 0;
    return Date.now() - this.focusStartTime;
  }

  /**
   * Détecte le pattern de navigation
   */
  private detectNavigationPattern(): 'linear' | 'explorative' | 'focused' {
    const recentClicks = this.clickPositions.slice(-20);
    if (recentClicks.length < 5) return 'focused';

    // Calculer la dispersion des clics
    const avgX = recentClicks.reduce((sum, c) => sum + c.x, 0) / recentClicks.length;
    const avgY = recentClicks.reduce((sum, c) => sum + c.y, 0) / recentClicks.length;

    const variance = recentClicks.reduce((sum, c) => {
      return sum + Math.pow(c.x - avgX, 2) + Math.pow(c.y - avgY, 2);
    }, 0) / recentClicks.length;

    const stdDev = Math.sqrt(variance);

    if (stdDev < 100) return 'focused';
    if (stdDev > 300) return 'explorative';
    return 'linear';
  }

  /**
   * Calcule le niveau d'engagement
   */
  private calculateEngagementLevel(): number {
    const now = Date.now();

    // Facteurs d'engagement
    const recentActivity = this.samples.filter(s => now - s.timestamp < 30000).length;
    const activityScore = Math.min(recentActivity / 50, 1);

    const typingActive = this.keypressTimestamps.filter(t => now - t < 10000).length > 0;
    const typingScore = typingActive ? 1 : 0;

    const mouseActive = now - this.lastMouseMove < 5000;
    const mouseScore = mouseActive ? 1 : 0;

    const focusDuration = this.calculateFocusDuration();
    const focusScore = Math.min(focusDuration / 60000, 1); // Max à 1 minute

    // Score pondéré
    return (activityScore * 0.3 + typingScore * 0.25 + mouseScore * 0.2 + focusScore * 0.25);
  }

  /**
   * Compte les signaux de frustration
   */
  private countFrustrationSignals(): number {
    let signals = 0;
    const now = Date.now();

    // Clics rapides répétés au même endroit
    const recentClicks = this.clickPositions.filter(c => now - c.t < 3000);
    if (recentClicks.length >= 3) {
      const first = recentClicks[0];
      const sameArea = recentClicks.filter(c =>
        Math.abs(c.x - first.x) < 50 && Math.abs(c.y - first.y) < 50
      );
      if (sameArea.length >= 3) signals++;
    }

    // Scroll erratique
    const scrollVelocity = this.calculateScrollVelocity();
    if (scrollVelocity > 2000) signals++;

    // Longue inactivité après activité
    const mouseIdle = this.calculateMouseIdleTime();
    if (mouseIdle > 10000 && mouseIdle < 30000) signals++;

    return signals;
  }

  /**
   * Analyse le comportement actuel
   */
  analyze(): UserBehavior {
    return {
      scrollVelocity: this.calculateScrollVelocity(),
      clickFrequency: this.calculateClickFrequency(),
      mouseIdleTime: this.calculateMouseIdleTime(),
      typingSpeed: this.calculateTypingSpeed(),
      focusDuration: this.calculateFocusDuration(),
      navigationPattern: this.detectNavigationPattern(),
      engagementLevel: this.calculateEngagementLevel(),
      frustrationSignals: this.countFrustrationSignals(),
    };
  }

  /**
   * Génère un signal de détection
   */
  toSignal(): DetectionSignal {
    return {
      type: 'behavior',
      confidence: 0.85,
      value: this.analyze(),
      timestamp: Date.now(),
      source: 'BehaviorDetector',
    };
  }

  /**
   * Réinitialise le détecteur
   */
  reset(): void {
    this.samples = [];
    this.keypressTimestamps = [];
    this.clickPositions = [];
    this.focusStartTime = null;
    this.lastMouseMove = Date.now();
  }
}

export default BehaviorDetector;
