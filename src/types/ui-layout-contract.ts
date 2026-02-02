/**
 * TITANE∞ vΩ.3 — UI Layout Contract
 * TypeScript types and enforcement for UI navigation architecture
 * Enforces UI_NAVIGATION_CONSTITUTION.md programmatically
 * © 2026 TITANE Team. All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// LAYOUT REGIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Classification des régions de layout UI
 * Chaque composant de navigation doit déclarer sa région
 */
export type LayoutRegion = 
  | 'topnav'        // Navigation globale (1 seule instance max)
  | 'local-tabs'    // Tabs internes à une page
  | 'content'       // Zone de contenu principal
  | 'toolstrip'     // Barre d'outils contextuelle
  | 'overlay'       // Modal/drawer temporaire
  | 'footer';       // Pied de page

/**
 * Métadonnées requises pour chaque composant de navigation
 */
export interface NavigationComponentMetadata {
  /** Identifiant unique du composant */
  id: string;
  
  /** Région de layout déclarée */
  region: LayoutRegion;
  
  /** Nom du composant (pour debug/logs) */
  componentName: string;
  
  /** Le composant est-il sticky ? */
  isSticky?: boolean;
  
  /** z-index si sticky */
  zIndex?: number;
  
  /** Scope de navigation */
  scope: 'global' | 'local' | 'contextual';
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════

/**
 * Règles de validation pour Layout Regions
 */
export const LAYOUT_REGION_RULES = {
  topnav: {
    maxInstances: 1,
    allowedScopes: ['global'] as const,
    allowedSticky: true,
    requiredZIndex: 1000,
  },
  'local-tabs': {
    maxInstances: 1, // Par page
    allowedScopes: ['local'] as const,
    allowedSticky: false, // Défaut: pas sticky
    forbiddenStyles: [
      'backdrop-filter: blur',
      'box-shadow > 4px',
      'background: gradient',
      'height > 64px',
    ],
  },
  toolstrip: {
    maxInstances: Infinity,
    allowedScopes: ['contextual'] as const,
    allowedSticky: false,
  },
  overlay: {
    maxInstances: Infinity,
    allowedScopes: ['local', 'contextual'] as const,
    allowedSticky: true,
    requiredZIndex: 2000, // Au-dessus de tout
  },
} as const;

// ═══════════════════════════════════════════════════════════════
// REGISTRY SINGLETON
// ═══════════════════════════════════════════════════════════════

/**
 * Registry singleton pour tracker les composants de navigation actifs
 * Utilisé pour enforcement runtime des règles
 */
class NavigationRegistry {
  private components: Map<string, NavigationComponentMetadata> = new Map();
  private violations: Array<{ component: string; rule: string; severity: 'critical' | 'high' | 'medium' }> = [];

  /**
   * Enregistre un composant de navigation
   * @throws Error si violation critique détectée
   */
  register(metadata: NavigationComponentMetadata): void {
    // Check: topnav unique
    if (metadata.region === 'topnav') {
      const existingTopNav = Array.from(this.components.values()).find(
        c => c.region === 'topnav'
      );
      if (existingTopNav) {
        const violation = {
          component: metadata.componentName,
          rule: 'SINGLE_TOPNAV_VIOLATED',
          severity: 'critical' as const,
        };
        this.violations.push(violation);
        throw new Error(
          `[UI Layout Contract] CRITICAL: Tentative d'ajouter une 2e TopNav ` +
          `(existante: ${existingTopNav.componentName}, nouvelle: ${metadata.componentName}). ` +
          `Voir UI_NAVIGATION_CONSTITUTION.md Article 1.`
        );
      }
    }

    // Check: local-tabs not sticky by default
    if (metadata.region === 'local-tabs' && metadata.isSticky) {
      const violation = {
        component: metadata.componentName,
        rule: 'LOCAL_TABS_STICKY_VIOLATION',
        severity: 'high' as const,
      };
      this.violations.push(violation);
      console.warn(
        `[UI Layout Contract] HIGH: local-tabs "${metadata.componentName}" est sticky. ` +
        `Exception documentée requise. Voir UI_NAVIGATION_CONSTITUTION.md Article 3.`
      );
    }

    // Check: z-index coordination
    if (metadata.isSticky && metadata.region === 'topnav') {
      if (metadata.zIndex !== LAYOUT_REGION_RULES.topnav.requiredZIndex) {
        console.warn(
          `[UI Layout Contract] MEDIUM: TopNav z-index devrait être ${LAYOUT_REGION_RULES.topnav.requiredZIndex}, ` +
          `reçu ${metadata.zIndex}.`
        );
      }
    }

    this.components.set(metadata.id, metadata);
  }

  /**
   * Désenregistre un composant (unmount)
   */
  unregister(id: string): void {
    this.components.delete(id);
  }

  /**
   * Obtient tous les composants d'une région
   */
  getComponentsByRegion(region: LayoutRegion): NavigationComponentMetadata[] {
    return Array.from(this.components.values()).filter(c => c.region === region);
  }

  /**
   * Vérifie les violations actives
   */
  getViolations(): typeof this.violations {
    return this.violations;
  }

  /**
   * Reset (pour tests)
   */
  reset(): void {
    this.components.clear();
    this.violations = [];
  }
}

export const navigationRegistry = new NavigationRegistry();

// ═══════════════════════════════════════════════════════════════
// REACT HOOK (OPTIONAL)
// ═══════════════════════════════════════════════════════════════

/**
 * Hook React pour enregistrer automatiquement un composant
 * Usage:
 * ```tsx
 * const TopNav = () => {
 *   useNavigationComponent({
 *     id: 'global-topnav',
 *     region: 'topnav',
 *     componentName: 'TopNav',
 *     isSticky: true,
 *     zIndex: 1000,
 *     scope: 'global',
 *   });
 *   return <nav>...</nav>;
 * };
 * ```
 */
export function useNavigationComponent(metadata: NavigationComponentMetadata): void {
  // Implementation serait dans un hook React réel
  // Ici on fournit juste la signature de type
  navigationRegistry.register(metadata);
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Valide qu'un ensemble de styles n'est pas "navbar-like"
 * Utilisé pour vérifier que local-tabs ne ressemblent pas à TopNav
 */
export interface StyleValidationResult {
  isValid: boolean;
  violations: string[];
}

export function validateLocalTabsStyles(styles: CSSStyleDeclaration): StyleValidationResult {
  const violations: string[] = [];

  // Check backdrop-filter
  if (styles.backdropFilter && styles.backdropFilter !== 'none') {
    violations.push('backdrop-filter détecté (interdit pour local-tabs)');
  }

  // Check box-shadow
  const shadowMatch = styles.boxShadow.match(/(\d+)px/);
  if (shadowMatch?.[1] !== undefined && parseInt(shadowMatch[1]!) > 4) {
    violations.push(`box-shadow trop épaisse: ${shadowMatch[1]}px (max 4px)`);
  }

  // Check height
  if (styles.height && parseInt(styles.height) > 64) {
    violations.push(`height excessive: ${styles.height} (max 64px)`);
  }

  // Check position sticky
  if (styles.position === 'sticky' || styles.position === 'fixed') {
    violations.push(`position ${styles.position} (interdit par défaut pour local-tabs)`);
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Compte le nombre de TopNav actives
 * Utilisé par gates/tests
 */
export function countTopNavInstances(): number {
  return navigationRegistry.getComponentsByRegion('topnav').length;
}

/**
 * Vérifie la conformité globale du layout
 */
export interface LayoutComplianceReport {
  compliant: boolean;
  criticalViolations: number;
  warnings: number;
  details: Array<{ severity: string; message: string }>;
}

export function checkLayoutCompliance(): LayoutComplianceReport {
  const violations = navigationRegistry.getViolations();
  const criticalCount = violations.filter(v => v.severity === 'critical').length;
  const warningCount = violations.filter(v => v.severity !== 'critical').length;

  const details = violations.map(v => ({
    severity: v.severity,
    message: `[${v.severity.toUpperCase()}] ${v.component}: ${v.rule}`,
  }));

  return {
    compliant: criticalCount === 0,
    criticalViolations: criticalCount,
    warnings: warningCount,
    details,
  };
}
