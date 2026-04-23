/**
 * Tests unitaires — DocCenterPage
 * Règle 16 : tout composant UI doit avoir au moins un test Vitest + data-testid stable
 * Couverture : rendu initial, bouton, champs, status, succès IPC, erreur IPC
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock tauriClient — factory doit utiliser vi.fn() inline (vi.mock est hoissté)
vi.mock('../../lib/tauriClient', () => ({
  tauriClient: {
    exportDocxFile: vi.fn(),
  },
}));

// Mock tauriCommands
vi.mock('../../lib/tauriCommands', () => ({
  TAURI_COMMANDS: {
    EXPORT_DOCX_FILE: 'export_docx_file',
  },
}));

import { tauriClient } from '../../lib/tauriClient';
import { DocCenterPage } from '../DocCenterPage';

const mockExportDocxFile = vi.mocked(tauriClient.exportDocxFile);

describe('DocCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Rendu initial ─────────────────────────────────────────────────────────

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

  it("ne montre pas le statut d'export initialement", () => {
    render(<DocCenterPage />);
    expect(screen.queryByTestId('doc-export-status')).toBeNull();
  });

  it('rend les champs de saisie avec data-testid', () => {
    render(<DocCenterPage />);
    expect(screen.getByTestId('input-doc-title')).toBeDefined();
    expect(screen.getByTestId('input-output-dir')).toBeDefined();
  });

  it('champ titre a une valeur par défaut non vide', () => {
    render(<DocCenterPage />);
    const input = screen.getByTestId('input-doc-title') as HTMLInputElement;
    expect(input.value.length).toBeGreaterThan(0);
  });

  it('champ output-dir a une valeur par défaut', () => {
    render(<DocCenterPage />);
    const input = screen.getByTestId('input-output-dir') as HTMLInputElement;
    expect(input.value.length).toBeGreaterThan(0);
  });

  // ─── IPC succès ────────────────────────────────────────────────────────────

  it('affiche le statut de succès après un export réussi', async () => {
    mockExportDocxFile.mockResolvedValueOnce({
      ok: true,
      content: { path: '/tmp/rapport.docx', size: 1234 },
      error: undefined,
    });
    render(<DocCenterPage />);
    fireEvent.click(screen.getByTestId('btn-export-docx'));
    await waitFor(() => {
      const status = screen.getByTestId('doc-export-status');
      expect(status.textContent).toContain('/tmp/rapport.docx');
    });
  });

  it('affiche la taille du fichier dans le statut succès', async () => {
    mockExportDocxFile.mockResolvedValueOnce({
      ok: true,
      content: { path: '/tmp/rapport.docx', size: 5678 },
      error: undefined,
    });
    render(<DocCenterPage />);
    fireEvent.click(screen.getByTestId('btn-export-docx'));
    await waitFor(() => {
      const status = screen.getByTestId('doc-export-status');
      expect(status.textContent).toContain('5678');
    });
  });

  // ─── IPC erreur ────────────────────────────────────────────────────────────

  it("affiche un message d'erreur quand ok=false", async () => {
    mockExportDocxFile.mockResolvedValueOnce({
      ok: false,
      content: undefined,
      error: 'permission denied',
    });
    render(<DocCenterPage />);
    fireEvent.click(screen.getByTestId('btn-export-docx'));
    await waitFor(() => {
      const status = screen.getByTestId('doc-export-status');
      expect(status.textContent).toContain('permission denied');
    });
  });

  it('affiche une erreur IPC en cas de rejet invoke', async () => {
    mockExportDocxFile.mockRejectedValueOnce(new Error('IPC unreachable'));
    render(<DocCenterPage />);
    fireEvent.click(screen.getByTestId('btn-export-docx'));
    await waitFor(() => {
      const status = screen.getByTestId('doc-export-status');
      expect(status.textContent).toContain('IPC unreachable');
    });
  });

  // ─── Contrat IPC ───────────────────────────────────────────────────────────

  it('appelle exportDocxFile avec le bon payload', async () => {
    mockExportDocxFile.mockResolvedValueOnce({
      ok: true,
      content: { path: '/tmp/x.docx', size: 100 },
    });
    render(<DocCenterPage />);
    fireEvent.click(screen.getByTestId('btn-export-docx'));
    await waitFor(() => screen.getByTestId('doc-export-status'));
    expect(mockExportDocxFile).toHaveBeenCalledWith(
      expect.objectContaining({ req: expect.any(Object) })
    );
  });
});
