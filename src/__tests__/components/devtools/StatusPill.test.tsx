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
      render(<StatusPill status="active" label="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with custom label', () => {
      render(<StatusPill status="error" label="Critical" />);
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should fallback to status label', () => {
      render(<StatusPill status="inactive" />);
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
  });

  describe('Status Variants', () => {
    it('should render active status', () => {
      render(<StatusPill status="active" label="OK" />);
      const pill = screen.getByText('OK');
      expect(pill.className).toMatch(/bg-green-900/);
    });

    it('should render error status', () => {
      render(<StatusPill status="error" label="Error" />);
      const pill = screen.getByText('Error');
      expect(pill.className).toMatch(/bg-red-900/);
    });

    it('should render warning status', () => {
      render(<StatusPill status="warning" label="Warning" />);
      const pill = screen.getByText('Warning');
      expect(pill.className).toMatch(/bg-yellow-900/);
    });

    it('should render inactive status', () => {
      render(<StatusPill status="inactive" label="Idle" />);
      const pill = screen.getByText('Idle');
      expect(pill.className).toMatch(/bg-gray-700/);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<StatusPill status="warning" label="Warning" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
