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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tauriClient } from '@/lib/tauriClient';
import { useToast } from '@/hooks/useToast';
import { useTimeAgenda } from '@/hooks/useTimeAgenda';
import type { AgendaEvent } from '@/engines/time';
import { REFRESH_INTERVALS } from '@/constants/timeouts';
import { TBadge, TMetric, TSectionHeader } from '../design-system';
import './TimePage.css';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

type TabId = 'now' | 'agenda' | 'timeline' | 'snapshots' | 'cognitive';

const VALID_TABS: TabId[] = ['now', 'agenda', 'timeline', 'snapshots', 'cognitive'];

const isTabId = (value: string | null): value is TabId => {
  return value !== null && VALID_TABS.includes(value as TabId);
};

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

interface CognitiveStateSnapshot {
  flowActive: boolean;
  energy: number;
  mode: string;
  updatedAt: number;
  segment?: string;
  todayFocusMinutes?: number;
}

const isSameCalendarDay = (left: Date, right: Date): boolean => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const getEventDurationMinutes = (event: AgendaEvent): number => {
  return Math.max(
    0,
    Math.round(
      (new Date(event.endDateTime).getTime() - new Date(event.startDateTime).getTime()) /
        60000
    )
  );
};

const formatAgendaTime = (isoDateTime: string): string => {
  return new Date(isoDateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapAgendaCategoryToBlockType = (category: AgendaEvent['category']): TimeBlock['type'] => {
  switch (category) {
    case 'meeting':
      return 'meeting';
    case 'break':
      return 'break';
    case 'creative':
      return 'creative';
    case 'personal':
    case 'routine':
      return 'admin';
    default:
      return 'focus';
  }
};

const mapAgendaPriority = (priority: AgendaEvent['priority']): TimeBlock['priority'] => {
  switch (priority) {
    case 'critical':
    case 'urgent':
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      return 'low';
  }
};

const mapAgendaEventToTimeBlock = (event: AgendaEvent): TimeBlock => ({
  id: event.id,
  start: formatAgendaTime(event.startDateTime),
  end: formatAgendaTime(event.endDateTime),
  title: event.title,
  type: mapAgendaCategoryToBlockType(event.category),
  priority: mapAgendaPriority(event.priority),
  energy: Math.round((event.energyRequired ?? 0.75) * 100),
});

const readStoredCognitiveState = (
  fallbackEnergy: number,
  currentSegment: string,
  todayFocusMinutes: number,
  isWorkHours: boolean
): CognitiveStateSnapshot => {
  const fallback: CognitiveStateSnapshot = {
    flowActive: false,
    energy: fallbackEnergy,
    mode: isWorkHours ? 'planning' : 'recovery',
    updatedAt: Date.now(),
    segment: currentSegment,
    todayFocusMinutes,
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem('titane_cognitive_state');
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<CognitiveStateSnapshot> | null;
    if (!parsed) {
      return fallback;
    }

    return {
      flowActive: parsed.flowActive === true,
      energy:
        typeof parsed.energy === 'number' && Number.isFinite(parsed.energy)
          ? parsed.energy
          : fallbackEnergy,
      mode: typeof parsed.mode === 'string' && parsed.mode.trim() ? parsed.mode : fallback.mode,
      updatedAt:
        typeof parsed.updatedAt === 'number' && Number.isFinite(parsed.updatedAt)
          ? parsed.updatedAt
          : Date.now(),
      segment:
        typeof parsed.segment === 'string' && parsed.segment.trim()
          ? parsed.segment
          : currentSegment,
      todayFocusMinutes:
        typeof parsed.todayFocusMinutes === 'number' && Number.isFinite(parsed.todayFocusMinutes)
          ? parsed.todayFocusMinutes
          : todayFocusMinutes,
    };
  } catch {
    return fallback;
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const TimePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const requestedTab = searchParams.get('tab');
    return isTabId(requestedTab) ? requestedTab : 'now';
  });
  const {
    timeState,
    events: agendaEvents,
    energyState,
    agendaMeta,
    loading: agendaLoading,
    initialized: agendaInitialized,
    currentDate,
    currentView,
    setCurrentView,
    goToToday,
    goToPrevious,
    goToNext,
    viewEvents,
    weekGrid,
    createQuickEvent,
    toggleEnergyOverlay,
    toggleFocusBlocks,
    stats: agendaStats,
    refresh: refreshAgenda,
  } = useTimeAgenda();

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [stats, setStats] = useState<TravelStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const currentEnergy = useMemo(() => {
    const rawLevel = energyState?.currentEnergyLevel ?? agendaStats.currentEnergy ?? 0.72;
    return Math.max(0, Math.min(100, Math.round(rawLevel * 100)));
  }, [energyState?.currentEnergyLevel, agendaStats.currentEnergy]);

  const todayBlocks = useMemo(
    () =>
      agendaEvents
        .filter(event => isSameCalendarDay(new Date(event.startDateTime), currentDate))
        .sort((left, right) => left.startDateTime.localeCompare(right.startDateTime))
        .map(mapAgendaEventToTimeBlock),
    [agendaEvents, currentDate]
  );

  const todayFocusMinutes = useMemo(
    () =>
      agendaEvents
        .filter(
          event =>
            isSameCalendarDay(new Date(event.startDateTime), currentDate) &&
            ['focus', 'work', 'creative', 'learning'].includes(event.category)
        )
        .reduce((total, event) => total + getEventDurationMinutes(event), 0),
    [agendaEvents, currentDate]
  );

  const updateActiveTab = useCallback(
    (nextTab: TabId) => {
      setActiveTab(nextTab);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('tab', nextTab);
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (isTabId(requestedTab) && requestedTab !== activeTab) {
      setActiveTab(requestedTab);
    }
  }, [activeTab, searchParams]);

  const loadSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      const response = (await tauriClient.listSnapshots()) as Snapshot[];
      setSnapshots(response.sort((a, b) => b.timestamp - a.timestamp));
      setSyncError(prev =>
        prev === 'Impossible de charger les snapshots système.' ? null : prev
      );
    } catch (error) {
      console.error('Failed to load snapshots:', error);
      setSyncError('Impossible de charger les snapshots système.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const response = (await tauriClient.getTravelStats()) as TravelStats;
      setStats(response);
      setSyncError(prev =>
        prev === 'Impossible de synchroniser les métriques temporelles.' ? null : prev
      );
    } catch (error) {
      console.error('Failed to load stats:', error);
      setSyncError('Impossible de synchroniser les métriques temporelles.');
    }
  }, []);

  // Load snapshots & stats
  useEffect(() => {
    void refreshAgenda();
    void loadSnapshots();
    void loadStats();
    const interval = setInterval(() => {
      void loadStats();
    }, REFRESH_INTERVALS.SLOW);
    return () => clearInterval(interval);
  }, [loadSnapshots, loadStats, refreshAgenda]);

  return (
    <div
      className="time-page p-6 space-y-6 bg-gray-900 text-gray-100"
      data-testid="page-time"
    >
      {/* Header */}
      <div className="header mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl">🕐</span>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-cyan-500 to-purple-600 bg-clip-text text-transparent">
            TIME — Centre Temporel Unifié
          </h1>
        </div>
        <p className="text-gray-400">
          Le cœur du temps TITANE∞ — Agenda, Navigation, Snapshots, Intelligence & Flow
        </p>
      </div>

      {syncError && (
        <div
          className="rounded-lg border border-amber-600 bg-amber-900/30 px-4 py-3 text-sm text-amber-100"
          data-testid="time-sync-error"
        >
          ⚠️ {syncError}
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        className="tabs flex gap-2 border-b border-gray-700 pb-4 overflow-x-auto"
        role="tablist"
        aria-label="Sections temporelles TIME"
      >
        {[
          { id: 'now', label: '⚡ Maintenant', desc: "Aujourd'hui" },
          { id: 'agenda', label: '📅 Agenda', desc: 'Planning' },
          { id: 'timeline', label: '🧭 Timeline', desc: 'Navigation' },
          { id: 'snapshots', label: '⏮️ Snapshots', desc: 'Voyage' },
          { id: 'cognitive', label: '🧠 Cognitive Engine', desc: 'Flow & Intelligence' },
        ].map(tab => (
          <button
            key={tab.id}
            data-testid={`tab-time-${tab.id}`}
            onClick={() => updateActiveTab(tab.id as TabId)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`time-panel-${tab.id}`}
            id={`time-tab-${tab.id}`}
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
      <div
        className="content"
        role="tabpanel"
        id={`time-panel-${activeTab}`}
        aria-labelledby={`time-tab-${activeTab}`}
      >
        {activeTab === 'now' && (
          <NowSection
            currentDate={new Date(timeState?.currentDateTime ?? currentDate.toISOString())}
            currentEnergy={currentEnergy}
            todayBlocks={todayBlocks}
            currentSegment={agendaStats.currentSegment}
            isWorkHours={agendaStats.isWorkHours}
            timeZone={timeState?.timeZone ?? 'Local'}
            eventsToday={agendaStats.eventsToday}
          />
        )}
        {activeTab === 'agenda' && (
          <AgendaSection
            currentDate={currentDate}
            currentView={currentView === 'month' ? 'month' : 'week'}
            setView={view => setCurrentView(view)}
            weekGrid={weekGrid}
            viewEvents={viewEvents}
            loading={agendaLoading}
            initialized={agendaInitialized}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onGoToToday={goToToday}
            onCreateQuickEvent={createQuickEvent}
            agendaMeta={agendaMeta}
            onToggleEnergyOverlay={toggleEnergyOverlay}
            onToggleFocusBlocks={toggleFocusBlocks}
          />
        )}
        {activeTab === 'timeline' && (
          <TimelineSection agendaEvents={agendaEvents} snapshots={snapshots} />
        )}
        {activeTab === 'snapshots' && (
          <SnapshotsSection
            snapshots={snapshots}
            selectedSnapshot={selectedSnapshot}
            setSelectedSnapshot={setSelectedSnapshot}
            stats={stats}
            loading={loading}
            loadSnapshots={loadSnapshots}
            loadStats={loadStats}
          />
        )}
        {activeTab === 'cognitive' && (
          <CognitiveEngineSection
            energyPercent={currentEnergy}
            currentSegment={agendaStats.currentSegment}
            todayFocusMinutes={todayFocusMinutes}
            isWorkHours={agendaStats.isWorkHours}
          />
        )}
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
  currentSegment: string;
  isWorkHours: boolean;
  timeZone: string;
  eventsToday: number;
}

const NowSection: React.FC<NowSectionProps> = ({
  currentDate,
  currentEnergy,
  todayBlocks,
  currentSegment,
  isWorkHours,
  timeZone,
  eventsToday,
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
          <div className="bg-gray-900 p-4 rounded" data-testid="time-current-segment">
            <div className="text-sm text-gray-400 mb-1">Segment</div>
            <div className="text-lg font-medium">{currentSegment}</div>
            <div className="text-xs text-gray-500 mt-1">
              {isWorkHours ? 'Heures productives actives' : 'Hors plage de travail'}
            </div>
          </div>
          <div className="bg-gray-900 p-4 rounded">
            <div className="text-sm text-gray-400 mb-1">Fuseau & charge</div>
            <div className="text-lg font-medium">{timeZone}</div>
            <div className="text-xs text-gray-500 mt-1">
              {eventsToday} événement(s) synchronisé(s) aujourd&apos;hui
            </div>
          </div>
        </div>
      </div>

      {/* Bloc actuel */}
      {currentBlock && (
        <div className="bg-linear-to-r from-blue-900 to-cyan-900 rounded-lg p-6 border border-blue-700">
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
              className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
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
      <div className="bg-linear-to-r from-purple-900 to-pink-900 rounded-lg p-6 border border-purple-700">
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
// SECTION 2: AGENDA (Planning intelligent)
// ═══════════════════════════════════════════════════════════════════

interface AgendaSectionProps {
  currentDate: Date;
  currentView: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  weekGrid: { date: Date; events: AgendaEvent[] }[];
  viewEvents: AgendaEvent[];
  loading: boolean;
  initialized: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToToday: () => void;
  onCreateQuickEvent: (title: string, startOffset?: number) => Promise<AgendaEvent>;
  agendaMeta: {
    showEnergyOverlay: boolean;
    showFocusBlocks: boolean;
  };
  onToggleEnergyOverlay: () => void;
  onToggleFocusBlocks: () => void;
}

const AgendaSection: React.FC<AgendaSectionProps> = ({
  currentDate,
  currentView,
  setView,
  weekGrid,
  viewEvents,
  loading,
  initialized,
  onPrevious,
  onNext,
  onGoToToday,
  onCreateQuickEvent,
  agendaMeta,
  onToggleEnergyOverlay,
  onToggleFocusBlocks,
}) => {
  const { success, error: errorToast } = useToast();
  const [planningPrompt, setPlanningPrompt] = useState('');

  const monthEvents = useMemo(
    () => [...viewEvents].sort((left, right) => left.startDateTime.localeCompare(right.startDateTime)),
    [viewEvents]
  );

  const handleGeneratePlan = useCallback(async () => {
    const title = planningPrompt.trim() || 'Bloc Focus TITANE';
    try {
      await onCreateQuickEvent(title, 60);
      success('Bloc agenda synchronisé avec succès.');
      setPlanningPrompt('');
    } catch (error) {
      errorToast(`Impossible de créer le bloc: ${String(error)}`);
    }
  }, [errorToast, onCreateQuickEvent, planningPrompt, success]);

  return (
    <div className="agenda-section space-y-6">
      <TSectionHeader
        title="📅 Agenda"
        subtitle="Planning synchronisé semaine/mois - Time-blocking intelligent"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          data-testid="btn-time-view-week"
          onClick={() => setView('week')}
          className={`px-4 py-2 rounded ${currentView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          📅 Semaine
        </button>
        <button
          data-testid="btn-time-view-month"
          onClick={() => setView('month')}
          className={`px-4 py-2 rounded ${currentView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          📆 Mois
        </button>
        <div className="flex-1" />
        <button
          data-testid="btn-time-prev-range"
          onClick={onPrevious}
          className="px-3 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700"
        >
          ← Précédent
        </button>
        <button
          data-testid="btn-time-today"
          onClick={onGoToToday}
          className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Aujourd&apos;hui
        </button>
        <button
          data-testid="btn-time-next-range"
          onClick={onNext}
          className="px-3 py-2 rounded bg-gray-800 text-gray-200 hover:bg-gray-700"
        >
          Suivant →
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          data-testid="btn-time-toggle-energy"
          onClick={onToggleEnergyOverlay}
          className={`px-3 py-2 rounded ${agendaMeta.showEnergyOverlay ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          {agendaMeta.showEnergyOverlay ? '🔋 Overlay énergie actif' : '🔋 Overlay énergie inactif'}
        </button>
        <button
          data-testid="btn-time-toggle-focus"
          onClick={onToggleFocusBlocks}
          className={`px-3 py-2 rounded ${agendaMeta.showFocusBlocks ? 'bg-purple-700 text-white' : 'bg-gray-800 text-gray-300'}`}
        >
          {agendaMeta.showFocusBlocks ? '🎯 Blocs focus visibles' : '🎯 Blocs focus masqués'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-semibold text-blue-400">
            {currentView === 'week'
              ? `Semaine du ${currentDate.toLocaleDateString('fr-FR')}`
              : `Mois de ${currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
          </h3>
          <span className="text-xs text-gray-400">
            {initialized ? 'Synchronisation agenda active' : 'Initialisation agenda…'}
          </span>
        </div>

        {loading && !initialized ? (
          <div className="text-gray-400 text-center py-12">Synchronisation de l&apos;agenda…</div>
        ) : currentView === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {weekGrid.map(({ date, events }) => (
              <div
                key={date.toISOString()}
                className="rounded-lg border border-gray-700 bg-gray-900 p-4"
                data-testid={`time-weekday-${date.toISOString().slice(0, 10)}`}
              >
                <div className="mb-3">
                  <div className="text-sm text-gray-400">
                    {date.toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </div>
                  <div className="text-base font-semibold text-white">
                    {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="text-sm text-gray-500">Aucun événement synchronisé</div>
                ) : (
                  <div className="space-y-2">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="rounded border border-blue-800 bg-blue-900/20 p-3"
                        data-testid="time-agenda-event"
                      >
                        <div className="text-sm font-semibold text-white">{event.title}</div>
                        <div className="text-xs text-blue-200">
                          {formatAgendaTime(event.startDateTime)} → {formatAgendaTime(event.endDateTime)}
                        </div>
                        <div className="mt-1 text-xs text-gray-300">
                          {event.category} · priorité {event.priority}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : monthEvents.length === 0 ? (
          <div className="text-gray-400 text-center py-12">
            Aucun événement synchronisé pour cette période.
          </div>
        ) : (
          <div className="space-y-3">
            {monthEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-gray-700 bg-gray-900 p-4"
              >
                <div>
                  <div className="font-semibold text-white">{event.title}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(event.startDateTime).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                </div>
                <div className="text-sm text-blue-300">
                  {formatAgendaTime(event.startDateTime)} → {formatAgendaTime(event.endDateTime)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-400">🤖 Création Intelligente</h3>
        <div className="space-y-3">
          <input
            type="text"
            data-testid="input-time-planning-prompt"
            placeholder="Ex: Planifie un bloc focus TITANE cette semaine"
            value={planningPrompt}
            onChange={event => setPlanningPrompt(event.target.value)}
            className="w-full p-3 bg-gray-900 rounded border border-gray-700 text-gray-100 placeholder-gray-500"
          />
          <div className="flex gap-2">
            <button
              data-testid="btn-time-generate-plan"
              onClick={() => void handleGeneratePlan()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              ✨ Générer avec IA
            </button>
            <button
              data-testid="btn-time-add-manual"
              onClick={() => void onCreateQuickEvent('Nouvel événement manuel', 30)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              ➕ Ajouter manuellement
            </button>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-900/20 rounded border border-blue-800">
          <div className="text-sm text-blue-300">
            💡 TITANE synchronise maintenant les blocs visibles avec l&apos;agenda réel et le contexte énergétique.
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: TIMELINE (Navigation temporelle)
// ═══════════════════════════════════════════════════════════════════

interface TimelineSectionProps {
  agendaEvents: AgendaEvent[];
  snapshots: Snapshot[];
}

const TimelineSection: React.FC<TimelineSectionProps> = ({ agendaEvents, snapshots }) => {
  const [filterPeriod, setFilterPeriod] = React.useState<
    'all' | 'past' | 'present' | 'future'
  >('all');
  const [filterType, setFilterType] = React.useState<string>('all');
  const PROJECT_ORIGIN = new Date('2025-10-20');

  const curatedEvents: TimelineEvent[] = [
    {
      id: '1',
      date: new Date('2025-10-20'),
      title: 'Début projet TITANE∞',
      type: 'life',
      description: 'Vision système vivant',
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
      date: new Date('2025-12-03'),
      title: 'UI Architecture Evolution v24.1',
      type: 'titane',
      description: '2 centres unifiés créés',
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
      date: new Date('2026-01-28'),
      title: 'TITANE v25 — Fusion Chat+Vision+EVO',
      type: 'titane',
      description: 'TitanePage unifiée 8 sections',
      importance: 'critical',
    },
    {
      id: '6',
      date: new Date('2026-02-14'),
      title: 'TITANE v26 — Mémoire & Pipeline Chat',
      type: 'titane',
      description: 'Mémoire 3 niveaux → systemPrompt, XP NaN guards',
      importance: 'critical',
    },
    {
      id: '7',
      date: new Date('2026-04-01'),
      title: 'TITANE v28 — Multi-Provider AI',
      type: 'titane',
      description: 'Claude, Gemini, fallback intelligent',
      importance: 'high',
    },
    {
      id: '8',
      date: new Date('2026-07-01'),
      title: 'Voice & Audio Premium',
      type: 'project',
      description: 'TTS/STT avancés, voice cloning',
      importance: 'medium',
    },
  ];

  const liveEvents = React.useMemo<TimelineEvent[]>(() => {
    const agendaTimeline: TimelineEvent[] = agendaEvents.map(event => {
      const timelineType: TimelineEvent['type'] =
        event.category === 'meeting'
          ? 'project'
          : event.category === 'focus' || event.category === 'work'
            ? 'titane'
            : 'life';

      const timelineImportance: TimelineEvent['importance'] =
        event.priority === 'critical' || event.priority === 'urgent'
          ? 'critical'
          : event.priority === 'high'
            ? 'high'
            : event.priority === 'medium'
              ? 'medium'
              : 'low';

      return {
        id: `agenda-${event.id}`,
        date: new Date(event.startDateTime),
        title: event.title,
        type: timelineType,
        description: `Agenda synchronisé · ${event.category} · priorité ${event.priority}`,
        importance: timelineImportance,
      };
    });

    const snapshotTimeline: TimelineEvent[] = snapshots.map(snapshot => ({
      id: `snapshot-${snapshot.id}`,
      date: new Date(snapshot.timestamp * 1000),
      title: `Snapshot ${snapshot.version}`,
      type: 'milestone' as const,
      description: `Niveau ${snapshot.context.level} · XP ${snapshot.context.xp} · ${snapshot.context.personaMood}`,
      importance: 'high' as const,
    }));

    return [...agendaTimeline, ...snapshotTimeline];
  }, [agendaEvents, snapshots]);

  const allEvents = React.useMemo(
    () => [...curatedEvents, ...liveEvents].sort((a, b) => a.date.getTime() - b.date.getTime()),
    [liveEvents]
  );

  const now = new Date();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const visibleEvents = React.useMemo(() => {
    return allEvents.filter(e => {
      if (filterType !== 'all' && e.type !== filterType) return false;
      if (filterPeriod === 'past') {
        return e.date < now && Math.abs(e.date.getTime() - now.getTime()) > ONE_WEEK_MS;
      }
      if (filterPeriod === 'present') {
        return Math.abs(e.date.getTime() - now.getTime()) <= ONE_WEEK_MS;
      }
      if (filterPeriod === 'future') {
        return e.date > now && Math.abs(e.date.getTime() - now.getTime()) > ONE_WEEK_MS;
      }
      return true;
    });
  }, [allEvents, filterPeriod, filterType, now]);

  const totalEvents = allEvents.length;
  const milestonesCount = allEvents.filter(
    e => e.importance === 'critical' || e.type === 'milestone'
  ).length;
  const daysSinceOrigin = Math.floor(
    (now.getTime() - PROJECT_ORIGIN.getTime()) / (1000 * 60 * 60 * 24)
  );
  const futureEvents = allEvents.filter(e => e.date > now).slice(0, 6);

  return (
    <div className="timeline-section space-y-6">
      <TSectionHeader
        title="🧭 Navigation Temporelle"
        subtitle="Timeline synchronisée — événements live + milestones TITANE"
      />

      {/* Timeline Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        {(
          [
            { id: 'all', label: '🕐 Tous', testId: 'btn-time-nav-all' },
            { id: 'past', label: '⏪ Passé', testId: 'btn-time-nav-past' },
            { id: 'present', label: '📍 Présent', testId: 'btn-time-nav-present' },
            { id: 'future', label: '⏩ Futur', testId: 'btn-time-nav-future' },
          ] as const
        ).map(p => (
          <button
            key={p.id}
            data-testid={p.testId}
            onClick={() => setFilterPeriod(p.id)}
            className={`px-4 py-2 rounded text-white transition-colors ${
              filterPeriod === p.id
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex gap-2">
          {(
            [
              { type: 'all', variant: 'default', label: 'Tous' },
              { type: 'life', variant: 'error', label: 'Vie' },
              { type: 'project', variant: 'warning', label: 'Projets' },
              { type: 'titane', variant: 'info', label: 'TITANE' },
            ] as const
          ).map(t => (
            <button
              key={t.type}
              onClick={() => setFilterType(t.type)}
              style={{
                opacity:
                  filterType === t.type || (filterType === 'all' && t.type === 'all')
                    ? 1
                    : 0.45,
              }}
            >
              <TBadge variant={t.variant as 'error' | 'warning' | 'info' | 'success'}>
                {t.label}
              </TBadge>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500 via-cyan-500 to-purple-500" />
          <div className="space-y-6">
            {visibleEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Aucun événement pour ce filtre.
              </div>
            ) : (
              visibleEvents.map(event => {
                const isPast =
                  event.date < now &&
                  Math.abs(event.date.getTime() - now.getTime()) > ONE_WEEK_MS;
                const isPresent =
                  Math.abs(event.date.getTime() - now.getTime()) <= ONE_WEEK_MS;
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
              })
            )}
          </div>
        </div>
      </div>

      {/* Stats Timeline — dynamiques dérivées des événements synchronisés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TMetric label="Événements synchronisés" value={String(totalEvents)} icon="📊" />
        <TMetric label="Milestones Critiques" value={String(milestonesCount)} icon="🎯" />
        <TMetric label="Jours depuis Origine" value={String(daysSinceOrigin)} icon="⏱️" />
      </div>

      {/* Projection Future */}
      <div className="bg-linear-to-r from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-700">
        <h3 className="text-xl font-semibold mb-4 text-purple-300">
          🔮 Projection Future
        </h3>
        <div className="space-y-2 text-purple-100">
          {futureEvents.length === 0 ? (
            <div className="text-gray-400 text-sm">
              Aucune projection future planifiée.
            </div>
          ) : (
            futureEvents.map(e => (
              <div key={e.id}>
                • {e.title} (
                {e.date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})
              </div>
            ))
          )}
          <div>• Phase consolidation entrepreneuriale (T2 2026)</div>
          <div>• Lancement écosystème créateurs (T3 2026)</div>
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
  loadStats: () => Promise<void>;
}

const SnapshotsSection: React.FC<SnapshotsSectionProps> = ({
  snapshots,
  selectedSnapshot,
  setSelectedSnapshot,
  stats,
  loading,
  loadSnapshots,
  loadStats,
}) => {
  const { success, error: errorToast } = useToast();
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
      await tauriClient.restoreSnapshot({ snapshot_id: snapshot.id });
      success('Restauration réussie ! Redémarrage requis.');
      window.location.reload();
    } catch (error) {
      errorToast(`Erreur lors de la restauration: ${error}`);
    }
  };

  const handleDelete = async (snapshot: Snapshot) => {
    if (!window.confirm(`Supprimer le snapshot du ${formatDate(snapshot.timestamp)} ?`)) {
      return;
    }

    try {
      await tauriClient.deleteSnapshot({ snapshot_id: snapshot.id });
      if (selectedSnapshot?.id === snapshot.id) {
        setSelectedSnapshot(null);
      }
      await Promise.all([loadSnapshots(), loadStats()]);
    } catch (error) {
      errorToast(`Erreur: ${error}`);
    }
  };

  const handleCreateSnapshot = async () => {
    try {
      await tauriClient.titanForceSnapshot({ reason: 'manual_time_page' });
      await Promise.all([loadSnapshots(), loadStats()]);
      success('Snapshot créé avec succès.');
    } catch (error) {
      errorToast(`Erreur création snapshot: ${error}`);
    }
  };

  return (
    <div className="snapshots-section space-y-6">
      <TSectionHeader
        title="⏮️ Snapshots Système"
        subtitle="Voyage temporel TITANE∞ - Restauration & navigation"
      />

      <div className="flex justify-end">
        <button
          data-testid="btn-time-create-snapshot"
          onClick={handleCreateSnapshot}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white transition-colors"
        >
          ➕ Créer Snapshot
        </button>
      </div>

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
                data-testid={`btn-snapshot-select-${snapshot.id}`}
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
              data-testid="btn-time-restore-snapshot"
              onClick={() => handleRestore(selectedSnapshot)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              🔄 Restaurer
            </button>
            <button
              data-testid="btn-time-compare-snapshot"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              🔍 Comparer
            </button>
            <button
              data-testid="btn-time-delete-snapshot"
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
// SECTION 5+6: COGNITIVE ENGINE (Flow + Intelligence fusionnés)
// ═══════════════════════════════════════════════════════════════════

interface CognitiveEngineSectionProps {
  energyPercent: number;
  currentSegment: string;
  todayFocusMinutes: number;
  isWorkHours: boolean;
}

const CognitiveEngineSection: React.FC<CognitiveEngineSectionProps> = ({
  energyPercent,
  currentSegment,
  todayFocusMinutes,
  isWorkHours,
}) => {
  const [cognitiveState, setCognitiveState] = React.useState<CognitiveStateSnapshot>(() =>
    readStoredCognitiveState(energyPercent, currentSegment, todayFocusMinutes, isWorkHours)
  );

  React.useEffect(() => {
    setCognitiveState(prev => {
      const next = {
        ...prev,
        energy: energyPercent,
        mode: prev.flowActive ? 'deep-work' : isWorkHours ? 'planning' : 'recovery',
        segment: currentSegment,
        todayFocusMinutes,
      };

      try {
        localStorage.setItem('titane_cognitive_state', JSON.stringify(next));
      } catch {
        // non-blocking
      }

      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [energyPercent, currentSegment, todayFocusMinutes, isWorkHours]);

  const flowState = React.useMemo<FlowState>(() => {
    const flowDuration = cognitiveState.flowActive
      ? Math.max(1, Math.round((Date.now() - cognitiveState.updatedAt) / 60000))
      : 0;

    return {
      isInFlow: cognitiveState.flowActive,
      flowIntensity: cognitiveState.flowActive ? energyPercent : 0,
      flowDuration,
      lastFlowSession: cognitiveState.updatedAt ? new Date(cognitiveState.updatedAt) : null,
      totalFlowToday: todayFocusMinutes,
    };
  }, [cognitiveState, energyPercent, todayFocusMinutes]);

  const handleToggleFlow = React.useCallback(() => {
    setCognitiveState(prev => {
      const nextFlowActive = !prev.flowActive;
      const next = {
        ...prev,
        flowActive: nextFlowActive,
        energy: energyPercent,
        mode: nextFlowActive ? 'deep-work' : isWorkHours ? 'planning' : 'recovery',
        segment: currentSegment,
        todayFocusMinutes,
        updatedAt: Date.now(),
      };

      try {
        localStorage.setItem('titane_cognitive_state', JSON.stringify(next));
      } catch {
        // non-blocking
      }

      return next;
    });
  }, [energyPercent, currentSegment, todayFocusMinutes, isWorkHours]);

  return (
    <div className="cognitive-engine-section space-y-6">
      <TSectionHeader
        title="🧠 Cognitive Engine"
        subtitle="Flow, Intelligence & Optimisation"
      />

      {/* ── SESSION FLOW TOGGLE ── */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">
            {cognitiveState.flowActive
              ? '🌊 Session Flow active'
              : '⏸️ Aucune session Flow'}
          </div>
          <div className="text-sm text-gray-400">
            {cognitiveState.flowActive
              ? 'Mode deep-work engagé'
              : 'Démarre une session pour activer le mode cognitif'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Segment actif: {currentSegment} · Mode: {cognitiveState.mode}
          </div>
        </div>
        <button
          data-testid="btn-time-flow-toggle"
          onClick={handleToggleFlow}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${cognitiveState.flowActive ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-green-700 hover:bg-green-600 text-white'}`}
        >
          {cognitiveState.flowActive ? '⏹ Arrêter Session' : '▶ Démarrer Session Flow'}
        </button>
      </div>

      {/* ── FLOW STATE ── */}
      <div
        className={`rounded-lg p-6 border ${flowState.isInFlow ? 'bg-linear-to-r from-green-900 to-emerald-900 border-green-600' : 'bg-gray-800 border-gray-700'}`}
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
            <div className="text-sm text-gray-400 mb-1">Flow Aujourd&apos;hui</div>
            <div className="text-2xl font-bold">{flowState.totalFlowToday} min</div>
          </div>
        </div>
      </div>

      {/* ── SESSIONS DEEP WORK ── */}
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

      {/* ── OPTIMISATION FLOW ── */}
      <div className="bg-linear-to-r from-indigo-900 to-purple-900 rounded-lg p-6 border border-indigo-700">
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

      {/* ── KPIs FLOW ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TMetric label="Sessions Cette Semaine" value="12" icon="🎯" />
        <TMetric label="Intensité Moyenne" value="87%" icon="⚡" />
        <TMetric label="Durée Moyenne" value="92 min" icon="⏱️" />
        <TMetric label="Meilleur Créneau" value="9h-11h" icon="🌅" />
      </div>

      {/* ── SÉPARATEUR ── */}
      <div className="border-t border-gray-700 pt-2">
        <div className="text-xs text-gray-500 uppercase tracking-wider">
          ─── Intelligence Temporelle ───
        </div>
      </div>

      {/* ── ANALYSES DE PATTERNS ── */}
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

      {/* ── RECOMMANDATIONS TITANE ── */}
      <div className="bg-linear-to-r from-cyan-900 to-blue-900 rounded-lg p-6 border border-cyan-700">
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

      {/* ── RITUELS TEMPORELS ── */}
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

      {/* ── KPIs INTELLIGENCE ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TMetric label="Score Optimisation" value="78%" icon="📈" />
        <TMetric label="Respect Rituels" value="82%" icon="✅" />
        <TMetric label="Surcharges Évitées" value="12" icon="🛡️" />
        <TMetric label="Énergie Moyenne" value="71%" icon="⚡" />
      </div>
    </div>
  );
};
