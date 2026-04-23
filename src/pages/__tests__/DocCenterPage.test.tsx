/**
 * Tests unitaires — DocCenterPage
 * Règle 16 : tout composant UI doit avoir au moins un test Vitest + data-testid stable
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

// Mock tauriCommands
vi.mock('../../lib/tauriCommands', () => ({
  TAURI_COMMANDS: {
    EXPORT_DOCX_FILE: 'export_docx_file',
  },
}));

import { DocCenterPage } from '../DocCenterPage';

describe('DocCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rend la page avec le data-testid stable', () => {
    render(<DocCenterPage />);
    expect(screen.getByTestId('doc-center-page')).toBeDefined();
  });

  it('rend le bouton export DOCX avec data-testid', () => {
    render(<DocCenterPage />);
    expect(screen.getByTestId('btn-export-docx')).toBeDefined();
  });

  it('le bouton export est cliquable (non-disabled par défaut)', () => {
    render(<DocCenterPage />);
    const btn = screen.getByTestId('btn-export-docx') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('ne montre pas le statut d\'export initialement', () => {
    render(<DocCenterPage />);
    expect(screen.queryByTestId('doc-export-status')).toBeNull();
  });

  it('rend les champs de saisie avec data-testid', () => {
    render(<DocCenterPage />);
    expect(screen.getByTestId('input-doc-title')).toBeDefined();
    expect(screen.getByTestId('input-output-dir')).toBeDefined();
  });
});
