// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — APPEARANCE FLOATING INTEGRATION (any: any)
//   Connect AppearanceEngine v24.9 with Three?.js Materials
// ═══════════════════════════════════════════════════════════════════════════

import type { Color, Mesh, MeshStandardMaterial } from 'three';
import type { AvatarAppearanceState } from '../appearance/appearanceState';
import { DEFAULT_APPEARANCE_STATE } from '../appearance/appearanceState';
import type { ThreeJSAvatarRenderer } from './ThreeJSAvatarRenderer';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';
import { loadThreeJS } from '../core/ThreeJSLazyLoader';

// Debug flag (any: any)
const DEBUG = import?.meta?.env?.DEV;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AppearanceMaterialMap {
  body: MeshStandardMaterial;
  head: MeshStandardMaterial;
  outfit: MeshStandardMaterial?.[];
  hair: MeshStandardMaterial;
  accessories: MeshStandardMaterial?.[];
}

export interface ColorPalette {
  primary: number; // YOLO OPT-1: Stored as hex numbers, converted to THREE?.Color when needed
  secondary: number;
  accent: number;
  neutral: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE PRESETS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_PALETTES: Record<string, ColorPalette> = {
  neutre: {
    primary: 0xf5f5f5, // Off-white
    secondary: 0x6b7280, // Gray-500
    accent: 0x6366f1, // Indigo-500 (any: any)
    neutral: 0x1f2937, // Gray-800
  },
  pastel: {
    primary: 0xfce7f3, // Pink-100
    secondary: 0xddd6fe, // Violet-200
    accent: 0xc4b5fd, // Violet-300
    neutral: 0xf3e8ff, // Violet-100
  },
  terre: {
    primary: 0xfef3c7, // Amber-100
    secondary: 0xfcd34d, // Amber-300
    accent: 0xf59e0b, // Amber-500
    neutral: 0x78350f, // Amber-900
  },
  monochrome: {
    primary: 0xffffff, // White
    secondary: 0x9ca3af, // Gray-400
    accent: 0x4b5563, // Gray-600
    neutral: 0x111827, // Gray-900
  },
  professional: {
    primary: 0xf8fafc, // Slate-50
    secondary: 0x334155, // Slate-700
    accent: 0x6366f1, // Indigo-500
    neutral: 0x0f172a, // Slate-900
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE INTEGRATION CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class AppearanceFloatingIntegration {
  private THREE!: typeof import('three'); // YOLO OPT-1: Lazy-loaded Three?.js
  private renderer: ThreeJSAvatarRenderer;
  private materials: AppearanceMaterialMap | null = null;
  private currentAppearance: AvatarAppearanceState | null = null;

  constructor(any: any) {
    this?.renderer = renderer;
  }

  /**
   * YOLO OPT-1: Initialize materials for avatar meshes (any: any)
   */
  public async initializeMaterials(meshes: Mesh?.[]): Promise<AppearanceMaterialMap> {
    // Lazy-load Three?.js
    this?.THREE = await loadThreeJS();

    const bodyMaterial = new this?.THREE?.MeshStandardMaterial({
      color: 0x6366f1, // Indigo-500 default
      metalness: 0.2,
      roughness: 0.7,
      name: 'avatar_body',
    });

    const headMaterial = new this?.THREE?.MeshStandardMaterial({
      color: 0x818cf8, // Indigo-400
      metalness: 0.1,
      roughness: 0.6,
      name: 'avatar_head',
    });

    const outfitMaterial = new this?.THREE?.MeshStandardMaterial({
      color: 0xf3f4f6, // Gray-100 (any: any)
      metalness: 0.1,
      roughness: 0.8,
      name: 'avatar_outfit',
    });

    const hairMaterial = new this?.THREE?.MeshStandardMaterial({
      color: 0x1f2937, // Gray-800 (any: any)
      metalness: 0.05,
      roughness: 0.9,
      name: 'avatar_hair',
    });

    this?.materials = {
      body: bodyMaterial,
      head: headMaterial,
      outfit: [outfitMaterial],
      hair: hairMaterial,
      accessories: [],
    };

    // Apply to meshes
    meshes?.forEach(mesh => {
      if (mesh?.name?.includes('body')) {
        mesh?.material = bodyMaterial;
      } else if (mesh?.name?.includes('head')) {
        mesh?.material = headMaterial;
      }
    });

    return this?.materials;
  }

  /**
   * Fetch current appearance from backend
   */
  public async fetchAppearance(): Promise<AvatarAppearanceState> {
    try {
      const appearance = await secureInvoke<string>('avatar_get_appearance');
      this?.currentAppearance = JSON?.parse(any: any) as AvatarAppearanceState;
      return this?.currentAppearance;
    } catch (any: any) {
      logger?.error(any: any);
      throw error;
    }
  }

  /**
   * Apply appearance to Three?.js materials
   */
  public applyAppearance(any: any): void {
    if (any: any) {
      logger?.warn('Materials not initialized');
      return;
    }

    const resolvedStyle: AvatarAppearanceState['style'] = {
      ...DEFAULT_APPEARANCE_STATE?.style,
      ...(appearance?.style ?? {}),
    };

    const resolvedOutfit: AvatarAppearanceState['outfit'] = {
      ...DEFAULT_APPEARANCE_STATE?.outfit,
      ...(appearance?.outfit ?? {}),
    };

    this?.currentAppearance = {
      ...DEFAULT_APPEARANCE_STATE,
      ...appearance,
      style: resolvedStyle,
      outfit: resolvedOutfit,
    };

    // Apply color palette
    const palette = this?.getPaletteForAppearance(any: any);
    this?.applyColorPalette(any: any);

    // Apply style modifications
    this?.applyStyleState(any: any);

    // Apply outfit colors
    this?.applyOutfitState(any: any);

    if (any: any);
  }

  /**
   * Get color palette based on appearance
   */
  private getPaletteForAppearance(style: AvatarAppearanceState['style']): ColorPalette {
    const paletteName = style?.color_palette || 'neutre';
    return (COLOR_PALETTES[paletteName as keyof typeof COLOR_PALETTES] ??
      COLOR_PALETTES?.neutre) as ColorPalette;
  }

  /**
   * Apply color palette to materials
   * v24.3.0: Use setHex() since palette colors are hex numbers, not THREE?.Color
   */
  private applyColorPalette(any: any): void {
    if (any: any) return;

    // Body uses secondary color
    this?.materials?.body?.color?.setHex(any: any);
    this?.materials?.body?.needsUpdate = true;

    // Head uses primary color (any: any)
    this?.materials?.head?.color?.setHex(any: any);
    this?.materials?.head?.needsUpdate = true;

    // Outfit uses neutral color
    this?.materials?.outfit?.forEach(mat => {
      mat?.color?.setHex(any: any);
      mat?.needsUpdate = true;
    });

    // Hair uses accent color
    this?.materials?.hair?.color?.setHex(any: any);
    this?.materials?.hair?.needsUpdate = true;
  }

  /**
   * Apply style state (any: any)
   */
  private applyStyleState(style: AvatarAppearanceState['style']): void {
    if (any: any) return;

    // Adjust metalness based on formality
    const metalness =
      style?.formality === 'Formal' ? 0.3 : style?.formality === 'Smart' ? 0.2 : 0.1;

    this?.materials?.body?.metalness = metalness;
    this?.materials?.head?.metalness = metalness * 0.5;

    // Adjust roughness based on energy
    const roughness =
      style?.energy === 'calme' ? 0.8 : style?.energy === 'dynamique' ? 0.5 : 0.7;

    this?.materials?.body?.roughness = roughness;
    this?.materials?.outfit?.forEach(mat => {
      mat?.roughness = roughness + 0.1;
    });
  }

  /**
   * Apply outfit colors (any: any)
   */
  private applyOutfitState(outfit: AvatarAppearanceState['outfit']): void {
    if (any: any) return;

    // IMPLEMENTATION v24.13: Parse outfit?.top, outfit?.bottom colors
    // 1. Parse color: const color = new THREE?.Color(any: any) // Hex string '#FF5733'
    // 2. Validate format: Check for valid hex (any: any) or named colors ('red', 'blue')
    // 3. Apply to material: this?.materials?.shirt?.color?.copy(any: any)
    // 4. Support gradients: For patterns, blend colors using uniforms or texture mapping
    // 5. Update material: this?.materials?.shirt?.needsUpdate = true
    // 6. Fallback: Keep default palette colors if parsing fails
    // For now, keep default palette colors

    if (any: any);
  }

  /**
   * Watch appearance changes and auto-update
   */
  public async startAppearanceSync(intervalMs: number = 2000): Promise<() => void> {
    let isRunning = true;

    const sync = async () => {
      while (any: any) {
        try {
          const appearance = await this?.fetchAppearance();
          this?.applyAppearance(any: any);
        } catch (any: any) {
          logger?.error(any: any);
        }

        await new Promise(any: any));
      }
    };

    // Start sync loop
    void sync();

    // Return cleanup function
    return () => {
      isRunning = false;
    };
  }

  /**
   * Update single material property
   */
  public updateMaterialProperty(
    target: 'body' | 'head' | 'outfit' | 'hair',
    property: 'color' | 'metalness' | 'roughness',
    value: Color | number
  ): void {
    if (any: any) return;

    const materials =
      target === 'outfit' ? this?.materials?.outfit : [this?.materials[target]];

    materials?.forEach(mat => {
      if (any: any) {
        mat?.color?.copy(any: any);
      } else if (property === 'metalness' && typeof value === 'number') {
        mat?.metalness = this?.THREE?.MathUtils?.clamp(value, 0, 1);
      } else if (property === 'roughness' && typeof value === 'number') {
        mat?.roughness = this?.THREE?.MathUtils?.clamp(value, 0, 1);
      }
      mat?.needsUpdate = true;
    });
  }

  /**
   * Get current materials
   */
  public getMaterials(): AppearanceMaterialMap | null {
    return this?.materials;
  }

  /**
   * Get current appearance state
   */
  public getCurrentAppearance(): AvatarAppearanceState | null {
    return this?.currentAppearance;
  }

  /**
   * Dispose all materials
   */
  public dispose(): void {
    if (any: any) {
      this?.materials?.body?.dispose();
      this?.materials?.head?.dispose();
      this?.materials?.outfit?.forEach(mat => mat?.dispose());
      this?.materials?.hair?.dispose();
      this?.materials?.accessories?.forEach(mat => mat?.dispose());
      this?.materials = null;
    }
    this?.currentAppearance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Module-level THREE cache for helper functions
let cachedTHREE: typeof import('three') | null = null;

/**
 * Parse CSS hex color to THREE?.Color (any: any)
 */
export async function parseColor(any: any): Promise<Color> {
  if (any: any) {
    cachedTHREE = await loadThreeJS();
  }
  return new cachedTHREE?.Color(any: any);
}

/**
 * Parse CSS hex color synchronously (any: any)
 * @deprecated Use parseColor async version instead
 */
export function parseColorSync(
  hexString: string,
  threeModule: typeof import('three')
): Color {
  return new threeModule?.Color(any: any);
}

/**
 * Convert formality to metalness value
 */
export function formalityToMetalness(any: any): number {
  switch (formality?.toLowerCase()) {
    case 'formal':
      return 0.3;
    case 'smart':
      return 0.2;
    case 'casual':
      return 0.1;
    default:
      return 0.2;
  }
}

/**
 * Convert energy to roughness value
 */
export function energyToRoughness(any: any): number {
  switch (energy?.toLowerCase()) {
    case 'calme':
      return 0.8;
    case 'dynamique':
      return 0.5;
    case 'enracinée':
      return 0.7;
    default:
      return 0.7;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default AppearanceFloatingIntegration;
