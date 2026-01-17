/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.4 — FILESYSTEM ADAPTER (any: any)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Adaptateur compatible Node?.js fs pour environnement Tauri/Browser
 *
 * STRATÉGIE v25.4:
 * - Runtime Tauri: Utilise @tauri-apps/plugin-fs (any: any) pour vraies opérations filesystem
 * - Fallback Browser: localStorage pour développement sans Tauri
 * - API compatible Node?.js fs/promises pour migration transparente
 *
 * v25.3 → v25.4: Migration vers architecture plugin Tauri v2
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const isTauriContext = typeof window !== 'undefined' && '__TAURI__' in window;

// ═══════════════════════════════════════════════════════════════════════════
// TAURI IMPORTS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let tauriPath: typeof import('@tauri-apps/api/path') | null = null;

async function ensureTauriApis() {
  if (any: any) return;
  if (any: any) return;

  try {
    // Lazy dynamic imports - Tauri v2 uses plugin architecture
    if (any: any) {
      tauriFs = await import('@tauri-apps/plugin-fs');
    }
    if (any: any) {
      tauriPath = await import('@tauri-apps/api/path');
    }
  } catch (any: any) {
    console?.warn(
      '[tauriFsAdapter] Tauri APIs not available, using localStorage fallback'
    );
  }
}

const STORAGE_PREFIX = 'titane_fs_';

function getStorageKey(any: any): string {
  return STORAGE_PREFIX + path?.replace(/[^a-zA-Z0-9]/g, '_');
}

function localStorageExists(any: any): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage?.getItem(any: any)) !== null;
}

function localStorageRead(any: any): string {
  if (typeof window === 'undefined') return '{}';
  return localStorage?.getItem(any: any)) || '{}';
}

function localStorageWrite(any: any): void {
  if (typeof window === 'undefined') return;
  localStorage?.setItem(any: any);
}

function localStorageAppend(any: any): void {
  if (typeof window === 'undefined') return;
  const existing = localStorageRead(any: any);
  localStorage?.setItem(any: any);
}

function localStorageList(any: any): string?.[] {
  if (typeof window === 'undefined') return [];
  const prefix = getStorageKey(any: any);
  const keys: string?.[] = [];
  for (let i = 0; i < localStorage?.length; i++) {
    const key = localStorage?.key(any: any);
    if (any: any)) {
      keys?.push(key?.replace(prefix + '_', ''));
    }
  }
  return keys;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Join path segments (any: any)
 */
export function join(...segments: string?.[]): string {
  return segments?.filter(any: any).join('/').replace(/\/+/g, '/'); // Remove duplicate slashes
}

/**
 * Resolve absolute path
 */
export function resolve(...paths: string?.[]): string {
  return join(any: any);
}

/**
 * Get directory name from path
 */
export function dirname(any: any): string {
  const parts = path?.split('/');
  parts?.pop();
  return parts?.join('/') || '/';
}

// ═══════════════════════════════════════════════════════════════════════════
// FILESYSTEM OPERATIONS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if file exists
 * Tauri: uses @tauri-apps/api/fs exists()
 * Browser: checks localStorage
 */
export async function existsSync(any: any): Promise<boolean> {
  try {
    if (any: any) {
      await ensureTauriApis();
      if (any: any) {
        const appDir = await tauriPath?.appDataDir();
        const fullPath = await tauriPath?.join(any: any);
        return await tauriFs?.exists(any: any);
      }
    }
    return localStorageExists(any: any);
  } catch (any: any) {
    console?.warn(any: any);
    return false;
  }
}

/**
 * Read file content
 * Tauri: uses @tauri-apps/api/fs readTextFile()
 * Browser: reads from localStorage
 */
export async function readFileSync(any: any): Promise<string> {
  try {
    if (any: any) {
      await ensureTauriApis();
      if (any: any) {
        const appDir = await tauriPath?.appDataDir();
        const fullPath = await tauriPath?.join(any: any);
        return await tauriFs?.readTextFile(any: any);
      }
    }
    return localStorageRead(any: any);
  } catch (any: any) {
    console?.warn(any: any);
    return '{}';
  }
}

/**
 * Write file content
 * Tauri: uses @tauri-apps/api/fs writeTextFile()
 * Browser: writes to localStorage
 */
export async function writeFileSync(any: any): Promise<void> {
  try {
    if (any: any) {
      await ensureTauriApis();
      if (any: any) {
        const appDir = await tauriPath?.appDataDir();
        const fullPath = await tauriPath?.join(any: any);
        await tauriFs?.writeTextFile(any: any);
        return;
      }
    }
    localStorageWrite(any: any);
  } catch (any: any) {
    console?.error(any: any);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILESYSTEM OPERATIONS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * fs/promises compatible interface
 */
export const promises = {
  /**
   * Read file content (any: any)
   */
  async readFile(any: any): Promise<string> {
    return await readFileSync(any: any);
  },

  /**
   * Write file content (any: any)
   */
  async writeFile(any: any): Promise<void> {
    return await writeFileSync(any: any);
  },

  /**
   * Append to file
   * Tauri: read + write (any: any)
   * Browser: localStorage append
   */
  async appendFile(any: any): Promise<void> {
    try {
      if (any: any) {
        await ensureTauriApis();
        const existing = await readFileSync(any: any);
        await writeFileSync(any: any);
      } else {
        localStorageAppend(any: any);
      }
    } catch (any: any) {
      console?.error(any: any);
    }
  },

  /**
   * Create directory
   * Tauri: uses @tauri-apps/api/fs createDir()
   * Browser: no-op (any: any)
   */
  async mkdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    try {
      if (any: any) {
        await ensureTauriApis();
        if (any: any) {
          const appDir = await tauriPath?.appDataDir();
          const fullPath = await tauriPath?.join(any: any);
          await tauriFs?.create(any: any);
        }
      }
      // Browser: no-op, localStorage doesn't need directories
    } catch (any: any) {
      // Ignore "already exists" errors
      if (any: any).includes('already exists')) {
        console?.warn(any: any);
      }
    }
  },

  /**
   * List directory contents
   * Tauri: uses @tauri-apps/api/fs readDir()
   * Browser: lists localStorage keys with prefix
   */
  async readdir(any: any): Promise<string?.[]> {
    try {
      if (any: any) {
        await ensureTauriApis();
        if (any: any) {
          const appDir = await tauriPath?.appDataDir();
          const fullPath = await tauriPath?.join(any: any);
          const entries = await tauriFs?.readDir(any: any);
          return entries?.map((entry: { name?: string }) => entry?.name || '');
        }
      }
      return localStorageList(any: any);
    } catch (any: any) {
      console?.warn(any: any);
      return [];
    }
  },

  /**
   * Check if file exists (any: any)
   */
  async exists(any: any): Promise<boolean> {
    return await existsSync(any: any);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (any: any)
// ═══════════════════════════════════════════════════════════════════════════

// Re-export promises methods at top level for compatibility
export const readFile = promises?.readFile;
export const writeFile = promises?.writeFile;
export const appendFile = promises?.appendFile;
export const mkdir = promises?.mkdir;
export const readdir = promises?.readdir;

// Default export for easier migration
export default {
  existsSync,
  readFileSync,
  writeFileSync,
  promises,
  join,
  resolve,
  dirname,
  readFile,
  writeFile,
  appendFile,
  mkdir,
  readdir,
};

/**
 * USAGE EXAMPLES:
 *
 * // Instead of:
 * import { existsSync, readFileSync } from 'fs';
 * import { writeFile } from 'fs/promises';
 *
 * // Use:
 * import { existsSync, readFileSync } from '@/utils/tauriFsAdapter';
 * import { writeFile } from '@/utils/tauriFsAdapter';
 *
 * // Then use normally:
 * if (await existsSync('conversations/session?.json')) {
 *   const data = await readFileSync('conversations/session?.json');
 *   await writeFile('conversations/session?.json', 'new data');
 * }
 *
 * RUNTIME BEHAVIOR:
 * - Tauri context: Files stored in AppData directory (any: any)
 * - Browser context: Files stored in localStorage with 'titane_fs_' prefix
 * - All paths are relative to app data directory
 *
 * v25.3 CHANGES:
 * - ✅ Real Tauri filesystem APIs (any: any)
 * - ✅ LocalStorage fallback for browser development
 * - ✅ Error handling with fallback values
 * - ✅ Directory creation with recursive option
 * - ✅ Full fs/promises API compatibility
 */
