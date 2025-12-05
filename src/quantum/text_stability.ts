/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — TEXT STABILITY ENGINE
 * Optimisation de la lisibilité et anti-flicker typographique
 *
 * © 2025 Kevin Thibault — Licence MIT
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface TextMetrics {
  clarityScore: number;
  stabilizedElements: number;
  fontLoadStatus: 'loading' | 'loaded' | 'error';
  subpixelEnabled: boolean;
  lineHeightOptimized: boolean;
}

export class TextStabilityEngine {
  private strictMode: boolean;
  private stabilizedElements: Set<string> = new Set();
  private fontLoadStatus: 'loading' | 'loaded' | 'error' = 'loading';
  private clarityScore = 1.0;

  constructor(strictMode: boolean = true) {
    this.strictMode = strictMode;
  }

  /**
   * Applique les optimisations de texte globales
   */
  apply(): void {
    this.injectTextStyles();
    this.waitForFonts();
    this.optimizeRootTypography();

    console.log('[TextStabilityEngine] Applied text stability optimizations');
  }

  /**
   * Injecte les styles CSS de stabilité textuelle
   */
  private injectTextStyles(): void {
    const styleId = 'titane-text-stability-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* TITANE∞ Text Stability Engine */

      /* Optimisation du rendu de texte */
      html {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-feature-settings: "kern" 1, "liga" 1;
      }

      /* Stabilité typographique */
      .titane-text-stable {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        font-kerning: normal;
        font-variant-ligatures: common-ligatures;
      }

      /* Prévention du FOUT (Flash of Unstyled Text) */
      .titane-font-loading {
        opacity: 0;
      }

      .titane-font-loaded {
        opacity: 1;
        transition: opacity 0.15s ease-out;
      }

      /* Hauteurs de ligne cohérentes */
      .titane-text-flow {
        line-height: 1.5;
        letter-spacing: 0.01em;
      }

      .titane-text-heading {
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      /* Anti-flicker pour animations de texte */
      .titane-text-animated {
        will-change: opacity;
        backface-visibility: hidden;
        transform: translateZ(0);
      }

      /* Stabilité des monospace */
      .titane-text-mono {
        font-variant-numeric: tabular-nums;
        font-feature-settings: "tnum" 1;
      }

      /* Prévention du text-reflow */
      .titane-text-nowrap {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Subpixel rendering optimisé */
      @media screen and (-webkit-min-device-pixel-ratio: 2),
             screen and (min-resolution: 192dpi) {
        .titane-text-stable {
          -webkit-font-smoothing: subpixel-antialiased;
        }
      }

      /* Mode strict - optimisation maximale */
      .titane-text-strict {
        text-rendering: geometricPrecision;
        font-smooth: always;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* Prévention du layout shift pour texte dynamique */
      .titane-text-reserve {
        min-height: 1.5em;
        contain: layout;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Attend le chargement des polices
   */
  private async waitForFonts(): Promise<void> {
    if (!document.fonts) {
      this.fontLoadStatus = 'loaded';
      return;
    }

    try {
      await document.fonts.ready;
      this.fontLoadStatus = 'loaded';

      // Appliquer la classe de transition
      document.documentElement.classList.remove('titane-font-loading');
      document.documentElement.classList.add('titane-font-loaded');
    } catch (error) {
      console.warn('[TextStabilityEngine] Font loading error:', error);
      this.fontLoadStatus = 'error';
    }
  }

  /**
   * Optimise la typographie au niveau racine
   */
  private optimizeRootTypography(): void {
    const root = document.documentElement;
    root.classList.add('titane-text-stable');

    if (this.strictMode) {
      root.classList.add('titane-text-strict');
    }
  }

  /**
   * Stabilise le texte dans un élément
   */
  stabilizeText(element: HTMLElement): void {
    const id = element.id || `text_${Date.now()}`;

    element.classList.add('titane-text-stable');

    // Appliquer les classes appropriées selon le type
    if (this.isHeading(element)) {
      element.classList.add('titane-text-heading');
    } else if (this.isMonospace(element)) {
      element.classList.add('titane-text-mono');
    } else {
      element.classList.add('titane-text-flow');
    }

    // Stabiliser les enfants textuels
    this.stabilizeChildren(element);

    this.stabilizedElements.add(id);
  }

  /**
   * Vérifie si l'élément est un heading
   */
  private isHeading(element: HTMLElement): boolean {
    return /^H[1-6]$/.test(element.tagName);
  }

  /**
   * Vérifie si l'élément utilise une police monospace
   */
  private isMonospace(element: HTMLElement): boolean {
    const computed = getComputedStyle(element);
    return computed.fontFamily.toLowerCase().includes('mono') ||
           element.tagName === 'CODE' ||
           element.tagName === 'PRE';
  }

  /**
   * Stabilise les enfants textuels
   */
  private stabilizeChildren(parent: HTMLElement): void {
    // Stabiliser les codes
    parent.querySelectorAll('code, pre').forEach(el => {
      el.classList.add('titane-text-mono', 'titane-text-stable');
    });

    // Stabiliser les headings
    parent.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      el.classList.add('titane-text-heading', 'titane-text-stable');
    });

    // Prévenir le reflow pour les textes dynamiques
    parent.querySelectorAll('[data-dynamic-text]').forEach(el => {
      el.classList.add('titane-text-reserve');
    });
  }

  /**
   * Prépare un élément pour une animation de texte
   */
  prepareTextAnimation(element: HTMLElement): void {
    element.classList.add('titane-text-animated', 'titane-text-stable');
  }

  /**
   * Nettoie après une animation de texte
   */
  cleanupTextAnimation(element: HTMLElement): void {
    element.classList.remove('titane-text-animated');
  }

  /**
   * Calcule le score de clarté
   */
  getClarityScore(): number {
    // Score basé sur:
    // - Fonts chargées: 40%
    // - Éléments stabilisés: 30%
    // - Mode strict: 30%

    let score = 0;

    // Fonts
    score += this.fontLoadStatus === 'loaded' ? 0.4 :
             this.fontLoadStatus === 'loading' ? 0.2 : 0.1;

    // Stabilisation
    const stabilizationRatio = Math.min(1, this.stabilizedElements.size / 20);
    score += stabilizationRatio * 0.3;

    // Mode strict
    score += this.strictMode ? 0.3 : 0.15;

    this.clarityScore = score;
    return score;
  }

  /**
   * Récupère les métriques
   */
  getMetrics(): TextMetrics {
    return {
      clarityScore: this.getClarityScore(),
      stabilizedElements: this.stabilizedElements.size,
      fontLoadStatus: this.fontLoadStatus,
      subpixelEnabled: window.devicePixelRatio >= 2,
      lineHeightOptimized: true,
    };
  }

  /**
   * Active/désactive le mode strict
   */
  setStrictMode(strict: boolean): void {
    this.strictMode = strict;

    if (strict) {
      document.documentElement.classList.add('titane-text-strict');
    } else {
      document.documentElement.classList.remove('titane-text-strict');
    }
  }

  /**
   * Reset le moteur
   */
  reset(): void {
    this.stabilizedElements.clear();
    this.clarityScore = 1.0;
  }
}

export default TextStabilityEngine;
