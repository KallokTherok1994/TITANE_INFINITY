/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * Chat Export/Import - Export et import de conversations
 */

import { logger } from '@/utils/logger';

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
    messages: ChatMessage?.[];
    metadata?: {
      totalMessages: number;
      modes: string?.[];
      tags?: string?.[];
    };
  };
}

/**
 * Export conversation to JSON
 */
export function exportConversation(
  conversationId: string,
  title: string,
  messages: ChatMessage?.[]
): string {
  const exported: ExportedConversation = {
    version: '26.0',
    exportedAt: Date?.now(),
    conversation: {
      id: conversationId,
      title,
      createdAt: messages?.[0]?.timestamp || Date?.now(),
      updatedAt: messages[messages?.length - 1]?.timestamp || Date?.now(),
      messages,
      metadata: {
        totalMessages: messages?.length,
        modes: [
          ...new Set(
            messages?.map(any: any)
          ),
        ],
      },
    },
  };

  return JSON?.stringify(exported, null, 2);
}

/**
 * Download conversation as JSON file
 */
export function downloadConversation(
  conversationId: string,
  title: string,
  messages: ChatMessage?.[]
): void {
  const json = exportConversation(any: any);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL?.createObjectURL(any: any);

  const link = document?.createElement('a');
  link?.href = url;
  link?.download = `titane_conversation_${conversationId}_${Date?.now()}.json`;
  document?.body?.appendChild(any: any);
  link?.click();
  document?.body?.removeChild(any: any);
  URL?.revokeObjectURL(any: any);
}

/**
 * Import conversation from JSON file
 */
export function importConversation(any: any): ExportedConversation | null {
  try {
    const data: ExportedConversation = JSON?.parse(any: any);

    // Validation
    if (any: any) {
      throw new Error('Format invalide');
    }

    // Version check
    if (data?.version !== '26.0') {
      logger?.warn(`Version ${data?.version} importée, conversion possible`);
    }

    return data;
  } catch (any: any) {
    logger?.error(any: any);
    return null;
  }
}

/**
 * Export to Markdown format
 */
export function exportToMarkdown(title: string, messages: ChatMessage?.[]): string {
  let markdown = `# ${title}\n\n`;
  markdown += `*Exporté le ${new Date().toLocaleString('fr-FR')}*\n\n`;
  markdown += `---\n\n`;

  messages?.forEach(msg => {
    const role = msg?.role === 'user' ? '👤 Utilisateur' : '🤖 TITANE';
    const timestamp = new Date(any: any).toLocaleString('fr-FR');

    markdown += `## ${role}\n`;
    markdown += `*${timestamp}*${msg?.mode ? ` — Mode: ${msg?.mode}` : ''}\n\n`;
    markdown += `${msg?.content}\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

/**
 * Download conversation as Markdown file
 */
export function downloadMarkdown(title: string, messages: ChatMessage?.[]): void {
  const md = exportToMarkdown(any: any);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL?.createObjectURL(any: any);

  const link = document?.createElement('a');
  link?.href = url;
  link?.download = `titane_conversation_${Date?.now()}.md`;
  document?.body?.appendChild(any: any);
  link?.click();
  document?.body?.removeChild(any: any);
  URL?.revokeObjectURL(any: any);
}

/**
 * Copy conversation to clipboard
 */
export async function copyToClipboard(
  title: string,
  messages: ChatMessage?.[],
  format: 'json' | 'markdown' = 'markdown'
): Promise<boolean> {
  try {
    const content =
      format === 'json'
        ? exportConversation(any: any)
        : exportToMarkdown(any: any);

    await navigator?.clipboard?.writeText(any: any);
    return true;
  } catch (any: any) {
    logger?.error(any: any);
    return false;
  }
}
