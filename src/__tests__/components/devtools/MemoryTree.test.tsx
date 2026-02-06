// @ts-nocheck
/**
 * Tests pour MemoryTree Component
 * Coverage: Tree structure, Expansion, Navigation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryTree } from '@/components/devtools/MemoryTree';
import type { MemoryNode } from '@/types';

describe('MemoryTree Component', () => {
  const mockTree: MemoryNode = {
    id: 'root',
    type: 'conversation',
    content: 'Root content',
    timestamp: Date.now(),
    children: [
      {
        id: 'child1',
        type: 'context',
        content: 'Child 1 content',
        timestamp: Date.now(),
        children: [],
      },
      {
        id: 'child2',
        type: 'knowledge',
        content: 'Child 2 content',
        timestamp: Date.now(),
        children: [
          {
            id: 'grandchild',
            type: 'project',
            content: 'Grandchild content',
            timestamp: Date.now(),
            children: [],
          },
        ],
      },
    ],
  };

  describe('Rendering', () => {
    it('should render memory tree content', () => {
      render(<MemoryTree root={mockTree} />);
      expect(screen.getByText('Root content')).toBeInTheDocument();
      expect(screen.getByText('Child 1 content')).toBeInTheDocument();
      expect(screen.getByText('Grandchild content')).toBeInTheDocument();
    });

    it('should render node types', () => {
      render(<MemoryTree root={mockTree} />);
      expect(screen.getByText('conversation')).toBeInTheDocument();
      expect(screen.getByText('knowledge')).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onNodeClick with the node', () => {
      const onNodeClick = vi.fn();
      render(<MemoryTree root={mockTree} onNodeClick={onNodeClick} />);

      const child = screen.getByText('Child 1 content');
      fireEvent.click(child);

      expect(onNodeClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'child1' })
      );
    });
  });
});
