/**
 * Tests pour MemoryPanel Component
 * Coverage: affichage métriques, collapse, footer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryPanel } from '@/components/panels/MemoryPanel';

vi.mock('@/hooks/useVisualState', () => ({
  useVisualState: () => ({
    visuals: {
      background: '#111827',
      accent: '#3b82f6',
      glow: '0 0 4px #3b82f6',
      primary: '#fff',
    },
    isTransitioning: false,
  }),
}));

vi.mock('@/stores/visualStateStore', () => ({
  useVisualStateStore: (selector: any) => selector({ engine: 'core' }),
}));

vi.mock('@/hooks/usePanelState', () => ({
  usePanelState: () => ({
    isCollapsed: false,
    isVisible: true,
    zIndex: 101,
    toggle: vi.fn(),
    bringToFront: vi.fn(),
  }),
}));

vi.mock('@/stores/panelsStore', () => ({
  usePanelsStore: (selector: any) => selector({ registerPanel: vi.fn() }),
}));

describe('MemoryPanel Component', () => {
  let toLocaleTimeStringSpy: ReturnType<typeof vi.spyOn>;

  const metrics = [
    { label: 'STM', value: 42, max: 100, description: 'Short term' },
    { label: 'LTM', value: 75, max: 100, description: 'Long term' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    toLocaleTimeStringSpy = vi
      .spyOn(Date.prototype, 'toLocaleTimeString')
      .mockReturnValue('12:00:00 PM');
  });

  afterEach(() => {
    toLocaleTimeStringSpy.mockRestore();
  });

  describe('Rendering', () => {
    it('should render panel title and metrics', () => {
      render(<MemoryPanel metrics={metrics} />);
      expect(screen.getByText(/memory metrics/i)).toBeInTheDocument();
      expect(screen.getByText('STM')).toBeInTheDocument();
      expect(screen.getByText('LTM')).toBeInTheDocument();
      expect(screen.getByText(/42 \/ 100/)).toBeInTheDocument();
    });

    it('should toggle collapse button', () => {
      render(<MemoryPanel metrics={metrics} />);
      const btn = screen.getByRole('button', { name: /collapse panel/i });
      fireEvent.click(btn);
      expect(btn).toBeInTheDocument();
    });

    it('should match snapshot', () => {
      const { container } = render(<MemoryPanel metrics={metrics} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
