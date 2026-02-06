/**
 * Tests pour ChatToolbar Component
 * Coverage: Actions (send, attach, voice), États, Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatToolbar } from '@/components/chat/ChatToolbar';

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
    startDictation: vi.fn(),
    stopDictation: vi.fn().mockResolvedValue(''),
  }),
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
