/**
 * TITANE∞ v20Ω — Layout Adapter
 * Adaptation dynamique du layout
 */

import type { LayoutAdaptation, UIContext, UserMode, CognitiveLoad } from '../types';

/**
 * Présets de layout par mode
 */
const LAYOUT_PRESETS: Record<UserMode, Partial<LayoutAdaptation>> = {
  novice: {
    gridColumns: 1,
    spacing: 'relaxed',
    sidebarVisible: true,
    panelLayout: 'stack',
    footerVisible: true,
  },
  standard: {
    gridColumns: 2,
    spacing: 'normal',
    sidebarVisible: true,
    panelLayout: 'side-by-side',
    footerVisible: true,
  },
  power: {
    gridColumns: 3,
    spacing: 'compact',
    sidebarVisible: true,
    panelLayout: 'grid',
    footerVisible: false,
  },
  focus: {
    gridColumns: 1,
    spacing: 'normal',
    sidebarVisible: false,
    panelLayout: 'stack',
    footerVisible: false,
  },
  accessibility: {
    gridColumns: 1,
    spacing: 'relaxed',
    sidebarVisible: true,
    panelLayout: 'stack',
    footerVisible: true,
  },
};

/**
 * Layout par défaut
 */
const DEFAULT_LAYOUT: LayoutAdaptation = {
  gridColumns: 2,
  spacing: 'normal',
  sidebarVisible: true,
  sidebarWidth: 280,
  headerHeight: 64,
  footerVisible: true,
  panelLayout: 'side-by-side',
};

/**
 * Adaptateur de layout
 */
export class LayoutAdapter {
  private currentLayout: LayoutAdaptation = { ...DEFAULT_LAYOUT };

  /**
   * Adapte le layout au contexte
   */
  adapt(
    context: UIContext,
    mode: UserMode,
    cognitiveLoad: CognitiveLoad
  ): LayoutAdaptation {
    const layout = { ...DEFAULT_LAYOUT };

    // Appliquer le préset du mode
    const preset = LAYOUT_PRESETS[mode];
    Object.assign(layout, preset);

    // Adapter selon la plateforme
    this.adaptToPlatform(layout, context);

    // Adapter selon la charge cognitive
    this.adaptToCognitiveLoad(layout, cognitiveLoad);

    // Adapter selon l'orientation
    this.adaptToOrientation(layout, context);

    this.currentLayout = layout;
    return layout;
  }

  /**
   * Adapte à la plateforme
   */
  private adaptToPlatform(layout: LayoutAdaptation, context: UIContext): void {
    switch (context.platform) {
      case 'mobile':
        layout.gridColumns = 1;
        layout.sidebarVisible = false;
        layout.sidebarWidth = 0;
        layout.panelLayout = 'stack';
        layout.headerHeight = 56;
        break;

      case 'tablet':
        layout.gridColumns = Math.min(layout.gridColumns, 2);
        layout.sidebarWidth = context.orientation === 'landscape' ? 260 : 0;
        layout.sidebarVisible = context.orientation === 'landscape';
        break;

      case 'desktop':
        // Ajuster la largeur de la sidebar selon l'écran
        if (context.screenWidth < 1280) {
          layout.sidebarWidth = 240;
        } else if (context.screenWidth >= 1920) {
          layout.sidebarWidth = 320;
        }
        break;
    }
  }

  /**
   * Adapte à la charge cognitive
   */
  private adaptToCognitiveLoad(layout: LayoutAdaptation, load: CognitiveLoad): void {
    // Surcharge élevée = simplifier
    if (load.overallLoad > 0.7) {
      layout.gridColumns = 1;
      layout.spacing = 'relaxed';
      layout.footerVisible = false;
      layout.panelLayout = 'stack';
    } else if (load.overallLoad > 0.5) {
      layout.gridColumns = Math.min(layout.gridColumns, 2);
      layout.spacing = 'normal';
    }

    // Complexité visuelle élevée
    if (load.visualComplexity > 0.8) {
      layout.sidebarVisible = false;
    }
  }

  /**
   * Adapte à l'orientation
   */
  private adaptToOrientation(layout: LayoutAdaptation, context: UIContext): void {
    if (context.orientation === 'portrait') {
      layout.gridColumns = Math.min(layout.gridColumns, 1);
      layout.panelLayout = 'stack';

      if (context.platform !== 'desktop') {
        layout.sidebarVisible = false;
      }
    }
  }

  /**
   * Calcule le nombre de colonnes optimal
   */
  calculateOptimalColumns(screenWidth: number, contentWidth = 400): number {
    const availableWidth = screenWidth - 40; // Marges
    const columns = Math.floor(availableWidth / contentWidth);
    return Math.max(1, Math.min(columns, 4));
  }

  /**
   * Génère les CSS custom properties
   */
  toCSSVariables(): Record<string, string> {
    const layout = this.currentLayout;

    return {
      '--layout-columns': String(layout.gridColumns),
      '--layout-spacing':
        layout.spacing === 'compact'
          ? '8px'
          : layout.spacing === 'relaxed'
            ? '24px'
            : '16px',
      '--sidebar-width': `${layout.sidebarWidth}px`,
      '--sidebar-visible': layout.sidebarVisible ? '1' : '0',
      '--header-height': `${layout.headerHeight}px`,
      '--footer-visible': layout.footerVisible ? '1' : '0',
    };
  }

  /**
   * Applique les variables CSS au document
   */
  applyToDocument(): void {
    if (typeof document === 'undefined') return;

    const vars = this.toCSSVariables();
    const root = document.documentElement;

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }

  /**
   * Retourne le layout actuel
   */
  getCurrentLayout(): LayoutAdaptation {
    return { ...this.currentLayout };
  }

  /**
   * Définit manuellement le layout
   */
  setLayout(layout: Partial<LayoutAdaptation>): void {
    this.currentLayout = { ...this.currentLayout, ...layout };
  }

  /**
   * Réinitialise au layout par défaut
   */
  reset(): void {
    this.currentLayout = { ...DEFAULT_LAYOUT };
  }
}

export default LayoutAdapter;
