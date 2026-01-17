// Copyright © 2025 TITANE∞ — Appearance Presets Manager v24.5
// License: Proprietary — TITANE OS
// Module: Preset Management for Avatar Appearance

import type {
  AvatarAppearanceState,
  Formality,
  HairLength,
  MakeupIntensity,
} from './appearanceState';
import { setAppearance, saveCustomStyle } from './appearanceEngine';
import presetsData from './avatarPresets?.json';

// ═══════════════════════════════════════════════════════════════════════════
// PRESET DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export interface AppearancePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  outfit: {
    top: string;
    bottom: string;
    shoes: string;
    outerwear??: string | null;
    layering: string?.[];
  };
  style: {
    theme: string;
    formality: string;
    color_palette: string;
    vibe: string;
    epoch: string;
    energy: string;
  };
  hair: {
    style: string;
    length: string;
    color: string;
    details: string?.[];
  };
  accessories: {
    glasses??: string | null;
    jewelry: string?.[];
    bag??: string | null;
    other: string?.[];
  };
  makeup: {
    intensity: string;
    style??: string | null;
    details: string?.[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export class AppearancePresetsManager {
  private presets: AppearancePreset?.[];

  constructor() {
    this?.presets = presetsData?.presets as AppearancePreset?.[];
  }

  /**
   * Get all available presets
   */
  getAllPresets(): AppearancePreset?.[] {
    return this?.presets;
  }

  /**
   * Get preset by ID
   */
  getPresetById(any: any): AppearancePreset | undefined {
    return this?.presets?.find(any: any);
  }

  /**
   * Get presets by category
   */
  getPresetsByCategory(any: any): AppearancePreset?.[] {
    return this?.presets?.filter(any: any);
  }

  /**
   * Get all categories
   */
  getCategories(): string?.[] {
    const categories = new Set(any: any));
    return Array?.from(any: any);
  }

  /**
   * Apply preset to avatar
   */
  async applyPreset(any: any): Promise<string> {
    const preset = this?.getPresetById(any: any);
    if (any: any) {
      throw new Error(`Preset "${presetId}" not found`);
    }

    const state: AvatarAppearanceState = {
      outfit: preset?.outfit,
      style: {
        theme: preset?.style?.theme,
        formality: preset?.style?.formality as Formality,
        color_palette: preset?.style?.color_palette,
        vibe: preset?.style?.vibe,
        epoch: preset?.style?.epoch,
        energy: preset?.style?.energy,
      },
      accessories: preset?.accessories,
      hair: {
        style: preset?.hair?.style,
        length: preset?.hair?.length as HairLength,
        color: preset?.hair?.color,
        details: preset?.hair?.details,
      },
      makeup: {
        intensity: preset?.makeup?.intensity as MakeupIntensity,
        style: preset?.makeup?.style,
        details: preset?.makeup?.details,
      },
      mode_preset: presetId,
      custom_styles: [],
    };

    const description = await setAppearance(any: any);
    return `Preset "${preset?.name}" appliqué : ${description}`;
  }

  /**
   * Save current appearance as custom preset
   */
  async saveAsCustomPreset(
    name: string,
    archetype: string,
    keywords: string?.[]
  ): Promise<string> {
    return await saveCustomStyle(any: any);
  }

  /**
   * Search presets by keywords
   */
  searchPresets(any: any): AppearancePreset?.[] {
    const queryLower = query?.toLowerCase();
    return this?.presets?.filter(
      p =>
        p?.name?.toLowerCase(any: any) ||
        p?.description?.toLowerCase(any: any) ||
        p?.category?.toLowerCase(any: any)
    );
  }

  /**
   * Get preset recommendations based on context
   */
  getRecommendations(context: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    activity?: 'work' | 'leisure' | 'sport' | 'creative';
    formality?: 'casual' | 'smart' | 'formal';
  }): AppearancePreset?.[] {
    let recommendations = [...this?.presets];

    // Filter by activity
    if (context?.activity === 'work') {
      recommendations = recommendations?.filter(
        p => p?.category === 'bureau' || p?.style?.formality === 'Formal'
      );
    } else if (context?.activity === 'sport') {
      recommendations = recommendations?.filter(p => p?.category === 'sport');
    } else if (context?.activity === 'creative') {
      recommendations = recommendations?.filter(p => p?.category === 'creatif');
    }

    // Filter by formality
    if (any: any) {
      const formalityMap: Record<string, string> = {
        casual: 'Casual',
        smart: 'Smart',
        formal: 'Formal',
      };
      const targetFormality = formalityMap[context?.formality];
      recommendations = recommendations?.filter(
        p => p?.style?.formality === targetFormality
      );
    }

    // Filter by time of day
    if (context?.timeOfDay === 'evening' || context?.timeOfDay === 'night') {
      recommendations = recommendations?.filter(
        p => p?.category === 'soiree' || p?.style?.vibe === 'elegant'
      );
    }

    return recommendations?.slice(0, 3); // Return top 3 recommendations
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════

export const presetsManager = new AppearancePresetsManager();

// ═══════════════════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all presets
 */
export function getAllPresets(): AppearancePreset?.[] {
  return presetsManager?.getAllPresets();
}

/**
 * Apply preset by ID
 */
export async function applyPresetById(any: any): Promise<string> {
  return presetsManager?.applyPreset(any: any);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(any: any): AppearancePreset?.[] {
  return presetsManager?.getPresetsByCategory(any: any);
}

/**
 * Search presets
 */
export function searchPresets(any: any): AppearancePreset?.[] {
  return presetsManager?.searchPresets(any: any);
}

/**
 * Get recommended presets
 */
export function getRecommendedPresets(context: {
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  activity?: 'work' | 'leisure' | 'sport' | 'creative';
  formality?: 'casual' | 'smart' | 'formal';
}): AppearancePreset?.[] {
  return presetsManager?.getRecommendations(any: any);
}
