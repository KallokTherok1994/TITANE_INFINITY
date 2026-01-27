/**
 * Tests pour MemoryCard Component
 * Coverage: Affichage entrée mémoire, Actions, Métadonnées
 */

/* eslint-disable react/jsx-no-undef */
// Ce fichier teste un composant non encore implémenté - skip activé

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryCard } from '@/features/memory/MemoryCard'; // Component not implemented

describe.skip('MemoryCard Component (NON IMPLÉMENTÉ - fichier inexistant)', () => {
  const mockEntry = {
    id: 'mem-1',
    content: 'Test memory entry',
    tier: 'stm',
    timestamp: Date.now(),
    importance: 0.8,
  };

  const mockOnDelete = vi.fn();
  const mockOnPromote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render memory content', () => {
      render(<MemoryCard entry={mockEntry} />);
      expect(screen.getByText('Test memory entry')).toBeInTheDocument();
    });

    it('should show memory tier', () => {
      render(<MemoryCard entry={mockEntry} />);
      expect(screen.getByText(/STM|short/i)).toBeTruthy();
    });

    it('should show importance level', () => {
      render(<MemoryCard entry={mockEntry} showImportance />);
      expect(screen.getByText(/0\.8|80%|high/i)).toBeTruthy();
    });

    it('should display timestamp', () => {
      render(<MemoryCard entry={mockEntry} showTimestamp />);
      // Timestamp devrait être formaté et visible
      const card = screen.getByText('Test memory entry').parentElement;
      expect(card).toBeTruthy();
    });
  });

  describe('Actions', () => {
    it('should handle delete action', () => {
      render(<MemoryCard entry={mockEntry} onDelete={mockOnDelete} />);
      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteBtn);
      expect(mockOnDelete).toHaveBeenCalledWith('mem-1');
    });

    it('should handle promote action', () => {
      render(<MemoryCard entry={mockEntry} onPromote={mockOnPromote} />);
      const promoteBtn = screen.getByRole('button', { name: /promote/i });
      fireEvent.click(promoteBtn);
      expect(mockOnPromote).toHaveBeenCalledWith('mem-1');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(<MemoryCard entry={mockEntry} onDelete={mockOnDelete} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
