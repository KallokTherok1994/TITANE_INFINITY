/**
 * Tests pour TypingIndicator Component
 * Coverage: Animation, États, Accessibility
 */

import { describe, it, expect } from 'vitest';
import { renderWithProviders as render, screen } from '../../test-helpers';
import { TypingIndicator } from '@/features/chat';

describe('TypingIndicator Component', () => {
  describe('Rendering', () => {
    it('should render typing indicator', () => {
      render(<TypingIndicator />);
      expect(screen.getByText(/Gemini réfléchit/i)).toBeInTheDocument();
    });

    it('should not render when hidden', () => {
      render(<TypingIndicator show={false} />);
      expect(screen.queryByText(/réfléchit/i)).not.toBeInTheDocument();
    });

    it('should render provider-specific label', () => {
      render(<TypingIndicator provider="local" />);
      expect(screen.getByText(/TITANE réfléchit/i)).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have animated dots', () => {
      const { container } = render(<TypingIndicator />);
      expect(container.querySelectorAll('div[style*="width: 8px"]').length).toBe(3);
    });
  });

  describe('Accessibility', () => {
    it('should expose visible label text', () => {
      render(<TypingIndicator />);
      expect(screen.getByText(/Gemini réfléchit/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<TypingIndicator />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
