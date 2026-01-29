/**
 * Tests pour MetricCard Component
 * Coverage: Metric display, Trends, Thresholds, Icons
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/devtools/MetricCard';

describe('MetricCard Component', () => {
  describe('Rendering', () => {
    it('should render metric card', () => {
      render(<MetricCard label="CPU Usage" value={45} unit="%" />);
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });

    it('should show metric value', () => {
      render(<MetricCard label="Memory" value={1024} unit="MB" />);
      expect(screen.getByText(/1024/)).toBeInTheDocument();
    });

    it('should show metric unit', () => {
      render(<MetricCard label="FPS" value={60} unit="fps" />);
      expect(screen.getByText(/fps/i)).toBeInTheDocument();
    });
  });

  describe('Trends', () => {
    it('should show increasing trend', () => {
      render(<MetricCard label="Usage" value={75} trend="up" />);
      expect(screen.getByRole('img', { name: /up|increase/i })).toBeInTheDocument();
    });

    it('should show decreasing trend', () => {
      render(<MetricCard label="Latency" value={50} trend="down" />);
      expect(screen.getByRole('img', { name: /down|decrease/i })).toBeInTheDocument();
    });

    it('should show stable trend', () => {
      render(<MetricCard label="Rate" value={98} trend="stable" />);
      expect(screen.getByRole('img', { name: /stable/i })).toBeInTheDocument();
    });
  });

  describe('Thresholds', () => {
    it('should show normal state', () => {
      render(
        <MetricCard label="CPU" value={50} threshold={{ warning: 70, critical: 90 }} />
      );
      const card = screen.getByText('CPU').closest('div');
      expect(card?.className).toMatch(/normal|ok|success/i);
    });

    it('should show warning state', () => {
      render(
        <MetricCard label="CPU" value={75} threshold={{ warning: 70, critical: 90 }} />
      );
      const card = screen.getByText('CPU').closest('div');
      expect(card?.className).toMatch(/warning|yellow/i);
    });

    it('should show critical state', () => {
      render(
        <MetricCard label="CPU" value={95} threshold={{ warning: 70, critical: 90 }} />
      );
      const card = screen.getByText('CPU').closest('div');
      expect(card?.className).toMatch(/critical|error|red|danger/i);
    });
  });

  describe('Icons', () => {
    it('should show custom icon', () => {
      render(<MetricCard label="CPU" value={45} icon="cpu" />);
      expect(screen.getByRole('img', { name: /cpu/i })).toBeInTheDocument();
    });

    it('should show memory icon', () => {
      render(<MetricCard label="Memory" value={1024} icon="memory" />);
      expect(screen.getByRole('img', { name: /memory/i })).toBeInTheDocument();
    });
  });

  describe('Comparison', () => {
    it('should show previous value', () => {
      render(<MetricCard label="Rate" value={98} previousValue={95} />);
      expect(screen.getByText(/95|previous/i)).toBeInTheDocument();
    });

    it('should calculate change percentage', () => {
      render(<MetricCard label="Usage" value={80} previousValue={75} showChange />);
      expect(screen.getByText(/\+.*%/)).toBeInTheDocument();
    });
  });

  describe('Formatting', () => {
    it('should format large numbers', () => {
      render(<MetricCard label="Requests" value={1500000} format="compact" />);
      expect(screen.getByText(/1\.5M|1500K/i)).toBeInTheDocument();
    });

    it('should format decimals', () => {
      render(<MetricCard label="Rate" value={98.567} decimals={2} />);
      expect(screen.getByText(/98\.57/)).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MetricCard label="Test" value={100} unit="%" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
