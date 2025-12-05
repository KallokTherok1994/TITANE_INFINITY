/**
 * TITANE_INFINITY v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════
 *   ONGLET JOURNAL SÉCURITÉ — Logs et événements
 *   Trace complète de toutes les actions sensibles
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import { Card, Button } from '@/ui';
import type { SecurityLogEntry, LogLevel, SecurityEventCategory, SecurityLogFilters } from '../types';

interface SecurityLogTabProps {
  securityLog: SecurityLogEntry[];
  logFilters: SecurityLogFilters;
  loading: boolean;
  onLoadLog: (filters?: SecurityLogFilters) => Promise<unknown>;
  onExportLog: (format: 'json' | 'csv') => Promise<unknown>;
  onClearLog: () => Promise<unknown>;
  onRefresh: () => void;
}

const levelStyles: Record<LogLevel, { color: string; icon: string; bg: string }> = {
  debug: { color: '#9e9e9e', icon: '🔍', bg: 'rgba(158, 158, 158, 0.1)' },
  info: { color: '#2196f3', icon: 'ℹ️', bg: 'rgba(33, 150, 243, 0.1)' },
  warn: { color: '#ff9800', icon: '⚠️', bg: 'rgba(255, 152, 0, 0.1)' },
  error: { color: '#f44336', icon: '❌', bg: 'rgba(244, 67, 54, 0.1)' },
  critical: { color: '#d32f2f', icon: '🚨', bg: 'rgba(211, 47, 47, 0.15)' },
};

const categoryLabels: Record<SecurityEventCategory, { label: string; icon: string }> = {
  authentication: { label: 'Authentification', icon: '🔑' },
  authorization: { label: 'Autorisation', icon: '🛡️' },
  secrets: { label: 'Secrets', icon: '🔐' },
  policy: { label: 'Politiques', icon: '📋' },
  system: { label: 'Système', icon: '⚙️' },
  audit: { label: 'Audit', icon: '📝' },
};

export const SecurityLogTab: React.FC<SecurityLogTabProps> = ({
  securityLog,
  logFilters: _logFilters,
  loading,
  onLoadLog: _onLoadLog,
  onExportLog,
  onClearLog,
  onRefresh,
}) => {
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<SecurityEventCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  // Filtrer les logs
  const filteredLogs = useMemo(() => {
    return securityLog
      .filter((entry) => {
        if (filterLevel !== 'all' && entry.level !== filterLevel) return false;
        if (filterCategory !== 'all' && entry.category !== filterCategory) return false;
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            entry.event.toLowerCase().includes(search) ||
            entry.details.toLowerCase().includes(search) ||
            entry.source.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [securityLog, filterLevel, filterCategory, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const levels: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, critical: 0 };
    for (const entry of securityLog) {
      levels[entry.level]++;
    }
    return levels;
  }, [securityLog]);

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExport = async (format: 'json' | 'csv') => {
    await onExportLog(format);
    // TODO: Télécharger le fichier
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
            📜 Journal de Sécurité
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Trace complète des événements de sécurité TITANE∞
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" onClick={() => handleExport('json')}>
            📥 JSON
          </Button>
          <Button variant="ghost" onClick={() => handleExport('csv')}>
            📥 CSV
          </Button>
          <Button variant="ghost" onClick={onRefresh} disabled={loading}>
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {(['debug', 'info', 'warn', 'error', 'critical'] as LogLevel[]).map((level) => (
          <Card
            key={level}
            style={{
              padding: '12px',
              cursor: 'pointer',
              border: filterLevel === level ? '1px solid var(--color-primary)' : '1px solid transparent',
            }}
            onClick={() => setFilterLevel(filterLevel === level ? 'all' : level)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span>{levelStyles[level].icon}</span>
              <span style={{ fontWeight: 500, color: levelStyles[level].color, textTransform: 'capitalize' }}>
                {level}
              </span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats[level]}</div>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <Card style={{ padding: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--color-surface)',
              color: 'inherit',
            }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as SecurityEventCategory | 'all')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              background: 'var(--color-surface)',
              color: 'inherit',
            }}
          >
            <option value="all">Toutes catégories</option>
            {Object.entries(categoryLabels).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button variant="ghost" onClick={onClearLog} disabled={loading}>
            🗑️ Effacer
          </Button>
        </div>
      </Card>

      {/* Liste des logs */}
      <Card style={{ padding: 0 }}>
        <div style={{ maxHeight: '500px', overflow: 'auto' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
              Aucun événement de sécurité
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredLogs.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: levelStyles[entry.level].bg,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Icon niveau */}
                    <span style={{ fontSize: '1.2rem' }}>{levelStyles[entry.level].icon}</span>

                    {/* Contenu principal */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{entry.event}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.1)',
                          }}
                        >
                          {categoryLabels[entry.category]?.icon} {categoryLabels[entry.category]?.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {entry.details}
                      </div>

                      {/* Détails étendus */}
                      {expandedEntry === entry.id && (
                        <div
                          style={{
                            marginTop: '12px',
                            padding: '12px',
                            borderRadius: '6px',
                            background: 'rgba(0,0,0,0.2)',
                          }}
                        >
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ opacity: 0.5 }}>Source: </span>
                              <code>{entry.source}</code>
                            </div>
                            <div>
                              <span style={{ opacity: 0.5 }}>ID: </span>
                              <code>{entry.id}</code>
                            </div>
                            {entry.userId && (
                              <div>
                                <span style={{ opacity: 0.5 }}>Utilisateur: </span>
                                <code>{entry.userId}</code>
                              </div>
                            )}
                          </div>
                          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                            <div style={{ marginTop: '8px' }}>
                              <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>Métadonnées:</span>
                              <pre
                                style={{
                                  margin: '4px 0 0',
                                  padding: '8px',
                                  borderRadius: '4px',
                                  background: 'rgba(0,0,0,0.3)',
                                  fontSize: '0.75rem',
                                  overflow: 'auto',
                                }}
                              >
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, whiteSpace: 'nowrap' }}>
                      {formatTimestamp(entry.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Note Kevin */}
      <Card style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.5rem' }}>👑</span>
          <div>
            <div style={{ fontWeight: 600, color: '#ffc107' }}>Accès SuperAdmin</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              Seul Kevin Thibault (ROOT) peut effacer le journal de sécurité ou exporter les données sensibles.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecurityLogTab;
