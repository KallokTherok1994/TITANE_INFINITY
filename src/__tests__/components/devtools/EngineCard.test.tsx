// @ts-nocheck
/**
 * Tests pour EngineCard Component
 * Coverage: Engine info, Status, Actions, Metrics
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EngineCard } from '@/components/devtools/EngineCard';
import type { Engine } from '@/types';

describe('EngineCard Component', () => {
  const mockEngine: Engine = {
    id: 'fusion-1',
    name: 'Fusion Engine',
    status: 'active',
    metrics: {
      requests: 150,
      errors: 2,
      latency: 120,
    },
  };

  describe('Rendering', () => {
    it('should render engine card', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText('Fusion Engine')).toBeInTheDocument();
    });

    it('should show engine status', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText(/active/i)).toBeInTheDocument();
    });
  });

  describe('Status Display', () => {
    it('should show active status', () => {
      render(<EngineCard engine={mockEngine} />);
      const status = screen.getByText(/active/i);
      expect(status.className).toMatch(/bg-green-900/);
    });

    it('should show inactive status', () => {
      const inactiveEngine = { ...mockEngine, status: 'inactive' };
      render(<EngineCard engine={inactiveEngine} />);
      const status = screen.getByText(/inactive/i);
      expect(status.className).toMatch(/bg-gray-700/);
    });

    it('should show error status', () => {
      const errorEngine = { ...mockEngine, status: 'error' };
      render(<EngineCard engine={errorEngine} />);
      const status = screen.getByText(/^error$/i);
      expect(status.className).toMatch(/bg-red-900/);
    });
  });

  describe('Metrics', () => {
    it('should show request metrics', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText(/Requests: 150/i)).toBeInTheDocument();
    });

    it('should show error metrics', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText(/Errors: 2/i)).toBeInTheDocument();
    });

    it('should show latency metrics', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText(/Latency: 120ms/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should handle click', () => {
      const onClick = vi.fn();
      render(<EngineCard engine={mockEngine} onClick={onClick} />);

      fireEvent.click(screen.getByRole('button', { name: /Fusion Engine/i }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<EngineCard engine={mockEngine} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
