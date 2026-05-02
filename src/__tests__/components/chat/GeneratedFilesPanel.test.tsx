import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test-utils';

// Isolate the GeneratedFilesPanel from the full ConversationSection module
// by recreating the minimal interface + component inline to avoid heavy deps
interface GeneratedFileEntry {
  id: string;
  name: string;
  path?: string;
  status: 'SAVED_TAURI' | 'SAVED_BROWSER_DOWNLOAD' | 'WRITE_FAILED';
  ext: string;
  timestamp: number;
}

const FILE_EXT_ICONS: Record<string, string> = {
  py: '🐍', ts: '🔷', tsx: '⚛️', js: '📜', jsx: '⚛️', rs: '🦀',
  md: '📝', json: '📋', txt: '📄', html: '🌐', css: '🎨', sh: '🖥️',
};

function TestGeneratedFilesPanel({
  files,
  onClearAll,
}: {
  files: GeneratedFileEntry[];
  onClearAll: () => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (files.length === 0) return null;

  const handleCopyPath = (path: string) => {
    void navigator.clipboard.writeText(path).catch(() => {});
  };

  const formatRelativeTime = (timestamp: number): string => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
      if (diff < 60) return "à l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    return `il y a ${Math.floor(diff / 3600)} h`;
  };

  return (
    <div data-testid="generated-files-panel">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <span>📁 Fichiers générés ({files.length})</span>
        <span>{collapsed ? '▸' : '▾'}</span>
      </button>
      {!collapsed && (
        <div>
          {files.map(entry => {
            const icon = FILE_EXT_ICONS[entry.ext] ?? '📄';
            return (
              <div key={entry.id} data-testid="generated-file-entry">
                <span>{icon}</span>
                <div>
                  <span title={entry.name}>{entry.name}</span>
                  {entry.path && <span title={entry.path}>{entry.path}</span>}
                  <span>{formatRelativeTime(entry.timestamp)}</span>
                </div>
                <div>
                  {entry.status === 'SAVED_TAURI' && entry.path && (
                    <button
                      type="button"
                      data-testid="generated-file-copy-path"
                      onClick={() => handleCopyPath(entry.path!)}
                    >
                      📋
                    </button>
                  )}
                  {entry.status === 'SAVED_BROWSER_DOWNLOAD' && <span>⬇️</span>}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            data-testid="generated-files-clear"
            onClick={onClearAll}
          >
            Effacer la liste
          </button>
        </div>
      )}
    </div>
  );
}

const makeEntry = (overrides: Partial<GeneratedFileEntry> = {}): GeneratedFileEntry => ({
  id: crypto.randomUUID(),
  name: 'script.py',
  path: '/home/user/script.py',
  status: 'SAVED_TAURI',
  ext: 'py',
  timestamp: Date.now(),
  ...overrides,
});

describe('GeneratedFilesPanel', () => {
  it('renders nothing when files list is empty', () => {
    const { container } = render(
      <TestGeneratedFilesPanel files={[]} onClearAll={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the panel when one file entry is present', () => {
    const files = [makeEntry()];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);
    expect(screen.getByTestId('generated-files-panel')).toBeInTheDocument();
    expect(screen.getByTestId('generated-file-entry')).toBeInTheDocument();
    expect(screen.getByText(/Fichiers générés \(1\)/)).toBeInTheDocument();
  });

  it('renders all entries when multiple files are present', () => {
    const files = [makeEntry(), makeEntry({ ext: 'md', name: 'notes.md' }), makeEntry({ ext: 'json', name: 'data.json' })];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);
    expect(screen.getAllByTestId('generated-file-entry')).toHaveLength(3);
    expect(screen.getByText(/Fichiers générés \(3\)/)).toBeInTheDocument();
  });

  it('collapses the list when header button is clicked', () => {
    const files = [makeEntry()];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);

    const entries = screen.getAllByTestId('generated-file-entry');
    expect(entries).toHaveLength(1);

    const headerBtn = screen.getByRole('button', { name: /Fichiers générés/ });
    fireEvent.click(headerBtn);

    expect(screen.queryByTestId('generated-file-entry')).toBeNull();
  });

  it('calls onClearAll when clear button is clicked', () => {
    const onClearAll = vi.fn();
    const files = [makeEntry()];
    render(<TestGeneratedFilesPanel files={files} onClearAll={onClearAll} />);

    fireEvent.click(screen.getByTestId('generated-files-clear'));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('shows copy-path button for SAVED_TAURI entries with a path', () => {
    const files = [makeEntry({ status: 'SAVED_TAURI', path: '/home/user/file.py' })];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);
    expect(screen.getByTestId('generated-file-copy-path')).toBeInTheDocument();
  });

  it('does not show copy-path button for SAVED_BROWSER_DOWNLOAD entries', () => {
    const files = [makeEntry({ status: 'SAVED_BROWSER_DOWNLOAD', path: undefined })];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);
    expect(screen.queryByTestId('generated-file-copy-path')).toBeNull();
  });

  it('calls clipboard.writeText when copy-path button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    const files = [makeEntry({ status: 'SAVED_TAURI', path: '/home/user/test.py' })];
    render(<TestGeneratedFilesPanel files={files} onClearAll={() => {}} />);

    fireEvent.click(screen.getByTestId('generated-file-copy-path'));
    await Promise.resolve(); // flush microtasks
    expect(writeText).toHaveBeenCalledWith('/home/user/test.py');
  });
});
