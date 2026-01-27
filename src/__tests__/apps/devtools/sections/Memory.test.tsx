/**
 * Tests pour DevTools Memory Section
 * Coverage: Arbre mémoire, STM/MTM/LTM, Purge, Navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Memory } from '@/apps/devtools/sections/Memory';

// Mock store
vi.mock('@/apps/devtools/store/devtools.store', () => ({
  useDevToolsStore: () => ({
    memoryTree: [
      { id: 'stm', name: 'Short-Term Memory', size: 1024000, entries: 150, children: [] },
      { id: 'mtm', name: 'Mid-Term Memory', size: 5120000, entries: 500, children: [] },
      { id: 'ltm', name: 'Long-Term Memory', size: 20480000, entries: 2000, children: [] },
    ],
  }),
}));

vi.mock('@/apps/devtools/components', () => ({
  SectionHeader: ({ title, description, actions }: any) => (
    <div data-testid="section-header">
      <h2>{title}</h2>
      <p>{description}</p>
      <div>{actions}</div>
    </div>
  ),
  MemoryTree: ({ nodes, onNodeClick }: any) => (
    <div data-testid="memory-tree">
      {nodes.map((node: any) => (
        <button key={node.id} onClick={() => onNodeClick(node)} data-testid={`node-${node.id}`}>
          {node.name}: {node.entries} entries
        </button>
      ))}
    </div>
  ),
}));

describe('DevTools Memory Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render memory section', () => {
      render(<Memory />);
      expect(screen.getByTestId('section-header')).toBeInTheDocument();
      expect(screen.getByText(/Memory Explorer/i)).toBeInTheDocument();
    });

    it('should display memory tree', () => {
      render(<Memory />);
      expect(screen.getByTestId('memory-tree')).toBeInTheDocument();
    });

    it('should show all memory tiers', () => {
      render(<Memory />);
      expect(screen.getByTestId('node-stm')).toBeInTheDocument();
      expect(screen.getByTestId('node-mtm')).toBeInTheDocument();
      expect(screen.getByTestId('node-ltm')).toBeInTheDocument();
    });

    it('should display entry counts', () => {
      render(<Memory />);
      expect(screen.getByText(/150 entries/i)).toBeInTheDocument();
      expect(screen.getByText(/500 entries/i)).toBeInTheDocument();
      expect(screen.getByText(/2000 entries/i)).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should have Purge STM button', () => {
      render(<Memory />);
      const purgeBtn = screen.getByRole('button', { name: /Purge STM/i });
      expect(purgeBtn).toBeInTheDocument();
    });

    it('should handle node selection', () => {
      render(<Memory />);
      const stmNode = screen.getByTestId('node-stm');
      fireEvent.click(stmNode);
      // Node should be selectable (state managed internally)
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<Memory />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
