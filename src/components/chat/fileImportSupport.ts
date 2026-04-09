import { tauriClient } from '@/lib/tauriClient';

interface ParsedDocumentPayload {
  content?: string;
}

export const CHAT_FILE_IMPORT_EXTENSIONS = [
  '.txt',
  '.md',
  '.json',
  '.yaml',
  '.yml',
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.py',
  '.rs',
  '.cpp',
  '.java',
  '.go',
  '.xml',
  '.csv',
  '.log',
  '.pdf',
  '.doc',
  '.docx',
] as const;

const SUPPORTED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'text/javascript',
  'application/javascript',
  'text/typescript',
  'application/typescript',
  'text/x-typescript',
  'text/jsx',
  'text/tsx',
  'text/x-python',
  'application/xml',
  'text/xml',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const STRUCTURED_DOCUMENT_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);

export const CHAT_FILE_IMPORT_ACCEPT = CHAT_FILE_IMPORT_EXTENSIONS.join(',');
export const CHAT_FILE_IMPORT_HINT =
  '.txt, .md, .json, .yaml/.yml, .js/.ts/.tsx/.jsx, .py/.rs/.xml/.csv, .log, .pdf, .doc/.docx';

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex >= 0 ? filename.slice(dotIndex).toLowerCase() : '';
}

function normalizeImportedText(content: string): string {
  return content.split('\u0000').join('').replace(/\r\n/g, '\n').trim();
}

function looksBinaryLike(content: string): boolean {
  if (!content) {
    return false;
  }

  let suspiciousChars = 0;

  for (const char of content) {
    const code = char.charCodeAt(0);
    const isControlCharacter =
      code < 32 && char !== '\n' && char !== '\r' && char !== '\t';

    if (isControlCharacter || code === 65533) {
      suspiciousChars += 1;
    }
  }

  return suspiciousChars / content.length > 0.1;
}

function buildStructuredFallbackContent(file: File): string {
  const extension = getFileExtension(file.name);
  const typeLabel = extension ? extension.slice(1).toUpperCase() : 'DOCUMENT';
  const sizeLabel = `${(file.size / 1024).toFixed(1)} KB`;

  return [
    `Document importé: ${file.name}`,
    `Type: ${typeLabel}`,
    `Taille: ${sizeLabel}`,
    'Note: le texte complet n’a pas pu être extrait automatiquement dans ce runtime.',
    'Le document et ses métadonnées restent néanmoins enregistrés dans la mémoire TITANE pour suivi et réouverture.',
  ].join('\n');
}

export function isSupportedChatImportFile(file: File): boolean {
  const mimeType = file.type?.toLowerCase();

  if (mimeType && SUPPORTED_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return CHAT_FILE_IMPORT_EXTENSIONS.includes(
    getFileExtension(file.name) as (typeof CHAT_FILE_IMPORT_EXTENSIONS)[number]
  );
}

export async function resolveImportedFileContent(file: File): Promise<string> {
  const sourcePath = (file as File & { path?: string }).path ?? null;

  if (sourcePath) {
    try {
      const parsed = (await tauriClient.parseDocument({
        filePath: sourcePath,
      })) as ParsedDocumentPayload | null;

      const parsedContent = normalizeImportedText(parsed?.content ?? '');
      if (parsedContent && !looksBinaryLike(parsedContent)) {
        return parsedContent;
      }
    } catch {
      // fallback browser-side below
    }
  }

  const browserContent = normalizeImportedText(await file.text());
  if (browserContent && !looksBinaryLike(browserContent)) {
    return browserContent;
  }

  if (STRUCTURED_DOCUMENT_EXTENSIONS.has(getFileExtension(file.name))) {
    return buildStructuredFallbackContent(file);
  }

  return browserContent;
}
