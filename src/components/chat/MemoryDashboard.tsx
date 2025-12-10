/**
 * TITANE∞ v19.2Ω — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v19.2Ω — TABLEAU DE BORD MÉMOIRE PERSISTANTE
 *   Dashboard complet pour visualiser et gérer la mémoire 3-niveaux
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useMemo } from 'react';
import { usePersistentMemory } from '@/hooks/usePersistentMemory';
import type {
  MemoryEntry,
  MemoryLevel,
  MemoryTopic,
  MemoryStats,
} from '@/services/memory/persistentMemory.config';
import {
  MEMORY_LEVEL_LABELS,
  MEMORY_TOPIC_LABELS,
  IMPORTANCE_COLORS,
} from '@/services/memory/persistentMemory.config';
import type { ChatModeId } from '@/services/ai/chatModes.config';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface MemoryDashboardProps {
  /** Mode IA actuel */
  modeId: ChatModeId;
  /** Classe CSS additionnelle */
  className?: string;
  /** Callback sur sélection d'entrée */
  onEntrySelect?: (entry: MemoryEntry) => void;
  /** Mode compact */
  compact?: boolean;
}

type ViewMode = 'grid' | 'list' | 'timeline';
type SortBy = 'date' | 'importance' | 'relevance' | 'topic';

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Badge de niveau de mémoire */
const LevelBadge: React.FC<{ level: MemoryLevel }> = ({ level }) => {
  const config = MEMORY_LEVEL_LABELS[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      {config.icon} {config.label}
    </span>
  );
};

/** Badge de sujet */
const TopicBadge: React.FC<{ topic: MemoryTopic }> = ({ topic }) => {
  const config = MEMORY_TOPIC_LABELS[topic];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-700/50 text-gray-300">
      {config.icon} {config.label}
    </span>
  );
};

/** Indicateur d'importance */
const ImportanceIndicator: React.FC<{ importance: number }> = ({ importance }) => {
  const color =
    IMPORTANCE_COLORS[importance as keyof typeof IMPORTANCE_COLORS] ||
    IMPORTANCE_COLORS[3];
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-3 rounded-sm transition-colors"
          style={{
            backgroundColor: i < importance ? color : '#374151',
          }}
        />
      ))}
    </div>
  );
};

/** Carte d'entrée mémoire */
const MemoryEntryCard: React.FC<{
  entry: MemoryEntry;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
}> = ({ entry, onClick, selected, compact }) => {
  const truncatedContent =
    entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content;

  const date = new Date(entry.metadata.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`
        relative p-3 rounded-lg border transition-all cursor-pointer
        ${
          selected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800'
        }
        ${compact ? 'p-2' : 'p-3'}
      `}
      onClick={onClick}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <LevelBadge level={entry.level} />
          <TopicBadge topic={entry.topic} />
        </div>
        <ImportanceIndicator importance={entry.importance} />
      </div>

      {/* Titre (si disponible) */}
      {'title' in entry && entry.title && (
        <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">
          {entry.title}
        </h4>
      )}

      {/* Contenu */}
      <p
        className={`text-gray-400 ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}
      >
        {truncatedContent}
      </p>

      {/* Tags */}
      {entry.tags.length > 0 && !compact && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 text-xs rounded bg-gray-700/50 text-gray-400"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-xs text-gray-500">
              +{entry.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
        <span className="text-xs text-gray-500">{date}</span>
        <span className="text-xs text-gray-500">{entry.metadata.accessCount} accès</span>
      </div>
    </div>
  );
};

/** Stats panel */
const StatsPanel: React.FC<{ stats: MemoryStats | null; isLoading: boolean }> = ({
  stats,
  isLoading,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded-lg animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-700/30 rounded" />
        ))}
      </div>
    );
  }

  const levels = ['session', 'intermediate', 'long_term'] as const;

  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-800/30 rounded-lg">
      {levels.map(level => {
        const config = MEMORY_LEVEL_LABELS[level];
        const count = stats.countByLevel[level] || 0;
        const size = stats.sizeByLevel[level] || 0;

        return (
          <div
            key={level}
            className="flex flex-col items-center p-2 rounded-lg"
            style={{ backgroundColor: `${config.color}10` }}
          >
            <span className="text-2xl mb-1">{config.icon}</span>
            <span className="text-lg font-bold" style={{ color: config.color }}>
              {count}
            </span>
            <span className="text-xs text-gray-400">{config.label}</span>
            <span className="text-xs text-gray-500 mt-1">
              {(size / 1024).toFixed(1)} KB
            </span>
          </div>
        );
      })}
    </div>
  );
};

/** Barre de filtres */
const FilterBar: React.FC<{
  selectedLevel: MemoryLevel | 'all';
  selectedTopic: MemoryTopic | 'all';
  sortBy: SortBy;
  viewMode: ViewMode;
  onLevelChange: (level: MemoryLevel | 'all') => void;
  onTopicChange: (topic: MemoryTopic | 'all') => void;
  onSortChange: (sort: SortBy) => void;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}> = ({
  selectedLevel,
  selectedTopic,
  sortBy,
  viewMode,
  onLevelChange,
  onTopicChange,
  onSortChange,
  onViewChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-800/30 rounded-lg">
      {/* Recherche */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Rechercher dans la mémoire..."
          className="w-full px-3 py-2 pl-9 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Niveau */}
        <select
          value={selectedLevel}
          onChange={e => onLevelChange(e.target.value as MemoryLevel | 'all')}
          className="px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tous les niveaux</option>
          <option value="session">⏱️ Session</option>
          <option value="intermediate">📝 Intermédiaire</option>
          <option value="long_term">🗄️ Long Terme</option>
        </select>

        {/* Sujet */}
        <select
          value={selectedTopic}
          onChange={e => onTopicChange(e.target.value as MemoryTopic | 'all')}
          className="px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Tous les sujets</option>
          {Object.entries(MEMORY_TOPIC_LABELS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.icon} {value.label}
            </option>
          ))}
        </select>

        {/* Tri */}
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value as SortBy)}
          className="px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:border-blue-500"
        >
          <option value="date">📅 Date</option>
          <option value="importance">⭐ Importance</option>
          <option value="relevance">🎯 Pertinence</option>
          <option value="topic">📁 Sujet</option>
        </select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Vue */}
        <div className="flex items-center gap-1 bg-gray-900/50 rounded p-0.5">
          {(['grid', 'list', 'timeline'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onViewChange(mode)}
              className={`p-1.5 rounded text-sm transition-colors ${
                viewMode === mode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {mode === 'grid' && '⊞'}
              {mode === 'list' && '☰'}
              {mode === 'timeline' && '⫿'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({
  modeId,
  className = '',
  onEntrySelect,
  compact = false,
}) => {
  // État local
  const [selectedLevel, setSelectedLevel] = useState<MemoryLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<MemoryTopic | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Hook mémoire
  const {
    entries,
    stats,
    isLoading,
    error,
    refresh,
    sessionCount,
    intermediateCount,
    longTermCount,
  } = usePersistentMemory({
    modeId,
    refreshInterval: 30000, // Refresh toutes les 30s
    enableCache: true,
  });

  // Filtrage et tri
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    // Filtre par niveau
    if (selectedLevel !== 'all') {
      result = result.filter(e => e.level === selectedLevel);
    }

    // Filtre par sujet
    if (selectedTopic !== 'all') {
      result = result.filter(e => e.topic === selectedTopic);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        e =>
          e.content.toLowerCase().includes(query) ||
          e.tags.some(t => t.toLowerCase().includes(query)) ||
          ('title' in e && e.title?.toLowerCase().includes(query))
      );
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.metadata.createdAt - a.metadata.createdAt;
        case 'importance':
          return b.importance - a.importance;
        case 'topic':
          return a.topic.localeCompare(b.topic);
        case 'relevance':
        default:
          return b.metadata.accessCount - a.metadata.accessCount;
      }
    });

    return result;
  }, [entries, selectedLevel, selectedTopic, searchQuery, sortBy]);

  // Handlers
  const handleEntryClick = (entry: MemoryEntry) => {
    setSelectedEntryId(entry.id === selectedEntryId ? null : entry.id);
    onEntrySelect?.(entry);
  };

  // Render
  if (error) {
    return (
      <div
        className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}
      >
        <p className="text-red-400">Erreur: {error}</p>
        <button
          onClick={refresh}
          className="mt-2 px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h2 className="text-lg font-semibold text-white">Mémoire Persistante</h2>
          <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
            {filteredEntries.length} entrées
          </span>
        </div>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '⟳' : '↻'} Actualiser
        </button>
      </div>

      {/* Stats */}
      {!compact && <StatsPanel stats={stats} isLoading={isLoading} />}

      {/* Filtres */}
      <FilterBar
        selectedLevel={selectedLevel}
        selectedTopic={selectedTopic}
        sortBy={sortBy}
        viewMode={viewMode}
        onLevelChange={setSelectedLevel}
        onTopicChange={setSelectedTopic}
        onSortChange={setSortBy}
        onViewChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Liste des entrées */}
      <div
        className={`
          ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : ''}
          ${viewMode === 'list' ? 'flex flex-col gap-2' : ''}
          ${viewMode === 'timeline' ? 'flex flex-col gap-2 pl-4 border-l-2 border-gray-700' : ''}
        `}
      >
        {isLoading && filteredEntries.length === 0 ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800/30 rounded-lg animate-pulse" />
          ))
        ) : filteredEntries.length === 0 ? (
          // Empty state
          <div className="col-span-full py-12 text-center text-gray-500">
            <span className="text-4xl mb-2 block">📭</span>
            <p>Aucune entrée trouvée</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? "Essayez avec d'autres termes de recherche"
                : "La mémoire est vide pour l'instant"}
            </p>
          </div>
        ) : (
          // Entries
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className={viewMode === 'timeline' ? 'relative pl-4' : ''}
            >
              {viewMode === 'timeline' && (
                <div className="absolute -left-[calc(0.5rem+1px)] top-4 w-2 h-2 rounded-full bg-blue-500" />
              )}
              <MemoryEntryCard
                entry={entry}
                onClick={() => handleEntryClick(entry)}
                selected={selectedEntryId === entry.id}
                compact={compact || viewMode === 'list'}
              />
            </div>
          ))
        )}
      </div>

      {/* Compteurs rapides */}
      {!compact && (
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-800">
          <span className="text-xs text-gray-500">Session: {sessionCount}</span>
          <span className="text-xs text-gray-500">
            Intermédiaire: {intermediateCount}
          </span>
          <span className="text-xs text-gray-500">Long terme: {longTermCount}</span>
        </div>
      )}
    </div>
  );
};

export default MemoryDashboard;
