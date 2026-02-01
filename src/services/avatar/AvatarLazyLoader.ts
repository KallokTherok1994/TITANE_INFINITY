/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v37.0.0 — AVATAR LAZY LOADER
 *   Phase 3: Avatar System Code-Splitting
 *   Purpose: Deferred loading of avatar rendering engine + UI components
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/lib/logger';

/**
 * Avatar rendering modes
 */
export type AvatarRenderingMode = 'floating-window' | 'floating-popup' | 'fullbody';

/**
 * Avatar loader options
 */
export interface AvatarLoaderOptions {
  mode?: AvatarRenderingMode;
  timeoutMs?: number;
}

/**
 * Cache for loaded avatar modules
 */
const avatarModuleCache = new Map<string, any>();

/**
 * Load Three.js Avatar Renderer (Lazy)
 * Used for 3D avatar rendering with WebGL
 *
 * @returns Loaded ThreeJSAvatarRenderer class
 */
export async function loadThreeJSAvatarRenderer(timeoutMs = 8000): Promise<any> {
  const cacheKey = 'three-js-avatar-renderer';

  if (avatarModuleCache.has(cacheKey)) {
    logger.debug('[AvatarLazyLoader] Using cached ThreeJSAvatarRenderer');
    return avatarModuleCache.get(cacheKey);
  }

  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[AvatarLazyLoader] ThreeJSAvatarRenderer load timeout after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    );

    const module = await Promise.race([
      import('@/modules/avatar/floating/ThreeJSAvatarRenderer').then(
        m => m.ThreeJSAvatarRenderer
      ),
      timeoutPromise,
    ]);

    avatarModuleCache.set(cacheKey, module);

    const duration = performance.now() - startTime;
    logger.debug(
      `[AvatarLazyLoader] Loaded ThreeJSAvatarRenderer (${duration.toFixed(2)}ms)`
    );

    return module;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load ThreeJSAvatarRenderer: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Load Floating Avatar Window Component (Lazy)
 * Used for displaying floating avatar in window
 *
 * @returns React component AvatarFloatingWindow
 */
export async function loadAvatarFloatingWindow(timeoutMs = 5000): Promise<any> {
  const cacheKey = 'avatar-floating-window';

  if (avatarModuleCache.has(cacheKey)) {
    logger.debug('[AvatarLazyLoader] Using cached AvatarFloatingWindow');
    return avatarModuleCache.get(cacheKey);
  }

  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[AvatarLazyLoader] AvatarFloatingWindow load timeout after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    );

    const module = await Promise.race([
      import('@/modules/avatar/floating/AvatarFloatingWindow').then(
        m => m.AvatarFloatingWindow
      ),
      timeoutPromise,
    ]);

    avatarModuleCache.set(cacheKey, module);

    const duration = performance.now() - startTime;
    logger.debug(
      `[AvatarLazyLoader] Loaded AvatarFloatingWindow (${duration.toFixed(2)}ms)`
    );

    return module;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load AvatarFloatingWindow: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Load Floating Avatar Popup Component (Lazy)
 * Used for avatar popup UI
 *
 * @returns React component AvatarFloatingPopup
 */
export async function loadAvatarFloatingPopup(timeoutMs = 5000): Promise<any> {
  const cacheKey = 'avatar-floating-popup';

  if (avatarModuleCache.has(cacheKey)) {
    logger.debug('[AvatarLazyLoader] Using cached AvatarFloatingPopup');
    return avatarModuleCache.get(cacheKey);
  }

  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[AvatarLazyLoader] AvatarFloatingPopup load timeout after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    );

    const module = await Promise.race([
      import('@/modules/avatar/floating/AvatarFloatingPopup').then(m => m.default),
      timeoutPromise,
    ]);

    avatarModuleCache.set(cacheKey, module);

    const duration = performance.now() - startTime;
    logger.debug(
      `[AvatarLazyLoader] Loaded AvatarFloatingPopup (${duration.toFixed(2)}ms)`
    );

    return module;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load AvatarFloatingPopup: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Load Full Body Avatar Hook (Lazy)
 * Used for full-body avatar rendering
 *
 * @returns useFullBodyAvatar hook
 */
export async function loadFullBodyAvatarHook(timeoutMs = 5000): Promise<any> {
  const cacheKey = 'fullbody-avatar-hook';

  if (avatarModuleCache.has(cacheKey)) {
    logger.debug('[AvatarLazyLoader] Using cached useFullBodyAvatar');
    return avatarModuleCache.get(cacheKey);
  }

  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[AvatarLazyLoader] useFullBodyAvatar load timeout after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    );

    const module = await Promise.race([
      import('@/modules/avatar/fullbody/useFullBodyAvatar').then(
        m => m.useFullBodyAvatar
      ),
      timeoutPromise,
    ]);

    avatarModuleCache.set(cacheKey, module);

    const duration = performance.now() - startTime;
    logger.debug(
      `[AvatarLazyLoader] Loaded useFullBodyAvatar (${duration.toFixed(2)}ms)`
    );

    return module;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load useFullBodyAvatar: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Load avatar rendering engine (Tauri backend)
 * Used for avatar state management and rendering
 *
 * @returns FloatingEngine functions
 */
export async function loadAvatarFloatingEngine(timeoutMs = 3000): Promise<any> {
  const cacheKey = 'avatar-floating-engine';

  if (avatarModuleCache.has(cacheKey)) {
    logger.debug('[AvatarLazyLoader] Using cached FloatingEngine');
    return avatarModuleCache.get(cacheKey);
  }

  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `[AvatarLazyLoader] FloatingEngine load timeout after ${timeoutMs}ms`
            )
          ),
        timeoutMs
      )
    );

    const module = await Promise.race([
      import('@/modules/avatar/floating/avatarFloatingEngine'),
      timeoutPromise,
    ]);

    avatarModuleCache.set(cacheKey, module);

    const duration = performance.now() - startTime;
    logger.debug(`[AvatarLazyLoader] Loaded FloatingEngine (${duration.toFixed(2)}ms)`);

    return module;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load FloatingEngine: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Load entire avatar module by rendering mode
 * Utility function for loading all necessary components for a specific rendering mode
 *
 * @param mode - Avatar rendering mode (floating-window, floating-popup, fullbody)
 * @returns Object with all required modules for the specified mode
 */
export async function loadAvatarModuleByMode(
  mode: AvatarRenderingMode = 'floating-window',
  timeoutMs = 10000
): Promise<Record<string, any>> {
  const startTime = performance.now();
  logger.debug(`[AvatarLazyLoader] Loading avatar module: ${mode}`);

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error(`[AvatarLazyLoader] Mode load timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    );

    const loadModules = async () => {
      const results: Record<string, any> = {};

      // Always load engine and renderer
      [results.engine, results.renderer] = await Promise.all([
        loadAvatarFloatingEngine(timeoutMs / 3),
        loadThreeJSAvatarRenderer(timeoutMs / 3),
      ]);

      // Load mode-specific component
      switch (mode) {
        case 'floating-window':
          results.component = await loadAvatarFloatingWindow(timeoutMs / 3);
          break;
        case 'floating-popup':
          results.component = await loadAvatarFloatingPopup(timeoutMs / 3);
          break;
        case 'fullbody':
          results.component = await loadFullBodyAvatarHook(timeoutMs / 3);
          break;
      }

      return results;
    };

    const modules = await Promise.race([loadModules(), timeoutPromise]);

    const duration = performance.now() - startTime;
    logger.debug(`[AvatarLazyLoader] Loaded ${mode} module (${duration.toFixed(2)}ms)`);

    return modules;
  } catch (error) {
    logger.error(
      `[AvatarLazyLoader] Failed to load ${mode}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Get cache statistics
 */
export function getAvatarCacheStats(): Record<string, any> {
  return {
    cachedModules: Array.from(avatarModuleCache.keys()),
    cacheSize: avatarModuleCache.size,
  };
}

/**
 * Clear avatar module cache
 */
export function clearAvatarCache(): void {
  avatarModuleCache.clear();
  logger.debug('[AvatarLazyLoader] Avatar cache cleared');
}

/**
 * Preload avatar modules for better UX
 * Call this when avatar will soon be needed (e.g., on button hover)
 */
export async function preloadAvatarModules(
  mode: AvatarRenderingMode = 'floating-window'
): Promise<void> {
  try {
    await loadAvatarModuleByMode(mode, 15000);
    logger.debug(`[AvatarLazyLoader] Preloaded ${mode} module`);
  } catch (error) {
    logger.warn(
      `[AvatarLazyLoader] Preload for ${mode} failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
