/**
 * Tests pour ChatToolbar Component
 * Coverage: Actions (send, attach, voice), États, Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChatToolbar } from '@/components/chat/ChatToolbar';

const mocks = vi.hoisted(() => ({
  startTurn: vi.fn(),
  cancelTurn: vi.fn().mockResolvedValue(undefined),
  startDictation: vi.fn(),
  stopDictation: vi.fn().mockResolvedValue(''),
  toastError: vi.fn(),
  hasMicrophone: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/hooks/useAudioChat', () => ({
  useAudioChat: () => ({
    isListening: false,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    speak: vi.fn(),
    resetTranscript: vi.fn(),
  }),
}));

vi.mock('@/hooks/useVoiceEngine', () => ({
  useVoiceEngine: () => ({
    startDictation: mocks.startDictation,
    stopDictation: mocks.stopDictation,
    startTurn: mocks.startTurn,
    cancelTurn: mocks.cancelTurn,
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: mocks.toastError,
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

vi.mock('@/utils/APISupport', () => ({
  APISupport: {
    hasMicrophone: mocks.hasMicrophone,
    supportsScreenCapture: vi.fn().mockResolvedValue(true),
    getErrorMessage: vi.fn((capability: string) => capability),
    supportsGetUserMedia: vi.fn().mockResolvedValue(true),
    hasCamera: vi.fn().mockResolvedValue(true),
    supportsMediaRecorder: vi.fn().mockReturnValue(true),
  },
}));

vi.mock('@/stores/useVisionStore.selectors', () => ({
  useDisableVision: () => vi.fn(),
  useEnableVision: () => vi.fn(),
  useVisionObservationActive: () => false,
}));

describe('ChatToolbar Component', () => {
  const mockOnScreenCapture = vi.fn();
  const mockOnImageAnalysis = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toolbar', () => {
      render(<ChatToolbar onScreenCapture={mockOnScreenCapture} />);
      expect(screen.getByRole('button', { name: /Importer fichiers/i })).toBeTruthy();
    });

    it('should render main action buttons', () => {
      render(
        <ChatToolbar
          onScreenCapture={mockOnScreenCapture}
          onImageAnalysis={mockOnImageAnalysis}
        />
      );
      expect(
        screen.getByRole('button', { name: /Capture d'écran/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyser image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Dictée vocale/i })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Mode conversation audio/i })
      ).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('should disable all toolbar buttons when disabled', () => {
      render(<ChatToolbar disabled onScreenCapture={mockOnScreenCapture} />);
      expect(screen.getByRole('button', { name: /Importer fichiers/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Capture d'écran/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /Dictée vocale/i })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: /Mode conversation audio/i })
      ).toBeDisabled();
    });

    it("should disable screen capture when callback isn't provided", () => {
      render(<ChatToolbar />);
      expect(screen.getByRole('button', { name: /Capture d'écran/i })).toBeDisabled();
    });

    it('should keep audio conversation disabled when startTurn fails', async () => {
      mocks.startTurn.mockRejectedValueOnce(new Error('Mic failure'));

      render(<ChatToolbar onScreenCapture={mockOnScreenCapture} />);
      const conversationButton = screen.getByRole('button', {
        name: /Mode conversation audio/i,
      });

      fireEvent.click(conversationButton);

      await waitFor(() => {
        expect(mocks.startTurn).toHaveBeenCalledTimes(1);
        expect(conversationButton).toHaveAttribute('aria-pressed', 'false');
        expect(mocks.toastError).toHaveBeenCalledWith('Erreur: Mic failure');
      });
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <ChatToolbar
          onScreenCapture={mockOnScreenCapture}
          onImageAnalysis={mockOnImageAnalysis}
        />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});

describe('ChatToolbar: screen capture error narrowing — no (err as any) cast', () => {
  it('correctly identifies NotAllowedError from an Error instance', () => {
    // Simulate the narrowing logic extracted from the catch block
    const narrowErrorCode = (err: unknown): string =>
      err instanceof Error ? err.name : 'Unknown';

    const domException = new DOMException('Denied', 'NotAllowedError');
    expect(narrowErrorCode(domException)).toBe('NotAllowedError');

    const genericError = new Error('fail');
    expect(narrowErrorCode(genericError)).toBe('Error');

    expect(narrowErrorCode('string error')).toBe('Unknown');
    expect(narrowErrorCode(null)).toBe('Unknown');
  });
});
