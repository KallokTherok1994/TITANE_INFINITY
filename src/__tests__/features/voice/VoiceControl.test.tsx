/**
 * Tests pour VoiceControlPanel Component
 * Coverage: Toggle, états visibles, disponibilité TTS
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VoiceControlPanel } from '@/components/VoiceControlPanel';
import { hybridTTS } from '@/services/tts/hybridTTS';

vi.mock('@/services/tts/hybridTTS', () => ({
  hybridTTS: {
    getStatus: vi.fn(),
    speak: vi.fn(),
    stop: vi.fn(),
  },
}));

describe('VoiceControlPanel Component', () => {
  const mockOnToggle = vi.fn();

  const baseStatus = {
    provider: 'webspeech' as const,
    available: true,
    speaking: false,
    parlerTTSAvailable: false,
    tauriAvailable: false,
    webSpeechAvailable: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hybridTTS.getStatus).mockResolvedValue(baseStatus);
    vi.mocked(hybridTTS.speak).mockResolvedValue(undefined);
    vi.mocked(hybridTTS.stop).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('should render toggle button', async () => {
      render(<VoiceControlPanel enabled={false} onToggle={mockOnToggle} />);
      await waitFor(() => {
        expect(hybridTTS.getStatus).toHaveBeenCalled();
      });
      expect(screen.getByRole('button', { name: /mode voix/i })).toBeInTheDocument();
    });

    it('should show inactive label when disabled', async () => {
      render(<VoiceControlPanel enabled={false} onToggle={mockOnToggle} />);
      await waitFor(() => {
        expect(hybridTTS.getStatus).toHaveBeenCalled();
      });
      expect(screen.getByText(/mode voix inactif/i)).toBeInTheDocument();
    });

    it('should show provider info when enabled', async () => {
      render(<VoiceControlPanel enabled onToggle={mockOnToggle} />);
      await waitFor(() => {
        expect(screen.getByText(/web speech api/i)).toBeInTheDocument();
      });
      expect(screen.getByText(/disponible/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should toggle on click', async () => {
      render(<VoiceControlPanel enabled={false} onToggle={mockOnToggle} />);
      await waitFor(() => {
        expect(hybridTTS.getStatus).toHaveBeenCalled();
      });
      fireEvent.click(screen.getByRole('button', { name: /mode voix/i }));
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should disable test button when unavailable', async () => {
      vi.mocked(hybridTTS.getStatus).mockResolvedValue({
        ...baseStatus,
        available: false,
        webSpeechAvailable: false,
      });

      render(<VoiceControlPanel enabled onToggle={mockOnToggle} />);
      await waitFor(() => {
        expect(screen.getByText(/indisponible/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /tester/i })).toBeDisabled();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', async () => {
      const { container } = render(
        <VoiceControlPanel enabled={false} onToggle={mockOnToggle} />
      );
      await waitFor(() => {
        expect(hybridTTS.getStatus).toHaveBeenCalled();
      });
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
