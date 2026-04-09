import { describe, expect, it } from 'vitest';

import { buildImportedFilesPrompt } from '../fileImportPrompt';

describe('buildImportedFilesPrompt', () => {
  it('includes actual document content and confirms memory persistence', () => {
    const prompt = buildImportedFilesPrompt([
      {
        name: 'notes.md',
        size: 1024,
        preview: '# Plan\nImportant details',
        content: '# Plan\nImportant details',
        analysis: {
          summary: 'Markdown • 2 lignes • 3 mots',
        },
      },
    ]);

    expect(prompt).toContain('enregistré dans la mémoire');
    expect(prompt).toContain('notes.md');
    expect(prompt).toContain('Markdown • 2 lignes • 3 mots');
    expect(prompt).toContain('# Plan');
    expect(prompt).toContain('Important details');
  });

  it('truncates oversized prompt excerpts while keeping the full document in memory', () => {
    const prompt = buildImportedFilesPrompt([
      {
        name: 'large.txt',
        size: 20_000,
        preview: 'Aperçu',
        content: 'A'.repeat(20_000),
        analysis: {
          summary: 'Texte volumineux',
        },
      },
    ]);

    expect(prompt).toContain('contenu complet reste conservé en mémoire');
    expect(prompt.length).toBeLessThan(18_000);
  });
});
