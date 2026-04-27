/**
 * TITANE Remote Key Agent — Configuration & AI Panel
 *
 * data-testid stable:
 *   agent-config-panel, agent-config-model-select, agent-config-prompt-textarea
 *   agent-config-auto-rotate-input, agent-config-warn-input, agent-config-save-btn
 *   agent-config-reset-btn, agent-analyze-btn, agent-analysis-summary
 *   agent-analysis-recommendations, agent-analysis-anomaly, agent-rotation-warnings
 *   agent-suggest-labels-input, agent-suggest-labels-btn, agent-labels-result
 *   agent-training-status
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { AgentConfig } from '../../services/remoteKeyManager/AgentConfig';
import type { AiAnalysisResult } from '../../services/remoteKeyManager/AgentAI';
import { remoteKeyAgent } from '../../services/remoteKeyManager/RemoteKeyAgent';

const AVAILABLE_MODELS = [
  'gemma2:2b',
  'titane-key-agent',
  'qwen2.5:latest',
  'llama3.1:latest',
];

interface Props {
  className?: string;
}

export const AgentConfigPanel: React.FC<Props> = ({ className }) => {
  const [config, setConfig] = useState<AgentConfig>(() => remoteKeyAgent.getConfig());
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [labelCtx, setLabelCtx] = useState('');
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [rotationWarnings, setRotationWarnings] = useState<ReturnType<typeof remoteKeyAgent.getRotationWarnings>>([]);

  // Sync rotation warnings whenever state changes
  useEffect(() => {
    const unsub = remoteKeyAgent.onStateChange(() => {
      setRotationWarnings(remoteKeyAgent.getRotationWarnings());
      setAnalysis(remoteKeyAgent.state.lastAnalysis);
    });
    setRotationWarnings(remoteKeyAgent.getRotationWarnings());
    return unsub;
  }, []);

  const handleSave = useCallback(() => {
    const updated = remoteKeyAgent.configure(config);
    setConfig(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  const handleReset = useCallback(() => {
    const fresh = remoteKeyAgent.configure({});
    // Force reload from localStorage defaults
    const defaults = remoteKeyAgent.getConfig();
    setConfig(defaults);
    setSaved(false);
    void fresh;
  }, []);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    const result = await remoteKeyAgent.analyzeWithAI();
    setAnalysis(result);
    setAnalyzing(false);
  }, []);

  const handleSuggestLabels = useCallback(async () => {
    if (!labelCtx.trim()) return;
    setSuggestLoading(true);
    const result = await remoteKeyAgent.suggestLabels(labelCtx.trim());
    setSuggestedLabels(result.ok ? result.suggestions : [result.error ?? 'Erreur IA']);
    setSuggestLoading(false);
  }, [labelCtx]);

  const anomalyColor =
    analysis && analysis.ok
      ? analysis.anomalyScore >= 0.8
        ? '#ef4444'
        : analysis.anomalyScore >= 0.5
        ? '#f97316'
        : '#22c55e'
      : '#6b7280';

  return (
    <div
      data-testid="agent-config-panel"
      className={`agent-config-panel${className ? ` ${className}` : ''}`}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* ─── Training Status Badge ─────────────────────────────────────── */}
      <div data-testid="agent-training-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
        <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
          Agent: <strong style={{ color: '#e5e7eb' }}>titane-key-agent</strong> — modèle:{' '}
          <strong style={{ color: '#a78bfa' }}>{config.training.model}</strong>
        </span>
      </div>

      {/* ─── Rotation Warnings ────────────────────────────────────────── */}
      {rotationWarnings.length > 0 && (
        <div
          data-testid="agent-rotation-warnings"
          style={{
            background: '#1c1917',
            border: '1px solid #f97316',
            borderRadius: 8,
            padding: '0.75rem 1rem',
          }}
        >
          <p style={{ color: '#f97316', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            ⚠ {rotationWarnings.length} clé(s) à renouveler
          </p>
          {rotationWarnings.map((w) => (
            <div key={w.keyId} style={{ fontSize: '0.8rem', color: '#d1d5db', marginBottom: '0.25rem' }}>
              <span style={{ color: w.critical ? '#ef4444' : '#f97316' }}>
                {w.critical ? '🔴' : '🟠'}
              </span>{' '}
              <strong>{w.label}</strong> — {w.days} jour(s)
              {w.critical ? ' (rotation critique !)' : ' (avertissement)'}
            </div>
          ))}
        </div>
      )}

      {/* ─── AI Analysis ──────────────────────────────────────────────── */}
      <section>
        <h3 style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '0.75rem' }}>
          Analyse IA
        </h3>
        <button
          data-testid="agent-analyze-btn"
          onClick={handleAnalyze}
          disabled={analyzing}
          style={{
            background: analyzing ? '#374151' : '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.5rem 1.25rem',
            cursor: analyzing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}
        >
          {analyzing ? '⏳ Analyse en cours…' : '🧠 Analyser avec IA'}
        </button>

        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {!analysis.ok ? (
              <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                Erreur: {analysis.error}
              </p>
            ) : (
              <>
                <div
                  data-testid="agent-analysis-anomaly"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#9ca3af' }}>Score d'anomalie:</span>
                  <strong style={{ color: anomalyColor }}>
                    {(analysis.anomalyScore * 100).toFixed(0)}%
                  </strong>
                </div>
                <p
                  data-testid="agent-analysis-summary"
                  style={{ color: '#e5e7eb', fontSize: '0.875rem', lineHeight: 1.6 }}
                >
                  {analysis.summary}
                </p>
                {analysis.recommendations.length > 0 && (
                  <ul
                    data-testid="agent-analysis-recommendations"
                    style={{ paddingLeft: '1.25rem', color: '#d1d5db', fontSize: '0.85rem' }}
                  >
                    {analysis.recommendations.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* ─── Label Suggestions ────────────────────────────────────────── */}
      <section>
        <h3 style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '0.75rem' }}>
          Suggérer un label
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            data-testid="agent-suggest-labels-input"
            type="text"
            value={labelCtx}
            onChange={(e) => setLabelCtx(e.target.value)}
            placeholder="Décris l'usage de la clé…"
            style={{
              flex: 1,
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              padding: '0.5rem 0.75rem',
              color: '#e5e7eb',
              fontSize: '0.875rem',
            }}
          />
          <button
            data-testid="agent-suggest-labels-btn"
            onClick={handleSuggestLabels}
            disabled={suggestLoading || !labelCtx.trim()}
            style={{
              background: suggestLoading || !labelCtx.trim() ? '#374151' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: suggestLoading || !labelCtx.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {suggestLoading ? '…' : 'Suggérer'}
          </button>
        </div>
        {suggestedLabels.length > 0 && (
          <div
            data-testid="agent-labels-result"
            style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}
          >
            {suggestedLabels.map((l, i) => (
              <span
                key={i}
                style={{
                  background: '#1e3a5f',
                  border: '1px solid #2563eb',
                  borderRadius: 999,
                  padding: '0.25rem 0.75rem',
                  color: '#93c5fd',
                  fontSize: '0.8rem',
                }}
              >
                {l}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ─── Configuration ────────────────────────────────────────────── */}
      <section>
        <h3 style={{ color: '#a78bfa', fontWeight: 700, marginBottom: '0.75rem' }}>
          Configuration de l'agent
        </h3>

        <label style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
          Modèle IA
        </label>
        <select
          data-testid="agent-config-model-select"
          value={config.training.model}
          onChange={(e) =>
            setConfig((c) => ({ ...c, training: { ...c.training, model: e.target.value } }))
          }
          style={{
            width: '100%',
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            color: '#e5e7eb',
            marginBottom: '0.75rem',
          }}
        >
          {AVAILABLE_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
          Prompt système (training)
        </label>
        <textarea
          data-testid="agent-config-prompt-textarea"
          rows={5}
          value={config.training.systemPrompt}
          onChange={(e) =>
            setConfig((c) => ({ ...c, training: { ...c.training, systemPrompt: e.target.value } }))
          }
          style={{
            width: '100%',
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 6,
            padding: '0.5rem 0.75rem',
            color: '#e5e7eb',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            resize: 'vertical',
            marginBottom: '0.75rem',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
              Rotation auto (jours, 0=off)
            </label>
            <input
              data-testid="agent-config-auto-rotate-input"
              type="number"
              min={0}
              max={365}
              value={config.rotation.autoRotateDays}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  rotation: { ...c.rotation, autoRotateDays: parseInt(e.target.value) || 0 },
                }))
              }
              style={{
                width: '100%',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 6,
                padding: '0.5rem 0.75rem',
                color: '#e5e7eb',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>
              Alerte après (jours, 0=off)
            </label>
            <input
              data-testid="agent-config-warn-input"
              type="number"
              min={0}
              max={365}
              value={config.rotation.warnAfterDays}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  rotation: { ...c.rotation, warnAfterDays: parseInt(e.target.value) || 0 },
                }))
              }
              style={{
                width: '100%',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: 6,
                padding: '0.5rem 0.75rem',
                color: '#e5e7eb',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            data-testid="agent-config-save-btn"
            onClick={handleSave}
            style={{
              background: saved ? '#16a34a' : '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
              fontWeight: 700,
              transition: 'background 0.2s',
            }}
          >
            {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
          <button
            data-testid="agent-config-reset-btn"
            onClick={handleReset}
            style={{
              background: 'transparent',
              color: '#9ca3af',
              border: '1px solid #374151',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              cursor: 'pointer',
            }}
          >
            Réinitialiser
          </button>
        </div>
      </section>
    </div>
  );
};

export default AgentConfigPanel;
