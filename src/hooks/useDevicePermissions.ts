/**
 * TITANE∞ v∞.MPE — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * DEVICE PERMISSIONS ENGINE
 * Moteur centralisé de gestion des permissions périphériques
 * Microphone, Caméra, Écran, Clavier, Souris
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { detectEnvironment, type EnvironmentInfo } from '@/core/tauri/environment';
import { secureInvoke } from '@/lib/security';
import { logger } from '@/utils/logger';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PermissionStatus =
  | 'unknown' // État initial, non vérifié
  | 'checking' // Vérification en cours
  | 'granted' // Permission accordée
  | 'denied' // Permission refusée
  | 'prompt' // L'utilisateur doit être sollicité
  | 'unsupported' // Non supporté sur cette plateforme
  | 'unavailable'; // Périphérique non disponible

export type DeviceType = 'microphone' | 'camera' | 'screen' | 'keyboard' | 'mouse';

export interface DevicePermission {
  type: DeviceType;
  status: PermissionStatus;
  lastCheck: number | null;
  error?: string;
  /** Détails spécifiques au périphérique */
  details?: Record<string, unknown>;
}

export interface DevicePermissionsState {
  microphone: DevicePermission;
  camera: DevicePermission;
  screen: DevicePermission;
  keyboard: DevicePermission;
  mouse: DevicePermission;
}

export interface DevicePermissionsResult {
  /** État de toutes les permissions */
  permissions: DevicePermissionsState;
  /** Environnement d'exécution */
  environment: EnvironmentInfo;
  /** Chargement en cours */
  isLoading: boolean;

  // Actions
  /** Vérifier toutes les permissions */
  checkAll: () => Promise<void>;
  /** Vérifier une permission spécifique */
  checkPermission: (device: DeviceType) => Promise<DevicePermission>;
  /** Demander une permission */
  requestPermission: (device: DeviceType) => Promise<boolean>;
  /** Réinitialiser l'état */
  reset: () => void;

  // OPUS-FIX v∞: Self-Healing
  /** Reset cache et re-vérifier toutes les permissions */
  resetAndRecheck: () => Promise<void>;
  /** Logger un problème de périphérique */
  logDeviceIssue: (device: DeviceType, code: string, details?: unknown) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════════

const createInitialPermission = (type: DeviceType): DevicePermission => ({
  type,
  status: 'unknown',
  lastCheck: null,
});

const initialState: DevicePermissionsState = {
  microphone: createInitialPermission('microphone'),
  camera: createInitialPermission('camera'),
  screen: createInitialPermission('screen'),
  keyboard: createInitialPermission('keyboard'),
  mouse: createInitialPermission('mouse'),
};

// ═══════════════════════════════════════════════════════════════════════════════
// TAURI MICROPHONE CHECK
// ═══════════════════════════════════════════════════════════════════════════════

interface MicrophoneTestResult {
  success: boolean;
  message?: string;
  duration_ms?: number;
  samples_recorded?: number;
}

async function checkMicrophoneTauri(): Promise<DevicePermission> {
  try {
    const result = await secureInvoke<MicrophoneTestResult>('test_microphone', {
      durationMs: 500, // Test court de 500ms
    });

    return {
      type: 'microphone',
      status: result.success ? 'granted' : 'denied',
      lastCheck: Date.now(),
      details: {
        samplesRecorded: result.samples_recorded,
        durationMs: result.duration_ms,
      },
      error: result.success ? undefined : result.message,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Distinguer les erreurs ACL Tauri des erreurs de périphérique
    if (errorMsg.includes('not allowed') || errorMsg.includes('capability')) {
      return {
        type: 'microphone',
        status: 'denied',
        lastCheck: Date.now(),
        error: 'Commande non autorisée dans Tauri. Vérifiez tauri.conf.json.',
      };
    }

    return {
      type: 'microphone',
      status: 'unavailable',
      lastCheck: Date.now(),
      error: errorMsg,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BROWSER MICROPHONE CHECK
// ═══════════════════════════════════════════════════════════════════════════════

async function checkMicrophoneBrowser(): Promise<DevicePermission> {
  // Vérifier si l'API est disponible
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      type: 'microphone',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'API MediaDevices non disponible',
    };
  }

  try {
    // Essayer d'obtenir l'accès au micro
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Libérer immédiatement les ressources
    stream.getTracks().forEach(track => track.stop());

    return {
      type: 'microphone',
      status: 'granted',
      lastCheck: Date.now(),
    };
  } catch (error) {
    const err = error as DOMException;

    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return {
        type: 'microphone',
        status: 'denied',
        lastCheck: Date.now(),
        error: "Permission microphone refusée par l'utilisateur",
      };
    }

    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return {
        type: 'microphone',
        status: 'unavailable',
        lastCheck: Date.now(),
        error: 'Aucun microphone détecté',
      };
    }

    return {
      type: 'microphone',
      status: 'denied',
      lastCheck: Date.now(),
      error: err.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA CHECK (PRÉPARATION)
// ═══════════════════════════════════════════════════════════════════════════════

async function checkCamera(env: EnvironmentInfo): Promise<DevicePermission> {
  // Pour l'instant, la caméra n'est pas implémentée côté Tauri
  // Sur Linux/WebKitGTK, le support caméra est très limité

  if (env.isTauri) {
    // Implementation: Tauri camera access via plugin or WebRTC bridge
    // - Option 1 (Native): tauri-plugin-camera with permissions in tauri.conf.json
    // - Option 2 (WebView): navigator.mediaDevices.getUserMedia() in Tauri webview
    // - Option 3 (WebRTC): Create custom Tauri command wrapping v4l2/AVFoundation/DirectShow
    // - Permissions: Add "camera" to tauri.conf.json allowlist
    // - Error handling: Catch PermissionDenied, DeviceNotFound, DeviceBusy
    // - Fallback: If camera unavailable, disable video features gracefully
    // - Detection: Check window.__TAURI__.plugins?.camera or test getUserMedia() support
    // - Future: Wait for stable tauri-plugin-camera release (currently experimental)
    return {
      type: 'camera',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'Caméra non encore implémentée en mode Tauri. Prévu pour v∞+1.',
      details: {
        reason: 'tauri_not_implemented',
        platform: 'linux',
        webkitgtk: true,
      },
    };
  }

  // Browser: tenter getUserMedia video
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      type: 'camera',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'API MediaDevices non disponible',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());

    return {
      type: 'camera',
      status: 'granted',
      lastCheck: Date.now(),
    };
  } catch (error) {
    const err = error as DOMException;

    return {
      type: 'camera',
      status: err.name === 'NotAllowedError' ? 'denied' : 'unavailable',
      lastCheck: Date.now(),
      error: err.message,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN CAPTURE CHECK (PRÉPARATION)
// ═══════════════════════════════════════════════════════════════════════════════

async function checkScreen(env: EnvironmentInfo): Promise<DevicePermission> {
  // Implementation: Screen capture via Tauri plugin
  // - Plugin: Add tauri-plugin-screenshots to Cargo.toml dependencies
  // - API: await invoke('plugin:screenshots|capture', {monitor: 0})
  // - Permissions: Add "screenshots" to tauri.conf.json allowlist
  // - Monitor selection: Get available displays with getDisplays() first
  // - Format: Save as PNG/JPEG, return base64 or file path
  // - Alternative: Use native APIs (X11/Wayland on Linux, Quartz on macOS, DXGI on Windows)
  // - Privacy: Request permission on first use, respect system privacy settings
  // - Use cases: Screenshot tool, visual memory capture, bug reporting

  if (env.isTauri) {
    return {
      type: 'screen',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'Capture écran non implémentée. Plugin requis.',
      details: {
        suggestedPlugin: 'tauri-plugin-screenshots',
        reason: 'requires_plugin',
      },
    };
  }

  // Browser: vérifier si getDisplayMedia existe
  if (!navigator.mediaDevices || !('getDisplayMedia' in navigator.mediaDevices)) {
    return {
      type: 'screen',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'API getDisplayMedia non disponible',
    };
  }

  // On ne peut pas vraiment tester sans demander la permission
  return {
    type: 'screen',
    status: 'prompt',
    lastCheck: Date.now(),
    details: {
      note: 'Capture écran nécessite interaction utilisateur',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// KEYBOARD CHECK (PRÉPARATION)
// ═══════════════════════════════════════════════════════════════════════════════

async function checkKeyboard(env: EnvironmentInfo): Promise<DevicePermission> {
  // Implementation: Global shortcuts via tauri-plugin-global-shortcut
  // - Plugin: Already available in Tauri v2 core (tauri-plugin-global-shortcut)
  // - Registration: await register('CommandOrControl+Shift+T', () => handleShortcut())
  // - Shortcuts: Support Ctrl/Cmd, Shift, Alt modifiers + any key
  // - Detection: Check window.__TAURI_INTERNALS__?.metadata?.plugins?.globalShortcut
  // - Conflicts: Detect and warn if shortcut already registered by OS/other apps
  // - Unregister: Call unregister('shortcut') or unregisterAll() on cleanup
  // - Platform differences: Cmd on macOS, Ctrl on Windows/Linux
  // - Use cases: Quick capture (Ctrl+Space), show/hide window, voice activation
  // - Permissions: May require accessibility permissions on macOS

  if (env.isTauri) {
    return {
      type: 'keyboard',
      status: 'unsupported',
      lastCheck: Date.now(),
      error: 'Raccourcis globaux non implémentés.',
      details: {
        suggestedPlugin: 'tauri-plugin-global-shortcut',
        localKeyboard: 'granted', // Les événements clavier locaux fonctionnent
      },
    };
  }

  // En browser, le clavier local fonctionne toujours
  return {
    type: 'keyboard',
    status: 'granted',
    lastCheck: Date.now(),
    details: {
      scope: 'local', // Pas de capture globale en browser
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOUSE CHECK (PRÉPARATION)
// ═══════════════════════════════════════════════════════════════════════════════

async function checkMouse(env: EnvironmentInfo): Promise<DevicePermission> {
  // La souris fonctionne toujours pour les événements locaux
  // Les événements globaux nécessiteraient un plugin spécifique

  return {
    type: 'mouse',
    status: 'granted',
    lastCheck: Date.now(),
    details: {
      scope: 'local',
      globalCapture: env.isTauri ? 'not_implemented' : 'not_available',
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useDevicePermissions(): DevicePermissionsResult {
  const [permissions, setPermissions] = useState<DevicePermissionsState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [environment] = useState<EnvironmentInfo>(() => detectEnvironment());
  const mountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Vérifier une permission spécifique
  const checkPermission = useCallback(
    async (device: DeviceType): Promise<DevicePermission> => {
      setPermissions(prev => ({
        ...prev,
        [device]: { ...prev[device], status: 'checking' },
      }));

      let result: DevicePermission;

      switch (device) {
        case 'microphone':
          result = environment.isTauri
            ? await checkMicrophoneTauri()
            : await checkMicrophoneBrowser();
          break;
        case 'camera':
          result = await checkCamera(environment);
          break;
        case 'screen':
          result = await checkScreen(environment);
          break;
        case 'keyboard':
          result = await checkKeyboard(environment);
          break;
        case 'mouse':
          result = await checkMouse(environment);
          break;
        default:
          result = {
            type: device,
            status: 'unknown',
            lastCheck: Date.now(),
            error: 'Type de périphérique inconnu',
          };
      }

      if (mountedRef.current) {
        setPermissions(prev => ({
          ...prev,
          [device]: result,
        }));
      }

      return result;
    },
    [environment]
  );

  // Vérifier toutes les permissions
  const checkAll = useCallback(async () => {
    setIsLoading(true);

    try {
      await Promise.all([
        checkPermission('microphone'),
        checkPermission('camera'),
        checkPermission('screen'),
        checkPermission('keyboard'),
        checkPermission('mouse'),
      ]);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [checkPermission]);

  // Demander une permission
  const requestPermission = useCallback(
    async (device: DeviceType): Promise<boolean> => {
      const result = await checkPermission(device);
      return result.status === 'granted';
    },
    [checkPermission]
  );

  // Réinitialiser l'état local
  const reset = useCallback(() => {
    setPermissions(initialState);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════════
  // OPUS-FIX v∞: SELF-HEALING — Reset cache et forcer re-vérification
  // ═══════════════════════════════════════════════════════════════════════════════

  /**
   * Réinitialise le cache des permissions et force une re-vérification complète
   * Utilisé par le Self-Healing Engine pour récupérer d'un état incohérent
   */
  const resetAndRecheck = useCallback(async () => {
    logger.debug('🔄 Reset cache et re-vérification...');

    // 1. Reset état local
    setPermissions(initialState);

    // 2. Clear localStorage cache si présent
    try {
      localStorage.removeItem('titane_device_permissions_cache');
    } catch {
      // Ignore localStorage errors
    }

    // 3. Petit délai pour laisser les états se réinitialiser
    await new Promise(resolve => setTimeout(resolve, 100));

    // 4. Re-vérifier toutes les permissions
    await checkAll();

    logger.debug('✅ Reset et re-vérification terminés');
  }, [checkAll]);

  /**
   * Log structuré pour les problèmes de périphériques
   * Compatible avec le Self-Healing Engine
   */
  const logDeviceIssue = useCallback(
    (device: DeviceType, code: string, details?: unknown) => {
      const timestamp = new Date().toISOString();
      const entry = {
        timestamp,
        device,
        code,
        environment: environment.isTauri ? 'tauri' : 'browser',
        details,
      };

      logger.warn(`[DeviceIssue][${device.toUpperCase()}] ${code}`, entry);

      // Stocker dans localStorage pour debugging (max 50 entrées)
      try {
        const logs = JSON.parse(localStorage.getItem('titane_device_issues') || '[]');
        logs.push(entry);
        if (logs.length > 50) logs.shift();
        localStorage.setItem('titane_device_issues', JSON.stringify(logs));
      } catch {
        // Ignore localStorage errors
      }
    },
    [environment.isTauri]
  );

  // Vérification initiale au montage
  useEffect(() => {
    // Vérifier uniquement le microphone au démarrage (le plus utilisé)
    checkPermission('microphone');
  }, [checkPermission]);

  return {
    permissions,
    environment,
    isLoading,
    checkAll,
    checkPermission,
    requestPermission,
    reset,
    // OPUS-FIX v∞: Self-Healing exports
    resetAndRecheck,
    logDeviceIssue,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS SPÉCIALISÉS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook simplifié pour les permissions microphone uniquement
 */
export function useMicrophonePermission() {
  const { permissions, checkPermission, requestPermission, environment } =
    useDevicePermissions();

  return {
    status: permissions.microphone.status,
    error: permissions.microphone.error,
    isTauri: environment.isTauri,
    check: () => checkPermission('microphone'),
    request: () => requestPermission('microphone'),
  };
}

/**
 * Hook simplifié pour les permissions caméra (préparation)
 */
export function useCameraPermission() {
  const { permissions, checkPermission, requestPermission, environment } =
    useDevicePermissions();

  return {
    status: permissions.camera.status,
    error: permissions.camera.error,
    isTauri: environment.isTauri,
    isSupported: permissions.camera.status !== 'unsupported',
    check: () => checkPermission('camera'),
    request: () => requestPermission('camera'),
  };
}

/**
 * Hook simplifié pour les permissions écran (préparation)
 */
export function useScreenPermission() {
  const { permissions, checkPermission, environment } = useDevicePermissions();

  return {
    status: permissions.screen.status,
    error: permissions.screen.error,
    isTauri: environment.isTauri,
    isSupported: permissions.screen.status !== 'unsupported',
    check: () => checkPermission('screen'),
  };
}

export default useDevicePermissions;
