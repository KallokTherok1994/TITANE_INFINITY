/**
 * Tests pour useVoice Hook
 * Coverage: Recording, Transcription, États
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVoice } from '@/hooks/useVoice';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

describe.skip('useVoice Hook (NON IMPLÉMENTÉ - hook commenté dans index.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize in idle state', () => {
      const { result } = renderHook(() => useVoice());
      expect(result.current.isRecording).toBe(false);
    });

    it('should have startRecording function', () => {
      const { result } = renderHook(() => useVoice());
      expect(typeof result.current.startRecording).toBe('function');
    });

    it('should have stopRecording function', () => {
      const { result } = renderHook(() => useVoice());
      expect(typeof result.current.stopRecording).toBe('function');
    });
  });

  describe('Recording', () => {
    it('should start recording', async () => {
      const { result } = renderHook(() => useVoice());
      
      await act(async () => {
        await result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);
    });

    it('should stop recording', async () => {
      const { result } = renderHook(() => useVoice());
      
      await act(async () => {
        await result.current.startRecording();
        await result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
    });

    it('should handle transcription', async () => {
      const { result } = renderHook(() => useVoice());
      
      await act(async () => {
        await result.current.startRecording();
        await result.current.stopRecording();
      });

      expect(result.current.transcript).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle recording errors', async () => {
      const { result } = renderHook(() => useVoice());
      
      // Simuler erreur
      const tauriCore = await import('@tauri-apps/api/core');
      vi.mocked(tauriCore.invoke).mockRejectedValueOnce(new Error('No microphone'));
      
      await act(async () => {
        try {
          await result.current.startRecording();
        } catch (e) {
          expect(result.current.error).toBeDefined();
        }
      });
    });
  });
});
