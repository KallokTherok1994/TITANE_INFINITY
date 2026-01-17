/**
 * TITANE∞ v20Ω — Context Detector
 * Détection du contexte d'affichage et d'interaction
 */

import type { UIContext, DetectionSignal } from '../types';

/**
 * Détecteur de contexte UI
 */
export class ContextDetector {
  private lastContext: UIContext | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private listeners: Set<(context: UIContext) => void> = new Set();

  private usingWindowResizeListener = false;
  private resizeHandler = () => this.detectAndNotify();

  // ✨ PHASE 4.4 - Store media queries and handlers for cleanup
  private darkModeQuery: MediaQueryList | null = null;
  private reducedMotionQuery: MediaQueryList | null = null;
  private contrastQuery: MediaQueryList | null = null;
  private darkModeHandler = () => this.detectAndNotify();
  private reducedMotionHandler = () => this.detectAndNotify();
  private contrastHandler = () => this.detectAndNotify();
  private orientationHandler = () => this.detectAndNotify();

  private addMediaQueryListener(query: MediaQueryList | null, handler: () => void): void {
    if (!query) return;

    // Some WebViews only support the legacy addListener/removeListener API.
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      return;
    }

    const legacy = query as unknown as { addListener?: (cb: () => void) => void };
    legacy.addListener?.(handler);
  }

  private removeMediaQueryListener(
    query: MediaQueryList | null,
    handler: () => void
  ): void {
    if (!query) return;

    if (typeof query.removeEventListener === 'function') {
      query.removeEventListener('change', handler);
      return;
    }

    const legacy = query as unknown as { removeListener?: (cb: () => void) => void };
    legacy.removeListener?.(handler);
  }

  /**
   * Initialise le détecteur
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Observer les changements de taille
    try {
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(this.resizeHandler);
        this.resizeObserver.observe(document.documentElement);
      } else {
        window.addEventListener('resize', this.resizeHandler);
        this.usingWindowResizeListener = true;
      }
    } catch {
      // Best-effort: avoid crashing the app if observers are unavailable.
      window.addEventListener('resize', this.resizeHandler);
      this.usingWindowResizeListener = true;
    }

    // Écouter les changements de media queries
    this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.addMediaQueryListener(this.darkModeQuery, this.darkModeHandler);

    this.reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.addMediaQueryListener(this.reducedMotionQuery, this.reducedMotionHandler);

    this.contrastQuery = window.matchMedia('(prefers-contrast: more)');
    this.addMediaQueryListener(this.contrastQuery, this.contrastHandler);

    // Détecter les changements d'orientation
    window.addEventListener('orientationchange', this.orientationHandler);
  }

  /**
   * Détruit le détecteur (✨ PHASE 4.4 - Enhanced cleanup)
   */
  destroy(): void {
    // Disconnect ResizeObserver
    this.resizeObserver?.disconnect();

    if (typeof window !== 'undefined' && this.usingWindowResizeListener) {
      window.removeEventListener('resize', this.resizeHandler);
      this.usingWindowResizeListener = false;
    }

    // Remove MediaQuery listeners
    this.removeMediaQueryListener(this.darkModeQuery, this.darkModeHandler);
    this.removeMediaQueryListener(this.reducedMotionQuery, this.reducedMotionHandler);
    this.removeMediaQueryListener(this.contrastQuery, this.contrastHandler);

    // Remove orientation listener
    if (typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', this.orientationHandler);
    }

    // Clear listeners
    this.listeners.clear();
  }

  /**
   * Détecte le contexte actuel
   */
  detect(): UIContext {
    if (typeof window === 'undefined') {
      return this.getDefaultContext();
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const context: UIContext = {
      screenWidth: width,
      screenHeight: height,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: width > height ? 'landscape' : 'portrait',
      platform: this.detectPlatform(width),
      inputMode: this.detectInputMode(),
      colorScheme: this.detectColorScheme(),
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: more)').matches,
      timestamp: Date.now(),
    };

    this.lastContext = context;
    return context;
  }

  /**
   * Détecte la plateforme basée sur la largeur
   */
  private detectPlatform(width: number): 'desktop' | 'tablet' | 'mobile' {
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Détecte le mode d'entrée
   */
  private detectInputMode(): UIContext['inputMode'] {
    if (typeof window === 'undefined') return 'mouse';

    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasMouse = window.matchMedia('(pointer: fine)').matches;
    const _hasKeyboard = true; // Toujours disponible (unused)

    if (hasTouch && hasMouse) return 'hybrid';
    if (hasTouch) return 'touch';
    if (hasMouse) return 'mouse';
    return 'keyboard';
  }

  /**
   * Détecte le schéma de couleurs
   */
  private detectColorScheme(): 'light' | 'dark' | 'system' {
    if (typeof window === 'undefined') return 'system';

    // Vérifier si un thème est forcé via data attribute
    const forcedTheme = document.documentElement.dataset.theme;
    if (forcedTheme === 'light' || forcedTheme === 'dark') {
      return forcedTheme;
    }

    // Sinon détecter la préférence système
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Retourne le contexte par défaut (SSR)
   */
  private getDefaultContext(): UIContext {
    return {
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      orientation: 'landscape',
      platform: 'desktop',
      inputMode: 'mouse',
      colorScheme: 'system',
      reducedMotion: false,
      highContrast: false,
      timestamp: Date.now(),
    };
  }

  /**
   * Détecte et notifie les changements
   */
  private detectAndNotify(): void {
    const context = this.detect();

    // Vérifier si le contexte a changé significativement
    if (this.hasSignificantChange(context)) {
      for (const listener of this.listeners) {
        listener(context);
      }
    }
  }

  /**
   * Vérifie si le contexte a changé significativement
   */
  private hasSignificantChange(newContext: UIContext): boolean {
    if (!this.lastContext) return true;

    // Changements significatifs
    return (
      this.lastContext.platform !== newContext.platform ||
      this.lastContext.orientation !== newContext.orientation ||
      this.lastContext.colorScheme !== newContext.colorScheme ||
      this.lastContext.reducedMotion !== newContext.reducedMotion ||
      this.lastContext.highContrast !== newContext.highContrast ||
      this.lastContext.inputMode !== newContext.inputMode ||
      Math.abs(this.lastContext.screenWidth - newContext.screenWidth) > 100
    );
  }

  /**
   * Écoute les changements de contexte
   */
  onChange(callback: (context: UIContext) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Retourne le dernier contexte connu
   */
  getLastContext(): UIContext | null {
    return this.lastContext;
  }

  /**
   * Génère un signal de détection
   */
  toSignal(): DetectionSignal {
    const context = this.detect();
    return {
      type: 'context',
      confidence: 1.0,
      value: context,
      timestamp: context.timestamp,
      source: 'ContextDetector',
    };
  }
}

export default ContextDetector;
