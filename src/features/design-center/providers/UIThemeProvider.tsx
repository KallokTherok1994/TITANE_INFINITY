/**
 * TITANE∞ - UIThemeProvider - Contexte React
 * Gestion des tokens UI dynamiques
 *
 * @license AGPL-3.0 - TITANE AI Project
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/lib/logger';
import {
  DEFAULT_UI_THEME_TOKENS,
  type UIThemeContext,
  type UIThemeContextState,
  type UIThemeTokens,
} from '../types/designCenter.types';

// ============================================================================
// ACTIONS
// ============================================================================

type UIThemeAction =
  | { type: 'SET_TOKENS'; tokens: UIThemeTokens }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_DIRTY'; isDirty: boolean }
  | { type: 'SET_PREVIOUS'; previousTokens: UIThemeTokens | null }
  | { type: 'UPDATE_TOKEN'; category: keyof UIThemeTokens; key: string; value: unknown }
  | {
      type: 'UPDATE_CATEGORY';
      category: keyof UIThemeTokens;
      values: Partial<UIThemeTokens[keyof UIThemeTokens]>;
    };

// ============================================================================
// REDUCER
// ============================================================================

function uiThemeReducer(
  state: UIThemeContextState,
  action: UIThemeAction
): UIThemeContextState {
  switch (action.type) {
    case 'SET_TOKENS':
      return {
        ...state,
        tokens: action.tokens || DEFAULT_UI_THEME_TOKENS,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.isDirty };
    case 'SET_PREVIOUS':
      return { ...state, previousTokens: action.previousTokens };
    case 'UPDATE_TOKEN': {
      const { category, key, value } = action;
      // Guard: vérifier que state.tokens est valide
      if (!state.tokens) {
        logger.error('tokens est null dans UPDATE_TOKEN', {
          component: 'UIThemeReducer',
        });
        return state;
      }
      if (
        category === 'version' ||
        category === 'name' ||
        category === 'description' ||
        category === 'lastModified'
      ) {
        return {
          ...state,
          tokens: { ...state.tokens, [category]: value as string },
          isDirty: true,
        };
      }
      const categoryValue = state.tokens[category];
      if (typeof categoryValue === 'object' && categoryValue !== null) {
        return {
          ...state,
          tokens: {
            ...state.tokens,
            [category]: {
              ...categoryValue,
              [key]: value,
            },
          },
          isDirty: true,
        };
      }
      return state;
    }
    case 'UPDATE_CATEGORY': {
      const { category, values } = action;
      // Guard: vérifier que state.tokens est valide
      if (!state.tokens) {
        logger.error('tokens est null dans UPDATE_CATEGORY', {
          component: 'UIThemeReducer',
        });
        return state;
      }
      const currentValue = state.tokens[category];
      if (typeof currentValue === 'object' && currentValue !== null) {
        return {
          ...state,
          tokens: {
            ...state.tokens,
            [category]: Object.assign({}, currentValue, values),
          },
          isDirty: true,
        };
      }
      return state;
    }
    default:
      return state;
  }
}

// ============================================================================
// CONTEXTE
// ============================================================================

const UIThemeContextInstance = createContext<UIThemeContext | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface UIThemeProviderProps {
  children: React.ReactNode;
}

export function UIThemeProvider({ children }: UIThemeProviderProps) {
  const [state, dispatch] = useReducer(uiThemeReducer, {
    tokens: DEFAULT_UI_THEME_TOKENS,
    isLoading: true,
    error: null,
    isDirty: false,
    previousTokens: null,
  });

  // ────────────────────────────────────────────────────────────
  // Charger les tokens au démarrage
  // ────────────────────────────────────────────────────────────
  const loadTokens = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const tokens = await secureInvoke<UIThemeTokens | null>('load_ui_theme');

      // Si le backend retourne null, utiliser les valeurs par défaut
      if (!tokens) {
        logger.warn('Aucun thème chargé, utilisation des valeurs par défaut');
        dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
      } else {
        dispatch({ type: 'SET_TOKENS', tokens });
      }

      dispatch({ type: 'SET_DIRTY', isDirty: false });
    } catch (err) {
      logger.error(
        'Erreur chargement tokens:',
        { module: 'UIThemeProvider' },
        err instanceof Error ? err : new Error(String(err))
      );
      dispatch({ type: 'SET_ERROR', error: String(err) });
      // Utiliser les valeurs par défaut
      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // ────────────────────────────────────────────────────────────
  // Appliquer les tokens au DOM
  // ────────────────────────────────────────────────────────────
  const applyTokensToDOM = useCallback(() => {
    const { tokens } = state;

    // Guard: vérifier que tokens est défini et valide
    if (!tokens || !tokens.colors || !tokens.typography || !tokens.spacing) {
      logger.warn('Tokens invalides ou non chargés');
      return;
    }

    const root = document.documentElement;

    // Colors
    root.style.setProperty('--color-primary', tokens.colors.primary);
    root.style.setProperty('--color-secondary', tokens.colors.secondary);
    root.style.setProperty('--color-accent', tokens.colors.accent);
    root.style.setProperty('--color-background', tokens.colors.background);
    root.style.setProperty('--color-surface', tokens.colors.surface);
    root.style.setProperty('--color-surface-elevated', tokens.colors.surfaceElevated);
    root.style.setProperty('--color-text', tokens.colors.text);
    root.style.setProperty('--color-text-muted', tokens.colors.textMuted);
    root.style.setProperty('--color-border', tokens.colors.border);
    root.style.setProperty('--color-border-focus', tokens.colors.borderFocus);
    root.style.setProperty('--color-success', tokens.colors.success);
    root.style.setProperty('--color-warning', tokens.colors.warning);
    root.style.setProperty('--color-error', tokens.colors.error);
    root.style.setProperty('--color-info', tokens.colors.info);

    // Typography
    root.style.setProperty('--font-family', tokens.typography.fontFamily);
    root.style.setProperty('--font-family-mono', tokens.typography.fontFamilyMono);
    root.style.setProperty('--font-scale', String(tokens.typography.fontScale));
    root.style.setProperty('--line-height', String(tokens.typography.lineHeight));

    // Spacing
    root.style.setProperty('--spacing-xs', `${tokens.spacing.xs}px`);
    root.style.setProperty('--spacing-sm', `${tokens.spacing.sm}px`);
    root.style.setProperty('--spacing-md', `${tokens.spacing.md}px`);
    root.style.setProperty('--spacing-lg', `${tokens.spacing.lg}px`);
    root.style.setProperty('--spacing-xl', `${tokens.spacing.xl}px`);

    // Borders
    root.style.setProperty('--radius-sm', `${tokens.borders.radiusSm}px`);
    root.style.setProperty('--radius-md', `${tokens.borders.radiusMd}px`);
    root.style.setProperty('--radius-lg', `${tokens.borders.radiusLg}px`);
    root.style.setProperty('--border-width', `${tokens.borders.width}px`);

    // Animations
    root.style.setProperty('--duration-fast', `${tokens.animations.durationFast}ms`);
    root.style.setProperty('--duration-normal', `${tokens.animations.durationNormal}ms`);
    root.style.setProperty('--duration-slow', `${tokens.animations.durationSlow}ms`);
    root.style.setProperty('--easing', tokens.animations.easing);

    // Shadows
    if (tokens.shadows.enabled) {
      root.style.setProperty('--shadow-sm', tokens.shadows.sm);
      root.style.setProperty('--shadow-md', tokens.shadows.md);
      root.style.setProperty('--shadow-lg', tokens.shadows.lg);
      root.style.setProperty('--shadow-focus', tokens.shadows.focus);
    } else {
      root.style.setProperty('--shadow-sm', 'none');
      root.style.setProperty('--shadow-md', 'none');
      root.style.setProperty('--shadow-lg', 'none');
      root.style.setProperty('--shadow-focus', 'none');
    }

    // Contrast mode
    if (tokens.contrast.level === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Animations disabled
    if (!tokens.animations.enabled) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    logger.debug('Tokens appliqués au DOM', { component: 'UIThemeProvider' });
  }, [state]); // Fixed deps: include state

  // Appliquer automatiquement quand les tokens changent
  useEffect(() => {
    if (!state.isLoading) {
      applyTokensToDOM();
    }
  }, [state.tokens, state.isLoading, applyTokensToDOM]);

  // ────────────────────────────────────────────────────────────
  // Actions du contexte
  // ────────────────────────────────────────────────────────────
  const updateToken = useCallback(
    <K extends keyof UIThemeTokens>(
      category: K,
      key: keyof UIThemeTokens[K],
      value: UIThemeTokens[K][keyof UIThemeTokens[K]]
    ) => {
      // Guard: vérifier que tokens est valide
      if (!state.tokens) {
        logger.warn('Impossible de mettre à jour: tokens non définis');
        return;
      }
      // Sauvegarder l'état précédent pour undo
      if (!state.isDirty) {
        dispatch({ type: 'SET_PREVIOUS', previousTokens: state.tokens });
      }
      dispatch({ type: 'UPDATE_TOKEN', category, key: String(key), value });
    },
    [state.isDirty, state.tokens]
  );

  const updateCategory = useCallback(
    <K extends keyof UIThemeTokens>(category: K, values: Partial<UIThemeTokens[K]>) => {
      // Guard: vérifier que tokens est valide
      if (!state.tokens) {
        logger.warn('Impossible de mettre à jour: tokens non définis');
        return;
      }
      if (!state.isDirty) {
        dispatch({ type: 'SET_PREVIOUS', previousTokens: state.tokens });
      }
      dispatch({ type: 'UPDATE_CATEGORY', category, values });
    },
    [state.isDirty, state.tokens]
  );

  const saveTokens = useCallback(async () => {
    // Guard: vérifier que tokens est valide
    if (!state.tokens) {
      logger.error('Impossible de sauvegarder: tokens non définis', {
        component: 'UIThemeProvider',
        action: 'saveTokens',
      });
      return;
    }
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      await secureInvoke('save_ui_theme', { tokens: state.tokens });
      dispatch({ type: 'SET_DIRTY', isDirty: false });
      dispatch({ type: 'SET_PREVIOUS', previousTokens: null });
      dispatch({ type: 'SET_LOADING', isLoading: false });
      logger.info('Tokens sauvegardés', { component: 'UIThemeProvider' });
    } catch (err) {
      logger.error(
        'Erreur sauvegarde',
        { component: 'UIThemeProvider', action: 'saveTokens' },
        err as Error
      );
      dispatch({ type: 'SET_ERROR', error: String(err) });
    }
  }, [state.tokens]);

  const reloadTokens = useCallback(async () => {
    await loadTokens();
  }, [loadTokens]);

  const resetToDefaults = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const tokens = await secureInvoke<UIThemeTokens | null>('reset_ui_theme');

      // Si le backend retourne null, utiliser les valeurs par défaut
      if (!tokens) {
        logger.warn('Reset retourné null, utilisation des valeurs par défaut');
        dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
      } else {
        dispatch({ type: 'SET_TOKENS', tokens });
      }

      dispatch({ type: 'SET_DIRTY', isDirty: false });
      dispatch({ type: 'SET_PREVIOUS', previousTokens: null });
      logger.debug('Tokens réinitialisés');
    } catch (err) {
      logger.error(
        'Erreur reset:',
        { module: 'UIThemeProvider' },
        err instanceof Error ? err : new Error(String(err))
      );
      dispatch({ type: 'SET_ERROR', error: String(err) });
      // En cas d'erreur, utiliser les valeurs par défaut
      dispatch({ type: 'SET_TOKENS', tokens: DEFAULT_UI_THEME_TOKENS });
    }
  }, []);

  const undoChanges = useCallback(() => {
    if (state.previousTokens) {
      dispatch({ type: 'SET_TOKENS', tokens: state.previousTokens });
      dispatch({ type: 'SET_DIRTY', isDirty: false });
      dispatch({ type: 'SET_PREVIOUS', previousTokens: null });
    }
  }, [state.previousTokens]);

  // ────────────────────────────────────────────────────────────
  // Valeur du contexte
  // ────────────────────────────────────────────────────────────
  const contextValue = useMemo<UIThemeContext>(
    () => ({
      ...state,
      updateToken,
      updateCategory,
      saveTokens,
      reloadTokens,
      resetToDefaults,
      undoChanges,
      applyTokensToDOM,
    }),
    [
      state,
      updateToken,
      updateCategory,
      saveTokens,
      reloadTokens,
      resetToDefaults,
      undoChanges,
      applyTokensToDOM,
    ]
  );

  return (
    <UIThemeContextInstance.Provider value={contextValue}>
      {children}
    </UIThemeContextInstance.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useUITheme(): UIThemeContext {
  const context = useContext(UIThemeContextInstance);
  if (!context) {
    throw new Error('useUITheme doit être utilisé dans un UIThemeProvider');
  }
  return context;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

// Export par défaut pour compatibilité et Fast Refresh
export default UIThemeProvider;
