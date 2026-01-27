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
      // L'indicateur devrait être présent (dots animés)
      const indicator = screen.getByRole('status', { name: /typing/i }) || document.querySelector('[data-testid="typing-indicator"]');
      expect(indicator || screen.getByText(/\.\.\./i)).toBeTruthy();
    });

    it('should not render when hidden', () => {
      render(<TypingIndicator visible={false} />);
      const indicator = screen.queryByRole('status', { name: /typing/i });
      expect(indicator).not.toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<TypingIndicator message="TITANE is thinking..." />);
      expect(screen.getByText(/TITANE is thinking/i)).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have animated dots', () => {
      const { container } = render(<TypingIndicator />);
      // Vérifier présence d'animation (via classes CSS ou éléments)
      expect(container.querySelector('[class*="animate"]') || container.querySelector('.dot')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-live region', () => {
      render(<TypingIndicator />);
      const liveRegion = screen.queryByRole('status') || document.querySelector('[aria-live]');
      expect(liveRegion).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<TypingIndicator />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
