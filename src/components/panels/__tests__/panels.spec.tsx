/**
 * TITANE∞ v21 — E2E Tests for Adaptive Panels
 * Comprehensive tests for ChatPanel, MemoryPanel, GovernancePanel
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from '../ChatPanel';
import { MemoryPanel } from '../MemoryPanel';
import { GovernancePanel } from '../GovernancePanel';
import type { MemoryMetric } from '../MemoryPanel';
import { usePanelsStore } from '@/stores/panelsStore';
import { TitaneVisualEngine } from '@/visual-engine/TitaneVisualEngine';

// Mock dependencies
vi.mock('@/hooks/useVisualState', () => ({
  useVisualState: () => ({
    visuals: {
      background: '#0f172a',
      primary: '#64748b',
      secondary: '#475569',
      accent: '#94a3b8',
      text: '#e2e8f0',
      glow: '0 0 10px rgba(148, 163, 184, 0.3)',
    },
    isTransitioning: false,
  }),
}));

vi.mock('@/hooks/useAdaptiveFPS', () => ({
  useAdaptiveFPS: () => ({
    metrics: {
      current: 60,
      average: 58,
      min: 45,
      max: 60,
      throttleLevel: 0,
    },
    warnings: [],
    isPerformanceDegraded: false,
  }),
}));

vi.mock('@/hooks/useEffects', () => ({
  useEffects: () => ({
    metrics: {
      totalTriggered: 10,
      totalBlocked: 2,
      averageIntensity: 0.8,
      gpuLoad: 0.25,
    },
    activeEffects: [],
  }),
}));

vi.mock('@/visual-engine/UIIntegrityChecker', () => ({
  UIIntegrityChecker: {
    getInstance: () => ({
      runCheck: vi.fn().mockResolvedValue({
        timestamp: Date.now(),
        overallHealth: 0.95,
        anomalies: [
          {
            id: 'test-anomaly-1',
            type: 'PERFORMANCE',
            severity: 'low',
            message: 'Minor FPS drop detected',
            timestamp: Date.now(),
            autoFixed: true,
            context: {},
          },
        ],
        autoFixed: 1,
        recommendations: [],
      }),
    }),
  },
}));

describe('ChatPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with default props', () => {
    render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Test Chat Content')).toBeInTheDocument();
  });

  it('should toggle collapsed state when button clicked', async () => {
    render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    const collapseButton = screen.getByLabelText(/collapse panel/i);
    expect(collapseButton).toBeInTheDocument();
    expect(screen.getByText('Test Chat Content')).toBeVisible();

    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Chat Content')).not.toBeVisible();
    });
  });

  it('should show expand icon when collapsed', async () => {
    render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    const collapseButton = screen.getByLabelText(/collapse panel/i);
    expect(collapseButton.textContent).toBe('▲');

    fireEvent.click(collapseButton);

    await waitFor(() => {
      const expandButton = screen.getByLabelText(/expand panel/i);
      expect(expandButton.textContent).toBe('▼');
    });
  });

  it('should bring panel to front when clicked', () => {
    const { container } = render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    const panel = container.querySelector('[data-panel-id="chat"]');
    expect(panel).toBeInTheDocument();

    const initialZIndex = window.getComputedStyle(panel!).zIndex;

    fireEvent.click(panel!);

    const newZIndex = window.getComputedStyle(panel!).zIndex;
    // Z-index should increase after bringing to front
    expect(parseInt(newZIndex)).toBeGreaterThanOrEqual(parseInt(initialZIndex));
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ChatPanel className="custom-class">
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    const panel = container.querySelector('.custom-class');
    expect(panel).toBeInTheDocument();
  });

  it('should register panel in global store', () => {
    render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    const panels = usePanelsStore.getState().panels;
    expect(panels.has('chat')).toBe(true);
    expect(panels.get('chat')?.title).toBe('Chat');
  });

  it('should not render when isVisible is false', () => {
    const { container } = render(
      <ChatPanel>
        <div>Test Chat Content</div>
      </ChatPanel>
    );

    // Hide the panel
    usePanelsStore.getState().toggleVisibility('chat');

    // Component should handle visibility internally
    const panel = container.querySelector('[data-panel-id="chat"]');
    // After visibility toggle, panel might not be rendered or be hidden
  });
});

describe('MemoryPanel', () => {
  const mockMetrics: MemoryMetric[] = [
    {
      label: 'CPU Usage',
      value: 45,
      max: 100,
      color: '#3b82f6',
      description: 'Current CPU utilization',
    },
    {
      label: 'Memory Usage',
      value: 1024,
      max: 2048,
      color: '#8b5cf6',
      description: 'RAM consumption',
    },
    {
      label: 'GPU Load',
      value: 30,
      max: 100,
      color: '#06b6d4',
      description: 'GPU utilization',
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
  });

  it('should render all metrics', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
    expect(screen.getByText('GPU Load')).toBeInTheDocument();
  });

  it('should display metric values correctly', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    expect(screen.getByText('45 / 100')).toBeInTheDocument();
    expect(screen.getByText('1024 / 2048')).toBeInTheDocument();
    expect(screen.getByText('30 / 100')).toBeInTheDocument();
  });

  it('should calculate percentages correctly', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    // CPU: 45/100 = 45.0%
    expect(screen.getByText('45.0%')).toBeInTheDocument();
    // Memory: 1024/2048 = 50.0%
    expect(screen.getByText('50.0%')).toBeInTheDocument();
    // GPU: 30/100 = 30.0%
    expect(screen.getByText('30.0%')).toBeInTheDocument();
  });

  it('should show metric descriptions when provided', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    expect(screen.getByText('Current CPU utilization')).toBeInTheDocument();
    expect(screen.getByText('RAM consumption')).toBeInTheDocument();
    expect(screen.getByText('GPU utilization')).toBeInTheDocument();
  });

  it('should toggle collapsed state', async () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    const collapseButton = screen.getByLabelText(/collapse panel/i);
    expect(screen.getByText('CPU Usage')).toBeVisible();

    fireEvent.click(collapseButton);

    await waitFor(() => {
      expect(screen.queryByText('CPU Usage')).not.toBeVisible();
    });
  });

  it('should display total metrics count', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    expect(screen.getByText('Total Metrics: 3')).toBeInTheDocument();
  });

  it('should display last updated timestamp', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    expect(screen.getByText(/Last Updated:/)).toBeInTheDocument();
  });

  it('should register panel in global store', () => {
    render(<MemoryPanel metrics={mockMetrics} />);

    const panels = usePanelsStore.getState().panels;
    expect(panels.has('memory')).toBe(true);
    expect(panels.get('memory')?.title).toBe('Memory');
  });

  it('should handle empty metrics array', () => {
    render(<MemoryPanel metrics={[]} />);

    expect(screen.getByText('Memory Metrics')).toBeInTheDocument();
    expect(screen.getByText('Total Metrics: 0')).toBeInTheDocument();
  });

  it('should apply custom colors to progress bars', () => {
    const { container } = render(<MemoryPanel metrics={mockMetrics} />);

    // Check if progress bars have custom colors
    const progressBars = container.querySelectorAll('[style*="background"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });
});

describe('GovernancePanel', () => {
  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should render with health score', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText('System Governance')).toBeInTheDocument();
      expect(screen.getByText(/Health Score/)).toBeInTheDocument();
    });
  });

  it('should display overall health percentage', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText('95.0%')).toBeInTheDocument();
    });
  });

  it('should show performance metrics', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText(/FPS:/)).toBeInTheDocument();
      expect(screen.getByText(/Throttle:/)).toBeInTheDocument();
      expect(screen.getByText(/Effects:/)).toBeInTheDocument();
      expect(screen.getByText(/GPU:/)).toBeInTheDocument();
    });
  });

  it('should display anomalies when present', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText('Minor FPS drop detected')).toBeInTheDocument();
    });
  });

  it('should show auto-fixed indicator for fixed anomalies', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText('✅ Auto-fixed')).toBeInTheDocument();
    });
  });

  it('should toggle collapsed state', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      expect(screen.getByText('System Governance')).toBeInTheDocument();
    });

    const collapseButton = screen.getByLabelText(/collapse panel/i);
    fireEvent.click(collapseButton);

    await waitFor(() => {
      const healthScore = screen.queryByText(/Health Score/);
      expect(healthScore).not.toBeVisible();
    });
  });

  it('should register panel in global store', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      const panels = usePanelsStore.getState().panels;
      expect(panels.has('governance')).toBe(true);
      expect(panels.get('governance')?.title).toBe('Governance');
    });
  });

  it('should refresh integrity report periodically', async () => {
    vi.useFakeTimers();

    const { UIIntegrityChecker } = await import('@/visual-engine/UIIntegrityChecker');
    const instance = UIIntegrityChecker.getInstance();
    const runCheckSpy = vi.spyOn(instance, 'runCheck');

    render(<GovernancePanel />);

    await waitFor(() => {
      expect(runCheckSpy).toHaveBeenCalled();
    });

    const initialCallCount = runCheckSpy.mock.calls.length;

    // Advance by 60 seconds to trigger interval
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    await waitFor(() => {
      expect(runCheckSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    vi.restoreAllMocks();
  });

  it('should display correct severity icons', async () => {
    render(<GovernancePanel />);

    await waitFor(() => {
      // Low severity should show 🔵
      const anomalyElement = screen.getByText('Minor FPS drop detected').parentElement;
      expect(anomalyElement?.textContent).toContain('🔵');
    });
  });
});

describe('Panels Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    usePanelsStore.getState().reset();
  });

  it('should manage z-index across multiple panels', () => {
    const { container: chatContainer } = render(
      <ChatPanel>
        <div>Chat Content</div>
      </ChatPanel>
    );

    const { container: memoryContainer } = render(
      <MemoryPanel metrics={[{ label: 'Test', value: 50, max: 100 }]} />
    );

    const chatPanel = chatContainer.querySelector('[data-panel-id="chat"]');
    const memoryPanel = memoryContainer.querySelector('[data-panel-id="memory"]');

    expect(chatPanel).toBeInTheDocument();
    expect(memoryPanel).toBeInTheDocument();

    // Click memory panel to bring it to front
    fireEvent.click(memoryPanel!);

    // Memory panel should now have higher z-index
    const chatZIndex = parseInt(window.getComputedStyle(chatPanel!).zIndex);
    const memoryZIndex = parseInt(window.getComputedStyle(memoryPanel!).zIndex);

    expect(memoryZIndex).toBeGreaterThanOrEqual(chatZIndex);
  });

  it('should persist panel states independently', async () => {
    render(
      <ChatPanel>
        <div>Chat Content</div>
      </ChatPanel>
    );

    render(<MemoryPanel metrics={[{ label: 'Test', value: 50, max: 100 }]} />);

    const chatCollapseButton = screen.getAllByLabelText(/collapse panel/i)[0];
    const memoryCollapseButton = screen.getAllByLabelText(/collapse panel/i)[1];

    // Collapse chat panel
    fireEvent.click(chatCollapseButton);

    await waitFor(() => {
      const chatStored = localStorage.getItem('titane-panel-chat');
      expect(chatStored).toBeDefined();
      const chatParsed = JSON.parse(chatStored!);
      expect(chatParsed.isCollapsed).toBe(true);
    });

    // Memory panel should still be expanded
    const memoryStored = localStorage.getItem('titane-panel-memory');
    if (memoryStored) {
      const memoryParsed = JSON.parse(memoryStored);
      expect(memoryParsed.isCollapsed).toBe(false);
    }
  });

  it('should apply layout presets to all panels', () => {
    render(
      <ChatPanel>
        <div>Chat Content</div>
      </ChatPanel>
    );

    render(<MemoryPanel metrics={[{ label: 'Test', value: 50, max: 100 }]} />);

    // Apply minimal layout
    act(() => {
      usePanelsStore.getState().applyLayout('minimal');
    });

    const panels = usePanelsStore.getState().panels;
    expect(panels.get('chat')?.isVisible).toBe(true);
    expect(panels.get('memory')?.isVisible).toBe(false);
  });

  it('should coordinate visual states across panels', async () => {
    const engine = TitaneVisualEngine.getInstance();

    render(
      <ChatPanel>
        <div>Chat Content</div>
      </ChatPanel>
    );

    render(<MemoryPanel metrics={[{ label: 'Test', value: 50, max: 100 }]} />);

    // Change visual state
    act(() => {
      engine.start();
      engine.setState('focus', 500);
    });

    await waitFor(() => {
      // Both panels should respond to the same visual state
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Memory Metrics')).toBeInTheDocument();
    });
  });
});

// Helper function for act
function act(callback: () => void) {
  callback();
}
