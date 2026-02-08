/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.4 — FILESYSTEM ADAPTER (Tauri v2 Plugin Architecture)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Adaptateur compatible Node.js fs pour environnement Tauri/Browser
 *
 * STRATÉGIE v25.4:
 * - Runtime Tauri: Utilise @tauri-apps/plugin-fs (Tauri v2) pour vraies opérations filesystem
 * - Fallback Browser: localStorage pour développement sans Tauri
 * - API compatible Node.js fs/promises pour migration transparente
 *
 * v25.3 → v25.4: Migration vers architecture plugin Tauri v2
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME DETECTION
// ═══════════════════════════════════════════════════════════════════════════

const canAttemptTauri = typeof window !== 'undefined';

// ═══════════════════════════════════════════════════════════════════════════
// TAURI IMPORTS (Lazy loaded to avoid errors in browser-only builds)
// ═══════════════════════════════════════════════════════════════════════════

let tauriFs: typeof import('@tauri-apps/plugin-fs') | null = null;
let tauriPath: typeof import('@tauri-apps/api/path') | null = null;

async function ensureTauriApis(): Promise<boolean> {
  if (!canAttemptTauri) return false;
  if (tauriFs && tauriPath) return true;

  try {
    // Lazy dynamic imports - Tauri v2 uses plugin architecture
    if (!tauriFs) {
      tauriFs = await import('@tauri-apps/plugin-fs');
    }
    if (!tauriPath) {
      tauriPath = await import('@tauri-apps/api/path');
    }
  } catch (error) {
    console.warn(
      '[tauriFsAdapter] Tauri APIs not available, using localStorage fallback'
    );
  }
  return Boolean(tauriFs && tauriPath);
}

const STORAGE_PREFIX = 'titane_fs_';

function getStorageKey(path: string): string {
  return STORAGE_PREFIX + path.replace(/[^a-zA-Z0-9]/g, '_');
}

function localStorageExists(path: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getStorageKey(path)) !== null;
}

function localStorageRead(path: string): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(getStorageKey(path)) || '';
}

function localStorageWrite(path: string, data: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(path), data);
}

function localStorageAppend(path: string, data: string): void {
  if (typeof window === 'undefined') return;
  const existing = localStorageRead(path);
  localStorage.setItem(getStorageKey(path), existing + data);
}

function localStorageList(path: string): string[] {
  if (typeof window === 'undefined') return [];
  const prefix = getStorageKey(path);
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key.replace(prefix + '_', ''));
    }
  }
  return keys;
}

// ═══════════════════════════════════════════════════════════════════════════
// PATH UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Join path segments (simple concatenation, compatible Node.js path.join)
 */
export function join(...segments: string[]): string {
  return segments.filter(Boolean).join('/').replace(/\/+/g, '/'); // Remove duplicate slashes
}

/**
 * Resolve absolute path
 */
export function resolve(...paths: string[]): string {
  return join(...paths);
}

/**
 * Get directory name from path
 */
export function dirname(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

// ═══════════════════════════════════════════════════════════════════════════
// FILESYSTEM OPERATIONS (Tauri + LocalStorage Fallback)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if file exists
 * Tauri: uses @tauri-apps/api/fs exists()
 * Browser: checks localStorage
 */
export async function existsSync(path: string): Promise<boolean> {
  try {
    if (await ensureTauriApis()) {
      if (tauriPath && tauriFs) {
        const appDir = await tauriPath.appDataDir();
        const fullPath = await tauriPath.join(appDir, path);
        return await tauriFs.exists(fullPath);
      }
    }
    return localStorageExists(path);
  } catch (error) {
    console.warn('[tauriFsAdapter] existsSync error:', error);
    return false;
  }
}

/**
 * Read file content
 * Tauri: uses @tauri-apps/api/fs readTextFile()
 * Browser: reads from localStorage
 */
export async function readFileSync(path: string, _encoding?: string): Promise<string> {
  try {
    if (await ensureTauriApis()) {
      if (tauriPath && tauriFs) {
        const appDir = await tauriPath.appDataDir();
        const fullPath = await tauriPath.join(appDir, path);
        return await tauriFs.readTextFile(fullPath);
      }
    }
    return localStorageRead(path);
  } catch (error) {
    console.warn('[tauriFsAdapter] readFileSync error:', error);
    return '';
  }
}

/**
 * Write file content
 * Tauri: uses @tauri-apps/api/fs writeTextFile()
 * Browser: writes to localStorage
 */
export async function writeFileSync(path: string, data: string): Promise<void> {
  try {
    if (await ensureTauriApis()) {
      if (tauriPath && tauriFs) {
        const appDir = await tauriPath.appDataDir();
        const fullPath = await tauriPath.join(appDir, path);
        await tauriFs.writeTextFile(fullPath, data);
        return;
      }
    }
    localStorageWrite(path, data);
  } catch (error) {
    console.error('[tauriFsAdapter] writeFileSync error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FILESYSTEM OPERATIONS (Async Promises API)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * fs/promises compatible interface
 */
export const promises = {
  /**
   * Read file content (async)
   */
  async readFile(path: string, _encoding?: BufferEncoding): Promise<string> {
    return await readFileSync(path);
  },

  /**
   * Write file content (async)
   */
  async writeFile(path: string, data: string, _encoding?: string): Promise<void> {
    return await writeFileSync(path, data);
  },

  /**
   * Append to file
   * Tauri: read + write (no native append)
   * Browser: localStorage append
   */
  async appendFile(path: string, data: string, _encoding?: string): Promise<void> {
    try {
      if (await ensureTauriApis()) {
        const existing = await readFileSync(path);
        await writeFileSync(path, existing + data);
      } else {
        localStorageAppend(path, data);
      }
    } catch (error) {
      console.error('[tauriFsAdapter] appendFile error:', error);
    }
  },

  /**
   * Create directory
   * Tauri: uses @tauri-apps/api/fs createDir()
   * Browser: no-op (localStorage has no dirs)
   */
  async mkdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    try {
      if (await ensureTauriApis()) {
        if (tauriPath && tauriFs) {
          const appDir = await tauriPath.appDataDir();
          const fullPath = await tauriPath.join(appDir, path);
          const fsAny = tauriFs as typeof tauriFs & {
            createDir?: (path: string, options?: { recursive?: boolean }) => Promise<void>;
            mkdir?: (path: string, options?: { recursive?: boolean }) => Promise<void>;
            create?: (path: string) => Promise<void>;
          };
          if (fsAny.createDir) {
            await fsAny.createDir(fullPath, { recursive: true });
          } else if (fsAny.mkdir) {
            await fsAny.mkdir(fullPath, { recursive: true });
          } else if (fsAny.create) {
            await fsAny.create(fullPath);
          }
        }
      }
      // Browser: no-op, localStorage doesn't need directories
    } catch (error) {
      // Ignore "already exists" errors
      if (!String(error).includes('already exists')) {
        console.warn('[tauriFsAdapter] mkdir error:', error);
      }
    }
  },

  /**
   * List directory contents
   * Tauri: uses @tauri-apps/api/fs readDir()
   * Browser: lists localStorage keys with prefix
   */
  async readdir(path: string): Promise<string[]> {
    try {
      if (await ensureTauriApis()) {
        if (tauriPath && tauriFs) {
          const appDir = await tauriPath.appDataDir();
          const fullPath = await tauriPath.join(appDir, path);
          const entries = await tauriFs.readDir(fullPath);
          return entries.map((entry: { name?: string }) => entry.name || '');
        }
      }
      return localStorageList(path);
    } catch (error) {
      console.warn('[tauriFsAdapter] readdir error:', error);
      return [];
    }
  },

  /**
   * Check if file exists (alias)
   */
  async exists(path: string): Promise<boolean> {
    return await existsSync(path);
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS (Node.js fs compatible)
// ═══════════════════════════════════════════════════════════════════════════

// Re-export promises methods at top level for compatibility
export const readFile = promises.readFile;
export const writeFile = promises.writeFile;
export const appendFile = promises.appendFile;
export const mkdir = promises.mkdir;
export const readdir = promises.readdir;

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
 * if (await existsSync('conversations/session.json')) {
 *   const data = await readFileSync('conversations/session.json');
 *   await writeFile('conversations/session.json', 'new data');
 * }
 *
 * RUNTIME BEHAVIOR:
 * - Tauri context: Files stored in AppData directory (OS-specific)
 * - Browser context: Files stored in localStorage with 'titane_fs_' prefix
 * - All paths are relative to app data directory
 *
 * v25.3 CHANGES:
 * - ✅ Real Tauri filesystem APIs (@tauri-apps/api/fs)
 * - ✅ LocalStorage fallback for browser development
 * - ✅ Error handling with fallback values
 * - ✅ Directory creation with recursive option
 * - ✅ Full fs/promises API compatibility
 */
