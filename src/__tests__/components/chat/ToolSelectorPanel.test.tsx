/**
 * Tests unitaires — ToolSelectorPanel
 * Coverage: rendu, toggle, sélection outil, fermeture, data-testid stables
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ToolSelectorPanel } from '@/components/chat/ToolSelectorPanel';

// ── Mocks CSS (pas de transformation CSS dans Vitest JSDOM) ───────────────────
vi.mock('@/components/chat/ToolSelectorPanel.css', () => ({}));

describe('ToolSelectorPanel', () => {
  const defaultProps = {
    isOpen: false,
    onToggle: vi.fn(),
    onClose: vi.fn(),
    onToolSelect: vi.fn(),
    isOnline: true,
    deepAnalysisActive: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendu bouton trigger ────────────────────────────────────────────────────
  describe('Bouton trigger', () => {
    it('rend le bouton ⚡ avec data-testid stable', () => {
      render(<ToolSelectorPanel {...defaultProps} />);
      expect(screen.getByTestId('tool-selector-btn')).toBeInTheDocument();
    });

    it('appelle onToggle au clic', () => {
      render(<ToolSelectorPanel {...defaultProps} />);
      fireEvent.click(screen.getByTestId('tool-selector-btn'));
      expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
    });
  });

  // ── Panneau fermé ───────────────────────────────────────────────────────────
  describe('Panneau fermé (isOpen=false)', () => {
    it('ne rend pas le panneau quand isOpen=false', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('tool-selector-panel')).not.toBeInTheDocument();
    });
  });

  // ── Panneau ouvert ──────────────────────────────────────────────────────────
  describe('Panneau ouvert (isOpen=true)', () => {
    it('rend le panneau avec data-testid stable quand isOpen=true', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      expect(screen.getByTestId('tool-selector-panel')).toBeInTheDocument();
    });

    it('rend 10 outils dans le panneau', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      // 10 tool cards avec data-testid tool-item-{id}
      const toolItems = screen.getAllByTestId(/^tool-item-/);
      expect(toolItems).toHaveLength(10);
    });

    it('rend les catégories — au moins generate et research', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      // Plusieurs éléments peuvent contenir le texte — on vérifie l'existence via queryAllByText
      expect(screen.queryAllByText(/générer/i).length).toBeGreaterThan(0);
      expect(screen.queryAllByText(/recherche/i).length).toBeGreaterThan(0);
    });

    it('appelle onToolSelect avec le bon outil au clic', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      const firstTool = screen.getByTestId('tool-item-generate_file');
      fireEvent.click(firstTool);
      expect(defaultProps.onToolSelect).toHaveBeenCalledTimes(1);
      const calledWith = (defaultProps.onToolSelect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledWith).toMatchObject({ id: 'generate_file' });
    });

    it('appelle onToolSelect pour web_search', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      fireEvent.click(screen.getByTestId('tool-item-web_search'));
      const calledWith = (defaultProps.onToolSelect as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledWith).toMatchObject({ id: 'web_search', category: 'research' });
    });
  });

  // ── Indicateurs de statut ───────────────────────────────────────────────────
  describe('Indicateurs de statut', () => {
    it('rend tool-status-online quand isOpen=true', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
      expect(screen.getByTestId('tool-status-online')).toBeInTheDocument();
    });

    it('affiche badge hors-ligne quand isOnline=false', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} isOnline={false} />);
      expect(screen.getByTestId('tool-status-online')).toBeInTheDocument();
      expect(screen.getByTestId('tool-status-online')).toHaveTextContent(/hors ligne/i);
    });

    it('rend tool-status-deep quand deepAnalysisActive=true', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} deepAnalysisActive={true} />);
      expect(screen.getByTestId('tool-status-deep')).toBeInTheDocument();
    });

    it('cache tool-status-deep quand deepAnalysisActive=false', () => {
      render(<ToolSelectorPanel {...defaultProps} isOpen={true} deepAnalysisActive={false} />);
      expect(screen.queryByTestId('tool-status-deep')).not.toBeInTheDocument();
    });
  });
});
