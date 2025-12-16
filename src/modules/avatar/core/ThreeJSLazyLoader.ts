// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ v25.3.0 — THREE.JS LAZY LOADER
//   YOLO OPT-1: Lazy-load Three.js (-400 KB gzip)
//   Charge Three.js dynamiquement uniquement quand avatar activé
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Three.js Lazy Loader
 *
 * AVANT: `import * as THREE from 'three'` dans 11+ fichiers → 38 MB chargé au boot
 * APRÈS: Dynamic import uniquement quand avatar activé → -400 KB gzip bundle
 *
 * Usage:
 * ```typescript
 * const THREE = await loadThreeJS();
 * const scene = new THREE.Scene();
 * ```
 */

let cachedTHREE: typeof import('three') | null = null;
let loadingPromise: Promise<typeof import('three')> | null = null;

/**
 * Charge Three.js dynamiquement (avec cache)
 * @returns Promise<THREE> - Module Three.js complet
 */
export async function loadThreeJS(): Promise<typeof import('three')> {
  // Si déjà chargé, retourner cache
  if (cachedTHREE) {
    return cachedTHREE;
  }

  // Si chargement en cours, attendre
  if (loadingPromise) {
    return loadingPromise;
  }

  // Démarrer le chargement
  console.log('⚡ [YOLO OPT-1] Lazy-loading Three.js (38 MB)...');
  loadingPromise = import('three')
    .then(THREE => {
      cachedTHREE = THREE;
      console.log('✅ [YOLO OPT-1] Three.js loaded and cached');
      return THREE;
    })
    .catch(error => {
      console.error('❌ [YOLO OPT-1] Failed to load Three.js:', error);
      loadingPromise = null; // Reset pour retry
      throw error;
    });

  return loadingPromise;
}

/**
 * Vérifie si Three.js est déjà chargé
 * @returns boolean
 */
export function isThreeJSLoaded(): boolean {
  return cachedTHREE !== null;
}

/**
 * Précharge Three.js en background (optionnel)
 * Utile pour preload après boot principal
 */
export function preloadThreeJS(): void {
  if (!cachedTHREE && !loadingPromise) {
    console.log('🔄 [YOLO OPT-1] Preloading Three.js in background...');
    loadThreeJS().catch(() => {
      // Silent fail, sera retry à l'usage
    });
  }
}

/**
 * Helper: Crée un namespace THREE compatible
 * Pour migration progressive des imports statiques
 */
export async function getThreeNamespace(): Promise<typeof import('three')> {
  return loadThreeJS();
}
