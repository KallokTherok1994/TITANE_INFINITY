/**
 * TITANE∞ v20Ω — Visibility Adapter
 * Gestion de la visibilité des éléments UI
 */

import type { VisibilityAdaptation, UserMode, CognitiveLoad, UIContext } from '../types';

/**
 * Présets de visibilité par mode
 */
const VISIBILITY_PRESETS: Record<UserMode, VisibilityAdaptation> = {
  novice: {
    showAdvancedOptions: false,
    showMetrics: false,
    showDebugInfo: false,
    tooltipsEnabled: true,
    labelsVisible: true,
    helpersVisible: true,
    progressIndicatorsVisible: true,
  },
  standard: {
    showAdvancedOptions: false,
    showMetrics: true,
    showDebugInfo: false,
    tooltipsEnabled: true,
    labelsVisible: true,
    helpersVisible: false,
    progressIndicatorsVisible: true,
  },
  power: {
    showAdvancedOptions: true,
    showMetrics: true,
    showDebugInfo: true,
    tooltipsEnabled: false,
    labelsVisible: false,
    helpersVisible: false,
    progressIndicatorsVisible: true,
  },
  focus: {
    showAdvancedOptions: false,
    showMetrics: false,
    showDebugInfo: false,
    tooltipsEnabled: false,
    labelsVisible: true,
    helpersVisible: false,
    progressIndicatorsVisible: false,
  },
  accessibility: {
    showAdvancedOptions: false,
    showMetrics: false,
    showDebugInfo: false,
    tooltipsEnabled: true,
    labelsVisible: true,
    helpersVisible: true,
    progressIndicatorsVisible: true,
  },
};

/**
 * Visibilité par défaut
 */
const DEFAULT_VISIBILITY: VisibilityAdaptation = {
  showAdvancedOptions: false,
  showMetrics: true,
  showDebugInfo: false,
  tooltipsEnabled: true,
  labelsVisible: true,
  helpersVisible: false,
  progressIndicatorsVisible: true,
};

/**
 * Adaptateur de visibilité
 */
export class VisibilityAdapter {
  private currentVisibility: VisibilityAdaptation = { ...DEFAULT_VISIBILITY };
  private userOverrides: Partial<VisibilityAdaptation> = {};

  /**
   * Adapte la visibilité au contexte
   */
  adapt(context: UIContext, mode: UserMode, cognitiveLoad: CognitiveLoad): VisibilityAdaptation {
    // Commencer avec le préset du mode
    const visibility = { ...VISIBILITY_PRESETS[mode] };

    // Adapter selon la charge cognitive
    this.adaptToCognitiveLoad(visibility, cognitiveLoad);

    // Adapter selon la plateforme
    this.adaptToPlatform(visibility, context);

    // Appliquer les overrides utilisateur
    Object.assign(visibility, this.userOverrides);

    this.currentVisibility = visibility;
    return visibility;
  }

  /**
   * Adapte à la charge cognitive
   */
  private adaptToCognitiveLoad(visibility: VisibilityAdaptation, load: CognitiveLoad): void {
    // Surcharge élevée = masquer les éléments non essentiels
    if (load.overallLoad > 0.7) {
      visibility.showMetrics = false;
      visibility.showDebugInfo = false;
      visibility.showAdvancedOptions = false;
      visibility.helpersVisible = true; // Garder l'aide
    } else if (load.overallLoad > 0.5) {
      visibility.showDebugInfo = false;
    }

    // Complexité visuelle élevée = simplifier
    if (load.visualComplexity > 0.8) {
      visibility.tooltipsEnabled = false;
      visibility.progressIndicatorsVisible = false;
    }

    // Beaucoup de points de décision = montrer les helpers
    if (load.decisionPoints > 5) {
      visibility.helpersVisible = true;
      visibility.tooltipsEnabled = true;
    }
  }

  /**
   * Adapte à la plateforme
   */
  private adaptToPlatform(visibility: VisibilityAdaptation, context: UIContext): void {
    // Mobile = simplifier
    if (context.platform === 'mobile') {
      visibility.showDebugInfo = false;
      visibility.showMetrics = false;
      visibility.labelsVisible = true; // Garder les labels sur mobile
    }

    // Touch = pas de tooltips hover
    if (context.inputMode === 'touch') {
      visibility.tooltipsEnabled = false;
    }

    // Petit écran = masquer les options avancées
    if (context.screenWidth < 768) {
      visibility.showAdvancedOptions = false;
    }
  }

  /**
   * Définit un override utilisateur
   */
  setUserOverride(key: keyof VisibilityAdaptation, value: boolean): void {
    this.userOverrides[key] = value;
  }

  /**
   * Supprime un override utilisateur
   */
  clearUserOverride(key: keyof VisibilityAdaptation): void {
    delete this.userOverrides[key];
  }

  /**
   * Supprime tous les overrides utilisateur
   */
  clearAllOverrides(): void {
    this.userOverrides = {};
  }

  /**
   * Vérifie si un élément est visible
   */
  isVisible(element: keyof VisibilityAdaptation): boolean {
    return this.currentVisibility[element];
  }

  /**
   * Toggle la visibilité d'un élément
   */
  toggle(element: keyof VisibilityAdaptation): boolean {
    const newValue = !this.currentVisibility[element];
    this.setUserOverride(element, newValue);
    this.currentVisibility[element] = newValue;
    return newValue;
  }

  /**
   * Génère les data attributes pour le DOM
   */
  toDataAttributes(): Record<string, string> {
    const vis = this.currentVisibility;

    return {
      'data-show-advanced': String(vis.showAdvancedOptions),
      'data-show-metrics': String(vis.showMetrics),
      'data-show-debug': String(vis.showDebugInfo),
      'data-tooltips': String(vis.tooltipsEnabled),
      'data-labels': String(vis.labelsVisible),
      'data-helpers': String(vis.helpersVisible),
      'data-progress': String(vis.progressIndicatorsVisible),
    };
  }

  /**
   * Applique les attributs au document
   */
  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const attrs = this.toDataAttributes();
    const root = document.documentElement;

    for (const [key, value] of Object.entries(attrs)) {
      root.setAttribute(key, value);
    }
  }

  /**
   * Génère les CSS custom properties
   */
  toCSSVariables(): Record<string, string> {
    const vis = this.currentVisibility;

    return {
      '--visibility-advanced': vis.showAdvancedOptions ? 'block' : 'none',
      '--visibility-metrics': vis.showMetrics ? 'block' : 'none',
      '--visibility-debug': vis.showDebugInfo ? 'block' : 'none',
      '--visibility-helpers': vis.helpersVisible ? 'block' : 'none',
      '--visibility-progress': vis.progressIndicatorsVisible ? 'block' : 'none',
    };
  }

  /**
   * Retourne la visibilité actuelle
   */
  getCurrentVisibility(): VisibilityAdaptation {
    return { ...this.currentVisibility };
  }

  /**
   * Réinitialise à la visibilité par défaut
   */
  reset(): void {
    this.currentVisibility = { ...DEFAULT_VISIBILITY };
    this.userOverrides = {};
  }
}

export default VisibilityAdapter;
