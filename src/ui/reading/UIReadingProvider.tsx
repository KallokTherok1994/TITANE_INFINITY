/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ UIReadingEngine v∞ — Provider
 *   Main provider: State • Shortcuts • CSS Variables • IA Control
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  UIReadingContext,
  DEFAULT_SETTINGS,
  type UIReadingSettings,
  type UIScale,
  type FontFamilyOption,
  type PresetName,
  type UIReadingCommand,
  type UIReadingContextValue,
} from './UIReadingContext';
import { ReadingPresets, isValidPreset } from './UIReadingPresets';
import {
  validateZoom,
  validateFontSize,
  validateLineHeight,
  validateLetterSpacing,
  validateMaxContentWidth,
  validateFontFamily,
  ValidZoomLevels,
} from './UIReadingValidator';
import { loadSettings, saveSettingsDebounced } from './UIReadingPersistence';

// ═══════════════════════════════════════════════════════════════════
// CSS VARIABLE APPLICATION
// ═══════════════════════════════════════════════════════════════════

function applyCSSVariables(settings: UIReadingSettings): void {
  const root = document.documentElement;

  // Zoom via transform scale
  root.style.setProperty('--ui-reading-zoom', String(settings.zoomLevel));
  root.style.setProperty('--ui-reading-font-size', `${settings.fontSizeBase}px`);
  root.style.setProperty('--ui-reading-line-height', String(settings.lineHeight));
  root.style.setProperty('--ui-reading-letter-spacing', `${settings.letterSpacing}em`);
  root.style.setProperty('--ui-reading-max-width', `${settings.maxContentWidth}px`);

  // Font family mapping
  const fontFamilyMap: Record<FontFamilyOption, string> = {
    system:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
    serif: 'Georgia, "Times New Roman", Times, serif',
    mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
  };
  root.style.setProperty('--ui-reading-font-family', fontFamilyMap[settings.fontFamily]);
}

// ═══════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface UIReadingProviderProps {
  children: React.ReactNode;
}

export function UIReadingProvider({ children }: UIReadingProviderProps): JSX.Element {
  // Load persisted settings on mount
  const [settings, setSettings] = useState<UIReadingSettings>(() => loadSettings());
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Apply CSS variables whenever settings change
  useEffect(() => {
    applyCSSVariables(settings);
    saveSettingsDebounced(settings);
  }, [settings]);

  // ═══════════════════════════════════════════════════════════════════
  // ZOOM CONTROLS
  // ═══════════════════════════════════════════════════════════════════

  const zoomIn = useCallback(() => {
    setSettings(prev => {
      const currentIndex = ValidZoomLevels.indexOf(prev.zoomLevel);
      const nextIndex = Math.min(currentIndex + 1, ValidZoomLevels.length - 1);
      return { ...prev, zoomLevel: ValidZoomLevels[nextIndex], preset: null };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setSettings(prev => {
      const currentIndex = ValidZoomLevels.indexOf(prev.zoomLevel);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return { ...prev, zoomLevel: ValidZoomLevels[nextIndex], preset: null };
    });
  }, []);

  const resetZoom = useCallback(() => {
    setSettings(prev => ({ ...prev, zoomLevel: 1.0, preset: null }));
  }, []);

  const setZoom = useCallback((level: UIScale) => {
    const result = validateZoom(level);
    if (result.valid || result.clampedValue) {
      setSettings(prev => ({
        ...prev,
        zoomLevel: (result.clampedValue ?? level) as UIScale,
        preset: null,
      }));
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // TYPOGRAPHY CONTROLS
  // ═══════════════════════════════════════════════════════════════════

  const setFontSize = useCallback((size: number) => {
    const result = validateFontSize(size);
    if (result.valid || result.clampedValue) {
      setSettings(prev => ({
        ...prev,
        fontSizeBase: result.clampedValue ?? size,
        preset: null,
      }));
    }
  }, []);

  const setFontFamily = useCallback((family: FontFamilyOption) => {
    const result = validateFontFamily(family);
    if (result.valid) {
      setSettings(prev => ({ ...prev, fontFamily: family, preset: null }));
    }
  }, []);

  const setLineHeight = useCallback((height: number) => {
    const result = validateLineHeight(height);
    if (result.valid || result.clampedValue) {
      setSettings(prev => ({
        ...prev,
        lineHeight: result.clampedValue ?? height,
        preset: null,
      }));
    }
  }, []);

  const setLetterSpacing = useCallback((spacing: number) => {
    const result = validateLetterSpacing(spacing);
    if (result.valid || result.clampedValue) {
      setSettings(prev => ({
        ...prev,
        letterSpacing: result.clampedValue ?? spacing,
        preset: null,
      }));
    }
  }, []);

  const setMaxContentWidth = useCallback((width: number) => {
    const result = validateMaxContentWidth(width);
    if (result.valid || result.clampedValue) {
      setSettings(prev => ({
        ...prev,
        maxContentWidth: result.clampedValue ?? width,
        preset: null,
      }));
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // FULLSCREEN CONTROL
  // ═══════════════════════════════════════════════════════════════════

  const toggleFullscreen = useCallback(async () => {
    try {
      // Try Tauri fullscreen first
      if (typeof window !== 'undefined' && '__TAURI__' in window) {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();
        const isCurrentlyFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isCurrentlyFullscreen);
        setSettings(prev => ({ ...prev, isFullscreen: !isCurrentlyFullscreen }));
      } else {
        // Browser fullscreen fallback
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setSettings(prev => ({ ...prev, isFullscreen: true }));
        } else {
          await document.exitFullscreen();
          setSettings(prev => ({ ...prev, isFullscreen: false }));
        }
      }
    } catch (error) {
      console.warn('[UIReading] Fullscreen toggle failed:', error);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // PRESETS
  // ═══════════════════════════════════════════════════════════════════

  const applyPreset = useCallback((preset: PresetName) => {
    if (preset === null) {
      setSettings(prev => ({ ...prev, preset: null }));
      return;
    }

    if (!isValidPreset(preset)) {
      console.warn('[UIReading] Invalid preset:', preset);
      return;
    }

    const presetSettings = ReadingPresets[preset];
    setSettings(prev => ({ ...prev, ...presetSettings, preset }));
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RESET ALL
  // ═══════════════════════════════════════════════════════════════════

  const resetAll = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // IA CONTROL API (Kevin-only, validated)
  // ═══════════════════════════════════════════════════════════════════

  const applyIACommand = useCallback(
    (command: UIReadingCommand): { success: boolean; error?: string } => {
      try {
        switch (command.action) {
          case 'preset':
            if (typeof command.value === 'string' && isValidPreset(command.value)) {
              applyPreset(command.value);
              return { success: true };
            }
            return { success: false, error: 'Invalid preset value' };

          case 'reset':
            resetAll();
            return { success: true };

          case 'set':
            if (!command.key || command.value === undefined) {
              return { success: false, error: 'Missing key or value for set action' };
            }

            // Note: IA cannot toggle fullscreen for security
            if (command.key === 'isFullscreen') {
              return { success: false, error: 'IA cannot toggle fullscreen' };
            }

            // Validate and apply specific setting
            switch (command.key) {
              case 'zoomLevel':
                setZoom(command.value as UIScale);
                return { success: true };
              case 'fontSizeBase':
                setFontSize(command.value as number);
                return { success: true };
              case 'fontFamily':
                setFontFamily(command.value as FontFamilyOption);
                return { success: true };
              case 'lineHeight':
                setLineHeight(command.value as number);
                return { success: true };
              case 'letterSpacing':
                setLetterSpacing(command.value as number);
                return { success: true };
              case 'maxContentWidth':
                setMaxContentWidth(command.value as number);
                return { success: true };
              default:
                return { success: false, error: `Unknown setting key: ${command.key}` };
            }

          default:
            return { success: false, error: `Unknown action: ${command.action}` };
        }
      } catch (error) {
        return { success: false, error: String(error) };
      }
    },
    [
      applyPreset,
      resetAll,
      setZoom,
      setFontSize,
      setFontFamily,
      setLineHeight,
      setLetterSpacing,
      setMaxContentWidth,
    ]
  );

  // ═══════════════════════════════════════════════════════════════════
  // PANEL STATE
  // ═══════════════════════════════════════════════════════════════════

  const togglePanel = useCallback(() => {
    setIsPanelOpen(prev => !prev);
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // Ctrl + Plus: Zoom In
      if (isCtrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
        return;
      }

      // Ctrl + Minus: Zoom Out
      if (isCtrl && e.key === '-') {
        e.preventDefault();
        zoomOut();
        return;
      }

      // Ctrl + 0: Reset Zoom
      if (isCtrl && e.key === '0') {
        e.preventDefault();
        resetZoom();
        return;
      }

      // F11: Toggle Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Ctrl + Shift + R: Toggle Panel
      if (isCtrl && isShift && e.key === 'R') {
        e.preventDefault();
        togglePanel();
        return;
      }

      // Ctrl + Shift + 1-4: Presets
      if (isCtrl && isShift) {
        const presetMap: Record<string, PresetName> = {
          '1': 'default',
          '2': 'focus',
          '3': 'reading',
          '4': 'immersion',
          '5': 'dev',
        };

        if (e.key in presetMap) {
          e.preventDefault();
          applyPreset(presetMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, toggleFullscreen, togglePanel, applyPreset]);

  // ═══════════════════════════════════════════════════════════════════
  // CONTEXT VALUE
  // ═══════════════════════════════════════════════════════════════════

  const contextValue: UIReadingContextValue = useMemo(
    () => ({
      settings,
      zoomIn,
      zoomOut,
      resetZoom,
      setZoom,
      setFontSize,
      setFontFamily,
      setLineHeight,
      setLetterSpacing,
      setMaxContentWidth,
      toggleFullscreen,
      applyPreset,
      resetAll,
      applyIACommand,
      isPanelOpen,
      togglePanel,
    }),
    [
      settings,
      zoomIn,
      zoomOut,
      resetZoom,
      setZoom,
      setFontSize,
      setFontFamily,
      setLineHeight,
      setLetterSpacing,
      setMaxContentWidth,
      toggleFullscreen,
      applyPreset,
      resetAll,
      applyIACommand,
      isPanelOpen,
      togglePanel,
    ]
  );

  return (
    <UIReadingContext.Provider value={contextValue}>{children}</UIReadingContext.Provider>
  );
}
