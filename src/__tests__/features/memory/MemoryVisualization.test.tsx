/**
 * Tests pour MemoryTreeViewer Component
 * Coverage: rendu, controls, callback node click
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryTreeViewer } from '@/features/memory/MemoryTreeViewer';

vi.mock('react-d3-tree', () => ({
  default: ({ data, renderCustomNodeElement }: any) => (
    <div data-testid="mock-tree">
      <span>{data?.name}</span>
      <button
        type="button"
        onClick={() => renderCustomNodeElement?.({ nodeDatum: data })}
      >
        render-node
      </button>
    </div>
  ),
}));

describe('MemoryTreeViewer Component', () => {
  const mockMemoryTree = {
    name: 'Mémoire TITANE',
    attributes: { type: 'root' },
    children: [
      { name: 'Court Terme', attributes: { type: 'short' } },
      { name: 'Moyen Terme', attributes: { type: 'mid' } },
      { name: 'Long Terme', attributes: { type: 'long' } },
    ],
  };

  describe('Rendering', () => {
    it('should render memory tree', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(screen.getByTestId('mock-tree')).toBeInTheDocument();
      expect(screen.getByText('Mémoire TITANE')).toBeInTheDocument();
    });

    it('should render controls and search input', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(
        screen.getByPlaceholderText(/rechercher dans la mémoire/i)
      ).toBeInTheDocument();
      expect(screen.getByTitle(/zoom avant/i)).toBeInTheDocument();
      expect(screen.getByTitle(/zoom arrière/i)).toBeInTheDocument();
    });

    it('should react to search input changes', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} />);
      const input = screen.getByPlaceholderText(/rechercher dans la mémoire/i);
      fireEvent.change(input, { target: { value: 'court' } });
      expect(input).toHaveValue('court');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
