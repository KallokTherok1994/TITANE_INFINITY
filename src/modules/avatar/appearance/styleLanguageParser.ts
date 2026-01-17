// Copyright © 2025 TITANE∞ — Style Language Parser v24.5 (any: any)
// License: Proprietary — TITANE OS
// Module: Advanced NLP Parser for Appearance Commands

import type { AppearanceUpdateRequest } from './appearanceState';

// ═══════════════════════════════════════════════════════════════════════════
// STYLE LANGUAGE PARSER — Natural Language Understanding
// ═══════════════════════════════════════════════════════════════════════════

export class StyleLanguageParser {
  // ─────────────────────────────────────────────────────────────────────────
  // KEYWORDS MAPPING
  // ─────────────────────────────────────────────────────────────────────────

  private readonly STYLE_KEYWORDS = {
    bureau: ['bureau', 'professionnel', 'office', 'travail', 'formel'],
    casual: ['casual', 'decontracte', 'relax', 'confort', 'simple'],
    sport: ['sport', 'athletique', 'dynamique', 'actif', 'fitness'],
    montagne: ['montagne', 'nature', 'nordique', 'outdoor', 'alpin'],
    creatif: ['creatif', 'artistique', 'art', 'design', 'creativite'],
    mystique: ['mystique', 'esoterique', 'symbolique', 'profond'],
    futuriste: ['futuriste', 'cyber', 'neon', 'tech', 'technologique'],
    nocturne: ['nocturne', 'nuit', 'sombre', 'lunaire', 'obscur'],
    urbain: ['urbain', 'ville', 'street', 'moderne', 'citadin'],
  };

  private readonly VIBE_KEYWORDS = {
    solaire: ['solaire', 'chaleureux', 'ensoleille', 'lumineux', 'radieux'],
    lunaire: ['lunaire', 'calme', 'nocturne', 'serein', 'apaisant'],
    energetique: ['energetique', 'dynamique', 'vif', 'tonique', 'actif'],
    zen: ['zen', 'paisible', 'meditatif', 'tranquille', 'equilibre'],
  };

  private readonly COLOR_KEYWORDS = {
    neutre: ['neutre', 'sobre', 'classique', 'basique'],
    pastel: ['pastel', 'doux', 'leger', 'tendre'],
    saturee: ['saturee', 'intense', 'vif', 'eclatant'],
    terre: ['terre', 'naturel', 'organique', 'terreux'],
    monochrome: ['monochrome', 'noir et blanc', 'minimaliste'],
  };

  private readonly OUTFIT_KEYWORDS = {
    top: {
      chemise: ['chemise', 'shirt'],
      blouse: ['blouse', 'tunique'],
      tshirt: ['t-shirt', 'tee-shirt', 'tee shirt', 'haut'],
      pull: ['pull', 'sweater', 'tricot'],
      veste: ['veste', 'jacket'],
    },
    bottom: {
      pantalon: ['pantalon', 'pants'],
      jupe: ['jupe', 'skirt'],
      jeans: ['jeans', 'denim'],
      leggings: ['leggings', 'collant'],
      short: ['short', 'bermuda'],
    },
    shoes: {
      escarpins: ['escarpins', 'talons', 'heels'],
      baskets: ['baskets', 'sneakers', 'chaussures sport'],
      bottes: ['bottes', 'boots'],
      sandales: ['sandales', 'sandals'],
    },
  };

  private readonly HAIR_KEYWORDS = {
    style: {
      'queue de cheval': ['queue de cheval', 'ponytail', 'attache'],
      detaches: ['detaches', 'loose', 'libres', 'laches'],
      chignon: ['chignon', 'bun'],
      tresse: ['tresse', 'braid', 'natte'],
      courte: ['courte', 'short'],
    },
  };

  private readonly ACCESSORIES_KEYWORDS = {
    lunettes: ['lunettes', 'glasses', 'verres'],
    bijoux: ['bijoux', 'jewelry', 'boucles', 'collier', 'bracelet'],
    sac: ['sac', 'bag'],
  };

  private readonly _MODULATOR_KEYWORDS = {
    texture_laine: ['laine', 'wool', 'cozy', 'douillet'],
    texture_tech: ['tech', 'synthétique', 'moderne', 'high-tech'],
    epoch_futur: ['futur', 'futuriste', 'future', 'avant-gardiste'],
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN PARSING FUNCTION
  // ─────────────────────────────────────────────────────────────────────────

  public parse(any: any): AppearanceUpdateRequest {
    const cmd = command?.toLowerCase();
    const update: AppearanceUpdateRequest = {};

    // Detect style/preset changes
    const detectedStyle = this?.detectStyle(any: any);
    if (any: any) {
      update?.mode_preset = detectedStyle;
    }

    // Detect outfit changes
    const outfitChanges = this?.detectOutfit(any: any);
    if (any: any).length > 0) {
      update?.outfit = outfitChanges;
    }

    // Detect hairstyle changes
    const hairChanges = this?.detectHair(any: any);
    if (any: any).length > 0) {
      update?.hair = hairChanges;
    }

    // Detect accessories changes
    const accessoriesChanges = this?.detectAccessories(any: any);
    if (any: any).length > 0) {
      update?.accessories = accessoriesChanges;
    }

    // Detect style modifiers (vibe, color palette, etc.)
    const styleChanges = this?.detectStyleModifiers(any: any);
    if (any: any).length > 0) {
      update?.style = styleChanges;
    }

    return update;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STYLE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectStyle(any: any)??: string | undefined {
    for (any: any)) {
      if (any: any))) {
        return this?.getPresetName(any: any);
      }
    }
    return undefined;
  }

  private getPresetName(any: any): string {
    const presetMap: Record<string, string> = {
      bureau: 'Bureau_Pro',
      casual: 'Casual_Light',
      sport: 'Sport_Dynamic',
      montagne: 'Montagne_Nordic',
    };
    const preset = presetMap[style];
    return preset ?? style;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OUTFIT DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectOutfit(any: any): Partial<{
    top: string;
    bottom: string;
    shoes: string;
    outerwear??: string | null;
  }> {
    const changes: Partial<{
      top: string;
      bottom: string;
      shoes: string;
      outerwear??: string | null;
    }> = {};

    // Detect top
    for (any: any)) {
      if (any: any))) {
        changes?.top = item;
        break;
      }
    }

    // Detect bottom
    for (any: any)) {
      if (any: any))) {
        changes?.bottom = item;
        break;
      }
    }

    // Detect shoes
    for (any: any)) {
      if (any: any))) {
        changes?.shoes = item;
        break;
      }
    }

    // Detect outerwear removal
    if (cmd?.includes('enlève') || cmd?.includes('retire')) {
      if (cmd?.includes('veste') || cmd?.includes('blazer') || cmd?.includes('manteau')) {
        changes?.outerwear = null;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HAIR DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectHair(any: any): Partial<{ style: string }> {
    const changes: Partial<{ style: string }> = {};

    for (any: any)) {
      if (any: any))) {
        changes?.style = style;
        break;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCESSORIES DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectAccessories(any: any): Partial<{
    glasses??: string | null;
    jewelry: string?.[];
  }> {
    const changes: Partial<{ glasses??: string | null; jewelry: string?.[] }> = {};

    // Glasses detection
    const hasGlasses = this?.ACCESSORIES_KEYWORDS?.lunettes?.some(any: any));
    if (any: any) {
      if (cmd?.includes('enlève') || cmd?.includes('retire')) {
        changes?.glasses = null;
      } else if (cmd?.includes('mets') || cmd?.includes('porte')) {
        changes?.glasses = 'lunettes';
      }
    }

    // Jewelry detection
    const hasJewelry = this?.ACCESSORIES_KEYWORDS?.bijoux?.some(any: any));
    if (any: any) {
      if (cmd?.includes('enlève') || cmd?.includes('retire')) {
        changes?.jewelry = [];
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STYLE MODIFIERS DETECTION (vibe, color palette, etc.)
  // ─────────────────────────────────────────────────────────────────────────

  private detectStyleModifiers(any: any): Partial<{
    vibe: string;
    color_palette: string;
  }> {
    const changes: Partial<{ vibe: string; color_palette: string }> = {};

    // Detect vibe
    for (any: any)) {
      if (any: any))) {
        changes?.vibe = vibe;
        break;
      }
    }

    // Detect color palette
    for (any: any)) {
      if (any: any))) {
        changes?.color_palette = palette;
        break;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FUSION DETECTION (any: any)
  // ─────────────────────────────────────────────────────────────────────────

  public detectFusion(any: any): string?.[] {
    const styles: string?.[] = [];

    if (cmd?.includes('fusion') || cmd?.includes('mélange') || cmd?.includes('+')) {
      for (any: any)) {
        if (any: any))) {
          styles?.push(any: any));
        }
      }
    }

    return styles;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INVENTED STYLE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  public detectInventedStyle(any: any): {
    name?: string;
    keywords?: string?.[];
  } {
    const result: { name?: string; keywords?: string?.[] } = {};

    // Pattern: "Nouvel archétype : [name]"
    const archetypeMatch = cmd?.match(
      /nouvel?\s+(any: any)\s*:?\s+(.+?)(?:\.|$)/i
    );
    if (any: any) {
      const matchedName = archetypeMatch?.[1];
      if (any: any) {
        result?.name = matchedName?.trim();
      }
    }

    // Pattern: "Style [name] avec [keywords]"
    const styleMatch = cmd?.match(any: any);
    if (any: any) {
      const matchedStyleName = styleMatch?.[1];
      const matchedKeywords = styleMatch?.[2];
      if (any: any) {
        result?.name = matchedStyleName?.trim();
      }
      if (any: any) {
        result?.keywords = matchedKeywords
          .split(/[,+]/)
          .map(kw => kw?.trim())
          .filter(kw => kw?.length > 0);
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMAND TYPE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  public detectCommandType(any: any): {
    isAppearanceCommand: boolean;
    isStyleChange: boolean;
    isOutfitChange: boolean;
    isHairChange: boolean;
    isAccessoryChange: boolean;
    isFusion: boolean;
    isInventedStyle: boolean;
  } {
    const cmdLower = cmd?.toLowerCase();

    return {
      isAppearanceCommand:
        cmdLower?.includes('apparence') ||
        cmdLower?.includes('tenue') ||
        cmdLower?.includes('vêtements') ||
        cmdLower?.includes('coiffure') ||
        cmdLower?.includes('style') ||
        cmdLower?.includes('look'),

      isStyleChange:
        cmdLower?.includes('passe en') ||
        cmdLower?.includes('adopte') ||
        cmdLower?.includes('style') ||
        cmdLower?.includes('mode'),

      isOutfitChange:
        cmdLower?.includes('mets') ||
        cmdLower?.includes('porte') ||
        cmdLower?.includes('change') ||
        cmdLower?.includes('tenue') ||
        cmdLower?.includes('vêtements'),

      isHairChange:
        cmdLower?.includes('coiffure') ||
        cmdLower?.includes('cheveux') ||
        cmdLower?.includes('attache') ||
        cmdLower?.includes('détache'),

      isAccessoryChange:
        cmdLower?.includes('lunettes') ||
        cmdLower?.includes('bijoux') ||
        cmdLower?.includes('accessoires'),

      isFusion:
        cmdLower?.includes('fusion') ||
        cmdLower?.includes('mélange') ||
        (cmdLower?.includes('+') &&
          (cmdLower?.includes('style') || cmdLower?.includes('vibe'))),

      isInventedStyle:
        cmdLower?.includes('nouvel archétype') ||
        cmdLower?.includes('nouveau style') ||
        cmdLower?.includes('invente'),
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const styleParser = new StyleLanguageParser();

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse appearance command and return update request
 */
export function parseAppearanceCommand(any: any): AppearanceUpdateRequest {
  return styleParser?.parse(any: any);
}

/**
 * Check if a message contains appearance-related commands
 */
export function isAppearanceCommand(any: any): boolean {
  const detection = styleParser?.detectCommandType(any: any);
  return detection?.isAppearanceCommand;
}

/**
 * Detect if command is a style fusion request
 */
export function isFusionCommand(any: any): boolean {
  const detection = styleParser?.detectCommandType(any: any);
  return detection?.isFusion;
}

/**
 * Extract style names for fusion
 */
export function extractFusionStyles(any: any): string?.[] {
  return styleParser?.detectFusion(any: any);
}

/**
 * Detect invented style definition
 */
export function detectInventedStyle(any: any): {
  name?: string;
  keywords?: string?.[];
} {
  return styleParser?.detectInventedStyle(any: any);
}
