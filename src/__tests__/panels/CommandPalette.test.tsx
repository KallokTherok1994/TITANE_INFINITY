/**
 * Tests panel DevTools (remplace ancien placeholder CommandPalette)
 * Coverage: rendu, métriques, statut
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DevToolsPanel } from '@/components/panels/DevToolsPanel';

vi.mock('@/hooks/useVisualState', () => ({
  useVisualState: () => ({
    visuals: {
      background: '#111827',
      accent: '#3b82f6',
      glow: '0 0 4px #3b82f6',
      primary: '#ffffff',
    },
    isTransitioning: false,
  }),
}));

vi.mock('@/stores/visualStateStore', () => ({
  useVisualStateStore: (selector: any) => selector({ engine: 'core' }),
}));

describe('DevToolsPanel Component', () => {
  const engines = [
    {
      name: 'Memory',
      status: 'active' as const,
      metrics: [{ label: 'ops', value: 12 }],
      description: 'Memory engine',
    },
    {
      name: 'Voice',
      status: 'idle' as const,
      metrics: [{ label: 'latency', value: '24ms' }],
      description: 'Voice engine',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render panel title and engines', () => {
      render(<DevToolsPanel engines={engines} />);
      expect(screen.getByText(/omega engines/i)).toBeInTheDocument();
      expect(screen.getByText('Memory')).toBeInTheDocument();
      expect(screen.getByText('Voice')).toBeInTheDocument();
    });

    it('should render active counter', () => {
      render(<DevToolsPanel engines={engines} />);
      expect(screen.getByText(/1 \/ 2 Active/i)).toBeInTheDocument();
    });

    it('should render metrics labels and values', () => {
      render(<DevToolsPanel engines={engines} />);
      expect(screen.getByText('ops')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('latency')).toBeInTheDocument();
      expect(screen.getByText('24ms')).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const { container } = render(<DevToolsPanel engines={engines} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
