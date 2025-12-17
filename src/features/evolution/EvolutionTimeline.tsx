/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * EvolutionTimeline - Timeline interactive de l'évolution TITANE
 * Affiche chronologie des événements, consolidations, milestones
 */

import React, { useState, useMemo } from 'react';
import { Chrono } from 'react-chrono';
import { Filter, Calendar, Zap, Award, Code, Brain } from 'lucide-react';
import './EvolutionTimeline.css';

interface TimelineEvent {
  id: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string;
  cardDetailedText: string;
  date: string;
  type: 'milestone' | 'consolidation' | 'achievement' | 'learning' | 'optimization';
  importance: 'low' | 'medium' | 'high' | 'critical';
}

interface EvolutionTimelineProps {
  events?: TimelineEvent[];
  mode?: 'VERTICAL' | 'HORIZONTAL' | 'VERTICAL_ALTERNATING';
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({
  events,
  mode = 'VERTICAL_ALTERNATING',
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  // Mock events si pas de données
  const timelineEvents = useMemo(() => {
    if (events) return events;
    return generateMockEvents();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return timelineEvents;
    return timelineEvents.filter(e => e.type === selectedType);
  }, [timelineEvents, selectedType]);

  // Format for react-chrono
  const chronoItems = useMemo(() => {
    return filteredEvents.map(event => ({
      title: event.date,
      cardTitle: event.cardTitle,
      cardSubtitle: event.cardSubtitle,
      cardDetailedText: event.cardDetailedText,
    }));
  }, [filteredEvents]);

  const typeConfig = {
    milestone: { label: 'Milestones', icon: <Award size={14} />, color: '#f59e0b' },
    consolidation: { label: 'Consolidations', icon: <Brain size={14} />, color: '#8b5cf6' },
    achievement: { label: 'Achievements', icon: <Zap size={14} />, color: '#10b981' },
    learning: { label: 'Apprentissages', icon: <Code size={14} />, color: '#3b82f6' },
    optimization: { label: 'Optimisations', icon: <Zap size={14} />, color: '#ec4899' },
  };

  return (
    <div className="evolution-timeline-container">
      {/* Controls */}
      <div className="timeline-controls">
        <div className="timeline-filters">
          <button
            className={`filter-btn ${selectedType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            <Calendar size={14} />
            Tous ({timelineEvents.length})
          </button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const count = timelineEvents.filter(e => e.type === key).length;
            return (
              <button
                key={key}
                className={`filter-btn ${selectedType === key ? 'active' : ''}`}
                onClick={() => setSelectedType(key)}
                style={{
                  borderColor: selectedType === key ? config.color : 'transparent',
                }}
              >
                {config.icon}
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="timeline-stats">
          <div className="stat">
            <Filter size={14} />
            <span>{filteredEvents.length} événements</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="timeline-chrono-wrapper">
        {filteredEvents.length > 0 ? (
          <Chrono
            items={chronoItems}
            mode={mode}
            theme={{
              primary: '#8b5cf6',
              secondary: '#1e293b',
              cardBgColor: 'rgba(30, 41, 59, 0.8)',
              titleColor: '#e2e8f0',
              titleColorActive: '#ffffff',
              cardTitleColor: '#cbd5e1',
              cardSubtitleColor: '#94a3b8',
              cardDetailsColor: '#e2e8f0',
            }}
            cardHeight={150}
            slideShow
            slideItemDuration={4000}
            scrollable={{ scrollbar: true }}
            fontSizes={{
              cardSubtitle: '0.875rem',
              cardText: '0.8125rem',
              cardTitle: '1rem',
              title: '0.8125rem',
            }}
            onItemSelected={(item) => {
              const event = filteredEvents[item.index];
              setSelectedEvent(event);
            }}
          />
        ) : (
          <div className="timeline-empty">
            <Filter size={48} className="empty-icon" />
            <p>Aucun événement pour ce filtre</p>
            <button
              className="reset-filter-btn"
              onClick={() => setSelectedType('all')}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div className="event-details-panel">
          <div className="event-header">
            <div className="event-type-badge" style={{
              background: `${typeConfig[selectedEvent.type].color}22`,
              borderColor: typeConfig[selectedEvent.type].color,
            }}>
              {typeConfig[selectedEvent.type].icon}
              <span>{typeConfig[selectedEvent.type].label}</span>
            </div>
            <div className={`event-importance importance-${selectedEvent.importance}`}>
              {selectedEvent.importance === 'critical' && '🔥 Critique'}
              {selectedEvent.importance === 'high' && '⭐ Haute'}
              {selectedEvent.importance === 'medium' && '📌 Moyenne'}
              {selectedEvent.importance === 'low' && '📎 Faible'}
            </div>
          </div>
          <h3>{selectedEvent.cardTitle}</h3>
          <p className="event-date">{selectedEvent.date}</p>
          <p className="event-description">{selectedEvent.cardDetailedText}</p>
        </div>
      )}
    </div>
  );
};

// Generate mock timeline events
function generateMockEvents(): TimelineEvent[] {
  return [
    {
      id: '1',
      title: 'Déc 2024',
      cardTitle: 'Phase 1: Achievements & Charts',
      cardSubtitle: 'Consolidation majeure',
      cardDetailedText: 'Implémentation du système d\'achievements avec AchievementCard, RealTimeCharts dashboard, et ThinkingPanel pour Deep Research mode.',
      date: '15 Décembre 2024',
      type: 'milestone',
      importance: 'critical',
    },
    {
      id: '2',
      title: 'Déc 2024',
      cardTitle: 'Phase 2: Vision & Mémoire',
      cardSubtitle: 'Capacités perceptuelles',
      cardDetailedText: 'Ajout de VisionMetricsChart avec 3 types de graphiques, DetectionOverlay canvas, MemoryTreeViewer D3, et MemorySearchPanel sémantique.',
      date: '17 Décembre 2024',
      type: 'consolidation',
      importance: 'critical',
    },
    {
      id: '3',
      title: 'Nov 2024',
      cardTitle: 'Optimisation Performance',
      cardSubtitle: 'Bundle size réduit',
      cardDetailedText: 'Réduction de 30% du bundle size via code splitting, lazy loading, et optimisation des chunks Vite.',
      date: '28 Novembre 2024',
      type: 'optimization',
      importance: 'high',
    },
    {
      id: '4',
      title: 'Nov 2024',
      cardTitle: 'Achievement: Code Master',
      cardSubtitle: 'Milestone débloqué',
      cardDetailedText: 'Déverrouillage de l\'achievement "Code Master" après 1000 lignes de code TypeScript strict avec 0 erreurs.',
      date: '20 Novembre 2024',
      type: 'achievement',
      importance: 'medium',
    },
    {
      id: '5',
      title: 'Nov 2024',
      cardTitle: 'Apprentissage: React 19',
      cardSubtitle: 'Migration réussie',
      cardDetailedText: 'Migration complète vers React 19 avec hooks optimisés, Server Components, et nouvelles APIs.',
      date: '10 Novembre 2024',
      type: 'learning',
      importance: 'high',
    },
    {
      id: '6',
      title: 'Oct 2024',
      cardTitle: 'Consolidation Mémoire',
      cardSubtitle: '5000 entrées compressées',
      cardDetailedText: 'Consolidation automatique de 5000 entrées court terme vers 250 entrées moyen terme avec 87% d\'efficacité.',
      date: '25 Octobre 2024',
      type: 'consolidation',
      importance: 'medium',
    },
    {
      id: '7',
      title: 'Oct 2024',
      cardTitle: 'Milestone: v25.0 Release',
      cardSubtitle: 'Version majeure',
      cardDetailedText: 'Release de TITANE v25.0 avec fusion Chat + Vision + EVO, architecture complètement refactorée.',
      date: '1 Octobre 2024',
      type: 'milestone',
      importance: 'critical',
    },
    {
      id: '8',
      title: 'Sep 2024',
      cardTitle: 'Optimisation TypeScript',
      cardSubtitle: 'Strict mode activé',
      cardDetailedText: 'Activation du TypeScript strict mode sur l\'ensemble du codebase avec résolution de 2500+ erreurs.',
      date: '15 Septembre 2024',
      type: 'optimization',
      importance: 'high',
    },
  ];
}
