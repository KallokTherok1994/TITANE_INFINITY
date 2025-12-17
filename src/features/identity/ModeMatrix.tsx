/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ModeMatrix - Grille 6x6 des modes de fonctionnement TITANE
 * Visualise tous les modes (Architect, Mentor, Explorer, etc.) avec sélection
 */

import React, { useState, useCallback } from 'react';
import { Check, Star, Zap, Target } from 'lucide-react';
import './ModeMatrix.css';

interface Mode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | 'creation'
    | 'analysis'
    | 'communication'
    | 'optimization'
    | 'learning'
    | 'leadership';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  unlocked: boolean;
}

interface ModeMatrixProps {
  currentMode?: string;
  onModeSelect?: (mode: Mode) => void;
  showLocked?: boolean;
}

export const ModeMatrix: React.FC<ModeMatrixProps> = ({
  currentMode = 'architect',
  onModeSelect,
  showLocked = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);

  // Mode data (6x6 = 36 modes)
  const modes: Mode[] = [
    // Creation (6 modes)
    {
      id: 'architect',
      name: 'Architect',
      description: 'Conception systèmes complexes',
      icon: '🏗️',
      category: 'creation',
      level: 'expert',
      unlocked: true,
    },
    {
      id: 'designer',
      name: 'Designer',
      description: 'UI/UX et design thinking',
      icon: '🎨',
      category: 'creation',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'composer',
      name: 'Composer',
      description: 'Création contenu multimédia',
      icon: '🎼',
      category: 'creation',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'builder',
      name: 'Builder',
      description: 'Développement rapide',
      icon: '⚒️',
      category: 'creation',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'innovator',
      name: 'Innovator',
      description: 'Idéation et prototypage',
      icon: '💡',
      category: 'creation',
      level: 'advanced',
      unlocked: false,
    },
    {
      id: 'craftsman',
      name: 'Craftsman',
      description: 'Qualité artisanale',
      icon: '🔨',
      category: 'creation',
      level: 'beginner',
      unlocked: true,
    },

    // Analysis (6 modes)
    {
      id: 'researcher',
      name: 'Researcher',
      description: 'Recherche approfondie',
      icon: '🔬',
      category: 'analysis',
      level: 'expert',
      unlocked: true,
    },
    {
      id: 'detective',
      name: 'Detective',
      description: 'Investigation et debug',
      icon: '🔍',
      category: 'analysis',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'analyst',
      name: 'Analyst',
      description: 'Analyse de données',
      icon: '📊',
      category: 'analysis',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'reviewer',
      name: 'Reviewer',
      description: 'Code review et audit',
      icon: '👁️',
      category: 'analysis',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'strategist',
      name: 'Strategist',
      description: 'Planification stratégique',
      icon: '♟️',
      category: 'analysis',
      level: 'expert',
      unlocked: false,
    },
    {
      id: 'observer',
      name: 'Observer',
      description: 'Veille technologique',
      icon: '📡',
      category: 'analysis',
      level: 'beginner',
      unlocked: true,
    },

    // Communication (6 modes)
    {
      id: 'mentor',
      name: 'Mentor',
      description: 'Enseignement et guidance',
      icon: '🧙',
      category: 'communication',
      level: 'expert',
      unlocked: true,
    },
    {
      id: 'storyteller',
      name: 'Storyteller',
      description: 'Narration engageante',
      icon: '📖',
      category: 'communication',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'presenter',
      name: 'Presenter',
      description: 'Présentations claires',
      icon: '🎤',
      category: 'communication',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'collaborator',
      name: 'Collaborator',
      description: "Travail d'équipe",
      icon: '🤝',
      category: 'communication',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'diplomat',
      name: 'Diplomat',
      description: 'Médiation et consensus',
      icon: '🕊️',
      category: 'communication',
      level: 'advanced',
      unlocked: false,
    },
    {
      id: 'companion',
      name: 'Companion',
      description: 'Support émotionnel',
      icon: '💙',
      category: 'communication',
      level: 'beginner',
      unlocked: true,
    },

    // Optimization (6 modes)
    {
      id: 'optimizer',
      name: 'Optimizer',
      description: 'Performance maximale',
      icon: '⚡',
      category: 'optimization',
      level: 'expert',
      unlocked: true,
    },
    {
      id: 'refactor',
      name: 'Refactorer',
      description: 'Amélioration continue',
      icon: '♻️',
      category: 'optimization',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'debugger',
      name: 'Debugger',
      description: 'Résolution de bugs',
      icon: '🐛',
      category: 'optimization',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'tester',
      name: 'Tester',
      description: 'Tests et QA',
      icon: '✅',
      category: 'optimization',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'streamliner',
      name: 'Streamliner',
      description: 'Simplification processus',
      icon: '🌊',
      category: 'optimization',
      level: 'advanced',
      unlocked: false,
    },
    {
      id: 'cleaner',
      name: 'Cleaner',
      description: 'Nettoyage de code',
      icon: '🧹',
      category: 'optimization',
      level: 'beginner',
      unlocked: true,
    },

    // Learning (6 modes)
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Découverte technologies',
      icon: '🧭',
      category: 'learning',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'student',
      name: 'Student',
      description: 'Apprentissage actif',
      icon: '📚',
      category: 'learning',
      level: 'beginner',
      unlocked: true,
    },
    {
      id: 'experimenter',
      name: 'Experimenter',
      description: 'Tests et essais',
      icon: '🧪',
      category: 'learning',
      level: 'intermediate',
      unlocked: true,
    },
    {
      id: 'synthesizer',
      name: 'Synthesizer',
      description: 'Consolidation savoirs',
      icon: '🔗',
      category: 'learning',
      level: 'advanced',
      unlocked: true,
    },
    {
      id: 'visionary',
      name: 'Visionary',
      description: 'Anticipation tendances',
      icon: '🔮',
      category: 'learning',
      level: 'expert',
      unlocked: false,
    },
    {
      id: 'curious',
      name: 'Curious',
      description: 'Questions et curiosité',
      icon: '❓',
      category: 'learning',
      level: 'beginner',
      unlocked: true,
    },

    // Leadership (6 modes)
    {
      id: 'leader',
      name: 'Leader',
      description: 'Direction de projets',
      icon: '👑',
      category: 'leadership',
      level: 'expert',
      unlocked: false,
    },
    {
      id: 'coordinator',
      name: 'Coordinator',
      description: 'Coordination équipes',
      icon: '🎯',
      category: 'leadership',
      level: 'advanced',
      unlocked: false,
    },
    {
      id: 'motivator',
      name: 'Motivator',
      description: 'Inspiration équipe',
      icon: '🔥',
      category: 'leadership',
      level: 'intermediate',
      unlocked: false,
    },
    {
      id: 'facilitator',
      name: 'Facilitator',
      description: 'Animation réunions',
      icon: '🎪',
      category: 'leadership',
      level: 'intermediate',
      unlocked: false,
    },
    {
      id: 'visionary-lead',
      name: 'Visionary Lead',
      description: 'Vision stratégique',
      icon: '✨',
      category: 'leadership',
      level: 'expert',
      unlocked: false,
    },
    {
      id: 'supporter',
      name: 'Supporter',
      description: 'Soutien équipe',
      icon: '🛡️',
      category: 'leadership',
      level: 'beginner',
      unlocked: false,
    },
  ];

  // Filter modes
  const filteredModes = modes.filter(mode => {
    if (selectedCategory === 'all') return showLocked || mode.unlocked;
    return mode.category === selectedCategory && (showLocked || mode.unlocked);
  });

  const handleModeClick = useCallback(
    (mode: Mode) => {
      if (!mode.unlocked) return;
      setSelectedMode(mode);
      onModeSelect?.(mode);
    },
    [onModeSelect]
  );

  const categoryConfig = {
    creation: { label: 'Création', color: '#10b981', icon: '🎨' },
    analysis: { label: 'Analyse', color: '#3b82f6', icon: '🔬' },
    communication: { label: 'Communication', color: '#8b5cf6', icon: '💬' },
    optimization: { label: 'Optimisation', color: '#f59e0b', icon: '⚡' },
    learning: { label: 'Apprentissage', color: '#ec4899', icon: '📚' },
    leadership: { label: 'Leadership', color: '#ef4444', icon: '👑' },
  };

  return (
    <div className="mode-matrix-container">
      {/* Category Filter */}
      <div className="mode-matrix-filters">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Tous ({modes.filter(m => showLocked || m.unlocked).length})
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => (
          <button
            key={key}
            className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
            style={{
              borderColor: selectedCategory === key ? config.color : 'transparent',
            }}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      {/* Mode Grid (6x6) */}
      <div className="mode-matrix-grid">
        {filteredModes.map(mode => {
          const isActive = mode.id === currentMode;
          const isSelected = selectedMode?.id === mode.id;
          const categoryColor = categoryConfig[mode.category].color;

          return (
            <div
              key={mode.id}
              className={`mode-card ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${
                !mode.unlocked ? 'locked' : ''
              }`}
              onClick={() => handleModeClick(mode)}
              style={{
                borderColor:
                  isActive || isSelected ? categoryColor : 'rgba(100, 116, 139, 0.3)',
              }}
            >
              {/* Lock indicator */}
              {!mode.unlocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="active-indicator">
                  <Check size={14} />
                  <span>ACTIF</span>
                </div>
              )}

              {/* Mode icon */}
              <div className="mode-icon" style={{ background: `${categoryColor}22` }}>
                {mode.icon}
              </div>

              {/* Mode name */}
              <h4 className="mode-name">{mode.name}</h4>

              {/* Mode description */}
              <p className="mode-description">{mode.description}</p>

              {/* Level badge */}
              <div className={`mode-level level-${mode.level}`}>
                {mode.level === 'beginner' && <Target size={12} />}
                {mode.level === 'intermediate' && <Zap size={12} />}
                {mode.level === 'advanced' && <Star size={12} />}
                {mode.level === 'expert' && '👑'}
                <span>
                  {mode.level === 'beginner' && 'Débutant'}
                  {mode.level === 'intermediate' && 'Intermédiaire'}
                  {mode.level === 'advanced' && 'Avancé'}
                  {mode.level === 'expert' && 'Expert'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Mode Details */}
      {selectedMode && (
        <div className="mode-details-panel">
          <div className="mode-details-header">
            <span className="mode-details-icon">{selectedMode.icon}</span>
            <h3>{selectedMode.name}</h3>
          </div>
          <p className="mode-details-description">{selectedMode.description}</p>
          <div className="mode-details-meta">
            <span className="meta-category">
              {categoryConfig[selectedMode.category].label}
            </span>
            <span className={`meta-level level-${selectedMode.level}`}>
              Niveau: {selectedMode.level}
            </span>
          </div>
          {selectedMode.id !== currentMode && selectedMode.unlocked && (
            <button
              className="mode-activate-btn"
              onClick={() => handleModeClick(selectedMode)}
            >
              Activer ce mode
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mode-matrix-stats">
        <div className="stat">
          <span className="stat-label">Modes débloqués:</span>
          <span className="stat-value">
            {modes.filter(m => m.unlocked).length} / {modes.length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Catégories:</span>
          <span className="stat-value">{Object.keys(categoryConfig).length}</span>
        </div>
      </div>
    </div>
  );
};
