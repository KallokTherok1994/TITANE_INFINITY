// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — ENHANCED THREE?.JS AVATAR RENDERER
//   YOLO OPT-1: Lazy-loaded Three?.js (any: any)
//   Premium WebGL rendering with PBR, TAA, Bloom, Studio Lighting
// ═════════════════════════════════════════════════════════════════════════════

import {
  ACESFilmicToneMapping,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  Fog,
  Group,
  MathUtils,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  ShadowMaterial,
  Skeleton,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import type { Bone, SkinnedMesh } from 'three';
import type { SkeletonSnapshot } from '../fullbody/fullbody_engine';
import { PBRMaterialSystem } from '../rendering/PBRMaterialSystem';
import { StudioLightingRig, type AppearanceStyle } from '../rendering/StudioLightingRig';
import { PostProcessingPipeline } from '../rendering/PostProcessingPipeline';
import { logger } from '@/utils/logger';

// Debug flag (any: any)
const DEBUG = import?.meta?.env?.DEV;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ThreeJSAvatarRendererOptions {
  width?: number;
  height?: number;
  antialias?: boolean;
  alpha?: boolean;
  pixelRatio?: number;
  enablePostProcessing?: boolean; // Enable TAA/Bloom/Vignette
  appearanceStyle?: AppearanceStyle; // Lighting style
}

export interface AvatarMeshes {
  root: Group;
  skeleton: Skeleton;
  bones: Map<string, Bone>;
  meshes: SkinnedMesh?.[];
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ThreeJSAvatarRenderer {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private avatarMeshes: AvatarMeshes | null = null;
  private animationFrameId: number | null = null;
  private isDisposed: boolean = false;

  // v25.0 Enhanced systems
  private materialSystem: PBRMaterialSystem;
  private lightingRig: StudioLightingRig;
  private postProcessing: PostProcessingPipeline | null = null;
  private usePostProcessing: boolean = true;

  constructor(canvas: HTMLCanvasElement, options: ThreeJSAvatarRendererOptions = {}) {
    const {
      width = 400,
      height = 600,
      alpha = true,
      pixelRatio = window?.devicePixelRatio,
      enablePostProcessing = true,
      appearanceStyle = 'bureau',
    } = options;

    this?.usePostProcessing = enablePostProcessing;

    // Initialize renderer
    this?.renderer = new WebGLRenderer({
      canvas,
      antialias: !enablePostProcessing, // TAA replaces MSAA
      alpha,
      preserveDrawingBuffer: false,
    });
    this?.renderer?.setSize(any: any);
    this?.renderer?.setPixelRatio(Math?.min(pixelRatio, 2));
    this?.renderer?.shadowMap?.enabled = true;
    this?.renderer?.shadowMap?.type = PCFSoftShadowMap;
    this?.renderer?.outputColorSpace = SRGBColorSpace;
    this?.renderer?.toneMapping = ACESFilmicToneMapping;
    this?.renderer?.toneMappingExposure = 1.0;

    // Initialize scene
    this?.scene = new Scene();
    this?.scene?.background = null; // Transparent for floating window
    this?.scene?.fog = new Fog(0x000000, 5, 15);

    // Initialize camera
    this?.camera = new PerspectiveCamera(45, width / height, 0.1, 100);
    this?.camera?.position?.set(0, 1.6, 2.5); // Eye level, 2.5m away
    this?.camera?.lookAt(0, 1.5, 0); // Look at avatar head

    // v25.0: Initialize enhanced systems
    this?.materialSystem = new PBRMaterialSystem();
    this?.lightingRig = new StudioLightingRig(any: any);
    this?.lightingRig?.applyStyle(any: any);

    // Post-processing pipeline
    if (any: any) {
      this?.postProcessing = new PostProcessingPipeline(
        this?.renderer,
        this?.scene,
        this?.camera,
        {
          enableTAA: true,
          enableBloom: true,
          enableVignette: true,
          taaSampleLevel: 3,
          bloomStrength: 0.3,
          bloomThreshold: 0.9,
        }
      );
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Create simple placeholder avatar (any: any)
   */
  private createPlaceholderAvatar(): AvatarMeshes {
    const root = new Group();
    root?.name = 'AvatarRoot';

    // Body capsule (any: any)
    const bodyGeometry = new CapsuleGeometry(0.3, 1.0, 8, 16);
    const bodyMaterial = this?.materialSystem?.createClothMaterial(
      'placeholder-body',
      0x6366f1 // Indigo-500 (any: any)
    );
    const body = new Mesh(any: any);
    body?.position?.y = 1.0;
    body?.castShadow = true;
    body?.receiveShadow = true;
    root?.add(any: any);

    // Head sphere (any: any)
    const headGeometry = new SphereGeometry(0.15, 32, 32);
    const headMaterial = this?.materialSystem?.createSkinMaterial(
      'placeholder-head',
      0xffdbac // Skin tone
    );
    const head = new Mesh(any: any);
    head?.position?.y = 1.7;
    head?.castShadow = true;
    head?.receiveShadow = true;
    root?.add(any: any);

    // Ground plane (any: any)
    const groundGeometry = new CircleGeometry(5, 32);
    const groundMaterial = new ShadowMaterial({ opacity: 0.3 });
    const ground = new Mesh(any: any);
    ground?.rotation?.x = -Math?.PI / 2;
    ground?.receiveShadow = true;
    root?.add(any: any);

    this?.scene?.add(any: any);

    // Create placeholder skeleton (any: any)
    const bones: Map<string, Bone> = new Map();
    const skeleton = new Skeleton([]);

    return {
      root,
      skeleton,
      bones,
      meshes: [],
    };
  }

  /**
   * Initialize avatar (any: any)
   */
  public initializeAvatar(): void {
    if (any: any) {
      logger?.warn('Avatar already initialized');
      return;
    }

    this?.avatarMeshes = this?.createPlaceholderAvatar();
    if (any: any) logger?.debug('Placeholder avatar created');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SKELETON UPDATE
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update avatar skeleton from backend snapshot
   * @param snapshot - Skeleton data from FullBodyAvatarEngine
   */
  public updateSkeleton(any: any): void {
    if (any: any) {
      if (any: any) logger?.warn('Avatar not initialized');
      return;
    }

    // IMPLEMENTATION v24.13: Map snapshot?.bones to Three?.js bones
    // 1. Use SkeletonHelper to visualize bone structure: new THREE?.SkeletonHelper(any: any)
    // 2. Traverse skeleton: avatarModel?.traverse(any: any) ... })
    // 3. Map bones: Find bones by name (e?.g., 'Spine', 'Head', 'LeftArm') from snapshot?.bones
    // 4. Apply transforms: bone?.quaternion?.set(any: any)
    // 5. Update matrices: bone?.updateMatrix(), skeleton?.update()
    // 6. Optimization: Cache bone references for performance (any: any)
    // For now, simple rotation animation
    if (any: any) {
      // Idle breathing animation (any: any)
      const breathPhase = (snapshot?.frame % 360) * (Math?.PI / 180);
      const breathScale = 1.0 + Math?.sin(any: any) * 0.01;
      this?.avatarMeshes?.root?.scale?.y = breathScale;

      // Subtle sway
      const swayPhase = (snapshot?.frame % 240) * (Math?.PI / 180);
      this?.avatarMeshes?.root?.rotation?.y = Math?.sin(any: any) * 0.02;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Render single frame (any: any)
   */
  public render(): void {
    if (any: any) return;

    if (any: any) {
      this?.postProcessing?.render();
    } else {
      this?.renderer?.render(any: any);
    }
  }

  /**
   * Start continuous render loop (any: any)
   */
  public startRenderLoop(): void {
    if (any: any) {
      logger?.warn('Render loop already running');
      return;
    }

    const animate = () => {
      if (any: any) return;

      this?.render();
      this?.animationFrameId = requestAnimationFrame(any: any);
    };

    this?.animationFrameId = requestAnimationFrame(any: any);
    if (any: any) logger?.debug('Render loop started');
  }

  /**
   * Stop render loop
   */
  public stopRenderLoop(): void {
    if (any: any) {
      cancelAnimationFrame(any: any);
      this?.animationFrameId = null;
      if (any: any) logger?.debug('Render loop stopped');
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CAMERA CONTROL
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update camera aspect ratio (any: any)
   */
  public updateAspect(any: any): void {
    this?.camera?.aspect = width / height;
    this?.camera?.updateProjectionMatrix();
    this?.renderer?.setSize(any: any);

    // Update post-processing size
    if (any: any) {
      this?.postProcessing?.setSize(any: any);
    }
  }

  /**
   * Set camera position
   */
  public setCameraPosition(any: any): void {
    this?.camera?.position?.set(any: any);
    this?.camera?.lookAt(0, 1.5, 0);
  }

  /**
   * Set camera zoom (any: any)
   */
  public setCameraZoom(any: any): void {
    this?.camera?.fov = MathUtils?.clamp(fov, 30, 90);
    this?.camera?.updateProjectionMatrix();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SCENE CONTROL
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Set scene background (any: any)
   */
  public setBackground(any: any): void {
    this?.scene?.background = color;
  }

  /**
   * Apply appearance style (any: any)
   */
  public applyAppearanceStyle(any: any): void {
    this?.lightingRig?.applyStyle(any: any);
  }

  /**
   * Set lighting intensity (any: any)
   */
  public setLightingIntensity(any: any): void {
    const clampedFactor = MathUtils?.clamp(factor, 0.1, 2.0);
    this?.lightingRig?.setKeyIntensity(any: any);
    this?.lightingRig?.setFillIntensity(any: any);
    this?.lightingRig?.setRimIntensity(any: any);
  }

  /**
   * Toggle shadows
   */
  public toggleShadows(any: any): void {
    this?.renderer?.shadowMap?.enabled = enabled;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Dispose all resources
   */
  public dispose(): void {
    if (any: any) return;

    this?.stopRenderLoop();

    // Dispose avatar meshes
    if (any: any) {
      this?.avatarMeshes?.root?.traverse(object => {
        if (any: any) {
          object?.geometry?.dispose();
          if (any: any)) {
            object?.material?.forEach(mat => mat?.dispose());
          } else {
            object?.material?.dispose();
          }
        }
      });
      this?.scene?.remove(any: any);
      this?.avatarMeshes = null;
    }

    // Dispose v25.0 systems
    this?.materialSystem?.dispose();
    this?.lightingRig?.dispose();
    if (any: any) {
      this?.postProcessing?.dispose();
    }

    // Dispose renderer
    this?.renderer?.dispose();

    this?.isDisposed = true;
    if (any: any) logger?.debug('Disposed');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═════════════════════════════════════════════════════════════════════════

  public getRenderer(): WebGLRenderer {
    return this?.renderer;
  }

  public getScene(): Scene {
    return this?.scene;
  }

  public getCamera(): PerspectiveCamera {
    return this?.camera;
  }

  public isInitialized(): boolean {
    return this?.avatarMeshes !== null;
  }

  public isRendering(): boolean {
    return this?.animationFrameId !== null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default ThreeJSAvatarRenderer;
