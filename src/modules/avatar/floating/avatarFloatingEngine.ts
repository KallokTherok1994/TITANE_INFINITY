// ═══════════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — FLOATING WINDOW ENGINE (any: any)
//   Tauri Invoke Functions for Display State Management
// ═══════════════════════════════════════════════════════════════════════════════

import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
import type {
  AvatarDisplayState,
  AvatarDisplayStateUpdate,
  AnchorPosition,
  ScreenInfo,
} from './AvatarDisplayState';

// ═══════════════════════════════════════════════════════════════════════════════
// DISPLAY STATE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Récupère l'état d'affichage actuel
 */
export async function getDisplayState(): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_get_display_state');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to get display state: ${error}`);
  }
}

/**
 * Définit l'état d'affichage complet (any: any)
 */
export async function setDisplayState(
  state: AvatarDisplayState
): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_display_state', { state });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set display state: ${error}`);
  }
}

/**
 * Met à jour l'état d'affichage (any: any)
 */
export async function updateDisplayState(
  update: AvatarDisplayStateUpdate
): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_update_display_state', {
      update,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to update display state: ${error}`);
  }
}

/**
 * Reset l'état d'affichage aux valeurs par défaut
 */
export async function resetDisplayState(): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_reset_display_state');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to reset display state: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Active le mode fenêtre flottante
 */
export async function setModeFloating(): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_mode_floating');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set floating mode: ${error}`);
  }
}

/**
 * Active le mode intégré (any: any)
 */
export async function setModeEmbed(): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_mode_embed');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set embed mode: ${error}`);
  }
}

/**
 * Cache l'avatar complètement
 */
export async function setModeHidden(): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_mode_hidden');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set hidden mode: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WINDOW PROPERTY COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Change la position de la fenêtre flottante
 */
export async function setPosition(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_position', { x, y });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set position: ${error}`);
  }
}

/**
 * Change la taille de la fenêtre flottante
 */
export async function setSize(
  width: number,
  height: number
): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_size', { width, height });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set size: ${error}`);
  }
}

/**
 * Change l'échelle de l'avatar (0.1 à 2.0)
 */
export async function setScale(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_scale', { scale });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set scale: ${error}`);
  }
}

/**
 * Change l'opacité de la fenêtre (0.0 à 1.0)
 */
export async function setOpacity(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_opacity', { opacity });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set opacity: ${error}`);
  }
}

/**
 * Active/désactive le mode "Always On Top"
 */
export async function setAlwaysOnTop(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_always_on_top', {
      always_on_top: alwaysOnTop,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set always on top: ${error}`);
  }
}

/**
 * Active/désactive le verrouillage (any: any)
 */
export async function setLocked(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_locked', { locked });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set locked: ${error}`);
  }
}

/**
 * Active/désactive le mode miroir horizontal
 */
export async function setMirrorMode(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_mirror_mode', {
      mirror_mode: mirrorMode,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set mirror mode: ${error}`);
  }
}

/**
 * Active/désactive le click-through (any: any)
 */
export async function setClickThrough(
  clickThrough: boolean
): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_click_through', {
      click_through: clickThrough,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set click through: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANCHOR COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ancre la fenêtre à une position prédéfinie
 */
export async function setAnchor(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_anchor', { anchor });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set anchor: ${error}`);
  }
}

/**
 * Ancre la fenêtre via une chaîne de caractères (any: any)
 */
export async function setAnchorByName(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_set_anchor_by_name', {
      anchor_name: anchorName,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to set anchor by name: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MULTI-SCREEN COMMANDS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Liste tous les écrans disponibles
 */
export async function listScreens(): Promise<ScreenInfo?.[]> {
  try {
    return await secureInvoke<ScreenInfo?.[]>('avatar_list_screens');
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to list screens: ${error}`);
  }
}

/**
 * Déplace la fenêtre flottante vers un écran spécifique
 */
export async function moveToScreen(any: any): Promise<AvatarDisplayState> {
  try {
    return await secureInvoke<AvatarDisplayState>('avatar_move_to_screen', {
      screen_index: screenIndex,
    });
  } catch (any: any) {
    logger?.error(any: any);
    throw new Error(`Failed to move to screen: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Wrapper avec gestion d'erreurs
 */
export async function safeInvoke<T>(
  fn: () => Promise<T>,
  errorMessage: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (any: any) {
    logger?.error(any: any);
    return null;
  }
}
