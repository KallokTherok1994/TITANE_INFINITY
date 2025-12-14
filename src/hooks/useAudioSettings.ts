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
  issues: string[];
}

export interface UseAudioSettingsReturn {
  // Devices
  inputDevices: AudioDevice[];
  outputDevices: AudioDevice[];
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
  diagnosticSteps: AudioDiagnosticStep[];

  // Actions
  refreshDevices: () => Promise<void>;
  selectInputDevice: (deviceId: string) => Promise<void>;
  selectOutputDevice: (deviceId: string) => Promise<void>;
  requestMicrophonePermission: () => Promise<boolean>;
  testMicrophone: () => Promise<MicrophoneTestResult>;
  testSpeaker: (text?: string) => Promise<AudioTestResult>;
  runDiagnostics: () => Promise<void>;
  resetAudioSystem: () => Promise<void>;

  // Error
  lastError: string | null;
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

  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('default');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('default');

  const [permissions, setPermissions] = useState<AudioPermissions>({
    microphone: 'prompt', // Par défaut: permettre la demande
    speaker: 'granted', // Speaker permission is implicit
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const [healthSummary, setHealthSummary] = useState<AudioHealthSummary>({
    status: 'unknown',
    microphoneOk: false,
    speakerOk: false,
    permissionsOk: false,
    lastCheck: 0,
    issues: [],
  });

  const [micTestResult, setMicTestResult] = useState<MicrophoneTestResult | null>(null);
  const [speakerTestResult, setSpeakerTestResult] = useState<AudioTestResult | null>(
    null
  );

  const [diagnosticSteps, setDiagnosticSteps] = useState<AudioDiagnosticStep[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // ─────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;

    // Load persisted selections
    const savedInput = localStorage.getItem(STORAGE_KEYS.selectedInput);
    const savedOutput = localStorage.getItem(STORAGE_KEYS.selectedOutput);

    if (savedInput) setSelectedInputDevice(savedInput);
    if (savedOutput) setSelectedOutputDevice(savedOutput);

    // Initial load
    loadInitialData();

    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);

    try {
      // Check permissions first
      await checkPermissions();

      // Load devices
      await refreshDevices();

      // Load cached health summary
      const cachedHealth = localStorage.getItem(STORAGE_KEYS.healthSummary);
      if (cachedHealth) {
        try {
          const parsed = JSON.parse(cachedHealth);
          // Only use cache if less than 5 minutes old
          if (Date.now() - parsed.lastCheck < 5 * 60 * 1000) {
            setHealthSummary(parsed);
          }
        } catch {
          // Ignore parse errors
        }
      }
    } catch (error) {
      console.error('[useAudioSettings] Init error:', error);
      setLastError("Échec de l'initialisation audio");
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // PERMISSIONS (Optimisé pour Tauri + Web)
  // ─────────────────────────────────────────────────────────────────

  const checkPermissions = useCallback(async () => {
    // Détecter l'environnement d'exécution (méthode robuste)
    const env = detectEnvironment();

    if (env.isTauri) {
      // ✅ En Tauri: utiliser le backend Rust (test_microphone) comme source de vérité
      // car WebKitGTK ne supporte pas bien getUserMedia sur Linux
      try {
        const result = await audioService.testMicrophone();
        if (!mountedRef.current) return;

        if (result.success) {
          setPermissions({ microphone: 'granted', speaker: 'granted' });
          setLastError(null);
        } else {
          // Le micro ne fonctionne pas (problème OS/driver)
          setPermissions({ microphone: 'unavailable', speaker: 'granted' });
          setLastError(result.errorMessage ?? 'Test microphone échoué');
        }
      } catch (error) {
        // Erreur Tauri (ACL ou autre)
        console.error('[useAudioSettings] Tauri test_microphone error:', error);
        if (mountedRef.current) {
          const errorMsg = error instanceof Error ? error.message : String(error);

          // Si c'est une erreur ACL Tauri
          if (errorMsg.includes('not allowed') || errorMsg.includes('command')) {
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

    // ✅ En browser HTTP: utiliser navigator.mediaDevices.getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      if (mountedRef.current) {
        setPermissions({ microphone: 'granted', speaker: 'granted' });
      }
    } catch (error) {
      if (mountedRef.current) {
        const err = error as DOMException;
        const isDenied =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
        setPermissions({
          microphone: isDenied ? 'denied' : 'prompt',
          speaker: 'granted',
        });
      }
    }
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    const env = detectEnvironment();

    if (env.isTauri) {
      // ✅ En Tauri: le test via backend Rust EST la demande de permission
      // Pas besoin de getUserMedia car le backend utilise arecord/pactl
      try {
        const result = await audioService.testMicrophone();
        if (!mountedRef.current) return false;

        if (result.success) {
          setPermissions({ microphone: 'granted', speaker: 'granted' });
          setLastError(null);
          await refreshDevices();
          return true;
        } else {
          setPermissions({ microphone: 'unavailable', speaker: 'granted' });
          setLastError(
            result.errorMessage ??
              'Microphone non disponible. Vérifiez les paramètres système audio.'
          );
          return false;
        }
      } catch (error) {
        console.error('[useAudioSettings] Tauri permission request failed:', error);
        if (mountedRef.current) {
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      stream.getTracks().forEach(track => track.stop());

      if (mountedRef.current) {
        setPermissions({ microphone: 'granted', speaker: 'granted' });
        setLastError(null);
      }

      await refreshDevices();
      return true;
    } catch (error) {
      console.error('[useAudioSettings] Browser permission request failed:', error);

      if (mountedRef.current) {
        const err = error as DOMException;
        const isDenied =
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
        const isNotFound = err.name === 'NotFoundError';

        setPermissions(prev => ({
          ...prev,
          microphone: isDenied ? 'denied' : 'prompt',
        }));

        if (isNotFound) {
          setLastError('Aucun microphone détecté. Vérifiez les connexions.');
        } else if (isDenied) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // DEVICE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  const refreshDevices = useCallback(async () => {
    try {
      const [inputs, outputs] = await Promise.all([
        audioService.getInputDevices(true),
        audioService.getOutputDevices(true),
      ]);

      if (mountedRef.current) {
        // Garantir que ce sont des tableaux avant de set
        setInputDevices(Array.isArray(inputs) ? inputs : []);
        setOutputDevices(Array.isArray(outputs) ? outputs : []);

        // Validate selected devices still exist
        const validInputs = Array.isArray(inputs) ? inputs : [];
        const validOutputs = Array.isArray(outputs) ? outputs : [];

        if (
          selectedInputDevice !== 'default' &&
          !validInputs.find(d => d.id === selectedInputDevice)
        ) {
          setSelectedInputDevice('default');
          localStorage.removeItem(STORAGE_KEYS.selectedInput);
        }
        if (
          selectedOutputDevice !== 'default' &&
          !validOutputs.find(d => d.id === selectedOutputDevice)
        ) {
          setSelectedOutputDevice('default');
          localStorage.removeItem(STORAGE_KEYS.selectedOutput);
        }
      }
    } catch (error) {
      console.error('[useAudioSettings] Failed to refresh devices:', error);
      setLastError('Échec de la détection des périphériques audio');
      // En cas d'erreur, garantir qu'on a au moins des tableaux vides
      if (mountedRef.current) {
        setInputDevices([]);
        setOutputDevices([]);
      }
    }
  }, [selectedInputDevice, selectedOutputDevice]);

  const selectInputDevice = useCallback(async (deviceId: string) => {
    try {
      await audioService.setInputDevice(deviceId);
      setSelectedInputDevice(deviceId);
      localStorage.setItem(STORAGE_KEYS.selectedInput, deviceId);
    } catch (error) {
      console.error('[useAudioSettings] Failed to select input device:', error);
      setLastError('Échec de la sélection du microphone');
    }
  }, []);

  const selectOutputDevice = useCallback(async (deviceId: string) => {
    try {
      await audioService.setOutputDevice(deviceId);
      setSelectedOutputDevice(deviceId);
      localStorage.setItem(STORAGE_KEYS.selectedOutput, deviceId);
    } catch (error) {
      console.error('[useAudioSettings] Failed to select output device:', error);
      setLastError('Échec de la sélection du haut-parleur');
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // TESTING
  // ─────────────────────────────────────────────────────────────────

  const testMicrophone = useCallback(async (): Promise<MicrophoneTestResult> => {
    setIsTesting(true);
    setMicTestResult(null);

    try {
      const result = await audioService.testMicrophone();

      if (mountedRef.current) {
        setMicTestResult(result);
        updateHealthSummary({ microphoneOk: result.success });
      }

      return result;
    } catch (error) {
      const errorResult: MicrophoneTestResult = {
        success: false,
        peakLevel: 0,
        noiseFloor: 0,
        signalToNoise: 0,
        errorMessage: error instanceof Error ? error.message : 'Échec du test microphone',
      };

      if (mountedRef.current) {
        setMicTestResult(errorResult);
        updateHealthSummary({ microphoneOk: false });
      }

      return errorResult;
    } finally {
      if (mountedRef.current) {
        setIsTesting(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const testSpeaker = useCallback(async (text?: string): Promise<AudioTestResult> => {
    setIsTesting(true);
    setSpeakerTestResult(null);

    try {
      const result = await audioService.testSpeaker(
        text || 'Test audio TITANE Infinity. Son de sortie OK.'
      );

      if (mountedRef.current) {
        setSpeakerTestResult(result);
        updateHealthSummary({ speakerOk: result.success });
      }

      return result;
    } catch (error) {
      const errorResult: AudioTestResult = {
        success: false,
        latencyMs: 0,
        qualityScore: 0,
        provider: 'unknown',
        errorMessage:
          error instanceof Error ? error.message : 'Échec du test haut-parleur',
      };

      if (mountedRef.current) {
        setSpeakerTestResult(errorResult);
        updateHealthSummary({ speakerOk: false });
      }

      return errorResult;
    } finally {
      if (mountedRef.current) {
        setIsTesting(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // DIAGNOSTICS
  // ─────────────────────────────────────────────────────────────────

  const runDiagnostics = useCallback(async () => {
    setIsDiagnosing(true);

    const steps: AudioDiagnosticStep[] = [
      { id: 'permissions', name: 'Vérification des permissions', status: 'pending' },
      { id: 'devices', name: 'Détection des périphériques', status: 'pending' },
      { id: 'microphone', name: 'Test du microphone', status: 'pending' },
      { id: 'speaker', name: 'Test des haut-parleurs', status: 'pending' },
      { id: 'tts', name: 'Vérification TTS', status: 'pending' },
    ];

    setDiagnosticSteps(steps);
    const issues: string[] = [];

    const updateStep = (id: string, update: Partial<AudioDiagnosticStep>) => {
      setDiagnosticSteps(prev => prev.map(s => (s.id === id ? { ...s, ...update } : s)));
    };

    try {
      // Step 1: Permissions
      updateStep('permissions', { status: 'running' });
      await checkPermissions();

      const permStatus = permissions.microphone;
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
        issues.push('Permission microphone refusée');
      } else {
        const granted = await requestMicrophonePermission();
        updateStep('permissions', {
          status: granted ? 'success' : 'error',
          message: granted ? 'Permission accordée' : 'Permission requise',
        });
        if (!granted) issues.push('Permission microphone non accordée');
      }

      // Step 2: Devices
      updateStep('devices', { status: 'running' });
      await refreshDevices();

      if (inputDevices.length === 0 && outputDevices.length === 0) {
        updateStep('devices', {
          status: 'error',
          message: 'Aucun périphérique audio détecté',
          details: 'Vérifiez les connexions audio et les pilotes.',
        });
        issues.push('Aucun périphérique audio');
      } else {
        const micCount = inputDevices.length;
        const spkCount = outputDevices.length;
        updateStep('devices', {
          status: 'success',
          message: `${micCount} micro(s), ${spkCount} haut-parleur(s)`,
        });
      }

      // Step 3: Microphone test
      updateStep('microphone', { status: 'running' });
      const micResult = await testMicrophone();

      if (micResult.success) {
        updateStep('microphone', {
          status: 'success',
          message: micResult.signalToNoise
            ? `SNR: ${micResult.signalToNoise.toFixed(1)}dB`
            : 'OK',
        });
      } else {
        updateStep('microphone', {
          status: 'error',
          message: micResult.errorMessage || 'Aucun signal audio',
          details: "Vérifiez que le microphone n'est pas en sourdine.",
        });
        issues.push('Microphone non fonctionnel');
      }

      // Step 4: Speaker test
      updateStep('speaker', { status: 'running' });
      const speakerResult = await testSpeaker();

      if (speakerResult.success) {
        updateStep('speaker', {
          status: 'success',
          message: speakerResult.provider ? `Provider: ${speakerResult.provider}` : 'OK',
        });
      } else {
        updateStep('speaker', {
          status: 'warning',
          message: speakerResult.errorMessage || 'Test échoué',
          details: 'Vérifiez le volume et les connexions audio.',
        });
        issues.push('Test haut-parleur échoué');
      }

      // Step 5: TTS check
      updateStep('tts', { status: 'running' });
      const isTauriOk = audioService.getIsTauri();

      if (isTauriOk) {
        updateStep('tts', {
          status: 'success',
          message: 'Tauri TTS disponible (Piper/Orpheus)',
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
          issues.length === 0 ? 'healthy' : issues.length <= 2 ? 'degraded' : 'error',
        microphoneOk: micResult.success,
        speakerOk: speakerResult.success,
        permissionsOk: permissions.microphone === 'granted',
        lastCheck: Date.now(),
        issues,
      };

      setHealthSummary(newHealth);
      localStorage.setItem(STORAGE_KEYS.healthSummary, JSON.stringify(newHealth));
    } catch (error) {
      console.error('[useAudioSettings] Diagnostic error:', error);
      setLastError('Erreur lors du diagnostic');
    } finally {
      if (mountedRef.current) {
        setIsDiagnosing(false);
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
      const updated = { ...prev, ...updates, lastCheck: Date.now() };

      // Recalculate status
      const issues: string[] = [];
      if (!updated.microphoneOk) issues.push('Microphone');
      if (!updated.speakerOk) issues.push('Haut-parleur');
      if (!updated.permissionsOk) issues.push('Permissions');

      updated.issues = issues;
      updated.status =
        issues.length === 0 ? 'healthy' : issues.length <= 1 ? 'degraded' : 'error';

      localStorage.setItem(STORAGE_KEYS.healthSummary, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────────────────────────

  const resetAudioSystem = useCallback(async () => {
    try {
      // Clear local storage
      localStorage.removeItem(STORAGE_KEYS.selectedInput);
      localStorage.removeItem(STORAGE_KEYS.selectedOutput);
      localStorage.removeItem(STORAGE_KEYS.healthSummary);

      // Reset to defaults
      setSelectedInputDevice('default');
      setSelectedOutputDevice('default');
      setMicTestResult(null);
      setSpeakerTestResult(null);
      setDiagnosticSteps([]);
      setLastError(null);

      // Invalidate cache and reload
      audioService.invalidateDeviceCache();
      await loadInitialData();

      console.log('[useAudioSettings] Audio system reset');
    } catch (error) {
      console.error('[useAudioSettings] Reset error:', error);
      setLastError('Échec de la réinitialisation audio');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = useCallback(() => {
    setLastError(null);
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
