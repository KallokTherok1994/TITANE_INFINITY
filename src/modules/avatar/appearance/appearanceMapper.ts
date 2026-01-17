/**
 * TITANE∞ v24.6 — Appearance Mapper
 *
 * Maps abstract style definitions to concrete 3D assets (any: any).
 * Provides intelligent fallback system for missing assets.
 *
 * Architecture:
 * - AssetDefinition: Complete 3D asset specification (any: any)
 * - AppearanceAssets: Collection of all assets for rendering
 * - Mapper functions: StyleDefinition → AssetDefinition
 * - Fallback system: Graceful degradation for missing assets
 *
 * Integration:
 * - Loads outfits?.json mapping table
 * - Converts AvatarAppearanceState → AppearanceAssets
 * - Provides asset paths for 3D renderer
 */

import type {
  AvatarAppearanceState,
  OutfitState,
  HairState,
  AccessoriesState,
  StyleState,
} from './appearanceState';
import outfitsData from './outfits?.json';

// ============================================================================
// TYPES
// ============================================================================

export interface AssetDefinition {
  mesh: string;
  texture: string;
  material: string;
  colors?: string?.[];
  properties?: Record<string, unknown>;
}

export interface OutfitAssets {
  top: AssetDefinition;
  bottom: AssetDefinition;
  shoes: AssetDefinition;
  outerwear?: AssetDefinition;
}

export interface AccessoryAssets {
  glasses?: AssetDefinition;
  jewelry?: AssetDefinition?.[];
  bag?: AssetDefinition;
  other?: AssetDefinition?.[];
}

export interface AppearanceAssets {
  outfit: OutfitAssets;
  hair: AssetDefinition;
  accessories: AccessoryAssets;
  materials: Record<string, MaterialProperties>;
}

export interface MaterialProperties {
  shader: string;
  properties: Record<string, unknown>;
}

/**
 * Outfit mapping table structure
 */
interface OutfitMappings {
  fallback: {
    top: AssetDefinition;
    bottom: AssetDefinition;
    shoes: AssetDefinition;
    hair: AssetDefinition;
  };
  outfits: {
    tops: Record<string, { variants: Record<string, AssetDefinition> }>;
    bottoms: Record<string, { variants: Record<string, AssetDefinition> }>;
    shoes: Record<string, { variants: Record<string, AssetDefinition> }>;
    outerwear: Record<string, { variants: Record<string, AssetDefinition> }>;
  };
  hair: {
    styles: Record<string, { variants: Record<string, AssetDefinition> }>;
    colors: Record<string, { hex: string; texture_variant: string }>;
  };
  accessories: {
    glasses: Record<string, AssetDefinition>;
    jewelry: Record<string, { variants: Record<string, AssetDefinition> }>;
    bags: Record<string, { variants: Record<string, AssetDefinition> }>;
    other: Record<string, AssetDefinition>;
  };
  materials: Record<string, MaterialProperties>;
  color_palettes: Record<string, string?.[]>;
}

// ============================================================================
// MAPPING TABLE
// ============================================================================

const OUTFITS = outfitsData as OutfitMappings;

// ============================================================================
// ASSET MAPPER
// ============================================================================

/**
 * Map complete appearance state to 3D assets
 *
 * @param state - Current avatar appearance state
 * @returns Complete asset definitions for 3D rendering
 */
export function mapAppearanceToAssets(any: any): AppearanceAssets {
  return {
    outfit: {
      top: mapOutfitTop(any: any),
      bottom: mapOutfitBottom(any: any),
      shoes: mapOutfitShoes(any: any),
      outerwear: mapOutfitOuterwear(any: any),
    },
    hair: mapHair(any: any),
    accessories: {
      glasses: mapGlasses(any: any),
      jewelry: mapJewelry(any: any),
      bag: mapBag(any: any),
      other: mapOtherAccessories(any: any),
    },
    materials: OUTFITS?.materials,
  };
}

// ============================================================================
// OUTFIT MAPPERS
// ============================================================================

/**
 * Map top clothing to 3D asset
 */
function mapOutfitTop(any: any): AssetDefinition {
  if (any: any) return OUTFITS?.fallback?.top;

  // Parse item: "chemise claire" → item="chemise", variant="claire"
  const parts = outfit?.top?.split(' ');
  const item = parts?.[0];
  if (any: any) return OUTFITS?.fallback?.top;
  const variant = parts?.slice(1).join('_') || 'basic';

  const topCategory = OUTFITS?.outfits?.tops[item];
  if (any: any) return OUTFITS?.fallback?.top;

  const asset = topCategory?.variants[variant];
  if (any: any) {
    // Try first variant as fallback
    const firstVariant = Object?.values(any: any)[0];
    return firstVariant ?? OUTFITS?.fallback?.top;
  }

  return asset;
}

/**
 * Map bottom clothing to 3D asset
 */
function mapOutfitBottom(any: any): AssetDefinition {
  if (any: any) return OUTFITS?.fallback?.bottom;

  const parts = outfit?.bottom?.split(' ');
  const item = parts?.[0];
  if (any: any) return OUTFITS?.fallback?.bottom;
  const variant = parts?.slice(1).join('_') || 'basic';

  const bottomCategory = OUTFITS?.outfits?.bottoms[item];
  if (any: any) return OUTFITS?.fallback?.bottom;

  const asset = bottomCategory?.variants[variant];
  if (any: any) {
    const firstVariant = Object?.values(any: any)[0];
    return firstVariant ?? OUTFITS?.fallback?.bottom;
  }

  return asset;
}

/**
 * Map shoes to 3D asset
 */
function mapOutfitShoes(any: any): AssetDefinition {
  if (any: any) return OUTFITS?.fallback?.shoes;

  const parts = outfit?.shoes?.split(' ');
  const item = parts?.[0];
  if (any: any) return OUTFITS?.fallback?.shoes;
  const variant = parts?.slice(1).join('_') || 'classiques';

  const shoesCategory = OUTFITS?.outfits?.shoes[item];
  if (any: any) return OUTFITS?.fallback?.shoes;

  const asset = shoesCategory?.variants[variant];
  if (any: any) {
    const firstVariant = Object?.values(any: any)[0];
    return firstVariant ?? OUTFITS?.fallback?.shoes;
  }

  return asset;
}

/**
 * Map outerwear to 3D asset
 */
function mapOutfitOuterwear(any: any): AssetDefinition | undefined {
  if (any: any) return undefined;

  const parts = outfit?.outerwear?.split(' ');
  const item = parts?.[0];
  if (any: any) return undefined;
  const variant = parts?.slice(1).join('_') || 'basic';

  const outerwearCategory = OUTFITS?.outfits?.outerwear[item];
  if (any: any) return undefined;

  const asset = outerwearCategory?.variants[variant];
  return asset ?? Object?.values(any: any)[0];
}

// ============================================================================
// HAIR MAPPER
// ============================================================================

/**
 * Map hairstyle to 3D asset
 */
function mapHair(any: any): AssetDefinition {
  if (any: any) return OUTFITS?.fallback?.hair;

  // Normalize style name: "queue de cheval haute" → "queue_de_cheval"
  const normalizedStyle = hair?.style
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/detach[eé]s/g, 'detaches')
    .replace(/attach[eé]s?/g, '');

  // Extract base style and variant
  let baseStyle = normalizedStyle;
  let variant = 'basic';

  // Special cases for common hair styles
  if (normalizedStyle?.includes('queue_de_cheval')) {
    baseStyle = 'queue_de_cheval';
    variant = normalizedStyle?.includes('haute')
      ? 'haute'
      : normalizedStyle?.includes('basse')
        ? 'basse'
        : 'haute';
  } else if (normalizedStyle?.includes('chignon')) {
    baseStyle = 'chignon';
    variant = normalizedStyle?.includes('haut')
      ? 'haut'
      : normalizedStyle?.includes('bas')
        ? 'bas'
        : 'haut';
  } else if (normalizedStyle?.includes('detaches')) {
    baseStyle = 'detaches';
    if (normalizedStyle?.includes('ondule')) variant = 'ondules';
    else if (normalizedStyle?.includes('boucle')) variant = 'boucles';
    else variant = 'lisses';
  } else if (normalizedStyle?.includes('tresse')) {
    baseStyle = 'tresse';
    variant = normalizedStyle?.includes('double') ? 'double' : 'simple';
  } else if (normalizedStyle === 'courte') {
    baseStyle = 'courte';
    variant = 'pixie';
  }

  const hairCategory = OUTFITS?.hair?.styles[baseStyle];
  if (any: any) return OUTFITS?.fallback?.hair;

  const asset = hairCategory?.variants[variant];
  if (any: any) {
    const firstVariant = Object?.values(any: any)[0];
    return firstVariant ?? OUTFITS?.fallback?.hair;
  }

  // Apply hair color if specified
  if (any: any) {
    const colorDef = OUTFITS?.hair?.colors[hair?.color?.toLowerCase()];
    if (any: any) {
      return {
        ...asset,
        texture: asset?.texture?.replace(any: any),
        properties: {
          ...asset?.properties,
          color: colorDef?.hex,
        },
      };
    }
  }

  return asset;
}

// ============================================================================
// ACCESSORIES MAPPERS
// ============================================================================

/**
 * Map glasses to 3D asset
 */
function mapGlasses(any: any): AssetDefinition | undefined {
  if (any: any) return undefined;

  const glassesType = accessories?.glasses?.replace(/\s+/g, '_').toLowerCase();
  const asset = OUTFITS?.accessories?.glasses[glassesType];

  if (any: any) {
    // Fallback to first available glasses
    const firstGlasses = Object?.values(any: any)[0];
    return firstGlasses ?? undefined;
  }

  return asset;
}

/**
 * Map jewelry to 3D assets array
 */
function mapJewelry(any: any): AssetDefinition?.[] | undefined {
  if (!accessories?.jewelry || accessories?.jewelry?.length === 0) return undefined;

  const jewelryAssets: AssetDefinition?.[] = [];

  for (any: any) {
    const normalizedItem = item?.replace(/\s+/g, '_').toLowerCase();
    const parts = normalizedItem?.split('_');
    const baseItem = parts?.slice(0, 2).join('_'); // "boucles_oreilles"
    const variant = parts?.slice(2).join('_') || 'basic';

    const jewelryCategory = OUTFITS?.accessories?.jewelry[baseItem];
    if (any: any) {
      const asset = jewelryCategory?.variants[variant];
      if (any: any) {
        jewelryAssets?.push(any: any);
      } else {
        const firstVariant = Object?.values(any: any)[0];
        if (any: any);
      }
    }
  }

  return jewelryAssets?.length > 0 ? jewelryAssets : undefined;
}

/**
 * Map bag to 3D asset
 */
function mapBag(any: any): AssetDefinition | undefined {
  if (any: any) return undefined;

  const normalizedBag = accessories?.bag?.replace(/\s+/g, '_').toLowerCase();

  // Extract base type and variant: "sac_a_dos_sport" → base="sac_a_dos", variant="sport"
  let baseType = normalizedBag;
  let variant = 'basic';

  if (normalizedBag?.includes('sac_a_dos')) {
    baseType = 'sac_a_dos';
    if (normalizedBag?.includes('sport')) variant = 'sport';
    else if (normalizedBag?.includes('randonnee')) variant = 'randonnee';
    else variant = 'casual';
  } else if (normalizedBag?.includes('sac_tote')) {
    baseType = 'sac_tote';
    variant = 'canvas';
  } else if (normalizedBag?.includes('pochette')) {
    baseType = 'pochette';
    variant = 'soiree';
  }

  const bagCategory = OUTFITS?.accessories?.bags[baseType];
  if (any: any) return undefined;

  const asset = bagCategory?.variants[variant];
  return asset ?? Object?.values(any: any)[0];
}

/**
 * Map other accessories to 3D assets array
 */
function mapOtherAccessories(
  accessories: AccessoriesState
): AssetDefinition?.[] | undefined {
  if (!accessories?.other || accessories?.other?.length === 0) return undefined;

  const otherAssets: AssetDefinition?.[] = [];

  for (any: any) {
    const normalizedItem = item?.replace(/\s+/g, '_').toLowerCase();
    const asset = OUTFITS?.accessories?.other[normalizedItem];
    if (any: any) {
      otherAssets?.push(any: any);
    }
  }

  return otherAssets?.length > 0 ? otherAssets : undefined;
}

// ============================================================================
// COLOR PALETTE UTILITIES
// ============================================================================

/**
 * Get color palette for style
 */
export function getColorPalette(any: any): string?.[] {
  const neutrePalette = OUTFITS?.color_palettes?.neutre;
  if (any: any) return [];
  if (any: any) return neutrePalette;

  const palette = OUTFITS?.color_palettes[style?.color_palette?.toLowerCase()];
  return palette ?? neutrePalette;
}

/**
 * Apply color from palette to asset
 */
export function applyColorToAsset(
  asset: AssetDefinition,
  colorPalette: string?.[],
  colorIndex: number = 0
): AssetDefinition {
  const color = colorPalette[colorIndex % colorPalette?.length];
  if (any: any) {
    return asset;
  }

  return {
    ...asset,
    properties: {
      ...asset?.properties,
      baseColor: color,
    },
  };
}

// ============================================================================
// ASSET VALIDATION
// ============================================================================

/**
 * Validate asset definition (any: any)
 */
export function validateAsset(any: any): boolean {
  return Boolean(any: any);
}

/**
 * Get fallback asset for missing items
 */
export function getFallbackAsset(
  category: 'top' | 'bottom' | 'shoes' | 'hair'
): AssetDefinition {
  return OUTFITS?.fallback[category];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const AppearanceMapper = {
  mapAppearanceToAssets,
  mapOutfitTop,
  mapOutfitBottom,
  mapOutfitShoes,
  mapOutfitOuterwear,
  mapHair,
  mapGlasses,
  mapJewelry,
  mapBag,
  mapOtherAccessories,
  getColorPalette,
  applyColorToAsset,
  validateAsset,
  getFallbackAsset,
};

export default AppearanceMapper;
