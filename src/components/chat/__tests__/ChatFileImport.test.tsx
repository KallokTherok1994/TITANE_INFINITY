import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const parseDocumentMock = vi.fn();
const invokeTauriMock = vi.fn();
const knowledgeVaultIngestMock = vi.fn();
const alertMock = vi.fn();

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    parseDocument: (...args: unknown[]) => parseDocumentMock(...args),
  },
}));

vi.mock('@/core/commands/TAURI_COMMANDS', () => ({
  TAURI_COMMANDS: {
    MEMORY_INGEST_FILE: 'memory_ingest_file',
  },
  invokeTauri: (...args: unknown[]) => invokeTauriMock(...args),
}));

vi.mock('@/cognitive/knowledge/knowledgeVault', () => ({
  knowledgeVault: {
    ingest: (...args: unknown[]) => knowledgeVaultIngestMock(...args),
  },
}));

describe('ChatFileImport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parseDocumentMock.mockResolvedValue({
      content: 'Contenu PDF important pour la mémoire TITANE',
    });
    invokeTauriMock.mockResolvedValue({ ok: true });
    knowledgeVaultIngestMock.mockResolvedValue({ id: 'kb-pdf-1' });
    vi.stubGlobal('alert', alertMock);
  });

  it('accepts PDF imports and routes extracted content into analysis + memory ingestion', async () => {
    const onFileAnalyzed = vi.fn();
    const { ChatFileImport } = await import('../ChatFileImport');
    const { container } = render(<ChatFileImport onFileAnalyzed={onFileAnalyzed} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain('.pdf');
    expect(input.accept).toContain('.docx');

    const file = new File(['%PDF-1.4 fake'], 'memoire.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(file, 'path', {
      value: '/tmp/memoire.pdf',
      configurable: true,
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileAnalyzed).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'memoire.pdf',
          content: 'Contenu PDF important pour la mémoire TITANE',
          type: 'document',
        })
      );
    });

    expect(parseDocumentMock).toHaveBeenCalledWith({ filePath: '/tmp/memoire.pdf' });
    expect(knowledgeVaultIngestMock).toHaveBeenCalledWith(
      '/tmp/memoire.pdf',
      'Contenu PDF important pour la mémoire TITANE',
      expect.objectContaining({
        createdAt: expect.any(Number),
        modifiedAt: expect.any(Number),
      })
    );
    expect(invokeTauriMock).toHaveBeenCalled();
    expect(alertMock).not.toHaveBeenCalled();
  });
});
