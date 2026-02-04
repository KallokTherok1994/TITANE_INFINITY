/**
 * Tests pour ChatPanel Component
 * Coverage: Render, header, collapse action, children rendering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatPanel } from '@/components/panels/ChatPanel';

vi.mock('@/hooks/useVisualState', () => ({
  useVisualState: () => ({
    state: 'idle',
    visuals: {
      background: '#000',
      primary: '#fff',
      secondary: '#999',
      particleColor: '#fff',
      accent: '#fff',
      glow: 'none',
    },
    isTransitioning: false,
  }),
}));

vi.mock('@/hooks/useParticles', () => ({
  useParticles: () => ({
    canvasRef: { current: null },
    setPattern: vi.fn(),
    setColors: vi.fn(),
    setEmissionRate: vi.fn(),
  }),
}));

vi.mock('@/stores/visualStateStore', () => ({
  useVisualStateStore: (selector: any) => selector({ engine: {} }),
}));

const mockToggle = vi.fn();
const mockBringToFront = vi.fn();

vi.mock('@/hooks/usePanelState', () => ({
  usePanelState: () => ({
    isCollapsed: false,
    isVisible: true,
    zIndex: 100,
    toggle: mockToggle,
    bringToFront: mockBringToFront,
  }),
}));

vi.mock('@/stores/panelsStore', () => ({
  usePanelsStore: (selector: any) => selector({ registerPanel: vi.fn() }),
}));

describe('ChatPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render chat panel header', () => {
      render(<ChatPanel />);
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });

    it('should render collapse button', () => {
      render(<ChatPanel />);
      expect(screen.getByRole('button', { name: /collapse panel/i })).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <ChatPanel>
          <div>Child content</div>
        </ChatPanel>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should toggle collapse on button click', () => {
      render(<ChatPanel />);
      fireEvent.click(screen.getByRole('button', { name: /collapse panel/i }));
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should bring to front on panel click', () => {
      const { container } = render(<ChatPanel />);
      const panel = container.firstChild as HTMLElement;
      fireEvent.click(panel);
      expect(mockBringToFront).toHaveBeenCalledTimes(1);
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<ChatPanel />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
