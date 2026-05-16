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
import { tauriClient } from '@/lib/tauriClient';
import { logger } from '@/lib/logger';
import { isTauriRuntimeAvailable } from '@/utils/tauriProtector';
import {
  DEFAULT_UI_THEME_TOKENS,
  type UIThemeContext,
  type UIThemeContextState,
  type UIThemeTokens,
} from '../types/designCenter.types';
import {
  ensureReadableTextColor,
  ensureReadableTextColorForBackgrounds,
} from '../utils/contrast';

// ============================================================================
// ACTIONS
// ============================================================================

type UIThemeAction =
  | {
      type: 'SET_TOKENS';
      tokens: UIThemeTokens;
      source: 'runtime' | 'fallback-local';
    }
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
        tokenSource: action.source,
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

const UI_THEME_IPC_TIMEOUT_MS = 12000;

function withIpcTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  operationName: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    operation.then(
      value => {
        clearTimeout(timer);
        resolve(value);
      },
      error => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

const STORAGE_KEY_COLOR_MODE = 'titane-color-mode';

function getInitialColorMode(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_COLOR_MODE);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage unavailable
  }
  // Respect system preference
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: light)').matches
  ) {
    return 'light';
  }
  return 'dark';
}

export function UIThemeProvider({ children }: UIThemeProviderProps) {
  const [colorMode, setColorModeState] = React.useState<'dark' | 'light'>(
    getInitialColorMode
  );

  const [state, dispatch] = useReducer(uiThemeReducer, {
    tokens: DEFAULT_UI_THEME_TOKENS,
    isLoading: true,
    error: null,
    isDirty: false,
    previousTokens: null,
    tokenSource: 'fallback-local' as const,
  });

  // ────────────────────────────────────────────────────────────
  // Charger les tokens au démarrage
  // ────────────────────────────────────────────────────────────
  const loadTokens = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    if (!isTauriRuntimeAvailable()) {
      dispatch({
        type: 'SET_TOKENS',
        tokens: DEFAULT_UI_THEME_TOKENS,
        source: 'fallback-local',
      });
      dispatch({ type: 'SET_DIRTY', isDirty: false });
      return;
    }
    try {
      const tokens = (await withIpcTimeout(
        tauriClient.loadUiTheme() as Promise<UIThemeTokens | null>,
        UI_THEME_IPC_TIMEOUT_MS,
        'load_ui_theme'
      )) as UIThemeTokens | null;

      // Si le backend retourne null, utiliser les valeurs par défaut
      if (!tokens) {
        console.warn(
          '[UIThemeProvider] Aucun thème chargé, utilisation des valeurs par défaut'
        );
        dispatch({
          type: 'SET_TOKENS',
          tokens: DEFAULT_UI_THEME_TOKENS,
          source: 'fallback-local',
        });
      } else {
        dispatch({ type: 'SET_TOKENS', tokens, source: 'runtime' });
      }

      dispatch({ type: 'SET_DIRTY', isDirty: false });
    } catch (err) {
      console.error('[UIThemeProvider] Erreur chargement tokens:', err);
      // Utiliser les valeurs par défaut
      dispatch({
        type: 'SET_TOKENS',
        tokens: DEFAULT_UI_THEME_TOKENS,
        source: 'fallback-local',
      });
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  // ────────────────────────────────────────────────────────────
  // Color mode toggle (dark / light)
  // ────────────────────────────────────────────────────────────
  const setColorMode = useCallback((mode: 'dark' | 'light') => {
    setColorModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY_COLOR_MODE, mode);
    } catch {
      // ignore
    }
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  // Apply/remove .light class on html element whenever colorMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (colorMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [colorMode]);

  // ────────────────────────────────────────────────────────────
  // Appliquer les tokens au DOM
  // ────────────────────────────────────────────────────────────
  const applyTokensToDOM = useCallback(() => {
    const { tokens } = state;

    // Guard: vérifier que tokens est défini et valide
    if (!tokens || !tokens.colors || !tokens.typography || !tokens.spacing) {
      console.warn('[UIThemeProvider] Tokens invalides ou non chargés');
      return;
    }

    const root = document.documentElement;
    const minContrast = tokens.contrast.level === 'high' ? 7 : 4.5;

    const readableText = ensureReadableTextColorForBackgrounds(
      tokens.colors.text,
      [tokens.colors.background, tokens.colors.surface, tokens.colors.surfaceElevated],
      minContrast
    );
    const readableTextMuted = ensureReadableTextColorForBackgrounds(
      tokens.colors.textMuted,
      [tokens.colors.background, tokens.colors.surface, tokens.colors.surfaceElevated],
      minContrast
    );
    const textOnPrimary = ensureReadableTextColor(
      tokens.colors.text,
      tokens.colors.primary,
      minContrast
    );
    const textOnSecondary = ensureReadableTextColor(
      tokens.colors.text,
      tokens.colors.secondary,
      minContrast
    );
    const textOnAccent = ensureReadableTextColor(
      tokens.colors.text,
      tokens.colors.accent,
      minContrast
    );
    const textOnSurface = ensureReadableTextColor(
      tokens.colors.text,
      tokens.colors.surface,
      minContrast
    );
    const textOnSurfaceElevated = ensureReadableTextColor(
      tokens.colors.text,
      tokens.colors.surfaceElevated,
      minContrast
    );

    // Colors
    root.style.setProperty('--color-primary', tokens.colors.primary);
    root.style.setProperty('--color-secondary', tokens.colors.secondary);
    root.style.setProperty('--color-accent', tokens.colors.accent);
    root.style.setProperty('--color-background', tokens.colors.background);
    root.style.setProperty('--color-surface', tokens.colors.surface);
    root.style.setProperty('--color-surface-elevated', tokens.colors.surfaceElevated);
    root.style.setProperty('--color-text', readableText);
    root.style.setProperty('--color-text-muted', readableTextMuted);
    root.style.setProperty('--color-text-on-primary', textOnPrimary);
    root.style.setProperty('--color-text-on-secondary', textOnSecondary);
    root.style.setProperty('--color-text-on-accent', textOnAccent);
    root.style.setProperty('--color-text-on-surface', textOnSurface);
    root.style.setProperty('--color-text-on-surface-elevated', textOnSurfaceElevated);
    root.style.setProperty('--color-border', tokens.colors.border);
    root.style.setProperty('--color-border-focus', tokens.colors.borderFocus);
    root.style.setProperty('--color-success', tokens.colors.success);
    root.style.setProperty('--color-warning', tokens.colors.warning);
    root.style.setProperty('--color-error', tokens.colors.error);
    root.style.setProperty('--color-info', tokens.colors.info);

    // Canonical token aliases consumed across legacy and modern UI surfaces.
    root.style.setProperty('--background', tokens.colors.background);
    root.style.setProperty('--surface', tokens.colors.surface);
    root.style.setProperty('--surface-elevated', tokens.colors.surfaceElevated);
    root.style.setProperty('--text-primary', readableText);
    root.style.setProperty('--text-muted', readableTextMuted);
    root.style.setProperty('--border', tokens.colors.border);
    root.style.setProperty('--border-focus', tokens.colors.borderFocus);
    root.style.setProperty('--bg-primary', tokens.colors.background);
    root.style.setProperty('--bg-secondary', tokens.colors.surface);

    // Legacy aliases used by existing shell pages (admin/system/etc.).
    root.style.setProperty('--color-bg-primary', tokens.colors.background);
    root.style.setProperty('--color-bg-secondary', tokens.colors.surface);
    root.style.setProperty('--color-bg-tertiary', tokens.colors.surfaceElevated);
    root.style.setProperty('--color-bg-elevated', tokens.colors.surfaceElevated);
    root.style.setProperty('--color-text-primary', readableText);
    root.style.setProperty('--color-text-secondary', readableTextMuted);
    root.style.setProperty('--color-text-muted', readableTextMuted);
    root.style.setProperty('--color-border-default', tokens.colors.border);
    root.style.setProperty('--color-border-primary', tokens.colors.border);
    root.style.setProperty('--color-border-secondary', tokens.colors.borderFocus);
    root.style.setProperty('--color-border-subtle', tokens.colors.border);

    // Typography
    root.style.setProperty('--font-family', tokens.typography.fontFamily);
    root.style.setProperty('--font-family-mono', tokens.typography.fontFamilyMono);
    root.style.setProperty('--font-sans', tokens.typography.fontFamily);
    root.style.setProperty('--font-mono', tokens.typography.fontFamilyMono);
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

    // Admin shell-specific variables to keep runtime effect visible in ADMIN context.
    root.style.setProperty('--admin-bg-start', tokens.colors.background);
    root.style.setProperty('--admin-bg-end', tokens.colors.surface);
    root.style.setProperty('--admin-header-bg-start', tokens.colors.surfaceElevated);
    root.style.setProperty('--admin-header-bg-end', tokens.colors.background);
    root.style.setProperty('--admin-cyan', tokens.colors.accent);
    root.style.setProperty('--admin-gold-start', tokens.colors.secondary);
    root.style.setProperty('--admin-gold-end', tokens.colors.accent);

    // Unified token grammar variables used by tabs and badges across surfaces.
    root.style.setProperty('--badge-accent-bg', `${tokens.colors.accent}22`);
    root.style.setProperty('--badge-accent-border', `${tokens.colors.accent}55`);
    root.style.setProperty('--badge-accent-color', tokens.colors.accent);
    root.style.setProperty('--tab-active-border', `${tokens.colors.accent}66`);
    root.style.setProperty('--tab-active-color', tokens.colors.text);
    root.style.setProperty(
      '--tab-active-bg',
      `linear-gradient(135deg, ${tokens.colors.accent}2A 0%, ${tokens.colors.primary}1F 100%)`
    );

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

    // Light mode inline overrides — applied after token application so they take priority
    if (colorMode === 'light') {
      root.style.setProperty('--color-bg-primary', '#ffffff');
      root.style.setProperty('--color-bg-secondary', '#f8fafc');
      root.style.setProperty('--color-bg-tertiary', '#f1f5f9');
      root.style.setProperty('--color-bg-elevated', '#e2e8f0');
      root.style.setProperty('--color-bg-overlay', '#cbd5e1');
      root.style.setProperty('--color-text-primary', '#0f172a');
      root.style.setProperty('--color-text-secondary', '#334155');
      root.style.setProperty('--color-text-muted', '#64748b');
      root.style.setProperty('--color-text-disabled', '#94a3b8');
      root.style.setProperty('--color-border-default', '#e2e8f0');
      root.style.setProperty('--color-border-subtle', '#f1f5f9');
      root.style.setProperty('--color-border-strong', '#cbd5e1');
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-surface', '#f8fafc');
      root.style.setProperty('--color-surface-elevated', '#e2e8f0');
      root.style.setProperty('--color-text', '#0f172a');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--surface', '#f8fafc');
      root.style.setProperty('--surface-elevated', '#e2e8f0');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-card', 'rgba(255,255,255,0.9)');
      root.style.setProperty('--bg-panel', 'rgba(255,255,255,0.98)');
      root.style.setProperty('--bg-input', 'rgba(255,255,255,0.95)');
      root.style.setProperty('--bg-hover', 'rgba(226,232,240,0.7)');
      root.style.setProperty('--admin-bg-start', '#f8fafc');
      root.style.setProperty('--admin-bg-end', '#f1f5f9');
    }

    logger.debug('Tokens appliqués au DOM', { component: 'UIThemeProvider' });
  }, [state, colorMode]);

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
        console.warn('[UIThemeProvider] Impossible de mettre à jour: tokens non définis');
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
        console.warn('[UIThemeProvider] Impossible de mettre à jour: tokens non définis');
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
      await withIpcTimeout(
        tauriClient.saveUiTheme({ tokens: state.tokens }),
        UI_THEME_IPC_TIMEOUT_MS,
        'save_ui_theme'
      );
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
      const tokens = (await withIpcTimeout(
        tauriClient.resetUiTheme() as Promise<UIThemeTokens | null>,
        UI_THEME_IPC_TIMEOUT_MS,
        'reset_ui_theme'
      )) as UIThemeTokens | null;

      // Si le backend retourne null, utiliser les valeurs par défaut
      if (!tokens) {
        console.warn(
          '[UIThemeProvider] Reset retourné null, utilisation des valeurs par défaut'
        );
        dispatch({
          type: 'SET_TOKENS',
          tokens: DEFAULT_UI_THEME_TOKENS,
          source: 'fallback-local',
        });
      } else {
        dispatch({ type: 'SET_TOKENS', tokens, source: 'runtime' });
      }

      dispatch({ type: 'SET_DIRTY', isDirty: false });
      dispatch({ type: 'SET_PREVIOUS', previousTokens: null });
      console.warn('[UIThemeProvider] Tokens réinitialisés');
    } catch (err) {
      console.error('[UIThemeProvider] Erreur reset:', err);
      // En cas d'erreur, utiliser les valeurs par défaut
      dispatch({
        type: 'SET_TOKENS',
        tokens: DEFAULT_UI_THEME_TOKENS,
        source: 'fallback-local',
      });
    }
  }, []);

  const undoChanges = useCallback(() => {
    if (state.previousTokens) {
      dispatch({
        type: 'SET_TOKENS',
        tokens: state.previousTokens,
        source: state.tokenSource,
      });
      dispatch({ type: 'SET_DIRTY', isDirty: false });
      dispatch({ type: 'SET_PREVIOUS', previousTokens: null });
    }
  }, [state.previousTokens, state.tokenSource]);

  // ────────────────────────────────────────────────────────────
  // Valeur du contexte
  // ────────────────────────────────────────────────────────────
  const contextValue = useMemo<UIThemeContext>(
    () => ({
      ...state,
      colorMode,
      toggleColorMode,
      setColorMode,
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
      colorMode,
      toggleColorMode,
      setColorMode,
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

export function useUIThemeOptional(): UIThemeContext | null {
  return useContext(UIThemeContextInstance);
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

// Export par défaut pour compatibilité et Fast Refresh
export default UIThemeProvider;
