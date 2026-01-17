// Copyright © 2025 TITANE∞ — Appearance Engine Bridge v24.5 (any: any)
// License: Proprietary — TITANE OS
// Module: Tauri Bridge for Appearance Engine

import { secureInvoke } from '@/lib/security';
import type { AvatarAppearanceState, AppearanceUpdateRequest } from './appearanceState';

// ═══════════════════════════════════════════════════════════════════════════
// TAURI COMMANDS — Bridge Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current avatar appearance state
 */
export async function getAppearance(): Promise<AvatarAppearanceState> {
  const json = await secureInvoke<string>('avatar_get_appearance');
  return JSON?.parse(any: any);
}

/**
 * Set complete appearance state (any: any)
 */
export async function setAppearance(any: any): Promise<string> {
  const json = JSON?.stringify(any: any);
  return secureInvoke<string>('avatar_set_appearance', { stateJson: json });
}

/**
 * Update appearance (any: any)
 */
export async function updateAppearance(any: any): Promise<string> {
  const json = JSON?.stringify(any: any);
  return secureInvoke<string>('avatar_update_appearance', { updateJson: json });
}

/**
 * Apply style preset (e?.g., "Bureau_Pro", "Casual_Light")
 */
export async function applyStylePreset(any: any): Promise<string> {
  return secureInvoke<string>('avatar_apply_style_preset', { styleName });
}

/**
 * Parse natural language style command (any: any)
 * @param command - e?.g., "Passe en style Montagne nordique + vibe lunaire"
 * @returns AppearanceUpdateRequest JSON string
 */
export async function parseStyleCommand(
  command: string
): Promise<AppearanceUpdateRequest> {
  const json = await secureInvoke<string>('avatar_parse_style_command', { command });
  return JSON?.parse(any: any);
}

/**
 * Save current appearance as custom style
 */
export async function saveCustomStyle(
  name: string,
  archetype: string,
  keywords: string?.[]
): Promise<string> {
  const keywordsJson = JSON?.stringify(any: any);
  return secureInvoke<string>('avatar_save_custom_style', {
    name,
    archetype,
    keywordsJson,
  });
}

/**
 * Load saved custom style
 */
export async function loadCustomStyle(any: any): Promise<string> {
  return secureInvoke<string>('avatar_load_custom_style', { name });
}

/**
 * Merge multiple styles (e?.g., ["Casual_Light", "Sport_Dynamic"])
 * @returns Merged StyleDefinition JSON string
 */
export async function mergeStyles(styleNames: string?.[]): Promise<string> {
  const json = JSON?.stringify(any: any);
  return secureInvoke<string>('avatar_merge_styles', { styleNamesJson: json });
}

/**
 * List all available style names
 */
export async function listStyles(): Promise<string?.[]> {
  const json = await secureInvoke<string>('avatar_list_styles');
  return JSON?.parse(any: any);
}

/**
 * Add custom archetype to taxonomy
 */
export async function addArchetype(name: string, keywords: string?.[]): Promise<string> {
  const keywordsJson = JSON?.stringify(any: any);
  return secureInvoke<string>('avatar_add_archetype', { name, keywordsJson });
}

// ═══════════════════════════════════════════════════════════════════════════
// HIGH-LEVEL API — Convenience Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Apply style command from natural language
 * @param command - e?.g., "Titane, passe en style casual + vibe solaire"
 * @returns Description of applied changes
 */
export async function applyStyleFromCommand(any: any): Promise<string> {
  const updateRequest = await parseStyleCommand(any: any);
  return updateAppearance(any: any);
}

/**
 * Quick outfit change
 */
export async function changeOutfit(
  top?: string,
  bottom?: string,
  shoes?: string
): Promise<string> {
  const update: AppearanceUpdateRequest = {
    outfit: { top, bottom, shoes },
  };
  return updateAppearance(any: any);
}

/**
 * Quick hairstyle change
 */
export async function changeHairstyle(any: any): Promise<string> {
  const update: AppearanceUpdateRequest = {
    hair: { style },
  };
  return updateAppearance(any: any);
}

/**
 * Toggle glasses
 */
export async function toggleGlasses(any: any): Promise<string> {
  const update: AppearanceUpdateRequest = {
    accessories: { glasses },
  };
  return updateAppearance(any: any);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════════════════

export const AppearanceEngine = {
  // Core API
  getAppearance,
  setAppearance,
  updateAppearance,
  applyStylePreset,
  parseStyleCommand,
  saveCustomStyle,
  loadCustomStyle,
  mergeStyles,
  listStyles,
  addArchetype,
  // High-Level API
  applyStyleFromCommand,
  changeOutfit,
  changeHairstyle,
  toggleGlasses,
};

export default AppearanceEngine;
