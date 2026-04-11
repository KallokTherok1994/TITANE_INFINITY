/**
 * TITANE∞ v30.0.0 — Journal d'Exécution OMEGA
 * Tableau de bord vivant de raisonnement et d'exécution TITANE∞
 * Inspiré de: Claude (thinking traces), Grok (reasoning blocks),
 *             ChatGPT o1 (chain-of-thought), Gemini (deep research steps)
 * @license MIT
 */

import React, { useState } from 'react';
import {
  useDevToolsStore,
  type OmegaStep,
  type ReasoningTrace,
  type JournalEntry,
  type CognitiveState,
  type CognitiveStatus,
} from '../store/devtools.store';
import { SectionHeader } from '../components';

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────

const stepIcons: Record<string, string> = {
  input: '📥',
  normalize: '🔄',
  coherence: '🧩',
  memory: '🧠',
  engines: '⚙️',
  conversation: '💬',
  output: '📤',
  enrichment: '✨',
  reasoning: '🤔',
  classify: '🎯',
  provider: '🔌',
  execute: '⚡',
  reflect: '🔍',
};

const statusColors: Record<
  OmegaStep['status'],
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: 'var(--bg-surface, #181c21)',
    text: 'var(--text-muted, rgba(255,255,255,0.60))',
    border: 'var(--border, rgba(196,196,196,0.12))',
  },
  running: {
    bg: 'rgba(114, 123, 129, 0.15)',
    text: 'var(--text-info, #727b81)',
    border: 'var(--border-info, #727b81)',
  },
  complete: {
    bg: 'rgba(147, 179, 153, 0.15)',
    text: 'var(--text-success, #93b399)',
    border: 'var(--border-success, #93b399)',
  },
  error: {
    bg: 'rgba(139, 95, 95, 0.15)',
    text: 'var(--text-danger, #8b5f5f)',
    border: 'var(--border-danger, #8b5f5f)',
  },
};

const modeColors: Record<string, { bg: string; text: string; border: string }> = {
  OMEGA: { bg: 'rgba(130,80,200,0.18)', text: '#b48ef0', border: '#8250c8' },
  ARCHITECT: { bg: 'rgba(30,120,200,0.18)', text: '#7ab8f0', border: '#1e78c8' },
  DEEP_REASONING: { bg: 'rgba(200,120,30,0.18)', text: '#f0b87a', border: '#c87820' },
  CERTIFY: { bg: 'rgba(200,200,30,0.18)', text: '#f0f07a', border: '#c8c820' },
  CREATIVE: { bg: 'rgba(200,60,120,0.18)', text: '#f07ab0', border: '#c83c78' },
  default: { bg: 'rgba(100,100,100,0.18)', text: '#a0a0a0', border: '#646464' },
};

const DEFAULT_MODE_COLOR = modeColors.default as { bg: string; text: string; border: string };
function getModeColor(mode: string) {
  return modeColors[mode] ?? DEFAULT_MODE_COLOR;
}

const effortColors: Record<string, string> = {
  max: '#b48ef0',
  high: '#7ab8f0',
  medium: '#93b399',
  low: 'var(--text-muted, rgba(255,255,255,0.60))',
};

const statusIcons: Record<CognitiveStatus, string> = {
  idle: '⏸',
  thinking: '🤔',
  responding: '💬',
  reflecting: '🔍',
};

const statusLabels: Record<CognitiveStatus, string> = {
  idle: 'En attente',
  thinking: 'Raisonnement…',
  responding: 'Réponse…',
  reflecting: 'Réflexion…',
};

// ─────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────

/** Bandeau cognitif — état cognitif TITANE∞ en temps réel */
function CognitiveBanner({ state }: { state: CognitiveState }) {
  const mode = state.currentMode || 'default';
  const modeColor = getModeColor(mode);
  const effortColor = effortColors[state.effortLevel] ?? effortColors.medium;
  const isActive = state.status !== 'idle';

  return (
    <div
      className="p-4 rounded-lg border mb-4"
      style={{
        background: 'var(--bg-panel, #101216)',
        borderColor: 'var(--border, rgba(196,196,196,0.12))',
      }}
    >
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Status */}
        <div className="flex items-center gap-2">
          <span
            className={`text-lg ${isActive ? 'animate-pulse' : ''}`}
          >
            {statusIcons[state.status]}
          </span>
          <span
            className="text-sm font-semibold"
            style={{ color: isActive ? '#93b399' : 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {statusLabels[state.status]}
          </span>
        </div>

        {/* Mode badge */}
        <span
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={{ background: modeColor.bg, color: modeColor.text, border: `1px solid ${modeColor.border}` }}
        >
          ⚡ {mode}
        </span>

        {/* Provider badge */}
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: 'var(--bg-surface, #181c21)', color: 'var(--text-primary, #e0e0e0)', border: 'var(--border, rgba(196,196,196,0.12))' }}
        >
          🔌 {state.currentProvider}
        </span>

        {/* Effort level */}
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: 'var(--bg-surface, #181c21)', color: effortColor }}
        >
          🧠 Effort: {state.effortLevel}
        </span>
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Singularity coherence */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
              Cohérence Singularité
            </span>
            <span className="text-xs font-bold" style={{ color: '#b48ef0' }}>
              {state.singularityCoherence}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface, #181c21)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${state.singularityCoherence}%`,
                background: state.singularityCoherence > 80 ? '#b48ef0' : state.singularityCoherence > 60 ? '#7ab8f0' : '#8b5f5f',
              }}
            />
          </div>
        </div>

        {/* Processing load */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
              Charge cognitive
            </span>
            <span className="text-xs font-bold" style={{ color: state.processingLoad > 80 ? '#8b5f5f' : '#93b399' }}>
              {state.processingLoad}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface, #181c21)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${state.processingLoad}%`,
                background: state.processingLoad > 80 ? '#8b5f5f' : state.processingLoad > 60 ? '#f0b87a' : '#93b399',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Affichage d'une étape du pipeline avec détails */
function PipelineStepCard({
  step,
  index,
  total,
  totalDuration,
}: {
  step: OmegaStep;
  index: number;
  total: number;
  totalDuration: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const colors = statusColors[step.status];
  const icon = stepIcons[step.id] ?? '⚡';
  const isActive = step.status === 'running';

  return (
    <div className="relative">
      {/* Connector */}
      {index < total - 1 && (
        <div
          className="absolute left-6 top-14 w-0.5 h-6 -mt-2"
          style={{ background: step.status === 'complete' ? '#93b399' : 'var(--border, rgba(196,196,196,0.12))' }}
        />
      )}

      <div
        className={`p-4 rounded-lg border transition-all duration-300 ${isActive ? 'ring-2' : ''}`}
        style={{ background: colors.bg, borderColor: colors.border, '--tw-ring-color': isActive ? colors.border : undefined } as React.CSSProperties}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isActive ? 'animate-pulse' : ''}`}
            style={{ background: 'var(--bg-surface, #181c21)', border: `2px solid ${colors.border}` }}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-semibold" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
                {step.name}
              </h4>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
              >
                {step.status.toUpperCase()}
              </span>
            </div>

            {/* Duration bar */}
            {step.duration !== undefined && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Durée:
                </span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
                  {step.duration}ms
                </span>
                {step.duration > 0 && totalDuration > 0 && (
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface, #181c21)' }}>
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${Math.min((step.duration / totalDuration) * 100, 100)}%`, background: colors.border }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Engines */}
            {step.engines && step.engines.length > 0 && (
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Moteurs:
                </span>
                {step.engines.map(engine => (
                  <span
                    key={engine}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-surface, #181c21)', color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {engine}
                  </span>
                ))}
              </div>
            )}

            {/* Output summary (v30) */}
            {step.outputSummary && step.status === 'complete' && (
              <div>
                <button
                  onClick={() => setExpanded(e => !e)}
                  className="text-xs flex items-center gap-1 mb-1"
                  style={{ color: '#7ab8f0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {expanded ? '▼' : '▶'} Détails
                </button>
                {expanded && (
                  <div
                    className="text-xs p-2 rounded-md font-mono"
                    style={{ background: 'rgba(30,120,200,0.08)', color: 'var(--text-primary, #e0e0e0)', borderLeft: '2px solid #7ab8f0' }}
                  >
                    {step.outputSummary}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {step.error && (
              <div
                className="text-xs p-2 rounded-md mt-2 font-mono"
                style={{ background: 'rgba(139, 95, 95, 0.10)', color: '#8b5f5f' }}
              >
                {step.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Affichage de la trace de raisonnement — comme Claude "Thinking" */
function ReasoningTracePanel({ trace }: { trace: ReasoningTrace }) {
  const [collapsed, setCollapsed] = useState(false);
  const modeColor = getModeColor(trace.finalMode);
  const isComplete = !!trace.completedAt;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--bg-panel, #101216)', borderColor: '#8250c8' }}
    >
      {/* Header "Pensées de TITANE" */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(130,80,200,0.10)', border: 'none', cursor: 'pointer' }}
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-2">
          <span className={isComplete ? '' : 'animate-pulse'}>🤔</span>
          <span className="text-sm font-semibold" style={{ color: '#b48ef0' }}>
            Pensées de TITANE∞
          </span>
          {!isComplete && (
            <span className="text-xs px-2 py-0.5 rounded-full animate-pulse"
              style={{ background: 'rgba(130,80,200,0.25)', color: '#b48ef0' }}>
              EN COURS
            </span>
          )}
          {isComplete && (
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(147,179,153,0.20)', color: '#93b399' }}>
              ✓ TERMINÉ
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
            {trace.steps.length} étape{trace.steps.length > 1 ? 's' : ''}
            {isComplete && trace.completedAt
              ? ` · ${trace.completedAt - trace.startedAt}ms`
              : ''}
          </span>
          <span style={{ color: '#b48ef0' }}>{collapsed ? '▶' : '▼'}</span>
        </div>
      </button>

      {!collapsed && (
        <div className="p-4 space-y-3">
          {/* Reasoning steps */}
          {trace.steps.map((step, idx) => {
            const conf = step.confidence ?? 100;
            const confColor = conf > 80 ? '#93b399' : conf > 50 ? '#f0b87a' : '#8b5f5f';
            return (
              <div
                key={step.id}
                className="p-3 rounded-md"
                style={{ background: 'var(--bg-surface, #181c21)', borderLeft: '3px solid #8250c8' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: '#b48ef0' }}>
                    {idx + 1}. {step.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {step.durationMs !== undefined && (
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                        {step.durationMs}ms
                      </span>
                    )}
                    <span className="text-xs font-bold" style={{ color: confColor }}>
                      {conf}%
                    </span>
                  </div>
                </div>
                {/* Thought text */}
                <p className="text-xs mb-2" style={{ color: 'var(--text-primary, #e0e0e0)', lineHeight: 1.6 }}>
                  {step.thought}
                </p>
                {/* Decision badge */}
                {step.decision && (
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(130,80,200,0.20)', color: '#b48ef0', border: '1px solid #8250c8' }}
                  >
                    ➤ {step.decision}
                  </span>
                )}
                {/* Confidence bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-panel, #101216)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${conf}%`, background: confColor }}
                  />
                </div>
              </div>
            );
          })}

          {/* Summary row */}
          {isComplete && (
            <div
              className="p-3 rounded-md"
              style={{ background: 'rgba(130,80,200,0.08)', border: '1px solid rgba(130,80,200,0.30)' }}
            >
              <div className="flex flex-wrap gap-3 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: modeColor.bg, color: modeColor.text, border: `1px solid ${modeColor.border}` }}>
                  Mode: {trace.finalMode}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--bg-surface, #181c21)', color: 'var(--text-primary, #e0e0e0)' }}>
                  Provider: {trace.selectedProvider}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ color: effortColors[trace.effortLevel] ?? '#a0a0a0', background: 'var(--bg-surface, #181c21)' }}>
                  Effort: {trace.effortLevel}
                </span>
                {trace.singularityCoherence !== undefined && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-surface, #181c21)', color: '#b48ef0' }}>
                    Cohérence: {trace.singularityCoherence}%
                  </span>
                )}
              </div>
              {trace.keyConceptsExtracted && trace.keyConceptsExtracted.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs mr-1" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>Concepts:</span>
                  {trace.keyConceptsExtracted.map(c => (
                    <span key={c} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(114,123,129,0.20)', color: 'var(--text-primary, #e0e0e0)' }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {trace.reflectionNotes && (
                <p className="text-xs italic" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  💭 {trace.reflectionNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Carte d'entrée du journal */
function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);
  const modeColor = getModeColor(entry.mode);
  const ts = new Date(entry.timestamp).toLocaleTimeString();

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: 'var(--bg-panel, #101216)', borderColor: entry.success ? 'var(--border, rgba(196,196,196,0.12))' : '#8b5f5f' }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))', flexShrink: 0 }}>
          {ts}
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: modeColor.bg, color: modeColor.text, border: `1px solid ${modeColor.border}` }}>
          {entry.mode}
        </span>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
          {entry.provider}
        </span>
        <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
          {entry.requestPreview}
        </span>
        <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
          {entry.totalDurationMs}ms
        </span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: entry.success ? 'rgba(147,179,153,0.15)' : 'rgba(139,95,95,0.15)',
            color: entry.success ? '#93b399' : '#8b5f5f',
          }}
        >
          {entry.success ? 'OK' : 'ERR'}
        </span>
        <span style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))', fontSize: '0.75rem' }}>
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--border, rgba(196,196,196,0.08))' }}>
          {/* Request/Response preview */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                Requête
              </div>
              <div className="text-xs p-2 rounded-md font-mono" style={{ background: 'var(--bg-surface, #181c21)', color: 'var(--text-primary, #e0e0e0)' }}>
                {entry.requestPreview}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                Réponse TITANE
              </div>
              <div className="text-xs p-2 rounded-md font-mono" style={{ background: 'var(--bg-surface, #181c21)', color: 'var(--text-primary, #e0e0e0)' }}>
                {entry.responsePreview}
              </div>
            </div>
          </div>

          {/* Pipeline mini */}
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
              Pipeline
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.pipeline.map(step => {
                const c = statusColors[step.status];
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                    title={`${step.name}: ${step.duration ?? 0}ms`}
                  >
                    {stepIcons[step.id] ?? '⚡'} {step.name}
                    {step.duration !== undefined ? ` (${step.duration}ms)` : ''}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reasoning trace summary */}
          <ReasoningTracePanel trace={entry.reasoningTrace} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────

type JournalTab = 'execution' | 'reasoning' | 'journal';

/**
 * OmegaPipeline — Journal d'Exécution OMEGA v30
 * Tableau de bord vivant de raisonnement TITANE∞
 */
export function OmegaPipeline() {
  const {
    currentPipeline,
    pipelineHistory,
    cognitiveState,
    reasoningTrace,
    journalEntries,
    clearJournal,
  } = useDevToolsStore();

  const [activeTab, setActiveTab] = useState<JournalTab>('execution');

  const totalDuration = (currentPipeline || [])
    .filter(s => s.duration)
    .reduce((sum, s) => sum + (s.duration ?? 0), 0);

  const isLive = cognitiveState.status !== 'idle';

  const tabs: { id: JournalTab; label: string; icon: string }[] = [
    { id: 'execution', label: 'Exécution', icon: '⚡' },
    { id: 'reasoning', label: 'Raisonnement', icon: '🤔' },
    { id: 'journal', label: 'Journal', icon: '📖' },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Journal d'Exécution OMEGA"
        description="Tableau de bord vivant — raisonnement et exécution TITANE∞ v30"
        actions={
          <div className="flex items-center gap-3">
            {isLive && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#93b399' }} />
                <span className="text-xs font-medium" style={{ color: '#93b399' }}>LIVE</span>
              </div>
            )}
            <span className="text-xs" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
              {totalDuration}ms · {pipelineHistory.length} exec
            </span>
          </div>
        }
      />

      {/* Cognitive Banner */}
      <CognitiveBanner state={cognitiveState} />

      {/* Tab Navigation */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{ background: 'var(--bg-panel, #101216)', border: '1px solid var(--border, rgba(196,196,196,0.12))' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 text-sm py-2 px-3 rounded-md transition-all duration-200"
            style={{
              background: activeTab === tab.id ? 'var(--bg-elevated, #0b0d0f)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary, #e0e0e0)' : 'var(--text-muted, rgba(255,255,255,0.60))',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Exécution en Cours */}
      {activeTab === 'execution' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
            Exécution en Cours
          </h3>

          {(currentPipeline?.length ?? 0) === 0 ? (
            <div
              className="flex items-center justify-center h-48 rounded-lg border"
              style={{ background: 'var(--bg-panel, #101216)', borderColor: 'var(--border, rgba(196,196,196,0.12))' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">⏸</div>
                <p className="text-sm" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Aucune exécution en cours
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(currentPipeline || []).map((step, index) => (
                <PipelineStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  total={currentPipeline.length}
                  totalDuration={totalDuration}
                />
              ))}
            </div>
          )}

          {/* Live reasoning trace if active */}
          {reasoningTrace && !reasoningTrace.completedAt && (
            <div>
              <h3 className="text-base font-semibold mb-3" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
                Raisonnement Actif
              </h3>
              <ReasoningTracePanel trace={reasoningTrace} />
            </div>
          )}

          {/* Pipeline History mini */}
          {pipelineHistory.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
                Exécutions Récentes
              </h3>
              <div
                className="rounded-lg border overflow-hidden"
                style={{ background: 'var(--bg-panel, #101216)', borderColor: 'var(--border, rgba(196,196,196,0.12))' }}
              >
                {pipelineHistory.slice(0, 5).map((pipeline, historyIndex) => {
                  const dur = pipeline.filter(s => s.duration).reduce((sum, s) => sum + (s.duration ?? 0), 0);
                  const hasErrors = pipeline.some(s => s.status === 'error');
                  return (
                    <div
                      key={historyIndex}
                      className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0"
                      style={{ borderColor: 'var(--border, rgba(196,196,196,0.08))' }}
                    >
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                        #{pipelineHistory.length - historyIndex}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        {pipeline.map(step => (
                          <div
                            key={step.id}
                            className="w-8 h-2 rounded-full"
                            style={{ background: statusColors[step.status].border }}
                            title={`${step.name}: ${step.status}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
                        {dur}ms
                      </span>
                      {hasErrors && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(139,95,95,0.15)', color: '#8b5f5f' }}>
                          ERR
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Trace de Raisonnement */}
      {activeTab === 'reasoning' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
            Trace de Raisonnement TITANE∞
          </h3>

          {!reasoningTrace ? (
            <div
              className="flex items-center justify-center h-48 rounded-lg border"
              style={{ background: 'var(--bg-panel, #101216)', borderColor: 'var(--border, rgba(196,196,196,0.12))' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🤔</div>
                <p className="text-sm" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Aucune trace de raisonnement disponible
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  La trace apparaîtra lors de la prochaine exécution
                </p>
              </div>
            </div>
          ) : (
            <ReasoningTracePanel trace={reasoningTrace} />
          )}
        </div>
      )}

      {/* Tab: Journal */}
      {activeTab === 'journal' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
              Journal d'Exécution ({journalEntries.length} entrée{journalEntries.length > 1 ? 's' : ''})
            </h3>
            {journalEntries.length > 0 && (
              <button
                onClick={clearJournal}
                className="text-xs px-3 py-1 rounded-md"
                style={{
                  background: 'rgba(139,95,95,0.15)',
                  color: '#8b5f5f',
                  border: '1px solid #8b5f5f',
                  cursor: 'pointer',
                }}
              >
                Effacer
              </button>
            )}
          </div>

          {journalEntries.length === 0 ? (
            <div
              className="flex items-center justify-center h-48 rounded-lg border"
              style={{ background: 'var(--bg-panel, #101216)', borderColor: 'var(--border, rgba(196,196,196,0.12))' }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📖</div>
                <p className="text-sm" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Journal vide
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}>
                  Les entrées apparaîtront après chaque exécution OMEGA
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {journalEntries.map(entry => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
