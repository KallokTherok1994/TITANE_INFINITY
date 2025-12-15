/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — HYPER CENTER (OPUS #20)
 * Interface de contrôle du Hyper-Intelligence Engine
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useIdentityMatrix } from '@/hooks/useIdentityMatrix';
import { useSingularityStateSafe } from '@/hooks/useSingularityStateSafe';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import './HyperCenter.css';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface HyperIntelligenceState {
  active: boolean;
  mode: string;
  consciousness_level: string;
  consciousness_score: number;
  thought_count: number;
  active_thoughts: number;
  insight_count: number;
  reasoning_depth: number;
  creativity_index: number;
  coherence_score: number;
  uptime_seconds: number;
}

interface Thought {
  id: string;
  content: string;
  thought_type: string;
  confidence: number;
  coherence: number;
  novelty: number;
  relevance: number;
  created_at: number;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  significance: number;
  actionable: boolean;
  discovered_at: number;
}

interface Conclusion {
  id: string;
  statement: string;
  reasoning_type: string;
  confidence: number;
  validity: number;
  reasoning_chain: string[];
}

interface Imagination {
  id: string;
  scenario: string;
  vividness: number;
  coherence: number;
  emotional_tone: string;
  elements: string[];
  possibilities: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const ConsciousnessDisplay: React.FC<{
  level: string;
  score: number;
}> = ({ level, score }) => {
  const levelColors: Record<string, string> = {
    Dormant: '#666666',
    Aware: '#4488ff',
    Focused: '#00cc88',
    Heightened: '#ff8800',
    Transcendent: '#ff00ff',
  };

  return (
    <div className="consciousness-display">
      <div
        className="consciousness-orb"
        style={{
          background: `radial-gradient(circle, ${levelColors[level] || '#888'} 0%, transparent 70%)`,
          boxShadow: `0 0 ${score * 40}px ${levelColors[level] || '#888'}`,
        }}
      >
        <span className="consciousness-icon">🧠</span>
      </div>
      <div className="consciousness-info">
        <div className="consciousness-level">{level}</div>
        <div className="consciousness-bar">
          <div
            className="consciousness-fill"
            style={{ width: `${score * 100}%`, backgroundColor: levelColors[level] }}
          />
        </div>
        <div className="consciousness-score">{(score * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
};

const ModeSelector: React.FC<{
  currentMode: string;
  onChange: (mode: string) => void;
}> = ({ currentMode, onChange }) => {
  const modes = [
    { id: 'analytical', icon: '🔬', label: 'Analytical' },
    { id: 'creative', icon: '🎨', label: 'Creative' },
    { id: 'intuitive', icon: '✨', label: 'Intuitive' },
    { id: 'strategic', icon: '♟️', label: 'Strategic' },
    { id: 'empathetic', icon: '💜', label: 'Empathetic' },
    { id: 'integrative', icon: '🌐', label: 'Integrative' },
  ];

  return (
    <div className="mode-selector">
      <h4>Intelligence Mode</h4>
      <div className="mode-buttons">
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`mode-btn ${currentMode.toLowerCase() === mode.id ? 'active' : ''}`}
            onClick={() => onChange(mode.id)}
            title={mode.label}
          >
            <span className="mode-icon">{mode.icon}</span>
            <span className="mode-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ThoughtCard: React.FC<{ thought: Thought }> = ({ thought }) => (
  <div className="thought-card">
    <div className="thought-header">
      <span className="thought-type">{thought.thought_type}</span>
      <span className="thought-confidence">
        {(thought.confidence * 100).toFixed(0)}% confident
      </span>
    </div>
    <p className="thought-content">{thought.content}</p>
    <div className="thought-metrics">
      <span title="Coherence">🔗 {(thought.coherence * 100).toFixed(0)}%</span>
      <span title="Novelty">✨ {(thought.novelty * 100).toFixed(0)}%</span>
      <span title="Relevance">🎯 {(thought.relevance * 100).toFixed(0)}%</span>
    </div>
  </div>
);

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
  <div className={`insight-card ${insight.actionable ? 'actionable' : ''}`}>
    <div className="insight-header">
      <h5>{insight.title}</h5>
      <span className="insight-category">{insight.category}</span>
    </div>
    <p className="insight-description">{insight.description}</p>
    <div className="insight-footer">
      <span className="significance">
        Significance: {(insight.significance * 100).toFixed(0)}%
      </span>
      {insight.actionable && <span className="actionable-badge">⚡ Actionable</span>}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const HyperCenterContent: React.FC = () => {
  const [state, setState] = useState<HyperIntelligenceState | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const { loading: matrixLoading } = useIdentityMatrix();
  const _singularityState = useSingularityStateSafe();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thinkPrompt, setThinkPrompt] = useState('');
  const [thinking, setThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'think' | 'reason' | 'imagine' | 'insights'>(
    'think'
  );

  // Reasoning state
  const [premises, setPremises] = useState<string[]>(['']);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);

  // Imagination state
  const [imagineSeed, setImagineSeed] = useState('');
  const [imagination, setImagination] = useState<Imagination | null>(null);

  const loadState = useCallback(async () => {
    try {
      const currentState = await invoke<HyperIntelligenceState>('hyper_get_state').catch(
        async () => invoke<HyperIntelligenceState>('hyper_init')
      );
      setState(currentState);

      const recentThoughts = await invoke<Thought[]>('hyper_get_thoughts', { limit: 10 });
      setThoughts(recentThoughts);

      const recentInsights = await invoke<Insight[]>('hyper_get_insights', { limit: 5 });
      setInsights(recentInsights);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
    const interval = setInterval(loadState, REFRESH_INTERVALS.NORMAL);
    return () => clearInterval(interval);
  }, [loadState]);

  const handleModeChange = async (mode: string) => {
    try {
      await invoke('hyper_set_mode', { mode });
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleThink = async () => {
    if (!thinkPrompt.trim()) return;
    setThinking(true);
    try {
      const thought = await invoke<Thought>('hyper_think', { prompt: thinkPrompt });
      setThoughts(prev => [thought, ...prev].slice(0, 10));
      setThinkPrompt('');
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setThinking(false);
    }
  };

  const handleReason = async () => {
    const validPremises = premises.filter(p => p.trim());
    if (validPremises.length < 2) {
      setError('At least 2 premises required');
      return;
    }
    try {
      const result = await invoke<Conclusion>('hyper_reason', {
        premises: validPremises,
      });
      setConclusion(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleImagine = async () => {
    if (!imagineSeed.trim()) return;
    try {
      const result = await invoke<Imagination>('hyper_imagine', { seed: imagineSeed });
      setImagination(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleGenerateInsight = async () => {
    try {
      await invoke<Insight>('hyper_generate_insight', {
        context: thinkPrompt || 'current context',
      });
      await loadState();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const formatUptime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  if (loading || matrixLoading) {
    return (
      <div className="hyper-center loading">
        <div className="loading-animation">
          <span className="brain-icon">🧠</span>
          <div className="loading-pulse" />
        </div>
        <p>Awakening consciousness...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hyper-center error">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            loadState();
          }}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!state) return null;

  return (
    <div className="hyper-center">
      {/* Header */}
      <header className="hyper-header">
        <div className="header-left">
          <span className="header-icon">🧠</span>
          <h2>Hyper-Intelligence Engine</h2>
          <span className={`status-badge ${state.active ? 'active' : ''}`}>
            {state.active ? '● Online' : '○ Offline'}
          </span>
        </div>
        <div className="header-right">
          <span className="uptime">⏱️ {formatUptime(state.uptime_seconds)}</span>
        </div>
      </header>

      {/* Consciousness Display */}
      <section className="consciousness-section">
        <ConsciousnessDisplay
          level={state.consciousness_level}
          score={state.consciousness_score}
        />
        <div className="metrics-grid">
          <div className="metric">
            <span className="metric-value">{state.thought_count}</span>
            <span className="metric-label">Thoughts</span>
          </div>
          <div className="metric">
            <span className="metric-value">{state.insight_count}</span>
            <span className="metric-label">Insights</span>
          </div>
          <div className="metric">
            <span className="metric-value">{state.reasoning_depth}</span>
            <span className="metric-label">Depth</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {(state.creativity_index * 100).toFixed(0)}%
            </span>
            <span className="metric-label">Creativity</span>
          </div>
          <div className="metric">
            <span className="metric-value">
              {(state.coherence_score * 100).toFixed(0)}%
            </span>
            <span className="metric-label">Coherence</span>
          </div>
        </div>
      </section>

      {/* Mode Selector */}
      <ModeSelector currentMode={state.mode} onChange={handleModeChange} />

      {/* Tabs */}
      <nav className="hyper-tabs">
        {(['think', 'reason', 'imagine', 'insights'] as const).map(tab => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'think' && '💭 Think'}
            {tab === 'reason' && '🔗 Reason'}
            {tab === 'imagine' && '✨ Imagine'}
            {tab === 'insights' && '💡 Insights'}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="hyper-content">
        {activeTab === 'think' && (
          <div className="tab-think">
            <div className="think-input">
              <textarea
                value={thinkPrompt}
                onChange={e => setThinkPrompt(e.target.value)}
                placeholder="Enter a thought or question..."
                rows={3}
              />
              <div className="think-actions">
                <button onClick={handleThink} disabled={thinking || !thinkPrompt.trim()}>
                  {thinking ? '🔄 Thinking...' : '💭 Think'}
                </button>
                <button onClick={handleGenerateInsight}>💡 Generate Insight</button>
              </div>
            </div>
            <div className="thoughts-list">
              <h4>Recent Thoughts</h4>
              {thoughts.length === 0 ? (
                <p className="no-data">No thoughts yet. Start thinking!</p>
              ) : (
                thoughts.map(thought => (
                  <ThoughtCard key={thought.id} thought={thought} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reason' && (
          <div className="tab-reason">
            <div className="premises-section">
              <h4>Premises</h4>
              {premises.map((premise, idx) => (
                <div key={idx} className="premise-input">
                  <span className="premise-label">P{idx + 1}:</span>
                  <input
                    type="text"
                    value={premise}
                    onChange={e => {
                      const newPremises = [...premises];
                      newPremises[idx] = e.target.value;
                      setPremises(newPremises);
                    }}
                    placeholder={`Premise ${idx + 1}`}
                  />
                  {idx > 0 && (
                    <button
                      className="remove-premise"
                      onClick={() => setPremises(premises.filter((_, i) => i !== idx))}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <div className="premise-actions">
                <button onClick={() => setPremises([...premises, ''])}>
                  + Add Premise
                </button>
                <button
                  onClick={handleReason}
                  disabled={premises.filter(p => p.trim()).length < 2}
                >
                  🔗 Deduce
                </button>
              </div>
            </div>
            {conclusion && (
              <div className="conclusion-section">
                <h4>Conclusion</h4>
                <div className="conclusion-card">
                  <p className="conclusion-statement">{conclusion.statement}</p>
                  <div className="conclusion-meta">
                    <span>Type: {conclusion.reasoning_type}</span>
                    <span>Confidence: {(conclusion.confidence * 100).toFixed(0)}%</span>
                    <span>Validity: {(conclusion.validity * 100).toFixed(0)}%</span>
                  </div>
                  <div className="reasoning-chain">
                    <h5>Reasoning Chain:</h5>
                    {conclusion.reasoning_chain.map((step, idx) => (
                      <div key={idx} className="chain-step">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'imagine' && (
          <div className="tab-imagine">
            <div className="imagine-input">
              <input
                type="text"
                value={imagineSeed}
                onChange={e => setImagineSeed(e.target.value)}
                placeholder="Enter a seed for imagination..."
              />
              <button onClick={handleImagine} disabled={!imagineSeed.trim()}>
                ✨ Imagine
              </button>
            </div>
            {imagination && (
              <div className="imagination-result">
                <div className="scenario-display">
                  <h4>Imagined Scenario</h4>
                  <p className="scenario-text">{imagination.scenario}</p>
                </div>
                <div className="imagination-meta">
                  <span>Vividness: {(imagination.vividness * 100).toFixed(0)}%</span>
                  <span>Coherence: {(imagination.coherence * 100).toFixed(0)}%</span>
                  <span>Tone: {imagination.emotional_tone}</span>
                </div>
                <div className="possibilities">
                  <h5>Possibilities:</h5>
                  <ul>
                    {imagination.possibilities.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="tab-insights">
            <h4>Generated Insights</h4>
            {insights.length === 0 ? (
              <p className="no-data">
                No insights yet. Generate some from the Think tab!
              </p>
            ) : (
              <div className="insights-list">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Export with ErrorBoundary
export const HyperCenter: React.FC = () => {
  return (
    <ErrorBoundary context="HyperCenter">
      <HyperCenterContent />
    </ErrorBoundary>
  );
};

export default HyperCenter;
