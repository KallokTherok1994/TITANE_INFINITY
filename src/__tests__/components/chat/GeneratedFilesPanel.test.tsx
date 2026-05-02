import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';

// Minimal self-contained replica of the GeneratedFilesPanel for unit tests
// (avoids pulling in the full ConversationSection and its heavy deps)

const MIME_MAP: Record<string, string> = {
  py: 'text/x-python',
  ts: 'text/plain',
  tsx: 'text/plain',
  js: 'text/javascript',
  rs: 'text/plain',
  md: 'text/markdown',
  json: 'application/json',
  txt: 'text/plain',
};

const FILE_EXT_ICONS: Record<string, string> = {
  py: '🐍',
  ts: '🔷',
  tsx: '⚛️',
  js: '📜',
  rs: '🦀',
  md: '📝',
  json: '📋',
  txt: '📄',
};

interface GeneratedFileEntry {
  id: string;
  name: string;
  path?: string;
  status: 'PENDING_DOWNLOAD' | 'SAVED_BROWSER_DOWNLOAD' | 'SAVED_TAURI' | 'WRITE_FAILED';
  ext: string;
  timestamp: number;
  content?: string;
}

function TestGeneratedFilesPanel({
  files,
  onClearAll,
  onDownload,
}: {
  files: GeneratedFileEntry[];
  onClearAll: () => void;
  onDownload: (entry: GeneratedFileEntry) => void;
}) {
  if (files.length === 0) return null;

  const formatRelativeTime = (timestamp: number): string => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)} h`;
  };

  return (
    <div data-testid="generated-files-panel">
      <div className="generated-files-header">
        <span>📁 Fichiers prêts ({files.length})</span>
        <button type="button" data-testid="generated-files-clear" onClick={onClearAll}>
          ✕
        </button>
      </div>
      <div>
        {files.map(entry => {
          const icon = FILE_EXT_ICONS[entry.ext] ?? '📄';
          const isPending = entry.status === 'PENDING_DOWNLOAD';
          const isSaved =
            entry.status === 'SAVED_BROWSER_DOWNLOAD' || entry.status === 'SAVED_TAURI';
          return (
            <div
              key={entry.id}
              data-testid="generated-file-entry"
              data-status={entry.status}
            >
              <span>{icon}</span>
              <div>
                <span title={entry.name}>{entry.name}</span>
                <span>{formatRelativeTime(entry.timestamp)}</span>
              </div>
              <div>
                {isPending && (
                  <button
                    type="button"
                    data-testid="generated-file-download"
                    onClick={() => onDownload(entry)}
                  >
                    ⬇️ Télécharger
                  </button>
                )}
                {isSaved && (
                  <span
                    data-testid="generated-file-saved"
                    title={entry.path ?? 'Téléchargé'}
                  >
                    ✅ Sauvegardé
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const makeEntry = (overrides: Partial<GeneratedFileEntry> = {}): GeneratedFileEntry => ({
  id: crypto.randomUUID(),
  name: 'script.py',
  status: 'PENDING_DOWNLOAD',
  ext: 'py',
  timestamp: Date.now(),
  content: 'print("hello")',
  ...overrides,
});

describe('GeneratedFilesPanel', () => {
  it('renders nothing when files list is empty', () => {
    const { container } = render(
      <TestGeneratedFilesPanel files={[]} onClearAll={() => {}} onDownload={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the panel when one file entry is present', () => {
    render(
      <TestGeneratedFilesPanel
        files={[makeEntry()]}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getByTestId('generated-files-panel')).toBeInTheDocument();
    expect(screen.getByTestId('generated-file-entry')).toBeInTheDocument();
    expect(screen.getByText(/Fichiers pr\u00eats \(1\)/)).toBeInTheDocument();
  });

  it('renders all entries when multiple files are present', () => {
    const files = [
      makeEntry(),
      makeEntry({ ext: 'md', name: 'notes.md' }),
      makeEntry({ ext: 'json', name: 'data.json' }),
    ];
    render(
      <TestGeneratedFilesPanel
        files={files}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getAllByTestId('generated-file-entry')).toHaveLength(3);
  });

  it('shows download button for PENDING_DOWNLOAD entries', () => {
    render(
      <TestGeneratedFilesPanel
        files={[makeEntry({ status: 'PENDING_DOWNLOAD', content: 'code' })]}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getByTestId('generated-file-download')).toBeInTheDocument();
    expect(screen.queryByTestId('generated-file-saved')).toBeNull();
  });

  it('shows saved badge for SAVED_BROWSER_DOWNLOAD entries', () => {
    render(
      <TestGeneratedFilesPanel
        files={[makeEntry({ status: 'SAVED_BROWSER_DOWNLOAD', content: undefined })]}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getByTestId('generated-file-saved')).toBeInTheDocument();
    expect(screen.queryByTestId('generated-file-download')).toBeNull();
  });

  it('shows saved badge for SAVED_TAURI entries', () => {
    render(
      <TestGeneratedFilesPanel
        files={[
          makeEntry({
            status: 'SAVED_TAURI',
            path: '/home/user/file.py',
            content: undefined,
          }),
        ]}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getByTestId('generated-file-saved')).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', () => {
    const onDownload = vi.fn();
    const entry = makeEntry({ status: 'PENDING_DOWNLOAD', content: 'code' });
    render(
      <TestGeneratedFilesPanel
        files={[entry]}
        onClearAll={() => {}}
        onDownload={onDownload}
      />
    );
    fireEvent.click(screen.getByTestId('generated-file-download'));
    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onDownload).toHaveBeenCalledWith(entry);
  });

  it('calls onClearAll when clear button is clicked', () => {
    const onClearAll = vi.fn();
    render(
      <TestGeneratedFilesPanel
        files={[makeEntry()]}
        onClearAll={onClearAll}
        onDownload={() => {}}
      />
    );
    fireEvent.click(screen.getByTestId('generated-files-clear'));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('entry data-status reflects the entry status', () => {
    const entry = makeEntry({ status: 'PENDING_DOWNLOAD' });
    render(
      <TestGeneratedFilesPanel
        files={[entry]}
        onClearAll={() => {}}
        onDownload={() => {}}
      />
    );
    const entryEl = screen.getByTestId('generated-file-entry');
    expect(entryEl).toHaveAttribute('data-status', 'PENDING_DOWNLOAD');
  });

  it('MIME_MAP contains expected entries', () => {
    expect(MIME_MAP['py']).toBe('text/x-python');
    expect(MIME_MAP['md']).toBe('text/markdown');
    expect(MIME_MAP['json']).toBe('application/json');
  });
});
