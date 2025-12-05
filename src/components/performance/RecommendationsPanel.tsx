/**
 * @file RecommendationsPanel.tsx
 * @description Panneau de recommandations d'optimisation - TITANE∞ Performance Engine vΩ∞Ω+
 * @version 1.0.0
 * @license TITANE_INFINITY_∞_OMEGA+_LICENSE
 */

import React, { useMemo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  ChevronRight,
  Clock,
  Zap,
  Target,
  Play,
  Check,
  X,
  Filter,
  ArrowUp,
  ArrowDown,
  Code,
  Cpu,
  Database,
  Brain,
  Settings,
  Sparkles
} from 'lucide-react';
import type {
  Recommendation,
  RecommendationCategory,
  RecommendationImpact
} from '../../services/performanceEngine/performanceEngine.config';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type SortField = 'impact' | 'effort' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface RecommendationFilterOptions {
  categories?: RecommendationCategory[];
  impacts?: RecommendationImpact[];
  applied?: boolean;
}

export interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  appliedIds?: Set<string>;
  maxVisible?: number;
  showFilters?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  onApply?: (recommendation: Recommendation) => Promise<void>;
  onDismiss?: (recommendationId: string) => void;
  onViewDetails?: (recommendation: Recommendation) => void;
  className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CATEGORY_CONFIG: Record<RecommendationCategory, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Code;
}> = {
  react_optimization: {
    label: 'React',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    icon: Code
  },
  rust_optimization: {
    label: 'Rust',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: Cpu
  },
  vite_optimization: {
    label: 'Vite',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    icon: Zap
  },
  ia_optimization: {
    label: 'IA',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    icon: Brain
  },
  memory_optimization: {
    label: 'Mémoire',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: Database
  },
  general: {
    label: 'Général',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    icon: Settings
  }
};

const IMPACT_CONFIG: Record<RecommendationImpact, {
  label: string;
  color: string;
  bgColor: string;
  order: number;
}> = {
  critical: {
    label: 'Critique',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    order: 0
  },
  high: {
    label: 'Élevé',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    order: 1
  },
  medium: {
    label: 'Moyen',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    order: 2
  },
  low: {
    label: 'Faible',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    order: 3
  }
};

const EFFORT_CONFIG: Record<string, {
  label: string;
  color: string;
  order: number;
}> = {
  trivial: { label: 'Trivial', color: 'text-green-400', order: 0 },
  low: { label: 'Faible', color: 'text-blue-400', order: 1 },
  medium: { label: 'Moyen', color: 'text-amber-400', order: 2 },
  high: { label: 'Important', color: 'text-red-400', order: 3 }
};

// ============================================================================
// COMPOSANTS INTERNES
// ============================================================================

interface RecommendationCardProps {
  recommendation: Recommendation;
  isApplied: boolean;
  isApplying: boolean;
  expanded: boolean;
  onToggle: () => void;
  onApply?: () => void;
  onDismiss?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isApplied,
  isApplying,
  expanded,
  onToggle,
  onApply,
  onDismiss
}) => {
  const categoryConfig = CATEGORY_CONFIG[recommendation.category];
  const impactConfig = IMPACT_CONFIG[recommendation.impact];
  const effortConfig = EFFORT_CONFIG[recommendation.effort];
  const CategoryIcon = categoryConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      layout
      className={`
        rounded-lg border overflow-hidden
        ${isApplied
          ? 'bg-green-500/10 border-green-500/30'
          : 'bg-slate-800/50 border-slate-700/50'
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

        <div className={`p-2 rounded-lg ${categoryConfig.bgColor}`}>
          <CategoryIcon size={18} className={categoryConfig.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isApplied ? 'text-green-400' : 'text-white'}`}>
              {recommendation.title}
            </span>
            {isApplied && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                <Check size={10} />
                Appliqué
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className={categoryConfig.color}>{categoryConfig.label}</span>
            <span>•</span>
            <span className={`flex items-center gap-1 ${impactConfig.color}`}>
              <Target size={10} />
              Impact {impactConfig.label}
            </span>
            <span>•</span>
            <span className={`flex items-center gap-1 ${effortConfig.color}`}>
              <Clock size={10} />
              Effort {effortConfig.label}
            </span>
          </div>
        </div>

        {/* Badge d'impact */}
        <div className={`px-2 py-1 rounded text-xs font-medium ${impactConfig.bgColor} ${impactConfig.color}`}>
          {impactConfig.label}
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
                <p className="text-sm text-slate-300">{recommendation.description}</p>
              </div>

              {/* Code snippet si disponible */}
              {recommendation.code && (
                <div className="mb-4">
                  <span className="text-xs text-slate-500 block mb-2">Exemple de code ({recommendation.code.language})</span>
                  <pre className="text-xs bg-slate-900/70 rounded-lg p-3 overflow-x-auto text-slate-300 border border-slate-700/50">
                    {recommendation.code.after}
                  </pre>
                  {recommendation.code.file && (
                    <p className="text-xs text-slate-500 mt-1">
                      Fichier: {recommendation.code.file}
                      {recommendation.code.line && ` (ligne ${recommendation.code.line})`}
                    </p>
                  )}
                </div>
              )}

              {/* Issues liées */}
              {recommendation.relatedIssues && recommendation.relatedIssues.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs text-slate-500 block mb-2">Issues liées</span>
                  <ul className="space-y-1">
                    {recommendation.relatedIssues.map((issueId: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <Code size={12} />
                        {issueId}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Priorité */}
              {recommendation.priority && (
                <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
                  <span className="text-xs text-slate-500 block mb-2">Priorité</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-amber-400" />
                      <span className="text-sm text-amber-400">
                        {recommendation.priority}/10
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {recommendation.reversible ? 'Réversible' : 'Non réversible'}
                    </span>
                  </div>
                </div>
              )}

              {/* Indicateur auto-applicable */}
              {recommendation.autoApplicable && (
                <div className="mb-4 flex items-center gap-2 text-sm text-blue-400">
                  <Sparkles size={14} />
                  <span>Cette recommandation peut être appliquée automatiquement</span>
                </div>
              )}

              {/* Actions */}
              {!isApplied && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/30">
                  {onApply && recommendation.autoApplicable && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onApply(); }}
                      disabled={isApplying}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
                        ${isApplying
                          ? 'bg-blue-500/30 text-blue-300 cursor-wait'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        }
                      `}
                    >
                      {isApplying ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Settings size={14} />
                          </motion.div>
                          <span className="text-sm">Application...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          <span className="text-sm">Appliquer</span>
                        </>
                      )}
                    </button>
                  )}
                  {onDismiss && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                        bg-slate-700/50 text-slate-400 hover:bg-slate-700 transition-colors"
                    >
                      <X size={14} />
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

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  appliedIds = new Set(),
  maxVisible = 30,
  showFilters = true,
  collapsible = true,
  defaultExpanded = true,
  onApply,
  onDismiss,
  onViewDetails,
  className = ''
}) => {
  // États
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RecommendationFilterOptions>({});
  const [sortField, setSortField] = useState<SortField>('impact');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [applyingIds, setApplyingIds] = useState<Set<string>>(new Set());
  const [showApplied, _setShowApplied] = useState(false);

  // Filtrage
  const filteredRecs = useMemo(() => {
    let result = [...recommendations];

    // Masquer les appliqués
    if (!showApplied) {
      result = result.filter(rec => !appliedIds.has(rec.id));
    }

    // Filtre catégories
    if (filters.categories && filters.categories.length > 0) {
      const cats = filters.categories;
      result = result.filter(rec => cats.includes(rec.category));
    }

    // Filtre impacts
    if (filters.impacts && filters.impacts.length > 0) {
      const imps = filters.impacts;
      result = result.filter(rec => imps.includes(rec.impact));
    }

    return result;
  }, [recommendations, filters, showApplied, appliedIds]);

  // Tri
  const sortedRecs = useMemo(() => {
    const sorted = [...filteredRecs].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'impact': {
          const impactOrderA = IMPACT_CONFIG[a.impact]?.order ?? 999;
          const impactOrderB = IMPACT_CONFIG[b.impact]?.order ?? 999;
          comparison = impactOrderA - impactOrderB;
          break;
        }
        case 'effort': {
          const effortOrderA = EFFORT_CONFIG[a.effort]?.order ?? 999;
          const effortOrderB = EFFORT_CONFIG[b.effort]?.order ?? 999;
          comparison = effortOrderA - effortOrderB;
          break;
        }
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted.slice(0, maxVisible);
  }, [filteredRecs, sortField, sortDirection, maxVisible]);

  // Statistiques
  const stats = useMemo(() => {
    const total = recommendations.length;
    const applied = recommendations.filter(r => appliedIds.has(r.id)).length;
    const critical = recommendations.filter(r => r.impact === 'critical' && !appliedIds.has(r.id)).length;
    const high = recommendations.filter(r => r.impact === 'high' && !appliedIds.has(r.id)).length;
    const autoApplicable = recommendations.filter(r => r.autoApplicable && !appliedIds.has(r.id)).length;

    return { total, applied, critical, high, autoApplicable };
  }, [recommendations, appliedIds]);

  // Handlers
  const toggleRec = useCallback((recId: string) => {
    setExpandedRecs(prev => {
      const next = new Set(prev);
      if (next.has(recId)) {
        next.delete(recId);
      } else {
        next.add(recId);
      }
      return next;
    });
  }, []);

  const handleApply = useCallback(async (rec: Recommendation) => {
    if (!onApply || applyingIds.has(rec.id)) return;

    setApplyingIds(prev => new Set([...prev, rec.id]));
    try {
      await onApply(rec);
    } finally {
      setApplyingIds(prev => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
    }
  }, [onApply, applyingIds]);

  const toggleCategoryFilter = useCallback((category: RecommendationCategory) => {
    setFilters(prev => {
      const current = prev.categories || [];
      const next = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];
      return { ...prev, categories: next.length > 0 ? next : undefined };
    });
  }, []);

  const toggleImpactFilter = useCallback((impact: RecommendationImpact) => {
    setFilters(prev => {
      const current = prev.impacts || [];
      const next = current.includes(impact)
        ? current.filter(i => i !== impact)
        : [...current, impact];
      return { ...prev, impacts: next.length > 0 ? next : undefined };
    });
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const SortIcon = sortDirection === 'asc' ? ArrowUp : ArrowDown;

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

          <div className="p-2 rounded-lg bg-amber-500/20">
            <Lightbulb size={20} className="text-amber-400" />
          </div>

          <div>
            <h3 className="font-semibold text-white">Recommandations</h3>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-slate-400">
                {stats.total - stats.applied} en attente
              </span>
              {stats.critical > 0 && (
                <span className="text-red-400">
                  {stats.critical} critique{stats.critical > 1 ? 's' : ''}
                </span>
              )}
              {stats.autoApplicable > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Sparkles size={10} />
                  {stats.autoApplicable} auto
                </span>
              )}
              {stats.applied > 0 && (
                <span className="flex items-center gap-1 text-green-400">
                  <Check size={10} />
                  {stats.applied} appliqué{stats.applied > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
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
            {/* Filtres */}
            {showFilters && (
              <div className="p-4 border-b border-slate-700/30 space-y-3">
                {/* Filtres par catégorie */}
                <div className="flex flex-wrap items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-xs text-slate-400">Catégorie:</span>
                  {(Object.keys(CATEGORY_CONFIG) as RecommendationCategory[]).map(category => {
                    const config = CATEGORY_CONFIG[category];
                    const isActive = filters.categories?.includes(category);
                    const CategoryIcon = config.icon;
                    return (
                      <button
                        key={category}
                        onClick={() => toggleCategoryFilter(category)}
                        className={`
                          flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors
                          ${isActive
                            ? `${config.bgColor} ${config.color}`
                            : 'bg-slate-700/50 text-slate-400 hover:text-white'
                          }
                        `}
                      >
                        <CategoryIcon size={10} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Filtres par impact et tri */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Impact:</span>
                  {(['critical', 'high', 'medium', 'low'] as RecommendationImpact[]).map(impact => {
                    const config = IMPACT_CONFIG[impact];
                    const isActive = filters.impacts?.includes(impact);
                    return (
                      <button
                        key={impact}
                        onClick={() => toggleImpactFilter(impact)}
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

                  <div className="flex-1" />

                  {/* Tri */}
                  <button
                    onClick={() => toggleSort('impact')}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded text-xs
                      ${sortField === 'impact'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    <Target size={10} />
                    Impact
                    {sortField === 'impact' && <SortIcon size={10} />}
                  </button>
                  <button
                    onClick={() => toggleSort('effort')}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded text-xs
                      ${sortField === 'effort'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    <Clock size={10} />
                    Effort
                    {sortField === 'effort' && <SortIcon size={10} />}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des recommandations */}
            <div className="p-4 space-y-2 max-h-[500px] overflow-y-auto">
              {sortedRecs.length > 0 ? (
                <AnimatePresence>
                  {sortedRecs.map(rec => (
                    <RecommendationCard
                      key={rec.id}
                      recommendation={rec}
                      isApplied={appliedIds.has(rec.id)}
                      isApplying={applyingIds.has(rec.id)}
                      expanded={expandedRecs.has(rec.id)}
                      onToggle={() => {
                        toggleRec(rec.id);
                        onViewDetails?.(rec);
                      }}
                      onApply={onApply ? () => handleApply(rec) : undefined}
                      onDismiss={onDismiss ? () => onDismiss(rec.id) : undefined}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Check size={48} className="mb-3 text-green-400 opacity-50" />
                  <p className="text-lg">Aucune recommandation</p>
                  <p className="text-sm text-slate-500">Le système est optimisé</p>
                </div>
              )}

              {/* Indicateur de troncature */}
              {filteredRecs.length > maxVisible && (
                <div className="text-center text-sm text-slate-400 pt-4">
                  Affichage de {sortedRecs.length} sur {filteredRecs.length} recommandations
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecommendationsPanel;
