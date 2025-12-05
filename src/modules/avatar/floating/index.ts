// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — FLOATING AVATAR WINDOW MODULE
//   Centralized Exports
// ═══════════════════════════════════════════════════════════════════════════════

// Types & State
export type {
  AvatarDisplayState,
  AvatarDisplayStateUpdate,
  ScreenInfo,
} from './AvatarDisplayState';

export {
  AvatarDisplayMode,
  AnchorPosition,
  DEFAULT_DISPLAY_STATE,
  parseAnchorPosition,
  calculateAnchoredPosition,
  validateDisplayState,
} from './AvatarDisplayState';

// Tauri Engine Functions
export * as FloatingEngine from './avatarFloatingEngine';

// React Hook
export {
  useFloatingWindow,
  type UseFloatingWindowResult,
} from './useFloatingWindow';

// React Components
export { AvatarFloatingWindow } from './AvatarFloatingWindow';
export { default as AvatarFloatingPopup } from './AvatarFloatingPopup';

// Three.js Renderer (NEW v24.12)
export { ThreeJSAvatarRenderer } from './ThreeJSAvatarRenderer';
export type { ThreeJSAvatarRendererOptions, AvatarMeshes } from './ThreeJSAvatarRenderer';

// Appearance Integration (NEW v24.12)
export { AppearanceFloatingIntegration } from './appearanceFloatingIntegration';
export type { AppearanceMaterialMap, ColorPalette } from './appearanceFloatingIntegration';

// Chat Integration (NEW v24.12)
export { handleFloatingWindowInChat, containsFloatingWindowKeyword } from '../chatFloatingIntegration';
export type { ChatFloatingIntegrationResult, FloatingWindowCommand } from '../chatFloatingIntegration';
