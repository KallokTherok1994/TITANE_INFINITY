// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v24.12 — APPEARANCE FLOATING INTEGRATION
//   Connect AppearanceEngine v24.9 with Three.js Materials
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import type { AvatarAppearanceState } from '../appearance/appearanceState';
import type { ThreeJSAvatarRenderer } from './ThreeJSAvatarRenderer';
import { invoke } from '@tauri-apps/api/core';

// Debug flag (disable in production)
const DEBUG = import.meta.env.DEV;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AppearanceMaterialMap {
  body: THREE.MeshStandardMaterial;
  head: THREE.MeshStandardMaterial;
  outfit: THREE.MeshStandardMaterial[];
  hair: THREE.MeshStandardMaterial;
  accessories: THREE.MeshStandardMaterial[];
}

export interface ColorPalette {
  primary: THREE.Color;
  secondary: THREE.Color;
  accent: THREE.Color;
  neutral: THREE.Color;
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_PALETTES: Record<string, ColorPalette> = {
  neutre: {
    primary: new THREE.Color(0xf5f5f5), // Off-white
    secondary: new THREE.Color(0x6b7280), // Gray-500
    accent: new THREE.Color(0x6366f1), // Indigo-500 (TITANE)
    neutral: new THREE.Color(0x1f2937), // Gray-800
  },
  pastel: {
    primary: new THREE.Color(0xfce7f3), // Pink-100
    secondary: new THREE.Color(0xddd6fe), // Violet-200
    accent: new THREE.Color(0xc4b5fd), // Violet-300
    neutral: new THREE.Color(0xf3e8ff), // Violet-100
  },
  terre: {
    primary: new THREE.Color(0xfef3c7), // Amber-100
    secondary: new THREE.Color(0xfcd34d), // Amber-300
    accent: new THREE.Color(0xf59e0b), // Amber-500
    neutral: new THREE.Color(0x78350f), // Amber-900
  },
  monochrome: {
    primary: new THREE.Color(0xffffff), // White
    secondary: new THREE.Color(0x9ca3af), // Gray-400
    accent: new THREE.Color(0x4b5563), // Gray-600
    neutral: new THREE.Color(0x111827), // Gray-900
  },
  professional: {
    primary: new THREE.Color(0xf8fafc), // Slate-50
    secondary: new THREE.Color(0x334155), // Slate-700
    accent: new THREE.Color(0x6366f1), // Indigo-500
    neutral: new THREE.Color(0x0f172a), // Slate-900
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// APPEARANCE INTEGRATION CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class AppearanceFloatingIntegration {
  private renderer: ThreeJSAvatarRenderer;
  private materials: AppearanceMaterialMap | null = null;
  private currentAppearance: AvatarAppearanceState | null = null;

  constructor(renderer: ThreeJSAvatarRenderer) {
    this.renderer = renderer;
  }

  /**
   * Initialize materials for avatar meshes
   */
  public initializeMaterials(meshes: THREE.Mesh[]): AppearanceMaterialMap {
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x6366f1, // Indigo-500 default
      metalness: 0.2,
      roughness: 0.7,
      name: 'avatar_body',
    });

    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0x818cf8, // Indigo-400
      metalness: 0.1,
      roughness: 0.6,
      name: 'avatar_head',
    });

    const outfitMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f4f6, // Gray-100 (default outfit)
      metalness: 0.1,
      roughness: 0.8,
      name: 'avatar_outfit',
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2937, // Gray-800 (default hair)
      metalness: 0.05,
      roughness: 0.9,
      name: 'avatar_hair',
    });

    this.materials = {
      body: bodyMaterial,
      head: headMaterial,
      outfit: [outfitMaterial],
      hair: hairMaterial,
      accessories: [],
    };

    // Apply to meshes
    meshes.forEach((mesh) => {
      if (mesh.name.includes('body')) {
        mesh.material = bodyMaterial;
      } else if (mesh.name.includes('head')) {
        mesh.material = headMaterial;
      }
    });

    return this.materials;
  }

  /**
   * Fetch current appearance from backend
   */
  public async fetchAppearance(): Promise<AvatarAppearanceState> {
    try {
      const appearance = await invoke<string>('avatar_get_appearance');
      this.currentAppearance = JSON.parse(appearance) as AvatarAppearanceState;
      return this.currentAppearance;
    } catch (error) {
      console.error('[AppearanceFloatingIntegration] Fetch failed:', error);
      throw error;
    }
  }

  /**
   * Apply appearance to Three.js materials
   */
  public applyAppearance(appearance: AvatarAppearanceState): void {
    if (!this.materials) {
      console.warn('[AppearanceFloatingIntegration] Materials not initialized');
      return;
    }

    this.currentAppearance = appearance;

    // Apply color palette
    const palette = this.getPaletteForAppearance(appearance);
    this.applyColorPalette(palette);

    // Apply style modifications
    this.applyStyleState(appearance.style);

    // Apply outfit colors
    this.applyOutfitState(appearance.outfit);

    if (DEBUG) console.log('[AppearanceFloatingIntegration] Appearance applied:', appearance.mode_preset);
  }

  /**
   * Get color palette based on appearance
   */
  private getPaletteForAppearance(appearance: AvatarAppearanceState): ColorPalette {
    const paletteName = appearance.style.color_palette || 'neutre';
    return COLOR_PALETTES[paletteName] || COLOR_PALETTES.neutre;
  }

  /**
   * Apply color palette to materials
   */
  private applyColorPalette(palette: ColorPalette): void {
    if (!this.materials) return;

    // Body uses secondary color
    this.materials.body.color.copy(palette.secondary);
    this.materials.body.needsUpdate = true;

    // Head uses primary color (lighter)
    this.materials.head.color.copy(palette.primary);
    this.materials.head.needsUpdate = true;

    // Outfit uses neutral color
    this.materials.outfit.forEach((mat) => {
      mat.color.copy(palette.neutral);
      mat.needsUpdate = true;
    });

    // Hair uses accent color
    this.materials.hair.color.copy(palette.accent);
    this.materials.hair.needsUpdate = true;
  }

  /**
   * Apply style state (formality, vibe, energy)
   */
  private applyStyleState(style: AvatarAppearanceState['style']): void {
    if (!this.materials) return;

    // Adjust metalness based on formality
    const metalness = style.formality === 'Formal' ? 0.3 :
                      style.formality === 'Smart' ? 0.2 : 0.1;

    this.materials.body.metalness = metalness;
    this.materials.head.metalness = metalness * 0.5;

    // Adjust roughness based on energy
    const roughness = style.energy === 'calme' ? 0.8 :
                      style.energy === 'dynamique' ? 0.5 : 0.7;

    this.materials.body.roughness = roughness;
    this.materials.outfit.forEach((mat) => {
      mat.roughness = roughness + 0.1;
    });
  }

  /**
   * Apply outfit colors (simplified for now)
   */
  private applyOutfitState(outfit: AvatarAppearanceState['outfit']): void {
    if (!this.materials) return;

    // TODO v24.13: Parse outfit.top, outfit.bottom colors
    // For now, keep default palette colors

    if (DEBUG) console.log('[AppearanceFloatingIntegration] Outfit applied:', outfit.top, outfit.bottom);
  }

  /**
   * Watch appearance changes and auto-update
   */
  public async startAppearanceSync(intervalMs: number = 2000): Promise<() => void> {
    let isRunning = true;

    const sync = async () => {
      while (isRunning) {
        try {
          const appearance = await this.fetchAppearance();
          this.applyAppearance(appearance);
        } catch (error) {
          console.error('[AppearanceFloatingIntegration] Sync error:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
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
    value: THREE.Color | number
  ): void {
    if (!this.materials) return;

    const materials = target === 'outfit' ? this.materials.outfit : [this.materials[target]];

    materials.forEach((mat) => {
      if (property === 'color' && value instanceof THREE.Color) {
        mat.color.copy(value);
      } else if (property === 'metalness' && typeof value === 'number') {
        mat.metalness = THREE.MathUtils.clamp(value, 0, 1);
      } else if (property === 'roughness' && typeof value === 'number') {
        mat.roughness = THREE.MathUtils.clamp(value, 0, 1);
      }
      mat.needsUpdate = true;
    });
  }

  /**
   * Get current materials
   */
  public getMaterials(): AppearanceMaterialMap | null {
    return this.materials;
  }

  /**
   * Get current appearance state
   */
  public getCurrentAppearance(): AvatarAppearanceState | null {
    return this.currentAppearance;
  }

  /**
   * Dispose all materials
   */
  public dispose(): void {
    if (this.materials) {
      this.materials.body.dispose();
      this.materials.head.dispose();
      this.materials.outfit.forEach((mat) => mat.dispose());
      this.materials.hair.dispose();
      this.materials.accessories.forEach((mat) => mat.dispose());
      this.materials = null;
    }
    this.currentAppearance = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse CSS hex color to THREE.Color
 */
export function parseColor(hexString: string): THREE.Color {
  return new THREE.Color(hexString);
}

/**
 * Convert formality to metalness value
 */
export function formalityToMetalness(formality: string): number {
  switch (formality.toLowerCase()) {
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
export function energyToRoughness(energy: string): number {
  switch (energy.toLowerCase()) {
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
