// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — STUDIO LIGHTING RIG (YOLO OPT-1: Three.js lazy)
//   Professional 3-point lighting with appearance style adaptation
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
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
  keyColor: THREE.ColorRepresentation;
  fillColor: THREE.ColorRepresentation;
  rimColor: THREE.ColorRepresentation;
}

export type AppearanceStyle = 'nocturne' | 'montagne' | 'bureau' | 'futuriste';

// ═══════════════════════════════════════════════════════════════════════════
// STYLE PRESETS
// ═══════════════════════════════════════════════════════════════════════════

const STYLE_LIGHTING_PRESETS: Record<AppearanceStyle, Partial<LightingConfig>> = {
  // ─────────────────────────────────────────
  // NOCTURNE (blue tint, deeper shadows)
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
  // MONTAGNE (cold light, increased rim)
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
  // BUREAU (neutral, clean)
  // ─────────────────────────────────────────
  bureau: {
    keyIntensity: 3.0,
    fillIntensity: 1.2,
    rimIntensity: 2.0,
    ambientIntensity: 0.3,
    keyColor: 0xfff5e6, // Warm white
    fillColor: 0xe6f3ff, // Cool fill (contrast)
    rimColor: 0xffffff, // Pure white
  },

  // ─────────────────────────────────────────
  // FUTURISTE (cyan neon accents)
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
  private THREE!: typeof THREE; // YOLO OPT-1: Lazy-loaded Three.js
  private scene!: THREE.Scene;
  private keyLight!: THREE.DirectionalLight;
  private fillLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private config: LightingConfig;
  private currentStyle: AppearanceStyle = 'bureau';

  // Constructor params storage
  private _scene: THREE.Scene;
  private _config: Partial<LightingConfig>;

  constructor(scene: THREE.Scene, config: Partial<LightingConfig> = {}) {
    this._scene = scene;
    this._config = config;

    // Default config
    this.config = {
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
   * YOLO OPT-1: Async initialization after Three.js lazy-load
   */
  async init(): Promise<void> {
    // Lazy-load Three.js
    this.THREE = await loadThreeJS();
    this.scene = this._scene;

    // Create lights
    this.keyLight = this.createKeyLight();
    this.fillLight = this.createFillLight();
    this.rimLight = this.createRimLight();
    this.ambientLight = this.createAmbientLight();

    // Add to scene
    this.scene.add(this.keyLight);
    this.scene.add(this.fillLight);
    this.scene.add(this.rimLight);
    this.scene.add(this.ambientLight);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // LIGHT CREATION
  // ═════════════════════════════════════════════════════════════════════════

  private createKeyLight(): THREE.DirectionalLight {
    const light = new this.THREE.DirectionalLight(
      this.config.keyColor,
      this.config.keyIntensity
    );

    // Position: front-right, elevated
    light.position.set(3, 4, 3);
    light.castShadow = true;

    // Enhanced shadow settings
    light.shadow.mapSize.width = this.config.shadowMapSize;
    light.shadow.mapSize.height = this.config.shadowMapSize;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 15;
    light.shadow.camera.left = -5;
    light.shadow.camera.right = 5;
    light.shadow.camera.top = 5;
    light.shadow.camera.bottom = -5;
    light.shadow.bias = -0.0001;

    return light;
  }

  private createFillLight(): THREE.DirectionalLight {
    const light = new this.THREE.DirectionalLight(
      this.config.fillColor,
      this.config.fillIntensity
    );

    // Position: front-left, lower
    light.position.set(-2, 2, 2);
    light.castShadow = false; // Fill light doesn't cast shadows

    return light;
  }

  private createRimLight(): THREE.DirectionalLight {
    const light = new this.THREE.DirectionalLight(
      this.config.rimColor,
      this.config.rimIntensity
    );

    // Position: back, elevated (creates silhouette)
    light.position.set(0, 3, -3);
    light.castShadow = false;

    return light;
  }

  private createAmbientLight(): THREE.AmbientLight {
    return new this.THREE.AmbientLight(0xffffff, this.config.ambientIntensity);
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Apply appearance style preset
   */
  public applyStyle(style: AppearanceStyle): void {
    this.currentStyle = style;
    const preset = STYLE_LIGHTING_PRESETS[style];

    // Update intensities
    if (preset.keyIntensity !== undefined) {
      this.keyLight.intensity = preset.keyIntensity;
    }
    if (preset.fillIntensity !== undefined) {
      this.fillLight.intensity = preset.fillIntensity;
    }
    if (preset.rimIntensity !== undefined) {
      this.rimLight.intensity = preset.rimIntensity;
    }
    if (preset.ambientIntensity !== undefined) {
      this.ambientLight.intensity = preset.ambientIntensity;
    }

    // Update colors
    if (preset.keyColor !== undefined) {
      this.keyLight.color.set(preset.keyColor);
    }
    if (preset.fillColor !== undefined) {
      this.fillLight.color.set(preset.fillColor);
    }
    if (preset.rimColor !== undefined) {
      this.rimLight.color.set(preset.rimColor);
    }
  }

  /**
   * Get current style
   */
  public getCurrentStyle(): AppearanceStyle {
    return this.currentStyle;
  }

  /**
   * Update key light intensity
   */
  public setKeyIntensity(intensity: number): void {
    this.keyLight.intensity = intensity;
  }

  /**
   * Update fill light intensity
   */
  public setFillIntensity(intensity: number): void {
    this.fillLight.intensity = intensity;
  }

  /**
   * Update rim light intensity
   */
  public setRimIntensity(intensity: number): void {
    this.rimLight.intensity = intensity;
  }

  /**
   * Update ambient light intensity
   */
  public setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity;
  }

  /**
   * Update key light position
   */
  public setKeyLightPosition(x: number, y: number, z: number): void {
    this.keyLight.position.set(x, y, z);
  }

  /**
   * Get all lights
   */
  public getLights(): THREE.Light[] {
    return [this.keyLight, this.fillLight, this.rimLight, this.ambientLight];
  }

  /**
   * Dispose all lights
   */
  public dispose(): void {
    this.scene.remove(this.keyLight);
    this.scene.remove(this.fillLight);
    this.scene.remove(this.rimLight);
    this.scene.remove(this.ambientLight);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default StudioLightingRig;
