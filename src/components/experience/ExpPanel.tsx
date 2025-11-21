// 🎯 ExpPanel — Panneau principal EXP Fusion
// Vue globale : XP, catégories, projets, talents, timeline

import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import '../../styles/exp-fusion.css';
import { TalentTree } from './TalentTree';
import { TimelineChart } from './TimelineChart';

interface GlobalExpState {
  total_exp: number;
  level: number;
  exp_to_next_level: number;
  exp_current_level: number;
  level_progress: number;
}

interface CategoryState {
  category: string;
  icon: string;
  color: string;
  total_exp: number;
  level: number;
  exp_to_next_level: number;
  exp_current_level: number;
  progress: number;
  knowledge_count: number;
}

interface ProjectState {
  name: string;
  icon: string;
  total_exp: number;
  level: number;
  exp_to_next_level: number;
  exp_current_level: number;
  progress: number;
  categories: Record<string, number>;
  knowledge_count: number;
  created_at: string;
  last_updated: string;
}

interface TalentTreeState {
  branches: Record<string, any>;
  total_unlocked: number;
  total_talents: number;
  global_effects: any[];
}

export const ExpPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [globalState, setGlobalState] = useState<GlobalExpState | null>(null);
  const [categories, setCategories] = useState<CategoryState[]>([]);
  const [projects, setProjects] = useState<ProjectState[]>([]);
  const [talents, setTalents] = useState<TalentTreeState | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'projects' | 'talents' | 'timeline'>('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [global, cats, projs, tals] = await Promise.all([
        invoke<GlobalExpState>('exp_get_global_state'),
        invoke<CategoryState[]>('exp_get_categories'),
        invoke<ProjectState[]>('exp_get_projects'),
        invoke<TalentTreeState>('exp_get_talents'),
      ]);
      setGlobalState(global);
      setCategories(cats);
      setProjects(projs);
      setTalents(tals);
    } catch (error) {
      console.error('Erreur fetch EXP data:', error);
    }
  };

  return (
    <div className="exp-panel-overlay" onClick={onClose}>
      <div className="exp-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="exp-panel-header">
          <div>
            <div className="exp-panel-title">⚡ EXP FUSION ENGINE</div>
            {globalState && (
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                Niveau {globalState.level} • {globalState.total_exp.toLocaleString()} XP Total
              </div>
            )}
          </div>
          <button className="exp-panel-close" onClick={onClose}>
            ✕ Fermer
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(59,130,246,0.03)' }}>
          {['overview', 'categories', 'projects', 'talents', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: activeTab === tab ? 'rgba(59,130,246,0.2)' : 'transparent',
                border: activeTab === tab ? '1px solid #3b82f6' : '1px solid transparent',
                color: activeTab === tab ? '#3b82f6' : '#9ca3af',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="exp-panel-content">
          {activeTab === 'overview' && (
            <>
              {/* Global XP Card */}
              {globalState && (
                <div className="exp-card" style={{ gridColumn: '1 / -1' }}>
                  <div className="exp-card-header">
                    <span className="exp-card-icon">💎</span>
                    <h2 className="exp-card-title">Progression Globale</h2>
                    <span className="exp-card-level">NIV {globalState.level}</span>
                  </div>
                  <div className="exp-mini-progress">
                    <div
                      className="exp-mini-progress-fill"
                      style={{
                        width: `${globalState.level_progress * 100}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                    <span>{globalState.exp_current_level.toLocaleString()} / {globalState.exp_to_next_level.toLocaleString()} XP</span>
                    <span>{(globalState.level_progress * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* Top Categories */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#f3f4f6' }}>
                  🗂️ Catégories Principales
                </h3>
                {categories.slice(0, 4).map((cat) => (
                  <div key={cat.category} className="exp-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{cat.category}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Niveau {cat.level} • {cat.knowledge_count} connaissances
                        </div>
                      </div>
                    </div>
                    <div className="exp-mini-progress">
                      <div
                        className="exp-mini-progress-fill"
                        style={{ width: `${cat.progress * 100}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Projects */}
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#f3f4f6' }}>
                  🚀 Projets Récents
                </h3>
                {projects.slice(0, 4).map((proj) => (
                  <div key={proj.name} className="exp-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{proj.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{proj.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Niveau {proj.level} • {proj.knowledge_count} éléments
                        </div>
                      </div>
                    </div>
                    <div className="exp-mini-progress">
                      <div
                        className="exp-mini-progress-fill"
                        style={{ width: `${proj.progress * 100}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {categories.map((cat) => (
                <div key={cat.category} className="exp-card">
                  <div className="exp-card-header">
                    <span className="exp-card-icon">{cat.icon}</span>
                    <h3 className="exp-card-title">{cat.category}</h3>
                    <span className="exp-card-level">NIV {cat.level}</span>
                  </div>
                  <div className="exp-mini-progress">
                    <div
                      className="exp-mini-progress-fill"
                      style={{ width: `${cat.progress * 100}%`, background: cat.color }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: '#9ca3af' }}>XP Total</div>
                      <div style={{ fontWeight: 700, color: '#f3f4f6', fontFamily: 'monospace' }}>{cat.total_exp.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#9ca3af' }}>Connaissances</div>
                      <div style={{ fontWeight: 700, color: '#f3f4f6', fontFamily: 'monospace' }}>{cat.knowledge_count}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'projects' && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {projects.map((proj) => (
                <div key={proj.name} className="exp-card">
                  <div className="exp-card-header">
                    <span className="exp-card-icon">{proj.icon}</span>
                    <h3 className="exp-card-title">{proj.name}</h3>
                    <span className="exp-card-level">NIV {proj.level}</span>
                  </div>
                  <div className="exp-mini-progress">
                    <div
                      className="exp-mini-progress-fill"
                      style={{ width: `${proj.progress * 100}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                    />
                  </div>
                  <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: '#9ca3af' }}>XP Total</div>
                      <div style={{ fontWeight: 700, color: '#f3f4f6', fontFamily: 'monospace' }}>{proj.total_exp.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: '#9ca3af' }}>Éléments</div>
                      <div style={{ fontWeight: 700, color: '#f3f4f6', fontFamily: 'monospace' }}>{proj.knowledge_count}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                    Mis à jour: {new Date(proj.last_updated).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'talents' && talents && <TalentTree talents={talents} />}

          {activeTab === 'timeline' && <TimelineChart />}
        </div>
      </div>
    </div>
  );
};

export default ExpPanel;
