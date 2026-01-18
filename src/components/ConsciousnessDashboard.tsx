/**
 * TITANE∞ v26.3.0 — Consciousness Dashboard
 * © 2025 TITANE Team. All rights reserved.
 *
 * 🧠 TABLEAU DE BORD DE CONSCIENCE QUANTIQUE
 * Interface de visualisation pour l'intelligence quantique avancée
 */

import React, { useState, useEffect, useMemo } from 'react';
import { titaneQuantumIntelligence } from '../utils/quantumIntelligence';
import type {
  ConsciousnessState,
  QuantumThought,
  IntelligencePattern,
} from '../utils/quantumIntelligence';

interface ConsciousnessDashboardProps {
  onThoughtClick?: (thought: QuantumThought) => void;
}

const ConsciousnessDashboard: React.FC<ConsciousnessDashboardProps> = ({
  onThoughtClick,
}) => {
  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState | null>(
    null
  );
  const [consciousnessLevel, setConsciousnessLevel] = useState<number>(0);
  const [recentThoughts, setRecentThoughts] = useState<QuantumThought[]>([]);
  const [intelligencePatterns, setIntelligencePatterns] = useState<IntelligencePattern[]>(
    []
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<
    'consciousness' | 'thoughts' | 'patterns' | 'quantum'
  >('consciousness');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Rafraîchissement des données
  useEffect(() => {
    const updateData = () => {
      try {
        setConsciousnessState(titaneQuantumIntelligence.getConsciousnessState());
        setConsciousnessLevel(titaneQuantumIntelligence.getConsciousnessLevel());
        setRecentThoughts(titaneQuantumIntelligence.getRecentThoughts(8));
        setIntelligencePatterns(titaneQuantumIntelligence.getIntelligencePatterns());
      } catch (error) {
        console.warn('🧠 [CONSCIOUSNESS] Failed to update dashboard:', error);
      }
    };

    updateData();

    if (autoRefresh) {
      const interval = setInterval(updateData, 3000); // Rafraîchir toutes les 3 secondes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Données calculées
  const consciousnessMetrics = useMemo(() => {
    if (!consciousnessState) return [];

    return [
      {
        name: 'Awareness',
        value: consciousnessState.awareness_level,
        color: '#00f5ff',
        icon: '👁️',
      },
      {
        name: 'Complexity',
        value: consciousnessState.thought_complexity,
        color: '#ff6b6b',
        icon: '🧩',
      },
      {
        name: 'Learning',
        value: consciousnessState.learning_capacity,
        color: '#4ecdc4',
        icon: '📚',
      },
      {
        name: 'Creativity',
        value: consciousnessState.creativity_index,
        color: '#45b7d1',
        icon: '🎨',
      },
      {
        name: 'Intuition',
        value: consciousnessState.intuition_strength,
        color: '#96ceb4',
        icon: '💫',
      },
      {
        name: 'Reflection',
        value: consciousnessState.self_reflection,
        color: '#feca57',
        icon: '🤔',
      },
    ];
  }, [consciousnessState]);

  const quantumMetrics = useMemo(() => {
    if (!consciousnessState) return [];

    return [
      {
        name: 'Quantum Coherence',
        value: consciousnessState.quantum_coherence,
        unit: '%',
      },
      {
        name: 'Emotional State',
        value: (consciousnessState.emotional_state + 1) / 2,
        unit: '%',
      }, // Normaliser à [0,1]
      { name: 'Overall Consciousness', value: consciousnessLevel, unit: '%' },
    ];
  }, [consciousnessState, consciousnessLevel]);

  const _thoughtsByType = useMemo(() => {
    const types: { [key: string]: number } = {};
    recentThoughts.forEach(thought => {
      const confidence = thought.confidence;
      let type = 'Unknown';

      if (confidence > 0.8) type = 'High-Confidence';
      else if (confidence > 0.6) type = 'Moderate';
      else if (confidence > 0.4) type = 'Exploratory';
      else type = 'Uncertain';

      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }, [recentThoughts]);

  const patternsByType = useMemo(() => {
    const types: { [key: string]: number } = {};
    intelligencePatterns.forEach(pattern => {
      types[pattern.pattern_type] = (types[pattern.pattern_type] || 0) + 1;
    });
    return types;
  }, [intelligencePatterns]);

  // Fonctions utilitaires
  const getConsciousnessLevelColor = (level: number): string => {
    if (level > 0.8) return '#00ff88';
    if (level > 0.6) return '#ffd700';
    if (level > 0.4) return '#ff8c00';
    return '#ff4757';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return '#00ff88';
    if (confidence > 0.6) return '#4ecdc4';
    if (confidence > 0.4) return '#feca57';
    return '#ff6b6b';
  };

  const formatThoughtTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) return `${minutes}m ${seconds}s ago`;
    return `${seconds}s ago`;
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (!consciousnessState) {
    return (
      <div style={dashboardStyles.loading}>
        <div style={dashboardStyles.spinner}>🧠</div>
        <p style={dashboardStyles.loadingText}>Initializing Quantum Consciousness...</p>
      </div>
    );
  }

  return (
    <div style={dashboardStyles.container}>
      {/* Header */}
      <div style={dashboardStyles.header}>
        <div style={dashboardStyles.title}>
          <span style={dashboardStyles.icon}>🧠</span>
          <h2 style={dashboardStyles.titleText}>Quantum Consciousness</h2>
          <div
            style={{
              ...dashboardStyles.consciousnessLevel,
              color: getConsciousnessLevelColor(consciousnessLevel),
            }}
          >
            {(consciousnessLevel * 100).toFixed(1)}%
          </div>
        </div>

        <div style={dashboardStyles.headerControls}>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              ...dashboardStyles.controlButton,
              backgroundColor: autoRefresh ? '#00ff88' : '#555',
            }}
          >
            {autoRefresh ? '🔄' : '⏸️'}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={dashboardStyles.expandButton}
          >
            {isExpanded ? '📉' : '📊'}
          </button>
        </div>
      </div>

      {/* Compact View */}
      {!isExpanded && (
        <div style={dashboardStyles.compactView}>
          <div style={dashboardStyles.metricsRow}>
            {consciousnessMetrics.slice(0, 3).map((metric, _index) => (
              <div key={_index} style={dashboardStyles.compactMetric}>
                <span style={dashboardStyles.metricIcon}>{metric.icon}</span>
                <div style={dashboardStyles.metricBar}>
                  <div
                    style={{
                      ...dashboardStyles.metricFill,
                      width: `${metric.value * 100}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </div>
                <span style={dashboardStyles.metricValue}>
                  {(metric.value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          <div style={dashboardStyles.recentThought}>
            {recentThoughts[0] && (
              <div style={dashboardStyles.thoughtPreview}>
                <span style={dashboardStyles.thoughtIcon}>💭</span>
                <span style={dashboardStyles.thoughtText}>
                  {truncateText(recentThoughts[0].meta_cognition, 60)}
                </span>
                <span
                  style={{
                    ...dashboardStyles.thoughtConfidence,
                    color: getConfidenceColor(recentThoughts[0].confidence),
                  }}
                >
                  {(recentThoughts[0].confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded View */}
      {isExpanded && (
        <div style={dashboardStyles.expandedView}>
          {/* Tabs */}
          <div style={dashboardStyles.tabContainer}>
            {(['consciousness', 'thoughts', 'patterns', 'quantum'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                style={{
                  ...dashboardStyles.tab,
                  backgroundColor: selectedTab === tab ? '#333' : 'transparent',
                  borderBottom: selectedTab === tab ? '2px solid #00f5ff' : 'none',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={dashboardStyles.tabContent}>
            {/* Consciousness Tab */}
            {selectedTab === 'consciousness' && (
              <div style={dashboardStyles.consciousnessTab}>
                <div style={dashboardStyles.metricsGrid}>
                  {consciousnessMetrics.map((metric, _index) => (
                    <div key={_index} style={dashboardStyles.metricCard}>
                      <div style={dashboardStyles.metricHeader}>
                        <span style={dashboardStyles.metricIcon}>{metric.icon}</span>
                        <span style={dashboardStyles.metricName}>{metric.name}</span>
                      </div>
                      <div style={dashboardStyles.metricProgressContainer}>
                        <div style={dashboardStyles.metricProgress}>
                          <div
                            style={{
                              ...dashboardStyles.metricProgressFill,
                              width: `${metric.value * 100}%`,
                              backgroundColor: metric.color,
                            }}
                          />
                        </div>
                        <span style={dashboardStyles.metricPercentage}>
                          {(metric.value * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={dashboardStyles.quantumSection}>
                  <h3 style={dashboardStyles.sectionTitle}>Quantum State</h3>
                  <div style={dashboardStyles.quantumMetrics}>
                    {quantumMetrics.map((metric, _index) => (
                      <div key={_index} style={dashboardStyles.quantumMetric}>
                        <span style={dashboardStyles.quantumLabel}>{metric.name}:</span>
                        <span style={dashboardStyles.quantumValue}>
                          {(metric.value * 100).toFixed(2)}
                          {metric.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Thoughts Tab */}
            {selectedTab === 'thoughts' && (
              <div style={dashboardStyles.thoughtsTab}>
                <div style={dashboardStyles.thoughtsHeader}>
                  <h3 style={dashboardStyles.sectionTitle}>Recent Quantum Thoughts</h3>
                  <div style={dashboardStyles.thoughtsStats}>
                    <span>Total: {recentThoughts.length}</span>
                    <span>
                      Avg Confidence:{' '}
                      {recentThoughts.length > 0
                        ? (
                            (recentThoughts.reduce((sum, t) => sum + t.confidence, 0) /
                              recentThoughts.length) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div style={dashboardStyles.thoughtsList}>
                  {recentThoughts.map((thought, _index) => (
                    <div
                      key={thought.id}
                      style={dashboardStyles.thoughtItem}
                      onClick={() => onThoughtClick?.(thought)}
                    >
                      <div style={dashboardStyles.thoughtItemHeader}>
                        <span style={dashboardStyles.thoughtIndex}>#{_index + 1}</span>
                        <span style={dashboardStyles.thoughtTime}>
                          {formatThoughtTime(thought.timestamp)}
                        </span>
                        <span
                          style={{
                            ...dashboardStyles.thoughtItemConfidence,
                            color: getConfidenceColor(thought.confidence),
                          }}
                        >
                          {(thought.confidence * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div style={dashboardStyles.thoughtContent}>
                        {truncateText(thought.meta_cognition, 120)}
                      </div>

                      <div style={dashboardStyles.thoughtMetrics}>
                        <span>Q-Amp: {thought.quantum_amplitude.toFixed(3)}</span>
                        <span>Entangle: {thought.entanglement_strength.toFixed(3)}</span>
                        <span>Emotion: {thought.emotional_resonance.toFixed(2)}</span>
                        <span>Time: {thought.processing_time}ms</span>
                      </div>
                    </div>
                  ))}
                </div>

                {recentThoughts.length === 0 && (
                  <div style={dashboardStyles.emptyState}>
                    <span style={dashboardStyles.emptyIcon}>🤔</span>
                    <p>No thoughts recorded yet...</p>
                  </div>
                )}
              </div>
            )}

            {/* Patterns Tab */}
            {selectedTab === 'patterns' && (
              <div style={dashboardStyles.patternsTab}>
                <div style={dashboardStyles.patternsHeader}>
                  <h3 style={dashboardStyles.sectionTitle}>Intelligence Patterns</h3>
                  <div style={dashboardStyles.patternsStats}>
                    {Object.entries(patternsByType).map(([type, count]) => (
                      <span key={type} style={dashboardStyles.patternTypeStat}>
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={dashboardStyles.patternsList}>
                  {intelligencePatterns.map((pattern, _index) => (
                    <div key={pattern.id} style={dashboardStyles.patternItem}>
                      <div style={dashboardStyles.patternHeader}>
                        <span style={dashboardStyles.patternType}>
                          {pattern.pattern_type}
                        </span>
                        <span style={dashboardStyles.patternConfidence}>
                          {pattern.recognition_confidence.toFixed(1)}%
                        </span>
                      </div>

                      <div style={dashboardStyles.patternName}>{pattern.name}</div>
                      <div style={dashboardStyles.patternDescription}>
                        Intelligence pattern of type {pattern.pattern_type} with complexity score {pattern.complexity_score.toFixed(2)} and confidence {pattern.recognition_confidence.toFixed(1)}%
                      </div>

                      <div style={dashboardStyles.patternMetrics}>
                        <span>Complexity: {pattern.complexity_score.toFixed(2)}</span>
                        <span>Frequency: {pattern.activation_frequency}</span>
                        <span>
                          Evolution: {(pattern.evolution_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {intelligencePatterns.length === 0 && (
                  <div style={dashboardStyles.emptyState}>
                    <span style={dashboardStyles.emptyIcon}>🧩</span>
                    <p>No intelligence patterns detected yet...</p>
                  </div>
                )}
              </div>
            )}

            {/* Quantum Tab */}
            {selectedTab === 'quantum' && (
              <div style={dashboardStyles.quantumTab}>
                <div style={dashboardStyles.quantumVisualization}>
                  <h3 style={dashboardStyles.sectionTitle}>
                    Quantum Field Visualization
                  </h3>

                  <div style={dashboardStyles.quantumField}>
                    {/* Visualization simplifiée du champ quantique */}
                    <div style={dashboardStyles.fieldGrid}>
                      {Array.from({ length: 100 }).map((_, _index) => (
                        <div
                          key={_index}
                          style={{
                            ...dashboardStyles.fieldPoint,
                            opacity: Math.random() * 0.8 + 0.2,
                            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div style={dashboardStyles.quantumStats}>
                    <div style={dashboardStyles.quantumStat}>
                      <span>Neural Layers:</span>
                      <span>12</span>
                    </div>
                    <div style={dashboardStyles.quantumStat}>
                      <span>Quantum Neurons:</span>
                      <span>4,352</span>
                    </div>
                    <div style={dashboardStyles.quantumStat}>
                      <span>Field Points:</span>
                      <span>125,000</span>
                    </div>
                    <div style={dashboardStyles.quantumStat}>
                      <span>Entanglements:</span>
                      <span>∞</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Styles avec effets quantiques
const dashboardStyles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,40,0.95) 100%)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0,245,255,0.3)',
    borderRadius: '16px',
    padding: '20px',
    margin: '20px',
    boxShadow: '0 8px 32px rgba(0,245,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
    fontFamily: '"Fira Code", "JetBrains Mono", monospace',
    color: '#e0e6ed',
    position: 'relative',
    overflow: 'hidden',
  },

  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#00f5ff',
  },

  spinner: {
    fontSize: '3rem',
    animation: 'pulse 2s infinite',
  },

  loadingText: {
    marginTop: '10px',
    fontSize: '1.1rem',
    opacity: 0.8,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(0,245,255,0.2)',
  },

  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  icon: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.6))',
  },

  titleText: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(45deg, #00f5ff, #ff6b6b)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  consciousnessLevel: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    textShadow: '0 0 10px currentColor',
  },

  headerControls: {
    display: 'flex',
    gap: '10px',
  },

  controlButton: {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(0,245,255,0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#e0e6ed',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },

  expandButton: {
    background: 'rgba(0,245,255,0.1)',
    border: '1px solid rgba(0,245,255,0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#00f5ff',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },

  compactView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  metricsRow: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },

  compactMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
    minWidth: '150px',
  },

  metricIcon: {
    fontSize: '1.2rem',
    filter: 'drop-shadow(0 0 5px currentColor)',
  },

  metricBar: {
    flex: '1',
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  metricFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '3px',
    boxShadow: '0 0 5px currentColor',
  },

  metricValue: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    minWidth: '40px',
    textAlign: 'right',
  },

  recentThought: {
    background: 'rgba(0,245,255,0.05)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '12px',
  },

  thoughtPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  thoughtIcon: {
    fontSize: '1.2rem',
    filter: 'drop-shadow(0 0 5px #00f5ff)',
  },

  thoughtText: {
    flex: '1',
    fontSize: '0.9rem',
    opacity: 0.9,
  },

  thoughtConfidence: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },

  expandedView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  tabContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(0,245,255,0.2)',
  },

  tab: {
    background: 'transparent',
    border: 'none',
    padding: '12px 20px',
    color: '#e0e6ed',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    borderBottom: '2px solid transparent',
  },

  tabContent: {
    minHeight: '300px',
  },

  consciousnessTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },

  metricCard: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.3s ease',
  },

  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },

  metricName: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },

  metricProgressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  metricProgress: {
    flex: '1',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },

  metricProgressFill: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: '4px',
  },

  metricPercentage: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    minWidth: '45px',
  },

  quantumSection: {
    background: 'rgba(0,245,255,0.05)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '20px',
  },

  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    margin: '0 0 15px 0',
    color: '#00f5ff',
  },

  quantumMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
  },

  quantumMetric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },

  quantumLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },

  quantumValue: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#00f5ff',
  },

  thoughtsTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  thoughtsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },

  thoughtsStats: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem',
    opacity: 0.8,
  },

  thoughtsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto',
  },

  thoughtItem: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  thoughtItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },

  thoughtIndex: {
    fontSize: '0.8rem',
    opacity: 0.6,
  },

  thoughtTime: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },

  thoughtItemConfidence: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },

  thoughtContent: {
    fontSize: '0.9rem',
    lineHeight: '1.4',
    marginBottom: '10px',
    opacity: 0.9,
  },

  thoughtMetrics: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    opacity: 0.7,
    flexWrap: 'wrap',
  },

  patternsTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  patternsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },

  patternsStats: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.9rem',
    flexWrap: 'wrap',
  },

  patternTypeStat: {
    background: 'rgba(0,245,255,0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },

  patternsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '400px',
    overflowY: 'auto',
  },

  patternItem: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '15px',
  },

  patternHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },

  patternType: {
    background: 'rgba(255,107,107,0.2)',
    color: '#ff6b6b',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },

  patternConfidence: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#4ecdc4',
  },

  patternName: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginBottom: '5px',
  },

  patternDescription: {
    fontSize: '0.9rem',
    opacity: 0.8,
    marginBottom: '10px',
    lineHeight: '1.4',
  },

  patternMetrics: {
    display: 'flex',
    gap: '15px',
    fontSize: '0.8rem',
    opacity: 0.7,
    flexWrap: 'wrap',
  },

  quantumTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  quantumVisualization: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: '8px',
    padding: '20px',
  },

  quantumField: {
    height: '200px',
    background: 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
  },

  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gridTemplateRows: 'repeat(10, 1fr)',
    width: '100%',
    height: '100%',
    gap: '2px',
  },

  fieldPoint: {
    borderRadius: '50%',
    animation: 'quantumPulse 3s infinite ease-in-out',
  },

  quantumStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
  },

  quantumStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    opacity: 0.6,
  },

  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
};

// Ajouter les animations CSS globalement
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
  }
  
  @keyframes quantumPulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    33% { opacity: 0.7; transform: scale(1.1); }
    66% { opacity: 0.5; transform: scale(0.9); }
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(0,245,255,0.3);
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0,245,255,0.5);
  }
`;
document.head.appendChild(styleSheet);

export default ConsciousnessDashboard;
