/**
 * Tests pour TrendGraph Component
 * Coverage: Data visualization, Time ranges, Legends
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendGraph } from '@/components/devtools/TrendGraph';
import type { DataPoint } from '@/types';

describe('TrendGraph Component', () => {
  const mockData: DataPoint[] = [
    { timestamp: Date.now() - 4000, value: 40 },
    { timestamp: Date.now() - 3000, value: 55 },
    { timestamp: Date.now() - 2000, value: 48 },
    { timestamp: Date.now() - 1000, value: 62 },
    { timestamp: Date.now(), value: 58 },
  ];

  describe('Rendering', () => {
    it('should render trend graph', () => {
      render(<TrendGraph data={mockData} title="CPU Usage" />);
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    });

    it('should render chart canvas', () => {
      render(<TrendGraph data={mockData} />);
      expect(screen.getByRole('img', { name: /chart|graph/i })).toBeInTheDocument();
    });

    it('should show empty state', () => {
      render(<TrendGraph data={[]} />);
      expect(screen.getByText(/no data|empty/i)).toBeInTheDocument();
    });
  });

  describe('Data Series', () => {
    it('should render single series', () => {
      render(<TrendGraph data={mockData} label="CPU" />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
    });

    it('should render multiple series', () => {
      const multiSeries = {
        cpu: mockData,
        memory: mockData.map(d => ({ ...d, value: d.value * 0.8 })),
      };
      render(<TrendGraph dataSeries={multiSeries} />);
      expect(screen.getByText('cpu')).toBeInTheDocument();
      expect(screen.getByText('memory')).toBeInTheDocument();
    });
  });

  describe('Time Ranges', () => {
    it('should show last hour', () => {
      render(<TrendGraph data={mockData} timeRange="1h" />);
      expect(screen.getByText(/1.*hour|1h/i)).toBeInTheDocument();
    });

    it('should show last 24 hours', () => {
      render(<TrendGraph data={mockData} timeRange="24h" />);
      expect(screen.getByText(/24.*hours?|24h/i)).toBeInTheDocument();
    });

    it('should show last 7 days', () => {
      render(<TrendGraph data={mockData} timeRange="7d" />);
      expect(screen.getByText(/7.*days?|7d/i)).toBeInTheDocument();
    });
  });

  describe('Thresholds', () => {
    it('should show warning threshold line', () => {
      render(<TrendGraph data={mockData} warningThreshold={70} />);
      expect(screen.getByText(/warning.*70/i)).toBeInTheDocument();
    });

    it('should show critical threshold line', () => {
      render(<TrendGraph data={mockData} criticalThreshold={90} />);
      expect(screen.getByText(/critical.*90/i)).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should show min/max/avg', () => {
      render(<TrendGraph data={mockData} showStats />);
      expect(screen.getByText(/min/i)).toBeInTheDocument();
      expect(screen.getByText(/max/i)).toBeInTheDocument();
      expect(screen.getByText(/avg/i)).toBeInTheDocument();
    });

    it('should calculate correct average', () => {
      render(<TrendGraph data={mockData} showStats />);
      const avg = mockData.reduce((sum, d) => sum + d.value, 0) / mockData.length;
      expect(screen.getByText(new RegExp(avg.toFixed(1)))).toBeInTheDocument();
    });
  });

  describe('Legends', () => {
    it('should show legend', () => {
      render(<TrendGraph data={mockData} label="CPU" showLegend />);
      expect(screen.getByText('CPU')).toBeInTheDocument();
    });

    it('should hide legend when disabled', () => {
      render(<TrendGraph data={mockData} label="CPU" showLegend={false} />);
      expect(screen.queryByRole('list', { name: /legend/i })).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should show tooltip on hover', () => {
      const { container } = render(<TrendGraph data={mockData} />);
      const chart = container.querySelector('canvas');

      if (chart) {
        chart.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }));
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      }
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<TrendGraph data={mockData} title="Test Graph" />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
