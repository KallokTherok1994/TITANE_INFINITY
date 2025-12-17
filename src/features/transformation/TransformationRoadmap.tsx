/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * TransformationRoadmap - Roadmap visuelle des transformations
 * Affiche milestones, versions, et lignes d'évolution futures
 */

import React, { useState, useMemo } from 'react';
import { Flag, TrendingUp, Rocket, Target, CheckCircle, Circle } from 'lucide-react';
import './TransformationRoadmap.css';

interface Milestone {
  id: string;
  version: string;
  name: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned' | 'future';
  progress: number; // 0-100
  features: string[];
  quarter: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface TransformationRoadmapProps {
  milestones?: Milestone[];
  showCompleted?: boolean;
}

export const TransformationRoadmap: React.FC<TransformationRoadmapProps> = ({
  milestones,
  showCompleted = true,
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock milestones si pas de données
  const roadmapMilestones = useMemo(() => {
    if (milestones) return milestones;
    return generateMockMilestones();
  }, [milestones]);

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    let filtered = roadmapMilestones;
    
    if (!showCompleted) {
      filtered = filtered.filter(m => m.status !== 'completed');
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    return filtered;
  }, [roadmapMilestones, showCompleted, filterStatus]);

  const statusConfig = {
    completed: { label: 'Complété', color: '#10b981', icon: <CheckCircle size={16} /> },
    'in-progress': { label: 'En cours', color: '#3b82f6', icon: <TrendingUp size={16} /> },
    planned: { label: 'Planifié', color: '#f59e0b', icon: <Target size={16} /> },
    future: { label: 'Futur', color: '#64748b', icon: <Circle size={16} /> },
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#10b981';
    if (progress >= 50) return '#3b82f6';
    if (progress >= 25) return '#f59e0b';
    return '#64748b';
  };

  return (
    <div className="transformation-roadmap-container">
      {/* Header */}
      <div className="roadmap-header">
        <div className="header-info">
          <Rocket size={24} className="header-icon" />
          <div>
            <h3>Roadmap de Transformation</h3>
            <p>Évolution planifiée de TITANE∞</p>
          </div>
        </div>

        <div className="header-filters">
          <button
            className={`status-filter ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            Tous
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              className={`status-filter ${filterStatus === key ? 'active' : ''}`}
              onClick={() => setFilterStatus(key)}
              style={{
                borderColor: filterStatus === key ? config.color : 'transparent',
              }}
            >
              {config.icon}
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="roadmap-timeline">
        {filteredMilestones.map((milestone, index) => {
          const statusInfo = statusConfig[milestone.status];
          const isSelected = selectedMilestone?.id === milestone.id;

          return (
            <div
              key={milestone.id}
              className={`milestone-item ${milestone.status} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedMilestone(milestone)}
            >
              {/* Connector line */}
              {index > 0 && <div className="milestone-connector" />}

              {/* Milestone node */}
              <div
                className="milestone-node"
                style={{ background: statusInfo.color }}
              >
                {milestone.status === 'completed' ? (
                  <CheckCircle size={20} />
                ) : milestone.status === 'in-progress' ? (
                  <TrendingUp size={20} />
                ) : milestone.status === 'planned' ? (
                  <Flag size={20} />
                ) : (
                  <Circle size={20} />
                )}
              </div>

              {/* Milestone card */}
              <div
                className="milestone-card"
                style={{
                  borderColor: isSelected ? statusInfo.color : 'rgba(100, 116, 139, 0.3)',
                }}
              >
                {/* Header */}
                <div className="milestone-card-header">
                  <div className="milestone-version">{milestone.version}</div>
                  <div
                    className="milestone-status-badge"
                    style={{
                      background: `${statusInfo.color}22`,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.label}
                  </div>
                </div>

                {/* Title */}
                <h4 className="milestone-name">{milestone.name}</h4>

                {/* Quarter */}
                <p className="milestone-quarter">{milestone.quarter}</p>

                {/* Progress bar */}
                {milestone.status !== 'future' && (
                  <div className="milestone-progress-container">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${milestone.progress}%`,
                          background: getProgressColor(milestone.progress),
                        }}
                      />
                    </div>
                    <span className="progress-text">{milestone.progress}%</span>
                  </div>
                )}

                {/* Features count */}
                <div className="milestone-features-count">
                  {milestone.features.length} features
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Milestone Details */}
      {selectedMilestone && (
        <div className="milestone-details-panel">
          <div className="details-header">
            <div>
              <div className="details-version">{selectedMilestone.version}</div>
              <h3>{selectedMilestone.name}</h3>
              <p className="details-quarter">{selectedMilestone.quarter}</p>
            </div>
            <div
              className="details-status"
              style={{
                background: `${statusConfig[selectedMilestone.status].color}22`,
                borderColor: statusConfig[selectedMilestone.status].color,
              }}
            >
              {statusConfig[selectedMilestone.status].icon}
              <span>{statusConfig[selectedMilestone.status].label}</span>
            </div>
          </div>

          <p className="details-description">{selectedMilestone.description}</p>

          {selectedMilestone.status !== 'future' && (
            <div className="details-progress">
              <div className="progress-header">
                <span>Progression</span>
                <span className="progress-value">{selectedMilestone.progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${selectedMilestone.progress}%`,
                    background: getProgressColor(selectedMilestone.progress),
                  }}
                />
              </div>
            </div>
          )}

          <div className="details-features">
            <h4>Features Clés</h4>
            <ul>
              {selectedMilestone.features.map((feature, i) => (
                <li key={i}>
                  <CheckCircle size={16} className="feature-icon" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`details-importance importance-${selectedMilestone.importance}`}
          >
            Importance: {selectedMilestone.importance}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="roadmap-stats">
        <div className="stat-card">
          <span className="stat-label">Total Milestones</span>
          <span className="stat-value">{roadmapMilestones.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Complétés</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {roadmapMilestones.filter(m => m.status === 'completed').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">En cours</span>
          <span className="stat-value" style={{ color: '#3b82f6' }}>
            {roadmapMilestones.filter(m => m.status === 'in-progress').length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Planifiés</span>
          <span className="stat-value" style={{ color: '#f59e0b' }}>
            {roadmapMilestones.filter(m => m.status === 'planned').length}
          </span>
        </div>
      </div>
    </div>
  );
};

// Generate mock milestones
function generateMockMilestones(): Milestone[] {
  return [
    {
      id: '1',
      version: 'v25.0',
      name: 'Fusion Chat + Vision + EVO',
      description: 'Fusion complète des 3 modules majeurs en une interface unifiée TITANE.',
      status: 'completed',
      progress: 100,
      features: [
        'TitanePage unifiée avec 8 sections',
        'Integration Camera + Affect Estimation',
        'Dashboard EVO complet',
        'System XP et progression',
      ],
      quarter: 'Q4 2024',
      importance: 'critical',
    },
    {
      id: '2',
      version: 'v26.0',
      name: 'Vision & Mémoire Advanced',
      description: 'Amélioration des capacités perceptuelles et mémorielles avec visualisations.',
      status: 'in-progress',
      progress: 75,
      features: [
        'VisionMetricsChart (3 types)',
        'DetectionOverlay Canvas',
        'MemoryTreeViewer D3',
        'MemorySearchPanel sémantique',
      ],
      quarter: 'Q1 2025',
      importance: 'critical',
    },
    {
      id: '3',
      version: 'v27.0',
      name: 'Identité & Transformation',
      description: 'Mode Matrix 6x6, Persona Editor, et Evolution Timeline pour personnalisation avancée.',
      status: 'in-progress',
      progress: 45,
      features: [
        'ModeMatrix 36 modes',
        'PersonaEditor avec sliders',
        'EvolutionTimeline react-chrono',
        'TransformationRoadmap visual',
      ],
      quarter: 'Q1 2025',
      importance: 'high',
    },
    {
      id: '4',
      version: 'v28.0',
      name: 'AI Multi-Provider Enhanced',
      description: 'Support avancé de multiples providers IA avec fallback intelligent.',
      status: 'planned',
      progress: 0,
      features: [
        'Support GPT-5, Claude Opus 4, Gemini Ultra',
        'Fallback automatique',
        'Cost optimization',
        'Provider comparison dashboard',
      ],
      quarter: 'Q2 2025',
      importance: 'high',
    },
    {
      id: '5',
      version: 'v29.0',
      name: 'Voice & Audio Premium',
      description: 'Amélioration majeure des capacités audio avec TTS/STT avancés.',
      status: 'planned',
      progress: 0,
      features: [
        'TTS ultra-réaliste (ElevenLabs)',
        'STT temps réel (Whisper v3)',
        'Voice cloning',
        'Audio analytics',
      ],
      quarter: 'Q3 2025',
      importance: 'medium',
    },
    {
      id: '6',
      version: 'v30.0',
      name: 'Quantum Leap',
      description: 'Architecture quantique avec capacités prédictives et auto-amélioration.',
      status: 'future',
      progress: 0,
      features: [
        'Predictive AI',
        'Self-improvement loops',
        'Quantum memory architecture',
        'Meta-learning system',
      ],
      quarter: 'Q4 2025',
      importance: 'critical',
    },
  ];
}
