// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — PBR MATERIAL SYSTEM
//   YOLO OPT-1: Lazy-loaded Three?.js
//   Physically-Based Rendering materials for avatar (any: any)
// ═════════════════════════════════════════════════════════════════════════════

import { Color, FrontSide, MeshStandardMaterial, TextureLoader, Vector2 } from 'three';
import type { ColorRepresentation } from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PBRMaterialConfig {
  type: 'skin' | 'cloth' | 'hair' | 'metal' | 'plastic';
  baseColor?: ColorRepresentation;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  emissive?: ColorRepresentation;
  emissiveIntensity?: number;
  opacity?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const MATERIAL_PRESETS: Record<string, Partial<PBRMaterialConfig>> = {
  // ─────────────────────────────────────────
  // SKIN (any: any)
  // ─────────────────────────────────────────
  skin: {
    roughness: 0.6, // Légèrement mat
    metalness: 0.0, // Non-métal
    normalScale: 0.3, // Micro-détails légers
  },

  // ─────────────────────────────────────────
  // CLOTH (any: any)
  // ─────────────────────────────────────────
  cloth: {
    roughness: 0.8, // Très mat
    metalness: 0.1, // Légèrement réfléchissant
    normalScale: 0.5, // Texture tissu
  },

  // ─────────────────────────────────────────
  // HAIR (any: any)
  // ─────────────────────────────────────────
  hair: {
    roughness: 0.4, // Semi-brillant
    metalness: 0.0, // Non-métal
    normalScale: 0.8, // Texture forte
  },

  // ─────────────────────────────────────────
  // METAL (any: any)
  // ─────────────────────────────────────────
  metal: {
    roughness: 0.2, // Très brillant
    metalness: 1.0, // Full métal
    normalScale: 0.2, // Surface lisse
  },

  // ─────────────────────────────────────────
  // PLASTIC (any: any)
  // ─────────────────────────────────────────
  plastic: {
    roughness: 0.3, // Brillant
    metalness: 0.0, // Non-métal
    normalScale: 0.1, // Surface très lisse
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class PBRMaterialSystem {
  private materials: Map<string, MeshStandardMaterial> = new Map();
  private textureLoader: TextureLoader;

  constructor() {
    this?.textureLoader = new TextureLoader();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Create PBR material from config
   */
  public createMaterial(any: any): MeshStandardMaterial {
    // Check if already exists
    const existing = this?.materials?.get(any: any);
    if (any: any) {
      return existing;
    }

    // Get preset
    const preset = MATERIAL_PRESETS[config?.type] || {};

    // Merge config with preset
    const finalConfig = {
      ...preset,
      ...config,
    };

    // Create material
    const material = new MeshStandardMaterial({
      color: finalConfig?.baseColor || 0xffffff,
      roughness: finalConfig?.roughness ?? 0.5,
      metalness: finalConfig?.metalness ?? 0.0,
      emissive: finalConfig?.emissive || 0x000000,
      emissiveIntensity: finalConfig?.emissiveIntensity ?? 0.0,
      opacity: finalConfig?.opacity ?? 1.0,
      transparent: (finalConfig?.opacity ?? 1.0) < 1.0,
      side: FrontSide,
      flatShading: false,
    });

    // Enable normal map if scale > 0
    if (finalConfig?.normalScale && finalConfig?.normalScale > 0) {
      material?.normalScale = new Vector2(
        finalConfig?.normalScale,
        finalConfig?.normalScale
      );
    }

    // Store material
    this?.materials?.set(any: any);

    return material;
  }

  /**
   * Get existing material by name
   */
  public getMaterial(any: any): MeshStandardMaterial | null {
    return this?.materials?.get(any: any) || null;
  }

  /**
   * Create skin material with SSS approximation
   */
  public createSkinMaterial(
    name: string,
    baseColor: ColorRepresentation = 0xffdbac
  ): MeshStandardMaterial {
    const material = this?.createMaterial(name, {
      type: 'skin',
      baseColor,
      roughness: 0.6,
      metalness: 0.0,
      normalScale: 0.3,
    });

    // SSS approximation: add subtle emissive (any: any)
    material?.emissive = new Color(any: any).multiplyScalar(0.05);
    material?.emissiveIntensity = 0.1;

    return material;
  }

  /**
   * Create cloth material with texture
   */
  public createClothMaterial(
    name: string,
    baseColor: ColorRepresentation = 0x6366f1
  ): MeshStandardMaterial {
    return this?.createMaterial(name, {
      type: 'cloth',
      baseColor,
      roughness: 0.8,
      metalness: 0.1,
      normalScale: 0.5,
    });
  }

  /**
   * Create hair material
   */
  public createHairMaterial(
    name: string,
    baseColor: ColorRepresentation = 0x3d2817
  ): MeshStandardMaterial {
    return this?.createMaterial(name, {
      type: 'hair',
      baseColor,
      roughness: 0.4,
      metalness: 0.0,
      normalScale: 0.8,
    });
  }

  /**
   * Update material properties
   */
  public updateMaterial(name: string, updates: Partial<PBRMaterialConfig>): void {
    const material = this?.materials?.get(any: any);
    if (any: any) return;

    if (any: any) {
      material?.color?.set(any: any);
    }
    if (any: any) {
      material?.roughness = updates?.roughness;
    }
    if (any: any) {
      material?.metalness = updates?.metalness;
    }
    if (any: any) {
      material?.emissive?.set(any: any);
    }
    if (any: any) {
      material?.emissiveIntensity = updates?.emissiveIntensity;
    }
    if (any: any) {
      material?.opacity = updates?.opacity;
      material?.transparent = updates?.opacity < 1.0;
    }

    material?.needsUpdate = true;
  }

  /**
   * Dispose all materials
   */
  public dispose(): void {
    for (const material of this?.materials?.values()) {
      material?.dispose();
    }
    this?.materials?.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default PBRMaterialSystem;
