/**
 * Tests pour Switch Component
 * Coverage: États, Events, Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '@/components/ui/switch';

describe('Switch Component', () => {
  describe('Rendering', () => {
    it('should render switch element', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Switch className="custom-switch" />);
      expect(container.firstChild).toHaveClass('custom-switch');
    });
  });

  describe('States', () => {
    it('should handle unchecked state', () => {
      render(<Switch checked={false} data-testid="switch-unchecked" />);
      const switchElement = screen.getByTestId('switch-unchecked');
      expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    });

    it('should handle checked state', () => {
      render(<Switch checked={true} data-testid="switch-checked" />);
      const switchElement = screen.getByTestId('switch-checked');
      expect(switchElement).toHaveAttribute('data-state', 'checked');
    });

    it('should handle disabled state', () => {
      render(<Switch disabled data-testid="switch-disabled" />);
      expect(screen.getByTestId('switch-disabled')).toBeDisabled();
    });

    it('should toggle on click', () => {
      const handleChange = vi.fn();
      render(<Switch onCheckedChange={handleChange} data-testid="switch-toggle" />);
      fireEvent.click(screen.getByTestId('switch-toggle'));
      expect(handleChange).toHaveBeenCalled();
    });

    it('should not toggle when disabled', () => {
      const handleChange = vi.fn();
      render(<Switch disabled onCheckedChange={handleChange} data-testid="switch" />);
      fireEvent.click(screen.getByTestId('switch'));
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="switch"', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Switch aria-label="Enable notifications" />);
      expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
    });

    it('should reflect checked state in aria-checked', () => {
      render(<Switch checked={true} data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Switch checked={false} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
