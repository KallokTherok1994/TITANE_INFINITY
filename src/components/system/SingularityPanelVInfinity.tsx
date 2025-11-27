/**
 * TITANE∞ v20 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v20 — SINGULARITY PANEL v∞
 * Dashboard React pour SingularityState v∞ (20 moteurs unifiés)
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { SingularityBridgeVInfinity } from '@/services/singularityBridgeVInfinity';
import type {
  SingularityStateVInfinity,
  MetaCognitiveReport,
  IntegrityCheckResult,
} from '@/services/singularityBridgeVInfinity';
import './SingularityPanelVInfinity.css';

interface SelfTestResult {
  test_name: string;
  passed: boolean;
  score: number;
  details: string;
  recommendations: string[];
}

interface SelfTestReport {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  global_score: number;
  results: SelfTestResult[];
  critical_issues: string[];
  timestamp: string;
}

export const SingularityPanelVInfinity: React.FC = () => {
  const [state, setState] = useState<SingularityStateVInfinity | null>(null);
  const [metaReport, setMetaReport] = useState<MetaCognitiveReport | null>(null);
  const [integrityResult, setIntegrityResult] = useState<IntegrityCheckResult | null>(null);
  const [selfTestReport, setSelfTestReport] = useState<SelfTestReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'meta' | 'integrity' | 'selftest'>('overview');
  const [error, setError] = useState<string | null>(null);

  // Charger état initial
  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = await SingularityBridgeVInfinity.getState();
      setState(newState);
    } catch (err) {
      setError(`Failed to load state: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = await SingularityBridgeVInfinity.sync();
      setState(newState);
      alert('✅ Deep Sync complete!');
    } catch (err) {
      setError(`Sync failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMetaEval = async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await SingularityBridgeVInfinity.evaluateMeta();
      setMetaReport(report);
      setActiveTab('meta');
    } catch (err) {
      setError(`Meta evaluation failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrityCheck = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await SingularityBridgeVInfinity.verifyIntegrity();
      setIntegrityResult(result);
      setActiveTab('integrity');
    } catch (err) {
      setError(`Integrity check failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRepair = async () => {
    if (!confirm('⚠️ Execute auto-repair? This will attempt to fix corrupted state.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const newState = await SingularityBridgeVInfinity.repair();
      setState(newState);
      alert('✅ Auto-repair complete!');
      // Re-vérifier intégrité
      await handleIntegrityCheck();
    } catch (err) {
      setError(`Repair failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const { invoke } = await import('@tauri-apps/api/core');
      const report = await invoke<SelfTestReport>('singularity_selftest_full');
      setSelfTestReport(report);
      setActiveTab('selftest');
    } catch (err) {
      setError(`Self-test failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await SingularityBridgeVInfinity.downloadStateAsFile();
      alert('✅ State exported!');
    } catch (err) {
      setError(`Export failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFullCycle = async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = await SingularityBridgeVInfinity.fullCycle();
      setState(newState);
      alert('✅ Full cycle complete (Sync → Verify → Repair)!');
    } catch (err) {
      setError(`Full cycle failed: ${err}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCoherenceColor = (value: number): string => {
    if (value >= 0.8) return '#00ff88';
    if (value >= 0.6) return '#ffaa00';
    return '#ff4444';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#00ff88';
    if (score >= 60) return '#ffaa00';
    return '#ff4444';
  };

  if (loading && !state) {
    return (
      <div className="singularity-panel-vinfinity">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading SingularityState v∞...</p>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="singularity-panel-vinfinity">
        <div className="error-state">
          <p>❌ Failed to load state</p>
          <button onClick={loadState}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="singularity-panel-vinfinity">
      {/* HEADER */}
      <div className="panel-header">
        <h1>🌌 SingularityState v∞</h1>
        <p className="subtitle">20 Engines Unified — Global Coherent State</p>
        <div className="header-info">
          <span className="version">v{state.version}</span>
          <span className="hash" title={state.global_hash}>
            Hash: {state.global_hash.substring(0, 12)}...
          </span>
          <span className="timestamp">{new Date(state.updated_at).toLocaleString()}</span>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="error-banner">
          ❌ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ACTIONS */}
      <div className="panel-actions">
        <button onClick={loadState} disabled={loading} className="btn-primary">
          🔄 REFRESH
        </button>
        <button onClick={handleSync} disabled={loading} className="btn-sync">
          🌀 DEEP SYNC
        </button>
        <button onClick={handleMetaEval} disabled={loading} className="btn-meta">
          🧠 META EVAL
        </button>
        <button onClick={handleIntegrityCheck} disabled={loading} className="btn-integrity">
          🔐 INTEGRITY
        </button>
        <button onClick={handleSelfTest} disabled={loading} className="btn-test">
          🧪 SELF-TEST
        </button>
        <button onClick={handleRepair} disabled={loading} className="btn-repair">
          🔧 AUTO-REPAIR
        </button>
        <button onClick={handleFullCycle} disabled={loading} className="btn-cycle">
          ♾️ FULL CYCLE
        </button>
        <button onClick={handleExport} disabled={loading} className="btn-export">
          💾 EXPORT JSON
        </button>
      </div>

      {/* TABS */}
      <div className="panel-tabs">
        <button
          className={activeTab === 'overview' ? 'tab-active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={activeTab === 'modules' ? 'tab-active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          🔧 Modules (20)
        </button>
        <button
          className={activeTab === 'meta' ? 'tab-active' : ''}
          onClick={() => setActiveTab('meta')}
        >
          🧠 Meta Report
        </button>
        <button
          className={activeTab === 'integrity' ? 'tab-active' : ''}
          onClick={() => setActiveTab('integrity')}
        >
          🔐 Integrity
        </button>
        <button
          className={activeTab === 'selftest' ? 'tab-active' : ''}
          onClick={() => setActiveTab('selftest')}
        >
          🧪 Self-Test
        </button>
      </div>

      {/* CONTENT */}
      <div className="panel-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-overview">
            <div className="coherence-grid">
              <div className="coherence-card">
                <h3>Core Coherence</h3>
                <div
                  className="coherence-value"
                  style={{ color: getCoherenceColor(state.core.coherence_absolute) }}
                >
                  {(state.core.coherence_absolute * 100).toFixed(1)}%
                </div>
                <div className="coherence-bar">
                  <div
                    className="coherence-fill"
                    style={{
                      width: `${state.core.coherence_absolute * 100}%`,
                      backgroundColor: getCoherenceColor(state.core.coherence_absolute),
                    }}
                  ></div>
                </div>
              </div>

              <div className="coherence-card">
                <h3>Cognitive Coherence</h3>
                <div
                  className="coherence-value"
                  style={{ color: getCoherenceColor(state.cognitive.coherence) }}
                >
                  {(state.cognitive.coherence * 100).toFixed(1)}%
                </div>
                <div className="coherence-bar">
                  <div
                    className="coherence-fill"
                    style={{
                      width: `${state.cognitive.coherence * 100}%`,
                      backgroundColor: getCoherenceColor(state.cognitive.coherence),
                    }}
                  ></div>
                </div>
              </div>

              <div className="coherence-card">
                <h3>Meta Alignment</h3>
                <div
                  className="coherence-value"
                  style={{ color: getCoherenceColor(state.meta.alignment_score) }}
                >
                  {(state.meta.alignment_score * 100).toFixed(1)}%
                </div>
                <div className="coherence-bar">
                  <div
                    className="coherence-fill"
                    style={{
                      width: `${state.meta.alignment_score * 100}%`,
                      backgroundColor: getCoherenceColor(state.meta.alignment_score),
                    }}
                  ></div>
                </div>
              </div>

              <div className="coherence-card">
                <h3>Deep Sync Level</h3>
                <div
                  className="coherence-value"
                  style={{ color: getCoherenceColor(state.deep_sync.sync_level) }}
                >
                  {(state.deep_sync.sync_level * 100).toFixed(1)}%
                </div>
                <div className="coherence-bar">
                  <div
                    className="coherence-fill"
                    style={{
                      width: `${state.deep_sync.sync_level * 100}%`,
                      backgroundColor: getCoherenceColor(state.deep_sync.sync_level),
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Modules Synced</span>
                <span className="stat-value">{state.deep_sync.modules_synced}/20</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Memory Entries</span>
                <span className="stat-value">{state.memory.total_entries}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Timeline Events</span>
                <span className="stat-value">{state.timeline.total_events}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Watchdog Anomalies</span>
                <span className="stat-value">{state.watchdog.anomalies_detected}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Auto Repairs</span>
                <span className="stat-value">{state.watchdog.auto_repairs_count}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total XP</span>
                <span className="stat-value">{state.evolution.total_xp}</span>
              </div>
            </div>
          </div>
        )}

        {/* MODULES TAB */}
        {activeTab === 'modules' && (
          <div className="tab-modules">
            <div className="modules-grid">
              {[
                { name: 'Cognitive', data: state.cognitive, icon: '🧠' },
                { name: 'Memory', data: state.memory, icon: '💾' },
                { name: 'Timeline', data: state.timeline, icon: '⏱️' },
                { name: 'Meta', data: state.meta, icon: '🌀' },
                { name: 'DeepSync', data: state.deep_sync, icon: '🔗' },
                { name: 'Watchdog', data: state.watchdog, icon: '👁️' },
                { name: 'Analysis', data: state.analysis, icon: '📊' },
                { name: 'Documents', data: state.documents, icon: '📄' },
                { name: 'Search', data: state.search, icon: '🔍' },
                { name: 'Evolution', data: state.evolution, icon: '🌱' },
                { name: 'UI', data: state.ui, icon: '🎨' },
                { name: 'Audio', data: state.audio, icon: '🔊' },
                { name: 'System', data: state.system, icon: '⚙️' },
                { name: 'Integrity', data: state.integrity, icon: '🔐' },
                { name: 'Config', data: state.config, icon: '⚙️' },
                { name: 'Connection', data: state.connection, icon: '🌐' },
                { name: 'Sandbox', data: state.sandbox, icon: '🛡️' },
                { name: 'AI', data: state.ai, icon: '🤖' },
                { name: 'Backend', data: state.backend, icon: '🔧' },
                { name: 'Core', data: state.core, icon: '🌌' },
              ].map((module) => (
                <div key={module.name} className="module-card">
                  <div className="module-header">
                    <span className="module-icon">{module.icon}</span>
                    <span className="module-name">{module.name}</span>
                  </div>
                  <pre className="module-data">{JSON.stringify(module.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* META TAB */}
        {activeTab === 'meta' && (
          <div className="tab-meta">
            {metaReport ? (
              <>
                <div className="meta-scores">
                  <div className="meta-score-card">
                    <h3>Global Coherence</h3>
                    <div
                      className="score-value"
                      style={{ color: getCoherenceColor(metaReport.global_coherence) }}
                    >
                      {(metaReport.global_coherence * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="meta-score-card">
                    <h3>Alignment</h3>
                    <div
                      className="score-value"
                      style={{ color: getCoherenceColor(metaReport.alignment_score) }}
                    >
                      {(metaReport.alignment_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="meta-score-card">
                    <h3>Self-Awareness</h3>
                    <div
                      className="score-value"
                      style={{ color: getCoherenceColor(metaReport.self_awareness) }}
                    >
                      {(metaReport.self_awareness * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {metaReport.recommendations.length > 0 && (
                  <div className="meta-section">
                    <h3>📋 Recommendations</h3>
                    <ul>
                      {metaReport.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {metaReport.anomalies.length > 0 && (
                  <div className="meta-section anomalies">
                    <h3>⚠️ Anomalies</h3>
                    <ul>
                      {metaReport.anomalies.map((anomaly, i) => (
                        <li key={i}>{anomaly}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="meta-timestamp">
                  Generated: {new Date(metaReport.timestamp).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No meta report available</p>
                <button onClick={handleMetaEval}>Run Meta Evaluation</button>
              </div>
            )}
          </div>
        )}

        {/* INTEGRITY TAB */}
        {activeTab === 'integrity' && (
          <div className="tab-integrity">
            {integrityResult ? (
              <>
                <div className="integrity-status">
                  <div
                    className={`status-badge ${integrityResult.is_valid ? 'valid' : 'invalid'}`}
                  >
                    {integrityResult.is_valid ? '✅ VALID' : '❌ INVALID'}
                  </div>
                  <div className={`status-badge ${integrityResult.hash_matches ? 'valid' : 'invalid'}`}>
                    Hash: {integrityResult.hash_matches ? '✅ Match' : '❌ Mismatch'}
                  </div>
                </div>

                {integrityResult.corrupted_modules.length > 0 && (
                  <div className="integrity-section corrupted">
                    <h3>⚠️ Corrupted Modules</h3>
                    <ul>
                      {integrityResult.corrupted_modules.map((module, i) => (
                        <li key={i}>{module}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {integrityResult.repair_suggestions.length > 0 && (
                  <div className="integrity-section suggestions">
                    <h3>🔧 Repair Suggestions</h3>
                    <ul>
                      {integrityResult.repair_suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                    <button onClick={handleRepair} className="btn-repair-inline">
                      Execute Auto-Repair
                    </button>
                  </div>
                )}

                {integrityResult.is_valid && (
                  <div className="integrity-section valid">
                    <p>✅ System integrity verified. All modules operational.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>No integrity check performed</p>
                <button onClick={handleIntegrityCheck}>Run Integrity Check</button>
              </div>
            )}
          </div>
        )}

        {/* SELF-TEST TAB */}
        {activeTab === 'selftest' && (
          <div className="tab-selftest">
            {selfTestReport ? (
              <>
                <div className="selftest-summary">
                  <div className="summary-card">
                    <h3>Global Score</h3>
                    <div
                      className="score-big"
                      style={{ color: getScoreColor(selfTestReport.global_score) }}
                    >
                      {selfTestReport.global_score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="summary-card">
                    <h3>Tests Passed</h3>
                    <div className="score-big" style={{ color: '#00ff88' }}>
                      {selfTestReport.passed_tests}/{selfTestReport.total_tests}
                    </div>
                  </div>
                  <div className="summary-card">
                    <h3>Tests Failed</h3>
                    <div
                      className="score-big"
                      style={{ color: selfTestReport.failed_tests > 0 ? '#ff4444' : '#00ff88' }}
                    >
                      {selfTestReport.failed_tests}
                    </div>
                  </div>
                </div>

                {selfTestReport.critical_issues.length > 0 && (
                  <div className="selftest-section critical">
                    <h3>🚨 Critical Issues</h3>
                    <ul>
                      {selfTestReport.critical_issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="selftest-results">
                  <h3>Test Results</h3>
                  {selfTestReport.results.map((result, i) => (
                    <div
                      key={i}
                      className={`test-result-card ${result.passed ? 'passed' : 'failed'}`}
                    >
                      <div className="test-header">
                        <span className="test-name">
                          {result.passed ? '✅' : '❌'} {result.test_name}
                        </span>
                        <span
                          className="test-score"
                          style={{ color: getScoreColor(result.score) }}
                        >
                          {result.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="test-details">{result.details}</div>
                      {result.recommendations.length > 0 && (
                        <div className="test-recommendations">
                          <strong>Recommendations:</strong>
                          <ul>
                            {result.recommendations.map((rec, j) => (
                              <li key={j}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="selftest-timestamp">
                  Test run: {new Date(selfTestReport.timestamp).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>No self-test report available</p>
                <button onClick={handleSelfTest}>Run Self-Test</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingularityPanelVInfinity;
