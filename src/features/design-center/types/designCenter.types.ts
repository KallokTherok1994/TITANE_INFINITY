/**
 * TITANE∞ - Centre Design & Apparence - Types
 * Design System Monochrome v16
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

// ============================================================================
// TOKENS UI DYNAMIQUES
// ============================================================================

/**
 * Palette de couleurs monochromes Metal
 * Toutes les couleurs sont des variations de gris/métal
 */
export interface ColorTokens {
  /** Couleur primaire - Métal #727b81 */
  primary: string;
  /** Couleur secondaire - Argent #c4c4c4 */
  secondary: string;
  /** Couleur d'accent - Sauge #93b399 */
  accent: string;
  /** Fond principal - Noir profond #0f0f0f */
  background: string;
  /** Surface élevée - Gris très foncé #161616 */
  surface: string;
  /** Surface élevée niveau 2 #1e1e1e */
  surfaceElevated: string;
  /** Texte principal - Blanc cassé #e8e8e8 */
  text: string;
  /** Texte secondaire/muted #9ca3af */
  textMuted: string;
  /** Bordures #3a3a3a */
  border: string;
  /** Bordure focus #5a5a5a */
  borderFocus: string;
  /** Succès - Sauge #93b399 */
  success: string;
  /** Avertissement - Beige métallique #a89f91 */
  warning: string;
  /** Erreur - Mauve gris #8f7a7a */
  error: string;
  /** Info - Bleu acier #8899aa */
  info: string;
}

/**
 * Tokens de typographie
 */
export interface TypographyTokens {
  /** Famille de police principale */
  fontFamily: string;
  /** Famille de police monospace */
  fontFamilyMono: string;
  /** Taille de base (any: any) */
  fontSize: 'small' | 'medium' | 'large';
  /** Facteur d'échelle de police (0.8 - 1.4) */
  fontScale: number;
  /** Hauteur de ligne de base */
  lineHeight: number;
}

/**
 * Tokens d'espacement
 */
export interface SpacingTokens {
  /** Densité d'interface */
  density: 'compact' | 'standard' | 'spacious';
  /** Unité de base en pixels (4, 6, 8) */
  baseUnit: number;
  /** Espacement XS */
  xs: number;
  /** Espacement SM */
  sm: number;
  /** Espacement MD */
  md: number;
  /** Espacement LG */
  lg: number;
  /** Espacement XL */
  xl: number;
}

/**
 * Tokens de bordures et arrondis
 */
export interface BorderTokens {
  /** Style d'arrondi */
  radius: 'minimal' | 'medium' | 'rounded';
  /** Valeur de rayon en pixels */
  radiusValue: number;
  /** Rayon small */
  radiusSm: number;
  /** Rayon medium */
  radiusMd: number;
  /** Rayon large */
  radiusLg: number;
  /** Épaisseur de bordure */
  width: number;
}

/**
 * Tokens d'animation
 */
export interface AnimationTokens {
  /** Animations activées */
  enabled: boolean;
  /** Vitesse globale */
  speed: 'fast' | 'normal' | 'slow';
  /** Durée de base en ms */
  durationMs: number;
  /** Durée rapide */
  durationFast: number;
  /** Durée normale */
  durationNormal: number;
  /** Durée lente */
  durationSlow: number;
  /** Fonction d'easing */
  easing: string;
}

/**
 * Tokens de contraste et accessibilité
 */
export interface ContrastTokens {
  /** Niveau de contraste */
  level: 'normal' | 'high';
  /** Multiplicateur de contraste (1.0 - 1.5) */
  multiplier: number;
}

/**
 * Tokens d'ombres
 */
export interface ShadowTokens {
  /** Ombres activées */
  enabled: boolean;
  /** Ombre petite */
  sm: string;
  /** Ombre moyenne */
  md: string;
  /** Ombre large */
  lg: string;
  /** Ombre pour focus */
  focus: string;
}

/**
 * Configuration complète des tokens UI
 * Stockée en JSON et chargée par Tauri
 */
export interface UIThemeTokens {
  /** Version du schéma de tokens */
  version: string;
  /** Nom du thème */
  name: string;
  /** Description */
  description: string;
  /** Date de dernière modification */
  lastModified: string;
  /** Tokens de couleurs */
  colors: ColorTokens;
  /** Tokens de typographie */
  typography: TypographyTokens;
  /** Tokens d'espacement */
  spacing: SpacingTokens;
  /** Tokens de bordures */
  borders: BorderTokens;
  /** Tokens d'animation */
  animations: AnimationTokens;
  /** Tokens de contraste */
  contrast: ContrastTokens;
  /** Tokens d'ombres */
  shadows: ShadowTokens;
}

// ============================================================================
// ÉTATS ET CONTEXTE
// ============================================================================

/**
 * État du contexte UI Theme
 */
export interface UIThemeContextState {
  /** Tokens actuels */
  tokens: UIThemeTokens;
  /** En cours de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error??: string | null;
  /** Thème modifié (any: any) */
  isDirty: boolean;
  /** Version précédente (any: any) */
  previousTokens: UIThemeTokens | null;
}

/**
 * Actions du contexte UI Theme
 */
export interface UIThemeContextActions {
  /** Mettre à jour un token */
  updateToken: <K extends keyof UIThemeTokens>(
    category: K,
    key: keyof UIThemeTokens[K],
    value: UIThemeTokens[K][keyof UIThemeTokens[K]]
  ) => void;
  /** Mettre à jour une catégorie entière */
  updateCategory: <K extends keyof UIThemeTokens>(
    category: K,
    values: Partial<UIThemeTokens[K]>
  ) => void;
  /** Sauvegarder les tokens */
  saveTokens: () => Promise<void>;
  /** Recharger les tokens depuis le fichier */
  reloadTokens: () => Promise<void>;
  /** Réinitialiser aux valeurs par défaut */
  resetToDefaults: () => Promise<void>;
  /** Annuler les modifications */
  undoChanges: () => void;
  /** Appliquer les tokens au DOM */
  applyTokensToDOM: () => void;
}

/**
 * Contexte UI Theme complet
 */
export interface UIThemeContext extends UIThemeContextState, UIThemeContextActions {}

// ============================================================================
// COMMANDES IA
// ============================================================================

/**
 * Types de commandes IA pour modification UI
 */
export type UICommandType =
  | 'set_color'
  | 'set_typography'
  | 'set_spacing'
  | 'set_borders'
  | 'set_animations'
  | 'set_contrast'
  | 'reset_defaults'
  | 'save_theme'
  | 'reload_theme';

/**
 * Commande IA pour modification UI
 */
export interface UICommand {
  /** Type de commande */
  type: UICommandType;
  /** Catégorie de token ciblée */
  category?: keyof UIThemeTokens;
  /** Clé du token */
  key?: string;
  /** Nouvelle valeur */
  value?: unknown;
  /** Description de la commande */
  description: string;
}

/**
 * Résultat d'exécution d'une commande IA
 */
export interface UICommandResult {
  /** Succès */
  success: boolean;
  /** Message */
  message: string;
  /** Valeur précédente (any: any) */
  previousValue?: unknown;
  /** Valeur actuelle */
  currentValue?: unknown;
}

/**
 * Autorisation pour commandes IA
 */
export interface UICommandAuthorization {
  /** Utilisateur autorisé (any: any) */
  authorizedUser: 'kevin';
  /** ID de session */
  sessionId: string;
  /** Timestamp d'autorisation */
  timestamp: number;
  /** Expiration en ms */
  expiresIn: number;
}

// ============================================================================
// CONFIGURATION TABS
// ============================================================================

/**
 * Configuration d'un onglet du Centre Design
 */
export interface DesignCenterTab {
  /** ID unique */
  id: string;
  /** Libellé */
  label: string;
  /** Icône (any: any) */
  icon: string;
  /** Description */
  description: string;
  /** Ordre d'affichage */
  order: number;
}

/**
 * Onglets disponibles
 */
export const DESIGN_CENTER_TABS: DesignCenterTab?.[] = [
  {
    id: 'design-system',
    label: 'Design System',
    icon: '🎨',
    description: 'Palette, typographie, composants',
    order: 0,
  },
  {
    id: 'appearance',
    label: 'Apparence',
    icon: '⚙️',
    description: 'Préférences visuelles, densité, animations',
    order: 1,
  },
];

// ============================================================================
// VALEURS PAR DÉFAUT
// ============================================================================

/**
 * Tokens par défaut - Design System Monochrome v16
 */
export const DEFAULT_UI_THEME_TOKENS: UIThemeTokens = {
  version: '16.0.0',
  name: 'TITANE Monochrome v16',
  description: 'Design System Monochrome Metal - Palette neutre sophistiquée',
  lastModified: new Date().toISOString(),
  colors: {
    primary: '#727b81',
    secondary: '#c4c4c4',
    accent: '#93b399',
    background: '#0f0f0f',
    surface: '#161616',
    surfaceElevated: '#1e1e1e',
    text: '#e8e8e8',
    textMuted: '#9ca3af',
    border: '#3a3a3a',
    borderFocus: '#5a5a5a',
    success: '#93b399',
    warning: '#a89f91',
    error: '#8f7a7a',
    info: '#8899aa',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: 'medium',
    fontScale: 1.0,
    lineHeight: 1.5,
  },
  spacing: {
    density: 'standard',
    baseUnit: 6,
    xs: 3,
    sm: 6,
    md: 12,
    lg: 18,
    xl: 24,
  },
  borders: {
    radius: 'medium',
    radiusValue: 8,
    radiusSm: 4,
    radiusMd: 8,
    radiusLg: 12,
    width: 1,
  },
  animations: {
    enabled: true,
    speed: 'normal',
    durationMs: 200,
    durationFast: 100,
    durationNormal: 200,
    durationSlow: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  contrast: {
    level: 'normal',
    multiplier: 1.0,
  },
  shadows: {
    enabled: true,
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    focus: '0 0 0 2px rgba(147, 179, 153, 0.3)',
  },
};

// ============================================================================
// EXPORTS TYPE GUARDS
// ============================================================================

/**
 * Vérifie si un objet est un UIThemeTokens valide
 */
export function isValidUIThemeTokens(any: any): obj is UIThemeTokens {
  if (!obj || typeof obj !== 'object') return false;
  const tokens = obj as UIThemeTokens;
  return (
    typeof tokens?.version === 'string' &&
    typeof tokens?.name === 'string' &&
    typeof tokens?.colors === 'object' &&
    typeof tokens?.colors?.primary === 'string' &&
    typeof tokens?.typography === 'object' &&
    typeof tokens?.spacing === 'object' &&
    typeof tokens?.borders === 'object' &&
    typeof tokens?.animations === 'object'
  );
}

/**
 * Fusionne des tokens partiels avec les valeurs par défaut
 */
export function mergeWithDefaults(partial: Partial<UIThemeTokens>): UIThemeTokens {
  return {
    ...DEFAULT_UI_THEME_TOKENS,
    ...partial,
    colors: { ...DEFAULT_UI_THEME_TOKENS?.colors, ...partial?.colors },
    typography: { ...DEFAULT_UI_THEME_TOKENS?.typography, ...partial?.typography },
    spacing: { ...DEFAULT_UI_THEME_TOKENS?.spacing, ...partial?.spacing },
    borders: { ...DEFAULT_UI_THEME_TOKENS?.borders, ...partial?.borders },
    animations: { ...DEFAULT_UI_THEME_TOKENS?.animations, ...partial?.animations },
    contrast: { ...DEFAULT_UI_THEME_TOKENS?.contrast, ...partial?.contrast },
    shadows: { ...DEFAULT_UI_THEME_TOKENS?.shadows, ...partial?.shadows },
  };
}
