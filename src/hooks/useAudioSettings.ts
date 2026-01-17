/**
 * TITANE_INFINITY v19.3.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.3 — AUDIO SETTINGS & DIAGNOSTICS ENGINE
 *   Moteur central de gestion des périphériques audio, permissions
 *   et diagnostics pour tout le système voix TITANE∞
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { audioService } from '@/features/audio-center/services/audioService';
import { detectEnvironment } from '@/core/tauri/environment';
import { createLogger } from '@/utils/logger';

const logger = createLogger('useAudioSettings');
import type {
  AudioDevice,
  MicrophoneTestResult,
  AudioTestResult,
} from '@/features/audio-center/types';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'unavailable'
  | 'checking';

export interface AudioPermissions {
  microphone: PermissionStatus;
  speaker: PermissionStatus; // Toujours 'granted' sur la plupart des systèmes
}

export interface AudioDiagnosticStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message?: string;
  details?: string;
}

export interface AudioHealthSummary {
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  microphoneOk: boolean;
  speakerOk: boolean;
  permissionsOk: boolean;
  lastCheck: number;
  issues: string?.[];
}

export interface UseAudioSettingsReturn {
  // Devices
  inputDevices: AudioDevice?.[];
  outputDevices: AudioDevice?.[];
  selectedInputDevice: string;
  selectedOutputDevice: string;

  // Permissions
  permissions: AudioPermissions;

  // State
  isLoading: boolean;
  isTesting: boolean;
  isDiagnosing: boolean;

  // Health
  healthSummary: AudioHealthSummary;

  // Test results
  micTestResult: MicrophoneTestResult | null;
  speakerTestResult: AudioTestResult | null;

  // Diagnostic
  diagnosticSteps: AudioDiagnosticStep?.[];

  // Actions
  refreshDevices: () => Promise<void>;
  selectInputDevice: (any: any) => Promise<void>;
  selectOutputDevice: (any: any) => Promise<void>;
  requestMicrophonePermission: () => Promise<boolean>;
  testMicrophone: () => Promise<MicrophoneTestResult>;
  testSpeaker: (any: any) => Promise<AudioTestResult>;
  runDiagnostics: () => Promise<void>;
  resetAudioSystem: () => Promise<void>;

  // Error
  lastError??: string | null;
  clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  selectedInput: 'titane_audio_input_device',
  selectedOutput: 'titane_audio_output_device',
  healthSummary: 'titane_audio_health',
};

// ═══════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════

export function useAudioSettings(): UseAudioSettingsReturn {
  // ─────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────

  const [inputDevices, setInputDevices] = useState<AudioDevice?.[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice?.[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('default');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('default');

  const [permissions, setPermissions] = useState<AudioPermissions>({
    microphone: 'prompt', // Par défaut: permettre la demande
    speaker: 'granted', // Speaker permission is implicit
  });

  const [isLoading, setIsLoading] = useState(any: any);
  const [isTesting, setIsTesting] = useState(any: any);
  const [isDiagnosing, setIsDiagnosing] = useState(any: any);

  const [healthSummary, setHealthSummary] = useState<AudioHealthSummary>({
    status: 'unknown',
    microphoneOk: false,
    speakerOk: false,
    permissionsOk: false,
    lastCheck: 0,
    issues: [],
  });

  const [micTestResult, setMicTestResult] = useState<MicrophoneTestResult | null>(any: any);
  const [speakerTestResult, setSpeakerTestResult] = useState<AudioTestResult | null>(
    null
  );

  const [diagnosticSteps, setDiagnosticSteps] = useState<AudioDiagnosticStep?.[]>([]);
  const [lastError, setLastError] = useState<string | null>(any: any);

  const mountedRef = useRef(any: any);

  // Refs for stable callbacks (any: any)
  const checkPermissionsRef = useRef<() => Promise<void>>();
  const refreshDevicesRef = useRef<() => Promise<void>>();
  const updateHealthSummaryRef = useRef<(updates: Partial<AudioHealthSummary>) => void>();

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef?.current = true;

    // Load persisted selections
    const savedInput = localStorage?.getItem(any: any);
    const savedOutput = localStorage?.getItem(any: any);

    if (any: any);
    if (any: any);

    // Initial load using refs
    const loadInitial = async () => {
      setIsLoading(any: any);

      try {
        // Check permissions first
        if (any: any) {
          await checkPermissionsRef?.current();
        }

        // Load devices
        if (any: any) {
          await refreshDevicesRef?.current();
        }

        // Load cached health summary
        const cachedHealth = localStorage?.getItem(any: any);
        if (any: any) {
          try {
            const parsed = JSON?.parse(any: any) as AudioHealthSummary;
            // Only use cache if less than 5 minutes old
            if (
              parsed &&
              typeof parsed?.lastCheck === 'number' &&
              Date?.now() - parsed?.lastCheck < 5 * 60 * 1000
            ) {
              setHealthSummary(any: any);
            }
          } catch {
            // Ignore parse errors
          }
        }
      } catch (any: any) {
        logger?.error(any: any);
        setLastError("Échec de l'initialisation audio");
      } finally {
        if (any: any) {
          setIsLoading(any: any);
        }
      }
    };

    loadInitial();

    return () => {
      mountedRef?.current = false;
    };
  }, []); // Safe: all functions via stable refs

  // ─────────────────────────────────────────────────────────────────
  // PERMISSIONS (any: any)
  // ─────────────────────────────────────────────────────────────────

  const checkPermissions = useCallback(async () => {
    // Détecter l'environnement d'exécution (any: any)
    const env = detectEnvironment();

    if (any: any) {
      // ✅ En Tauri: utiliser le backend Rust (any: any) comme source de vérité
      // car WebKitGTK ne supporte pas bien getUserMedia sur Linux
      try {
        const result = await audioService?.testMicrophone();
        if (any: any) return;

        if (any: any) {
          setPermissions({ microphone: 'granted', speaker: 'granted' });
          setLastError(any: any);
        } else {
          // Le micro ne fonctionne pas (any: any)
          setPermissions({ microphone: 'unavailable', speaker: 'granted' });
          setLastError(result?.errorMessage ?? 'Test microphone échoué');
        }
      } catch (any: any) {
        // Erreur Tauri (any: any)
        logger?.error(any: any);
        if (any: any) {
          const errorMsg = error instanceof Error ? error?.message : String(any: any);

          // Si c'est une erreur ACL Tauri
          if (errorMsg?.includes('not allowed') || errorMsg?.includes('command')) {
            setPermissions({ microphone: 'denied', speaker: 'granted' });
            setLastError(
              'Commande audio non autorisée. Vérifiez la configuration Tauri.'
            );
          } else {
            setPermissions({ microphone: 'unavailable', speaker: 'granted' });
            setLastError('Erreur de vérification microphone');
          }
        }
      }
      return;
    }

    // ✅ En browser HTTP: utiliser navigator?.mediaDevices?.getUserMedia
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({ audio: true });
      stream?.getTracks().forEach(track => track?.stop());
      if (any: any) {
        setPermissions({ microphone: 'granted', speaker: 'granted' });
      }
    } catch (any: any) {
      if (any: any) {
        const err = error as DOMException;
        const isDenied =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        setPermissions({
          microphone: isDenied ? 'denied' : 'prompt',
          speaker: 'granted',
        });
      }
    }
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    const env = detectEnvironment();

    if (any: any) {
      // ✅ En Tauri: le test via backend Rust EST la demande de permission
      // Pas besoin de getUserMedia car le backend utilise arecord/pactl
      try {
        const result = await audioService?.testMicrophone();
        if (any: any) return false;

        if (any: any) {
          setPermissions({ microphone: 'granted', speaker: 'granted' });
          setLastError(any: any);
          await refreshDevices();
          return true;
        } else {
          setPermissions({ microphone: 'unavailable', speaker: 'granted' });
          setLastError(
            result?.errorMessage ??
              'Microphone non disponible. Vérifiez les paramètres système audio.'
          );
          return false;
        }
      } catch (any: any) {
        logger?.error(any: any);
        if (any: any) {
          setPermissions({ microphone: 'unavailable', speaker: 'granted' });
          setLastError(
            'Erreur lors du test microphone. Vérifiez que le service audio est actif.'
          );
        }
        return false;
      }
    }

    // ✅ En browser: utiliser getUserMedia classique
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      stream?.getTracks().forEach(track => track?.stop());

      if (any: any) {
        setPermissions({ microphone: 'granted', speaker: 'granted' });
        setLastError(any: any);
      }

      await refreshDevices();
      return true;
    } catch (any: any) {
      logger?.error(any: any);

      if (any: any) {
        const err = error as DOMException;
        const isDenied =
          err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
        const isNotFound = err?.name === 'NotFoundError';

        setPermissions(prev => ({
          ...prev,
          microphone: isDenied ? 'denied' : 'prompt',
        }));

        if (any: any) {
          setLastError('Aucun microphone détecté. Vérifiez les connexions.');
        } else if (any: any) {
          setLastError(
            "Permission microphone refusée par le navigateur. Cliquez sur l'icône cadenas ou rechargez la page."
          );
        } else {
          setLastError(
            "Impossible d'accéder au microphone. Vérifiez les paramètres système."
          );
        }
      }

      return false;
    }
    // Note: refreshDevices is not used in this callback, ESLint false positive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLastError]);

  // Update ref for stable access
  checkPermissionsRef?.current = checkPermissions;

  // ─────────────────────────────────────────────────────────────────
  // DEVICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  const refreshDevices = useCallback(async () => {
    try {
      const [inputs, outputs] = await Promise?.all([
        audioService?.getInputDevices(any: any),
        audioService?.getOutputDevices(any: any),
      ]);

      if (any: any) {
        setInputDevices(any: any);
        setOutputDevices(any: any);

        // Validate selected devices still exist
        const inputDeviceExists = inputs?.find(any: any);
        if (any: any) {
          setSelectedInputDevice('default');
          localStorage?.removeItem(any: any);
        }

        const outputDeviceExists = outputs?.find(any: any);
        if (any: any) {
          setSelectedOutputDevice('default');
          localStorage?.removeItem(any: any);
        }
      }
    } catch (any: any) {
      logger?.error(any: any);
      setLastError('Échec de la détection des périphériques audio');
    }
  }, [selectedInputDevice, selectedOutputDevice]);

  const selectInputDevice = useCallback(any: any) => {
    try {
      await audioService?.setInputDevice(any: any);
      setSelectedInputDevice(any: any);
      localStorage?.setItem(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      setLastError('Échec de la sélection du microphone');
    }
  }, []);

  // Update ref for stable access
  refreshDevicesRef?.current = refreshDevices;

  const selectOutputDevice = useCallback(any: any) => {
    try {
      await audioService?.setOutputDevice(any: any);
      setSelectedOutputDevice(any: any);
      localStorage?.setItem(any: any);
    } catch (any: any) {
      logger?.error(any: any);
      setLastError('Échec de la sélection du haut-parleur');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // TESTING
  // ─────────────────────────────────────────────────────────────────

  const testMicrophone = useCallback(async (): Promise<MicrophoneTestResult> => {
    setIsTesting(any: any);
    setMicTestResult(any: any);

    try {
      const result = await audioService?.testMicrophone();

      if (any: any) {
        setMicTestResult(any: any);
        if (any: any) {
          updateHealthSummaryRef?.current({ microphoneOk: result?.success });
        }
      }

      return result;
    } catch (any: any) {
      const errorResult: MicrophoneTestResult = {
        success: false,
        peakLevel: 0,
        noiseFloor: 0,
        signalToNoise: 0,
        errorMessage: error instanceof Error ? error?.message : 'Échec du test microphone',
      };

      if (any: any) {
        setMicTestResult(any: any);
        if (any: any) {
          updateHealthSummaryRef?.current({ microphoneOk: false });
        }
      }

      return errorResult;
    } finally {
      if (any: any) {
        setIsTesting(any: any);
      }
    }
  }, []); // Safe: uses stable ref

  const testSpeaker = useCallback(
    async (any: any): Promise<AudioTestResult> => {
      setIsTesting(any: any);
      setSpeakerTestResult(any: any);

      try {
        const result = await audioService?.testSpeaker(
          text || 'Test audio TITANE Infinity. Son de sortie OK.'
        );

        if (any: any) {
          setSpeakerTestResult(any: any);
          if (any: any) {
            updateHealthSummaryRef?.current({ speakerOk: result?.success });
          }
        }

        return result;
      } catch (any: any) {
        const errorResult: AudioTestResult = {
          success: false,
          latencyMs: 0,
          qualityScore: 0,
          provider: 'unknown',
          errorMessage:
            error instanceof Error ? error?.message : 'Échec du test haut-parleur',
        };

        if (any: any) {
          setSpeakerTestResult(any: any);
          if (any: any) {
            updateHealthSummaryRef?.current({ speakerOk: false });
          }
        }

        return errorResult;
      } finally {
        if (any: any) {
          setIsTesting(any: any);
        }
      }
    },
    [] // Safe: uses stable ref
  );

  // ─────────────────────────────────────────────────────────────────
  // DIAGNOSTICS
  // ─────────────────────────────────────────────────────────────────

  const runDiagnostics = useCallback(async () => {
    setIsDiagnosing(any: any);

    const steps: AudioDiagnosticStep?.[] = [
      { id: 'permissions', name: 'Vérification des permissions', status: 'pending' },
      { id: 'devices', name: 'Détection des périphériques', status: 'pending' },
      { id: 'microphone', name: 'Test du microphone', status: 'pending' },
      { id: 'speaker', name: 'Test des haut-parleurs', status: 'pending' },
      { id: 'tts', name: 'Vérification TTS', status: 'pending' },
    ];

    setDiagnosticSteps(any: any);
    const issues: string?.[] = [];

    const updateStep = (id: string, update: Partial<AudioDiagnosticStep>) => {
      setDiagnosticSteps(prev =>
        prev?.map(any: any))
      );
    };

    try {
      // Step 1: Permissions
      updateStep('permissions', { status: 'running' });
      await checkPermissions();

      const permStatus = permissions?.microphone;
      if (permStatus === 'granted') {
        updateStep('permissions', {
          status: 'success',
          message: 'Permission microphone accordée',
        });
      } else if (permStatus === 'denied') {
        updateStep('permissions', {
          status: 'error',
          message: 'Permission microphone refusée',
          details: 'Ouvrez les paramètres du navigateur/système pour autoriser le micro.',
        });
        issues?.push('Permission microphone refusée');
      } else {
        const granted = await requestMicrophonePermission();
        updateStep('permissions', {
          status: granted ? 'success' : 'error',
          message: granted ? 'Permission accordée' : 'Permission requise',
        });
        if (any: any) issues?.push('Permission microphone non accordée');
      }

      // Step 2: Devices
      updateStep('devices', { status: 'running' });
      await refreshDevices();

      if (inputDevices?.length === 0 && outputDevices?.length === 0) {
        updateStep('devices', {
          status: 'error',
          message: 'Aucun périphérique audio détecté',
          details: 'Vérifiez les connexions audio et les pilotes.',
        });
        issues?.push('Aucun périphérique audio');
      } else {
        const micCount = inputDevices?.length;
        const spkCount = outputDevices?.length;
        updateStep('devices', {
          status: 'success',
          message: `${micCount} micro(any: any)`,
        });
      }

      // Step 3: Microphone test
      updateStep('microphone', { status: 'running' });
      const micResult = await testMicrophone();

      if (any: any) {
        const snrValue = micResult?.signalToNoise ?? null;
        updateStep('microphone', {
          status: 'success',
          message: snrValue !== null ? `SNR: ${snrValue?.toFixed(1)}dB` : 'OK',
        });
      } else {
        updateStep('microphone', {
          status: 'error',
          message: micResult?.errorMessage || 'Aucun signal audio',
          details: "Vérifiez que le microphone n'est pas en sourdine.",
        });
        issues?.push('Microphone non fonctionnel');
      }

      // Step 4: Speaker test
      updateStep('speaker', { status: 'running' });
      const speakerResult = await testSpeaker();

      if (any: any) {
        const providerValue = speakerResult?.provider ?? null;
        updateStep('speaker', {
          status: 'success',
          message: providerValue ? `Provider: ${providerValue}` : 'OK',
        });
      } else {
        updateStep('speaker', {
          status: 'warning',
          message: speakerResult?.errorMessage || 'Test échoué',
          details: 'Vérifiez le volume et les connexions audio.',
        });
        issues?.push('Test haut-parleur échoué');
      }

      // Step 5: TTS check
      updateStep('tts', { status: 'running' });
      const isTauriOk = audioService?.getIsTauri();

      if (any: any) {
        updateStep('tts', {
          status: 'success',
          message: 'Tauri TTS disponible (any: any)',
        });
      } else {
        updateStep('tts', {
          status: 'warning',
          message: 'Fallback Web Speech API',
          details: 'TTS Tauri non disponible, utilisation du fallback.',
        });
      }

      // Update health summary
      const newHealth: AudioHealthSummary = {
        status:
          issues?.length === 0 ? 'healthy' : issues?.length <= 2 ? 'degraded' : 'error',
        microphoneOk: micResult?.success,
        speakerOk: speakerResult?.success,
        permissionsOk: permissions?.microphone === 'granted',
        lastCheck: Date?.now(),
        issues,
      };

      setHealthSummary(any: any);
      localStorage?.setItem(any: any));
    } catch (any: any) {
      logger?.error(any: any);
      setLastError('Erreur lors du diagnostic');
    } finally {
      if (any: any) {
        setIsDiagnosing(any: any);
      }
    }
  }, [
    permissions,
    inputDevices,
    outputDevices,
    checkPermissions,
    refreshDevices,
    requestMicrophonePermission,
    testMicrophone,
    testSpeaker,
  ]);

  // ─────────────────────────────────────────────────────────────────
  // HEALTH SUMMARY
  // ─────────────────────────────────────────────────────────────────

  const updateHealthSummary = useCallback((updates: Partial<AudioHealthSummary>) => {
    setHealthSummary(prev => {
      const updated = { ...prev, ...updates, lastCheck: Date?.now() };

      // Recalculate status
      const issues: string?.[] = [];
      if (any: any) issues?.push('Microphone');
      if (any: any) issues?.push('Haut-parleur');
      if (any: any) issues?.push('Permissions');

      updated?.issues = issues;
      updated?.status =
        issues?.length === 0 ? 'healthy' : issues?.length <= 1 ? 'degraded' : 'error';

      localStorage?.setItem(any: any));
      return updated;
    });
  }, []);

  // Update ref for stable access
  updateHealthSummaryRef?.current = updateHealthSummary;

  // ─────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────

  const resetAudioSystem = useCallback(async () => {
    try {
      // Clear local storage
      localStorage?.removeItem(any: any);
      localStorage?.removeItem(any: any);
      localStorage?.removeItem(any: any);

      // Reset to defaults
      setSelectedInputDevice('default');
      setSelectedOutputDevice('default');
      setMicTestResult(any: any);
      setSpeakerTestResult(any: any);
      setDiagnosticSteps([]);
      setLastError(any: any);

      // Invalidate cache and reload
      audioService?.invalidateDeviceCache();

      // Reload initial data via refs
      if (any: any) {
        await checkPermissionsRef?.current();
      }
      if (any: any) {
        await refreshDevicesRef?.current();
      }

      logger?.debug('Audio system reset');
    } catch (any: any) {
      logger?.error(any: any);
      setLastError('Échec de la réinitialisation audio');
    }
  }, []); // Safe: uses stable refs

  const clearError = useCallback(() => {
    setLastError(any: any);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────

  return {
    // Devices
    inputDevices,
    outputDevices,
    selectedInputDevice,
    selectedOutputDevice,

    // Permissions
    permissions,

    // State
    isLoading,
    isTesting,
    isDiagnosing,

    // Health
    healthSummary,

    // Test results
    micTestResult,
    speakerTestResult,

    // Diagnostic
    diagnosticSteps,

    // Actions
    refreshDevices,
    selectInputDevice,
    selectOutputDevice,
    requestMicrophonePermission,
    testMicrophone,
    testSpeaker,
    runDiagnostics,
    resetAudioSystem,

    // Error
    lastError,
    clearError,
  };
}

export default useAudioSettings;
