import { detectEnvironment } from '@/core/tauri/environment';
/**
 * TITANE∞ v19.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.1.0 - FILE IMPORT SELF-TEST
 *   Auto-diagnostic système import fichiers
 * ═══════════════════════════════════════════════════════════════
 */

export interface FileImportSelfTestResult {
  available: boolean;
  supportedExtensions: string[];
  maxSize: number;
  tauriBackendAvailable: boolean;
  latency_ms: number;
  error?: string;
}

/**
 * Extensions de fichiers supportées
 */
const SUPPORTED_EXTENSIONS = [
  '.txt',
  '.md',
  '.json',
  '.yaml',
  '.yml',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.log',
];

/**
 * Taille maximale fichier (5 MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Test complet du système FileImport
 */
export async function fileImport_selftest(): Promise<FileImportSelfTestResult> {
  console.log('FILE IMPORT SELF-TEST: Starting...');

  const startTime = performance.now();

  try {
    // 1. Vérifier disponibilité File API
    const fileApiAvailable =
      typeof File !== 'undefined' && typeof FileReader !== 'undefined';
    console.log('File API disponible:', fileApiAvailable);

    if (!fileApiAvailable) {
      throw new Error('File API non disponible (environnement non-browser)');
    }

    // 2. Tester File Reader
    const testContent = 'Test import TITANE';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });

    const reader = new FileReader();
    const readPromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
    });

    reader.readAsText(testFile);
    const content = await readPromise;

    console.log('FileReader test:', content === testContent ? 'OK' : 'FAIL');

    if (content !== testContent) {
      throw new Error('FileReader test échoué');
    }

    // 3. Vérifier backend Tauri (MEMORY_INGEST_FILE)
    const envInfo = detectEnvironment();
    let tauriAvailable = envInfo.isTauri;

    if (!tauriAvailable && typeof window !== 'undefined') {
      const possibleTauri = window as typeof window & {
        __TAURI__?: { core?: { invoke?: unknown } };
      };
      tauriAvailable = Boolean(possibleTauri.__TAURI__?.core?.invoke);
    }

    console.log('Tauri backend:', tauriAvailable ? 'Disponible' : 'Indisponible');

    // 4. Vérifier limites taille
    console.log('Taille max fichier:', (MAX_FILE_SIZE / 1024 / 1024).toFixed(2), 'MB');
    console.log('Extensions supportées:', SUPPORTED_EXTENSIONS.join(', '));

    const latency = Math.round(performance.now() - startTime);

    console.log('[FILE IMPORT SELF-TEST] SUCCESS');
    console.log('Latency:', latency, 'ms');
    console.log('Tauri:', tauriAvailable ? 'OK' : 'Frontend only');

    return {
      available: true,
      supportedExtensions: SUPPORTED_EXTENSIONS,
      maxSize: MAX_FILE_SIZE,
      tauriBackendAvailable: tauriAvailable,
      latency_ms: latency,
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('[FILE IMPORT SELF-TEST] FAILED');
    console.error('Error:', errorMessage);

    return {
      available: false,
      supportedExtensions: SUPPORTED_EXTENSIONS,
      maxSize: MAX_FILE_SIZE,
      tauriBackendAvailable: false,
      latency_ms: latency,
      error: errorMessage,
    };
  }
}

/**
 * Validation extension fichier
 */
export function fileImport_validateExtension(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Validation taille fichier
 */
export function fileImport_validateSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Diagnostic formaté pour UI
 */
export async function fileImport_get_diagnostic(): Promise<{
  status: 'ok' | 'warn' | 'error';
  message: string;
  details: {
    fileApiAvailable: boolean;
    tauriAvailable: boolean;
    extensionsCount: number;
    maxSizeMB: number;
  };
}> {
  try {
    const result = await fileImport_selftest();

    if (!result.available) {
      return {
        status: 'error',
        message: result.error || 'Système import fichiers indisponible',
        details: {
          fileApiAvailable: false,
          tauriAvailable: false,
          extensionsCount: SUPPORTED_EXTENSIONS.length,
          maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        },
      };
    }

    if (!result.tauriBackendAvailable) {
      return {
        status: 'warn',
        message: 'Backend Tauri indisponible, mode frontend uniquement',
        details: {
          fileApiAvailable: true,
          tauriAvailable: false,
          extensionsCount: SUPPORTED_EXTENSIONS.length,
          maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
        },
      };
    }

    return {
      status: 'ok',
      message: 'Système import fichiers opérationnel',
      details: {
        fileApiAvailable: true,
        tauriAvailable: true,
        extensionsCount: SUPPORTED_EXTENSIONS.length,
        maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      details: {
        fileApiAvailable: false,
        tauriAvailable: false,
        extensionsCount: SUPPORTED_EXTENSIONS.length,
        maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
      },
    };
  }
}
