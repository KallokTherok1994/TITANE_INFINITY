/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * PersonaEditor - Éditeur de persona et style de communication
 * Permet de personnaliser le ton, le style, et les préférences
 */

import React, { useState, useCallback } from 'react';
import { Palette, Volume2, MessageSquare, Sparkles, Save, RotateCcw } from 'lucide-react';
import './PersonaEditor.css';

interface PersonaProfile {
  name: string;
  tone: 'formal' | 'casual' | 'technical' | 'creative' | 'friendly';
  verbosity: 'concise' | 'balanced' | 'detailed';
  formality: number; // 0-100
  creativity: number; // 0-100
  empathy: number; // 0-100
  technicality: number; // 0-100
  emoji: boolean;
  codeExamples: boolean;
  explanations: 'minimal' | 'moderate' | 'extensive';
}

interface PersonaEditorProps {
  initialProfile?: Partial<PersonaProfile>;
  onSave?: (profile: PersonaProfile) => void;
}

export const PersonaEditor: React.FC<PersonaEditorProps> = ({
  initialProfile,
  onSave,
}) => {
  const [profile, setProfile] = useState<PersonaProfile>({
    name: initialProfile?.name || 'Mon TITANE',
    tone: initialProfile?.tone || 'balanced',
    verbosity: initialProfile?.verbosity || 'balanced',
    formality: initialProfile?.formality ?? 50,
    creativity: initialProfile?.creativity ?? 70,
    empathy: initialProfile?.empathy ?? 60,
    technicality: initialProfile?.technicality ?? 80,
    emoji: initialProfile?.emoji ?? true,
    codeExamples: initialProfile?.codeExamples ?? true,
    explanations: initialProfile?.explanations || 'moderate',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateProfile = useCallback(<K extends keyof PersonaProfile>(
    key: K,
    value: PersonaProfile[K]
  ) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(profile);
    setHasChanges(false);
  }, [profile, onSave]);

  const handleReset = useCallback(() => {
    setProfile({
      name: 'Mon TITANE',
      tone: 'balanced',
      verbosity: 'balanced',
      formality: 50,
      creativity: 70,
      empathy: 60,
      technicality: 80,
      emoji: true,
      codeExamples: true,
      explanations: 'moderate',
    });
    setHasChanges(true);
  }, []);

  const tonePresets = [
    { value: 'formal' as const, label: 'Formel', icon: '🎩', description: 'Professionnel et précis' },
    { value: 'casual' as const, label: 'Décontracté', icon: '😊', description: 'Amical et accessible' },
    { value: 'technical' as const, label: 'Technique', icon: '🔧', description: 'Focus sur la précision' },
    { value: 'creative' as const, label: 'Créatif', icon: '🎨', description: 'Imaginatif et inspirant' },
    { value: 'friendly' as const, label: 'Amical', icon: '💙', description: 'Chaleureux et empathique' },
  ];

  return (
    <div className="persona-editor-container">
      {/* Header */}
      <div className="persona-editor-header">
        <div className="header-left">
          <Palette size={24} className="header-icon" />
          <div>
            <h3>Éditeur de Persona</h3>
            <p>Personnalisez le style et le ton de TITANE</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-reset"
            onClick={handleReset}
            title="Réinitialiser"
          >
            <RotateCcw size={16} />
            Réinitialiser
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!hasChanges}
            title="Sauvegarder"
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>

      {/* Name Input */}
      <div className="persona-section">
        <label className="section-label">
          <Sparkles size={16} />
          Nom du Persona
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={e => updateProfile('name', e.target.value)}
          className="persona-name-input"
          placeholder="Ex: Mon Assistant IA"
          maxLength={50}
        />
      </div>

      {/* Tone Presets */}
      <div className="persona-section">
        <label className="section-label">
          <Volume2 size={16} />
          Ton de Communication
        </label>
        <div className="tone-presets">
          {tonePresets.map(preset => (
            <button
              key={preset.value}
              className={`tone-preset ${profile.tone === preset.value ? 'active' : ''}`}
              onClick={() => updateProfile('tone', preset.value)}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-label">{preset.label}</span>
              <span className="preset-description">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Personality Sliders */}
      <div className="persona-section">
        <label className="section-label">
          <MessageSquare size={16} />
          Traits de Personnalité
        </label>

        <div className="slider-group">
          {/* Formality */}
          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-label">Formalité</span>
              <span className="slider-value">{profile.formality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={profile.formality}
              onChange={e => updateProfile('formality', parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${profile.formality}%, rgba(100, 116, 139, 0.3) ${profile.formality}%, rgba(100, 116, 139, 0.3) 100%)`,
              }}
            />
            <div className="slider-labels">
              <span>Décontracté</span>
              <span>Formel</span>
            </div>
          </div>

          {/* Creativity */}
          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-label">Créativité</span>
              <span className="slider-value">{profile.creativity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={profile.creativity}
              onChange={e => updateProfile('creativity', parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${profile.creativity}%, rgba(100, 116, 139, 0.3) ${profile.creativity}%, rgba(100, 116, 139, 0.3) 100%)`,
              }}
            />
            <div className="slider-labels">
              <span>Factuel</span>
              <span>Imaginatif</span>
            </div>
          </div>

          {/* Empathy */}
          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-label">Empathie</span>
              <span className="slider-value">{profile.empathy}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={profile.empathy}
              onChange={e => updateProfile('empathy', parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${profile.empathy}%, rgba(100, 116, 139, 0.3) ${profile.empathy}%, rgba(100, 116, 139, 0.3) 100%)`,
              }}
            />
            <div className="slider-labels">
              <span>Neutre</span>
              <span>Chaleureux</span>
            </div>
          </div>

          {/* Technicality */}
          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-label">Technicité</span>
              <span className="slider-value">{profile.technicality}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={profile.technicality}
              onChange={e => updateProfile('technicality', parseInt(e.target.value))}
              className="slider"
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${profile.technicality}%, rgba(100, 116, 139, 0.3) ${profile.technicality}%, rgba(100, 116, 139, 0.3) 100%)`,
              }}
            />
            <div className="slider-labels">
              <span>Simple</span>
              <span>Expert</span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Settings */}
      <div className="persona-section">
        <label className="section-label">Préférences de Réponse</label>

        <div className="response-settings">
          {/* Verbosity */}
          <div className="setting-group">
            <label className="setting-label">Verbosité</label>
            <div className="radio-group">
              <label className={`radio-option ${profile.verbosity === 'concise' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="verbosity"
                  value="concise"
                  checked={profile.verbosity === 'concise'}
                  onChange={() => updateProfile('verbosity', 'concise')}
                />
                <span>Concis</span>
              </label>
              <label className={`radio-option ${profile.verbosity === 'balanced' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="verbosity"
                  value="balanced"
                  checked={profile.verbosity === 'balanced'}
                  onChange={() => updateProfile('verbosity', 'balanced')}
                />
                <span>Équilibré</span>
              </label>
              <label className={`radio-option ${profile.verbosity === 'detailed' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="verbosity"
                  value="detailed"
                  checked={profile.verbosity === 'detailed'}
                  onChange={() => updateProfile('verbosity', 'detailed')}
                />
                <span>Détaillé</span>
              </label>
            </div>
          </div>

          {/* Explanations */}
          <div className="setting-group">
            <label className="setting-label">Explications</label>
            <div className="radio-group">
              <label className={`radio-option ${profile.explanations === 'minimal' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="explanations"
                  value="minimal"
                  checked={profile.explanations === 'minimal'}
                  onChange={() => updateProfile('explanations', 'minimal')}
                />
                <span>Minimales</span>
              </label>
              <label className={`radio-option ${profile.explanations === 'moderate' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="explanations"
                  value="moderate"
                  checked={profile.explanations === 'moderate'}
                  onChange={() => updateProfile('explanations', 'moderate')}
                />
                <span>Modérées</span>
              </label>
              <label className={`radio-option ${profile.explanations === 'extensive' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="explanations"
                  value="extensive"
                  checked={profile.explanations === 'extensive'}
                  onChange={() => updateProfile('explanations', 'extensive')}
                />
                <span>Étendues</span>
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="toggle-group">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={profile.emoji}
                onChange={e => updateProfile('emoji', e.target.checked)}
              />
              <span className="toggle-label">Utiliser des emojis</span>
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={profile.codeExamples}
                onChange={e => updateProfile('codeExamples', e.target.checked)}
              />
              <span className="toggle-label">Inclure des exemples de code</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="persona-preview">
        <h4>Aperçu du Style</h4>
        <div className="preview-content">
          <p>
            {profile.emoji && '👋 '}
            {profile.formality > 70
              ? 'Je vous présente mes salutations distinguées.'
              : profile.formality > 30
              ? 'Bonjour ! Comment puis-je vous aider ?'
              : 'Salut ! Que puis-je faire pour toi ?'}
          </p>
          <p>
            {profile.technicality > 70
              ? 'J\'utilise une approche algorithmique optimisée pour résoudre ce problème.'
              : profile.technicality > 30
              ? 'Voici une solution efficace pour ton besoin.'
              : 'Laisse-moi t\'aider avec ça de manière simple.'}
          </p>
          {profile.codeExamples && (
            <pre className="preview-code">
              <code>{`// Exemple de code\nfunction greet() {\n  return "Hello!";\n}`}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
