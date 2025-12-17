/**
 * TITANE∞ v∞ ULTRA — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * Panneau de contrôle du Cognitive Layout Engine
 */

import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  type PointerEventHandler,
} from 'react';
import { useCognitiveLayout, type UIMode } from '@/hooks/useCognitiveLayout';
import { usePanelState } from '@/hooks/usePanelState';
import { usePanelsStore } from '@/stores/panelsStore';
import { usePerformanceProfiler } from '@/hooks/usePerformanceProfiler';
import './CognitiveLayoutControl.css';

const MODE_LABELS: Record<UIMode, string> = {
  focus_deep: '🎯 Focus Profond',
  exploration: '🔍 Exploration',
  monitoring: '📊 Monitoring',
  maintenance: '🔧 Maintenance',
  coaching: '🎓 Coaching',
  neutral: '⚖️ Neutre',
};

const MODE_DESCRIPTIONS: Record<UIMode, string> = {
  focus_deep: 'Concentration maximale, distractions minimales',
  exploration: 'Navigation et découverte, suggestions activées',
  monitoring: 'Surveillance et métriques, haute densité',
  maintenance: 'Debug et configuration technique',
  coaching: 'Interface narrative pour accompagnement',
  neutral: 'Mode équilibré par défaut',
};

// v25.7.1: Preset layouts interface
interface PresetLayout {
  name: string;
  mode: UIMode;
  timestamp: number;
}

const PRESETS_KEY = 'titane-cognitive-layout-presets';

/**
 * Panneau de contrôle Cognitive Layout
 * Optimisé avec React.memo pour éviter re-renders inutiles
 */
export const CognitiveLayoutControl = memo(function CognitiveLayoutControl() {
  // Position draggable avec persistence localStorage (moved to top to fix TS error)
  const POSITION_KEY = 'titane-cognitive-layout-position';
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(POSITION_KEY);
      return saved ? JSON.parse(saved) : { x: 20, y: 80 }; // Default top-right
    }
    return { x: 20, y: 80 };
  });

  const {
    currentMode,
    suggestion,
    signals,
    setMode,
    acceptSuggestion,
    refuseSuggestion,
    revertMode,
    resetMode,
    toggleAdaptation,
    isAdaptationEnabled,
    hasSuggestion,
  } = useCognitiveLayout();

  // v25.6.6: Panel state management (usePanelState integration)
  const { isCollapsed, zIndex, toggle, bringToFront } = usePanelState({
    panelId: 'cognitive-layout',
    defaultCollapsed: false,
    defaultVisible: true,
    defaultZIndex: 1000,
    persistState: true,
  });

  // v25.6.6: Register panel in global store
  const registerPanel = usePanelsStore(state => state.registerPanel);
  useEffect(() => {
    registerPanel({
      id: 'cognitive-layout',
      title: 'Cognitive Layout',
      isVisible: true,
      isCollapsed: false,
      isPinned: false,
      zIndex: 1000,
      position: { x: null, y: null },
      size: { width: null, height: null },
      hiddenOnMobile: false,
      collapsedOnMobile: false,
    });
  }, [registerPanel]);

  // v25.6.9: Performance profiling (DEV only)
  const { measure, stats } = usePerformanceProfiler('CognitiveLayoutControl', {
    enabled: process.env.NODE_ENV === 'development',
    monitorFPS: false,
    memoryInterval: 0,
    statsInterval: 10000,
  });

  // v25.7.0: Mode history (undo/redo)
  const [modeHistory, setModeHistory] = useState<UIMode[]>([currentMode ?? 'neutral']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Track mode changes
  useEffect(() => {
    if (currentMode && modeHistory[historyIndex] !== currentMode) {
      // New mode change - truncate history after current index and add new mode
      const newHistory = [...modeHistory.slice(0, historyIndex + 1), currentMode];
      setModeHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [currentMode, historyIndex, modeHistory]);

  // Undo/Redo handlers
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < modeHistory.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMode(modeHistory[newIndex]);
    }
  }, [canUndo, historyIndex, modeHistory, setMode]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMode(modeHistory[newIndex]);
    }
  }, [canRedo, historyIndex, modeHistory, setMode]);

  // Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // v25.7.1: Preset layouts management
  const [presets, setPresets] = useState<PresetLayout[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(PRESETS_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const savePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset: PresetLayout = {
      name: presetName.trim(),
      mode: currentMode ?? 'neutral',
      timestamp: Date.now(),
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    setPresetName('');
    setShowPresetDialog(false);
  }, [presetName, currentMode, presets]);

  const loadPreset = useCallback(
    (preset: PresetLayout) => {
      setMode(preset.mode);
    },
    [setMode]
  );

  const deletePreset = useCallback(
    (index: number) => {
      const updatedPresets = presets.filter((_, i) => i !== index);
      setPresets(updatedPresets);
      localStorage.setItem(PRESETS_KEY, JSON.stringify(updatedPresets));
    },
    [presets]
  );

  // v25.7.3: Audio feedback system (subtle, optional) - Moved before importConfig
  const playSound = useCallback((type: 'click' | 'success' | 'error') => {
    // Only in browser with user interaction
    if (typeof window === 'undefined' || !window.AudioContext) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Subtle volume
      gainNode.gain.value = 0.1;

      // Different frequencies for different actions
      switch (type) {
        case 'click':
          oscillator.frequency.value = 800;
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.05);
          break;
        case 'success':
          oscillator.frequency.value = 1200;
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
          break;
        case 'error':
          oscillator.frequency.value = 400;
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.15);
          break;
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Silently fail if audio not supported
      console.debug('Audio feedback not available:', error);
    }
  }, []);

  // v25.7.2: Export/Import configuration
  const exportConfig = useCallback(() => {
    const config = {
      version: '25.7.2',
      currentMode,
      presets,
      position,
      isCollapsed,
      timestamp: Date.now(),
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `cognitive-layout-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [currentMode, presets, position, isCollapsed]);

  const importConfig = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const config = JSON.parse(e.target?.result as string);

          // Validate config
          if (config.version && config.currentMode) {
            // Import presets
            if (config.presets) {
              setPresets(config.presets);
              localStorage.setItem(PRESETS_KEY, JSON.stringify(config.presets));
            }

            // Import position
            if (config.position) {
              setPosition(config.position);
              localStorage.setItem(POSITION_KEY, JSON.stringify(config.position));
            }

            // Import mode
            setMode(config.currentMode);

            // v25.7.3: Audio feedback
            playSound('success');
            alert('✅ Configuration imported successfully!');
          } else {
            playSound('error');
            alert('❌ Invalid configuration file');
          }
        } catch (error) {
          console.error('Import error:', error);
          playSound('error');
          alert('❌ Error importing configuration');
        }
      };
      reader.readAsText(file);

      // Reset input
      event.target.value = '';
    },
    [setMode, setPosition, playSound]
  );

  // Log performance stats in DEV
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && stats) {
      console.log('[CognitiveLayout] Performance Stats:', {
        avgRenderTime: stats.avgTime?.toFixed(2) + 'ms',
        renderCount: stats.count,
        maxRender: stats.maxTime?.toFixed(2) + 'ms',
      });
    }
  }, [stats]);

  // Drag state ref
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Sauvegarder position dans localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(POSITION_KEY, JSON.stringify(position));
    }
  }, [position]);

  // Raccourci clavier Ctrl+K pour toggle collapse/expand
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        toggle(); // usePanelState toggle function
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  // Drag & Drop handlers (ChatDebugPanel pattern)
  const clampPosition = useCallback(
    (
      next: { x: number; y: number },
      panelWidth: number,
      panelHeight: number
    ): { x: number; y: number } => {
      if (typeof window === 'undefined') {
        return next;
      }
      const maxX = window.innerWidth - panelWidth - 16;
      const maxY = window.innerHeight - panelHeight - 16;
      return {
        x: Math.max(16, Math.min(next.x, maxX)),
        y: Math.max(16, Math.min(next.y, maxY)),
      };
    },
    []
  );

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    event => {
      const header = event.currentTarget;
      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - position.x,
        offsetY: event.clientY - position.y,
      };
      header.setPointerCapture(event.pointerId);
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLDivElement>>(
    event => {
      const dragState = dragRef.current;
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return;
      }

      const panelWidth = isCollapsed ? 200 : 400;
      const panelHeight = isCollapsed ? 80 : 500;
      const nextPosition = clampPosition(
        {
          x: event.clientX - dragState.offsetX,
          y: event.clientY - dragState.offsetY,
        },
        panelWidth,
        panelHeight
      );
      setPosition(nextPosition);
    },
    [clampPosition, isCollapsed]
  );

  const handlePointerUp = useCallback<PointerEventHandler<HTMLDivElement>>(event => {
    if (dragRef.current?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      dragRef.current = null;
    }
  }, []);

  if (!currentMode) return null;

  return (
    <div
      className={`cognitive-layout-control ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex, // usePanelState zIndex
      }}
      onClick={bringToFront} // Auto bring to front on click
    >
      {/* Header draggable */}
      <div
        className="clc-header"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ cursor: 'move' }}
      >
        <h3>🧠 Cognitive Layout</h3>

        {/* v25.7.0: History controls (Undo/Redo) */}
        <div className="clc-history-controls">
          <button
            className="clc-history-btn"
            onClick={e => {
              e.stopPropagation();
              handleUndo();
            }}
            disabled={!canUndo}
            title="Undo mode change (Ctrl+Z)"
            aria-label="Undo mode change"
          >
            ↶
          </button>
          <button
            className="clc-history-btn"
            onClick={e => {
              e.stopPropagation();
              handleRedo();
            }}
            disabled={!canRedo}
            title="Redo mode change (Ctrl+Y)"
            aria-label="Redo mode change"
          >
            ↷
          </button>
        </div>

        {/* Bouton Expand/Collapse */}
        <button
          className="clc-collapse-btn"
          onClick={e => {
            e.stopPropagation(); // Prevent bringToFront on collapse button
            toggle(); // usePanelState toggle
          }}
          aria-label={isCollapsed ? 'Agrandir le panneau' : 'Réduire le panneau'}
          title={isCollapsed ? 'Agrandir (Ctrl+K)' : 'Réduire (Ctrl+K)'}
        >
          <span className={`clc-collapse-arrow ${isCollapsed ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>

        <label className="clc-toggle">
          <input
            type="checkbox"
            checked={isAdaptationEnabled}
            onChange={e => toggleAdaptation(e.target.checked)}
          />
          <span>Adaptation auto</span>
        </label>
      </div>

      {/* Contenu collapsible */}
      <div className={`clc-content ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Mode actuel - ARIA live region */}
        <div
          className="clc-current-mode"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="clc-mode-badge">{MODE_LABELS[currentMode]}</div>
          <p className="clc-mode-desc">{MODE_DESCRIPTIONS[currentMode]}</p>
        </div>

        {/* Suggestion d'adaptation - ARIA alert */}
        {hasSuggestion && suggestion && (
          <div
            className="clc-suggestion"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="clc-suggestion-header">
              <span className="clc-suggestion-icon" aria-hidden="true">
                💡
              </span>
              <span className="clc-suggestion-title">Suggestion</span>
              <span className="clc-suggestion-confidence">
                {(suggestion.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>

            <div className="clc-suggestion-body">
              <p className="clc-suggestion-mode">
                Passer en mode <strong>{MODE_LABELS[suggestion.suggestedMode]}</strong>
              </p>
              <p className="clc-suggestion-reason">{suggestion.reasoning}</p>
            </div>

            <div className="clc-suggestion-actions">
              <button
                className="clc-btn clc-btn-primary"
                onClick={() => {
                  playSound('success');
                  acceptSuggestion();
                }}
              >
                Appliquer
              </button>
              <button
                className="clc-btn clc-btn-secondary"
                onClick={() => {
                  playSound('click');
                  refuseSuggestion();
                }}
              >
                Refuser
              </button>
            </div>
          </div>
        )}

        {/* Sélecteur de mode manuel */}
        <div className="clc-mode-selector">
          <h4 id="mode-selector-label">Changer de mode</h4>
          <div
            className="clc-mode-grid"
            role="radiogroup"
            aria-labelledby="mode-selector-label"
          >
            {(Object.keys(MODE_LABELS) as UIMode[]).map(mode => (
              <button
                key={mode}
                className={`clc-mode-btn ${currentMode === mode ? 'active' : ''}`}
                onClick={() => {
                  // v25.7.3: Audio feedback
                  playSound('click');
                  // v25.6.9: Performance tracking on mode change
                  const stop = measure('setMode', 'user-interaction');
                  setMode(mode);
                  stop();
                }}
                role="radio"
                aria-checked={currentMode === mode}
                aria-label={`${MODE_LABELS[mode]}: ${MODE_DESCRIPTIONS[mode]}`}
                title={MODE_DESCRIPTIONS[mode]}
                tabIndex={currentMode === mode ? 0 : -1}
              >
                {MODE_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Signaux cognitifs */}
        {signals && (
          <div className="clc-signals">
            <h4>Signaux cognitifs</h4>
            <div className="clc-signal-grid">
              <div className="clc-signal">
                <span className="clc-signal-label">⚡ Énergie</span>
                <div className="clc-signal-bar">
                  <div
                    className="clc-signal-fill"
                    style={{ width: `${signals.energyLevel * 100}%` }}
                  />
                </div>
              </div>

              <div className="clc-signal">
                <span className="clc-signal-label">🎯 Focus</span>
                <div className="clc-signal-bar">
                  <div
                    className="clc-signal-fill"
                    style={{ width: `${signals.focusScore * 100}%` }}
                  />
                </div>
              </div>

              <div className="clc-signal">
                <span className="clc-signal-label">🧠 Charge</span>
                <div className="clc-signal-bar">
                  <div
                    className="clc-signal-fill clc-signal-negative"
                    style={{ width: `${signals.cognitiveLoad * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="clc-signal-info">
              <span>⏱️ Session: {signals.sessionDuration.toFixed(0)} min</span>
              {signals.fatigueEstimated && (
                <span className="clc-warning">⚠️ Fatigue détectée</span>
              )}
              {signals.blockageDetected && (
                <span className="clc-warning">🔄 Blocage détecté</span>
              )}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="clc-actions">
          <button className="clc-btn clc-btn-small" onClick={revertMode}>
            ⏮️ Mode précédent
          </button>
          <button className="clc-btn clc-btn-small" onClick={resetMode}>
            ⚖️ Reset neutre
          </button>
          <button
            className="clc-btn clc-btn-small clc-btn-primary"
            onClick={() => setShowPresetDialog(true)}
          >
            💾 Save Preset
          </button>
        </div>

        {/* v25.7.2: Export/Import actions */}
        <div className="clc-actions clc-export-actions">
          <button className="clc-btn clc-btn-small" onClick={exportConfig}>
            📤 Export Config
          </button>
          <label className="clc-btn clc-btn-small clc-import-btn">
            📥 Import Config
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* v25.7.1: Preset layouts list */}
        {presets.length > 0 && (
          <div className="clc-presets">
            <h4>📌 Presets</h4>
            <div className="clc-presets-list">
              {presets.map((preset, index) => (
                <div key={index} className="clc-preset-item">
                  <button
                    className="clc-preset-load"
                    onClick={() => loadPreset(preset)}
                    title={`Load ${preset.name} - ${MODE_LABELS[preset.mode]}`}
                  >
                    <span className="clc-preset-name">{preset.name}</span>
                    <span className="clc-preset-mode">{MODE_LABELS[preset.mode]}</span>
                  </button>
                  <button
                    className="clc-preset-delete"
                    onClick={() => deletePreset(index)}
                    title="Delete preset"
                    aria-label={`Delete preset ${preset.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* v25.7.1: Preset save dialog */}
        {showPresetDialog && (
          <div className="clc-preset-dialog">
            <h4>Save Current Layout</h4>
            <input
              type="text"
              className="clc-preset-input"
              placeholder="Preset name..."
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') savePreset();
                if (e.key === 'Escape') setShowPresetDialog(false);
              }}
              autoFocus
            />
            <div className="clc-preset-dialog-actions">
              <button className="clc-btn clc-btn-primary" onClick={savePreset}>
                Save
              </button>
              <button
                className="clc-btn clc-btn-secondary"
                onClick={() => setShowPresetDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Fin contenu collapsible */}
    </div>
  );
});

// DisplayName pour React DevTools
CognitiveLayoutControl.displayName = 'CognitiveLayoutControl';

/**
 * Version compacte pour la toolbar (Mini-mode badge)
 * Optimisée avec React.memo
 * v25.6.7: Click to expand full panel + hover tooltip
 */
export const CognitiveLayoutBadge = memo(function CognitiveLayoutBadge() {
  const { currentMode, hasSuggestion } = useCognitiveLayout();
  const { expand } = usePanelState({
    panelId: 'cognitive-layout',
    defaultCollapsed: false,
    defaultVisible: true,
    defaultZIndex: 1000,
    persistState: true,
  });

  if (!currentMode) return null;

  return (
    <button
      className="cognitive-layout-badge"
      onClick={expand}
      title={`Cognitive Layout: ${MODE_LABELS[currentMode]}${hasSuggestion ? ' (Suggestion disponible)' : ''}`}
      aria-label={`Open Cognitive Layout panel - Current mode: ${MODE_LABELS[currentMode]}`}
    >
      {MODE_LABELS[currentMode]}
      {hasSuggestion && (
        <span className="clc-badge-dot" title="Suggestion disponible">
          ●
        </span>
      )}
    </button>
  );
});

// DisplayName pour React DevTools
CognitiveLayoutBadge.displayName = 'CognitiveLayoutBadge';
