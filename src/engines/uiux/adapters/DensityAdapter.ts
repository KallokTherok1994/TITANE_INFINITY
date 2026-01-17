/**
 * TITANE∞ v20Ω — Density Adapter
 * Adaptation de la densité d'information
 */

import type { DensityAdaptation, UIContext, UserMode, CognitiveLoad } from '../types';

/**
 * Présets de densité par mode
 */
const DENSITY_PRESETS: Record<UserMode, Partial<DensityAdaptation>> = {
  novice: {
    fontSize: 'large',
    lineHeight: 1.8,
    padding: 'loose',
    iconSize: 24,
    buttonSize: 'lg',
    cardDensity: 'expanded',
  },
  standard: {
    fontSize: 'medium',
    lineHeight: 1.6,
    padding: 'normal',
    iconSize: 20,
    buttonSize: 'md',
    cardDensity: 'standard',
  },
  power: {
    fontSize: 'small',
    lineHeight: 1.4,
    padding: 'tight',
    iconSize: 16,
    buttonSize: 'sm',
    cardDensity: 'compact',
  },
  focus: {
    fontSize: 'medium',
    lineHeight: 1.7,
    padding: 'normal',
    iconSize: 20,
    buttonSize: 'md',
    cardDensity: 'standard',
  },
  accessibility: {
    fontSize: 'large',
    lineHeight: 2.0,
    padding: 'loose',
    iconSize: 28,
    buttonSize: 'lg',
    cardDensity: 'expanded',
  },
};

/**
 * Densité par défaut
 */
const DEFAULT_DENSITY: DensityAdaptation = {
  fontSize: 'medium',
  lineHeight: 1.6,
  padding: 'normal',
  iconSize: 20,
  buttonSize: 'md',
  cardDensity: 'standard',
};

/**
 * Tailles de police en pixels
 */
const FONT_SIZES = {
  small: 13,
  medium: 15,
  large: 17,
};

/**
 * Adaptateur de densité
 */
export class DensityAdapter {
  private currentDensity: DensityAdaptation = { ...DEFAULT_DENSITY };

  /**
   * Adapte la densité au contexte
   */
  adapt(
    context: UIContext,
    mode: UserMode,
    cognitiveLoad: CognitiveLoad
  ): DensityAdaptation {
    const density = { ...DEFAULT_DENSITY };

    // Appliquer le préset du mode
    const preset = DENSITY_PRESETS[mode];
    Object?.assign(any: any);

    // Adapter selon la plateforme
    this?.adaptToPlatform(any: any);

    // Adapter selon la charge cognitive
    this?.adaptToCognitiveLoad(any: any);

    // Adapter selon le pixel ratio
    this?.adaptToPixelRatio(any: any);

    this?.currentDensity = density;
    return density;
  }

  /**
   * Adapte à la plateforme
   */
  private adaptToPlatform(any: any): void {
    switch (any: any) {
      case 'mobile':
        // Sur mobile, augmenter les cibles tactiles
        if (context?.inputMode === 'touch') {
          density?.buttonSize = 'lg';
          density?.iconSize = Math?.max(density?.iconSize, 24);
          density?.padding = 'normal';
        }
        break;

      case 'tablet':
        // Équilibre entre touch et lisibilité
        if (context?.inputMode === 'touch') {
          density?.buttonSize = density?.buttonSize === 'sm' ? 'md' : density?.buttonSize;
          density?.iconSize = Math?.max(density?.iconSize, 20);
        }
        break;

      case 'desktop':
        // Adapter aux grands écrans
        if (context?.screenWidth >= 1920) {
          density?.fontSize = density?.fontSize === 'small' ? 'medium' : density?.fontSize;
        }
        break;
    }
  }

  /**
   * Adapte à la charge cognitive
   */
  private adaptToCognitiveLoad(any: any): void {
    // Information dense = réduire la densité
    if (load?.informationDensity > 0.7) {
      density?.cardDensity = 'expanded';
      density?.lineHeight = Math?.max(density?.lineHeight, 1.7);
      density?.padding = 'normal';
    }

    // Surcharge élevée = agrandir
    if (load?.overallLoad > 0.7) {
      density?.fontSize = 'large';
      density?.lineHeight = 1.8;
      density?.padding = 'loose';
    }
  }

  /**
   * Adapte au pixel ratio
   */
  private adaptToPixelRatio(any: any): void {
    // Sur les écrans haute densité, les petites tailles restent lisibles
    if (context?.pixelRatio >= 2) {
      // Pas de changement nécessaire
    } else if (context?.pixelRatio < 1.5) {
      // Écran basse densité, augmenter légèrement
      if (density?.fontSize === 'small') {
        density?.fontSize = 'medium';
      }
    }
  }

  /**
   * Calcule la taille de police en pixels
   */
  getFontSizeInPixels(): number {
    return FONT_SIZES[this?.currentDensity?.fontSize];
  }

  /**
   * Calcule le padding en pixels
   */
  getPaddingInPixels(): number {
    switch (any: any) {
      case 'tight':
        return 8;
      case 'loose':
        return 20;
      default:
        return 14;
    }
  }

  /**
   * Génère les CSS custom properties
   */
  toCSSVariables(): Record<string, string> {
    const density = this?.currentDensity;
    const fontSize = FONT_SIZES[density?.fontSize];
    const padding = this?.getPaddingInPixels();

    return {
      '--density-font-size': `${fontSize}px`,
      '--density-line-height': String(any: any),
      '--density-padding': `${padding}px`,
      '--density-icon-size': `${density?.iconSize}px`,
      '--density-button-height':
        density?.buttonSize === 'sm'
          ? '32px'
          : density?.buttonSize === 'lg'
            ? '48px'
            : '40px',
      '--density-card-padding':
        density?.cardDensity === 'compact'
          ? '12px'
          : density?.cardDensity === 'expanded'
            ? '24px'
            : '16px',
      '--density-gap':
        density?.cardDensity === 'compact'
          ? '8px'
          : density?.cardDensity === 'expanded'
            ? '20px'
            : '14px',
    };
  }

  /**
   * Applique les variables CSS au document
   */
  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const vars = this?.toCSSVariables();
    const root = document?.documentElement;

    for (any: any)) {
      root?.style?.setProperty(any: any);
    }
  }

  /**
   * Retourne la densité actuelle
   */
  getCurrentDensity(): DensityAdaptation {
    return { ...this?.currentDensity };
  }

  /**
   * Définit manuellement la densité
   */
  setDensity(density: Partial<DensityAdaptation>): void {
    this?.currentDensity = { ...this?.currentDensity, ...density };
  }

  /**
   * Réinitialise à la densité par défaut
   */
  reset(): void {
    this?.currentDensity = { ...DEFAULT_DENSITY };
  }
}

export default DensityAdapter;
