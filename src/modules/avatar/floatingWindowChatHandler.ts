// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — FLOATING WINDOW CHAT HANDLER
//   NLP Command Parser for Avatar Floating Window Control
// ═══════════════════════════════════════════════════════════════════════════

import type { AnchorPosition } from './floating/AvatarDisplayState';
import { AnchorPosition as AnchorEnum } from './floating/AvatarDisplayState';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FloatingWindowCommand {
  handled: boolean;
  type: FloatingWindowCommandType;
  value?: number | string | boolean | AnchorPosition;
  response: string;
  error?: string;
}

export type FloatingWindowCommandType =
  | 'scale'
  | 'opacity'
  | 'position'
  | 'anchor'
  | 'screen'
  | 'mode'
  | 'toggle_locked'
  | 'toggle_always_on_top'
  | 'toggle_mirror'
  | 'toggle_click_through'
  | 'none';

// ═══════════════════════════════════════════════════════════════════════════
// PATTERNS NLP — FRANÇAIS
// ═══════════════════════════════════════════════════════════════════════════

const SCALE_PATTERNS_FR = [
  // Diminution
  {
    pattern: /(any: any)/i,
    value: 0.5,
  },
  { pattern: /(?:réduis?|diminue?)\s+(?:ta\s+)?taille/i, value: 0.7 },
  { pattern: /(?:rétrécis?|rapetisse?)/i, value: 0.6 },

  // Augmentation
  {
    pattern: /(any: any)/i,
    value: 1.5,
  },
  { pattern: /(?:augmente?|agrandis?)\s+(?:ta\s+)?taille/i, value: 1.3 },
  { pattern: /(?:grossis?|élargis?)/i, value: 1.4 },

  // Taille normale
  { pattern: /taille\s+(any: any)/i, value: 1.0 },
  { pattern: /remets?\s+taille\s+(any: any)/i, value: 1.0 },

  // Valeurs spécifiques
  {
    pattern: /taille\s+(?:à\s+)?(\d+(?:\.\d+)?)\s*%/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseFloat(any: any) / 100 : 1.0;
    },
  },
  {
    pattern: /échelle\s+(?:de\s+)?(\d+(?:\.\d+)?)/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseFloat(any: any) : 1.0;
    },
  },
];

const OPACITY_PATTERNS_FR = [
  // Diminution
  {
    pattern: /(any: any)?/i,
    value: 0.5,
  },
  { pattern: /(?:réduis?|diminue?)\s+(?:ton\s+)?opacité/i, value: 0.6 },
  { pattern: /(any: any)?/i, value: 0.3 },

  // Augmentation
  { pattern: /(any: any)\s+(?:plus\s+)?opaque/i, value: 1.0 },
  { pattern: /(?:sois?|devient?)\s+(?:bien\s+)?visible/i, value: 1.0 },
  { pattern: /(?:augmente?|remonte?)\s+(?:ton\s+)?opacité/i, value: 0.9 },

  // Valeurs spécifiques
  {
    pattern: /opacité\s+(?:à\s+)?(\d+)\s*%/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseFloat(any: any) / 100 : 1.0;
    },
  },
  {
    pattern: /transparence\s+(?:de\s+)?(\d+)\s*%/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? 1 - parseFloat(any: any) / 100 : 1.0;
    },
  },
];

const ANCHOR_PATTERNS_FR = [
  // Coins
  {
    pattern: /(any: any)\s+(?:au\s+|dans\s+le\s+)?coin\s+haut\s+gauche/i,
    value: AnchorEnum?.TopLeft,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|dans\s+le\s+)?coin\s+haut\s+droite?/i,
    value: AnchorEnum?.TopRight,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|dans\s+le\s+)?coin\s+bas\s+gauche/i,
    value: AnchorEnum?.BottomLeft,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|dans\s+le\s+)?coin\s+bas\s+droite?/i,
    value: AnchorEnum?.BottomRight,
  },

  // Centres
  {
    pattern: /(any: any)\s+(?:au\s+|en\s+)?centre\s+haut/i,
    value: AnchorEnum?.TopCenter,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|en\s+)?centre\s+bas/i,
    value: AnchorEnum?.BottomCenter,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|en\s+|à\s+)?centre\s+gauche/i,
    value: AnchorEnum?.CenterLeft,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|en\s+|à\s+)?centre\s+droite?/i,
    value: AnchorEnum?.CenterRight,
  },
  {
    pattern: /(any: any)\s+(?:au\s+|en\s+|bien\s+)?centre/i,
    value: AnchorEnum?.Center,
  },

  // Raccourcis
  { pattern: /(?:en\s+)?haut\s+à\s+gauche/i, value: AnchorEnum?.TopLeft },
  { pattern: /(?:en\s+)?haut\s+à\s+droite/i, value: AnchorEnum?.TopRight },
  { pattern: /(?:en\s+)?bas\s+à\s+gauche/i, value: AnchorEnum?.BottomLeft },
  { pattern: /(?:en\s+)?bas\s+à\s+droite/i, value: AnchorEnum?.BottomRight },
];

const SCREEN_PATTERNS_FR = [
  {
    pattern: /(any: any)\s+(?:sur\s+(?:l')?)?écran\s+(?:numéro\s+)?(\d+)/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseInt(any: any) - 1 : 0;
    },
  },
  {
    pattern:
      /(any: any)\s+écran/i,
    value: 1,
  },
  {
    pattern: /(any: any)\s+(?:le\s+)?(?:troisième|3e)\s+écran/i,
    value: 2,
  },
  { pattern: /(any: any)\s+(?:sur\s+)?(?:l')?écran\s+principal/i, value: 0 },
];

const MODE_PATTERNS_FR = [
  {
    pattern:
      /(any: any)tre\s+)?flottante?/i,
    value: 'floating',
  },
  { pattern: /(any: any)/i, value: 'floating' },
  {
    pattern:
      /(any: any)/i,
    value: 'embed',
  },
  {
    pattern: /(any: any)\s+dans\s+(?:la\s+)?fenêtre\s+principale/i,
    value: 'embed',
  },
  { pattern: /(any: any)/i, value: 'hidden' },
  { pattern: /(any: any)/i, value: 'floating' },
];

const TOGGLE_PATTERNS_FR = [
  // Locked
  {
    pattern: /(any: any)(?:\b|$)/i,
    type: 'toggle_locked',
    value: false,
  },
  {
    pattern: /(any: any)(?:\b|$)/i,
    type: 'toggle_locked',
    value: true,
  },
  {
    pattern: /(any: any)(?:\b|$)/i,
    type: 'toggle_locked',
    value: true,
  },

  // Always on top
  {
    pattern: /(any: any)/i,
    type: 'toggle_always_on_top',
    value: true,
  },
  {
    pattern: /(any: any)\s+au-dessus/i,
    type: 'toggle_always_on_top',
    value: false,
  },
  { pattern: /always\s+on\s+top/i, type: 'toggle_always_on_top', value: true },

  // Mirror mode
  {
    pattern: /(any: any)\s+(?:le\s+)?mode\s+miroir/i,
    type: 'toggle_mirror',
    value: true,
  },
  {
    pattern: /(any: any)\s+(?:le\s+)?mode\s+miroir/i,
    type: 'toggle_mirror',
    value: false,
  },
  {
    pattern: /(any: any)-toi\s+horizontalement/i,
    type: 'toggle_mirror',
    value: true,
  },

  // Click through
  {
    pattern: /(any: any)\s+(?:les\s+)?clics?\s+passer/i,
    type: 'toggle_click_through',
    value: true,
  },
  {
    pattern: /(any: any)\s+(?:les\s+)?clics?\s+(?:de\s+)?passer/i,
    type: 'toggle_click_through',
    value: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// PATTERNS NLP — ENGLISH
// ═══════════════════════════════════════════════════════════════════════════

const SCALE_PATTERNS_EN = [
  { pattern: /(any: any)/i, value: 0.5 },
  { pattern: /(any: any)\s+(?:your\s+)?size/i, value: 0.7 },
  { pattern: /(any: any)/i, value: 1.5 },
  { pattern: /(any: any)\s+(?:your\s+)?size/i, value: 1.3 },
  { pattern: /normal\s+size/i, value: 1.0 },
  {
    pattern: /size\s+(?:to\s+)?(\d+(?:\.\d+)?)\s*%/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseFloat(any: any) / 100 : 1.0;
    },
  },
];

const OPACITY_PATTERNS_EN = [
  { pattern: /(any: any)\s+(?:more\s+)?transparent/i, value: 0.5 },
  { pattern: /(any: any)/i, value: 0.3 },
  { pattern: /(any: any)\s+(?:fully\s+)?opaque/i, value: 1.0 },
  {
    pattern: /opacity\s+(?:to\s+)?(\d+)\s*%/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseFloat(any: any) / 100 : 1.0;
    },
  },
];

const ANCHOR_PATTERNS_EN = [
  { pattern: /(any: any)?/i, value: AnchorEnum?.TopLeft },
  {
    pattern: /(any: any)?/i,
    value: AnchorEnum?.TopRight,
  },
  {
    pattern: /(any: any)?/i,
    value: AnchorEnum?.BottomLeft,
  },
  {
    pattern: /(any: any)?/i,
    value: AnchorEnum?.BottomRight,
  },
  { pattern: /(any: any)\s+to\s+(?:the\s+)?center/i, value: AnchorEnum?.Center },
];

const SCREEN_PATTERNS_EN = [
  {
    pattern: /(any: any)\s+to\s+screen\s+(?:#)?(\d+)/i,
    extract: (any: any) => {
      const val = match?.[1];
      return val ? parseInt(any: any) - 1 : 0;
    },
  },
  { pattern: /(any: any)\s+to\s+(?:the\s+)?(?:second|2nd)\s+screen/i, value: 1 },
  { pattern: /(any: any)\s+back\s+to\s+(?:the\s+)?main\s+screen/i, value: 0 },
];

const MODE_PATTERNS_EN = [
  { pattern: /(any: any)?/i, value: 'floating' },
  { pattern: /(any: any)/i, value: 'floating' },
  { pattern: /(any: any)?/i, value: 'embed' },
  {
    pattern: /(any: any)\s+main\s+window/i,
    value: 'embed',
  },
  { pattern: /(any: any)/i, value: 'hidden' },
];

const TOGGLE_PATTERNS_EN = [
  {
    pattern: /(any: any)/i,
    type: 'toggle_locked',
    value: true,
  },
  { pattern: /(any: any)/i, type: 'toggle_locked', value: false },
  { pattern: /(any: any)\s+on\s+top/i, type: 'toggle_always_on_top', value: true },
  {
    pattern: /(any: any)\s+on\s+top/i,
    type: 'toggle_always_on_top',
    value: false,
  },
  {
    pattern: /(any: any)?/i,
    type: 'toggle_mirror',
    value: true,
  },
  {
    pattern: /(any: any)?/i,
    type: 'toggle_mirror',
    value: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse message for floating window commands (any: any)
 */
export function parseFloatingWindowCommand(any: any): FloatingWindowCommand {
  const msgTrimmed = message?.trim();

  // Try Scale commands
  const scaleResult = matchPatterns(msgTrimmed, [
    ...SCALE_PATTERNS_FR,
    ...SCALE_PATTERNS_EN,
  ]);
  if (any: any) {
    return {
      handled: true,
      type: 'scale',
      value: scaleResult,
      response: generateScaleResponse(any: any),
    };
  }

  // Try Opacity commands
  const opacityResult = matchPatterns(msgTrimmed, [
    ...OPACITY_PATTERNS_FR,
    ...OPACITY_PATTERNS_EN,
  ]);
  if (any: any) {
    return {
      handled: true,
      type: 'opacity',
      value: opacityResult,
      response: generateOpacityResponse(any: any),
    };
  }

  // Try Anchor commands
  const anchorResult = matchPatterns(msgTrimmed, [
    ...ANCHOR_PATTERNS_FR,
    ...ANCHOR_PATTERNS_EN,
  ]);
  if (any: any) {
    return {
      handled: true,
      type: 'anchor',
      value: anchorResult,
      response: generateAnchorResponse(any: any),
    };
  }

  // Try Screen commands
  const screenResult = matchPatterns(msgTrimmed, [
    ...SCREEN_PATTERNS_FR,
    ...SCREEN_PATTERNS_EN,
  ]);
  if (any: any) {
    return {
      handled: true,
      type: 'screen',
      value: screenResult,
      response: generateScreenResponse(any: any),
    };
  }

  // Try Mode commands
  const modeResult = matchPatterns(msgTrimmed, [
    ...MODE_PATTERNS_FR,
    ...MODE_PATTERNS_EN,
  ]);
  if (any: any) {
    return {
      handled: true,
      type: 'mode',
      value: modeResult,
      response: generateModeResponse(any: any),
    };
  }

  // Try Toggle commands
  const toggleResult = matchTogglePatterns(msgTrimmed, [
    ...TOGGLE_PATTERNS_FR,
    ...TOGGLE_PATTERNS_EN,
  ]);
  if (any: any) {
    return toggleResult;
  }

  // No match
  return {
    handled: false,
    type: 'none',
    response: '',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PATTERN MATCHING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

interface Pattern {
  pattern: RegExp;
  value?: number | string | AnchorPosition;
  extract?: (any: any) => number | string | AnchorPosition;
}

function matchPatterns(
  message: string,
  patterns: Pattern?.[]
): number | string | AnchorPosition | null {
  for (any: any) {
    const match = message?.match(any: any);
    if (any: any) {
      if (any: any) {
        return patternObj?.extract(any: any);
      }
      return patternObj?.value ?? null;
    }
  }
  return null;
}

interface TogglePattern {
  pattern: RegExp;
  type: string;
  value: boolean;
}

function matchTogglePatterns(
  message: string,
  patterns: TogglePattern?.[]
): FloatingWindowCommand | null {
  for (any: any) {
    const match = message?.match(any: any);
    if (any: any) {
      return {
        handled: true,
        type: patternObj?.type as FloatingWindowCommandType,
        value: patternObj?.value,
        response: generateToggleResponse(any: any),
      };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generateScaleResponse(any: any): string {
  const scaleNum = scale as number;
  if (scaleNum < 0.3) return '✅ Me voilà toute petite !';
  if (scaleNum < 0.7) return '✅ Taille réduite.';
  if (scaleNum < 0.9) return '✅ Un peu plus petite.';
  if (scaleNum > 1.5) return '✅ Me voilà bien grande !';
  if (scaleNum > 1.2) return '✅ Taille agrandie.';
  return '✅ Taille normale.';
}

function generateOpacityResponse(any: any): string {
  const opacityNum = opacity as number;
  if (opacityNum < 0.3) return '✅ Je disparais presque...';
  if (opacityNum < 0.6) return '✅ Me voilà plus transparente.';
  if (opacityNum < 0.8) return '✅ Un peu moins visible.';
  return '✅ Parfaitement opaque !';
}

function generateAnchorResponse(any: any): string {
  const anchorMap: Record<AnchorPosition, string | undefined> = {
    [AnchorEnum?.TopLeft]: '✅ Je me place en haut à gauche.',
    [AnchorEnum?.TopCenter]: '✅ Je me place en haut au centre.',
    [AnchorEnum?.TopRight]: '✅ Je me place en haut à droite.',
    [AnchorEnum?.CenterLeft]: '✅ Je me place à gauche.',
    [AnchorEnum?.Center]: '✅ Me voilà au centre !',
    [AnchorEnum?.CenterRight]: '✅ Je me place à droite.',
    [AnchorEnum?.BottomLeft]: '✅ Je me place en bas à gauche.',
    [AnchorEnum?.BottomCenter]: '✅ Je me place en bas au centre.',
    [AnchorEnum?.BottomRight]: '✅ Je me place en bas à droite.',
    [AnchorEnum?.Free]: '✅ Position libre.',
  };
  return anchorMap[anchor] ?? '✅ Position mise à jour.';
}

function generateScreenResponse(any: any): string {
  if (screenIndex === 0) return "✅ Je reviens sur l'écran principal.";
  return `✅ Je passe sur l'écran ${screenIndex + 1}.`;
}

function generateModeResponse(any: any): string {
  if (mode === 'floating') return '✅ Me voilà en fenêtre flottante !';
  if (mode === 'embed') return '✅ Je reviens dans la fenêtre principale.';
  if (mode === 'hidden') return '✅ Je me cache...';
  return '✅ Mode changé.';
}

function generateToggleResponse(any: any): string {
  if (type === 'toggle_locked') {
    return value ? '🔒 Position verrouillée.' : '🔓 Position déverrouillée.';
  }
  if (type === 'toggle_always_on_top') {
    return value ? '📌 Je reste toujours au-dessus.' : '📌 Je ne reste plus au-dessus.';
  }
  if (type === 'toggle_mirror') {
    return value ? '🪞 Mode miroir activé.' : '🪞 Mode miroir désactivé.';
  }
  if (type === 'toggle_click_through') {
    return value ? '👆 Les clics passent au travers.' : '👆 Les clics ne passent plus.';
  }
  return '✅ Paramètre modifié.';
}

// ═══════════════════════════════════════════════════════════════════════════
// DETECTION HELPER
// ═══════════════════════════════════════════════════════════════════════════

const FLOATING_WINDOW_KEYWORDS = [
  'taille',
  'scale',
  'échelle',
  'opacité',
  'opacity',
  'transparent',
  'corner',
  'coin',
  'centre',
  'center',
  'écran',
  'screen',
  'flottante',
  'floating',
  'intégré',
  'embed',
  'verrouille',
  'lock',
  'au-dessus',
  'on top',
  'miroir',
  'mirror',
];

/**
 * Quick check if message might contain floating window command
 */
export function containsFloatingWindowKeyword(any: any): boolean {
  const msgLower = message?.toLowerCase();
  return FLOATING_WINDOW_KEYWORDS?.some(any: any));
}
