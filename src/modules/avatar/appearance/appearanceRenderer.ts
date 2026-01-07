/**
 * TITANE∞ v24.6 — Appearance Renderer
 *
 * Integrates appearance system with 3D rendering engine.
 * Manages asset loading, material application, and avatar updates.
 *
 * Architecture:
 * - Asset loading: Fetch and cache 3D meshes/textures
 * - Material application: Apply shaders and properties
 * - Avatar updates: Swap meshes when appearance changes
 * - Performance: Asset caching, lazy loading, LOD support
 *
 * Integration:
 * - Uses appearanceMapper for asset definitions
 * - Integrates with FullBodyAvatarEngine v24 for 3D rendering
 * - Listens to appearance state changes from SingularityState
 */

import type { AvatarAppearanceState } from './appearanceState';
import type { AppearanceAssets, AssetDefinition } from './appearanceMapper';
import { AppearanceMapper } from './appearanceMapper';
import { getAppearance } from './appearanceEngine';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Loaded 3D asset with Three.js objects
 */
export interface LoadedAsset {
  mesh: unknown; // THREE.Object3D (using unknown to avoid Three.js dependency here)
  material: unknown; // THREE.Material
  texture?: unknown; // THREE.Texture
}

interface AssetCacheEntry {
  asset: LoadedAsset;
  lastAccess: number;
  refCount: number;
}

export interface AppearanceRendererConfig {
  assetBasePath: string;
  cacheSizeLimit: number;
  enableLOD: boolean;
  preloadCommonAssets: boolean;
}

// ============================================================================
// ASSET CACHE
// ============================================================================

/**
 * LRU cache for loaded 3D assets
 */
class AssetCache {
  private cache = new Map<string, AssetCacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: string, asset: LoadedAsset): void {
    // Evict oldest if cache full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      asset,
      lastAccess: Date.now(),
      refCount: 1,
    });
  }

  get(key: string): LoadedAsset | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      entry.lastAccess = Date.now();
      entry.refCount++;
      return entry.asset;
    }
    return undefined;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.refCount === 1 && entry.lastAccess < oldestTime) {
        oldestKey = key;
        oldestTime = entry.lastAccess;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// ============================================================================
// APPEARANCE RENDERER
// ============================================================================

/**
 * Manages 3D rendering of avatar appearance
 */
export class AppearanceRenderer {
  private config: AppearanceRendererConfig;
  private assetCache: AssetCache;
  private currentAssets: AppearanceAssets | null = null;
  private loadingPromises = new Map<string, Promise<LoadedAsset>>();

  constructor(config?: Partial<AppearanceRendererConfig>) {
    this.config = {
      assetBasePath: '/assets/avatar',
      cacheSizeLimit: 100,
      enableLOD: true,
      preloadCommonAssets: true,
      ...config,
    };

    this.assetCache = new AssetCache(this.config.cacheSizeLimit);

    if (this.config.preloadCommonAssets) {
      this.preloadCommonAssets();
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Render appearance state to 3D scene
   *
   * @param state - Avatar appearance state
   * @returns Promise that resolves when rendering complete
   */
  async renderAppearance(state: AvatarAppearanceState): Promise<void> {
    // Map state to assets
    const assets = AppearanceMapper.mapAppearanceToAssets(state);
    this.currentAssets = assets;

    // Load all required assets
    await Promise.all([
      this.loadOutfitAssets(assets.outfit),
      this.loadHairAsset(assets.hair),
      this.loadAccessoryAssets(assets.accessories),
    ]);

    // Apply assets to 3D avatar (integration point with FullBodyAvatarEngine)
    this.applyAssetsToAvatar(assets);
  }

  /**
   * Update only specific parts of appearance
   *
   * @param updates - Partial appearance state updates
   */
  async updateAppearanceParts(updates: {
    outfit?: boolean;
    hair?: boolean;
    accessories?: boolean;
  }): Promise<void> {
    if (!this.currentAssets) {
      logger.warn('No current assets loaded, cannot update parts');
      return;
    }

    const promises: Promise<void>[] = [];

    if (updates.outfit) {
      promises.push(this.loadOutfitAssets(this.currentAssets.outfit));
    }
    if (updates.hair) {
      promises.push(this.loadHairAsset(this.currentAssets.hair).then(() => {}));
    }
    if (updates.accessories) {
      promises.push(this.loadAccessoryAssets(this.currentAssets.accessories));
    }

    await Promise.all(promises);
    this.applyAssetsToAvatar(this.currentAssets);
  }

  /**
   * Reload current appearance from state
   */
  async reloadFromState(): Promise<void> {
    const state = await getAppearance();
    await this.renderAppearance(state);
  }

  /**
   * Clear asset cache
   */
  clearCache(): void {
    this.assetCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return this.assetCache.getStats();
  }

  // ==========================================================================
  // ASSET LOADING
  // ==========================================================================

  /**
   * Load outfit assets (top, bottom, shoes, outerwear)
   */
  private async loadOutfitAssets(outfit: AppearanceAssets['outfit']): Promise<void> {
    const promises: Promise<LoadedAsset>[] = [
      this.loadAsset(outfit.top),
      this.loadAsset(outfit.bottom),
      this.loadAsset(outfit.shoes),
    ];

    if (outfit.outerwear) {
      promises.push(this.loadAsset(outfit.outerwear));
    }

    await Promise.all(promises);
  }

  /**
   * Load hair asset
   */
  private async loadHairAsset(hair: AssetDefinition): Promise<LoadedAsset> {
    return this.loadAsset(hair);
  }

  /**
   * Load accessory assets (glasses, jewelry, bag, other)
   */
  private async loadAccessoryAssets(
    accessories: AppearanceAssets['accessories']
  ): Promise<void> {
    const promises: Promise<LoadedAsset>[] = [];

    if (accessories.glasses) {
      promises.push(this.loadAsset(accessories.glasses));
    }

    if (accessories.jewelry) {
      for (const jewelry of accessories.jewelry) {
        promises.push(this.loadAsset(jewelry));
      }
    }

    if (accessories.bag) {
      promises.push(this.loadAsset(accessories.bag));
    }

    if (accessories.other) {
      for (const other of accessories.other) {
        promises.push(this.loadAsset(other));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Load single asset (mesh + texture + material)
   */
  private async loadAsset(assetDef: AssetDefinition): Promise<LoadedAsset> {
    const cacheKey = `${assetDef.mesh}:${assetDef.texture}:${assetDef.material}`;

    // Check cache first
    const cached = this.assetCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if already loading
    const loadingPromise = this.loadingPromises.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Load asset
    const promise = this.performAssetLoad(assetDef, cacheKey);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const asset = await promise;
      this.assetCache.set(cacheKey, asset);
      return asset;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Perform actual asset loading (integration point with Three.js loader)
   */
  private async performAssetLoad(
    assetDef: AssetDefinition,
    cacheKey: string
  ): Promise<LoadedAsset> {
    // Implementation: Three.js asset loading pipeline
    // - GLTF: Use THREE.GLTFLoader for 3D models (avatars, clothing, accessories)
    // - Textures: THREE.TextureLoader for PNG/JPG (albedo, normal, metallic maps)
    // - Materials: THREE.MaterialLoader or custom PBR material setup
    // - Optimization: Apply THREE.DRACOLoader for compressed geometry
    // - Caching: Store loaded assets in THREE.Cache to avoid re-loading
    // - Error handling: Fallback to default cube geometry on load failure
    // For now, return mock asset
    logger.debug(`[AppearanceRenderer] Loading asset: ${cacheKey}`);
    logger.debug(`  - Mesh: ${assetDef.mesh}`);
    logger.debug(`  - Texture: ${assetDef.texture}`);
    logger.debug(`  - Material: ${assetDef.material}`);

    // Simulate async loading
    await new Promise(resolve => setTimeout(resolve, 10));

    return {
      mesh: { type: 'THREE.Object3D', path: assetDef.mesh },
      material: { type: 'THREE.Material', shader: assetDef.material },
      texture: { type: 'THREE.Texture', path: assetDef.texture },
    };
  }

  // ==========================================================================
  // AVATAR APPLICATION
  // ==========================================================================

  /**
   * Apply loaded assets to 3D avatar
   * (Integration point with FullBodyAvatarEngine v24)
   */
  private applyAssetsToAvatar(assets: AppearanceAssets): void {
    logger.debug('Applying assets to avatar');
    logger.debug('  - Outfit:', {
      top: assets.outfit.top.mesh,
      bottom: assets.outfit.bottom.mesh,
      shoes: assets.outfit.shoes.mesh,
    });
    logger.debug('  - Hair:', assets.hair.mesh);
    logger.debug('  - Accessories:', {
      glasses: assets.accessories.glasses?.mesh,
      jewelry: assets.accessories.jewelry?.length || 0,
      bag: assets.accessories.bag?.mesh,
    });

    // Implementation: FullBodyAvatarEngine outfit integration
    // 1. Get avatar root: const avatarNode = await FullBodyAvatarEngine.getRootNode()
    // 2. Replace outfit meshes: avatarNode.traverse() find old meshes by name, replace with loaded assets
    // 3. Replace hair mesh: avatarNode.getObjectByName('hair')?.replace(hairMesh)
    // 4. Attach accessories: Find attachment bones (e.g., 'mixamorig:LeftHand'), add as children
    // 5. Update materials: Apply color/pattern overrides to loaded materials
    // 6. Skinning: Transfer skinning data from old mesh to new mesh (preserveWeights: true)
    // 7. Animation: Re-bind animation clips if skeleton structure changed
    // 8. Optimization: Merge geometries for accessories to reduce draw calls
    // 5. Apply materials and textures
    // 6. Update skinning weights if needed
    // 7. Trigger re-render

    // Example integration pseudocode:
    /*
    const avatarEngine = FullBodyAvatarEngine.getInstance();
    const avatarRoot = avatarEngine.getAvatarRoot();

    // Replace outfit
    const torsoNode = avatarRoot.getChildByName('Torso');
    torsoNode.replaceMesh(await this.assetCache.get(assets.outfit.top.mesh));

    // Replace hair
    const headNode = avatarRoot.getChildByName('Head');
    headNode.replaceMesh(await this.assetCache.get(assets.hair.mesh));

    // Attach accessories
    if (assets.accessories.glasses) {
      const glassesNode = await this.assetCache.get(assets.accessories.glasses.mesh);
      headNode.attach(glassesNode, 'nose_bridge');
    }
    */
  }

  // ==========================================================================
  // PRELOADING
  // ==========================================================================

  /**
   * Preload commonly used assets
   */
  private async preloadCommonAssets(): Promise<void> {
    logger.debug('Preloading common assets...');

    // Preload fallback assets
    const fallbacks = [
      AppearanceMapper.getFallbackAsset('top'),
      AppearanceMapper.getFallbackAsset('bottom'),
      AppearanceMapper.getFallbackAsset('shoes'),
      AppearanceMapper.getFallbackAsset('hair'),
    ];

    await Promise.all(fallbacks.map(asset => this.loadAsset(asset)));

    logger.debug('Common assets preloaded');
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let rendererInstance: AppearanceRenderer | null = null;

export function getAppearanceRenderer(
  config?: Partial<AppearanceRendererConfig>
): AppearanceRenderer {
  if (!rendererInstance) {
    rendererInstance = new AppearanceRenderer(config);
  }
  return rendererInstance;
}

export function resetAppearanceRenderer(): void {
  rendererInstance = null;
}

// ============================================================================
// HIGH-LEVEL HELPERS
// ============================================================================

/**
 * Render current appearance state to 3D scene
 */
export async function renderCurrentAppearance(): Promise<void> {
  const renderer = getAppearanceRenderer();
  await renderer.reloadFromState();
}

/**
 * Update specific appearance parts
 */
export async function updateAppearanceParts(parts: {
  outfit?: boolean;
  hair?: boolean;
  accessories?: boolean;
}): Promise<void> {
  const renderer = getAppearanceRenderer();
  await renderer.updateAppearanceParts(parts);
}

/**
 * Clear renderer cache
 */
export function clearRendererCache(): void {
  const renderer = getAppearanceRenderer();
  renderer.clearCache();
}

/**
 * Get renderer cache stats
 */
export function getRendererCacheStats(): { size: number; maxSize: number } {
  const renderer = getAppearanceRenderer();
  return renderer.getCacheStats();
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  AppearanceRenderer,
  getAppearanceRenderer,
  resetAppearanceRenderer,
  renderCurrentAppearance,
  updateAppearanceParts,
  clearRendererCache,
  getRendererCacheStats,
};
