/**
 * @file PerformanceIssues.tsx
 * @description Composant d'affichage des problèmes de performance - TITANE∞ Performance Engine vΩ∞Ω+
 * @version 1.0.0
 * @license TITANE_INFINITY_∞_OMEGA+_LICENSE
 */

import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
  Clock,
  CheckCircle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import type {
  PerformanceIssue,
  SeverityLevel,
  IssueType,
  TitaneModule
} from '../../services/performanceEngine/performanceEngine.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortField = 'detectedAt' | 'severity' | 'module' | 'type';
export type SortDirection = 'asc' | 'desc';

export interface IssueFilterOptions {
  severity?: SeverityLevel[];
  modules?: (TitaneModule | 'system' | 'frontend' | 'ia')[];
  types?: IssueType[];
  resolved?: boolean;
  searchQuery?: string;
}

export interface PerformanceIssuesProps {
  issues: PerformanceIssue[];
  maxVisible?: number;
  showFilters?: boolean;
  showSearch?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onIssueClick?: (issue: PerformanceIssue) => void;
  onIssueResolve?: (issueId: string) => void;
  onIssueIgnore?: (issueId: string) => void;
  className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SEVERITY_CONFIG: Record<SeverityLevel, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof AlertTriangle;
  order: number;
}> = {
  critical: {
    label: 'Critique',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: AlertOctagon,
    order: 0
  },
  major: {
    label: 'Majeur',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: AlertCircle,
    order: 1
  },
  warning: {
    label: 'Avertissement',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    icon: AlertTriangle,
    order: 2
  },
  info: {
    label: 'Information',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: Info,
    order: 3
  }
};

const MODULE_LABELS: Record<TitaneModule | 'system' | 'frontend' | 'ia', string> = {
  selfHealing: 'Self-Healing',
  cognitive: 'Cognitif',
  memory: 'Mémoire',
  tools: 'Outils',
  search: 'Recherche',
  xp: 'XP',
  evolution: 'Évolution',
  prompt: 'Prompt',
  tts: 'TTS',
  avatar: 'Avatar',
  chat: 'Chat',
  performance: 'Performance',
  system: 'Système',
  frontend: 'Frontend',
  ia: 'IA'
};

// ============================================================================
// COMPOSANTS INTERNES
// ============================================================================

interface IssueCardProps {
  issue: PerformanceIssue;
  expanded: boolean;
  onToggle: () => void;
  onResolve?: () => void;
  onIgnore?: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  expanded,
  onToggle,
  onResolve,
  onIgnore
}) => {
  const config = SEVERITY_CONFIG[issue.severity];
  const SeverityIcon = config.icon;
  const isResolved = !!issue.resolvedAt;

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (start: number, end?: number) => {
    const ms = (end || Date.now()) - start;
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}min`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className={`
        rounded-lg border overflow-hidden
        ${isResolved
          ? 'bg-slate-800/30 border-slate-700/30'
          : `${config.bgColor} border-slate-700/50`
        }
      `}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className="text-slate-400" />
        </motion.div>

        <SeverityIcon
          size={20}
          className={isResolved ? 'text-slate-500' : config.color}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isResolved ? 'text-slate-400 line-through' : 'text-white'}`}>
              {issue.title}
            </span>
            {isResolved && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                Résolu
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{MODULE_LABELS[issue.module]}</span>
            <span>•</span>
            <span>{formatTimestamp(issue.detectedAt)}</span>
            <span>•</span>
            <Clock size={12} />
            <span>{formatDuration(issue.detectedAt, issue.resolvedAt)}</span>
          </div>
        </div>

        <div className={`
          px-2 py-1 rounded text-xs font-medium
          ${config.bgColor} ${config.color}
        `}>
          {config.label}
        </div>
      </button>

      {/* Détails */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-slate-700/30">
              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-slate-300">{issue.description}</p>
              </div>

              {/* Détails de l'issue */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-slate-500">Type</span>
                  <p className="text-sm text-slate-300">{issue.type}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Module</span>
                  <p className="text-sm text-slate-300">{MODULE_LABELS[issue.module]}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Métrique</span>
                  <p className="text-sm text-slate-300">{issue.threshold.metric}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Valeur</span>
                  <p className="text-sm text-slate-300">
                    {issue.threshold.actual.toFixed(2)} / {issue.threshold.threshold}
                    <span className="text-red-400 ml-1">
                      (+{issue.threshold.percentage.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>

              {/* Recommandations */}
              {issue.recommendations && issue.recommendations.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs text-slate-500 block mb-2">Recommandations</span>
                  <ul className="space-y-1">
                    {issue.recommendations.map((recommendation, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-blue-400">→</span>
                        {recommendation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auto-fixable indicator */}
              {issue.autoFixable && (
                <div className="mb-4 flex items-center gap-2 text-sm text-green-400">
                  <CheckCircle size={14} />
                  <span>Ce problème peut être corrigé automatiquement</span>
                </div>
              )}

              {/* Actions */}
              {!isResolved && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
                  {onResolve && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onResolve(); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                        bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <CheckCircle size={14} />
                      <span className="text-sm">Marquer résolu</span>
                    </button>
                  )}
                  {onIgnore && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onIgnore(); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                        bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-colors"
                    >
                      <EyeOff size={14} />
                      <span className="text-sm">Ignorer</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export const PerformanceIssues: React.FC<PerformanceIssuesProps> = ({
  issues,
  maxVisible = 50,
  showFilters = true,
  showSearch = true,
  collapsible = true,
  defaultExpanded = true,
  onIssueClick,
  onIssueResolve,
  onIssueIgnore,
  className = ''
}) => {
  // États
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<IssueFilterOptions>({});
  const [sortField, setSortField] = useState<SortField>('detectedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  // Filtrage
  const filteredIssues = useMemo(() => {
    let result = [...issues];

    // Filtre résolu
    if (!showResolved) {
      result = result.filter(issue => !issue.resolvedAt);
    }

    // Filtre sévérité
    if (filters.severity && filters.severity.length > 0) {
      const severityList = filters.severity;
      result = result.filter(issue => severityList.includes(issue.severity));
    }

    // Filtre modules
    if (filters.modules && filters.modules.length > 0) {
      const moduleList = filters.modules;
      result = result.filter(issue => moduleList.includes(issue.module));
    }

    // Filtre types
    if (filters.types && filters.types.length > 0) {
      const typeList = filters.types;
      result = result.filter(issue => typeList.includes(issue.type));
    }

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(issue =>
        issue.title.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.type.toLowerCase().includes(query) ||
        issue.module.toLowerCase().includes(query)
      );
    }

    return result;
  }, [issues, filters, searchQuery, showResolved]);

  // Tri
  const sortedIssues = useMemo(() => {
    const sorted = [...filteredIssues].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'detectedAt':
          comparison = a.detectedAt - b.detectedAt;
          break;
        case 'severity': {
          const severityOrderA = SEVERITY_CONFIG[a.severity]?.order ?? 999;
          const severityOrderB = SEVERITY_CONFIG[b.severity]?.order ?? 999;
          comparison = severityOrderA - severityOrderB;
          break;
        }
        case 'module':
          comparison = a.module.localeCompare(b.module);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return sorted.slice(0, maxVisible);
  }, [filteredIssues, sortField, sortDirection, maxVisible]);

  // Statistiques
  const stats = useMemo(() => {
    const critical = issues.filter(i => i.severity === 'critical' && !i.resolvedAt).length;
    const major = issues.filter(i => i.severity === 'major' && !i.resolvedAt).length;
    const warning = issues.filter(i => i.severity === 'warning' && !i.resolvedAt).length;
    const info = issues.filter(i => i.severity === 'info' && !i.resolvedAt).length;
    const resolved = issues.filter(i => i.resolvedAt).length;

    return { critical, major, warning, info, resolved, total: issues.length };
  }, [issues]);

  // Handlers
  const toggleIssue = useCallback((issueId: string) => {
    setExpandedIssues(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  const toggleSeverityFilter = useCallback((severity: SeverityLevel) => {
    setFilters(prev => {
      const current = prev.severity || [];
      const next = current.includes(severity)
        ? current.filter(s => s !== severity)
        : [...current, severity];
      return { ...prev, severity: next.length > 0 ? next : undefined };
    });
  }, []);

  const SortIcon = sortDirection === 'asc' ? SortAsc : SortDesc;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-700/50 rounded transition-colors"
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={20} className="text-slate-400" />
              </motion.div>
            </button>
          )}

          <div>
            <h3 className="font-semibold text-white">Problèmes détectés</h3>
            <div className="flex items-center gap-3 mt-1 text-xs">
              {stats.critical > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertOctagon size={12} />
                  {stats.critical} critique{stats.critical > 1 ? 's' : ''}
                </span>
              )}
              {stats.major > 0 && (
                <span className="flex items-center gap-1 text-orange-400">
                  <AlertCircle size={12} />
                  {stats.major} majeur{stats.major > 1 ? 's' : ''}
                </span>
              )}
              {stats.warning > 0 && (
                <span className="flex items-center gap-1 text-amber-400">
                  <AlertTriangle size={12} />
                  {stats.warning} avertissement{stats.warning > 1 ? 's' : ''}
                </span>
              )}
              {stats.info > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Info size={12} />
                  {stats.info} info{stats.info > 1 ? 's' : ''}
                </span>
              )}
              {stats.resolved > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <CheckCircle size={12} />
                  {stats.resolved} résolu{stats.resolved > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`
              p-2 rounded-lg transition-colors
              ${showResolved ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'}
            `}
            title={showResolved ? 'Masquer résolus' : 'Afficher résolus'}
          >
            {showResolved ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filtres et recherche */}
            {(showFilters || showSearch) && (
              <div className="p-4 border-b border-slate-700/30">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Recherche */}
                  {showSearch && (
                    <div className="relative flex-1 min-w-[200px]">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700/50 rounded-lg
                          text-sm text-white placeholder-slate-400
                          border border-slate-600 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Filtres sévérité */}
                  {showFilters && (
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-slate-400" />
                      {(['critical', 'major', 'warning', 'info'] as SeverityLevel[]).map(severity => {
                        const config = SEVERITY_CONFIG[severity];
                        const isActive = filters.severity?.includes(severity);
                        return (
                          <button
                            key={severity}
                            onClick={() => toggleSeverityFilter(severity)}
                            className={`
                              px-2 py-1 rounded text-xs transition-colors
                              ${isActive
                                ? `${config.bgColor} ${config.color}`
                                : 'bg-slate-700/50 text-slate-400 hover:text-white'
                              }
                            `}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Tri */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSort('detectedAt')}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded text-xs
                        ${sortField === 'detectedAt'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                        }
                      `}
                    >
                      <Clock size={12} />
                      Date
                      {sortField === 'detectedAt' && <SortIcon size={12} />}
                    </button>
                    <button
                      onClick={() => toggleSort('severity')}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded text-xs
                        ${sortField === 'severity'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white'
                        }
                      `}
                    >
                      <AlertTriangle size={12} />
                      Sévérité
                      {sortField === 'severity' && <SortIcon size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des issues */}
            <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
              {sortedIssues.length > 0 ? (
                <AnimatePresence>
                  {sortedIssues.map(issue => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      expanded={expandedIssues.has(issue.id)}
                      onToggle={() => {
                        toggleIssue(issue.id);
                        onIssueClick?.(issue);
                      }}
                      onResolve={onIssueResolve ? () => onIssueResolve(issue.id) : undefined}
                      onIgnore={onIssueIgnore ? () => onIssueIgnore(issue.id) : undefined}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle size={48} className="mb-3 text-green-400 opacity-50" />
                  <p className="text-lg">Aucun problème détecté</p>
                  <p className="text-sm text-slate-500">Le système fonctionne normalement</p>
                </div>
              )}

              {/* Indicateur de troncature */}
              {filteredIssues.length > maxVisible && (
                <div className="text-center text-sm text-slate-400 pt-4">
                  Affichage de {sortedIssues.length} sur {filteredIssues.length} problèmes
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PerformanceIssues;
