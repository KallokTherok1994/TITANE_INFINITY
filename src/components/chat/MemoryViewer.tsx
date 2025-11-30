/**
 * TITANE∞ v19.2Ω - Memory Viewer Component
 * Composant de visualisation détaillée des entrées mémoire
 */

import React, { useState, useCallback } from 'react';
import type {
  MemoryLevel,
  MemoryTopic,
  MemoryContentType,
  SessionMemoryEntry,
  IntermediateMemoryEntry,
  LongTermMemoryEntry,
} from '../../services/memory/persistentMemory.config';
import {
  MEMORY_LEVEL_LABELS,
  MEMORY_TOPIC_LABELS,
  MEMORY_CONTENT_TYPE_LABELS,
  DEFAULT_SESSION_TTL,
  DEFAULT_INTERMEDIATE_TTL,
} from '../../services/memory/persistentMemory.config';
import './MemoryViewer.css';

// =============================================================================
// TYPES
// =============================================================================

type MemoryEntry = SessionMemoryEntry | IntermediateMemoryEntry | LongTermMemoryEntry;

interface MemoryViewerProps {
  entry: MemoryEntry | null;
  onClose: () => void;
  onPromote?: (entry: MemoryEntry) => Promise<void>;
  onArchive?: (entry: MemoryEntry) => Promise<void>;
  onDelete?: (entry: MemoryEntry) => Promise<void>;
  onUpdateImportance?: (entry: MemoryEntry, importance: number) => Promise<void>;
  readOnly?: boolean;
  className?: string;
}

// Labels d'importance locaux
const IMPORTANCE_LABELS: Record<number, string> = {
  1: 'Trivial',
  2: 'Faible',
  3: 'Normal',
  4: 'Important',
  5: 'Critique',
};

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  return formatDate(timestamp);
}

function getTimeRemaining(entry: MemoryEntry): string | null {
  if (entry.level === 'long_term') return null;

  const ttl = entry.level === 'session'
    ? (entry.ttl || DEFAULT_SESSION_TTL)
    : DEFAULT_INTERMEDIATE_TTL;

  const createdAt = entry.metadata.createdAt;
  const expiresAt = createdAt + ttl;
  const remaining = expiresAt - Date.now();

  if (remaining <= 0) return 'Expiré';

  const hours = Math.floor(remaining / 3600000);
  const days = Math.floor(remaining / 86400000);

  if (hours < 24) return `${hours}h restantes`;
  return `${days} jour${days > 1 ? 's' : ''} restant${days > 1 ? 's' : ''}`;
}

function truncateContent(content: string, maxLength = 500): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

function canPromote(entry: MemoryEntry): boolean {
  return entry.level === 'session' || entry.level === 'intermediate';
}

function getNextLevel(level: MemoryLevel): MemoryLevel | null {
  if (level === 'session') return 'intermediate';
  if (level === 'intermediate') return 'long_term';
  return null;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const LevelBadge: React.FC<{ level: MemoryLevel }> = ({ level }) => {
  const config = MEMORY_LEVEL_LABELS[level];
  return (
    <span className={`memory-viewer__level-badge memory-viewer__level-badge--${level}`}>
      <span className="memory-viewer__level-icon">{config.icon}</span>
      <span className="memory-viewer__level-label">{config.label}</span>
    </span>
  );
};

const TopicBadge: React.FC<{ topic: MemoryTopic }> = ({ topic }) => {
  const config = MEMORY_TOPIC_LABELS[topic];
  return (
    <span className={`memory-viewer__topic-badge memory-viewer__topic-badge--${topic}`}>
      <span className="memory-viewer__topic-icon">{config.icon}</span>
      <span className="memory-viewer__topic-label">{config.label}</span>
    </span>
  );
};

const ContentTypeBadge: React.FC<{ contentType: MemoryContentType }> = ({ contentType }) => {
  const config = MEMORY_CONTENT_TYPE_LABELS[contentType];
  return (
    <span className={`memory-viewer__content-type-badge memory-viewer__content-type-badge--${contentType}`}>
      {config.label}
    </span>
  );
};

const ImportanceIndicator: React.FC<{
  importance: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}> = ({ importance, onChange, readOnly }) => {
  const label = IMPORTANCE_LABELS[importance] || 'Inconnu';

  return (
    <div className="memory-viewer__importance">
      <span className="memory-viewer__importance-label">Importance:</span>
      <div className="memory-viewer__importance-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`memory-viewer__star ${star <= importance ? 'memory-viewer__star--filled' : ''}`}
            onClick={() => !readOnly && onChange?.(star)}
            disabled={readOnly}
            aria-label={`Importance ${star}`}
          >
            {star <= importance ? '★' : '☆'}
          </button>
        ))}
      </div>
      <span className="memory-viewer__importance-text">{label}</span>
    </div>
  );
};

const TagsList: React.FC<{ tags: string[] }> = ({ tags }) => {
  if (!tags.length) return null;

  return (
    <div className="memory-viewer__tags">
      <span className="memory-viewer__tags-label">Tags:</span>
      <div className="memory-viewer__tags-list">
        {tags.map((tag, index) => (
          <span key={index} className="memory-viewer__tag">#{tag}</span>
        ))}
      </div>
    </div>
  );
};

const MetadataSection: React.FC<{ entry: MemoryEntry }> = ({ entry }) => {
  const timeRemaining = getTimeRemaining(entry);
  const { metadata } = entry;

  return (
    <div className="memory-viewer__metadata">
      <h4 className="memory-viewer__section-title">📊 Métadonnées</h4>
      <div className="memory-viewer__metadata-grid">
        <div className="memory-viewer__metadata-item">
          <span className="memory-viewer__metadata-label">ID:</span>
          <code className="memory-viewer__metadata-value">{entry.id}</code>
        </div>
        <div className="memory-viewer__metadata-item">
          <span className="memory-viewer__metadata-label">Créé le:</span>
          <span className="memory-viewer__metadata-value">{formatDate(metadata.createdAt)}</span>
        </div>
        <div className="memory-viewer__metadata-item">
          <span className="memory-viewer__metadata-label">Dernière mise à jour:</span>
          <span className="memory-viewer__metadata-value">{formatRelativeTime(metadata.updatedAt)}</span>
        </div>
        <div className="memory-viewer__metadata-item">
          <span className="memory-viewer__metadata-label">Accès:</span>
          <span className="memory-viewer__metadata-value">{metadata.accessCount} fois</span>
        </div>
        {metadata.lastAccessedAt && (
          <div className="memory-viewer__metadata-item">
            <span className="memory-viewer__metadata-label">Dernier accès:</span>
            <span className="memory-viewer__metadata-value">{formatRelativeTime(metadata.lastAccessedAt)}</span>
          </div>
        )}
        {timeRemaining && (
          <div className="memory-viewer__metadata-item">
            <span className="memory-viewer__metadata-label">Expiration:</span>
            <span className={`memory-viewer__metadata-value ${timeRemaining === 'Expiré' ? 'memory-viewer__metadata-value--expired' : ''}`}>
              {timeRemaining}
            </span>
          </div>
        )}
        {metadata.source && (
          <div className="memory-viewer__metadata-item">
            <span className="memory-viewer__metadata-label">Source:</span>
            <span className="memory-viewer__metadata-value">{metadata.source}</span>
          </div>
        )}
        {metadata.modeId && (
          <div className="memory-viewer__metadata-item">
            <span className="memory-viewer__metadata-label">Mode:</span>
            <span className="memory-viewer__metadata-value">{metadata.modeId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const ContentSection: React.FC<{
  content: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}> = ({ content, expanded = false, onToggleExpand }) => {
  const displayContent = expanded ? content : truncateContent(content);
  const needsExpand = content.length > 500;

  return (
    <div className="memory-viewer__content-section">
      <h4 className="memory-viewer__section-title">📝 Contenu</h4>
      <div className="memory-viewer__content-box">
        <pre className="memory-viewer__content-text">{displayContent}</pre>
        {needsExpand && (
          <button
            type="button"
            className="memory-viewer__expand-btn"
            onClick={onToggleExpand}
          >
            {expanded ? '▲ Réduire' : '▼ Voir tout'}
          </button>
        )}
      </div>
    </div>
  );
};

const ActionBar: React.FC<{
  entry: MemoryEntry;
  onPromote?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}> = ({ entry, onPromote, onArchive, onDelete, onExport, onCopy, readOnly, isLoading }) => {
  const nextLevel = getNextLevel(entry.level);
  const canBePromoted = canPromote(entry);

  return (
    <div className="memory-viewer__actions">
      {!readOnly && canBePromoted && nextLevel && (
        <button
          type="button"
          className="memory-viewer__action-btn memory-viewer__action-btn--promote"
          onClick={onPromote}
          disabled={isLoading}
          title={`Promouvoir vers ${MEMORY_LEVEL_LABELS[nextLevel].label}`}
        >
          ⬆️ Promouvoir
        </button>
      )}

      {!readOnly && entry.level !== 'long_term' && (
        <button
          type="button"
          className="memory-viewer__action-btn memory-viewer__action-btn--archive"
          onClick={onArchive}
          disabled={isLoading}
          title="Archiver en mémoire long terme"
        >
          📦 Archiver
        </button>
      )}

      <button
        type="button"
        className="memory-viewer__action-btn memory-viewer__action-btn--copy"
        onClick={onCopy}
        disabled={isLoading}
        title="Copier le contenu"
      >
        📋 Copier
      </button>

      <button
        type="button"
        className="memory-viewer__action-btn memory-viewer__action-btn--export"
        onClick={onExport}
        disabled={isLoading}
        title="Exporter en JSON"
      >
        📤 Exporter
      </button>

      {!readOnly && (
        <button
          type="button"
          className="memory-viewer__action-btn memory-viewer__action-btn--delete"
          onClick={onDelete}
          disabled={isLoading}
          title="Supprimer définitivement"
        >
          🗑️ Supprimer
        </button>
      )}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MemoryViewer: React.FC<MemoryViewerProps> = ({
  entry,
  onClose,
  onPromote,
  onArchive,
  onDelete,
  onUpdateImportance,
  readOnly = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handlePromote = useCallback(async () => {
    if (!entry || !onPromote) return;
    setIsLoading(true);
    try {
      await onPromote(entry);
      showNotification('✅ Entrée promue avec succès');
    } catch {
      showNotification('❌ Erreur lors de la promotion');
    } finally {
      setIsLoading(false);
    }
  }, [entry, onPromote, showNotification]);

  const handleArchive = useCallback(async () => {
    if (!entry || !onArchive) return;
    setIsLoading(true);
    try {
      await onArchive(entry);
      showNotification('✅ Entrée archivée');
    } catch {
      showNotification('❌ Erreur lors de l\'archivage');
    } finally {
      setIsLoading(false);
    }
  }, [entry, onArchive, showNotification]);

  const handleDelete = useCallback(async () => {
    if (!entry || !onDelete) return;
    setIsLoading(true);
    try {
      await onDelete(entry);
      showNotification('✅ Entrée supprimée');
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      showNotification('❌ Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }, [entry, onDelete, onClose, showNotification]);

  const handleCopy = useCallback(async () => {
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.content);
      showNotification('✅ Contenu copié');
    } catch {
      showNotification('❌ Erreur lors de la copie');
    }
  }, [entry, showNotification]);

  const handleExport = useCallback(() => {
    if (!entry) return;
    const json = JSON.stringify(entry, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-${entry.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('✅ Entrée exportée');
  }, [entry, showNotification]);

  const handleImportanceChange = useCallback(async (value: number) => {
    if (!entry || !onUpdateImportance) return;
    setIsLoading(true);
    try {
      await onUpdateImportance(entry, value);
      showNotification(`✅ Importance mise à jour: ${value}/5`);
    } catch {
      showNotification('❌ Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  }, [entry, onUpdateImportance, showNotification]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDeleteConfirm]);

  // Empty state
  if (!entry) {
    return (
      <div className={`memory-viewer memory-viewer--empty ${className}`}>
        <div className="memory-viewer__empty-state">
          <span className="memory-viewer__empty-icon">📭</span>
          <p>Sélectionnez une entrée pour voir les détails</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`memory-viewer ${className}`}>
      {/* Header */}
      <header className="memory-viewer__header">
        <div className="memory-viewer__header-badges">
          <LevelBadge level={entry.level} />
          <TopicBadge topic={entry.topic} />
          <ContentTypeBadge contentType={entry.contentType} />
        </div>
        <button
          type="button"
          className="memory-viewer__close-btn"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
      </header>

      {/* Notification */}
      {notification && (
        <div className="memory-viewer__notification">{notification}</div>
      )}

      {/* Main content */}
      <div className="memory-viewer__body">
        <ImportanceIndicator
          importance={entry.importance}
          onChange={handleImportanceChange}
          readOnly={readOnly}
        />
        <TagsList tags={entry.tags} />
        <ContentSection
          content={entry.content}
          expanded={isExpanded}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
        <MetadataSection entry={entry} />

        {/* Long term summary */}
        {entry.level === 'long_term' && 'summary' in entry && entry.summary && (
          <div className="memory-viewer__summary">
            <h4 className="memory-viewer__section-title">📋 Résumé</h4>
            <p className="memory-viewer__summary-text">{entry.summary}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <ActionBar
        entry={entry}
        onPromote={handlePromote}
        onArchive={handleArchive}
        onDelete={() => setShowDeleteConfirm(true)}
        onExport={handleExport}
        onCopy={handleCopy}
        readOnly={readOnly}
        isLoading={isLoading}
      />

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="memory-viewer__modal-overlay">
          <div className="memory-viewer__modal">
            <h3 className="memory-viewer__modal-title">⚠️ Confirmer la suppression</h3>
            <p className="memory-viewer__modal-text">
              Cette action est irréversible. Voulez-vous vraiment supprimer cette entrée ?
            </p>
            <div className="memory-viewer__modal-actions">
              <button
                type="button"
                className="memory-viewer__modal-btn memory-viewer__modal-btn--cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="memory-viewer__modal-btn memory-viewer__modal-btn--confirm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryViewer;
