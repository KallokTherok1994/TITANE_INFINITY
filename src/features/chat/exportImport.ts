/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * Chat Export/Import - Export et import de conversations
 */

import { isTauriAvailable } from '@/api/tauriClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mode?: string;
}

interface ExportedConversation {
  version: string;
  exportedAt: number;
  conversation: {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    messages: ChatMessage[];
    metadata?: {
      totalMessages: number;
      modes: string[];
      tags?: string[];
    };
  };
}

export type ExportSaveStatus =
  | 'SAVED_TAURI'
  | 'SAVED_BROWSER_DOWNLOAD'
  | 'SAVE_CANCELLED_HONEST'
  | 'SAVE_DIALOG_BLOCKED'
  | 'WRITE_FAILED';

export interface ExportSaveResult {
  ok: boolean;
  status: ExportSaveStatus;
  path?: string;
  error?: string;
}

interface SaveOptions {
  defaultName: string;
  extension: string;
  mime: string;
}

async function saveTextExport(
  content: string,
  options: SaveOptions
): Promise<ExportSaveResult> {
  if (isTauriAvailable()) {
    try {
      const [{ save }, { writeTextFile }] = await Promise.all([
        import('@tauri-apps/plugin-dialog'),
        import('@tauri-apps/plugin-fs'),
      ]);

      const selectedPath = await save({
        defaultPath: options.defaultName,
        filters: [
          { name: options.extension.toUpperCase(), extensions: [options.extension] },
          { name: 'Tous les fichiers', extensions: ['*'] },
        ],
      });

      if (!selectedPath) {
        return {
          ok: false,
          status: 'SAVE_CANCELLED_HONEST',
        };
      }

      await writeTextFile(selectedPath, content);
      return {
        ok: true,
        status: 'SAVED_TAURI',
        path: selectedPath,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[exportImport] Tauri save failed, fallback to browser download:', message);
      // Fall through to browser download fallback below
    }
  }

  try {
    const blob = new Blob([content], { type: options.mime });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = options.defaultName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      ok: true,
      status: 'SAVED_BROWSER_DOWNLOAD',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: 'SAVE_DIALOG_BLOCKED',
      error: message,
    };
  }
}

const FILE_MIME_MAP: Record<string, string> = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  log: 'text/plain',
  json: 'application/json',
  csv: 'text/csv',
  html: 'text/html',
  htm: 'text/html',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  xml: 'application/xml',
  ts: 'text/plain',
  tsx: 'text/plain',
  js: 'text/javascript',
  jsx: 'text/javascript',
  py: 'text/x-python',
  rs: 'text/plain',
  go: 'text/plain',
  java: 'text/plain',
  cpp: 'text/plain',
  c: 'text/plain',
  rb: 'text/plain',
  toml: 'text/plain',
  ini: 'text/plain',
  env: 'text/plain',
  sh: 'text/x-sh',
  sql: 'application/sql',
  css: 'text/css',
  scss: 'text/plain',
  graphql: 'text/plain',
  proto: 'text/plain',
};

/**
 * Sauvegarde n'importe quel contenu texte sous n'importe quelle extension.
 * Utilise Tauri save-dialog si disponible, sinon téléchargement navigateur.
 */
export async function generateAndSaveFile(
  content: string,
  ext: string,
  defaultName: string
): Promise<ExportSaveResult> {
  const cleanExt = ext.replace(/^\./, '').toLowerCase();
  const mime = FILE_MIME_MAP[cleanExt] ?? 'text/plain';
  const filename = defaultName.endsWith(`.${cleanExt}`)
    ? defaultName
    : `${defaultName}.${cleanExt}`;

  return saveTextExport(content, {
    defaultName: filename,
    extension: cleanExt,
    mime,
  });
}

/**
 * Export conversation to JSON
 */
export function exportConversation(
  conversationId: string,
  title: string,
  messages: ChatMessage[]
): string {
  const exported: ExportedConversation = {
    version: '26.0',
    exportedAt: Date.now(),
    conversation: {
      id: conversationId,
      title,
      createdAt: messages[0]?.timestamp || Date.now(),
      updatedAt: messages[messages.length - 1]?.timestamp || Date.now(),
      messages,
      metadata: {
        totalMessages: messages.length,
        modes: [
          ...new Set(
            messages.map(m => m.mode).filter((mode): mode is string => mode !== undefined)
          ),
        ],
      },
    },
  };

  return JSON.stringify(exported, null, 2);
}

/**
 * Download conversation as JSON file
 */
export function downloadConversation(
  conversationId: string,
  title: string,
  messages: ChatMessage[]
): Promise<ExportSaveResult> {
  const json = exportConversation(conversationId, title, messages);
  return saveTextExport(json, {
    defaultName: `titane_conversation_${conversationId}_${Date.now()}.json`,
    extension: 'json',
    mime: 'application/json',
  });
}

/**
 * Import conversation from JSON file
 */
export function importConversation(fileContent: string): ExportedConversation | null {
  try {
    const data: ExportedConversation = JSON.parse(fileContent);

    // Validation
    if (!data.version || !data.conversation || !data.conversation.messages) {
      throw new Error('Format invalide');
    }

    // Version check
    if (data.version !== '26.0') {
      console.warn(`Version ${data.version} importée, conversion possible`);
    }

    return data;
  } catch (error) {
    console.error('Erreur import conversation:', error);
    return null;
  }
}

/**
 * Export to Markdown format
 */
export function exportToMarkdown(title: string, messages: ChatMessage[]): string {
  let markdown = `# ${title}\n\n`;
  markdown += `*Exporté le ${new Date().toLocaleString('fr-FR')}*\n\n`;
  markdown += `---\n\n`;

  messages.forEach(msg => {
    const role = msg.role === 'user' ? '👤 Utilisateur' : '🤖 TITANE';
    const timestamp = new Date(msg.timestamp).toLocaleString('fr-FR');

    markdown += `## ${role}\n`;
    markdown += `*${timestamp}*${msg.mode ? ` — Mode: ${msg.mode}` : ''}\n\n`;
    markdown += `${msg.content}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Download conversation as Markdown file
 */
export function downloadMarkdown(
  title: string,
  messages: ChatMessage[]
): Promise<ExportSaveResult> {
  const md = exportToMarkdown(title, messages);
  return saveTextExport(md, {
    defaultName: `titane_conversation_${Date.now()}.md`,
    extension: 'md',
    mime: 'text/markdown',
  });
}

/**
 * Copy conversation to clipboard
 */
export async function copyToClipboard(
  title: string,
  messages: ChatMessage[],
  format: 'json' | 'markdown' = 'markdown'
): Promise<boolean> {
  try {
    const content =
      format === 'json'
        ? exportConversation('temp', title, messages)
        : exportToMarkdown(title, messages);

    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Erreur copie presse-papier:', error);
    return false;
  }
}
