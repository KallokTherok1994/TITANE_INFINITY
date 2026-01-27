/**
 * Tests pour Input Component
 * Coverage: Types, États, Validation, Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Input className="custom-input" />);
      expect(container.firstChild).toHaveClass('custom-input');
    });
  });

  describe('Types', () => {
    it('should support text type', () => {
      render(<Input type="text" data-testid="input-text" />);
      expect(screen.getByTestId('input-text')).toHaveAttribute('type', 'text');
    });

    it('should support email type', () => {
      render(<Input type="email" data-testid="input-email" />);
      expect(screen.getByTestId('input-email')).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input type="password" data-testid="input-password" />);
      expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
    });

    it('should support number type', () => {
      render(<Input type="number" data-testid="input-number" />);
      expect(screen.getByTestId('input-number')).toHaveAttribute('type', 'number');
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      render(<Input disabled data-testid="input-disabled" />);
      expect(screen.getByTestId('input-disabled')).toBeDisabled();
    });

    it('should handle value changes', () => {
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} data-testid="input-change" />);
      const input = screen.getByTestId('input-change');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle focus events', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} data-testid="input-focus" />);
      fireEvent.focus(screen.getByTestId('input-focus'));
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle blur events', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} data-testid="input-blur" />);
      fireEvent.blur(screen.getByTestId('input-blur'));
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" data-testid="input-invalid" />);
      expect(screen.getByTestId('input-invalid')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Input placeholder="Snapshot test" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
