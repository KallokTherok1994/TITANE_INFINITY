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
  { pattern: /(?:devient?|fais-toi|deviens?)\s+(?:plus\s+)?(?:petit|petite|miniature)/i, value: 0.5 },
  { pattern: /(?:réduis?|diminue?)\s+(?:ta\s+)?taille/i, value: 0.7 },
  { pattern: /(?:rétrécis?|rapetisse?)/i, value: 0.6 },

  // Augmentation
  { pattern: /(?:devient?|fais-toi|deviens?)\s+(?:plus\s+)?(?:grand|grande|gros|grosse)/i, value: 1.5 },
  { pattern: /(?:augmente?|agrandis?)\s+(?:ta\s+)?taille/i, value: 1.3 },
  { pattern: /(?:grossis?|élargis?)/i, value: 1.4 },

  // Taille normale
  { pattern: /taille\s+(?:normale|standard|par\s+défaut)/i, value: 1.0 },
  { pattern: /remets?\s+taille\s+(?:normale|d'origine)/i, value: 1.0 },

  // Valeurs spécifiques
  { pattern: /taille\s+(?:à\s+)?(\d+(?:\.\d+)?)\s*%/i, extract: (match: RegExpMatchArray) => parseFloat(match[1]) / 100 },
  { pattern: /échelle\s+(?:de\s+)?(\d+(?:\.\d+)?)/i, extract: (match: RegExpMatchArray) => parseFloat(match[1]) },
];

const OPACITY_PATTERNS_FR = [
  // Diminution
  { pattern: /(?:devient?|deviens?|fais-toi)\s+(?:plus\s+)?transparent(?:e)?/i, value: 0.5 },
  { pattern: /(?:réduis?|diminue?)\s+(?:ton\s+)?opacité/i, value: 0.6 },
  { pattern: /(?:disparais?|efface-toi)\s+(?:un\s+peu)?/i, value: 0.3 },

  // Augmentation
  { pattern: /(?:devient?|deviens?|fais-toi)\s+(?:plus\s+)?opaque/i, value: 1.0 },
  { pattern: /(?:sois?|devient?)\s+(?:bien\s+)?visible/i, value: 1.0 },
  { pattern: /(?:augmente?|remonte?)\s+(?:ton\s+)?opacité/i, value: 0.9 },

  // Valeurs spécifiques
  { pattern: /opacité\s+(?:à\s+)?(\d+)\s*%/i, extract: (match: RegExpMatchArray) => parseFloat(match[1]) / 100 },
  { pattern: /transparence\s+(?:de\s+)?(\d+)\s*%/i, extract: (match: RegExpMatchArray) => 1 - (parseFloat(match[1]) / 100) },
];

const ANCHOR_PATTERNS_FR = [
  // Coins
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|dans\s+le\s+)?coin\s+haut\s+gauche/i, value: AnchorEnum.TopLeft },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|dans\s+le\s+)?coin\s+haut\s+droite?/i, value: AnchorEnum.TopRight },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|dans\s+le\s+)?coin\s+bas\s+gauche/i, value: AnchorEnum.BottomLeft },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|dans\s+le\s+)?coin\s+bas\s+droite?/i, value: AnchorEnum.BottomRight },

  // Centres
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|en\s+)?centre\s+haut/i, value: AnchorEnum.TopCenter },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|en\s+)?centre\s+bas/i, value: AnchorEnum.BottomCenter },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|en\s+|à\s+)?centre\s+gauche/i, value: AnchorEnum.CenterLeft },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|en\s+|à\s+)?centre\s+droite?/i, value: AnchorEnum.CenterRight },
  { pattern: /(?:va|mets?-toi|place-toi)\s+(?:au\s+|en\s+|bien\s+)?centre/i, value: AnchorEnum.Center },

  // Raccourcis
  { pattern: /(?:en\s+)?haut\s+à\s+gauche/i, value: AnchorEnum.TopLeft },
  { pattern: /(?:en\s+)?haut\s+à\s+droite/i, value: AnchorEnum.TopRight },
  { pattern: /(?:en\s+)?bas\s+à\s+gauche/i, value: AnchorEnum.BottomLeft },
  { pattern: /(?:en\s+)?bas\s+à\s+droite/i, value: AnchorEnum.BottomRight },
];

const SCREEN_PATTERNS_FR = [
  { pattern: /(?:va|passe)\s+(?:sur\s+l')?écran\s+(?:numéro\s+)?(\d+)/i, extract: (match: RegExpMatchArray) => parseInt(match[1]) - 1 },
  { pattern: /(?:déplace-toi|va)\s+(?:vers|sur)\s+(?:le\s+)?(?:deuxième|2e|second)\s+écran/i, value: 1 },
  { pattern: /(?:déplace-toi|va)\s+(?:vers|sur)\s+(?:le\s+)?(?:troisième|3e)\s+écran/i, value: 2 },
  { pattern: /(?:reviens?|retourne)\s+(?:sur\s+)?(?:l')?écran\s+principal/i, value: 0 },
];

const MODE_PATTERNS_FR = [
  { pattern: /(?:devient?|mets?-toi|passe)\s+en\s+(?:mode\s+)?(?:fenêtre\s+)?flottante?/i, value: 'floating' },
  { pattern: /(?:détache-toi|sort|libère-toi)/i, value: 'floating' },
  { pattern: /(?:devient?|mets?-toi|passe)\s+en\s+(?:mode\s+)?(?:intégré|embed|incorporé)/i, value: 'embed' },
  { pattern: /(?:rentre|reviens?|intègre-toi)\s+dans\s+(?:la\s+)?fenêtre\s+principale/i, value: 'embed' },
  { pattern: /(?:cache-toi|disparais|masque-toi)/i, value: 'hidden' },
  { pattern: /(?:montre-toi|apparais|affiche-toi)/i, value: 'floating' },
];

const TOGGLE_PATTERNS_FR = [
  // Locked
  { pattern: /(?:verrouille-toi|bloque-toi|reste\s+en\s+place)/i, type: 'toggle_locked', value: true },
  { pattern: /(?:déverrouille-toi|débloque-toi|bouge\s+librement)/i, type: 'toggle_locked', value: false },
  { pattern: /(?:verrouillage|lock|verrouille)/i, type: 'toggle_locked', value: true },

  // Always on top
  { pattern: /(?:reste|mets?-toi)\s+(?:toujours\s+)?(?:au-dessus|par-dessus|devant)/i, type: 'toggle_always_on_top', value: true },
  { pattern: /(?:ne\s+reste\s+plus|arrête\s+de\s+rester)\s+au-dessus/i, type: 'toggle_always_on_top', value: false },
  { pattern: /always\s+on\s+top/i, type: 'toggle_always_on_top', value: true },

  // Mirror mode
  { pattern: /(?:active|met)\s+(?:le\s+)?mode\s+miroir/i, type: 'toggle_mirror', value: true },
  { pattern: /(?:désactive|enlève|coupe)\s+(?:le\s+)?mode\s+miroir/i, type: 'toggle_mirror', value: false },
  { pattern: /(?:inverse|retourne)-toi\s+horizontalement/i, type: 'toggle_mirror', value: true },

  // Click through
  { pattern: /(?:laisse|autorise)\s+(?:les\s+)?clics?\s+passer/i, type: 'toggle_click_through', value: true },
  { pattern: /(?:bloque|empêche)\s+(?:les\s+)?clics?\s+(?:de\s+)?passer/i, type: 'toggle_click_through', value: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// PATTERNS NLP — ENGLISH
// ═══════════════════════════════════════════════════════════════════════════

const SCALE_PATTERNS_EN = [
  { pattern: /(?:make\s+yourself|become|get)\s+(?:smaller|tiny|little)/i, value: 0.5 },
  { pattern: /(?:reduce|decrease|shrink)\s+(?:your\s+)?size/i, value: 0.7 },
  { pattern: /(?:make\s+yourself|become|get)\s+(?:bigger|larger|huge)/i, value: 1.5 },
  { pattern: /(?:increase|grow)\s+(?:your\s+)?size/i, value: 1.3 },
  { pattern: /normal\s+size/i, value: 1.0 },
  { pattern: /size\s+(?:to\s+)?(\d+(?:\.\d+)?)\s*%/i, extract: (match: RegExpMatchArray) => parseFloat(match[1]) / 100 },
];

const OPACITY_PATTERNS_EN = [
  { pattern: /(?:become|get|make\s+yourself)\s+(?:more\s+)?transparent/i, value: 0.5 },
  { pattern: /(?:fade\s+out|disappear\s+a\s+bit)/i, value: 0.3 },
  { pattern: /(?:become|get|be)\s+(?:fully\s+)?opaque/i, value: 1.0 },
  { pattern: /opacity\s+(?:to\s+)?(\d+)\s*%/i, extract: (match: RegExpMatchArray) => parseFloat(match[1]) / 100 },
];

const ANCHOR_PATTERNS_EN = [
  { pattern: /(?:go|move)\s+to\s+top\s+left(?:\s+corner)?/i, value: AnchorEnum.TopLeft },
  { pattern: /(?:go|move)\s+to\s+top\s+right(?:\s+corner)?/i, value: AnchorEnum.TopRight },
  { pattern: /(?:go|move)\s+to\s+bottom\s+left(?:\s+corner)?/i, value: AnchorEnum.BottomLeft },
  { pattern: /(?:go|move)\s+to\s+bottom\s+right(?:\s+corner)?/i, value: AnchorEnum.BottomRight },
  { pattern: /(?:go|move)\s+to\s+(?:the\s+)?center/i, value: AnchorEnum.Center },
];

const SCREEN_PATTERNS_EN = [
  { pattern: /(?:go|move)\s+to\s+screen\s+(?:#)?(\d+)/i, extract: (match: RegExpMatchArray) => parseInt(match[1]) - 1 },
  { pattern: /(?:go|move)\s+to\s+(?:the\s+)?(?:second|2nd)\s+screen/i, value: 1 },
  { pattern: /(?:go|move)\s+back\s+to\s+(?:the\s+)?main\s+screen/i, value: 0 },
];

const MODE_PATTERNS_EN = [
  { pattern: /(?:become|go|switch\s+to)\s+floating(?:\s+mode)?/i, value: 'floating' },
  { pattern: /(?:detach|separate|float\s+free)/i, value: 'floating' },
  { pattern: /(?:become|go|switch\s+to)\s+embedded?(?:\s+mode)?/i, value: 'embed' },
  { pattern: /(?:dock|attach|integrate)\s+(?:back\s+)?(?:to|with)\s+main\s+window/i, value: 'embed' },
  { pattern: /(?:hide|disappear|hide\s+yourself)/i, value: 'hidden' },
];

const TOGGLE_PATTERNS_EN = [
  { pattern: /(?:lock|freeze)\s+(?:yourself|position)/i, type: 'toggle_locked', value: true },
  { pattern: /(?:unlock|unfreeze)/i, type: 'toggle_locked', value: false },
  { pattern: /(?:stay|remain)\s+on\s+top/i, type: 'toggle_always_on_top', value: true },
  { pattern: /(?:stop\s+staying|don't\s+stay)\s+on\s+top/i, type: 'toggle_always_on_top', value: false },
  { pattern: /(?:enable|activate)\s+mirror(?:\s+mode)?/i, type: 'toggle_mirror', value: true },
  { pattern: /(?:disable|deactivate)\s+mirror(?:\s+mode)?/i, type: 'toggle_mirror', value: false },
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse message for floating window commands (FR + EN)
 */
export function parseFloatingWindowCommand(message: string): FloatingWindowCommand {
  const msgTrimmed = message.trim();

  // Try Scale commands
  const scaleResult = matchPatterns(msgTrimmed, [...SCALE_PATTERNS_FR, ...SCALE_PATTERNS_EN]);
  if (scaleResult) {
    return {
      handled: true,
      type: 'scale',
      value: scaleResult,
      response: generateScaleResponse(scaleResult),
    };
  }

  // Try Opacity commands
  const opacityResult = matchPatterns(msgTrimmed, [...OPACITY_PATTERNS_FR, ...OPACITY_PATTERNS_EN]);
  if (opacityResult) {
    return {
      handled: true,
      type: 'opacity',
      value: opacityResult,
      response: generateOpacityResponse(opacityResult),
    };
  }

  // Try Anchor commands
  const anchorResult = matchPatterns(msgTrimmed, [...ANCHOR_PATTERNS_FR, ...ANCHOR_PATTERNS_EN]);
  if (anchorResult) {
    return {
      handled: true,
      type: 'anchor',
      value: anchorResult,
      response: generateAnchorResponse(anchorResult as AnchorPosition),
    };
  }

  // Try Screen commands
  const screenResult = matchPatterns(msgTrimmed, [...SCREEN_PATTERNS_FR, ...SCREEN_PATTERNS_EN]);
  if (screenResult !== null && screenResult !== undefined) {
    return {
      handled: true,
      type: 'screen',
      value: screenResult,
      response: generateScreenResponse(screenResult as number),
    };
  }

  // Try Mode commands
  const modeResult = matchPatterns(msgTrimmed, [...MODE_PATTERNS_FR, ...MODE_PATTERNS_EN]);
  if (modeResult) {
    return {
      handled: true,
      type: 'mode',
      value: modeResult,
      response: generateModeResponse(modeResult as string),
    };
  }

  // Try Toggle commands
  const toggleResult = matchTogglePatterns(msgTrimmed, [...TOGGLE_PATTERNS_FR, ...TOGGLE_PATTERNS_EN]);
  if (toggleResult) {
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
  extract?: (match: RegExpMatchArray) => number | string | AnchorPosition;
}

function matchPatterns(message: string, patterns: Pattern[]): number | string | AnchorPosition | null {
  for (const { pattern, value, extract } of patterns) {
    const match = message.match(pattern);
    if (match) {
      if (extract) {
        return extract(match);
      }
      return value ?? null;
    }
  }
  return null;
}

interface TogglePattern {
  pattern: RegExp;
  type: string;
  value: boolean;
}

function matchTogglePatterns(message: string, patterns: TogglePattern[]): FloatingWindowCommand | null {
  for (const { pattern, type, value } of patterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        handled: true,
        type: type as FloatingWindowCommandType,
        value,
        response: generateToggleResponse(type, value),
      };
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generateScaleResponse(scale: number | string | AnchorPosition): string {
  const scaleNum = scale as number;
  if (scaleNum < 0.3) return '✅ Me voilà toute petite !';
  if (scaleNum < 0.7) return '✅ Taille réduite.';
  if (scaleNum < 0.9) return '✅ Un peu plus petite.';
  if (scaleNum > 1.5) return '✅ Me voilà bien grande !';
  if (scaleNum > 1.2) return '✅ Taille agrandie.';
  return '✅ Taille normale.';
}

function generateOpacityResponse(opacity: number | string | AnchorPosition): string {
  const opacityNum = opacity as number;
  if (opacityNum < 0.3) return '✅ Je disparais presque...';
  if (opacityNum < 0.6) return '✅ Me voilà plus transparente.';
  if (opacityNum < 0.8) return '✅ Un peu moins visible.';
  return '✅ Parfaitement opaque !';
}

function generateAnchorResponse(anchor: AnchorPosition): string {
  const anchorMap: Record<AnchorPosition, string> = {
    [AnchorEnum.TopLeft]: '✅ Je me place en haut à gauche.',
    [AnchorEnum.TopCenter]: '✅ Je me place en haut au centre.',
    [AnchorEnum.TopRight]: '✅ Je me place en haut à droite.',
    [AnchorEnum.CenterLeft]: '✅ Je me place à gauche.',
    [AnchorEnum.Center]: '✅ Me voilà au centre !',
    [AnchorEnum.CenterRight]: '✅ Je me place à droite.',
    [AnchorEnum.BottomLeft]: '✅ Je me place en bas à gauche.',
    [AnchorEnum.BottomCenter]: '✅ Je me place en bas au centre.',
    [AnchorEnum.BottomRight]: '✅ Je me place en bas à droite.',
    [AnchorEnum.Free]: '✅ Position libre.',
  };
  return anchorMap[anchor] || '✅ Position mise à jour.';
}

function generateScreenResponse(screenIndex: number): string {
  if (screenIndex === 0) return '✅ Je reviens sur l\'écran principal.';
  return `✅ Je passe sur l'écran ${screenIndex + 1}.`;
}

function generateModeResponse(mode: string): string {
  if (mode === 'floating') return '✅ Me voilà en fenêtre flottante !';
  if (mode === 'embed') return '✅ Je reviens dans la fenêtre principale.';
  if (mode === 'hidden') return '✅ Je me cache...';
  return '✅ Mode changé.';
}

function generateToggleResponse(type: string, value: boolean): string {
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
export function containsFloatingWindowKeyword(message: string): boolean {
  const msgLower = message.toLowerCase();
  return FLOATING_WINDOW_KEYWORDS.some((keyword) => msgLower.includes(keyword));
}
