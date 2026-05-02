/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ — MODES CHAT IA — BARREL + UTILITAIRES
 *   Public API entry point. Consumers import from this file (path unchanged).
 *   V33 split: types → chatModes.types.ts | data → chatModes.data.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Re-export all types and presets
export type {
  ChatModeId,
  ChatModeCategory,
  PermissionLevel,
  MemoryScope,
  ResponseStyle,
  CommunicationTone,
  PreferredProvider,
  ToolPermissions,
  ChatModeConfigExtended,
} from './chatModes.types';

export { TOOLS_MINIMAL, TOOLS_STANDARD, TOOLS_DEV, TOOLS_ADMIN } from './chatModes.types';

// Re-export data
export { CHAT_MODES_CONFIG } from './chatModes.data';

// Local imports for utilities
import type {
  ChatModeId,
  ChatModeCategory,
  ToolPermissions,
  ChatModeConfigExtended,
  PermissionLevel,
} from './chatModes.types';
import { CHAT_MODES_CONFIG } from './chatModes.data';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Liste des IDs de modes actifs */
export const ACTIVE_MODE_IDS: ChatModeId[] = Object.values(CHAT_MODES_CONFIG)
  .filter(mode => mode.enabled)
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map(mode => mode.id);

/** Modes par catégorie */
export const MODES_BY_CATEGORY: Record<ChatModeCategory, ChatModeId[]> = {
  general: ['default', 'quick', 'standard', 'emergency'],
  creative: ['brainstorming', 'synthesis', 'creation', 'kalloks_arts'],
  productivity: ['planning', 'htf_soumission', 'veille_recherche'],
  personal: [
    'journal',
    'debug_cognitive',
    'coach',
    'psychologie_profils',
    'reflection',
    'humain_total',
  ],
  technical: ['dev', 'admin', 'audit', 'omega'],
  strategic: ['strategy', 'decision'],
};

/** Récupère la config d'un mode (avec fallback sur default) */
export function getModeConfig(modeId: ChatModeId | string): ChatModeConfigExtended {
  return CHAT_MODES_CONFIG[modeId as ChatModeId] ?? CHAT_MODES_CONFIG.default;
}

/** Vérifie si un mode est autorisé pour un niveau de permission */
export function isModeAllowed(
  modeId: ChatModeId,
  userPermissionLevel: PermissionLevel
): boolean {
  const config = getModeConfig(modeId);
  return config.enabled && userPermissionLevel >= config.permissionLevel;
}

/** Filtre les modes accessibles selon permission */
export function getAccessibleModes(
  userPermissionLevel: PermissionLevel
): ChatModeConfigExtended[] {
  return Object.values(CHAT_MODES_CONFIG)
    .filter(mode => mode.enabled && userPermissionLevel >= mode.permissionLevel)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Vérifie si un outil est autorisé pour un mode */
export function isToolAllowed(
  modeId: ChatModeId,
  toolName: keyof ToolPermissions
): boolean {
  const config = getModeConfig(modeId);
  return config.toolsAllowed[toolName] ?? false;
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION (Simple, sans dépendance externe)
// ─────────────────────────────────────────────────────────────────────────────

/** Valide un ID de mode */
export function validateModeId(modeId: unknown): modeId is ChatModeId {
  if (typeof modeId !== 'string') return false;
  return Object.keys(CHAT_MODES_CONFIG).includes(modeId);
}

/** Valide une config de mode complète */
export function validateModeConfig(config: unknown): config is ChatModeConfigExtended {
  if (!config || typeof config !== 'object') return false;
  const c = config as Partial<ChatModeConfigExtended>;

  return (
    typeof c.id === 'string' &&
    typeof c.label === 'string' &&
    typeof c.description === 'string' &&
    typeof c.systemPrompt === 'string' &&
    typeof c.temperature === 'number' &&
    c.temperature >= 0 &&
    c.temperature <= 1 &&
    typeof c.permissionLevel === 'number' &&
    c.permissionLevel >= 0 &&
    c.permissionLevel <= 5
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT COMPATIBLE AVEC chatModes.ts EXISTANT
// ─────────────────────────────────────────────────────────────────────────────

/** Conversion vers format legacy ChatModeConfig */
export function toLegacyModeConfig(extended: ChatModeConfigExtended): {
  name: string;
  description: string;
  systemPrompt: string;
  profileId?: string;
  temperature: number;
  suggestedActions: string[];
  icon: string;
} {
  return {
    name: extended.label,
    description: extended.description,
    systemPrompt: extended.systemPrompt,
    profileId: extended.profileId,
    temperature: extended.temperature,
    suggestedActions: extended.suggestedActions,
    icon: extended.icon,
  };
}

/** Export des modes en format legacy pour compatibilité */
export const chatModesLegacy: Record<
  string,
  ReturnType<typeof toLegacyModeConfig>
> = Object.fromEntries(
  Object.entries(CHAT_MODES_CONFIG).map(([id, config]) => [
    id,
    toLegacyModeConfig(config),
  ])
);

export default CHAT_MODES_CONFIG;
