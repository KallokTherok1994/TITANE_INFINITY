/**
 * TITANE∞ — Conversation Export/Import UI Component
 * Permet d'exporter et importer des conversations
 *
 * v26.4.0 (Sprint 6)
 */

import React, { useRef, useState } from 'react';
import { AIMessage } from '../../services/ai/types';
import ConversationExporter from '../../services/chat/conversationExporter';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export interface ConversationControlsProps {
  messages: AIMessage[];
  onImport: (messages: AIMessage[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const ConversationControls: React.FC<ConversationControlsProps> = ({
  messages,
  onImport,
  className,
  style,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      ConversationExporter.download(messages, { format: 'json' });
      setSuccess('Conversation exportée en JSON');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        `Erreur lors de l'export: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      setExporting(true);
      ConversationExporter.download(messages, { format: 'markdown' });
      setSuccess('Conversation exportée en Markdown');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        `Erreur lors de l'export: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      );
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const importedMessages = await ConversationExporter.import(file);
      onImport(importedMessages);
      setSuccess(`${importedMessages.length} messages importés`);
      setTimeout(() => setSuccess(null), 3000);
      // Reset input
      event.target.value = '';
    } catch (err) {
      setError(
        `Erreur lors de l'import: ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      );
    } finally {
      setImporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        background: 'rgba(114, 123, 129, 0.1)',
        borderRadius: '8px',
        ...style,
      }}
    >
      {/* Export Buttons */}
      <button
        onClick={handleExportJSON}
        disabled={exporting || messages.length === 0}
        title="Exporter la conversation en JSON"
        style={{
          padding: '6px 12px',
          background: 'rgba(114, 123, 129, 0.3)',
          border: '1px solid rgba(114, 123, 129, 0.5)',
          color: '#C4C4C4',
          borderRadius: '4px',
          cursor: exporting || messages.length === 0 ? 'not-allowed' : 'pointer',
          opacity: exporting || messages.length === 0 ? 0.5 : 1,
          fontSize: '12px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!exporting && messages.length > 0) {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(114, 123, 129, 0.5)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(114, 123, 129, 0.3)';
        }}
      >
        {exporting ? '⏳ Export...' : '💾 JSON'}
      </button>

      <button
        onClick={handleExportMarkdown}
        disabled={exporting || messages.length === 0}
        title="Exporter la conversation en Markdown"
        style={{
          padding: '6px 12px',
          background: 'rgba(114, 123, 129, 0.3)',
          border: '1px solid rgba(114, 123, 129, 0.5)',
          color: '#C4C4C4',
          borderRadius: '4px',
          cursor: exporting || messages.length === 0 ? 'not-allowed' : 'pointer',
          opacity: exporting || messages.length === 0 ? 0.5 : 1,
          fontSize: '12px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!exporting && messages.length > 0) {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(114, 123, 129, 0.5)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(114, 123, 129, 0.3)';
        }}
      >
        {exporting ? '⏳ Export...' : '📝 MD'}
      </button>

      {/* Import Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.md,.markdown"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={importing}
      />

      <button
        onClick={handleImportClick}
        disabled={importing}
        title="Importer une conversation (JSON ou Markdown)"
        style={{
          padding: '6px 12px',
          background: 'rgba(114, 123, 129, 0.3)',
          border: '1px solid rgba(114, 123, 129, 0.5)',
          color: '#C4C4C4',
          borderRadius: '4px',
          cursor: importing ? 'not-allowed' : 'pointer',
          opacity: importing ? 0.5 : 1,
          fontSize: '12px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!importing) {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(114, 123, 129, 0.5)';
          }
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'rgba(114, 123, 129, 0.3)';
        }}
      >
        {importing ? '⏳ Import...' : '📂 Import'}
      </button>

      {/* Messages de statut */}
      {error && (
        <div
          style={{
            marginLeft: 'auto',
            color: '#FF6B6B',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginLeft: 'auto',
            color: '#51CF66',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ✓ {success}
        </div>
      )}
    </div>
  );
};

export default ConversationControls;
