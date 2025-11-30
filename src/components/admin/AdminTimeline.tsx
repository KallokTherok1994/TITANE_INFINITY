/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ ADMIN ENGINE — Admin Timeline Component
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @file        AdminTimeline.tsx
 * @version     vΩ∞Ω+
 *
 * Timeline des événements et logs structurés
 * Filtrage, recherche et visualisation
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Activity,
  Database,
  Shield,
  Zap,
  RefreshCw,
} from 'lucide-react';
import type {
  AdminLogRecord,
  AdminEvent,
  LogFilters,
  LogSeverity,
  LogCategory,
  TitaneModule,
} from '../../services/adminEngine';
import {
  getAdminEngine,
  LOG_SEVERITY_COLORS,
  MODULE_DISPLAY_NAMES,
  formatTimestamp,
} from '../../services/adminEngine';

// ════════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════════

export interface AdminTimelineProps {
  className?: string;
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// ════════════════════════════════════════════════════════════════════════════════
// ICON MAPPING
// ════════════════════════════════════════════════════════════════════════════════

const SEVERITY_ICONS: Record<LogSeverity, React.ReactNode> = {
  DEBUG: <Activity size={16} />,
  INFO: <Info size={16} />,
  WARN: <AlertTriangle size={16} />,
  ERROR: <AlertCircle size={16} />,
  CRITICAL: <XCircle size={16} />,
};

const _CATEGORY_ICONS: Record<LogCategory, React.ReactNode> = {
  INFO: <Info size={16} />,
  WARN: <AlertTriangle size={16} />,
  ERROR: <XCircle size={16} />,
  ACTION: <Zap size={16} />,
  SYSTEM: <Database size={16} />,
  SECURITY: <Shield size={16} />,
  PERFORMANCE: <Activity size={16} />,
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Entrée de log individuelle
 */
const LogEntry: React.FC<{
  log: AdminLogRecord;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ log, isExpanded, onToggle }) => {
  const severityColor = LOG_SEVERITY_COLORS[log.severity];
  const icon = SEVERITY_ICONS[log.severity];
  const moduleName = MODULE_DISPLAY_NAMES[log.moduleId] || log.moduleId;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-2 pl-4 py-2"
      style={{ borderColor: severityColor }}
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <div style={{ color: severityColor }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#727B81]">
              {formatTimestamp(log.timestamp)}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${severityColor}20`, color: severityColor }}
            >
              {log.severity}
            </span>
            <span className="text-xs text-[#727B81] bg-[#333] px-1.5 py-0.5 rounded">
              {moduleName}
            </span>
            <span className="text-xs text-[#555] bg-[#222] px-1.5 py-0.5 rounded">
              {log.category}
            </span>
          </div>
          <p className="text-sm text-[#C4C4C4] mt-1 break-words">{log.message}</p>
        </div>
        <button className="text-[#727B81] hover:text-[#C4C4C4]">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-7 mt-2 overflow-hidden"
          >
            {log.details && (
              <div className="p-2 bg-[#1a1a1a] rounded text-xs text-[#727B81] mb-2">
                {log.details}
              </div>
            )}
            {log.stackTrace && (
              <pre className="p-2 bg-[#1a1a1a] rounded text-xs text-[#ef4444] overflow-x-auto mb-2">
                {log.stackTrace}
              </pre>
            )}
            {log.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {log.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-[#727B81] bg-[#333] px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {Object.keys(log.context).length > 0 && (
              <details className="text-xs">
                <summary className="text-[#727B81] cursor-pointer hover:text-[#C4C4C4]">
                  Contexte
                </summary>
                <pre className="p-2 bg-[#1a1a1a] rounded text-[#727B81] mt-1 overflow-x-auto">
                  {JSON.stringify(log.context, null, 2)}
                </pre>
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Entrée d'événement
 */
const EventEntry: React.FC<{
  event: AdminEvent;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ event, isExpanded, onToggle }) => {
  const severityColor = LOG_SEVERITY_COLORS[event.severity];
  const moduleName = MODULE_DISPLAY_NAMES[event.moduleId] || event.moduleId;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-2 pl-4 py-2"
      style={{ borderColor: severityColor }}
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={onToggle}
      >
        <Clock size={16} style={{ color: severityColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#727B81]">
              {formatTimestamp(event.timestamp)}
            </span>
            <span className="text-xs text-[#C4C4C4] font-medium">
              {event.title}
            </span>
            <span className="text-xs text-[#727B81] bg-[#333] px-1.5 py-0.5 rounded">
              {moduleName}
            </span>
            {event.resolved && (
              <span className="text-xs text-[#22c55e] bg-[#22c55e20] px-1.5 py-0.5 rounded">
                Résolu
              </span>
            )}
          </div>
          <p className="text-sm text-[#727B81] mt-1">{event.description}</p>
        </div>
        <button className="text-[#727B81] hover:text-[#C4C4C4]">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-7 mt-2 overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-[#727B81]">Source:</span>
                <span className="ml-2 text-[#C4C4C4]">{event.source}</span>
              </div>
              <div>
                <span className="text-[#727B81]">Type:</span>
                <span className="ml-2 text-[#C4C4C4]">{event.type}</span>
              </div>
              <div>
                <span className="text-[#727B81]">Impact:</span>
                <span className="ml-2 text-[#C4C4C4]">{event.impact}</span>
              </div>
              {event.duration && (
                <div>
                  <span className="text-[#727B81]">Durée:</span>
                  <span className="ml-2 text-[#C4C4C4]">{event.duration}ms</span>
                </div>
              )}
            </div>
            {Object.keys(event.data).length > 0 && (
              <details className="text-xs">
                <summary className="text-[#727B81] cursor-pointer hover:text-[#C4C4C4]">
                  Données
                </summary>
                <pre className="p-2 bg-[#1a1a1a] rounded text-[#727B81] mt-1 overflow-x-auto">
                  {JSON.stringify(event.data, null, 2)}
                </pre>
              </details>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════════════════════════

export const AdminTimeline: React.FC<AdminTimelineProps> = ({
  className = '',
  maxItems = 100,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [logs, setLogs] = useState<AdminLogRecord[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'LOGS' | 'EVENTS' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Set<LogSeverity>>(
    new Set(['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'])
  );
  const [selectedModules, _setSelectedModules] = useState<Set<TitaneModule>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const adminEngine = useMemo(() => getAdminEngine(), []);

  // Charger les données
  const loadData = useCallback(() => {
    const filters: LogFilters = {
      limit: maxItems,
      severities: Array.from(selectedSeverities),
      modules: selectedModules.size > 0 ? Array.from(selectedModules) : undefined,
      searchText: searchQuery || undefined,
    };

    const result = adminEngine.searchLogs(filters);
    setLogs(result.logs);
    setEvents(adminEngine.getRecentEvents(maxItems));
  }, [adminEngine, maxItems, selectedSeverities, selectedModules, searchQuery]);

  // Effet initial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(loadData, refreshInterval);
    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, loadData]);

  // Listeners temps réel
  useEffect(() => {
    const unsubLog = adminEngine.onLog((log) => {
      setLogs((prev) => [log, ...prev].slice(0, maxItems));
    });

    const unsubEvent = adminEngine.onEvent((event) => {
      setEvents((prev) => [event, ...prev].slice(0, maxItems));
    });

    return () => {
      unsubLog();
      unsubEvent();
    };
  }, [adminEngine, maxItems]);

  // Toggle expansion
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle severity filter
  const toggleSeverity = (severity: LogSeverity) => {
    setSelectedSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  // Items combinés et triés
  const combinedItems = useMemo(() => {
    const items: Array<{ type: 'log' | 'event'; data: AdminLogRecord | AdminEvent; timestamp: number }> = [];

    if (viewMode === 'LOGS' || viewMode === 'ALL') {
      logs.forEach((log) => items.push({ type: 'log', data: log, timestamp: log.timestamp }));
    }

    if (viewMode === 'EVENTS' || viewMode === 'ALL') {
      events.forEach((event) => items.push({ type: 'event', data: event, timestamp: event.timestamp }));
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, events, viewMode]);

  // Statistiques
  const stats = useMemo(() => {
    return adminEngine.getLogStats();
  }, [adminEngine]);

  const severities: LogSeverity[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];

  return (
    <div className={`p-6 bg-[#0a0a0a] rounded-xl border border-[#333] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#C4C4C4]">Timeline & Logs</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#727B81]">
            {combinedItems.length} entrées | {stats.lastHour} dernière heure
          </span>
          <button
            onClick={loadData}
            className="p-2 text-[#727B81] hover:text-[#C4C4C4] rounded-lg hover:bg-[#1a1a1a]"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727B81]" />
          <input
            type="text"
            placeholder="Rechercher dans les logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-[#C4C4C4] placeholder-[#727B81] focus:outline-none focus:border-[#555]"
          />
        </div>

        {/* Mode de vue */}
        <div className="flex gap-2">
          {(['ALL', 'LOGS', 'EVENTS'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-[#333] text-[#C4C4C4]'
                  : 'bg-[#1a1a1a] text-[#727B81] hover:text-[#C4C4C4]'
              }`}
            >
              {mode === 'ALL' ? 'Tout' : mode === 'LOGS' ? 'Logs' : 'Événements'}
            </button>
          ))}
        </div>

        {/* Toggle filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            showFilters ? 'bg-[#333] text-[#C4C4C4]' : 'bg-[#1a1a1a] text-[#727B81]'
          }`}
        >
          <Filter size={16} />
          Filtres
        </button>
      </div>

      {/* Panneau de filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#333]">
              <div className="mb-4">
                <h4 className="text-sm text-[#C4C4C4] mb-2">Sévérité</h4>
                <div className="flex flex-wrap gap-2">
                  {severities.map((severity) => (
                    <button
                      key={severity}
                      onClick={() => toggleSeverity(severity)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedSeverities.has(severity)
                          ? 'text-white'
                          : 'bg-[#333] text-[#727B81]'
                      }`}
                      style={
                        selectedSeverities.has(severity)
                          ? { backgroundColor: LOG_SEVERITY_COLORS[severity] }
                          : {}
                      }
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#727B81]">
                <span>
                  DEBUG: {stats.bySeverity.DEBUG} | INFO: {stats.bySeverity.INFO} |
                  WARN: {stats.bySeverity.WARN} | ERROR: {stats.bySeverity.ERROR} |
                  CRITICAL: {stats.bySeverity.CRITICAL}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des entrées */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {combinedItems.length === 0 ? (
          <div className="text-center py-12 text-[#727B81]">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Aucune entrée à afficher</p>
          </div>
        ) : (
          combinedItems.map((item) =>
            item.type === 'log' ? (
              <LogEntry
                key={(item.data as AdminLogRecord).id}
                log={item.data as AdminLogRecord}
                isExpanded={expandedIds.has((item.data as AdminLogRecord).id)}
                onToggle={() => toggleExpanded((item.data as AdminLogRecord).id)}
              />
            ) : (
              <EventEntry
                key={(item.data as AdminEvent).id}
                event={item.data as AdminEvent}
                isExpanded={expandedIds.has((item.data as AdminEvent).id)}
                onToggle={() => toggleExpanded((item.data as AdminEvent).id)}
              />
            )
          )
        )}
      </div>
    </div>
  );
};

export default AdminTimeline;
