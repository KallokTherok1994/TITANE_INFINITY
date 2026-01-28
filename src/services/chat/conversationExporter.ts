/**
 * TITANE∞ — Conversation Export/Import Service
 * Permet l'export et import de conversations en JSON ou Markdown
 *
 * v26.4.0 (Sprint 6)
 */

import { AIMessage } from '../ai/types';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ConversationExportOptions {
  format: 'json' | 'markdown';
  mode?: string;
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
}

export interface ConversationMetadata {
  exportedAt: string;
  mode: string;
  messageCount: number;
  duration?: number;
}

export interface ConversationExportData {
  metadata: ConversationMetadata;
  messages: AIMessage[];
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT SERVICE
// ═══════════════════════════════════════════════════════════════════

class ConversationExporter {
  /**
   * Exporte une conversation
   */
  static export(
    messages: AIMessage[],
    options: ConversationExportOptions = { format: 'json' }
  ): string {
    if (options.format === 'markdown') {
      return this.exportAsMarkdown(messages, options);
    } else {
      return this.exportAsJSON(messages, options);
    }
  }

  /**
   * Exporte en JSON
   */
  private static exportAsJSON(
    messages: AIMessage[],
    options: ConversationExportOptions
  ): string {
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const duration = lastMessage && firstMessage
      ? lastMessage.timestamp - firstMessage.timestamp
      : 0;

    const data: ConversationExportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        mode: options.mode || 'default',
        messageCount: messages.length,
        ...(options.includeMetadata && { duration }),
      },
      messages: options.includeMetadata ? messages : messages.map(msg => ({
        ...msg,
        ...(options.includeTimestamps ? { timestamp: msg.timestamp } : { timestamp: undefined }),
      })),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Exporte en Markdown
   */
  private static exportAsMarkdown(
    messages: AIMessage[],
    options: ConversationExportOptions
  ): string {
    let md = '';

    // Entête
    const now = new Date().toLocaleString('fr-FR');
    md += `# Conversation TITANE∞\n\n`;
    md += `**Exportée:** ${now}\n`;
    md += `**Mode:** ${options.mode || 'Défaut'}\n`;
    md += `**Messages:** ${messages.length}\n\n`;
    md += `---\n\n`;

    // Messages
    messages.forEach((msg, idx) => {
      const time = options.includeTimestamps
        ? ` (${new Date(msg.timestamp).toLocaleTimeString('fr-FR')})`
        : '';

      const role = msg.role === 'user' ? 'Vous' : 'TITANE∞';
      md += `## Message ${idx + 1} — ${role}${time}\n\n`;
      md += `${msg.content}\n\n`;
      md += `---\n\n`;
    });

    return md;
  }

  /**
   * Télécharge la conversation
   */
  static download(
    messages: AIMessage[],
    options: ConversationExportOptions = { format: 'json' }
  ): void {
    const content = this.export(messages, options);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `conversation_${timestamp}.${options.format === 'markdown' ? 'md' : 'json'}`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * Importe une conversation depuis un fichier JSON
   */
  static async importJSON(file: File): Promise<AIMessage[]> {
    const text = await file.text();
    const data = JSON.parse(text) as ConversationExportData;

    if (!Array.isArray(data.messages)) {
      throw new Error('Format de fichier invalide: messages doit être un array');
    }

    return data.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || Date.now(),
    }));
  }

  /**
   * Importe une conversation depuis un fichier Markdown
   * Parsing basique: détecte les sections "## Message N — Role"
   */
  static async importMarkdown(file: File): Promise<AIMessage[]> {
    const text = await file.text();
    const messages: AIMessage[] = [];

    // Regex pour parser les messages: ## Message N — Role
    const messagePattern = /## Message \d+ — (Vous|TITANE∞)(?: \([^)]+\))?\n\n([\s\S]*?)(?=---|\Z)/g;

    let match;
    while ((match = messagePattern.exec(text)) !== null) {
      const role = match[1] === 'Vous' ? 'user' : 'assistant';
      const content = match[2].trim();

      if (content) {
        messages.push({
          id: `import_${Date.now()}_${Math.random()}`,
          role,
          content,
          timestamp: Date.now(),
        });
      }
    }

    if (messages.length === 0) {
      throw new Error('Aucun message trouvé dans le fichier Markdown');
    }

    return messages;
  }

  /**
   * Importe une conversation depuis un fichier
   */
  static async import(file: File): Promise<AIMessage[]> {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      return this.importJSON(file);
    } else if (file.type === 'text/markdown' || file.name.endsWith('.md')) {
      return this.importMarkdown(file);
    } else {
      throw new Error('Format de fichier non supporté. Utilisez JSON ou Markdown.');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════

/**
 * Hook pour exporter/importer une conversation
 */
export function useConversationExporter() {
  const exportConversation = (
    messages: AIMessage[],
    options?: ConversationExportOptions
  ) => {
    return ConversationExporter.export(messages, options);
  };

  const downloadConversation = (
    messages: AIMessage[],
    options?: ConversationExportOptions
  ) => {
    ConversationExporter.download(messages, options);
  };

  const importConversation = async (file: File): Promise<AIMessage[]> => {
    return ConversationExporter.import(file);
  };

  return {
    exportConversation,
    downloadConversation,
    importConversation,
  };
}

export default ConversationExporter;
