export interface ImportedFilePromptData {
  name: string;
  size?: number;
  content?: string | null;
  preview?: string;
  analysis?: {
    summary?: string | null;
  };
}

const MAX_PROMPT_CHARS_PER_FILE = 6000;
const MAX_PROMPT_CHARS_TOTAL = 16000;

function formatFileSize(size?: number): string | null {
  if (typeof size !== 'number' || Number.isNaN(size) || size < 0) {
    return null;
  }

  return `${(size / 1024).toFixed(1)} KB`;
}

function buildContentExcerpt(
  file: ImportedFilePromptData,
  remainingBudget: number
): { excerpt: string; truncated: boolean } {
  const rawContent =
    (typeof file.content === 'string' && file.content.trim().length > 0
      ? file.content
      : file.preview || '')?.trim() || '';

  if (!rawContent) {
    return { excerpt: '', truncated: false };
  }

  const budget = Math.max(500, Math.min(MAX_PROMPT_CHARS_PER_FILE, remainingBudget));
  const excerpt = rawContent.slice(0, budget);

  return {
    excerpt,
    truncated: rawContent.length > excerpt.length,
  };
}

export function buildImportedFilesPrompt(files: ImportedFilePromptData[]): string {
  let remainingBudget = MAX_PROMPT_CHARS_TOTAL;

  const blocks = files.map(file => {
    const lines = [`📄 **${file.name}**`];
    const formattedSize = formatFileSize(file.size);

    if (formattedSize) {
      lines.push(`- Taille: ${formattedSize}`);
    }

    if (file.analysis?.summary) {
      lines.push(`- Résumé technique: ${file.analysis.summary}`);
    }

    const { excerpt, truncated } = buildContentExcerpt(file, remainingBudget);
    remainingBudget = Math.max(0, remainingBudget - excerpt.length);

    if (excerpt) {
      lines.push('- Contenu à analyser:');
      lines.push('```text');
      lines.push(truncated ? `${excerpt}\n[…suite tronquée dans le prompt…]` : excerpt);
      lines.push('```');
    }

    if (truncated) {
      lines.push(
        '- Note: le contenu complet reste conservé en mémoire même si seul un extrait est injecté ici.'
      );
    }

    return lines.join('\n');
  });

  return [
    '📎 Fichiers importés pour analyse.',
    'Le contenu utile a été enregistré dans la mémoire TITANE pour rappel futur.',
    '',
    blocks.join('\n\n'),
    '',
    'Analyse ces fichiers de façon précise, en t’appuyant sur leur contenu réel.',
  ]
    .filter(Boolean)
    .join('\n');
}
