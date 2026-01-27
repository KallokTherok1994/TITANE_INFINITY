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
    label: 'Root',
    tier: 'LTM',
    children: [
      { id: 'child1', label: 'Child 1', tier: 'MTM', children: [] },
      { id: 'child2', label: 'Child 2', tier: 'STM', children: [
        { id: 'grandchild', label: 'Grandchild', tier: 'STM', children: [] }
      ]},
    ],
  };

  describe('Rendering', () => {
    it('should render memory tree', () => {
      render(<MemoryTree tree={mockTree} />);
      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    it('should render root node', () => {
      render(<MemoryTree tree={mockTree} />);
      expect(screen.getByText('Root')).toBeInTheDocument();
    });

    it('should show tier badges', () => {
      render(<MemoryTree tree={mockTree} />);
      expect(screen.getByText('LTM')).toBeInTheDocument();
    });
  });

  describe('Tree Expansion', () => {
    it('should expand node on click', () => {
      render(<MemoryTree tree={mockTree} />);
      
      const rootNode = screen.getByText('Root');
      fireEvent.click(rootNode);
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should collapse expanded node', () => {
      render(<MemoryTree tree={mockTree} defaultExpanded={['root']} />);
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      
      const rootNode = screen.getByText('Root');
      fireEvent.click(rootNode);
      
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });

    it('should expand nested nodes', () => {
      render(<MemoryTree tree={mockTree} defaultExpanded={['root']} />);
      
      const child2 = screen.getByText('Child 2');
      fireEvent.click(child2);
      
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate with keyboard', () => {
      render(<MemoryTree tree={mockTree} />);
      
      const rootNode = screen.getByText('Root');
      rootNode.focus();
      
      fireEvent.keyDown(rootNode, { key: 'ArrowRight' });
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('should support expand all', () => {
      render(<MemoryTree tree={mockTree} />);
      
      const expandAllButton = screen.getByRole('button', { name: /expand all/i });
      fireEvent.click(expandAllButton);
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Grandchild')).toBeInTheDocument();
    });

    it('should support collapse all', () => {
      render(<MemoryTree tree={mockTree} defaultExpanded={['root', 'child2']} />);
      
      const collapseAllButton = screen.getByRole('button', { name: /collapse all/i });
      fireEvent.click(collapseAllButton);
      
      expect(screen.queryByText('Child 1')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should select node on click', () => {
      const onSelect = vi.fn();
      render(<MemoryTree tree={mockTree} onSelect={onSelect} defaultExpanded={['root']} />);
      
      const child1 = screen.getByText('Child 1');
      fireEvent.click(child1);
      
      expect(onSelect).toHaveBeenCalledWith('child1');
    });

    it('should highlight selected node', () => {
      render(<MemoryTree tree={mockTree} selected="child1" defaultExpanded={['root']} />);
      
      const child1 = screen.getByText('Child 1');
      expect(child1.className).toMatch(/selected|active/i);
    });
  });

  describe('Memory Tiers', () => {
    it('should show STM nodes', () => {
      render(<MemoryTree tree={mockTree} defaultExpanded={['root']} />);
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });

    it('should show MTM nodes', () => {
      render(<MemoryTree tree={mockTree} defaultExpanded={['root']} />);
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    it('should show LTM nodes', () => {
      render(<MemoryTree tree={mockTree} />);
      expect(screen.getByText('Root')).toBeInTheDocument();
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryTree tree={mockTree} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
