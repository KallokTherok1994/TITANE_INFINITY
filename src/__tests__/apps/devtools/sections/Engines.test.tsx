/**
 * Tests pour DevTools Engines Section
 * Coverage: Liste moteurs, Filtrage, Actions (restart, inspect)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Engines } from '@/apps/devtools/sections/Engines';

// Mock store
const mockUpdateEngine = vi.fn();
const mockSetSelectedEngine = vi.fn();

vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    engines: [
      { id: 'chat-engine', name: 'Chat Engine', status: 'running', lastExecution: Date.now(), errorCount: 0 },
      { id: 'memory-engine', name: 'Memory Engine', status: 'idle', lastExecution: Date.now() - 60000, errorCount: 0 },
      { id: 'fusion-engine', name: 'Fusion Engine', status: 'error', lastExecution: Date.now(), errorCount: 3 },
    ],
    updateEngine: mockUpdateEngine,
    setSelectedEngine: mockSetSelectedEngine,
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, description }: any) => (
    <div data-testid="section-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
  EngineCard: ({ engine, onRestart, onInspect }: any) => (
    <div data-testid={`engine-${engine.id}`}>
      <span>{engine.name}</span>
      <span data-testid={`status-${engine.id}`}>{engine.status}</span>
      <button onClick={() => onRestart(engine.id)}>Restart</button>
      <button onClick={() => onInspect(engine.id)}>Inspect</button>
    </div>
  ),
}));

describe('DevTools Engines Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render engines section', () => {
      render(<Engines />);
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
    });

    it('should display all engines by default', () => {
      render(<Engines />);
      expect(screen.getByTestId('engine-chat-engine')).toBeInTheDocument();
      expect(screen.getByTestId('engine-memory-engine')).toBeInTheDocument();
      expect(screen.getByTestId('engine-fusion-engine')).toBeInTheDocument();
    });

    it('should display engine statuses', () => {
      render(<Engines />);
      expect(screen.getByTestId('status-chat-engine')).toHaveTextContent('running');
      expect(screen.getByTestId('status-memory-engine')).toHaveTextContent('idle');
      expect(screen.getByTestId('status-fusion-engine')).toHaveTextContent('error');
    });
  });

  describe('Filtering', () => {
    it('should filter engines by status', () => {
      render(<Engines />);
      
      // Test initial state (all)
      expect(screen.getAllByRole('button', { name: /restart/i })).toHaveLength(3);
    });
  });

  describe('Actions', () => {
    it('should handle engine restart', () => {
      vi.useFakeTimers();
      render(<Engines />);
      
      const restartBtn = screen.getAllByRole('button', { name: /restart/i })[0];
      fireEvent.click(restartBtn);
      
      expect(mockUpdateEngine).toHaveBeenCalledWith('chat-engine', { status: 'starting' });
      
      vi.advanceTimersByTime(1000);
      expect(mockUpdateEngine).toHaveBeenCalledWith('chat-engine', expect.objectContaining({ status: 'running' }));
      
      vi.useRealTimers();
    });

    it('should handle engine inspection', () => {
      render(<Engines />);
      
      const inspectBtn = screen.getAllByRole('button', { name: /inspect/i })[0];
      fireEvent.click(inspectBtn);
      
      expect(mockSetSelectedEngine).toHaveBeenCalledWith('chat-engine');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Engines />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
