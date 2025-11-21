/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v15.7 — MEMORY PAGE (FIXED)
 *   Mémoire chiffrée AES-256-GCM avec UI moderne
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { useMemoryCore } from '../hooks';
import './ModulePages.css';

export const Memory = () => {
  const { entries, loading, loadEntries, saveEntry, clearMemory } = useMemoryCore();
  const [newEntry, setNewEntry] = useState('');

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSave = async () => {
    if (newEntry.trim()) {
      await saveEntry(newEntry);
      setNewEntry('');
    }
  };

  const encryptedCount = entries.filter((e: any) => e.encrypted).length;
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
          status={encryptedCount === totalEntries && totalEntries > 0 ? 'Tous chiffrés' : 'Partiel'}
          subtitle="Niveau de protection"
          variant={encryptedCount === totalEntries ? 'success' : 'warning'}
        />
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <input
          type="text"
          placeholder="Nouvelle entrée mémoire..."
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', fontSize: '0.95rem' }}
        />
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={!newEntry.trim() || loading}
            style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: newEntry.trim() ? 'pointer' : 'not-allowed', opacity: newEntry.trim() ? 1 : 0.5, fontSize: '0.9rem', fontWeight: 600 }}
          >
            Sauvegarder
          </button>
          <button
            onClick={clearMemory}
            disabled={loading}
            style={{ padding: '0.75rem 1.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
          >
            Effacer tout
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{ marginTop: '2rem', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem' }}>Aucune entrée mémoire</p>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {entries.map((entry: any) => (
            <div key={entry.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ marginBottom: '0.5rem', color: 'white', fontSize: '0.95rem' }}>{entry.content}</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                <span>{entry.encrypted ? '🔒 Chiffré' : 'Non chiffré'}</span>
                <span>{new Date(entry.timestamp * 1000).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
