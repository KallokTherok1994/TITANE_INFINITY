/**
 * Tests pour VoiceControl Component
 * Coverage: Activation voice, États (listening, processing), Feedback
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceControlPanel as VoiceControl } from '@/components/VoiceControlPanel';

describe('VoiceControl Component', () => {
  const mockOnStart = vi.fn();
  const mockOnStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render voice button', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} />);
      expect(screen.getByRole('button', { name: /voice|microphone/i })).toBeInTheDocument();
    });

    it('should show idle state', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} state="idle" />);
      const button = screen.getByRole('button', { name: /voice|microphone/i });
      expect(button).not.toBeDisabled();
    });

    it('should show listening state', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} state="listening" />);
      expect(screen.getByText(/listening|recording/i)).toBeTruthy();
    });

    it('should show processing state', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} state="processing" />);
      expect(screen.getByText(/processing|analyzing/i)).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('should start voice recording', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} state="idle" />);
      fireEvent.click(screen.getByRole('button', { name: /voice|microphone/i }));
      expect(mockOnStart).toHaveBeenCalledTimes(1);
    });

    it('should stop voice recording', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} state="listening" />);
      fireEvent.click(screen.getByRole('button', { name: /stop|voice/i }));
      expect(mockOnStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label', () => {
      render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} />);
      expect(screen.getByLabelText(/voice|microphone/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<VoiceControl onStart={mockOnStart} onStop={mockOnStop} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
