// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — ENHANCED THREE.JS AVATAR RENDERER
//   YOLO OPT-1: Lazy-loaded Three.js (-400 KB gzip)
//   Premium WebGL rendering with PBR, TAA, Bloom, Studio Lighting
// ═════════════════════════════════════════════════════════════════════════════

import * as THREE from 'three';
import type { SkeletonSnapshot } from '../fullbody/fullbody_engine';
import { PBRMaterialSystem } from '../rendering/PBRMaterialSystem';
import { StudioLightingRig, type AppearanceStyle } from '../rendering/StudioLightingRig';
import { PostProcessingPipeline } from '../rendering/PostProcessingPipeline';
import { logger } from '@/utils/logger';

// Debug flag (disable in production)
const DEBUG = import.meta.env.DEV;

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
  root: THREE.Group;
  skeleton: THREE.Skeleton;
  bones: Map<string, THREE.Bone>;
  meshes: THREE.SkinnedMesh[];
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class ThreeJSAvatarRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
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
      pixelRatio = window.devicePixelRatio,
      enablePostProcessing = true,
      appearanceStyle = 'bureau',
    } = options;

    this.usePostProcessing = enablePostProcessing;

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !enablePostProcessing, // TAA replaces MSAA
      alpha,
      preserveDrawingBuffer: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(pixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent for floating window
    this.scene.fog = new THREE.Fog(0x000000, 5, 15);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.6, 2.5); // Eye level, 2.5m away
    this.camera.lookAt(0, 1.5, 0); // Look at avatar head

    // v25.0: Initialize enhanced systems
    this.materialSystem = new PBRMaterialSystem();
    this.lightingRig = new StudioLightingRig(this.scene);
    this.lightingRig.applyStyle(appearanceStyle);

    // Post-processing pipeline
    if (enablePostProcessing) {
      this.postProcessing = new PostProcessingPipeline(
        this.renderer,
        this.scene,
        this.camera,
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
   * Create simple placeholder avatar (before 3D model loaded)
   */
  private createPlaceholderAvatar(): AvatarMeshes {
    const root = new THREE.Group();
    root.name = 'AvatarRoot';

    // Body capsule (cloth material)
    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.0, 8, 16);
    const bodyMaterial = this.materialSystem.createClothMaterial(
      'placeholder-body',
      0x6366f1 // Indigo-500 (TITANE color)
    );
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.0;
    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    // Head sphere (skin material)
    const headGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const headMaterial = this.materialSystem.createSkinMaterial(
      'placeholder-head',
      0xffdbac // Skin tone
    );
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.7;
    head.castShadow = true;
    head.receiveShadow = true;
    root.add(head);

    // Ground plane (to receive shadows)
    const groundGeometry = new THREE.CircleGeometry(5, 32);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    root.add(ground);

    this.scene.add(root);

    // Create placeholder skeleton (for future updates)
    const bones: Map<string, THREE.Bone> = new Map();
    const skeleton = new THREE.Skeleton([]);

    return {
      root,
      skeleton,
      bones,
      meshes: [],
    };
  }

  /**
   * Initialize avatar (placeholder for now)
   */
  public initializeAvatar(): void {
    if (this.avatarMeshes) {
      logger.warn('Avatar already initialized');
      return;
    }

    this.avatarMeshes = this.createPlaceholderAvatar();
    if (DEBUG) logger.debug('Placeholder avatar created');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SKELETON UPDATE
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update avatar skeleton from backend snapshot
   * @param snapshot - Skeleton data from FullBodyAvatarEngine
   */
  public updateSkeleton(snapshot: SkeletonSnapshot): void {
    if (!this.avatarMeshes) {
      if (DEBUG) logger.warn('Avatar not initialized');
      return;
    }

    // IMPLEMENTATION v24.13: Map snapshot.bones to Three.js bones
    // 1. Use SkeletonHelper to visualize bone structure: new THREE.SkeletonHelper(avatarModel)
    // 2. Traverse skeleton: avatarModel.traverse(node => { if (node.isBone) ... })
    // 3. Map bones: Find bones by name (e.g., 'Spine', 'Head', 'LeftArm') from snapshot.bones
    // 4. Apply transforms: bone.quaternion.set(qx, qy, qz, qw), bone.position.set(x, y, z)
    // 5. Update matrices: bone.updateMatrix(), skeleton.update()
    // 6. Optimization: Cache bone references for performance (avoid traverse every frame)
    // For now, simple rotation animation
    if (this.avatarMeshes.root) {
      // Idle breathing animation (subtle)
      const breathPhase = (snapshot.frame % 360) * (Math.PI / 180);
      const breathScale = 1.0 + Math.sin(breathPhase) * 0.01;
      this.avatarMeshes.root.scale.y = breathScale;

      // Subtle sway
      const swayPhase = (snapshot.frame % 240) * (Math.PI / 180);
      this.avatarMeshes.root.rotation.y = Math.sin(swayPhase) * 0.02;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Render single frame (avec post-processing si activé)
   */
  public render(): void {
    if (this.isDisposed) return;

    if (this.postProcessing) {
      this.postProcessing.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Start continuous render loop (60 FPS)
   */
  public startRenderLoop(): void {
    if (this.animationFrameId !== null) {
      logger.warn('Render loop already running');
      return;
    }

    const animate = () => {
      if (this.isDisposed) return;

      this.render();
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
    if (DEBUG) logger.debug('Render loop started');
  }

  /**
   * Stop render loop
   */
  public stopRenderLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      if (DEBUG) logger.debug('Render loop stopped');
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CAMERA CONTROL
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Update camera aspect ratio (on resize)
   */
  public updateAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    // Update post-processing size
    if (this.postProcessing) {
      this.postProcessing.setSize(width, height);
    }
  }

  /**
   * Set camera position
   */
  public setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 1.5, 0);
  }

  /**
   * Set camera zoom (FOV adjustment)
   */
  public setCameraZoom(fov: number): void {
    this.camera.fov = THREE.MathUtils.clamp(fov, 30, 90);
    this.camera.updateProjectionMatrix();
  }

  // ═════════════════════════════════════════════════════════════════════════
  // SCENE CONTROL
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Set scene background (transparent by default)
   */
  public setBackground(color: THREE.Color | null): void {
    this.scene.background = color;
  }

  /**
   * Apply appearance style (lighting + materials)
   */
  public applyAppearanceStyle(style: AppearanceStyle): void {
    this.lightingRig.applyStyle(style);
  }

  /**
   * Set lighting intensity (legacy wrapper)
   */
  public setLightingIntensity(factor: number): void {
    const clampedFactor = THREE.MathUtils.clamp(factor, 0.1, 2.0);
    this.lightingRig.setKeyIntensity(3.0 * clampedFactor);
    this.lightingRig.setFillIntensity(1.2 * clampedFactor);
    this.lightingRig.setRimIntensity(2.0 * clampedFactor);
  }

  /**
   * Toggle shadows
   */
  public toggleShadows(enabled: boolean): void {
    this.renderer.shadowMap.enabled = enabled;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Dispose all resources
   */
  public dispose(): void {
    if (this.isDisposed) return;

    this.stopRenderLoop();

    // Dispose avatar meshes
    if (this.avatarMeshes) {
      this.avatarMeshes.root.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material?.dispose();
          }
        }
      });
      this.scene.remove(this.avatarMeshes.root);
      this.avatarMeshes = null;
    }

    // Dispose v25.0 systems
    this.materialSystem.dispose();
    this.lightingRig.dispose();
    if (this.postProcessing) {
      this.postProcessing.dispose();
    }

    // Dispose renderer
    this.renderer.dispose();

    this.isDisposed = true;
    if (DEBUG) logger.debug('Disposed');
  }

  // ═════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═════════════════════════════════════════════════════════════════════════

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public isInitialized(): boolean {
    return this.avatarMeshes !== null;
  }

  public isRendering(): boolean {
    return this.animationFrameId !== null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default ThreeJSAvatarRenderer;
