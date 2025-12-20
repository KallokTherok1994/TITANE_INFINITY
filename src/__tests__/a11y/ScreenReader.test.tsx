import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveRegion, ScreenReaderOnly } from '@/a11y/ScreenReader';

describe('ScreenReader', () => {
  describe('ScreenReaderOnly', () => {
    it('devrait rendre le contenu en sr-only', () => {
      render(
        <ScreenReaderOnly>
          <span>Texte caché</span>
        </ScreenReaderOnly>
      );

      const child = screen.getByText('Texte caché');
      const wrapper = child.parentElement;

      expect(wrapper).toBeTruthy();
      expect(wrapper).toHaveClass('sr-only');
    });
  });

  describe('LiveRegion', () => {
    it('devrait exposer un status aria-live polite par défaut', () => {
      render(<LiveRegion message="Hello" />);

      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region).toHaveAttribute('aria-atomic', 'true');
      expect(region).toHaveClass('sr-only');
      expect(region).toHaveTextContent('Hello');
    });

    it('devrait supporter aria-live assertive', () => {
      render(<LiveRegion message="Alerte" priority="assertive" />);

      const region = screen.getByRole('status');
      expect(region).toHaveAttribute('aria-live', 'assertive');
      expect(region).toHaveTextContent('Alerte');
    });
  });
});
