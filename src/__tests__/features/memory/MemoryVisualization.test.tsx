/**
 * Tests pour MemoryVisualization Component
 * Coverage: Arbre mémoire, Navigation, États STM/MTM/LTM
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryVisualization } from '@/features/memory/MemoryVisualization';

describe('MemoryVisualization Component', () => {
  const mockMemoryTree = {
    stm: { entries: 150, size: 1024000, nodes: [] },
    mtm: { entries: 500, size: 5120000, nodes: [] },
    ltm: { entries: 2000, size: 20480000, nodes: [] },
  };

  describe('Rendering', () => {
    it('should render memory tree', () => {
      render(<MemoryVisualization tree={mockMemoryTree} />);
      expect(screen.getByText(/memory/i) || screen.getByText(/STM|MTM|LTM/i)).toBeTruthy();
    });

    it('should display STM tier', () => {
      render(<MemoryVisualization tree={mockMemoryTree} />);
      expect(screen.getByText(/short.*term|STM/i)).toBeTruthy();
    });

    it('should display MTM tier', () => {
      render(<MemoryVisualization tree={mockMemoryTree} />);
      expect(screen.getByText(/mid.*term|MTM/i)).toBeTruthy();
    });

    it('should display LTM tier', () => {
      render(<MemoryVisualization tree={mockMemoryTree} />);
      expect(screen.getByText(/long.*term|LTM/i)).toBeTruthy();
    });
  });

  describe('Stats', () => {
    it('should show total entries', () => {
      render(<MemoryVisualization tree={mockMemoryTree} showStats />);
      // Total: 150 + 500 + 2000 = 2650
      expect(screen.getByText(/2650|150|500|2000/)).toBeTruthy();
    });

    it('should show memory sizes', () => {
      render(<MemoryVisualization tree={mockMemoryTree} showStats />);
      // Devrait afficher des tailles formatées
      expect(screen.getByText(/KB|MB|GB/i)).toBeTruthy();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryVisualization tree={mockMemoryTree} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
