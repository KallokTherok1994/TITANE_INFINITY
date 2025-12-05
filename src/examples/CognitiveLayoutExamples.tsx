/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Exemple d'intégration du Cognitive Layout Engine
 */

import React, { useEffect } from 'react';
import {
  useCognitiveLayout,
  useModuleContext,
  useConditionalVisibility,
  useDensityLevel,
} from '@/hooks/useCognitiveLayout';
import { CognitiveLayoutControl, CognitiveLayoutBadge } from '@/components/cognitive/CognitiveLayoutControl';

/**
 * Exemple 1: Layout Principal avec Contrôle Cognitif
 */
export function AdaptiveLayout({ children }: { children: React.ReactNode }) {
  const { setRole, updateContext, currentMode } = useCognitiveLayout();

  useEffect(() => {
    // Initialiser le contexte au montage
    setRole('developer');
    updateContext({
      currentModule: 'main-layout',
      currentProject: 'titane-infinity',
    });
  }, []);

  return (
    <div className="adaptive-layout" data-ui-mode={currentMode}>
      {/* Badge dans la toolbar */}
      <header className="app-header">
        <div className="header-left">
          <h1>TITANE∞</h1>
        </div>
        <div className="header-right">
          <CognitiveLayoutBadge />
        </div>
      </header>

      {/* Contenu principal */}
      <main className="app-main">{children}</main>

      {/* Panneau de contrôle cognitif (peut être dans une sidebar) */}
      <aside className="app-sidebar">
        <CognitiveLayoutControl />
      </aside>
    </div>
  );
}

/**
 * Exemple 2: Composant qui s'adapte au mode
 */
export function AdaptiveStatsPanel() {
  const visible = useConditionalVisibility('stats-widget');
  const density = useDensityLevel();

  if (!visible) return null;

  return (
    <div className={`stats-panel density-${density}`}>
      <h3>Statistiques</h3>
      {density === 'minimal' || density === 'low' ? (
        // Version compacte
        <div className="stats-compact">
          <span>Uptime: 5h</span>
          <span>CPU: 45%</span>
        </div>
      ) : (
        // Version complète
        <div className="stats-full">
          <div>Uptime: 5h 23m</div>
          <div>CPU: 45%</div>
          <div>Memory: 2.3GB</div>
          <div>Network: 125 KB/s</div>
        </div>
      )}
    </div>
  );
}

/**
 * Exemple 3: Module qui notifie son contexte
 */
export function ChatOmegaModule() {
  const { setTaskType, updateContext } = useCognitiveLayout();

  // Notifier automatiquement le contexte
  useModuleContext('chat-omega');

  useEffect(() => {
    // Selon l'activité, mettre à jour le type de tâche
    const isWriting = true; // logique métier
    if (isWriting) {
      setTaskType('writing');
    }
  }, []);

  return (
    <div className="chat-omega-module">
      <h2>Chat OMEGA</h2>
      {/* Votre contenu */}
    </div>
  );
}

/**
 * Exemple 4: Boutons de contrôle rapide
 */
export function QuickModeSelector() {
  const { setMode, currentMode } = useCognitiveLayout();

  const modes = [
    { id: 'focus_deep', icon: '🎯', label: 'Focus' },
    { id: 'exploration', icon: '🔍', label: 'Explorer' },
    { id: 'monitoring', icon: '📊', label: 'Monitor' },
  ] as const;

  return (
    <div className="quick-mode-selector">
      {modes.map((mode) => (
        <button
          key={mode.id}
          className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
          onClick={() => setMode(mode.id)}
          title={mode.label}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
}

/**
 * Exemple 5: Écouter les suggestions et afficher une notification
 */
export function CognitiveSuggestionToast() {
  const { suggestion, acceptSuggestion, refuseSuggestion } = useCognitiveLayout();

  if (!suggestion) return null;

  return (
    <div className="cognitive-toast">
      <div className="toast-content">
        <span className="toast-icon">💡</span>
        <div className="toast-text">
          <strong>Suggestion</strong>
          <p>{suggestion.reasoning}</p>
        </div>
      </div>
      <div className="toast-actions">
        <button onClick={acceptSuggestion}>✓</button>
        <button onClick={refuseSuggestion}>✗</button>
      </div>
    </div>
  );
}

/**
 * Exemple 6: Composant qui change selon la densité
 */
export function AdaptiveButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const density = useDensityLevel();

  const sizes = {
    minimal: 'btn-large',
    low: 'btn-medium',
    medium: 'btn-medium',
    high: 'btn-small',
    maximal: 'btn-tiny',
  };

  return (
    <button className={`adaptive-btn ${sizes[density]}`} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * Exemple 7: Hook personnalisé pour composants adaptatifs
 */
export function useAdaptiveStyle() {
  const { layoutConfig } = useCognitiveLayout();

  if (!layoutConfig) return {};

  const { density } = layoutConfig;

  return {
    fontSize: `${density.fontSize}rem`,
    padding: `${1 * density.whitespace}rem`,
    opacity: density.accentColors,
    transition: density.animations ? 'all 0.2s ease' : 'none',
  };
}

/**
 * Exemple 8: Utilisation du hook de style adaptatif
 */
export function AdaptiveCard({ title, children }: { title: string; children: React.ReactNode }) {
  const style = useAdaptiveStyle();

  return (
    <div className="adaptive-card" style={style}>
      <h3>{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
}
