/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — AGENDA PAGE
 * Page complète de gestion de l'agenda avec vues jour/semaine/mois
 * ═══════════════════════════════════════════════════════════════════
 *
 * Design: Monochrome TITANE (#C4C4C4 / #727B81)
 * Architecture: React 18 + TypeScript + Tailwind
 */

import React, { useState, useCallback } from 'react';
import { useTimeAgenda } from '@/hooks/useTimeAgenda';
import type { AgendaEvent, EventCategory, AgendaView } from '@/engines/time';
import './AgendaPage.css';

// ═══════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════

const CATEGORY_COLORS: Record<EventCategory, string> = {
  work: '#727b81',
  meeting: '#60676d',
  focus: '#838d95',
  creative: '#9ca4ab',
  learning: '#b6bcc1',
  personal: '#93b399',
  social: '#a89f91',
  health: '#8b5f5f',
  break: '#4f5459',
  routine: '#3f4447',
};

const CATEGORY_ICONS: Record<EventCategory, string> = {
  work: '💼',
  meeting: '👥',
  focus: '🎯',
  creative: '✨',
  learning: '📚',
  personal: '🏠',
  social: '🎉',
  health: '❤️',
  break: '☕',
  routine: '🔄',
};

const VIEW_LABELS: Record<AgendaView, string> = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
};

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════

/**
 * Barre d'outils de l'agenda
 */
interface ToolbarProps {
  currentView: AgendaView;
  currentDate: Date;
  onViewChange: (view: AgendaView) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  showEnergyOverlay: boolean;
  onToggleEnergy: () => void;
}

const AgendaToolbar: React.FC<ToolbarProps> = ({
  currentView,
  currentDate,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  showEnergyOverlay,
  onToggleEnergy,
}) => {
  const formatDateRange = (): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    switch (currentView) {
      case 'day':
        return currentDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'week': {
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        const diff = day === 0 ? 6 : day - 1;
        weekStart.setDate(weekStart.getDate() - diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.getDate()} - ${weekEnd.getDate()} ${weekEnd.toLocaleDateString('fr-FR', options)}`;
      }
      case 'month':
        return currentDate.toLocaleDateString('fr-FR', options);
      default:
        return '';
    }
  };

  return (
    <div className="agenda-toolbar">
      <div className="agenda-toolbar-left">
        <button className="agenda-btn agenda-btn-today" onClick={onToday}>
          Aujourd&apos;hui
        </button>
        <div className="agenda-nav-group">
          <button className="agenda-btn agenda-btn-nav" onClick={onPrevious}>
            ←
          </button>
          <button className="agenda-btn agenda-btn-nav" onClick={onNext}>
            →
          </button>
        </div>
        <span className="agenda-date-range">{formatDateRange()}</span>
      </div>

      <div className="agenda-toolbar-center">
        {(['day', 'week', 'month'] as AgendaView[]).map(view => (
          <button
            key={view}
            className={`agenda-btn agenda-btn-view ${currentView === view ? 'active' : ''}`}
            onClick={() => onViewChange(view)}
          >
            {VIEW_LABELS[view]}
          </button>
        ))}
      </div>

      <div className="agenda-toolbar-right">
        <button
          className={`agenda-btn agenda-btn-toggle ${showEnergyOverlay ? 'active' : ''}`}
          onClick={onToggleEnergy}
          title="Afficher l'énergie"
        >
          🔋
        </button>
      </div>
    </div>
  );
};

/**
 * Carte d'événement
 */
interface EventCardProps {
  event: AgendaEvent;
  compact?: boolean;
  onClick?: (event: AgendaEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, compact = false, onClick }) => {
  const startTime = new Date(event.startDateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = new Date(event.endDateTime).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const categoryColor = CATEGORY_COLORS[event.category] || '#727b81';
  const categoryIcon = CATEGORY_ICONS[event.category] || '📌';

  const priorityBadge = event.priorityScore ? (
    <span className={`event-priority-badge priority-${event.priority}`}>
      {event.priorityScore}
    </span>
  ) : null;

  if (compact) {
    return (
      <div
        className="event-card event-card-compact"
        style={{ borderLeftColor: categoryColor }}
        onClick={() => onClick?.(event)}
      >
        <span className="event-icon">{categoryIcon}</span>
        <span className="event-title">{event.title}</span>
        {priorityBadge}
      </div>
    );
  }

  return (
    <div
      className="event-card"
      style={{ borderLeftColor: categoryColor }}
      onClick={() => onClick?.(event)}
    >
      <div className="event-header">
        <span className="event-icon">{categoryIcon}</span>
        <span className="event-time">
          {startTime} - {endTime}
        </span>
        {priorityBadge}
      </div>
      <div className="event-title">{event.title}</div>
      {event.description && <div className="event-description">{event.description}</div>}
      {event.tags.length > 0 && (
        <div className="event-tags">
          {event.tags.slice(0, 3).map(tag => (
            <span key={tag} className="event-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Vue jour
 */
interface DayViewProps {
  date: Date;
  dayGrid: { hour: number; events: AgendaEvent[] }[];
  energyLevels?: Record<number, number>;
  showEnergy: boolean;
  onEventClick?: (event: AgendaEvent) => void;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  dayGrid,
  energyLevels,
  showEnergy,
  onEventClick,
}) => {
  return (
    <div className="agenda-day-view">
      <div className="day-header">
        <span className="day-name">
          {date.toLocaleDateString('fr-FR', { weekday: 'long' })}
        </span>
        <span className="day-date">
          {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </span>
      </div>
      <div className="day-grid">
        {dayGrid.map(({ hour, events }) => {
          const energyLevel = energyLevels?.[hour] ?? 0.5;
          const energyClass =
            energyLevel >= 0.75 ? 'high' : energyLevel >= 0.5 ? 'medium' : 'low';

          return (
            <div key={hour} className="day-row">
              <div className="day-hour">{hour.toString().padStart(2, '0')}:00</div>
              {showEnergy && (
                <div className={`day-energy energy-${energyClass}`}>
                  <div
                    className="energy-bar"
                    style={{ height: `${energyLevel * 100}%` }}
                  />
                </div>
              )}
              <div className="day-events">
                {events.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Vue semaine
 */
interface WeekViewProps {
  weekGrid: { date: Date; events: AgendaEvent[] }[];
  currentDate: Date;
  showEnergy: boolean;
  onEventClick?: (event: AgendaEvent) => void;
  onDayClick?: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  weekGrid,
  currentDate,
  showEnergy: _showEnergy,
  onEventClick,
  onDayClick,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="agenda-week-view">
      <div className="week-header">
        {weekGrid.map(({ date }) => {
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === currentDate.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`week-day-header ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => onDayClick?.(date)}
            >
              <span className="week-day-name">
                {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
              <span className="week-day-number">{date.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="week-body">
        {weekGrid.map(({ date, events }) => {
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`week-day-column ${isToday ? 'today' : ''}`}
            >
              {events.length === 0 ? (
                <div className="week-day-empty">-</div>
              ) : (
                events
                  .slice(0, 5)
                  .map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      compact
                      onClick={onEventClick}
                    />
                  ))
              )}
              {events.length > 5 && (
                <div className="week-day-more">+{events.length - 5} autres</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Vue mois
 */
interface MonthViewProps {
  monthGrid: { date: Date; events: AgendaEvent[]; isCurrentMonth: boolean }[];
  currentDate: Date;
  onEventClick?: (event: AgendaEvent) => void;
  onDayClick?: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  monthGrid,
  currentDate: _currentDate,
  onEventClick,
  onDayClick,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // En-têtes des jours
  const dayHeaders = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="agenda-month-view">
      <div className="month-header">
        {dayHeaders.map(day => (
          <div key={day} className="month-day-header">
            {day}
          </div>
        ))}
      </div>
      <div className="month-body">
        {monthGrid.map(({ date, events, isCurrentMonth }) => {
          const isToday = date.toDateString() === today.toDateString();

          return (
            <div
              key={date.toISOString()}
              className={`month-day-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`}
              onClick={() => onDayClick?.(date)}
            >
              <span className="month-day-number">{date.getDate()}</span>
              <div className="month-day-events">
                {events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="month-event-dot"
                    style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                    title={event.title}
                    onClick={e => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  />
                ))}
                {events.length > 3 && (
                  <span className="month-events-count">+{events.length - 3}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Sidebar avec résumé et énergie
 */
interface SidebarProps {
  stats: {
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
    currentEnergy: number;
    currentSegment: string;
    isWorkHours: boolean;
  };
  todayEvents: AgendaEvent[];
  onEventClick?: (event: AgendaEvent) => void;
}

const AgendaSidebar: React.FC<SidebarProps> = ({ stats, todayEvents, onEventClick }) => {
  const energyPercent = Math.round(stats.currentEnergy * 100);
  const energyClass =
    stats.currentEnergy >= 0.75 ? 'high' : stats.currentEnergy >= 0.5 ? 'medium' : 'low';

  return (
    <aside className="agenda-sidebar">
      {/* Résumé du jour */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">📊 Aujourd&apos;hui</h3>
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.eventsToday}</span>
            <span className="stat-label">événements</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.currentSegment}</span>
            <span className="stat-label">segment</span>
          </div>
          <div className="stat-item">
            <span className={`stat-value ${stats.isWorkHours ? 'work' : ''}`}>
              {stats.isWorkHours ? '💼' : '🏠'}
            </span>
            <span className="stat-label">
              {stats.isWorkHours ? 'Travail' : 'Personnel'}
            </span>
          </div>
        </div>
      </div>

      {/* Niveau d'énergie */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">🔋 Énergie</h3>
        <div className={`energy-display energy-${energyClass}`}>
          <div className="energy-circle">
            <svg viewBox="0 0 36 36" className="energy-svg">
              <path
                className="energy-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="energy-fill"
                strokeDasharray={`${energyPercent}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="energy-percent">{energyPercent}%</span>
          </div>
          <span className="energy-label">
            {energyClass === 'high'
              ? 'Haute énergie'
              : energyClass === 'medium'
                ? 'Énergie normale'
                : 'Basse énergie'}
          </span>
        </div>
      </div>

      {/* Événements à venir */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">📅 À venir</h3>
        <div className="upcoming-events">
          {todayEvents.length === 0 ? (
            <div className="no-events">Aucun événement aujourd&apos;hui</div>
          ) : (
            todayEvents
              .slice(0, 5)
              .map(event => (
                <EventCard key={event.id} event={event} compact onClick={onEventClick} />
              ))
          )}
        </div>
      </div>

      {/* Stats globales */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">📈 Cette semaine</h3>
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.eventsThisWeek}</span>
            <span className="stat-label">événements</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalEvents}</span>
            <span className="stat-label">total</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export const AgendaPage: React.FC = () => {
  const {
    timeState,
    energyState,
    agendaMeta,
    loading,
    initialized,
    currentDate,
    currentView,
    setCurrentDate,
    setCurrentView,
    goToToday,
    goToPrevious,
    goToNext,
    dayGrid,
    weekGrid,
    viewEvents,
    toggleEnergyOverlay,
    stats,
  } = useTimeAgenda();

  const [_selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Grille mois (calculée localement car pas dans le hook)
  const monthGrid = React.useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);

    // Premier jour de la grille (lundi précédent)
    const gridStart = new Date(start);
    const day = gridStart.getDay();
    const diff = day === 0 ? 6 : day - 1;
    gridStart.setDate(gridStart.getDate() - diff);

    const grid: { date: Date; events: AgendaEvent[]; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      grid.push({
        date: d,
        events: viewEvents.filter(e => {
          const eDate = new Date(e.startDateTime);
          return eDate.toDateString() === d.toDateString();
        }),
        isCurrentMonth: d >= start && d <= end,
      });
    }

    return grid;
  }, [currentDate, viewEvents]);

  // Événements du jour pour la sidebar
  const todayEvents = React.useMemo(() => {
    const today = new Date();
    return viewEvents.filter(e => {
      const eDate = new Date(e.startDateTime);
      return eDate.toDateString() === today.toDateString();
    });
  }, [viewEvents]);

  // Niveaux d'énergie pour la vue jour
  const energyLevels = React.useMemo(() => {
    const levels: Record<number, number> = {};
    if (energyState) {
      for (let hour = 6; hour <= 22; hour++) {
        // Calcul simple de l'énergie basé sur l'heure (simulation)
        levels[hour] = 0.5 + Math.sin((hour - 6) * 0.3) * 0.3;
      }
    }
    return levels;
  }, [energyState]);

  const handleEventClick = useCallback((event: AgendaEvent) => {
    setSelectedEvent(event);
    console.log('[AgendaPage] Événement sélectionné:', event.title);
  }, []);

  const handleDayClick = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      if (currentView === 'month') {
        setCurrentView('day');
      }
    },
    [currentView, setCurrentDate, setCurrentView]
  );

  // Affichage de chargement
  if (loading || !initialized) {
    return (
      <div className="agenda-page agenda-loading">
        <div className="loading-spinner">⏳</div>
        <span>Chargement de l&apos;agenda...</span>
      </div>
    );
  }

  return (
    <div className="agenda-page">
      {/* Header */}
      <header className="agenda-header">
        <h1 className="agenda-title">
          <span className="agenda-icon">📅</span>
          Agenda TITANE∞
        </h1>
        <p className="agenda-subtitle">
          {timeState?.currentSegment?.icon} {timeState?.currentSegment?.label} •
          {timeState?.isWorkHours ? ' 💼 Heures de travail' : ' 🏠 Temps personnel'}
        </p>
      </header>

      {/* Toolbar */}
      <AgendaToolbar
        currentView={currentView}
        currentDate={currentDate}
        onViewChange={setCurrentView}
        onToday={goToToday}
        onPrevious={goToPrevious}
        onNext={goToNext}
        showEnergyOverlay={agendaMeta.showEnergyOverlay}
        onToggleEnergy={toggleEnergyOverlay}
      />

      {/* Main Content */}
      <div className="agenda-content">
        <div className="agenda-main">
          {currentView === 'day' && (
            <DayView
              date={currentDate}
              dayGrid={dayGrid}
              energyLevels={energyLevels}
              showEnergy={agendaMeta.showEnergyOverlay}
              onEventClick={handleEventClick}
            />
          )}
          {currentView === 'week' && (
            <WeekView
              weekGrid={weekGrid}
              currentDate={currentDate}
              showEnergy={agendaMeta.showEnergyOverlay}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === 'month' && (
            <MonthView
              monthGrid={monthGrid}
              currentDate={currentDate}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
        </div>

        {/* Sidebar */}
        <AgendaSidebar
          stats={stats}
          todayEvents={todayEvents}
          onEventClick={handleEventClick}
        />
      </div>
    </div>
  );
};

export default AgendaPage;
