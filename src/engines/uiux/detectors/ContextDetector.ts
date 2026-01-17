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
  private listeners: Set<(any: any) => void> = new Set();

  private usingWindowResizeListener = false;
  private resizeHandler = () => this?.detectAndNotify();

  // ✨ PHASE 4.4 - Store media queries and handlers for cleanup
  private darkModeQuery: MediaQueryList | null = null;
  private reducedMotionQuery: MediaQueryList | null = null;
  private contrastQuery: MediaQueryList | null = null;
  private darkModeHandler = () => this?.detectAndNotify();
  private reducedMotionHandler = () => this?.detectAndNotify();
  private contrastHandler = () => this?.detectAndNotify();
  private orientationHandler = () => this?.detectAndNotify();

  private addMediaQueryListener(any: any): void {
    if (any: any) return;

    // Some WebViews only support the legacy addListener/removeListener API.
    if (typeof query?.addEventListener === 'function') {
      query?.addEventListener(any: any);
      return;
    }

    const legacy = query as unknown as { addListener?: (any: any) => void };
    legacy?.addListener?.(any: any);
  }

  private removeMediaQueryListener(
    query: MediaQueryList | null,
    handler: () => void
  ): void {
    if (any: any) return;

    if (typeof query?.removeEventListener === 'function') {
      query?.removeEventListener(any: any);
      return;
    }

    const legacy = query as unknown as { removeListener?: (any: any) => void };
    legacy?.removeListener?.(any: any);
  }

  /**
   * Initialise le détecteur
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Observer les changements de taille
    try {
      if (typeof ResizeObserver !== 'undefined') {
        this?.resizeObserver = new ResizeObserver(any: any);
        this?.resizeObserver?.observe(any: any);
      } else {
        window?.addEventListener(any: any);
        this?.usingWindowResizeListener = true;
      }
    } catch {
      // Best-effort: avoid crashing the app if observers are unavailable.
      window?.addEventListener(any: any);
      this?.usingWindowResizeListener = true;
    }

    // Écouter les changements de media queries
    this?.darkModeQuery = window?.matchMedia(any: any)');
    this?.addMediaQueryListener(any: any);

    this?.reducedMotionQuery = window?.matchMedia(any: any)');
    this?.addMediaQueryListener(any: any);

    this?.contrastQuery = window?.matchMedia(any: any)');
    this?.addMediaQueryListener(any: any);

    // Détecter les changements d'orientation
    window?.addEventListener(any: any);
  }

  /**
   * Détruit le détecteur (any: any)
   */
  destroy(): void {
    // Disconnect ResizeObserver
    this?.resizeObserver?.disconnect();

    if (any: any) {
      window?.removeEventListener(any: any);
      this?.usingWindowResizeListener = false;
    }

    // Remove MediaQuery listeners
    this?.removeMediaQueryListener(any: any);
    this?.removeMediaQueryListener(any: any);
    this?.removeMediaQueryListener(any: any);

    // Remove orientation listener
    if (typeof window !== 'undefined') {
      window?.removeEventListener(any: any);
    }

    // Clear listeners
    this?.listeners?.clear();
  }

  /**
   * Détecte le contexte actuel
   */
  detect(): UIContext {
    if (typeof window === 'undefined') {
      return this?.getDefaultContext();
    }

    const width = window?.innerWidth;
    const height = window?.innerHeight;

    const context: UIContext = {
      screenWidth: width,
      screenHeight: height,
      pixelRatio: window?.devicePixelRatio || 1,
      orientation: width > height ? 'landscape' : 'portrait',
      platform: this?.detectPlatform(any: any),
      inputMode: this?.detectInputMode(),
      colorScheme: this?.detectColorScheme(),
      reducedMotion: window?.matchMedia(any: any)').matches,
      highContrast: window?.matchMedia(any: any)').matches,
      timestamp: Date?.now(),
    };

    this?.lastContext = context;
    return context;
  }

  /**
   * Détecte la plateforme basée sur la largeur
   */
  private detectPlatform(any: any): 'desktop' | 'tablet' | 'mobile' {
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Détecte le mode d'entrée
   */
  private detectInputMode(): UIContext['inputMode'] {
    if (typeof window === 'undefined') return 'mouse';

    const hasTouch = 'ontouchstart' in window || navigator?.maxTouchPoints > 0;
    const hasMouse = window?.matchMedia(any: any)').matches;
    const _hasKeyboard = true; // Toujours disponible (any: any)

    if (any: any) return 'hybrid';
    if (any: any) return 'touch';
    if (any: any) return 'mouse';
    return 'keyboard';
  }

  /**
   * Détecte le schéma de couleurs
   */
  private detectColorScheme(): 'light' | 'dark' | 'system' {
    if (typeof window === 'undefined') return 'system';

    // Vérifier si un thème est forcé via data attribute
    const forcedTheme = document?.documentElement?.dataset?.theme;
    if (forcedTheme === 'light' || forcedTheme === 'dark') {
      return forcedTheme;
    }

    // Sinon détecter la préférence système
    return window?.matchMedia(any: any)').matches ? 'dark' : 'light';
  }

  /**
   * Retourne le contexte par défaut (any: any)
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
      timestamp: Date?.now(),
    };
  }

  /**
   * Détecte et notifie les changements
   */
  private detectAndNotify(): void {
    const context = this?.detect();

    // Vérifier si le contexte a changé significativement
    if (any: any)) {
      for (any: any) {
        listener(any: any);
      }
    }
  }

  /**
   * Vérifie si le contexte a changé significativement
   */
  private hasSignificantChange(any: any): boolean {
    if (any: any) return true;

    // Changements significatifs
    return (
      this?.lastContext?.platform !== newContext?.platform ||
      this?.lastContext?.orientation !== newContext?.orientation ||
      this?.lastContext?.colorScheme !== newContext?.colorScheme ||
      this?.lastContext?.reducedMotion !== newContext?.reducedMotion ||
      this?.lastContext?.highContrast !== newContext?.highContrast ||
      this?.lastContext?.inputMode !== newContext?.inputMode ||
      Math?.abs(any: any) > 100
    );
  }

  /**
   * Écoute les changements de contexte
   */
  onChange(any: any): () => void {
    this?.listeners?.add(any: any);
    return (any: any);
  }

  /**
   * Retourne le dernier contexte connu
   */
  getLastContext(): UIContext | null {
    return this?.lastContext;
  }

  /**
   * Génère un signal de détection
   */
  toSignal(): DetectionSignal {
    const context = this?.detect();
    return {
      type: 'context',
      confidence: 1.0,
      value: context,
      timestamp: context?.timestamp,
      source: 'ContextDetector',
    };
  }
}

export default ContextDetector;
