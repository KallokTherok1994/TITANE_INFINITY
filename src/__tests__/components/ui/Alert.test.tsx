/**
 * Tests pour Alert Component
 * Coverage: Variants (info, warning, error, success), Actions, Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';

describe('Alert Component', () => {
  describe('Rendering', () => {
    it('should render alert', () => {
      render(<Alert>Test alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render with title and description', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>Alert description</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert description')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render info variant', () => {
      render(<Alert variant="info">Info message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      render(<Alert variant="warning">Warning message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render error variant', () => {
      render(<Alert variant="error">Error message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render success variant', () => {
      render(<Alert variant="success">Success message</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Dismissible', () => {
    it('should show close button when dismissible', () => {
      const onDismiss = vi.fn();
      render(
        <Alert dismissible onDismiss={onDismiss}>
          Dismissible alert
        </Alert>
      );
      expect(screen.getByRole('button', { name: /close|dismiss/i })).toBeInTheDocument();
    });

    it('should call onDismiss when closed', () => {
      const onDismiss = vi.fn();
      render(
        <Alert dismissible onDismiss={onDismiss}>
          Test
        </Alert>
      );
      fireEvent.click(screen.getByRole('button', { name: /close|dismiss/i }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert"', () => {
      render(<Alert>Accessible alert</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Alert aria-label="Custom alert">Test</Alert>);
      expect(screen.getByLabelText('Custom alert')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Alert variant="warning">Snapshot test</Alert>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
