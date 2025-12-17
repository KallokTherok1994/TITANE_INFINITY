/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.1 — TIME CENTER
 *
 * Centre unifié fusionnant 3 modules en un seul super-centre temporel:
 * - Temporal Flow Center (Agenda + Navigation temporelle)
 * - Agenda Page (Planning intelligent + Time-blocking)
 * - Time Navigator (Snapshots système + Voyage temporel)
 *
 * C'est le "CŒUR DU TEMPS" ultime de TITANE∞
 * Temps + Énergie + Priorités + Navigation + Snapshots + Flow
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from 'react';
import { secureInvoke } from '@/lib/security';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import './TimePage.css';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type TabId = 'now' | 'agenda' | 'timeline' | 'snapshots' | 'intelligence' | 'flow';

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

interface Snapshot {
  id: string;
  timestamp: number;
  version: string;
  size: number;
  checksum: string;
  context: SnapshotContext;
}

interface SnapshotContext {
  xp: number;
  level: number;
  activeEngines: string[];
  designSystem: string;
  personaMood: string;
}

interface TravelStats {
  totalSnapshots: number;
  ramCacheSize: number;
  diskUsageBytes: number;
  oldestSnapshot: number;
  newestSnapshot: number;
}

interface FlowState {
  isInFlow: boolean;
  flowIntensity: number; // 0-100
  flowDuration: number; // minutes
  lastFlowSession: Date | null;
  totalFlowToday: number; // minutes
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const TimePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('now');
  const [currentDate] = useState<Date>(new Date());
  const [currentEnergy] = useState<number>(72);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [flowState] = useState<FlowState>({
    isInFlow: false,
    flowIntensity: 0,
    flowDuration: 0,
    lastFlowSession: null,
    totalFlowToday: 0,
  });

  // Mock data
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

  // Load snapshots & stats
  useEffect(() => {
    loadSnapshots();
    loadStats();
    const interval = setInterval(loadStats, REFRESH_INTERVALS.SLOW);
    return () => clearInterval(interval);
  }, []);

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      const response = await secureInvoke<Snapshot[]>('list_snapshots');
      setSnapshots(response.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to load snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await secureInvoke<TravelStats>('get_travel_stats');
      setStats(response);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <div className="time-page p-6 space-y-6 bg-gray-900 min-h-screen text-gray-100">
      {/* Header */}
      <div className="header mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">🕐</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
            TIME — Centre Temporel Unifié
          </h1>
        </div>
        <p className="text-gray-400">
          Le cœur du temps TITANE∞ — Agenda, Navigation, Snapshots, Intelligence & Flow
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs flex gap-2 border-b border-gray-700 pb-4 overflow-x-auto">
        {[
          { id: 'now', label: '⚡ Maintenant', desc: "Aujourd'hui" },
          { id: 'agenda', label: '📅 Agenda', desc: 'Planning' },
          { id: 'timeline', label: '🧭 Timeline', desc: 'Navigation' },
          { id: 'snapshots', label: '⏮️ Snapshots', desc: 'Voyage' },
          { id: 'intelligence', label: '🧠 Intelligence', desc: 'Analytics' },
          { id: 'flow', label: '🎯 Flow', desc: 'État flux' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
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
        {activeTab === 'snapshots' && (
          <SnapshotsSection
            snapshots={snapshots}
            selectedSnapshot={selectedSnapshot}
            setSelectedSnapshot={setSelectedSnapshot}
            stats={stats}
            loading={loading}
            loadSnapshots={loadSnapshots}
          />
        )}
        {activeTab === 'intelligence' && <IntelligenceSection />}
        {activeTab === 'flow' && <FlowSection flowState={flowState} />}
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
          Avec ton énergie actuelle à {currentEnergy}%, c'est le moment idéal pour des
          tâches créatives ou de la stratégie légère. Évite les tâches ultra-concentrées.
          Prévois une pause récupération dans 90 minutes.
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: AGENDA (Planning intelligent)
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

      {/* Agenda View */}
      {view === 'week' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">
            Semaine du 16-22 Décembre 2025
          </h3>
          <div className="text-gray-400 text-center py-12">
            <div className="text-6xl mb-4">📆</div>
            <div>Vue semaine avec time-blocks et énergie</div>
            <div className="text-sm mt-2">
              (Composant calendrier semaine à implémenter)
            </div>
          </div>
        </div>
      )}

      {view === 'month' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Décembre 2025</h3>
          <div className="text-gray-400 text-center py-12">
            <div className="text-6xl mb-4">📆</div>
            <div>Vue calendrier mois avec jalons et projets majeurs</div>
            <div className="text-sm mt-2">(Composant calendrier mois à implémenter)</div>
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
            💡 TITANE analysera ton temps disponible, tes niveaux d'énergie habituels, et
            l'importance du projet pour proposer les meilleurs créneaux.
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: TIMELINE (Navigation temporelle)
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
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500" />

          <div className="space-y-6">
            {mockEvents
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map(event => {
                const isPast = event.date < new Date();
                const isPresent =
                  Math.abs(event.date.getTime() - new Date().getTime()) <
                  7 * 24 * 60 * 60 * 1000;

                return (
                  <div key={event.id} className="relative pl-16">
                    <div
                      className={`absolute left-6 top-2 w-5 h-5 rounded-full ${
                        event.importance === 'critical'
                          ? 'bg-red-500'
                          : event.importance === 'high'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                      } ${isPresent ? 'animate-pulse ring-4 ring-cyan-500/50' : ''}`}
                    />

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
// SECTION 4: SNAPSHOTS (Voyage temporel système)
// ═══════════════════════════════════════════════════════════════════

interface SnapshotsSectionProps {
  snapshots: Snapshot[];
  selectedSnapshot: Snapshot | null;
  setSelectedSnapshot: (snapshot: Snapshot | null) => void;
  stats: TravelStats | null;
  loading: boolean;
  loadSnapshots: () => Promise<void>;
}

const SnapshotsSection: React.FC<SnapshotsSectionProps> = ({
  snapshots,
  selectedSnapshot,
  setSelectedSnapshot,
  stats,
  loading,
  loadSnapshots,
}) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('fr-FR');
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const handleRestore = async (snapshot: Snapshot) => {
    if (
      !window.confirm(
        `Restaurer l'état du ${formatDate(snapshot.timestamp)} ?\n\nCette action nécessite les permissions ROOT.`
      )
    ) {
      return;
    }

    try {
      await secureInvoke('restore_snapshot', { snapshot_id: snapshot.id });
      alert('✅ Restauration réussie ! Redémarrage requis.');
      window.location.reload();
    } catch (error) {
      alert(`❌ Erreur lors de la restauration: ${error}`);
    }
  };

  const handleDelete = async (snapshot: Snapshot) => {
    if (!window.confirm(`Supprimer le snapshot du ${formatDate(snapshot.timestamp)} ?`)) {
      return;
    }

    try {
      await secureInvoke('delete_snapshot', { snapshot_id: snapshot.id });
      loadSnapshots();
    } catch (error) {
      alert(`❌ Erreur: ${error}`);
    }
  };

  return (
    <div className="snapshots-section space-y-6">
      <TSectionHeader
        title="⏮️ Snapshots Système"
        subtitle="Voyage temporel TITANE∞ - Restauration & navigation"
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <TMetric
            label="Total Snapshots"
            value={stats.totalSnapshots.toString()}
            icon="📸"
          />
          <TMetric label="Cache RAM" value={stats.ramCacheSize.toString()} icon="💾" />
          <TMetric
            label="Espace Disque"
            value={formatSize(stats.diskUsageBytes)}
            icon="💿"
          />
          <TMetric
            label="Plus Ancien"
            value={new Date(stats.oldestSnapshot * 1000).toLocaleDateString('fr-FR')}
            icon="⏪"
          />
          <TMetric
            label="Plus Récent"
            value={new Date(stats.newestSnapshot * 1000).toLocaleDateString('fr-FR')}
            icon="⏩"
          />
        </div>
      )}

      {/* Timeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">
          📜 Timeline Snapshots
        </h3>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : snapshots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Aucun snapshot disponible</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {snapshots.map(snapshot => (
              <div
                key={snapshot.id}
                onClick={() => setSelectedSnapshot(snapshot)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedSnapshot?.id === snapshot.id
                    ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/50'
                    : 'bg-gray-900 border-gray-700 hover:bg-gray-850'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">
                    {formatDate(snapshot.timestamp)}
                  </div>
                  <TBadge variant="info">v{snapshot.version}</TBadge>
                </div>
                <div className="text-sm text-gray-300">
                  Level {snapshot.context.level} | XP {snapshot.context.xp} |{' '}
                  {snapshot.context.personaMood}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatSize(snapshot.size)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot Details */}
      {selectedSnapshot && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">
            📸 Détails Snapshot
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 p-4 rounded">
              <div className="text-sm text-gray-400 mb-2">Métadonnées</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-400">ID:</span>{' '}
                  <code className="text-blue-400">{selectedSnapshot.id}</code>
                </div>
                <div>
                  <span className="text-gray-400">Timestamp:</span>{' '}
                  {formatDate(selectedSnapshot.timestamp)}
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>{' '}
                  {selectedSnapshot.version}
                </div>
                <div>
                  <span className="text-gray-400">Taille:</span>{' '}
                  {formatSize(selectedSnapshot.size)}
                </div>
                <div>
                  <span className="text-gray-400">Checksum:</span>{' '}
                  <code className="text-xs text-gray-500">
                    {selectedSnapshot.checksum.substring(0, 16)}...
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-4 rounded">
              <div className="text-sm text-gray-400 mb-2">Contexte</div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-gray-400">Level:</span>{' '}
                  {selectedSnapshot.context.level}
                </div>
                <div>
                  <span className="text-gray-400">XP:</span> {selectedSnapshot.context.xp}
                </div>
                <div>
                  <span className="text-gray-400">Engines:</span>{' '}
                  {selectedSnapshot.context.activeEngines.join(', ')}
                </div>
                <div>
                  <span className="text-gray-400">Design:</span>{' '}
                  {selectedSnapshot.context.designSystem}
                </div>
                <div>
                  <span className="text-gray-400">Mood:</span>{' '}
                  {selectedSnapshot.context.personaMood}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleRestore(selectedSnapshot)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              🔄 Restaurer
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors">
              🔍 Comparer
            </button>
            <button
              onClick={() => handleDelete(selectedSnapshot)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: INTELLIGENCE (Analytics temporels)
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
              <div className="font-medium">Pic d'efficacité</div>
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

      {/* Recommandations */}
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
                Réserve 9h-11h pour deep work uniquement. Pas de réunions, pas d'emails.
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
                d'activité.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rituels */}
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

      {/* Métriques */}
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
// SECTION 6: FLOW (État de flux)
// ═══════════════════════════════════════════════════════════════════

interface FlowSectionProps {
  flowState: FlowState;
}

const FlowSection: React.FC<FlowSectionProps> = ({ flowState }) => {
  return (
    <div className="flow-section space-y-6">
      <TSectionHeader
        title="🎯 État de Flow"
        subtitle="Détection et optimisation de l'état de flux"
      />

      {/* État actuel */}
      <div
        className={`rounded-lg p-6 border ${flowState.isInFlow ? 'bg-gradient-to-r from-green-900 to-emerald-900 border-green-600' : 'bg-gray-800 border-gray-700'}`}
      >
        <h3 className="text-xl font-semibold mb-4 text-green-300">
          {flowState.isInFlow ? '🌊 EN FLOW ACTUELLEMENT' : '⏸️ Pas en Flow'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/20 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Intensité</div>
            <div className="text-2xl font-bold">{flowState.flowIntensity}%</div>
            <div className="h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${flowState.flowIntensity}%` }}
              />
            </div>
          </div>
          <div className="bg-black/20 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Durée Session</div>
            <div className="text-2xl font-bold">{flowState.flowDuration} min</div>
          </div>
          <div className="bg-black/20 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Flow Aujourd'hui</div>
            <div className="text-2xl font-bold">{flowState.totalFlowToday} min</div>
          </div>
        </div>
      </div>

      {/* Sessions récentes */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">
          📊 Sessions Deep Work Récentes
        </h3>
        <div className="space-y-3">
          {[
            {
              date: "Aujourd'hui 09:00",
              duration: 87,
              intensity: 92,
              activity: 'Architecture v25',
            },
            { date: 'Hier 14:30', duration: 105, intensity: 88, activity: 'Code review' },
            {
              date: 'Hier 09:15',
              duration: 95,
              intensity: 85,
              activity: 'Fusion modules',
            },
          ].map((session, index) => (
            <div key={index} className="bg-gray-900 p-4 rounded flex items-center gap-4">
              <div className="flex-1">
                <div className="font-medium mb-1">{session.activity}</div>
                <div className="text-sm text-gray-400">{session.date}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Durée</div>
                <div className="font-semibold">{session.duration} min</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Intensité</div>
                <div className="font-semibold text-green-400">{session.intensity}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommandations Flow */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-lg p-6 border border-indigo-700">
        <h3 className="text-xl font-semibold mb-4 text-indigo-300">
          ✨ Optimisation Flow
        </h3>
        <div className="space-y-2 text-indigo-100">
          <div>🎯 Créneau optimal détecté: 9h-11h (92% intensité moyenne)</div>
          <div>⚡ Prochaine session recommandée: Demain 09:00 (90min)</div>
          <div>🔋 Recovery needed: 15min avant prochaine session</div>
          <div>📈 Objectif hebdomadaire: 12h de flow (actuellement: 8.5h)</div>
        </div>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TMetric label="Sessions Cette Semaine" value="12" icon="🎯" />
        <TMetric label="Intensité Moyenne" value="87%" icon="⚡" />
        <TMetric label="Durée Moyenne" value="92 min" icon="⏱️" />
        <TMetric label="Meilleur Créneau" value="9h-11h" icon="🌅" />
      </div>
    </div>
  );
};
