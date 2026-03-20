/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15 — MEMORY PAGE (FIXED)
 *   Mémoire chiffrée AES-256-GCM avec UI moderne
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useMemoryCore } from '../hooks';
import { useLTMContext } from '@/hooks/useLTMContext';
import useMemoryEngineStore, { selectBackendStats } from '@/stores/useMemoryEngineStore';
import type { MemoryEntry } from '../core/ARCHITECTURE_TYPES_v∞';
import './ModulePages.css';

export const Memory = () => {
  const { entries, loading, loadEntries, saveEntry, clearMemory } = useMemoryCore();
  const [newEntry, setNewEntry] = useState('');

  // LOCK4: Backend memory stats (truth)
  const backendStats = useMemoryEngineStore(selectBackendStats);
  const syncFromBackend = useMemoryEngineStore(s => s.syncFromBackend);

  // LOCK2: titane_active_conversation_id is now canonical; legacy key is migrated on boot.
  const conversationId =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('titane_active_conversation_id') ?? null
      : null;
  const { history: ltmHistory, historyCount: ltmCount } = useLTMContext(conversationId);

  useEffect(() => {
    loadEntries();
    // LOCK4: sync real counts from backend on mount
    void syncFromBackend();
  }, [loadEntries, syncFromBackend]);

  const handleSave = async () => {
    if (newEntry.trim()) {
      await saveEntry(newEntry);
      setNewEntry('');
    }
  };

  const encryptedCount = (entries as MemoryEntry[]).filter(e => e.encrypted).length;
  const totalEntries = entries.length;

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">🔐</span>
          Memory — Mémoire Chiffrée AES-256-GCM
        </h1>
        <p className="module-page__subtitle">Stockage sécurisé et persistant</p>
      </div>

      <div className="module-page__grid">
        <ModuleCard
          title="Entrées Totales"
          icon="📝"
          value={totalEntries}
          subtitle="Enregistrements stockés"
          variant="primary"
        />

        <ModuleCard
          title="Entrées Chiffrées"
          icon="🔒"
          value={encryptedCount}
          subtitle="Protégées par AES-256"
          variant="success"
        />

        <ModuleCard
          title="Sécurité"
          icon="✅"
          status={
            encryptedCount === totalEntries && totalEntries > 0
              ? 'Tous chiffrés'
              : 'Partiel'
          }
          subtitle="Niveau de protection"
          variant={encryptedCount === totalEntries ? 'success' : 'warning'}
        />

        {/* PATCH-014: LTM conversation history card */}
        <ModuleCard
          title="LTM Conversation"
          icon="🗂"
          value={ltmCount}
          subtitle="Messages en mémoire longue durée"
          variant={ltmCount > 0 ? 'success' : 'primary'}
        />

        {/* LOCK4: Backend-truth memory stats */}
        <ModuleCard
          title="Entrées Backend (réel)"
          icon="🧠"
          value={backendStats?.total_entries ?? '—'}
          subtitle={
            backendStats
              ? `${backendStats.conversations_stored} conv · ${backendStats.facts_stored} facts`
              : 'Sync en cours…'
          }
          variant={backendStats ? 'success' : 'primary'}
          data-testid="memory-backend-stats-card"
        />
      </div>

      <div
        style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <input
          type="text"
          placeholder="Nouvelle entrée mémoire..."
          value={newEntry}
          onChange={e => setNewEntry(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.95rem',
          }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={!newEntry.trim() || loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: newEntry.trim() ? 'pointer' : 'not-allowed',
              opacity: newEntry.trim() ? 1 : 0.5,
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Sauvegarder
          </button>
          <button
            onClick={clearMemory}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Effacer tout
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            padding: '3rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>
            Aucune entrée mémoire
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {entries.map(entry => (
            <div
              key={entry.id}
              style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{ marginBottom: '0.5rem', color: 'white', fontSize: '0.95rem' }}
              >
                {entry.content}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                <span>{entry.encrypted ? '🔒 Chiffré' : 'Non chiffré'}</span>
                <span>{new Date(entry.timestamp * 1000).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PATCH-014: LTM Conversation Timeline */}
      {ltmCount > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>
            🗂 Historique de Conversation LTM ({ltmCount} messages)
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              maxHeight: '350px',
              overflowY: 'auto',
            }}
          >
            {ltmHistory.slice(-10).map((msg, i) => (
              <div
                key={i}
                style={{
                  padding: '0.75rem 1rem',
                  background:
                    msg.role === 'user'
                      ? 'rgba(99,102,241,0.12)'
                      : 'rgba(16,185,129,0.08)',
                  borderRadius: '8px',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.2)'}`,
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: msg.role === 'user' ? '#818cf8' : '#34d399',
                    marginRight: '0.5rem',
                  }}
                >
                  {msg.role === 'user' ? '👤 Vous' : '🤖 TITANE'}
                </span>
                {msg.content.slice(0, 200)}
                {msg.content.length > 200 ? '…' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
