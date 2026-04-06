import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AudioDiagnosticsPanel } from '@/components/audio/AudioDiagnosticsPanel';

const clearError = vi.fn();

vi.mock('@/hooks/useAudioSettings', () => ({
  useAudioSettings: () => ({
    inputDevices: [],
    outputDevices: [],
    selectedInputDevice: null,
    selectedOutputDevice: null,
    permissions: { microphone: 'prompt' },
    isLoading: false,
    isTesting: false,
    isDiagnosing: false,
    healthSummary: { status: 'degraded' },
    micTestResult: null,
    speakerTestResult: null,
    diagnosticSteps: [],
    refreshDevices: vi.fn(),
    selectInputDevice: vi.fn(),
    selectOutputDevice: vi.fn(),
    requestMicrophonePermission: vi.fn(),
    testMicrophone: vi.fn(),
    testSpeaker: vi.fn(),
    runDiagnostics: vi.fn(),
    resetAudioSystem: vi.fn(),
    lastError: 'Microphone unavailable',
    clearError,
  }),
}));

describe('AudioDiagnosticsPanel', () => {
  it('exposes accessible close actions for the panel and error banner', () => {
    const onClose = vi.fn();

    render(<AudioDiagnosticsPanel onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /fermer le panneau audio/i }));
    fireEvent.click(screen.getByRole('button', { name: /effacer l'erreur audio/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(clearError).toHaveBeenCalledTimes(1);
  });
});
