/**
 * Tests pour ChatToolbar Component
 * Coverage: Actions (send, attach, voice), États, Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatToolbar } from '@/components/chat/ChatToolbar';

describe('ChatToolbar Component', () => {
  const mockOnSend = vi.fn();
  const mockOnAttach = vi.fn();
  const mockOnVoice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toolbar', () => {
      render(<ChatToolbar onSend={mockOnSend} />);
      expect(screen.getByRole('toolbar') || screen.getByRole('button', { name: /send/i })).toBeTruthy();
    });

    it('should render send button', () => {
      render(<ChatToolbar onSend={mockOnSend} />);
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('should render attach button when provided', () => {
      render(<ChatToolbar onSend={mockOnSend} onAttach={mockOnAttach} />);
      expect(screen.getByRole('button', { name: /attach/i }) || screen.getByLabelText(/attach/i)).toBeTruthy();
    });

    it('should render voice button when provided', () => {
      render(<ChatToolbar onSend={mockOnSend} onVoice={mockOnVoice} />);
      expect(screen.getByRole('button', { name: /voice/i }) || screen.getByLabelText(/voice/i)).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('should handle send click', () => {
      render(<ChatToolbar onSend={mockOnSend} />);
      fireEvent.click(screen.getByRole('button', { name: /send/i }));
      expect(mockOnSend).toHaveBeenCalledTimes(1);
    });

    it('should handle attach click', () => {
      render(<ChatToolbar onSend={mockOnSend} onAttach={mockOnAttach} />);
      const attachBtn = screen.getByRole('button', { name: /attach/i }) || screen.getByLabelText(/attach/i);
      fireEvent.click(attachBtn);
      expect(mockOnAttach).toHaveBeenCalledTimes(1);
    });

    it('should handle voice toggle', () => {
      render(<ChatToolbar onSend={mockOnSend} onVoice={mockOnVoice} />);
      const voiceBtn = screen.getByRole('button', { name: /voice/i }) || screen.getByLabelText(/voice/i);
      fireEvent.click(voiceBtn);
      expect(mockOnVoice).toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should disable send when disabled', () => {
      render(<ChatToolbar onSend={mockOnSend} disabled />);
      expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<ChatToolbar onSend={mockOnSend} isLoading />);
      // Loading state (spinner ou disabled)
      const sendBtn = screen.getByRole('button', { name: /send/i });
      expect(sendBtn).toBeDisabled();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ChatToolbar onSend={mockOnSend} onAttach={mockOnAttach} onVoice={mockOnVoice} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
