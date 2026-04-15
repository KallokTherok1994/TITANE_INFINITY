import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import KnowledgeFusionPage from '@/ui/pages/KnowledgeFusionPage';

const { detectFileFormat, parseDocument } = vi.hoisted(() => ({
  detectFileFormat: vi.fn(),
  parseDocument: vi.fn(),
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    detectFileFormat,
    parseDocument,
  },
}));

describe('Knowledge fusion truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detectFileFormat.mockResolvedValue('markdown');
    parseDocument.mockResolvedValue(null);
  });

  it('labels manual path entry honestly and keeps the current detect-format flow working', async () => {
    const user = userEvent.setup();
    const promptMock = vi.fn().mockReturnValue('/tmp/guide.md');
    vi.stubGlobal('prompt', promptMock);

    render(<KnowledgeFusionPage />);

    expect(
      screen.getByRole('button', { name: /Entrer un chemin de document/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PARTIAL: saisie manuelle du chemin uniquement/i)
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Entrer un chemin de document/i })
    );

    await waitFor(() => {
      expect(detectFileFormat).toHaveBeenCalledWith({
        file_path: '/tmp/guide.md',
      });
    });

    expect(promptMock).toHaveBeenCalledWith('Entrez un chemin de document :');
    expect(screen.getByText('Chemin saisi')).toBeInTheDocument();
    expect(screen.getByText('/tmp/guide.md')).toBeInTheDocument();
    expect(screen.getByText('MARKDOWN')).toBeInTheDocument();
    expect(screen.queryByTestId('knowledge-null-result-warning')).not.toBeInTheDocument();
  });

  it('only shows the null-result warning after a real parse attempt returns null', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('prompt', vi.fn().mockReturnValue('/tmp/guide.md'));

    render(<KnowledgeFusionPage />);

    await user.click(
      screen.getByRole('button', { name: /Entrer un chemin de document/i })
    );

    expect(screen.queryByTestId('knowledge-null-result-warning')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /Analyser & Classifier|Traitement/i })
    );

    await waitFor(() => {
      expect(parseDocument).toHaveBeenCalledWith({
        file_path: '/tmp/guide.md',
      });
    });

    expect(screen.getByTestId('knowledge-null-result-warning')).toBeInTheDocument();
  });
});
