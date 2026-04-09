import { beforeEach, describe, expect, it, vi } from 'vitest';

const parseDocumentMock = vi.fn();

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    parseDocument: (...args: unknown[]) => parseDocumentMock(...args),
  },
}));

import {
  CHAT_FILE_IMPORT_ACCEPT,
  isSupportedChatImportFile,
  resolveImportedFileContent,
} from '../fileImportSupport';

describe('fileImportSupport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts structured document extensions even when the MIME type is empty', () => {
    const docxFile = new File([''], 'memoire.docx', { type: '' });
    const exeFile = new File([''], 'malware.exe', {
      type: 'application/octet-stream',
    });

    expect(CHAT_FILE_IMPORT_ACCEPT).toContain('.docx');
    expect(isSupportedChatImportFile(docxFile)).toBe(true);
    expect(isSupportedChatImportFile(exeFile)).toBe(false);
  });

  it('prefers normalized Tauri parsed content when it is available', async () => {
    parseDocumentMock.mockResolvedValue({
      content: 'Bonjour\u0000\r\nTITANE',
    });

    const file = new File(['ignored'], 'notes.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(file, 'path', {
      value: '/tmp/notes.pdf',
      configurable: true,
    });

    await expect(resolveImportedFileContent(file)).resolves.toBe('Bonjour\nTITANE');
    expect(parseDocumentMock).toHaveBeenCalledWith({ filePath: '/tmp/notes.pdf' });
  });

  it('falls back to browser text when backend parsing is unavailable', async () => {
    parseDocumentMock.mockRejectedValue(new Error('backend offline'));

    const file = new File(['Contenu local\r\nfiable'], 'notes.md', {
      type: 'text/markdown',
    });
    Object.defineProperty(file, 'path', {
      value: '/tmp/notes.md',
      configurable: true,
    });

    await expect(resolveImportedFileContent(file)).resolves.toBe('Contenu local\nfiable');
  });

  it('returns a safe structured fallback when a PDF stays binary-like', async () => {
    parseDocumentMock.mockResolvedValue({
      content: '\u0000\u0001\u0002\u0003',
    });

    const file = new File(['\u0000\u0001\u0002\u0003'], 'scan.pdf', {
      type: 'application/pdf',
    });
    Object.defineProperty(file, 'path', {
      value: '/tmp/scan.pdf',
      configurable: true,
    });

    const content = await resolveImportedFileContent(file);

    expect(content).toContain('Document importé: scan.pdf');
    expect(content).toContain('Type: PDF');
    expect(content).toContain('mémoire TITANE');
  });
});
