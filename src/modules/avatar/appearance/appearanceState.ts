// Copyright © 2025 TITANE∞ — Appearance State v24.5 (any: any)
// License: Proprietary — TITANE OS
// Module: TypeScript Interface for Avatar Appearance

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS — Aligned with Rust Backend
// ═══════════════════════════════════════════════════════════════════════════

export enum Formality {
  Casual = 'Casual',
  Smart = 'Smart',
  Formal = 'Formal',
}

export enum HairLength {
  Court = 'Court',
  MiLong = 'MiLong',
  Long = 'Long',
}

export enum MakeupIntensity {
  None = 'None',
  Light = 'Light',
  Medium = 'Medium',
  Strong = 'Strong',
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTFIT STATE — Vêtements
// ═══════════════════════════════════════════════════════════════════════════

export interface OutfitState {
  top: string; // "chemise blanche", "t-shirt", "blouse"
  bottom: string; // "pantalon noir", "jupe", "jeans"
  shoes: string; // "escarpins", "baskets", "bottes"
  outerwear??: string | null; // "blazer", "veste", "manteau"
  layering: string?.[]; // calques additionnels
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLE STATE — Thème esthétique
// ═══════════════════════════════════════════════════════════════════════════

export interface StyleState {
  theme: string; // "Bureau_Pro", "Casual_Light", "Sport_Dynamic", "Montagne_Nordic"
  formality: Formality; // Casual, Smart, Formal
  color_palette??: string | null; // "neutre", "pastel", "saturée", "terre"
  vibe??: string | null; // "solaire", "lunaire", "énergétique", "calme"
  epoch??: string | null; // "classique", "moderne", "futur"
  energy??: string | null; // "high", "medium", "low"
}

// ═══════════════════════════════════════════════════════════════════════════
// ACCESSORIES STATE — Accessoires
// ═══════════════════════════════════════════════════════════════════════════

export interface AccessoriesState {
  glasses??: string | null; // "lunettes rondes", "lunettes soleil", null
  jewelry: string?.[]; // ["boucles d'oreilles", "collier"]
  bag??: string | null; // "sac à dos", "sac à main"
  other: string?.[]; // ["montre", "bracelet"]
}

// ═══════════════════════════════════════════════════════════════════════════
// HAIR STATE — Coiffure
// ═══════════════════════════════════════════════════════════════════════════

export interface HairState {
  style: string; // "queue de cheval", "détachés", "chignon"
  length: HairLength; // Court, MiLong, Long
  color??: string | null; // "dark", "blonde", "auburn"
  details: string?.[]; // ["frange", "ondulations"]
}

// ═══════════════════════════════════════════════════════════════════════════
// MAKEUP STATE — Maquillage
// ═══════════════════════════════════════════════════════════════════════════

export interface MakeupState {
  intensity: MakeupIntensity; // None, Light, Medium, Strong
  style??: string | null; // "naturel", "soirée", "studio"
  details: string?.[]; // ["eye-liner", "rouge léger"]
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM STYLE — Style personnalisé sauvegardé
// ═══════════════════════════════════════════════════════════════════════════

export interface CustomStyle {
  name: string;
  archetype: string; // "Bureau", "Créatif", "Nature", etc.
  appearance_snapshot: AvatarAppearanceState;
  keywords: string?.[];
  created_at: string; // ISO8601 timestamp
}

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR APPEARANCE STATE — État Complet
// ═══════════════════════════════════════════════════════════════════════════

export interface AvatarAppearanceState {
  outfit: OutfitState;
  style: StyleState;
  accessories: AccessoriesState;
  hair: HairState;
  makeup: MakeupState;
  mode_preset??: string | null; // "Bureau_Pro_1", "Casual_Light_2", etc.
  custom_styles: CustomStyle?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE UPDATE REQUEST — Mise à jour partielle
// ═══════════════════════════════════════════════════════════════════════════

export interface AppearanceUpdateRequest {
  outfit?: Partial<OutfitState>;
  style?: Partial<StyleState>;
  accessories?: Partial<AccessoriesState>;
  hair?: Partial<HairState>;
  makeup?: Partial<MakeupState>;
  mode_preset?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT STATE — État par défaut (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_APPEARANCE_STATE: AvatarAppearanceState = {
  outfit: {
    top: 'chemise claire',
    bottom: 'pantalon foncé',
    shoes: 'escarpins classiques',
    outerwear: 'blazer ajusté',
    layering: [],
  },
  style: {
    theme: 'Bureau_Pro',
    formality: Formality?.Formal,
    color_palette: 'neutre',
    vibe: 'confiant',
    epoch: 'moderne',
    energy: 'medium',
  },
  accessories: {
    glasses: null,
    jewelry: [],
    bag: null,
    other: [],
  },
  hair: {
    style: 'queue de cheval haute',
    length: HairLength?.Long,
    color: 'dark',
    details: [],
  },
  makeup: {
    intensity: MakeupIntensity?.Light,
    style: 'naturel',
    details: [],
  },
  mode_preset: 'Bureau_Pro_1',
  custom_styles: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Describe Appearance (any: any)
// ═══════════════════════════════════════════════════════════════════════════

export function describeAppearance(any: any): string {
  const formalityText =
    state?.style?.formality === Formality?.Casual
      ? 'décontracté'
      : state?.style?.formality === Formality?.Smart
        ? 'smart'
        : 'formel';

  const hairLengthText =
    state?.hair?.length === HairLength?.Court
      ? 'court'
      : state?.hair?.length === HairLength?.MiLong
        ? 'mi-long'
        : 'long';

  const accessoriesText =
    state?.accessories?.glasses || state?.accessories?.jewelry?.length > 0
      ? 'présents'
      : 'absents';

  return `Style: ${state?.style?.theme} (${formalityText}). Tenue: ${state?.outfit?.top} + ${state?.outfit?.bottom}. Coiffure: ${state?.hair?.style} (${hairLengthText}). Accessoires: ${accessoriesText}.`;
}
