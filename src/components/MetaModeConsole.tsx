// 🧠 Meta-Mode Console — Interface principale Meta-Mode Engine
// Interaction utilisateur avec détection automatique et transitions fluides

import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './MetaModeConsole.css';

interface InteractionRequest {
  input: string;
  context: string;
}

interface InteractionResponse {
  active_mode: string;
  mode_justification: string;
  content: string;
  adapted_tone: string;
  adapted_depth: string;
  adapted_speed: string;
  next_suggested_modes: string[];
  timestamp: string;
}

interface KevinState {
  emotional_tone: string;
  stress_level: number;
  cognitive_load: number;
  clarity_level: number;
  energy_level: number;
}

export const MetaModeConsole: React.FC = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<InteractionResponse | null>(null);
  const [kevinState, setKevinState] = useState<KevinState | null>(null);
  const [currentMode, setCurrentMode] = useState<string>('Digital Twin');
  const [history, setHistory] = useState<Array<{ input: string; response: InteractionResponse }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Récupérer le mode actuel au montage
  useEffect(() => {
    fetchCurrentMode();
    fetchKevinState();
  }, []);

  const fetchCurrentMode = async () => {
    try {
      const mode = await invoke<string>('meta_mode_get_current_mode');
      setCurrentMode(mode);
    } catch (error) {
      console.error('Erreur récupération mode:', error);
    }
  };

  const fetchKevinState = async () => {
    try {
      const state = await invoke<KevinState>('meta_mode_get_kevin_state');
      setKevinState(state);
    } catch (error) {
      console.error('Erreur récupération état Kevin:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      const request: InteractionRequest = {
        input: input.trim(),
        context: context.trim() || 'general',
      };

      const result = await invoke<InteractionResponse>('meta_mode_process', { request });

      setResponse(result);
      setCurrentMode(result.active_mode);
      setHistory([...history, { input: input.trim(), response: result }]);
      setInput('');

      // Mettre à jour l'état Kevin
      await fetchKevinState();
    } catch (error) {
      console.error('Erreur traitement Meta-Mode:', error);
      alert(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Réinitialiser le Meta-Mode Engine ?')) {
      try {
        await invoke('meta_mode_reset');
        setResponse(null);
        setHistory([]);
        setCurrentMode('Digital Twin');
        await fetchKevinState();
        alert('Meta-Mode Engine réinitialisé');
      } catch (error) {
        console.error('Erreur reset:', error);
      }
    }
  };

  const getEmotionEmoji = (tone: string) => {
    const map: Record<string, string> = {
      calm: '😌',
      motivated: '💪',
      overwhelmed: '😰',
      confused: '😕',
      tired: '😴',
      neutral: '😐',
    };
    return map[tone.toLowerCase()] || '🧠';
  };

  const getStressColor = (level: number) => {
    if (level > 0.7) return '#ff4444';
    if (level > 0.4) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <div className="meta-mode-console">
      {/* Header */}
      <div className="console-header">
        <div className="header-title">
          <h2>🧠 Meta-Mode Console</h2>
          <span className="version">v14.1</span>
        </div>
        <button className="reset-btn" onClick={handleReset} title="Réinitialiser">
          🔄 Reset
        </button>
      </div>

      {/* État Kevin actuel */}
      {kevinState && (
        <div className="kevin-state-card">
          <div className="state-row">
            <span className="state-label">
              {getEmotionEmoji(kevinState.emotional_tone)} Émotion:
            </span>
            <span className="state-value">{kevinState.emotional_tone}</span>
          </div>
          <div className="state-row">
            <span className="state-label">🌡️ Stress:</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${kevinState.stress_level * 100}%`,
                  backgroundColor: getStressColor(kevinState.stress_level),
                }}
              />
            </div>
            <span className="state-value">{(kevinState.stress_level * 100).toFixed(0)}%</span>
          </div>
          <div className="state-row">
            <span className="state-label">🧠 Charge cognitive:</span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${kevinState.cognitive_load * 100}%` }}
              />
            </div>
            <span className="state-value">{(kevinState.cognitive_load * 100).toFixed(0)}%</span>
          </div>
          <div className="state-row">
            <span className="state-label">💡 Clarté:</span>
            <div className="progress-bar">
              <div
                className="progress-fill clarity"
                style={{ width: `${kevinState.clarity_level * 100}%` }}
              />
            </div>
            <span className="state-value">{(kevinState.clarity_level * 100).toFixed(0)}%</span>
          </div>
          <div className="state-row">
            <span className="state-label">⚡ Énergie:</span>
            <div className="progress-bar">
              <div
                className="progress-fill energy"
                style={{ width: `${kevinState.energy_level * 100}%` }}
              />
            </div>
            <span className="state-value">{(kevinState.energy_level * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Historique conversations */}
      <div className="conversation-history">
        {history.map((entry, idx) => (
          <div key={idx} className="conversation-entry">
            <div className="user-message">
              <strong>Vous:</strong> {entry.input}
            </div>
            <div className="assistant-message">
              <div className="mode-badge">{entry.response.active_mode}</div>
              <div className="response-content">{entry.response.content}</div>
              <div className="response-meta">
                <span>Ton: {entry.response.adapted_tone}</span>
                <span>Profondeur: {entry.response.adapted_depth}</span>
                <span>Vitesse: {entry.response.adapted_speed}</span>
              </div>
              {entry.response.next_suggested_modes.length > 0 && (
                <div className="suggested-modes">
                  Suggestions: {entry.response.next_suggested_modes.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Réponse actuelle */}
      {response && (
        <div className="current-response">
          <div className="response-header">
            <span className="mode-active">Mode actif: {response.active_mode}</span>
            <span className="timestamp">{new Date(response.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="justification">{response.mode_justification}</p>
        </div>
      )}

      {/* Formulaire input */}
      <form className="input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="context">Contexte (optionnel):</label>
          <input
            id="context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="ex: projet, décision, création..."
            className="context-input"
          />
        </div>
        <div className="input-group main-input">
          <label htmlFor="input">Votre message:</label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Exprimez-vous librement... Le Meta-Mode Engine détectera automatiquement le mode optimal."
            className="message-input"
            rows={4}
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading || !input.trim()}>
          {loading ? '⏳ Traitement...' : '🚀 Envoyer'}
        </button>
      </form>

      {/* Mode actuel en bas */}
      <div className="current-mode-indicator">
        <span className="mode-label">Mode actuel:</span>
        <span className="mode-name">{currentMode}</span>
      </div>
    </div>
  );
};

export default MetaModeConsole;
