// Copyright © 2025 TITANE∞ — Style Language Parser v24.5 (Frontend)
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

  public parse(command: string): AppearanceUpdateRequest {
    const cmd = command.toLowerCase();
    const update: AppearanceUpdateRequest = {};

    // Detect style/preset changes
    const detectedStyle = this.detectStyle(cmd);
    if (detectedStyle) {
      update.mode_preset = detectedStyle;
    }

    // Detect outfit changes
    const outfitChanges = this.detectOutfit(cmd);
    if (Object.keys(outfitChanges).length > 0) {
      update.outfit = outfitChanges;
    }

    // Detect hairstyle changes
    const hairChanges = this.detectHair(cmd);
    if (Object.keys(hairChanges).length > 0) {
      update.hair = hairChanges;
    }

    // Detect accessories changes
    const accessoriesChanges = this.detectAccessories(cmd);
    if (Object.keys(accessoriesChanges).length > 0) {
      update.accessories = accessoriesChanges;
    }

    // Detect style modifiers (vibe, color palette, etc.)
    const styleChanges = this.detectStyleModifiers(cmd);
    if (Object.keys(styleChanges).length > 0) {
      update.style = styleChanges;
    }

    return update;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STYLE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectStyle(cmd: string): string | undefined {
    for (const [style, keywords] of Object.entries(this.STYLE_KEYWORDS)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        return this.getPresetName(style);
      }
    }
    return undefined;
  }

  private getPresetName(style: string): string {
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

  private detectOutfit(cmd: string): Partial<{
    top: string;
    bottom: string;
    shoes: string;
    outerwear: string | null;
  }> {
    const changes: Partial<{
      top: string;
      bottom: string;
      shoes: string;
      outerwear: string | null;
    }> = {};

    // Detect top
    for (const [item, keywords] of Object.entries(this.OUTFIT_KEYWORDS.top)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.top = item;
        break;
      }
    }

    // Detect bottom
    for (const [item, keywords] of Object.entries(this.OUTFIT_KEYWORDS.bottom)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.bottom = item;
        break;
      }
    }

    // Detect shoes
    for (const [item, keywords] of Object.entries(this.OUTFIT_KEYWORDS.shoes)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.shoes = item;
        break;
      }
    }

    // Detect outerwear removal
    if (cmd.includes('enlève') || cmd.includes('retire')) {
      if (cmd.includes('veste') || cmd.includes('blazer') || cmd.includes('manteau')) {
        changes.outerwear = null;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HAIR DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectHair(cmd: string): Partial<{ style: string }> {
    const changes: Partial<{ style: string }> = {};

    for (const [style, keywords] of Object.entries(this.HAIR_KEYWORDS.style)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.style = style;
        break;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCESSORIES DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  private detectAccessories(cmd: string): Partial<{
    glasses: string | null;
    jewelry: string[];
  }> {
    const changes: Partial<{ glasses: string | null; jewelry: string[] }> = {};

    // Glasses detection
    const hasGlasses = this.ACCESSORIES_KEYWORDS.lunettes.some(kw => cmd.includes(kw));
    if (hasGlasses) {
      if (cmd.includes('enlève') || cmd.includes('retire')) {
        changes.glasses = null;
      } else if (cmd.includes('mets') || cmd.includes('porte')) {
        changes.glasses = 'lunettes';
      }
    }

    // Jewelry detection
    const hasJewelry = this.ACCESSORIES_KEYWORDS.bijoux.some(kw => cmd.includes(kw));
    if (hasJewelry) {
      if (cmd.includes('enlève') || cmd.includes('retire')) {
        changes.jewelry = [];
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STYLE MODIFIERS DETECTION (vibe, color palette, etc.)
  // ─────────────────────────────────────────────────────────────────────────

  private detectStyleModifiers(cmd: string): Partial<{
    vibe: string;
    color_palette: string;
  }> {
    const changes: Partial<{ vibe: string; color_palette: string }> = {};

    // Detect vibe
    for (const [vibe, keywords] of Object.entries(this.VIBE_KEYWORDS)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.vibe = vibe;
        break;
      }
    }

    // Detect color palette
    for (const [palette, keywords] of Object.entries(this.COLOR_KEYWORDS)) {
      if (keywords.some(kw => cmd.includes(kw))) {
        changes.color_palette = palette;
        break;
      }
    }

    return changes;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FUSION DETECTION (Multiple Styles)
  // ─────────────────────────────────────────────────────────────────────────

  public detectFusion(cmd: string): string[] {
    const styles: string[] = [];

    if (cmd.includes('fusion') || cmd.includes('mélange') || cmd.includes('+')) {
      for (const [style, keywords] of Object.entries(this.STYLE_KEYWORDS)) {
        if (keywords.some(kw => cmd.includes(kw))) {
          styles.push(this.getPresetName(style));
        }
      }
    }

    return styles;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INVENTED STYLE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  public detectInventedStyle(cmd: string): {
    name?: string;
    keywords?: string[];
  } {
    const result: { name?: string; keywords?: string[] } = {};

    // Pattern: "Nouvel archétype : [name]"
    const archetypeMatch = cmd.match(
      /nouvel?\s+(?:archétype|style)\s*:?\s+(.+?)(?:\.|$)/i
    );
    if (archetypeMatch) {
      const matchedName = archetypeMatch[1];
      if (matchedName) {
        result.name = matchedName.trim();
      }
    }

    // Pattern: "Style [name] avec [keywords]"
    const styleMatch = cmd.match(/style\s+(.+?)\s+avec\s+(.+?)(?:\.|$)/i);
    if (styleMatch) {
      const matchedStyleName = styleMatch[1];
      const matchedKeywords = styleMatch[2];
      if (matchedStyleName) {
        result.name = matchedStyleName.trim();
      }
      if (matchedKeywords) {
        result.keywords = matchedKeywords
          .split(/[,+]/)
          .map(kw => kw.trim())
          .filter(kw => kw.length > 0);
      }
    }

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COMMAND TYPE DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  public detectCommandType(cmd: string): {
    isAppearanceCommand: boolean;
    isStyleChange: boolean;
    isOutfitChange: boolean;
    isHairChange: boolean;
    isAccessoryChange: boolean;
    isFusion: boolean;
    isInventedStyle: boolean;
  } {
    const cmdLower = cmd.toLowerCase();

    return {
      isAppearanceCommand:
        cmdLower.includes('apparence') ||
        cmdLower.includes('tenue') ||
        cmdLower.includes('vêtements') ||
        cmdLower.includes('coiffure') ||
        cmdLower.includes('style') ||
        cmdLower.includes('look'),

      isStyleChange:
        cmdLower.includes('passe en') ||
        cmdLower.includes('adopte') ||
        cmdLower.includes('style') ||
        cmdLower.includes('mode'),

      isOutfitChange:
        cmdLower.includes('mets') ||
        cmdLower.includes('porte') ||
        cmdLower.includes('change') ||
        cmdLower.includes('tenue') ||
        cmdLower.includes('vêtements'),

      isHairChange:
        cmdLower.includes('coiffure') ||
        cmdLower.includes('cheveux') ||
        cmdLower.includes('attache') ||
        cmdLower.includes('détache'),

      isAccessoryChange:
        cmdLower.includes('lunettes') ||
        cmdLower.includes('bijoux') ||
        cmdLower.includes('accessoires'),

      isFusion:
        cmdLower.includes('fusion') ||
        cmdLower.includes('mélange') ||
        (cmdLower.includes('+') &&
          (cmdLower.includes('style') || cmdLower.includes('vibe'))),

      isInventedStyle:
        cmdLower.includes('nouvel archétype') ||
        cmdLower.includes('nouveau style') ||
        cmdLower.includes('invente'),
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
export function parseAppearanceCommand(command: string): AppearanceUpdateRequest {
  return styleParser.parse(command);
}

/**
 * Check if a message contains appearance-related commands
 */
export function isAppearanceCommand(message: string): boolean {
  const detection = styleParser.detectCommandType(message);
  return detection.isAppearanceCommand;
}

/**
 * Detect if command is a style fusion request
 */
export function isFusionCommand(message: string): boolean {
  const detection = styleParser.detectCommandType(message);
  return detection.isFusion;
}

/**
 * Extract style names for fusion
 */
export function extractFusionStyles(message: string): string[] {
  return styleParser.detectFusion(message);
}

/**
 * Detect invented style definition
 */
export function detectInventedStyle(message: string): {
  name?: string;
  keywords?: string[];
} {
  return styleParser.detectInventedStyle(message);
}
