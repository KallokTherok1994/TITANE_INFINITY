/**
 * TITANE∞ — Tests ToolSelectorPanel
 * Couverture: rendu, ouverture/fermeture, clics, badges, data-testid stables
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ToolSelectorPanel } from '../ToolSelectorPanel';
import { CHAT_TOOLS } from '@/features/chat/chatToolsRegistry';

// Stub CSS import (Vitest + jsdom ne chargent pas les CSS)
vi.mock('../ToolSelectorPanel.css', () => ({}));

const defaultProps = {
  isOpen: false,
  onToggle: vi.fn(),
  onClose: vi.fn(),
  onToolSelect: vi.fn(),
  isOnline: true,
  deepAnalysisActive: false,
};

describe('ToolSelectorPanel', () => {
  it('rend le bouton déclencheur avec data-testid correct', () => {
    render(<ToolSelectorPanel {...defaultProps} />);
    expect(screen.getByTestId('tool-selector-btn')).toBeInTheDocument();
  });

  it('le panel est masqué par défaut (isOpen=false)', () => {
    render(<ToolSelectorPanel {...defaultProps} />);
    expect(screen.queryByTestId('tool-selector-panel')).not.toBeInTheDocument();
  });

  it('affiche le panel quand isOpen=true', () => {
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId('tool-selector-panel')).toBeInTheDocument();
  });

  it('appelle onToggle au clic sur le bouton', () => {
    const onToggle = vi.fn();
    render(<ToolSelectorPanel {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByTestId('tool-selector-btn'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('rend toutes les cartes outil quand isOpen=true', () => {
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} />);
    for (const tool of CHAT_TOOLS) {
      expect(screen.getByTestId(`tool-item-${tool.id}`)).toBeInTheDocument();
    }
  });

  it('appelle onToolSelect avec le bon outil au clic sur une carte', () => {
    const onToolSelect = vi.fn();
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} onToolSelect={onToolSelect} />);
    const firstTool = CHAT_TOOLS[0];
    fireEvent.click(screen.getByTestId(`tool-item-${firstTool.id}`));
    expect(onToolSelect).toHaveBeenCalledWith(firstTool);
  });

  it('appelle onToolSelect avec un outil autoSend=true', () => {
    const onToolSelect = vi.fn();
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} onToolSelect={onToolSelect} />);
    const autoTool = CHAT_TOOLS.find(t => t.autoSend);
    expect(autoTool).toBeDefined();
    fireEvent.click(screen.getByTestId(`tool-item-${autoTool!.id}`));
    expect(onToolSelect).toHaveBeenCalledWith(expect.objectContaining({ autoSend: true }));
  });

  it('affiche le badge online quand isOnline=true', () => {
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} isOnline={true} />);
    expect(screen.getByTestId('tool-status-online')).toBeInTheDocument();
    expect(screen.getByTestId('tool-status-online')).toHaveTextContent(/en ligne/i);
  });

  it('affiche "Hors ligne" quand isOnline=false', () => {
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} isOnline={false} />);
    expect(screen.getByTestId('tool-status-online')).toHaveTextContent(/hors ligne/i);
  });

  it('affiche le badge deep analysis quand deepAnalysisActive=true', () => {
    render(
      <ToolSelectorPanel {...defaultProps} isOpen={true} deepAnalysisActive={true} />
    );
    expect(screen.getByTestId('tool-status-deep')).toBeInTheDocument();
  });

  it('masque le badge deep analysis quand deepAnalysisActive=false', () => {
    render(
      <ToolSelectorPanel {...defaultProps} isOpen={true} deepAnalysisActive={false} />
    );
    expect(screen.queryByTestId('tool-status-deep')).not.toBeInTheDocument();
  });

  it('appelle onClose au clic extérieur', async () => {
    const onClose = vi.fn();
    render(
      <div>
        <div data-testid="outside">Extérieur</div>
        <ToolSelectorPanel
          {...defaultProps}
          isOpen={true}
          onClose={onClose}
        />
      </div>
    );
    fireEvent.mouseDown(screen.getByTestId('outside'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('appelle onClose sur Escape', async () => {
    const onClose = vi.fn();
    render(<ToolSelectorPanel {...defaultProps} isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('le bouton est disabled quand la prop disabled est true', () => {
    render(<ToolSelectorPanel {...defaultProps} disabled={true} />);
    expect(screen.getByTestId('tool-selector-btn')).toBeDisabled();
  });
});
