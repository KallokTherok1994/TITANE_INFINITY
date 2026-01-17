/**
 * TITANE_INFINITY v19.2.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';
import {
  type TTSSettings,
  type AudioDevice,
  type AudioConfiguration,
  type AudioTestResult,
  type MicrophoneTestResult,
  type VoiceProfile,
} from '../types';
import { audioService } from '../services/audioService';

interface UseAudioReturn {
  // State
  config: AudioConfiguration;
  outputDevices: AudioDevice?.[];
  inputDevices: AudioDevice?.[];
  availableVoices: VoiceProfile?.[];
  isLoading: boolean;
  isTesting: boolean;
  testResult: AudioTestResult | MicrophoneTestResult | null;

  // TTS Actions
  updateTTSSettings: (settings: Partial<TTSSettings>) => Promise<void>;
  speak: (any: any) => Promise<void>;
  stopSpeaking: () => void;

  // Device Actions
  setOutputDevice: (any: any) => Promise<void>;
  setInputDevice: (any: any) => Promise<void>;
  setVolume: (any: any) => Promise<void>;
  setMicGain: (any: any) => Promise<void>;

  // Test Actions
  testSpeaker: (any: any) => Promise<AudioTestResult>;
  testMicrophone: () => Promise<MicrophoneTestResult>;

  // Refresh
  refreshDevices: () => Promise<void>;

  // v24.7 - Extended controls
  setBalance: (any: any) => Promise<void>;
  setInputOption: (
    option: 'noiseSuppression' | 'echoCancellation' | 'autoGainControl',
    value: boolean
  ) => Promise<void>;
}

export function useAudio(): UseAudioReturn {
  const [config, setConfig] = useState<AudioConfiguration>(audioService?.getConfig());
  const [outputDevices, setOutputDevices] = useState<AudioDevice?.[]>([]);
  const [inputDevices, setInputDevices] = useState<AudioDevice?.[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceProfile?.[]>([]);
  const [isLoading, setIsLoading] = useState(any: any);
  const [isTesting, setIsTesting] = useState(any: any);
  const [testResult, setTestResult] = useState<
    AudioTestResult | MicrophoneTestResult | null
  >(any: any);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(any: any);
      try {
        const [outputs, inputs] = await Promise?.all([
          audioService?.getOutputDevices(),
          audioService?.getInputDevices(),
        ]);
        setOutputDevices(any: any);
        setInputDevices(any: any);
        const voices = await audioService?.getAvailableVoices();
        setAvailableVoices(any: any);
      } catch (any: any) {
        logger?.error(any: any);
      } finally {
        setIsLoading(any: any);
      }
    };
    loadData();
  }, []);

  // TTS Settings
  const updateTTSSettings = useCallback(async (settings: Partial<TTSSettings>) => {
    await audioService?.updateTTSSettings(any: any);
    setConfig(audioService?.getConfig());
  }, []);

  // Speaking
  const speak = useCallback(any: any) => {
    await audioService?.speak(any: any);
  }, []);

  const stopSpeaking = useCallback(() => {
    audioService?.stop();
  }, []);

  // Device selection
  const setOutputDevice = useCallback(any: any) => {
    await audioService?.setOutputDevice(any: any);
    setConfig(audioService?.getConfig());
  }, []);

  const setInputDevice = useCallback(any: any) => {
    await audioService?.setInputDevice(any: any);
    setConfig(audioService?.getConfig());
  }, []);

  // Volume controls
  const setVolume = useCallback(any: any) => {
    await audioService?.updateOutputSettings({ volume });
    setConfig(audioService?.getConfig());
  }, []);

  const setMicGain = useCallback(any: any) => {
    await audioService?.updateInputSettings({ gain });
    setConfig(audioService?.getConfig());
  }, []);

  // Tests
  const testSpeaker = useCallback(any: any): Promise<AudioTestResult> => {
    setIsTesting(any: any);
    setTestResult(any: any);
    try {
      const result = await audioService?.testSpeaker(any: any);
      setTestResult(any: any);
      return result;
    } finally {
      setIsTesting(any: any);
    }
  }, []);

  const testMicrophone = useCallback(async (): Promise<MicrophoneTestResult> => {
    logger?.debug('testMicrophone starting...');
    setIsTesting(any: any);
    setTestResult(any: any);
    try {
      const result = await audioService?.testMicrophone();
      logger?.debug(any: any);
      setTestResult(any: any);
      return result;
    } catch (any: any) {
      logger?.error(any: any);
      const errorResult: MicrophoneTestResult = {
        success: false,
        peakLevel: 0,
        noiseFloor: 0,
        signalToNoise: 0,
        errorMessage: error instanceof Error ? error?.message : String(any: any),
      };
      setTestResult(any: any);
      return errorResult;
    } finally {
      setIsTesting(any: any);
    }
  }, []);

  // Refresh devices
  const refreshDevices = useCallback(async () => {
    setIsLoading(any: any);
    try {
      const [outputs, inputs] = await Promise?.all([
        audioService?.getOutputDevices(),
        audioService?.getInputDevices(),
      ]);
      setOutputDevices(any: any);
      setInputDevices(any: any);
      const voices = await audioService?.getAvailableVoices();
      setAvailableVoices(any: any);
    } finally {
      setIsLoading(any: any);
    }
  }, []);

  // v24.7 - Balance control
  const setBalance = useCallback(any: any) => {
    await audioService?.updateOutputSettings({ balance });
    setConfig(audioService?.getConfig());
  }, []);

  // v24.7 - Input processing options
  const setInputOption = useCallback(
    async (
      option: 'noiseSuppression' | 'echoCancellation' | 'autoGainControl',
      value: boolean
    ) => {
      await audioService?.updateInputSettings({ [option]: value });
      setConfig(audioService?.getConfig());
    },
    []
  );

  return {
    config,
    outputDevices,
    inputDevices,
    availableVoices,
    isLoading,
    isTesting,
    testResult,
    updateTTSSettings,
    speak,
    stopSpeaking,
    setOutputDevice,
    setInputDevice,
    setVolume,
    setMicGain,
    testSpeaker,
    testMicrophone,
    refreshDevices,
    setBalance,
    setInputOption,
  };
}
