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
      render(<MetricCard title="CPU Usage" value={45} unit="%" />);
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });

    it('should show metric value', () => {
      render(<MetricCard title="Memory" value={1024} unit="MB" />);
      expect(screen.getByText(/1024/)).toBeInTheDocument();
    });

    it('should show metric unit', () => {
      render(<MetricCard title="FPS" value={60} unit="fps" />);
      expect(
        screen.getByText((content, element) =>
          Boolean(element?.tagName === 'SPAN' && content === 'fps')
        )
      ).toBeInTheDocument();
    });
  });

  describe('Trends', () => {
    it('should show increasing trend', () => {
      render(<MetricCard title="Usage" value={75} trend="up" />);
      expect(screen.getByText('↑')).toBeInTheDocument();
    });

    it('should show decreasing trend', () => {
      render(<MetricCard title="Latency" value={50} trend="down" />);
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('should show stable trend', () => {
      render(<MetricCard title="Rate" value={98} trend="stable" />);
      expect(screen.getByText('→')).toBeInTheDocument();
    });
  });

  describe('Status', () => {
    it('should render good status border', () => {
      render(<MetricCard title="CPU" value={50} status="good" />);
      const card = screen.getByText('CPU').closest('div')?.parentElement;
      expect(card?.className).toMatch(/border-green-500/);
    });

    it('should render warning status border', () => {
      render(<MetricCard title="CPU" value={75} status="warning" />);
      const card = screen.getByText('CPU').closest('div')?.parentElement;
      expect(card?.className).toMatch(/border-yellow-500/);
    });

    it('should render critical status border', () => {
      render(<MetricCard title="CPU" value={95} status="critical" />);
      const card = screen.getByText('CPU').closest('div')?.parentElement;
      expect(card?.className).toMatch(/border-red-500/);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MetricCard title="Test" value={100} unit="%" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
