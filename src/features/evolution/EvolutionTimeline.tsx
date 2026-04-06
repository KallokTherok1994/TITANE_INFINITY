/**
 * TITANE∞ v30.0.0 — Proprietary License
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
    consolidation: {
      label: 'Consolidations',
      icon: <Brain size={14} />,
      color: '#8b5cf6',
    },
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
            aria-label="Filtrer les événements: Tous"
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
                aria-label={`Filtrer les événements: ${config.label}`}
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
            onItemSelected={(item: { index: number }) => {
              const event = filteredEvents[item.index];
              setSelectedEvent(event ?? null);
            }}
          />
        ) : (
          <div className="timeline-empty">
            <Filter size={48} className="empty-icon" />
            <p>Aucun événement pour ce filtre</p>
            <button
              className="reset-filter-btn"
              onClick={() => setSelectedType('all')}
              aria-label="Réinitialiser les filtres"
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
            <div
              className="event-type-badge"
              style={{
                background: `${typeConfig[selectedEvent.type].color}22`,
                borderColor: typeConfig[selectedEvent.type].color,
              }}
            >
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

// Generate curated timeline events — v29.0: mis à jour avec jalons réels 2025-2026
function generateMockEvents(): TimelineEvent[] {
  return [
    {
      id: '1',
      title: 'Mars 2026',
      cardTitle: 'v29.0 — DEV Cockpit Fusion',
      cardSubtitle: 'Consolidation cockpit développeur',
      cardDetailedText:
        'Fusion 10 tabs DEV → 5 sections par intention (Overview/Diagnostics/Operations/Validation/Security). Fix crash OrchestrationSection, heal diagnostic online, wiring DevTools execute button. Modernisation UI WAVE A+B+C (+65px conversation).',
      date: '15 Mars 2026',
      type: 'consolidation',
      importance: 'critical',
    },
    {
      id: '2',
      title: 'Mars 2026',
      cardTitle: 'v29.0 — Pipelines Chat Wiring',
      cardSubtitle: 'Connexion multi-modules → conversationEngine',
      cardDetailedText:
        'Wiring complet 6 sources dans systemPrompt : mémoire 3 niveaux, persona, XP/Evolution, CognitiveEngine. Fix loop infini usePersistentMemory (DEFAULT_LEVELS constant). Fix NaN guards XPProgressBar. IPC Rust : 12 commandes persistent_memory_v19 câblées dans main.rs.',
      date: '10 Mars 2026',
      type: 'milestone',
      importance: 'critical',
    },
    {
      id: '3',
      title: 'Fév 2026',
      cardTitle: 'v28.1 — Time & Intelligence Fusion',
      cardSubtitle: 'Timeline vivante + CognitiveEngine',
      cardDetailedText:
        'Fusion Intelligence+Flow → onglet unique CognitiveEngine avec toggle flowActive et persistance localStorage. Filtres Passé/Présent/Futur fonctionnels sur TimePage. Stats temporelles dynamiques. Roadmap Transform mise à jour 2026.',
      date: '20 Février 2026',
      type: 'consolidation',
      importance: 'high',
    },
    {
      id: '4',
      title: 'Jan 2026',
      cardTitle: 'v27.0 — Sécurité & Commandes IPC',
      cardSubtitle: 'has_secret + delete_secret + audit complet',
      cardDetailedText:
        "Ajout commandes IPC sécurisées has_secret et delete_secret dans secure_commands.rs. Audit complet des commandes orphelines. cargo check exit=0. Panneau flottant 'Cognitive Layout' supprimé et réintégré dans ADMIN.",
      date: '15 Janvier 2026',
      type: 'optimization',
      importance: 'high',
    },
    {
      id: '5',
      title: 'Déc 2025',
      cardTitle: 'v26.2 — Architecture 4-Ring Stable',
      cardSubtitle: 'Gouvernance + autoheal actif',
      cardDetailedText:
        'Architecture 4-Ring consolidée avec scripts verify_instructions.sh et detect_recurrence.sh. Système autoheal_rules.jsonl opérationnel. Release v27.0.3 scellée. E2E WebdriverIO configuré.',
      date: '01 Décembre 2025',
      type: 'milestone',
      importance: 'critical',
    },
    {
      id: '6',
      title: 'Nov 2025',
      cardTitle: 'v26.0 — DEV Center Fusion',
      cardSubtitle: '4 modules → 1 DEV Center unifié',
      cardDetailedText:
        'Fusion DevMode + ONE CORE + QA Tests + Orchestration en un seul DEV Center (8 sections). Tauri capabilities + allowlist stables. XPProgressBar + experienceService actifs. Memory architecture 3 niveaux validée.',
      date: '15 Novembre 2025',
      type: 'consolidation',
      importance: 'high',
    },
    {
      id: '7',
      title: 'Oct 2025',
      cardTitle: 'v25.4 — Persona & Mémoire Connectés',
      cardSubtitle: 'Identité → systemPrompt',
      cardDetailedText:
        'PersonaEditor persiste profil dans localStorage (ton, formalité, verbosité, emojis). readPersonaContext() injecté dans processMessage(). persistentMemoryGetContext() active les 3 niveaux de mémoire dans chaque échange. Première version AI truly-contextual.',
      date: '01 Octobre 2025',
      type: 'learning',
      importance: 'critical',
    },
    {
      id: '8',
      title: 'Sep 2025',
      cardTitle: 'v25.0 — TITANE∞ Architecture Unifiée',
      cardSubtitle: 'Chat + Vision + EVO + Memory fusionnés',
      cardDetailedText:
        'Release majeure TITANE v25.0 : architecture complètement refactorée, TitanePage conversation-first, AppLayout avec sidebar 280px, design system Titanium Dark. TypeScript strict mode, 0 erreurs TSC. Base stable pour toutes les évolutions suivantes.',
      date: '01 Septembre 2025',
      type: 'milestone',
      importance: 'critical',
    },
  ];
}
