// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.0 — POST-PROCESSING PIPELINE
//   TAA, Bloom, Vignette for premium visual quality
//   NOTE: Nécessite three-stdlib ou three@latest pour imports postprocessing
// ═══════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
// @ts-expect-error - Three.js postprocessing types manquants (installer three-stdlib)
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// @ts-expect-error - Three.js postprocessing types manquants
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// @ts-expect-error - Three.js postprocessing types manquants
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
// @ts-expect-error - Three.js postprocessing types manquants
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
// @ts-expect-error - Three.js postprocessing types manquants
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// ═══════════════════════════════════════════════════════════════════════════
// VIGNETTE SHADER
// ═══════════════════════════════════════════════════════════════════════════

const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = clamp(1.0 - dot(uv, uv), 0.0, 1.0);
      vignette = pow(vignette, darkness);
      gl_FragColor = vec4(texel.rgb * vignette, texel.a);
    }
  `,
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PostProcessingConfig {
  enableTAA: boolean;
  enableBloom: boolean;
  enableVignette: boolean;
  taaSampleLevel: number;       // TAA samples (3-5 optimal)
  bloomStrength: number;         // Bloom intensity (0.1-0.5)
  bloomRadius: number;           // Bloom radius (0.5-1.0)
  bloomThreshold: number;        // Bloom threshold (0.8-1.0)
  vignetteOffset: number;        // Vignette offset (0.8-1.2)
  vignetteDarkness: number;      // Vignette darkness (1.0-2.0)
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════

export class PostProcessingPipeline {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private composer: EffectComposer;
  private config: PostProcessingConfig;

  // Passes
  private renderPass: RenderPass;
  private taaPass: TAARenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private vignettePass: ShaderPass | null = null;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<PostProcessingConfig> = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Default config
    this.config = {
      enableTAA: true,
      enableBloom: true,
      enableVignette: true,
      taaSampleLevel: 3,
      bloomStrength: 0.3,
      bloomRadius: 0.8,
      bloomThreshold: 0.9,
      vignetteOffset: 1.0,
      vignetteDarkness: 1.5,
      ...config,
    };

    // Create composer
    this.composer = new EffectComposer(renderer);

    // Add render pass (always first)
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);

    // Build pipeline
    this.buildPipeline();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PIPELINE CONSTRUCTION
  // ═════════════════════════════════════════════════════════════════════════

  private buildPipeline(): void {
    // TAA (Temporal Anti-Aliasing)
    if (this.config.enableTAA) {
      this.taaPass = new TAARenderPass(this.scene, this.camera);
      this.taaPass.sampleLevel = this.config.taaSampleLevel;
      this.composer.addPass(this.taaPass);
    }

    // Bloom (subtle glow)
    if (this.config.enableBloom) {
      const resolution = new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      );

      this.bloomPass = new UnrealBloomPass(
        resolution,
        this.config.bloomStrength,
        this.config.bloomRadius,
        this.config.bloomThreshold
      );
      this.composer.addPass(this.bloomPass);
    }

    // Vignette (frame darkening)
    if (this.config.enableVignette) {
      this.vignettePass = new ShaderPass(VignetteShader);
      this.vignettePass.uniforms['offset'].value = this.config.vignetteOffset;
      this.vignettePass.uniforms['darkness'].value = this.config.vignetteDarkness;
      this.vignettePass.renderToScreen = true;
      this.composer.addPass(this.vignettePass);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Render with post-processing
   */
  public render(): void {
    this.composer.render();
  }

  /**
   * Update size (on window resize)
   */
  public setSize(width: number, height: number): void {
    this.composer.setSize(width, height);

    // Update bloom resolution
    if (this.bloomPass) {
      this.bloomPass.resolution.set(width, height);
    }
  }

  /**
   * Enable/disable TAA
   */
  public setTAAEnabled(enabled: boolean): void {
    if (this.taaPass) {
      this.taaPass.enabled = enabled;
    }
  }

  /**
   * Enable/disable Bloom
   */
  public setBloomEnabled(enabled: boolean): void {
    if (this.bloomPass) {
      this.bloomPass.enabled = enabled;
    }
  }

  /**
   * Enable/disable Vignette
   */
  public setVignetteEnabled(enabled: boolean): void {
    if (this.vignettePass) {
      this.vignettePass.enabled = enabled;
    }
  }

  /**
   * Update TAA sample level
   */
  public setTAASampleLevel(level: number): void {
    if (this.taaPass) {
      this.taaPass.sampleLevel = level;
    }
  }

  /**
   * Update bloom strength
   */
  public setBloomStrength(strength: number): void {
    if (this.bloomPass) {
      this.bloomPass.strength = strength;
    }
  }

  /**
   * Update bloom threshold
   */
  public setBloomThreshold(threshold: number): void {
    if (this.bloomPass) {
      this.bloomPass.threshold = threshold;
    }
  }

  /**
   * Update vignette darkness
   */
  public setVignetteDarkness(darkness: number): void {
    if (this.vignettePass) {
      this.vignettePass.uniforms['darkness'].value = darkness;
    }
  }

  /**
   * Get composer (for advanced usage)
   */
  public getComposer(): EffectComposer {
    return this.composer;
  }

  /**
   * Dispose pipeline
   */
  public dispose(): void {
    // Dispose passes
    this.renderPass.dispose?.();
    this.taaPass?.dispose?.();
    this.bloomPass?.dispose?.();
    this.vignettePass?.dispose?.();

    // Dispose composer
    this.composer.dispose?.();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default PostProcessingPipeline;
