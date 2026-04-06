/**
 * Tests pour MemoryTreeViewer Component
 * Coverage: rendu, controls, callback node click
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryTreeViewer } from '@/features/memory/MemoryTreeViewer';

vi.mock('react-d3-tree', () => ({
  default: ({ data, renderCustomNodeElement, translate, dimensions }: any) => (
    <div
      data-testid="mock-tree"
      data-translate-x={translate?.x}
      data-translate-y={translate?.y}
      data-dimensions={`${dimensions?.width ?? 0}x${dimensions?.height ?? 0}`}
    >
      <span>{data?.name}</span>
      <svg data-testid="mock-tree-rendered">
        {data?.children?.map((child: any, index: number) => (
          <g key={index}>
            {renderCustomNodeElement?.({
              nodeDatum: child,
              hierarchyPointNode: { x: 120 + index * 80, y: 220 + index * 40 },
            })}
          </g>
        ))}
      </svg>
    </div>
  ),
}));

describe('MemoryTreeViewer Component', () => {
  const mockMemoryTree = {
    name: 'Mémoire TITANE',
    attributes: { type: 'root' },
    children: [
      { name: 'Court Terme', attributes: { type: 'short', entryId: 'short-1' } },
      { name: 'Moyen Terme', attributes: { type: 'mid' } },
      { name: 'Long Terme', attributes: { type: 'long' } },
    ],
  };

  describe('Rendering', () => {
    it('should render an honest empty state without data', () => {
      render(<MemoryTreeViewer />);
      expect(screen.getByText(/aucune entrée mémoire disponible/i)).toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/rechercher dans la mémoire/i)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/court terme/i)).not.toBeInTheDocument();
    });

    it('should render a bootstrap loading state before the persistent tree is ready', () => {
      render(<MemoryTreeViewer isLoading={true} />);
      expect(screen.getByText(/chargement de l'arbre mémoire/i)).toBeInTheDocument();
      expect(
        screen.queryByText(/aucune entrée mémoire disponible/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText(/rechercher dans la mémoire/i)
      ).not.toBeInTheDocument();
    });

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

    it('should expose and highlight the selected entry state', () => {
      const { container } = render(
        <MemoryTreeViewer data={mockMemoryTree} selectedEntryId="short-1" />
      );

      expect(screen.getByTestId('memory-tree-selection-state')).toHaveTextContent(
        'short-1'
      );
      expect(container.querySelector('circle[stroke="#22d3ee"]')).toBeInTheDocument();
    });

    it('should recenter the tree when an external selection is synchronized', () => {
      render(<MemoryTreeViewer data={mockMemoryTree} selectedEntryId="short-1" />);
      const tree = screen.getByTestId('mock-tree');

      expect(tree.getAttribute('data-dimensions')).toBe('800x600');
      expect(tree.getAttribute('data-translate-x')).not.toBe('400');
      expect(tree.getAttribute('data-translate-y')).not.toBe('200');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryTreeViewer data={mockMemoryTree} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
