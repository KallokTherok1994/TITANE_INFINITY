import { fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const memoryIngestFileMock = vi.fn();
const awardExperienceMock = vi.fn();
const knowledgeVaultIngestMock = vi.fn();

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    memoryIngestFile: (...args: unknown[]) => memoryIngestFileMock(...args),
    parseDocument: vi.fn(),
  },
}));

vi.mock('../../../services/experienceService', () => ({
  awardExperience: (...args: unknown[]) => awardExperienceMock(...args),
}));

vi.mock('@/cognitive/knowledge/knowledgeVault', () => ({
  knowledgeVault: {
    ingest: (...args: unknown[]) => knowledgeVaultIngestMock(...args),
  },
}));

describe('FileUploadButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    memoryIngestFileMock.mockResolvedValue({ success: true });
    awardExperienceMock.mockResolvedValue(undefined);
    knowledgeVaultIngestMock.mockResolvedValue({ id: 'kb-doc-1' });
  });

  it('persists imported text documents into the knowledge vault with their full content', async () => {
    const onFilesSelected = vi.fn();
    const { FileUploadButton } = await import('../FileUploadButton');
    const { container } = render(<FileUploadButton onFilesSelected={onFilesSelected} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['Ligne 1\nLigne 2 importantes'], 'notes.md', {
      type: 'text/markdown',
    });

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(memoryIngestFileMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(knowledgeVaultIngestMock).toHaveBeenCalledWith(
        'notes.md',
        'Ligne 1\nLigne 2 importantes',
        expect.objectContaining({
          createdAt: expect.any(Number),
          modifiedAt: expect.any(Number),
        })
      );
    });

    await waitFor(() => {
      expect(onFilesSelected).toHaveBeenCalled();
    });

    const analyzedFiles = onFilesSelected.mock.calls[0][0];
    expect(analyzedFiles[0]?.content).toBe('Ligne 1\nLigne 2 importantes');
  });
});
