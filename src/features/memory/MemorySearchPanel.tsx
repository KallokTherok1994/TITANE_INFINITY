/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * MemorySearchPanel - Recherche sémantique dans la mémoire
 * Permet de chercher et filtrer les entrées de mémoire
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Clock, Tag } from 'lucide-react';
import './MemorySearchPanel.css';

interface MemoryEntry {
  id: string;
  content: string;
  type: 'short' | 'mid' | 'long';
  timestamp: number;
  tags?: string[];
  relevance?: number;
}

interface MemorySearchPanelProps {
  entries?: MemoryEntry[];
  onEntryClick?: (entry: MemoryEntry) => void;
}

export const MemorySearchPanel: React.FC<MemorySearchPanelProps> = ({
  entries,
  onEntryClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all');

  // Mock entries si pas de données
  const memoryEntries = useMemo(() => {
    if (entries) return entries;
    return generateMockEntries();
  }, [entries]);

  // Filtrer entrées
  const filteredEntries = useMemo(() => {
    let filtered = memoryEntries;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        entry =>
          entry.content.toLowerCase().includes(query) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(entry => entry.type === selectedType);
    }

    // Filtre par tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry =>
        entry.tags?.some(tag => selectedTags.includes(tag))
      );
    }

    // Filtre par date
    if (dateRange !== 'all') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };

      const rangeMs = ranges[dateRange];
      if (rangeMs) {
        filtered = filtered.filter(entry => now - entry.timestamp < rangeMs);
      }
    }

    return filtered.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }, [memoryEntries, searchQuery, selectedType, selectedTags, dateRange]);

  // All available tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    memoryEntries.forEach(entry => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [memoryEntries]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="memory-search-container">
      {/* Search Bar */}
      <div className="memory-search-bar">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Recherche sémantique dans la mémoire..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Effacer"
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="memory-filters">
        {/* Type filter */}
        <select
          className="filter-select"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="all">Tous types</option>
          <option value="short">Court terme</option>
          <option value="mid">Moyen terme</option>
          <option value="long">Long terme</option>
        </select>

        {/* Date filter */}
        <select
          className="filter-select"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          <option value="all">Toutes dates</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>

        {/* Results count */}
        <div className="results-count">
          <Filter size={14} />
          <span>{filteredEntries.length} résultats</span>
        </div>
      </div>

      {/* Tags */}
      {availableTags.length > 0 && (
        <div className="memory-tags">
          {availableTags.slice(0, 8).map(tag => (
            <button
              key={tag}
              className={`memory-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              <Tag size={12} />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="memory-results">
        {filteredEntries.length === 0 ? (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <p>Aucun résultat trouvé</p>
            <small>Essayez d&apos;autres mots-clés ou filtres</small>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="memory-entry"
              onClick={() => onEntryClick?.(entry)}
            >
              <div className="entry-header">
                <span className={`entry-type ${entry.type}`}>
                  {entry.type === 'short' && '⚡ Court'}
                  {entry.type === 'mid' && '🧠 Moyen'}
                  {entry.type === 'long' && '💎 Long'}
                </span>
                <span className="entry-date">
                  <Clock size={12} />
                  {formatDate(entry.timestamp)}
                </span>
              </div>

              <p className="entry-content">{entry.content}</p>

              {entry.tags && entry.tags.length > 0 && (
                <div className="entry-tags">
                  {entry.tags.map((tag, i) => (
                    <span key={i} className="entry-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {entry.relevance !== undefined && (
                <div className="entry-relevance">
                  <div
                    className="relevance-bar"
                    style={{ width: `${entry.relevance * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Generate mock memory entries
function generateMockEntries(): MemoryEntry[] {
  const now = Date.now();

  return [
    {
      id: '1',
      content: 'Discussion sur architecture TITANE et patterns de développement',
      type: 'long',
      timestamp: now - 7 * 24 * 60 * 60 * 1000,
      tags: ['architecture', 'dev'],
      relevance: 0.95,
    },
    {
      id: '2',
      content: 'Optimisation performance graphiques React avec recharts',
      type: 'mid',
      timestamp: now - 2 * 24 * 60 * 60 * 1000,
      tags: ['performance', 'react'],
      relevance: 0.88,
    },
    {
      id: '3',
      content: 'Session active: Conversation sur achievements system',
      type: 'short',
      timestamp: now - 60 * 60 * 1000,
      tags: ['achievements', 'session'],
      relevance: 0.92,
    },
    {
      id: '4',
      content: 'Principes design system: couleurs, spacing, animations',
      type: 'long',
      timestamp: now - 14 * 24 * 60 * 60 * 1000,
      tags: ['design', 'ui'],
      relevance: 0.75,
    },
    {
      id: '5',
      content: 'Configuration TypeScript strict mode et type guards',
      type: 'mid',
      timestamp: now - 3 * 24 * 60 * 60 * 1000,
      tags: ['typescript', 'config'],
      relevance: 0.82,
    },
  ];
}
