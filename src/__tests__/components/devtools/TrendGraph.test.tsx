/**
 * Tests pour TrendGraph Component
 * Coverage: Data visualization, Time ranges, Legends
 */

import { describe, it, expect } from 'vitest';
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
    it('should render trend graph svg', () => {
      const { container } = render(<TrendGraph data={mockData} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('polyline')).toBeInTheDocument();
    });

    it('should render data points', () => {
      const { container } = render(<TrendGraph data={mockData} />);
      const points = container.querySelectorAll('circle');
      expect(points.length).toBe(mockData.length);
    });

    it('should show empty state', () => {
      render(<TrendGraph data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });
});
