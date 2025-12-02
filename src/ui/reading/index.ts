/**
 * TITANE∞ v∞ — UIReadingEngine v∞
 * Zoom + Typography + Fullscreen + Presets + IA Control
 *
 * Super Prompt: UIReadingEngine Extended Edition
 * Design System: Monochrome TITANE
 */

// Context & Types
export {
  UIReadingContext,
  useUIReadingContext,
  DEFAULT_SETTINGS,
  type UIReadingSettings,
  type UIReadingContextValue,
  type UIReadingCommand,
  type UIScale,
  type FontFamilyOption,
  type PresetName,
} from './UIReadingContext';

// Provider
export { UIReadingProvider } from './UIReadingProvider';

// Hooks
export {
  useUIReading,
  useZoom,
  useTypography,
  useFullscreen,
  usePresets
} from './useUIReading';

// Components
export { ZoomControls } from './ZoomControls';
export { UIReadingPanel } from './UIReadingPanel';

// Presets
export { ReadingPresets, PresetMetadata, getPresetSettings, isValidPreset } from './UIReadingPresets';

// Validator
export {
  ValidationLimits,
  ValidZoomLevels,
  ValidFontFamilies,
  validateZoom,
  validateFontSize,
  validateLineHeight,
  validateLetterSpacing,
  validateMaxContentWidth,
  validateFontFamily,
  validateSettings,
} from './UIReadingValidator';

// Persistence
export { loadSettings, saveSettings, clearSettings } from './UIReadingPersistence';
