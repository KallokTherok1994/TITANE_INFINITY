/**
 * TITANE∞ v26.2.0 — ThinkingPanel Demo
 * Démonstration du mode compact vs étendu
 */

import React from 'react';
import { ThinkingPanel, useThinkingSteps } from './ThinkingPanel';
import './ThinkingPanelDemo.css';

export const ThinkingPanelDemo: React.FC = () => {
  const thinking = useThinkingSteps();

  // Simuler une réflexion OMEGA
  const simulateThinking = () => {
    thinking.startThinking();

    setTimeout(() => {
      thinking.addStep('analysis', 'Analyse du contexte et de la demande utilisateur...');
    }, 500);

    setTimeout(() => {
      thinking.addStep(
        'reasoning',
        'Recherche dans la base de connaissances et raisonnement...'
      );
    }, 1500);

    setTimeout(() => {
      thinking.addStep(
        'synthesis',
        'Synthèse de la réponse et vérification cohérence...'
      );
    }, 2500);

    setTimeout(() => {
      thinking.addStep('validation', 'Validation finale et sécurité...');
    }, 3500);

    setTimeout(() => {
      thinking.stopThinking();
    }, 4500);
  };

  return (
    <div className="thinking-panel-demo">
      <div className="demo-header">
        <h2>🧠 ThinkingPanel v2 Demo</h2>
        <p>Réflexion OMEGA discrète et professionnelle</p>
      </div>

      <div className="demo-controls">
        <button onClick={simulateThinking} disabled={thinking.isThinking}>
          {thinking.isThinking ? '⏳ En cours...' : '▶️ Démarrer réflexion'}
        </button>
        <button onClick={thinking.reset} disabled={thinking.isThinking}>
          🔄 Reset
        </button>
        <button onClick={thinking.toggleCompact}>
          {thinking.compact ? '📖 Mode étendu' : '📕 Mode compact'}
        </button>
      </div>

      <div className="demo-examples">
        <div className="demo-section">
          <h3>💬 Exemple 1: Mode Standalone</h3>
          <div className="demo-preview">
            <ThinkingPanel
              isThinking={thinking.isThinking}
              steps={thinking.steps}
              compact={thinking.compact}
              inline={false}
            />
          </div>
        </div>

        <div className="demo-section">
          <h3>💬 Exemple 2: Mode Inline (dans un message)</h3>
          <div className="demo-preview">
            <div className="mock-chat-message">
              <div className="mock-message-header">
                <span className="mock-avatar">🤖</span>
                <span className="mock-name">TITANE∞</span>
              </div>
              <div className="mock-message-body">
                <ThinkingPanel
                  isThinking={thinking.isThinking}
                  steps={thinking.steps}
                  compact={true}
                  inline={true}
                />
                <p className="mock-content">
                  Voici ma réponse après avoir analysé votre demande avec OMEGA.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="demo-section">
          <h3>📊 Comparaison Avant / Après</h3>
          <div className="demo-comparison">
            <div className="comparison-column">
              <h4>❌ AVANT (v1)</h4>
              <div className="comparison-box old">
                <div className="mock-old-panel">
                  <div className="mock-old-header">
                    🧠 Réflexion OMEGA • ⏳ En cours...
                  </div>
                  <div className="mock-old-steps">
                    <div className="mock-old-step">✓ Analyse</div>
                    <div className="mock-old-step">⏳ Raisonnement</div>
                    <div className="mock-old-step">⏸ Synthèse</div>
                    <div className="mock-old-step">⏸ Validation</div>
                  </div>
                  <div className="mock-old-footer">2/4 étapes • 3s</div>
                </div>
                <p className="comparison-note">
                  ❌ Toujours visible et encombrant
                  <br />
                  ❌ Prend beaucoup d&apos;espace
                  <br />❌ Distrait l&apos;utilisateur
                </p>
              </div>
            </div>

            <div className="comparison-column">
              <h4>✅ APRÈS (v2)</h4>
              <div className="comparison-box new">
                <div className="mock-new-panel">🧠 Thinking... ▼</div>
                <p className="comparison-note">
                  ✅ Discret et professionnel
                  <br />
                  ✅ Style ChatGPT/Claude/Gemini
                  <br />
                  ✅ Expandable sur demande
                  <br />✅ Animation subtile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="demo-stats">
        <div className="stat">
          <span className="stat-label">Étapes:</span>
          <span className="stat-value">{thinking.steps.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Status:</span>
          <span className="stat-value">
            {thinking.isThinking
              ? '⏳ En cours'
              : thinking.steps.length > 0
                ? '✅ Terminé'
                : '⏸ Inactif'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Mode:</span>
          <span className="stat-value">
            {thinking.compact ? '📕 Compact' : '📖 Étendu'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingPanelDemo;
