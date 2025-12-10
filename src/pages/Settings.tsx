/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2 — SETTINGS PAGE
 *   Configuration système avec Audio, UI et paramètres avancés
 * ═══════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { ModuleCard } from '../components/ModuleCard';
import { AudioSettings } from '../components/AudioSettings';
import './ModulePages.css';

type SettingsTab = 'general' | 'audio' | 'system';

export const Settings = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('3000');
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    background: isActive
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'rgba(255,255,255,0.05)',
    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s ease',
  });

  return (
    <div className="module-page">
      <div className="module-page__header">
        <h1 className="module-page__title">
          <span className="module-page__icon">⚙️</span>
          Paramètres — Configuration Système
        </h1>
        <p className="module-page__subtitle">Personnalisation et options avancées</p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          style={tabStyle(activeTab === 'general')}
          onClick={() => setActiveTab('general')}
        >
          🎨 Général
        </button>
        <button
          style={tabStyle(activeTab === 'audio')}
          onClick={() => setActiveTab('audio')}
        >
          🔊 Audio & Voix
        </button>
        <button
          style={tabStyle(activeTab === 'system')}
          onClick={() => setActiveTab('system')}
        >
          💻 Système
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
          <div className="module-page__grid">
            <ModuleCard
              title="Thème"
              icon="🎨"
              status={theme === 'dark' ? 'Sombre' : 'Clair'}
              subtitle="Mode d'affichage"
              variant="primary"
            />

            <ModuleCard
              title="Auto-rafraîchissement"
              icon="🔄"
              status={autoRefresh ? 'Activé' : 'Désactivé'}
              subtitle="Mise à jour automatique"
              variant={autoRefresh ? 'success' : 'warning'}
            />

            <ModuleCard
              title="Intervalle"
              icon="⏱️"
              value={parseInt(refreshInterval)}
              unit="ms"
              subtitle="Fréquence de rafraîchissement"
              variant="default"
            />
          </div>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                style={{
                  marginBottom: '1rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Apparence
              </h3>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Mode {theme === 'dark' ? 'Sombre' : 'Clair'}
                </span>
                <button
                  onClick={toggleTheme}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  Changer
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <h3
                style={{
                  marginBottom: '1rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                Rafraîchissement
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Auto-rafraîchissement
                  </span>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    style={{
                      padding: '0.5rem 1.25rem',
                      background: autoRefresh
                        ? 'rgba(16,185,129,0.15)'
                        : 'rgba(239,68,68,0.15)',
                      border: `1px solid ${autoRefresh ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      borderRadius: '8px',
                      color: autoRefresh ? '#10b981' : '#f87171',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {autoRefresh ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      minWidth: '100px',
                    }}
                  >
                    Intervalle (ms)
                  </span>
                  <input
                    type="number"
                    value={refreshInterval}
                    onChange={e => setRefreshInterval(e.target.value)}
                    disabled={!autoRefresh}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      opacity: autoRefresh ? 1 : 0.5,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'audio' && <AudioSettings />}

      {activeTab === 'system' && (
        <div
          style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3
            style={{
              marginBottom: '1rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Système
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Version:
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                v19.2.0
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                TTS Engine:
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: '6px',
                  color: '#10b981',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                Piper v1.3.0
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Voice Model:
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '6px',
                  color: '#818cf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                fr_FR-siwis-medium (61 MB)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
