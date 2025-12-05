/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — AUTONOMIC VOICE DEMO COMPONENT
 *   Démonstration complète du Voice Persona Kernel
 * ═══════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { useVoiceEngine } from '@/hooks/useVoiceEngine';
import {
  emotionalStateEstimator,
  type EmotionalState,
  type UserMood,
} from '@/services/voice/emotionalStateEstimator';
import {
  vocalMicroFXEngine,
} from '@/services/voice/vocalMicroFXEngine';
import {
  autonomicReactionEngine,
  type AutonomicReaction,
} from '@/services/voice/autonomicReactionEngine';

/**
 * Autonomic Voice Demo Component
 */
export function AutonomicVoiceDemo() {
  const voice = useVoiceEngine({
    language: 'fr-FR',
    fullDuplexMode: false, // Simple mode for demo
  });

  const [emotionState, setEmotionState] = useState<EmotionalState | null>(null);
  const [lastReaction, setLastReaction] = useState<AutonomicReaction | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionalState[]>([]);
  const [reactionHistory, setReactionHistory] = useState<AutonomicReaction[]>([]);

  // Test texts
  const testScenarios = [
    {
      id: 1,
      label: 'Excited User',
      text: 'J\'ai trouvé la solution ! C\'est génial !!!',
      expected: 'excited, high energy',
    },
    {
      id: 2,
      label: 'Sad User',
      text: 'Je me sens vraiment pas bien... Je suis triste.',
      expected: 'sad, low energy, empathy reaction',
    },
    {
      id: 3,
      label: 'Curious User',
      text: 'Comment ça fonctionne exactement ? Peux-tu m\'expliquer ?',
      expected: 'curious, question intention',
    },
    {
      id: 4,
      label: 'Urgent User',
      text: 'Vite ! C\'est urgent, j\'ai besoin d\'aide maintenant !',
      expected: 'stressed, urgency intention',
    },
    {
      id: 5,
      label: 'Calm User',
      text: 'Tout va bien, je suis calme et serein aujourd\'hui.',
      expected: 'calm, positive valence',
    },
  ];

  /**
   * Handle test scenario
   */
  const handleTestScenario = async (text: string) => {
    try {
      // 1. Analyze emotion
      const emotion = emotionalStateEstimator.analyzeText(text);
      setEmotionState(emotion);
      setEmotionHistory(prev => [...prev.slice(-9), emotion]); // Keep last 10

      console.log('🎭 Emotion detected:', emotion);

      // 2. Generate autonomic reaction
      const reaction = autonomicReactionEngine.generateAutonomicReaction(emotion, text);

      if (reaction && reaction.shouldSpeak) {
        setLastReaction(reaction);
        setReactionHistory(prev => [...prev.slice(-9), reaction]);

        console.log('⚡ Autonomic reaction:', reaction.text);

        // Speak reaction immediately
        await voice.speak(reaction.text);
      }

      // 3. Simulate AI response
      const aiResponse = generateMockAIResponse(emotion, text);

      // 4. Inject micro-expressions
      const enhanced = vocalMicroFXEngine.injectMicroExpressions(aiResponse, emotion, {
        isQuestionResponse: emotion.intention === 'question',
        isLongResponse: aiResponse.length > 150,
      });

      console.log('💬 Enhanced response:', enhanced);

      // 5. Speak enhanced response
      setTimeout(async () => {
        await voice.speak(enhanced);
      }, reaction ? 1500 : 0); // Wait after reaction

    } catch (error) {
      console.error('Demo error:', error);
    }
  };

  /**
   * Mock AI response generator
   */
  const generateMockAIResponse = (emotion: EmotionalState, _userText: string): string => {
    const responses: Record<UserMood, string[]> = {
      excited: [
        'C\'est fantastique ! Raconte-moi comment tu as fait.',
        'Excellent ! Je suis vraiment content pour toi.',
      ],
      sad: [
        'Je suis là pour toi. Qu\'est-ce qui ne va pas ?',
        'Je comprends que ce soit difficile. Veux-tu en parler ?',
      ],
      stressed: [
        'Je comprends l\'urgence. Voici ce que tu peux faire immédiatement.',
        'Pas de panique, je suis là pour t\'aider.',
      ],
      calm: [
        'C\'est bien de se sentir serein. Comment puis-je t\'aider aujourd\'hui ?',
        'Parfait. Dis-moi ce dont tu as besoin.',
      ],
      tired: [
        'Tu as l\'air fatigué. Prends ton temps.',
        'Je vois. Repose-toi bien.',
      ],
      frustrated: [
        'Je comprends ta frustration. Voyons comment résoudre ça.',
        'C\'est normal d\'être frustré. On va trouver une solution.',
      ],
      happy: [
        'Je suis content de te voir heureux ! Quoi de neuf ?',
        'Ton énergie est communicative ! Raconte.',
      ],
      curious: [
        'C\'est intéressant. Parlons-en.',
        'Bonne question. Voici la réponse.',
      ],
      focused: [
        'D\'accord, allons droit au but.',
        'Compris. Voici ce qu\'il faut faire.',
      ],
      neutral: [
        'D\'accord. Comment puis-je t\'aider ?',
        'Je t\'écoute.',
      ],
    };

    const options = responses[emotion.mood] || responses.neutral;
    return options[Math.floor(Math.random() * options.length)];
  };

  /**
   * Clear history
   */
  const handleClearHistory = () => {
    setEmotionHistory([]);
    setReactionHistory([]);
    emotionalStateEstimator.clearHistory();
    autonomicReactionEngine.clearHistory();
  };

  return (
    <div className="autonomic-voice-demo" style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔥 Autonomic Voice Agent Demo v∞.7</h1>

      {/* Current Emotion Panel */}
      {emotionState && (
        <div style={{
          background: '#1e1e1e',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h3>🎭 Current Emotion State</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Mood:</strong>{' '}
              <span style={{
                color: getMoodColor(emotionState.mood),
                fontSize: '1.2em',
              }}>
                {getMoodEmoji(emotionState.mood)} {emotionState.mood}
              </span>
            </div>

            <div>
              <strong>Energy:</strong>{' '}
              <span style={{
                color: getEnergyColor(emotionState.energy),
                fontSize: '1.2em',
              }}>
                {(emotionState.energy * 100).toFixed(0)}%
              </span>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#333',
                borderRadius: '4px',
                marginTop: '5px',
              }}>
                <div style={{
                  width: `${emotionState.energy * 100}%`,
                  height: '100%',
                  background: getEnergyColor(emotionState.energy),
                  borderRadius: '4px',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            <div>
              <strong>Valence:</strong>{' '}
              <span style={{
                color: getValenceColor(emotionState.valence),
                fontSize: '1.2em',
              }}>
                {emotionState.valence > 0 ? '+' : ''}{(emotionState.valence * 100).toFixed(0)}%
              </span>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#333',
                borderRadius: '4px',
                marginTop: '5px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  width: `${Math.abs(emotionState.valence) * 50}%`,
                  height: '100%',
                  background: getValenceColor(emotionState.valence),
                  borderRadius: '4px',
                  [emotionState.valence > 0 ? 'marginLeft' : 'right']: '0',
                  transition: 'all 0.3s',
                }} />
              </div>
            </div>

            <div>
              <strong>Intention:</strong>{' '}
              <span style={{ color: '#60a5fa' }}>
                {emotionState.intention}
              </span>
            </div>

            <div>
              <strong>Confidence:</strong>{' '}
              <span style={{ color: '#a855f7' }}>
                {(emotionState.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <strong>Timestamp:</strong>{' '}
              <span style={{ color: '#9ca3af', fontSize: '0.9em' }}>
                {new Date(emotionState.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Last Reaction Panel */}
      {lastReaction && (
        <div style={{
          background: '#1e293b',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: `4px solid ${getPriorityColor(lastReaction.priority)}`,
        }}>
          <h3>⚡ Last Autonomic Reaction</h3>
          <div style={{ fontSize: '1.1em', color: '#fbbf24', marginBottom: '10px' }}>
            "{lastReaction.text}"
          </div>
          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#9ca3af' }}>
            <span>Type: <strong>{lastReaction.type}</strong></span>
            <span>Priority: <strong style={{ color: getPriorityColor(lastReaction.priority) }}>
              {lastReaction.priority}
            </strong></span>
            <span>Confidence: <strong>{(lastReaction.confidence * 100).toFixed(0)}%</strong></span>
          </div>
        </div>
      )}

      {/* Test Scenarios */}
      <div style={{ marginBottom: '20px' }}>
        <h3>🧪 Test Scenarios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
          {testScenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => handleTestScenario(scenario.text)}
              style={{
                padding: '15px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {scenario.label}
              </div>
              <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
                {scenario.text}
              </div>
              <div style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '5px' }}>
                Expected: {scenario.expected}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Emotion History */}
        <div style={{
          background: '#1e1e1e',
          padding: '15px',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3>📊 Emotion History</h3>
            <button
              onClick={handleClearHistory}
              style={{
                padding: '5px 10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8em',
              }}
            >
              Clear
            </button>
          </div>
          <div style={{
            maxHeight: '300px',
            overflow: 'auto',
            fontSize: '0.85em',
          }}>
            {emotionHistory.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No emotion history yet...</div>
            ) : (
              emotionHistory.map((emotion, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: '#2d2d2d',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${getMoodColor(emotion.mood)}`,
                  }}
                >
                  <div>
                    {getMoodEmoji(emotion.mood)}{' '}
                    <strong>{emotion.mood}</strong>
                    {' • '}
                    <span style={{ color: '#9ca3af' }}>{emotion.intention}</span>
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#6b7280', marginTop: '5px' }}>
                    Energy: {(emotion.energy * 100).toFixed(0)}%
                    {' | '}
                    Valence: {emotion.valence > 0 ? '+' : ''}{(emotion.valence * 100).toFixed(0)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reaction History */}
        <div style={{
          background: '#1e1e1e',
          padding: '15px',
          borderRadius: '8px',
        }}>
          <h3>⚡ Reaction History</h3>
          <div style={{
            maxHeight: '300px',
            overflow: 'auto',
            fontSize: '0.85em',
          }}>
            {reactionHistory.length === 0 ? (
              <div style={{ color: '#6b7280' }}>No reaction history yet...</div>
            ) : (
              reactionHistory.map((reaction, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    background: '#2d2d2d',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${getPriorityColor(reaction.priority)}`,
                  }}
                >
                  <div style={{ color: '#fbbf24', marginBottom: '5px' }}>
                    "{reaction.text}"
                  </div>
                  <div style={{ fontSize: '0.85em', color: '#6b7280' }}>
                    <strong>{reaction.type}</strong>
                    {' • '}
                    Priority: {reaction.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#0f172a',
        borderRadius: '8px',
        fontSize: '0.9em',
        color: '#9ca3af',
      }}>
        <h4 style={{ color: '#60a5fa', marginBottom: '10px' }}>📖 Instructions</h4>
        <ol style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Click a test scenario button to simulate user input</li>
          <li>Observe emotion detection (mood, energy, valence, intention)</li>
          <li>Watch for autonomic reactions (immediate vocal feedback)</li>
          <li>Listen to TTS responses with micro-expressions</li>
          <li>Check history panels for tracking</li>
        </ol>
        <div style={{ marginTop: '10px', padding: '10px', background: '#1e293b', borderRadius: '4px' }}>
          <strong style={{ color: '#fbbf24' }}>💡 Tip:</strong>{' '}
          Compare reactions across different emotional states to see adaptivity in action.
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getMoodEmoji(mood: UserMood): string {
  const emojis: Record<UserMood, string> = {
    calm: '😌',
    curious: '🤔',
    focused: '🎯',
    excited: '🤩',
    tired: '😴',
    stressed: '😰',
    frustrated: '😤',
    happy: '😊',
    sad: '😔',
    neutral: '😐',
  };
  return emojis[mood];
}

function getMoodColor(mood: UserMood): string {
  const colors: Record<UserMood, string> = {
    calm: '#60a5fa',
    curious: '#a78bfa',
    focused: '#f59e0b',
    excited: '#fbbf24',
    tired: '#6b7280',
    stressed: '#ef4444',
    frustrated: '#f87171',
    happy: '#34d399',
    sad: '#3b82f6',
    neutral: '#9ca3af',
  };
  return colors[mood];
}

function getEnergyColor(energy: number): string {
  if (energy > 0.7) return '#34d399'; // High
  if (energy > 0.4) return '#fbbf24'; // Medium
  return '#6b7280'; // Low
}

function getValenceColor(valence: number): string {
  if (valence > 0.3) return '#34d399'; // Positive
  if (valence < -0.3) return '#ef4444'; // Negative
  return '#9ca3af'; // Neutral
}

function getPriorityColor(priority: 'low' | 'normal' | 'high'): string {
  const colors = {
    low: '#6b7280',
    normal: '#3b82f6',
    high: '#ef4444',
  };
  return colors[priority];
}

export default AutonomicVoiceDemo;
