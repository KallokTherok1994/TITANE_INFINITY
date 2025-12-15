/**
 * TITANE∞ OS v24.7 - ChatDebugPanel
 * Composant partagé pour le debug des échanges Chat IA
 * Élimine ~200 lignes de duplication entre ChatPage.tsx et Chat.tsx
 */

import React, {
  CSSProperties,
  PointerEventHandler,
  useCallback,
  useRef,
  memo,
} from 'react';

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export interface DebugAttempt {
  provider: string;
  success: boolean;
  error?: string;
  latency_ms?: number;
}

export interface DebugEntry {
  id: string;
  timestamp: number;
  requestedProvider: string;
  attempts: DebugAttempt[];
  request: {
    messages: unknown[];
    config: unknown;
  };
  status: 'success' | 'error';
  response?: unknown;
  error?: string;
}

export interface PanelPosition {
  x: number;
  y: number;
}

export interface ChatDebugPanelProps {
  visible: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onToggleVisible: () => void;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
  entries: DebugEntry[];
  /** Titre personnalisé (défaut: "Debug Chat IA") */
  title?: string;
  /** Z-index du panel (défaut: 9200) */
  zIndex?: number;
}

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const PANEL_WIDTH_COLLAPSED = 260;
const PANEL_WIDTH_EXPANDED = 360;
const PANEL_HEIGHT_COLLAPSED = 60;
const PANEL_HEIGHT_EXPANDED = 360;

const styles = {
  toggleButton: {
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(15,23,42,0.9)',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'grab',
    background: 'rgba(30,41,59,0.95)',
    gap: 12,
  },
  headerButton: {
    border: 'none',
    background: 'rgba(148,163,184,0.15)',
    color: '#e2e8f0',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  closeButton: {
    border: 'none',
    background: 'rgba(248,113,113,0.2)',
    color: '#fca5a5',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  content: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  preBlock: {
    background: 'rgba(15,23,42,0.8)',
    borderRadius: '8px',
    padding: '8px',
    maxHeight: 140,
    overflow: 'auto',
    fontSize: '0.7rem',
  },
};

// ═══════════════════════════════════════════════════════════════════
// Composant
// ═══════════════════════════════════════════════════════════════════

export const ChatDebugPanel = memo(function ChatDebugPanel({
  visible,
  collapsed,
  onToggleCollapsed,
  onToggleVisible,
  position,
  onPositionChange,
  entries,
  title = 'Debug Chat IA',
  zIndex = 9200,
}: ChatDebugPanelProps): JSX.Element {
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const clampPosition = useCallback(
    (next: PanelPosition, panelWidth: number, panelHeight: number): PanelPosition => {
      if (typeof window === 'undefined') {
        return next;
      }
      const maxX = window.innerWidth - panelWidth - 16;
      const maxY = window.innerHeight - panelHeight - 16;
      return {
        x: Math.max(16, Math.min(next.x, maxX)),
        y: Math.max(16, Math.min(next.y, maxY)),
      };
    },
    []
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    event => {
      const header = event.currentTarget;
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - position.x,
        offsetY: event.clientY - position.y,
      };
      header.setPointerCapture(event.pointerId);
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    event => {
      const dragState = dragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const panelWidth = collapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;
      const panelHeight = collapsed ? PANEL_HEIGHT_COLLAPSED : PANEL_HEIGHT_EXPANDED;
      const nextPosition = clampPosition(
        {
          x: event.clientX - dragState.offsetX,
          y: event.clientY - dragState.offsetY,
        },
        panelWidth,
        panelHeight
      );
      onPositionChange(nextPosition);
    },
    [clampPosition, collapsed, onPositionChange]
  );

  const handlePointerUp = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  }, []);

  // Bouton pour ouvrir le panel quand fermé
  if (!visible) {
    return (
      <button
        type="button"
        onClick={onToggleVisible}
        style={{ ...styles.toggleButton, zIndex: zIndex - 100 }}
      >
        Open {title}
      </button>
    );
  }

  const panelWidth = collapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;
  const panelHeight = collapsed ? PANEL_HEIGHT_COLLAPSED : PANEL_HEIGHT_EXPANDED;

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: position.y,
    left: position.x,
    width: panelWidth,
    maxHeight: panelHeight,
    background: 'rgba(15,23,42,0.94)',
    borderRadius: '14px',
    border: '1px solid rgba(148,163,184,0.25)',
    boxShadow: '0 20px 45px rgba(2,6,23,0.45)',
    color: '#e2e8f0',
    overflow: 'hidden',
    zIndex,
    display: 'flex',
    flexDirection: 'column',
  };

  const lastEntry = entries[0];

  return (
    <div style={containerStyle}>
      {/* Header draggable */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          ...styles.header,
          borderBottom: collapsed ? 'none' : '1px solid rgba(148,163,184,0.15)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
          {!collapsed && (
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
              {lastEntry
                ? new Date(lastEntry.timestamp).toLocaleTimeString()
                : 'Aucun échange'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onToggleCollapsed} style={styles.headerButton}>
            {collapsed ? '▢' : '—'}
          </button>
          <button type="button" onClick={onToggleVisible} style={styles.closeButton}>
            ✕
          </button>
        </div>
      </div>

      {/* Contenu */}
      {!collapsed && (
        <div style={styles.content}>
          {lastEntry ? (
            <DebugEntryView entry={lastEntry} />
          ) : (
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              Aucun échange enregistré pour le moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════
// Sous-composant pour afficher une entrée de debug
// ═══════════════════════════════════════════════════════════════════

interface DebugEntryViewProps {
  entry: DebugEntry;
}

const DebugEntryView = memo(function DebugEntryView({ entry }: DebugEntryViewProps) {
  return (
    <>
      <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
        <strong>Provider demandé :</strong> {entry.requestedProvider}
        <br />
        <strong>Statut :</strong> {entry.status === 'success' ? '✅ Succès' : '⚠️ Échec'}
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: 4 }}>
          Tentatives
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {entry.attempts.map((attempt, index) => (
            <div
              key={`${attempt.provider}-${index}`}
              style={{
                fontSize: '0.75rem',
                padding: '6px 8px',
                borderRadius: '8px',
                background: attempt.success
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(248,113,113,0.12)',
                border: `1px solid ${attempt.success ? 'rgba(34,197,94,0.35)' : 'rgba(248,113,113,0.35)'}`,
              }}
            >
              <strong>{attempt.provider}</strong> —{' '}
              {attempt.success
                ? `Succès${attempt.latency_ms ? ` (${attempt.latency_ms}ms)` : ''}`
                : `Erreur : ${attempt.error ?? 'inconnue'}`}
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Payload Requête</div>
      <pre style={styles.preBlock}>{JSON.stringify(entry.request, null, 2)}</pre>

      <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Réponse</div>
      <pre style={styles.preBlock}>
        {JSON.stringify(
          entry.response ?? { error: entry.error ?? 'Aucune donnée' },
          null,
          2
        )}
      </pre>
    </>
  );
});

export default ChatDebugPanel;
