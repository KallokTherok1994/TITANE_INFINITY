/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v24.2 — TEMPORAL FLOW & AGENDA CENTER
 *
 * Centre unifié fusionnant 2 modules:
 * - Agenda (gestion planning & événements)
 * - Time Navigator (navigation temporelle)
 *
 * C'est le "cœur du temps" de TITANE∞
 * Temps + Énergie + Priorités + Navigation + Évolution
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import { ErrorBoundary } from '../components/ErrorBoundary';

type Tab = 'now' | 'agenda' | 'timeline' | 'intelligence';

interface TimeBlock {
  id: string;
  start: string;
  end: string;
  title: string;
  type: 'focus' | 'meeting' | 'break' | 'creative' | 'admin';
  priority: 'high' | 'medium' | 'low';
  energy: number; // 0-100
}

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  type: 'life' | 'project' | 'titane' | 'milestone';
  description: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

const TemporalFlowCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('now');
  const [currentDate] = useState<Date>(new Date());
  const [currentEnergy] = useState<number>(72); // Mock - à connecter avec Helios/Harmonia

  // Mock data - à remplacer par vrais hooks
  const todayBlocks: TimeBlock[] = [
    {
      id: '1',
      start: '09:00',
      end: '11:00',
      title: 'Deep Work - Architecture v25',
      type: 'focus',
      priority: 'high',
      energy: 85,
    },
    {
      id: '2',
      start: '11:00',
      end: '11:30',
      title: 'Pause récupération',
      type: 'break',
      priority: 'medium',
      energy: 60,
    },
    {
      id: '3',
      start: '14:00',
      end: '16:00',
      title: 'Réunion stratégique',
      type: 'meeting',
      priority: 'high',
      energy: 70,
    },
    {
      id: '4',
      start: '16:30',
      end: '18:00',
      title: 'Création contenu',
      type: 'creative',
      priority: 'medium',
      energy: 65,
    },
  ];

  return (
    <div className="temporal-flow-center p-6 space-y-6 bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="header mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
          ⏳ Centre Temps & Navigation Temporelle
        </h1>
        <p className="text-gray-400">
          Le cœur du temps de TITANE∞ — Agenda intelligent, navigation temporelle,
          optimisation énergie & priorités
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs flex gap-2 border-b border-gray-700 pb-4 overflow-x-auto">
        {[
          { id: 'now', label: '⚡ Maintenant', desc: "Vue aujourd'hui" },
          { id: 'agenda', label: '📅 Agenda', desc: 'Semaine / Mois' },
          { id: 'timeline', label: '🧭 Timeline', desc: 'Navigation temporelle' },
          { id: 'intelligence', label: '🧠 Intelligence', desc: 'Temps & Énergie' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="font-medium">{tab.label}</div>
            <div className="text-xs opacity-75">{tab.desc}</div>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="content">
        {activeTab === 'now' && (
          <NowSection
            currentDate={currentDate}
            currentEnergy={currentEnergy}
            todayBlocks={todayBlocks}
          />
        )}
        {activeTab === 'agenda' && <AgendaSection />}
        {activeTab === 'timeline' && <TimelineSection />}
        {activeTab === 'intelligence' && <IntelligenceSection />}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: NOW (Aujourd'hui)
// ═══════════════════════════════════════════════════════════════════

interface NowSectionProps {
  currentDate: Date;
  currentEnergy: number;
  todayBlocks: TimeBlock[];
}

const NowSection: React.FC<NowSectionProps> = ({
  currentDate,
  currentEnergy,
  todayBlocks,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getCurrentTimeBlock = (): TimeBlock | null => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return (
      todayBlocks.find(block => block.start <= currentTime && block.end >= currentTime) ||
      null
    );
  };

  const currentBlock = getCurrentTimeBlock();

  return (
    <div className="now-section space-y-6">
      <TSectionHeader
        title="⚡ Maintenant"
        subtitle="Contexte actuel, énergie, et actions du jour"
      />

      {/* Contexte actuel */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">📍 Contexte Actuel</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Date</div>
            <div className="text-lg font-medium">{formatDate(currentDate)}</div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Heure</div>
            <div className="text-lg font-medium">
              {currentDate.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Énergie</div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-medium">{currentEnergy}%</div>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${currentEnergy > 70 ? 'bg-green-500' : currentEnergy > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${currentEnergy}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bloc actuel */}
      {currentBlock && (
        <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-lg p-6 border border-blue-700">
          <h3 className="text-xl font-semibold mb-2 text-blue-300">🎯 En ce moment</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold mb-1">{currentBlock.title}</div>
              <div className="text-sm text-blue-300">
                {currentBlock.start} - {currentBlock.end}
              </div>
            </div>
            <div className="flex gap-2">
              <TBadge
                variant={
                  currentBlock.priority === 'high'
                    ? 'error'
                    : currentBlock.priority === 'medium'
                      ? 'warning'
                      : 'info'
                }
              >
                {currentBlock.priority === 'high'
                  ? 'Priorité haute'
                  : currentBlock.priority === 'medium'
                    ? 'Priorité moyenne'
                    : 'Priorité basse'}
              </TBadge>
              <TBadge variant="success">{currentBlock.type}</TBadge>
            </div>
          </div>
        </div>
      )}

      {/* Blocs de la journée */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">📋 Planning du Jour</h3>
        <div className="space-y-3">
          {todayBlocks.map(block => (
            <div
              key={block.id}
              className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-850 transition-colors"
            >
              <div className="text-sm font-mono text-gray-400 w-24">
                {block.start} - {block.end}
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">{block.title}</div>
                <div className="flex gap-2">
                  <TBadge variant="info">{block.type}</TBadge>
                  <TBadge
                    variant={
                      block.priority === 'high'
                        ? 'error'
                        : block.priority === 'medium'
                          ? 'warning'
                          : 'success'
                    }
                  >
                    {block.priority}
                  </TBadge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Énergie requise</div>
                <div className="text-lg font-semibold">{block.energy}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion TITANE */}
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-6 border border-purple-700">
        <h3 className="text-xl font-semibold mb-2 text-purple-300">
          ✨ Suggestion TITANE
        </h3>
        <p className="text-purple-100">
          Avec ton énergie actuelle à {currentEnergy}%, c&apos;est le moment idéal pour
          des tâches créatives ou de la stratégie légère. Évite les tâches
          ultra-concentrées. Prévois une pause récupération dans 90 minutes.
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: AGENDA (Semaine / Mois)
// ═══════════════════════════════════════════════════════════════════

const AgendaSection: React.FC = () => {
  const [view, setView] = useState<'week' | 'month'>('week');

  return (
    <div className="agenda-section space-y-6">
      <TSectionHeader
        title="📅 Agenda"
        subtitle="Planning semaine et mois - Time-blocking intelligent"
      />

      {/* View Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          📅 Semaine
        </button>
        <button
          onClick={() => setView('month')}
          className={`px-4 py-2 rounded ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          📆 Mois
        </button>
      </div>

      {/* Vue Semaine */}
      {view === 'week' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">
            Semaine du 2-8 Décembre 2025
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm text-gray-400 mb-2">{day}</div>
                <div
                  className={`p-4 rounded-lg ${index === 2 ? 'bg-blue-900 border-2 border-blue-500' : 'bg-gray-900'}`}
                >
                  <div className="text-lg font-bold mb-2">{index + 2}</div>
                  <div className="space-y-1 text-xs">
                    {index === 2 && (
                      <>
                        <div className="bg-blue-700 p-1 rounded">Deep Work</div>
                        <div className="bg-purple-700 p-1 rounded">Réunion</div>
                      </>
                    )}
                    {index === 3 && (
                      <div className="bg-green-700 p-1 rounded">Création</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vue Mois */}
      {view === 'month' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Décembre 2025</h3>
          <div className="text-gray-400 text-center py-12">
            <div className="text-6xl mb-4">📆</div>
            <div>Vue calendrier mois avec jalons et projets majeurs</div>
            <div className="text-sm mt-2">
              (À implémenter avec composant calendrier complet)
            </div>
          </div>
        </div>
      )}

      {/* Création intelligente */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">
          🤖 Création Intelligente
        </h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Ex: Planifie 3 blocs de 90min pour TITANE v25 cette semaine"
            className="w-full p-3 bg-gray-900 rounded border border-gray-700 text-gray-100 placeholder-gray-500"
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors">
              ✨ Générer avec IA
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
              ➕ Ajouter manuellement
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-900/20 rounded border border-blue-800">
          <div className="text-sm text-blue-300">
            💡 TITANE analysera ton temps disponible, tes niveaux d&apos;énergie
            habituels, et l&apos;importance du projet pour proposer les meilleurs
            créneaux.
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: TIMELINE (Navigation Temporelle)
// ═══════════════════════════════════════════════════════════════════

const TimelineSection: React.FC = () => {
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date('2025-12-03'),
      title: 'UI Architecture Evolution v24.1',
      type: 'titane',
      description: '2 centres unifiés créés',
      importance: 'critical',
    },
    {
      id: '2',
      date: new Date('2025-11-15'),
      title: 'Launch TITANE v24.0',
      type: 'titane',
      description: 'Architecture backend complète',
      importance: 'critical',
    },
    {
      id: '3',
      date: new Date('2025-10-20'),
      title: 'Début projet TITANE∞',
      type: 'life',
      description: 'Vision système vivant',
      importance: 'critical',
    },
    {
      id: '4',
      date: new Date('2025-12-10'),
      title: 'Publication livre',
      type: 'project',
      description: 'Milestone majeur',
      importance: 'high',
    },
    {
      id: '5',
      date: new Date('2026-01-15'),
      title: 'TITANE v25 - Holographic UI',
      type: 'titane',
      description: 'Future projection',
      importance: 'high',
    },
  ];

  return (
    <div className="timeline-section space-y-6">
      <TSectionHeader
        title="🧭 Navigation Temporelle"
        subtitle="Timeline vivante - Passé, présent, futur"
      />

      {/* Timeline Controls */}
      <div className="flex gap-4 items-center">
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors">
          ⏪ Passé
        </button>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors">
          📍 Présent
        </button>
        <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors">
          ⏩ Futur
        </button>
        <div className="flex-1" />
        <div className="flex gap-2">
          <TBadge variant="error">Vie</TBadge>
          <TBadge variant="warning">Projets</TBadge>
          <TBadge variant="info">TITANE</TBadge>
          <TBadge variant="success">Milestones</TBadge>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="relative">
          {/* Ligne centrale */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500" />

          {/* Événements */}
          <div className="space-y-6">
            {mockEvents
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((event, _index) => {
                const isPast = event.date < new Date();
                const isPresent =
                  Math.abs(event.date.getTime() - new Date().getTime()) <
                  7 * 24 * 60 * 60 * 1000;

                return (
                  <div key={event.id} className="relative pl-16">
                    {/* Point sur la ligne */}
                    <div
                      className={`absolute left-6 top-2 w-5 h-5 rounded-full ${
                        event.importance === 'critical'
                          ? 'bg-red-500'
                          : event.importance === 'high'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                      } ${isPresent ? 'animate-pulse ring-4 ring-cyan-500/50' : ''}`}
                    />

                    {/* Carte événement */}
                    <div
                      className={`p-4 rounded-lg border ${
                        isPresent
                          ? 'bg-cyan-900/30 border-cyan-500'
                          : isPast
                            ? 'bg-gray-900 border-gray-700'
                            : 'bg-purple-900/30 border-purple-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">
                            {event.date.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-lg font-semibold">{event.title}</div>
                        </div>
                        <TBadge
                          variant={
                            event.type === 'titane'
                              ? 'info'
                              : event.type === 'project'
                                ? 'warning'
                                : event.type === 'life'
                                  ? 'error'
                                  : 'success'
                          }
                        >
                          {event.type}
                        </TBadge>
                      </div>
                      <p className="text-sm text-gray-400">{event.description}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Stats Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TMetric label="Événements Totaux" value="147" icon="📊" />
        <TMetric label="Milestones Franchis" value="23" icon="🎯" />
        <TMetric label="Jours depuis Origine" value="52" icon="⏱️" />
      </div>

      {/* Projection Future */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-700">
        <h3 className="text-xl font-semibold mb-4 text-purple-300">
          🔮 Projection Future
        </h3>
        <div className="space-y-2 text-purple-100">
          <div>• TITANE v25 - Holographic UI (Janvier 2026)</div>
          <div>• Phase consolidation entrepreneuriale (T1 2026)</div>
          <div>• Lancement écosystème créateurs (T2 2026)</div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: INTELLIGENCE (Temps & Énergie)
// ═══════════════════════════════════════════════════════════════════

const IntelligenceSection: React.FC = () => {
  return (
    <div className="intelligence-section space-y-6">
      <TSectionHeader
        title="🧠 Intelligence Temporelle"
        subtitle="Analyses, recommandations, optimisation temps & énergie"
      />

      {/* Analyses */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">
          📊 Analyses de Patterns
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Pic d&apos;efficacité</div>
              <TBadge variant="success">Optimal</TBadge>
            </div>
            <div className="text-sm text-gray-400">
              Tu es le plus efficace entre 9h-11h et 14h-16h. 85% de tes meilleures
              sessions sont dans ces créneaux.
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Surcharge détectée</div>
              <TBadge variant="warning">Attention</TBadge>
            </div>
            <div className="text-sm text-gray-400">
              Tu compresses trop de tâches importantes en fin de journée (après 17h).
              Risque de fatigue cognitive.
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Récupération insuffisante</div>
              <TBadge variant="error">Critique</TBadge>
            </div>
            <div className="text-sm text-gray-400">
              Tu manques de plages de récupération après les gros blocs cognitifs
              (90min+). Recommandé: pause 15min tous les 90min.
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations Pédagogiques */}
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 rounded-lg p-6 border border-cyan-700">
        <h3 className="text-xl font-semibold mb-4 text-cyan-300">
          💡 Recommandations TITANE
        </h3>
        <div className="space-y-3 text-cyan-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">1️⃣</div>
            <div>
              <div className="font-medium mb-1">Protège ton pic matinal</div>
              <div className="text-sm opacity-90">
                Réserve 9h-11h pour deep work uniquement. Pas de réunions, pas
                d&apos;emails.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">2️⃣</div>
            <div>
              <div className="font-medium mb-1">Réorganise tes après-midis</div>
              <div className="text-sm opacity-90">
                Place les tâches stratégiques importantes entre 14h-16h, pas après 17h.
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">3️⃣</div>
            <div>
              <div className="font-medium mb-1">Installe des rituels de récupération</div>
              <div className="text-sm opacity-90">
                15min de pause tous les 90min. Marche, respiration, ou changement
                d&apos;activité.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rituels & Routines */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">🔄 Rituels Temporels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-lg font-medium mb-2">🌅 Matin de Création</div>
            <div className="text-sm text-gray-400 space-y-1">
              <div>• 08:00-08:30 : Réveil énergétique</div>
              <div>• 08:30-09:00 : Capture intentions</div>
              <div>• 09:00-11:00 : Deep work</div>
              <div>• 11:00-11:30 : Pause récupération</div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <div className="text-lg font-medium mb-2">🌆 Après-midi de Gestion</div>
            <div className="text-sm text-gray-400 space-y-1">
              <div>• 14:00-16:00 : Stratégie & décisions</div>
              <div>• 16:00-16:15 : Pause transition</div>
              <div>• 16:15-17:30 : Admin & communication</div>
              <div>• 17:30+ : Créatif léger ou repos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TMetric label="Score Optimisation" value="78%" icon="📈" />
        <TMetric label="Respect Rituels" value="82%" icon="✅" />
        <TMetric label="Surcharges Évitées" value="12" icon="🛡️" />
        <TMetric label="Énergie Moyenne" value="71%" icon="⚡" />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// EXPORT WITH ERROR BOUNDARY
// ═══════════════════════════════════════════════════════════════════

export default function TemporalFlowCenterWithBoundary() {
  return (
    <ErrorBoundary context="TemporalFlowCenter">
      <TemporalFlowCenter />
    </ErrorBoundary>
  );
}
