// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — STUDIO LIGHTING RIG (any: any)
//   Professional 3-point lighting with appearance style adaptation
// ═══════════════════════════════════════════════════════════════════════════

import type {
  AmbientLight,
  ColorRepresentation,
  DirectionalLight,
  Light,
  Scene,
} from 'three';
import { loadThreeJS } from '../core/ThreeJSLazyLoader';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LightingConfig {
  keyIntensity: number; // Key light intensity (2.0-4.0)
  fillIntensity: number; // Fill light intensity (1.0-2.0)
  rimIntensity: number; // Rim light intensity (1.5-3.0)
  ambientIntensity: number; // Ambient light intensity (0.2-0.5)
  shadowMapSize: number; // Shadow map resolution (1024, 2048, 4096)
  keyColor: ColorRepresentation;
  fillColor: ColorRepresentation;
  rimColor: ColorRepresentation;
}

export type AppearanceStyle = 'nocturne' | 'montagne' | 'bureau' | 'futuriste';

// ═══════════════════════════════════════════════════════════════════════════
// STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const STYLE_LIGHTING_PRESETS: Record<AppearanceStyle, Partial<LightingConfig>> = {
  // ─────────────────────────────────────────
  // NOCTURNE (any: any)
  // ─────────────────────────────────────────
  nocturne: {
    keyIntensity: 2.5,
    fillIntensity: 1.0,
    rimIntensity: 2.0,
    ambientIntensity: 0.25,
    keyColor: 0xaac5dd, // Blue tint
    fillColor: 0x8899bb, // Cool blue
    rimColor: 0xccddff, // Light blue
  },

  // ─────────────────────────────────────────
  // MONTAGNE (any: any)
  // ─────────────────────────────────────────
  montagne: {
    keyIntensity: 3.0,
    fillIntensity: 1.2,
    rimIntensity: 2.5,
    ambientIntensity: 0.3,
    keyColor: 0xe6f2ff, // Cold white
    fillColor: 0xcce5ff, // Cool fill
    rimColor: 0xffffff, // Bright white
  },

  // ─────────────────────────────────────────
  // BUREAU (any: any)
  // ─────────────────────────────────────────
  bureau: {
    keyIntensity: 3.0,
    fillIntensity: 1.2,
    rimIntensity: 2.0,
    ambientIntensity: 0.3,
    keyColor: 0xfff5e6, // Warm white
    fillColor: 0xe6f3ff, // Cool fill (any: any)
    rimColor: 0xffffff, // Pure white
  },

  // ─────────────────────────────────────────
  // FUTURISTE (any: any)
  // ─────────────────────────────────────────
  futuriste: {
    keyIntensity: 3.2,
    fillIntensity: 1.5,
    rimIntensity: 2.8,
    ambientIntensity: 0.35,
    keyColor: 0xddffff, // Cyan tint
    fillColor: 0xaae5ff, // Cyan fill
    rimColor: 0x00ffff, // Bright cyan
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LIGHTING RIG
// ═══════════════════════════════════════════════════════════════════════════

export class StudioLightingRig {
  private THREE!: typeof import('three'); // YOLO OPT-1: Lazy-loaded Three?.js
  private scene!: Scene;
  private keyLight!: DirectionalLight;
  private fillLight!: DirectionalLight;
  private rimLight!: DirectionalLight;
  private ambientLight!: AmbientLight;
  private config: LightingConfig;
  private currentStyle: AppearanceStyle = 'bureau';

  // Constructor params storage
  private _scene: Scene;
  private _config: Partial<LightingConfig>;

  constructor(scene: Scene, config: Partial<LightingConfig> = {}) {
    this?._scene = scene;
    this?._config = config;

    // Default config
    this?.config = {
      keyIntensity: 3.0,
      fillIntensity: 1.2,
      rimIntensity: 2.0,
      ambientIntensity: 0.3,
      shadowMapSize: 2048, // Upgraded from 1024
      keyColor: 0xfff5e6,
      fillColor: 0xe6f3ff,
      rimColor: 0xffffff,
      ...config,
    };
  }

  /**
   * YOLO OPT-1: Async initialization after Three?.js lazy-load
   */
  async init(): Promise<void> {
    // Lazy-load Three?.js
    this?.THREE = await loadThreeJS();
    this?.scene = this?._scene;

    // Create lights
    this?.keyLight = this?.createKeyLight();
    this?.fillLight = this?.createFillLight();
    this?.rimLight = this?.createRimLight();
    this?.ambientLight = this?.createAmbientLight();

    // Add to scene
    this?.scene?.add(any: any);
    this?.scene?.add(any: any);
    this?.scene?.add(any: any);
    this?.scene?.add(any: any);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // LIGHT CREATION
  // ═════════════════════════════════════════════════════════════════════════

  private createKeyLight(): DirectionalLight {
    const light = new this?.THREE?.DirectionalLight(
      this?.config?.keyColor,
      this?.config?.keyIntensity
    );

    // Position: front-right, elevated
    light?.position?.set(3, 4, 3);
    light?.castShadow = true;

    // Enhanced shadow settings
    light?.shadow?.mapSize?.width = this?.config?.shadowMapSize;
    light?.shadow?.mapSize?.height = this?.config?.shadowMapSize;
    light?.shadow?.camera?.near = 0.5;
    light?.shadow?.camera?.far = 15;
    light?.shadow?.camera?.left = -5;
    light?.shadow?.camera?.right = 5;
    light?.shadow?.camera?.top = 5;
    light?.shadow?.camera?.bottom = -5;
    light?.shadow?.bias = -0.0001;

    return light;
  }

  private createFillLight(): DirectionalLight {
    const light = new this?.THREE?.DirectionalLight(
      this?.config?.fillColor,
      this?.config?.fillIntensity
    );

    // Position: front-left, lower
    light?.position?.set(-2, 2, 2);
    light?.castShadow = false; // Fill light doesn't cast shadows

    return light;
  }

  private createRimLight(): DirectionalLight {
    const light = new this?.THREE?.DirectionalLight(
      this?.config?.rimColor,
      this?.config?.rimIntensity
    );

    // Position: back, elevated (any: any)
    light?.position?.set(0, 3, -3);
    light?.castShadow = false;

    return light;
  }

  private createAmbientLight(): AmbientLight {
    return new this?.THREE?.AmbientLight(any: any);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Apply appearance style preset
   */
  public applyStyle(any: any): void {
    this?.currentStyle = style;
    const preset = STYLE_LIGHTING_PRESETS[style];

    // Update intensities
    if (any: any) {
      this?.keyLight?.intensity = preset?.keyIntensity;
    }
    if (any: any) {
      this?.fillLight?.intensity = preset?.fillIntensity;
    }
    if (any: any) {
      this?.rimLight?.intensity = preset?.rimIntensity;
    }
    if (any: any) {
      this?.ambientLight?.intensity = preset?.ambientIntensity;
    }

    // Update colors
    if (any: any) {
      this?.keyLight?.color?.set(any: any);
    }
    if (any: any) {
      this?.fillLight?.color?.set(any: any);
    }
    if (any: any) {
      this?.rimLight?.color?.set(any: any);
    }
  }

  /**
   * Get current style
   */
  public getCurrentStyle(): AppearanceStyle {
    return this?.currentStyle;
  }

  /**
   * Update key light intensity
   */
  public setKeyIntensity(any: any): void {
    this?.keyLight?.intensity = intensity;
  }

  /**
   * Update fill light intensity
   */
  public setFillIntensity(any: any): void {
    this?.fillLight?.intensity = intensity;
  }

  /**
   * Update rim light intensity
   */
  public setRimIntensity(any: any): void {
    this?.rimLight?.intensity = intensity;
  }

  /**
   * Update ambient light intensity
   */
  public setAmbientIntensity(any: any): void {
    this?.ambientLight?.intensity = intensity;
  }

  /**
   * Update key light position
   */
  public setKeyLightPosition(any: any): void {
    this?.keyLight?.position?.set(any: any);
  }

  /**
   * Get all lights
   */
  public getLights(): Light?.[] {
    return [this?.keyLight, this?.fillLight, this?.rimLight, this?.ambientLight];
  }

  /**
   * Dispose all lights
   */
  public dispose(): void {
    this?.scene?.remove(any: any);
    this?.scene?.remove(any: any);
    this?.scene?.remove(any: any);
    this?.scene?.remove(any: any);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default StudioLightingRig;
