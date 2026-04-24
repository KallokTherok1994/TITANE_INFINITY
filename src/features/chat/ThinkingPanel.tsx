/**
 * TITANE∞ v30.0.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ThinkingPanel — Journal d'Exécution OMEGA (v3 - Premium)
 * 3 modes : Essentiel | Détaillé | Expert
 * Source-driven : affiche uniquement les données réellement disponibles dans les props
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Ban,
  X,
  Cpu,
  BarChart3,
  Layers,
  Zap,
  Database,
  Globe,
} from 'lucide-react';
import './ThinkingPanel.css';

interface ThinkingStep {
  id: string;
  type: 'analysis' | 'reasoning' | 'synthesis' | 'validation';
  content: string;
  status: 'idle' | 'pending' | 'active' | 'complete' | 'done' | 'error' | 'blocked';
  timestamp: number;
}

interface ThinkingTopologyNode {
  id: string;
  label: string;
  status: 'active' | 'done' | 'error' | 'blocked';
}

/** Trace XP réelle : source = useExperience() dans Chat.tsx */
interface OmegaXPTrace {
  chatXP: number;
  cognitiveXP: number;
  totalXP: number;
  level: number;
  chatGainAmount?: number;
  cognitiveGainAmount?: number;
  totalGainAmount?: number;
  lastGainDomain?: string;
  lastGainAmount?: number;
  lastGainTimestamp?: number;
}

/** Trace mémoire / contexte : déduite du debug entry + sources statiques connues */
interface OmegaMemoryTrace {
  injected: boolean; // systemPrompt toujours construit avec 6 sources
  savedAfter: boolean; // saveMessage() appelé si status === 'success'
  systemPromptSources: string[];
}

interface ThinkingAction {
  label: string;
  status: 'done' | 'skipped' | 'error';
}

interface ThinkingPanelProps {
  isThinking: boolean;
  steps?: ThinkingStep[];
  onClose?: () => void;
  compact?: boolean; // Mode compact par défaut (v2)
  inline?: boolean; // Mode inline dans le message (v2)
  provider?: string; // Provider utilisé (ex: "GPT-4o", "Claude", "Gemini", "Local") (v2.1)
  elapsedTime?: number; // Temps écoulé en secondes (v2.1)
  modeLabel?: string | null;
  searchLabel?: string | null;
  saveLabel?: string | null;
  state?: 'idle' | 'active' | 'done' | 'error' | 'blocked';
  topology?: ThinkingTopologyNode[];
  // ── Nouvelles dimensions OMEGA v4 ──────────────────────────────
  xpTrace?: OmegaXPTrace | null;
  memoryTrace?: OmegaMemoryTrace | null;
  qualityScore?: number | null;
  autoHealed?: boolean;
  messageLength?: number;
  responseLength?: number;
  // ── OMEGA v4.1: Reasoning & Actions ──────────────────────────
  reasoningSummary?: string | null;
  actionsPerformed?: ThinkingAction[];
  modelUsed?: string;
  modelRequested?: string;
}

type ViewMode = 'essentiel' | 'detaille' | 'expert';

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({
  isThinking,
  steps = [],
  onClose,
  compact = true,
  inline = false,
  provider,
  elapsedTime,
  modeLabel,
  searchLabel,
  saveLabel,
  state,
  topology = [],
  xpTrace,
  memoryTrace,
  qualityScore,
  autoHealed,
  messageLength,
  responseLength,
  reasoningSummary,
  actionsPerformed,
  modelUsed,
  modelRequested,
}) => {
  const resolvedState: 'idle' | 'active' | 'done' | 'error' | 'blocked' =
    state ??
    (isThinking
      ? 'active'
      : steps.some(s => s.status === 'error')
        ? 'error'
        : steps.some(s => s.status === 'blocked')
          ? 'blocked'
          : steps.length > 0
            ? 'done'
            : 'idle');

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('essentiel');

  useEffect(() => {
    const activeStep = steps.find(s => s.status === 'active');
    if (activeStep) {
      setExpandedSteps(prev => new Set([...prev, activeStep.id]));
    }
  }, [steps]);

  const getProviderIcon = (providerName: string): string => {
    const name = providerName.toLowerCase();
    if (name.includes('gpt') || name.includes('openai')) return '✨';
    if (name.includes('claude') || name.includes('anthropic')) return '🧠';
    if (name.includes('gemini') || name.includes('google')) return '🤖';
    if (name.includes('ollama')) return '🦉';
    if (name.includes('local')) return '🏠';
    return '⚡';
  };

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedSteps(new Set(steps.map(s => s.id)));
  const collapseAll = () => setExpandedSteps(new Set());

  const getStepTypeLabel = (type: ThinkingStep['type']) => {
    switch (type) {
      case 'analysis':
        return 'Analyse';
      case 'reasoning':
        return 'Raisonnement';
      case 'synthesis':
        return 'Synthèse';
      case 'validation':
        return 'Validation';
      default:
        return 'Réflexion';
    }
  };

  const getStepStatusIcon = (status: ThinkingStep['status']) => {
    switch (status) {
      case 'active':
        return <Loader2 className="oj-icon-spin oj-icon-blue" size={14} />;
      case 'complete':
      case 'done':
        return <Check className="oj-icon-green" size={14} />;
      case 'error':
        return <AlertCircle className="oj-icon-red" size={14} />;
      case 'blocked':
        return <Ban className="oj-icon-orange" size={14} />;
      default:
        return <div className="oj-step-dot" />;
    }
  };

  const getStateLabel = () => {
    switch (resolvedState) {
      case 'active':
        return 'En cours';
      case 'done':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      case 'blocked':
        return 'Bloqué';
      default:
        return 'Inactif';
    }
  };

  const doneSteps = steps.filter(
    s => s.status === 'complete' || s.status === 'done'
  ).length;
  const errorSteps = steps.filter(s => s.status === 'error').length;
  const durationDisplay = elapsedTime !== undefined ? `${elapsedTime.toFixed(1)}s` : null;
  const resolvedModeLabel = modeLabel?.trim()
    ? modeLabel
    : isThinking
      ? 'Execution en cours'
      : 'Mode runtime indisponible';
  const resolvedSearchLabel = searchLabel?.trim()
    ? searchLabel
    : 'Aucune trace de recherche web capturee';
  const resolvedSaveLabel = saveLabel?.trim()
    ? saveLabel
    : resolvedState === 'error'
      ? 'Sauvegarde interrompue par erreur pipeline'
      : 'Aucun statut de sauvegarde capture';
  const systemPromptSourceCount = memoryTrace?.systemPromptSources?.length ?? 0;
  const systemPromptSourcesLabel =
    systemPromptSourceCount > 0
      ? `${systemPromptSourceCount} source${systemPromptSourceCount > 1 ? 's' : ''} contexte injectee${systemPromptSourceCount > 1 ? 's' : ''}`
      : 'Aucune source contexte capturee';
  const chatGainAmount =
    xpTrace?.chatGainAmount ??
    (xpTrace?.lastGainDomain === 'chat' ? xpTrace.lastGainAmount : undefined);
  const cognitiveGainAmount = xpTrace?.cognitiveGainAmount;
  const totalGainAmount =
    xpTrace?.totalGainAmount ??
    (chatGainAmount !== undefined || cognitiveGainAmount !== undefined
      ? (chatGainAmount ?? 0) + (cognitiveGainAmount ?? 0)
      : undefined);

  const renderXpGain = () => {
    if (!xpTrace) {
      return <span className="oj-non-capture">Aucun XP capture sur ce tour</span>;
    }

    return (
      <>
        {chatGainAmount !== undefined ? (
          <span className="oj-xp-gain">+{chatGainAmount} XP</span>
        ) : (
          <span className="oj-non-capture">Gain Chat non capture</span>
        )}{' '}
        Chat
        {cognitiveGainAmount !== undefined && (
          <>
            {' '}
            · <span className="oj-xp-gain">+{cognitiveGainAmount} XP</span> Cognitif
          </>
        )}
      </>
    );
  };

  // ── Mode compact ─────────────────────────────────────────────────────────
  if (!isExpanded) {
    return (
      <AnimatePresence>
        <motion.div
          className={`thinking-panel-compact ${inline ? 'thinking-panel-inline' : ''}`}
          data-testid="reasoning-progress"
          data-state={resolvedState}
          data-runtime-mode={resolvedModeLabel}
          data-runtime-duration={durationDisplay ?? ''}
          data-runtime-search={resolvedSearchLabel}
          data-runtime-save={resolvedSaveLabel}
          data-runtime-sources={systemPromptSourcesLabel}
          data-runtime-quality={
            qualityScore !== null && qualityScore !== undefined
              ? `${(qualityScore * 100).toFixed(0)}%`
              : ''
          }
          data-runtime-xp-gain={
            totalGainAmount !== undefined ? String(totalGainAmount) : ''
          }
          data-model-used={modelUsed ?? ''}
          data-model-requested={modelRequested ?? ''}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsExpanded(true)}
          role="button"
          tabIndex={0}
          aria-label="Ouvrir le Journal d'Exécution OMEGA"
          onKeyDown={e => e.key === 'Enter' && setIsExpanded(true)}
        >
          <div className="thinking-compact-content">
            {isThinking ? (
              <>
                <Loader2 className="thinking-compact-icon spin" size={14} />
                <span className="thinking-compact-text">
                  OMEGA réfléchit{durationDisplay ? ` (${durationDisplay})` : '…'}
                </span>
              </>
            ) : (
              <>
                <Brain className="thinking-compact-icon" size={14} />
                <span className="thinking-compact-text">
                  {doneSteps} étape{doneSteps !== 1 ? 's' : ''}
                  {errorSteps > 0
                    ? ` · ${errorSteps} erreur${errorSteps !== 1 ? 's' : ''}`
                    : ''}
                </span>
              </>
            )}
            {provider && (
              <span className="thinking-provider-badge" title={`Provider : ${provider}`}>
                {getProviderIcon(provider)} {provider}
              </span>
            )}
            <span
              className="oj-badge oj-badge--state"
              data-testid="reasoning-status-label"
              data-state={resolvedState}
            >
              {getStateLabel()}
            </span>
            <ChevronDown className="thinking-compact-chevron" size={14} />
          </div>
          {topology.length > 0 && (
            <div className="thinking-topology" data-testid="reasoning-topology" hidden>
              {topology.map(node => (
                <span
                  key={node.id}
                  className={`thinking-topology-node ${node.status}`}
                  data-testid="reasoning-topology-node"
                  data-node-id={node.id}
                  data-node-status={node.status}
                >
                  {node.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Journal OMEGA étendu ─────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <motion.div
        className={`thinking-panel oj-journal ${inline ? 'thinking-panel-inline' : ''}`}
        data-testid="reasoning-progress"
        data-state={resolvedState}
        data-runtime-mode={resolvedModeLabel}
        data-runtime-duration={durationDisplay ?? ''}
        data-runtime-search={resolvedSearchLabel}
        data-runtime-save={resolvedSaveLabel}
        data-runtime-sources={systemPromptSourcesLabel}
        data-runtime-quality={
          qualityScore !== null && qualityScore !== undefined
            ? `${(qualityScore * 100).toFixed(0)}%`
            : ''
        }
        data-runtime-xp-gain={
          totalGainAmount !== undefined ? String(totalGainAmount) : ''
        }
        data-model-used={modelUsed ?? ''}
        data-model-requested={modelRequested ?? ''}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
      >
        {/* ── En-tête ─────────────────────────────────────────────── */}
        <div className="oj-header">
          <div className="oj-header-left">
            <Brain size={18} className="oj-header-icon" />
            <span className="oj-header-title">Journal d'Exécution OMEGA</span>
            <span
              className="oj-badge oj-badge--state"
              data-testid="reasoning-status-label"
              data-state={resolvedState}
            >
              {isThinking ? (
                <>
                  <Loader2
                    size={11}
                    className="oj-icon-spin"
                    style={{ marginRight: 3 }}
                  />
                  {getStateLabel()}
                </>
              ) : (
                getStateLabel()
              )}
            </span>
            {durationDisplay && (
              <span className="oj-badge oj-badge--neutral">⏱ {durationDisplay}</span>
            )}
            {provider && (
              <span className="oj-badge oj-badge--provider">
                {getProviderIcon(provider)} {provider}
              </span>
            )}
            <span className="oj-badge oj-badge--neutral">
              {steps.length} étape{steps.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="oj-header-right">
            {/* Mode switcher */}
            <div className="oj-mode-switcher">
              {(['essentiel', 'detaille', 'expert'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  className={`oj-mode-btn${viewMode === mode ? ' oj-mode-btn--active' : ''}`}
                  onClick={() => setViewMode(mode)}
                  title={
                    mode === 'essentiel'
                      ? 'Vue essentielle'
                      : mode === 'detaille'
                        ? 'Vue détaillée'
                        : 'Vue expert'
                  }
                >
                  {mode === 'essentiel'
                    ? 'Essentiel'
                    : mode === 'detaille'
                      ? 'Détaillé'
                      : 'Expert'}
                </button>
              ))}
            </div>
            <button className="oj-ctrl-btn" onClick={expandAll} title="Tout développer">
              ▼▼
            </button>
            <button className="oj-ctrl-btn" onClick={collapseAll} title="Tout réduire">
              ▲▲
            </button>
            <button
              className="oj-ctrl-btn"
              onClick={() => setIsExpanded(false)}
              title="Réduire le journal"
            >
              <ChevronUp size={15} />
            </button>
            {onClose && (
              <button className="oj-ctrl-btn" onClick={onClose} title="Fermer">
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* ── Corps scrollable ─────────────────────────────────── */}
        <div className="oj-journal-body">
          {/* ── Résumé exécutif (Essentiel / Détaillé / Expert) ─────── */}
          <div className="oj-summary">
            <div className="oj-summary-row">
              <Sparkles size={14} className="oj-icon-blue" />
              <span className="oj-summary-label">Intention détectée :</span>
              <span className="oj-summary-value">
                {isThinking
                  ? 'Traitement en cours…'
                  : steps.length > 0
                    ? 'Réponse à la demande utilisateur'
                    : 'Aucune trace disponible'}
              </span>
            </div>
            <div className="oj-summary-row">
              <BarChart3 size={14} className="oj-icon-blue" />
              <span className="oj-summary-label">Résultat :</span>
              <span className="oj-summary-value">
                {resolvedState === 'done'
                  ? `${doneSteps} étape${doneSteps !== 1 ? 's' : ''} complétée${doneSteps !== 1 ? 's' : ''}${qualityScore !== null && qualityScore !== undefined ? ` · Qualité ${(qualityScore * 100).toFixed(0)}%` : ''}${autoHealed ? ' · ✦ Auto-guéri' : ''}`
                  : resolvedState === 'error'
                    ? 'Échec détecté'
                    : resolvedState === 'active'
                      ? 'En cours de traitement'
                      : 'Inactif'}
              </span>
            </div>
            {(messageLength !== undefined || responseLength !== undefined) && (
              <div className="oj-summary-row">
                <Cpu size={14} className="oj-icon-blue" />
                <span className="oj-summary-label">Volume :</span>
                <span className="oj-summary-value">
                  {messageLength !== undefined ? `${messageLength} car. envoyés` : ''}
                  {messageLength !== undefined && responseLength !== undefined
                    ? ' · '
                    : ''}
                  {responseLength !== undefined ? `${responseLength} car. reçus` : ''}
                </span>
              </div>
            )}
            {xpTrace && !isThinking && (
              <div className="oj-summary-row" data-testid="reasoning-summary-xp">
                <Zap size={14} className="oj-icon-yellow" />
                <span className="oj-summary-label">XP gagné :</span>
                <span className="oj-summary-value">
                  {renderXpGain()} — Niveau {xpTrace.level} · Total{' '}
                  {xpTrace.totalXP.toLocaleString('fr-FR')} XP
                </span>
              </div>
            )}
            {memoryTrace && !isThinking && (
              <div className="oj-summary-row">
                <Database size={14} className="oj-icon-blue" />
                <span className="oj-summary-label">Mémoire :</span>
                <span className="oj-summary-value">
                  {memoryTrace.injected ? '✓ Contexte injecté' : '—'}
                  {' · '}
                  {memoryTrace.savedAfter
                    ? '✓ Message sauvegardé'
                    : resolvedState === 'error'
                      ? '✗ Non sauvegardé'
                      : '—'}
                </span>
              </div>
            )}
            <div className="oj-summary-row">
              <Cpu size={14} className="oj-icon-blue" />
              <span className="oj-summary-label">Modèle utilisé :</span>
              <span
                className="oj-summary-value"
                data-testid="reasoning-summary-model"
                data-model-used={modelUsed ?? ''}
                data-model-requested={modelRequested ?? ''}
              >
                {modelUsed ? (
                  modelUsed
                ) : (
                  <span className="oj-non-capture">Non capturé</span>
                )}
                {modelRequested && modelRequested !== modelUsed && (
                  <span className="oj-model-requested">(demandé : {modelRequested})</span>
                )}
              </span>
            </div>
            <div className="oj-summary-row oj-summary-row--caption">
              <Globe size={11} className="oj-icon-muted" />
              <span className="oj-non-capture">
                Recherche en ligne : {resolvedSearchLabel} · Sources contexte :{' '}
                <span className={systemPromptSourceCount > 0 ? '' : 'oj-non-capture'}>
                  {systemPromptSourcesLabel}
                </span>{' '}
                · Commandes IPC : conversation_generate (toujours)
              </span>
            </div>
            {/* ── OMEGA v4.1: Reasoning summary ──────────────────── */}
            {reasoningSummary && !isThinking && (
              <div className="oj-summary-row">
                <Brain size={14} className="oj-icon-blue" />
                <span className="oj-summary-label">Raisonnement :</span>
                <span className="oj-summary-value">{reasoningSummary}</span>
              </div>
            )}
            {/* ── OMEGA v4.1: Actions effectuées ─────────────────── */}
            {actionsPerformed && actionsPerformed.length > 0 && !isThinking && (
              <div className="oj-summary-row">
                <Layers size={14} className="oj-icon-blue" />
                <span className="oj-summary-label">Actions :</span>
                <span className="oj-summary-value">
                  {actionsPerformed.map((action, i) => (
                    <span key={i}>
                      {i > 0 && ' · '}
                      {action.status === 'done' && '✓ '}
                      {action.status === 'skipped' && '— '}
                      {action.status === 'error' && '✗ '}
                      {action.label}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* ── Timeline des étapes (Détaillé / Expert) ─────────────── */}
          {(viewMode === 'detaille' || viewMode === 'expert') && (
            <div className="oj-section">
              <div className="oj-section-title">
                <Layers size={14} /> Timeline d'exécution
              </div>
              <div className="oj-steps">
                {steps.length === 0 && isThinking && (
                  <div className="oj-step-placeholder">
                    <Loader2 size={18} className="oj-icon-spin oj-icon-blue" />
                    <span>OMEGA analyse votre demande…</span>
                  </div>
                )}
                {steps.length === 0 && !isThinking && (
                  <div className="oj-step-placeholder oj-non-capture">
                    Aucune étape capturée pour ce tour
                  </div>
                )}
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={`thinking-step oj-step ${step.status}`}
                    data-testid={`reasoning-step-${step.type}`}
                    data-step-status={step.status}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div
                      className="oj-step-header"
                      onClick={() => toggleStep(step.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && toggleStep(step.id)}
                    >
                      <span className="oj-step-num">{index + 1}</span>
                      {getStepStatusIcon(step.status)}
                      <span className="oj-step-type">{getStepTypeLabel(step.type)}</span>
                      <span className="oj-step-preview">
                        {expandedSteps.has(step.id)
                          ? ''
                          : step.content.slice(0, 60) +
                            (step.content.length > 60 ? '…' : '')}
                      </span>
                      {viewMode === 'expert' && (
                        <span className="oj-step-id">#{step.id.slice(-6)}</span>
                      )}
                      <span className="oj-step-chevron">
                        {expandedSteps.has(step.id) ? (
                          <ChevronUp size={13} />
                        ) : (
                          <ChevronDown size={13} />
                        )}
                      </span>
                    </div>
                    <AnimatePresence>
                      {expandedSteps.has(step.id) && (
                        <motion.div
                          className="thinking-step-content oj-step-body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <p className="oj-step-content-text">{step.content}</p>
                          {viewMode === 'expert' && (
                            <div className="oj-step-meta">
                              <span>ID : {step.id}</span>
                              <span>Statut : {step.status}</span>
                              <span>ts : {step.timestamp}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Runtime & Capacités (Détaillé / Expert) ─────────────── */}
          {(viewMode === 'detaille' || viewMode === 'expert') && (
            <div className="oj-section oj-section--runtime">
              <div className="oj-section-title">
                <Cpu size={14} /> Runtime &amp; Capacités
              </div>
              <div className="oj-runtime-grid">
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Provider</span>
                  <span className="oj-runtime-value">
                    {provider ? (
                      <>
                        {getProviderIcon(provider)} {provider}
                      </>
                    ) : (
                      <span className="oj-non-capture">NON CAPTURÉ</span>
                    )}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Modèle utilisé</span>
                  <span
                    className="oj-runtime-value"
                    data-testid="reasoning-runtime-model"
                    data-model-used={modelUsed ?? ''}
                    data-model-requested={modelRequested ?? ''}
                  >
                    {modelUsed ? (
                      modelUsed
                    ) : (
                      <span className="oj-non-capture">Non capturé</span>
                    )}
                    {modelRequested && modelRequested !== modelUsed && (
                      <span className="oj-model-requested">
                        (demandé : {modelRequested})
                      </span>
                    )}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Mode</span>
                  <span className="oj-runtime-value" data-testid="reasoning-runtime-mode">
                    {resolvedModeLabel}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Durée</span>
                  <span
                    className="oj-runtime-value"
                    data-testid="reasoning-runtime-duration"
                  >
                    {durationDisplay ?? (
                      <span className="oj-non-capture">Aucune duree capturee</span>
                    )}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Étapes</span>
                  <span className="oj-runtime-value">
                    {steps.length} ({doneSteps} ✓
                    {errorSteps > 0 ? `, ${errorSteps} ✗` : ''})
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">XP gagné</span>
                  <span className="oj-runtime-value" data-testid="reasoning-runtime-xp">
                    {renderXpGain()}
                  </span>
                </div>
                {totalGainAmount !== undefined && (
                  <div className="oj-runtime-item">
                    <span className="oj-runtime-label">Gain total du tour</span>
                    <span
                      className="oj-runtime-value"
                      data-testid="reasoning-runtime-xp-total"
                    >
                      +{totalGainAmount} XP
                    </span>
                  </div>
                )}
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Score qualité</span>
                  <span
                    className="oj-runtime-value"
                    data-testid="reasoning-runtime-quality"
                  >
                    {qualityScore !== null && qualityScore !== undefined ? (
                      `${(qualityScore * 100).toFixed(0)}%`
                    ) : (
                      <span className="oj-non-capture">
                        Score qualite non evalue sur ce tour
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Topology (Expert uniquement) */}
              {viewMode === 'expert' && topology.length > 0 && (
                <div className="oj-topology-wrap">
                  <span className="oj-section-subtitle">Topologie d'exécution</span>
                  <div className="thinking-topology" data-testid="reasoning-topology">
                    {topology.map(node => (
                      <span
                        key={node.id}
                        className={`thinking-topology-node ${node.status}`}
                        data-testid="reasoning-topology-node"
                        data-node-id={node.id}
                        data-node-status={node.status}
                        title={`ID : ${node.id} | Statut : ${node.status}`}
                      >
                        {node.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── XP & Progression (Détaillé / Expert) ────────────────── */}
          {(viewMode === 'detaille' || viewMode === 'expert') && (
            <div className="oj-section oj-section--xp">
              <div className="oj-section-title">
                <Zap size={14} /> XP &amp; Progression
              </div>
              {xpTrace ? (
                <div className="oj-xp-block">
                  <div className="oj-runtime-grid">
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">Gain par message</span>
                      <span className="oj-runtime-value">{renderXpGain()}</span>
                    </div>
                    {totalGainAmount !== undefined && (
                      <div className="oj-runtime-item">
                        <span className="oj-runtime-label">Gain total du tour</span>
                        <span className="oj-runtime-value">+{totalGainAmount} XP</span>
                      </div>
                    )}
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">XP Chat cumulé</span>
                      <span className="oj-runtime-value">
                        {xpTrace.chatXP.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">XP Cognitif cumulé</span>
                      <span className="oj-runtime-value">
                        {xpTrace.cognitiveXP.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">XP Total</span>
                      <span className="oj-runtime-value">
                        {xpTrace.totalXP.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">Niveau global</span>
                      <span className="oj-runtime-value">{xpTrace.level}</span>
                    </div>
                    <div className="oj-runtime-item">
                      <span className="oj-runtime-label">Persistance XP</span>
                      <span className="oj-runtime-value">
                        Tauri IPC · localStorage (fallback)
                      </span>
                    </div>
                  </div>
                  {viewMode === 'expert' &&
                    xpTrace.lastGainDomain &&
                    xpTrace.lastGainAmount !== undefined && (
                      <div className="oj-xp-last">
                        <span className="oj-runtime-label">
                          Dernier gain enregistré :
                        </span>
                        <span className="oj-runtime-value">
                          <span className="oj-xp-gain">+{xpTrace.lastGainAmount} XP</span>{' '}
                          · domaine <em>{xpTrace.lastGainDomain}</em>
                          {xpTrace.lastGainTimestamp
                            ? ` · ${new Date(xpTrace.lastGainTimestamp).toLocaleTimeString('fr-FR')}`
                            : ''}
                        </span>
                      </div>
                    )}
                </div>
              ) : (
                <div className="oj-step-placeholder oj-non-capture">
                  Aucune donnee XP capturee pour ce tour
                </div>
              )}
            </div>
          )}

          {/* ── Contexte & Mémoire (Détaillé / Expert) ──────────────── */}
          {(viewMode === 'detaille' || viewMode === 'expert') && (
            <div className="oj-section oj-section--memory">
              <div className="oj-section-title">
                <Database size={14} /> Contexte &amp; Mémoire
              </div>
              <div className="oj-runtime-grid">
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Mémoire injectée</span>
                  <span className="oj-runtime-value">
                    {memoryTrace?.injected ? (
                      <span className="oj-icon-green">
                        ✓ Oui - contexte canonique lie
                      </span>
                    ) : (
                      <span className="oj-non-capture">
                        Aucun contexte injecte detecte sur ce tour
                      </span>
                    )}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Message sauvegardé</span>
                  <span
                    className={`oj-runtime-value${
                      memoryTrace?.savedAfter ? ' oj-icon-green' : ''
                    }`}
                    data-testid="reasoning-memory-save"
                  >
                    {memoryTrace?.savedAfter
                      ? `✓ ${resolvedSaveLabel}`
                      : resolvedSaveLabel}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Recherche en ligne</span>
                  <span
                    className="oj-runtime-value"
                    data-testid="reasoning-memory-search"
                  >
                    {resolvedSearchLabel}
                  </span>
                </div>
                <div className="oj-runtime-item">
                  <span className="oj-runtime-label">Sources contexte</span>
                  <span
                    className={`oj-runtime-value${systemPromptSourceCount > 0 ? '' : ' oj-non-capture'}`}
                    data-testid="reasoning-memory-sources"
                  >
                    {systemPromptSourcesLabel}
                  </span>
                </div>
              </div>
              {viewMode === 'expert' &&
                memoryTrace?.systemPromptSources &&
                memoryTrace.systemPromptSources.length > 0 && (
                  <div className="oj-sources-list">
                    <span className="oj-section-subtitle">
                      Sources runtime assemblees pour ce tour :
                    </span>
                    {memoryTrace.systemPromptSources.map((src, i) => (
                      <div key={i} className="oj-source-item">
                        <span className="oj-icon-green">✓</span>
                        <span>{src}</span>
                      </div>
                    ))}
                    <div className="oj-source-item oj-source-item--nc">
                      <span className="oj-non-capture">—</span>
                      <span className="oj-non-capture">
                        Handler IPC principal : conversation_generate
                      </span>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ── Essentiel : version condensée ───────────────────────── */}
          {viewMode === 'essentiel' && (
            <div className="oj-section oj-section--essentiel">
              <div className="oj-essentiel-steps">
                {steps.slice(0, 3).map(step => (
                  <div
                    key={step.id}
                    className={`oj-essentiel-step ${step.status}`}
                    data-testid={`reasoning-step-${step.type}`}
                    data-step-status={step.status}
                  >
                    {getStepStatusIcon(step.status)}
                    <span className="oj-essentiel-type">
                      {getStepTypeLabel(step.type)}
                    </span>
                    <span className="oj-essentiel-content">
                      {step.content.slice(0, 80)}
                      {step.content.length > 80 ? '…' : ''}
                    </span>
                  </div>
                ))}
                {steps.length > 3 && (
                  <div
                    className="oj-essentiel-more"
                    onClick={() => setViewMode('detaille')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setViewMode('detaille')}
                  >
                    +{steps.length - 3} autre{steps.length - 3 !== 1 ? 's' : ''} étape
                    {steps.length - 3 !== 1 ? 's' : ''} — Voir détails
                  </div>
                )}
                {steps.length === 0 && (
                  <div className="oj-step-placeholder oj-non-capture">
                    {isThinking ? 'Traitement en cours…' : 'Aucune étape capturée'}
                  </div>
                )}
              </div>
              {/* Hidden topology for e2e */}
              {topology.length > 0 && (
                <div
                  className="thinking-topology"
                  data-testid="reasoning-topology"
                  hidden
                >
                  {topology.map(node => (
                    <span
                      key={node.id}
                      className={`thinking-topology-node ${node.status}`}
                      data-testid="reasoning-topology-node"
                      data-node-id={node.id}
                      data-node-status={node.status}
                    >
                      {node.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {/* /oj-journal-body */}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook to manage thinking steps with compact mode support
 */
export function useThinkingSteps() {
  const [steps, setSteps] = useState<ThinkingStep[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [compact, setCompact] = useState(true); // Compact par défaut (v2)

  const addStep = (type: ThinkingStep['type'], content: string) => {
    const step: ThinkingStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      type,
      content,
      status: 'active',
      timestamp: Date.now(),
    };

    setSteps(prev => [...prev.map(s => ({ ...s, status: 'complete' as const })), step]);
  };

  const completeCurrentStep = () => {
    setSteps(prev =>
      prev.map(s => (s.status === 'active' ? { ...s, status: 'complete' as const } : s))
    );
  };

  const startThinking = () => {
    setIsThinking(true);
    setSteps([]);
    setCompact(true); // Reset au mode compact
  };

  const stopThinking = () => {
    setIsThinking(false);
    completeCurrentStep();
  };

  const reset = () => {
    setSteps([]);
    setIsThinking(false);
    setCompact(true);
  };

  const toggleCompact = () => {
    setCompact(prev => !prev);
  };

  return {
    steps,
    isThinking,
    compact,
    addStep,
    completeCurrentStep,
    startThinking,
    stopThinking,
    reset,
    toggleCompact,
  };
}
