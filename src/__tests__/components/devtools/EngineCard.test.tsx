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
    version: '2.1.0',
    metrics: {
      processedTasks: 150,
      avgResponseTime: 120,
      successRate: 98.5,
    },
  };

  describe('Rendering', () => {
    it('should render engine card', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText('Fusion Engine')).toBeInTheDocument();
    });

    it('should show engine version', () => {
      render(<EngineCard engine={mockEngine} />);
      expect(screen.getByText(/2\.1\.0/)).toBeInTheDocument();
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
      expect(status.className).toMatch(/success|green|active/i);
    });

    it('should show inactive status', () => {
      const inactiveEngine = { ...mockEngine, status: 'inactive' };
      render(<EngineCard engine={inactiveEngine} />);
      const status = screen.getByText(/inactive/i);
      expect(status.className).toMatch(/gray|idle/i);
    });

    it('should show error status', () => {
      const errorEngine = { ...mockEngine, status: 'error' };
      render(<EngineCard engine={errorEngine} />);
      const status = screen.getByText(/error/i);
      expect(status.className).toMatch(/error|red|danger/i);
    });
  });

  describe('Metrics', () => {
    it('should show processed tasks', () => {
      render(<EngineCard engine={mockEngine} showMetrics />);
      expect(screen.getByText(/150.*tasks?/i)).toBeInTheDocument();
    });

    it('should show average response time', () => {
      render(<EngineCard engine={mockEngine} showMetrics />);
      expect(screen.getByText(/120.*ms/i)).toBeInTheDocument();
    });

    it('should show success rate', () => {
      render(<EngineCard engine={mockEngine} showMetrics />);
      expect(screen.getByText(/98\.5.*%/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should start engine', () => {
      const onStart = vi.fn();
      const inactiveEngine = { ...mockEngine, status: 'inactive' };
      render(<EngineCard engine={inactiveEngine} onStart={onStart} />);

      const startButton = screen.getByRole('button', { name: /start/i });
      fireEvent.click(startButton);

      expect(onStart).toHaveBeenCalledWith(mockEngine.id);
    });

    it('should stop engine', () => {
      const onStop = vi.fn();
      render(<EngineCard engine={mockEngine} onStop={onStop} />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      expect(onStop).toHaveBeenCalledWith(mockEngine.id);
    });

    it('should restart engine', () => {
      const onRestart = vi.fn();
      render(<EngineCard engine={mockEngine} onRestart={onRestart} />);

      const restartButton = screen.getByRole('button', { name: /restart/i });
      fireEvent.click(restartButton);

      expect(onRestart).toHaveBeenCalledWith(mockEngine.id);
    });
  });

  describe('Expand Details', () => {
    it('should expand details panel', () => {
      render(<EngineCard engine={mockEngine} expandable />);

      const expandButton = screen.getByRole('button', { name: /details|expand/i });
      fireEvent.click(expandButton);

      expect(screen.getByText(/configuration|details/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<EngineCard engine={mockEngine} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
