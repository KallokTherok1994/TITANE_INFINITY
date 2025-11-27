// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — PBR MATERIAL SYSTEM
//   Physically-Based Rendering materials for avatar (skin, cloth, hair)
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PBRMaterialConfig {
  type: 'skin' | 'cloth' | 'hair' | 'metal' | 'plastic';
  baseColor?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  opacity?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// MATERIAL PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const MATERIAL_PRESETS: Record<string, Partial<PBRMaterialConfig>> = {
  // ─────────────────────────────────────────
  // SKIN (SSS approximation)
  // ─────────────────────────────────────────
  skin: {
    roughness: 0.6,         // Légèrement mat
    metalness: 0.0,         // Non-métal
    normalScale: 0.3,       // Micro-détails légers
  },

  // ─────────────────────────────────────────
  // CLOTH (textile)
  // ─────────────────────────────────────────
  cloth: {
    roughness: 0.8,         // Très mat
    metalness: 0.1,         // Légèrement réfléchissant
    normalScale: 0.5,       // Texture tissu
  },

  // ─────────────────────────────────────────
  // HAIR (cheveux/poils)
  // ─────────────────────────────────────────
  hair: {
    roughness: 0.4,         // Semi-brillant
    metalness: 0.0,         // Non-métal
    normalScale: 0.8,       // Texture forte
  },

  // ─────────────────────────────────────────
  // METAL (accessoires métalliques)
  // ─────────────────────────────────────────
  metal: {
    roughness: 0.2,         // Très brillant
    metalness: 1.0,         // Full métal
    normalScale: 0.2,       // Surface lisse
  },

  // ─────────────────────────────────────────
  // PLASTIC (plastique dur)
  // ─────────────────────────────────────────
  plastic: {
    roughness: 0.3,         // Brillant
    metalness: 0.0,         // Non-métal
    normalScale: 0.1,       // Surface très lisse
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export class PBRMaterialSystem {
  private materials: Map<string, THREE.MeshStandardMaterial> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Create PBR material from config
   */
  public createMaterial(
    name: string,
    config: PBRMaterialConfig
  ): THREE.MeshStandardMaterial {
    // Check if already exists
    const existing = this.materials.get(name);
    if (existing) {
      return existing;
    }

    // Get preset
    const preset = MATERIAL_PRESETS[config.type] || {};

    // Merge config with preset
    const finalConfig = {
      ...preset,
      ...config,
    };

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: finalConfig.baseColor || 0xffffff,
      roughness: finalConfig.roughness ?? 0.5,
      metalness: finalConfig.metalness ?? 0.0,
      emissive: finalConfig.emissive || 0x000000,
      emissiveIntensity: finalConfig.emissiveIntensity ?? 0.0,
      opacity: finalConfig.opacity ?? 1.0,
      transparent: (finalConfig.opacity ?? 1.0) < 1.0,
      side: THREE.FrontSide,
      flatShading: false,
    });

    // Enable normal map if scale > 0
    if (finalConfig.normalScale && finalConfig.normalScale > 0) {
      material.normalScale = new THREE.Vector2(
        finalConfig.normalScale,
        finalConfig.normalScale
      );
    }

    // Store material
    this.materials.set(name, material);

    return material;
  }

  /**
   * Get existing material by name
   */
  public getMaterial(name: string): THREE.MeshStandardMaterial | null {
    return this.materials.get(name) || null;
  }

  /**
   * Create skin material with SSS approximation
   */
  public createSkinMaterial(
    name: string,
    baseColor: THREE.ColorRepresentation = 0xffdbac
  ): THREE.MeshStandardMaterial {
    const material = this.createMaterial(name, {
      type: 'skin',
      baseColor,
      roughness: 0.6,
      metalness: 0.0,
      normalScale: 0.3,
    });

    // SSS approximation: add subtle emissive (simulates light scatter)
    material.emissive = new THREE.Color(baseColor).multiplyScalar(0.05);
    material.emissiveIntensity = 0.1;

    return material;
  }

  /**
   * Create cloth material with texture
   */
  public createClothMaterial(
    name: string,
    baseColor: THREE.ColorRepresentation = 0x6366f1
  ): THREE.MeshStandardMaterial {
    return this.createMaterial(name, {
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
    baseColor: THREE.ColorRepresentation = 0x3d2817
  ): THREE.MeshStandardMaterial {
    return this.createMaterial(name, {
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
  public updateMaterial(
    name: string,
    updates: Partial<PBRMaterialConfig>
  ): void {
    const material = this.materials.get(name);
    if (!material) return;

    if (updates.baseColor !== undefined) {
      material.color.set(updates.baseColor);
    }
    if (updates.roughness !== undefined) {
      material.roughness = updates.roughness;
    }
    if (updates.metalness !== undefined) {
      material.metalness = updates.metalness;
    }
    if (updates.emissive !== undefined) {
      material.emissive.set(updates.emissive);
    }
    if (updates.emissiveIntensity !== undefined) {
      material.emissiveIntensity = updates.emissiveIntensity;
    }
    if (updates.opacity !== undefined) {
      material.opacity = updates.opacity;
      material.transparent = updates.opacity < 1.0;
    }

    material.needsUpdate = true;
  }

  /**
   * Dispose all materials
   */
  public dispose(): void {
    for (const material of this.materials.values()) {
      material.dispose();
    }
    this.materials.clear();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default PBRMaterialSystem;
