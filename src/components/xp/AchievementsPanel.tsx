/**
 * TITANE∞ vΩ∞ — PANNEAU ACHIEVEMENTS
 * Super Prompt #2: Affichage des succès débloqués
 *
 * © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.
 */

import React, { useMemo, useState } from 'react';
import { useAchievements } from '@/stores/useAutomationXPStore';
import { ACHIEVEMENTS } from '@/config/automationXP.config';
import type { Achievement, AchievementCategory } from '@/types/automationXP';
import './AchievementsPanel.css';

interface AchievementsPanelProps {
  compact?: boolean;
  maxVisible?: number;
  showLocked?: boolean;
  className?: string;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  compact = false,
  maxVisible = 6,
  showLocked = false,
  className = '',
}) => {
  const achievementsData = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Récupérer les achievements depuis le résultat structuré
  const unlockedAchievements = achievementsData.unlocked;
  const allAchievementsFromConfig = Object.values(ACHIEVEMENTS);

  const allAchievements = useMemo(() => {
    return allAchievementsFromConfig.map((config) => {
      const unlocked = unlockedAchievements.find((a: Achievement) => a.id === config.id);
      return {
        ...config,
        unlocked: !!unlocked,
        unlocked_at: unlocked?.unlocked_at,
      };
    });
  }, [unlockedAchievements, allAchievementsFromConfig]);

  const filteredAchievements = useMemo(() => {
    let filtered = allAchievements;

    if (!showLocked) {
      filtered = filtered.filter(a => a.unlocked);
    }

    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    return filtered;
  }, [allAchievements, showLocked, selectedCategory]);

  const displayedAchievements = showAll
    ? filteredAchievements
    : filteredAchievements.slice(0, maxVisible);

  const categories = useMemo(() => {
    const cats = new Set(allAchievements.map(a => a.category));
    return Array.from(cats) as AchievementCategory[];
  }, [allAchievements]);

  const stats = useMemo(() => ({
    unlocked: achievementsData.totalUnlocked,
    total: achievementsData.totalCount,
    percentage: achievementsData.completionPercentage,
  }), [achievementsData]);

  const getCategoryIcon = (category: AchievementCategory): string => {
    const icons: Record<AchievementCategory, string> = {
      beginner: '🌱',
      explorer: '🧭',
      creator: '✨',
      automator: '🤖',
      streaker: '🔥',
      contributor: '👥',
      master: '⚡',
      legendary: '🔮',
    };
    return icons[category] || '🏆';
  };

  const getRarityClass = (rarity: string): string => {
    return `achievement--${rarity}`;
  };

  // Recent achievements (unlocked in last 24h)
  const recentAchievements = useMemo(() => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return unlockedAchievements.filter((a: Achievement) =>
      a.unlocked_at && a.unlocked_at > oneDayAgo
    ).slice(0, 3);
  }, [unlockedAchievements]);

  if (compact) {
    return (
      <div className={`achievements-panel achievements-panel--compact ${className}`}>
        <div className="achievements-compact-header">
          <span className="achievements-icon">🏆</span>
          <span className="achievements-count">{stats.unlocked}/{stats.total}</span>
        </div>
        <div className="achievements-mini-grid">
          {recentAchievements.map((achievement: Achievement) => (
            <div
              key={achievement.id}
              className="achievement-mini"
              title={achievement.name}
            >
              <span className="achievement-mini-icon">{achievement.icon}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`achievements-panel ${className}`}>
      {/* Header */}
      <div className="achievements-header">
        <h3 className="achievements-title">🏆 Achievements</h3>
        <div className="achievements-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          <span className="progress-text">{stats.unlocked}/{stats.total}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="achievements-categories">
        <button
          className={`category-btn ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          Tous
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {getCategoryIcon(category)} {category}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {displayedAchievements.map(achievement => (
          <div
            key={achievement.id}
            className={`achievement-card ${getRarityClass(achievement.rarity)} ${achievement.unlocked ? 'unlocked' : 'locked'}`}
          >
            <div className="achievement-icon">{achievement.icon}</div>
            <div className="achievement-info">
              <h4 className="achievement-name">{achievement.name}</h4>
              <p className="achievement-description">{achievement.description}</p>
              {achievement.unlocked && achievement.unlocked_at && (
                <span className="achievement-date">
                  {new Date(achievement.unlocked_at).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <div className="achievement-xp">+{achievement.xp_reward} XP</div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {filteredAchievements.length > maxVisible && (
        <button
          className="show-more-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Voir moins' : `Voir tout (${filteredAchievements.length})`}
        </button>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="recent-achievements">
          <h4>🎉 Récemment débloqués</h4>
          <div className="recent-list">
            {recentAchievements.map((achievement: Achievement) => (
              <div key={achievement.id} className="recent-item">
                <span className="recent-icon">{achievement.icon}</span>
                <span className="recent-name">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPanel;
