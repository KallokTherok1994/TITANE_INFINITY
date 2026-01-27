/**
 * Tests pour StatusPill Component
 * Coverage: Status variants, Colors, Icons
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '@/components/devtools/StatusPill';

describe('StatusPill Component', () => {
  describe('Rendering', () => {
    it('should render status pill', () => {
      render(<StatusPill status="success" label="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<StatusPill status="error" label="Critical" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('should render success status', () => {
      render(<StatusPill status="success" label="OK" />);
      const pill = screen.getByText('OK');
      expect(pill.className).toMatch(/success|green/i);
    });

    it('should render error status', () => {
      render(<StatusPill status="error" label="Error" />);
      const pill = screen.getByText('Error');
      expect(pill.className).toMatch(/error|red|danger/i);
    });

    it('should render warning status', () => {
      render(<StatusPill status="warning" label="Warning" />);
      const pill = screen.getByText('Warning');
      expect(pill.className).toMatch(/warning|yellow/i);
    });

    it('should render info status', () => {
      render(<StatusPill status="info" label="Info" />);
      const pill = screen.getByText('Info');
      expect(pill.className).toMatch(/info|blue/i);
    });

    it('should render idle status', () => {
      render(<StatusPill status="idle" label="Idle" />);
      const pill = screen.getByText('Idle');
      expect(pill.className).toMatch(/idle|gray/i);
    });
  });

  describe('Icons', () => {
    it('should show icon when specified', () => {
      render(<StatusPill status="success" label="Active" showIcon />);
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should hide icon when not specified', () => {
      render(<StatusPill status="success" label="Active" />);
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });
  });

  describe('Pulse Animation', () => {
    it('should animate when pulse is enabled', () => {
      const { container } = render(<StatusPill status="success" label="Live" pulse />);
      const pill = container.firstChild;
      expect(pill?.className).toMatch(/pulse|animate/i);
    });

    it('should not animate by default', () => {
      const { container } = render(<StatusPill status="success" label="Static" />);
      const pill = container.firstChild;
      expect(pill?.className).not.toMatch(/pulse|animate/i);
    });
  });

  describe('Accessibility', () => {
    it('should have proper role', () => {
      render(<StatusPill status="success" label="Active" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<StatusPill status="error" label="Critical" aria-label="System critical error" />);
      expect(screen.getByLabelText('System critical error')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<StatusPill status="warning" label="Warning" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
