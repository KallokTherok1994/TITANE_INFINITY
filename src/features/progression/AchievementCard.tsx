/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * AchievementCard - Composant pour afficher un achievement
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { Achievement } from './achievements';
import { getRarityColor, calculateAchievementProgress } from './achievements';
import './AchievementCard.css';

interface AchievementCardProps {
  achievement: Achievement;
  currentStats?: {
    level: number;
    totalXP: number;
    messageCount: number;
    modesUsed: number;
  };
  onClick?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  currentStats,
  onClick,
}) => {
  const progress = currentStats
    ? calculateAchievementProgress(achievement, currentStats)
    : 0;

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <motion.div
      className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
      style={{
        borderColor: achievement.unlocked ? rarityColor : 'rgba(100, 116, 139, 0.3)',
      }}
      whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
      whileTap={{ scale: achievement.unlocked ? 0.95 : 1 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div
        className="achievement-icon"
        style={{
          background: achievement.unlocked
            ? `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}10)`
            : 'rgba(100, 116, 139, 0.1)',
        }}
      >
        <span
          style={{
            fontSize: '2rem',
            filter: achievement.unlocked ? 'none' : 'grayscale(1)',
          }}
        >
          {achievement.icon}
        </span>
      </div>

      {/* Info */}
      <div className="achievement-info">
        <h4
          className="achievement-name"
          style={{ color: achievement.unlocked ? rarityColor : '#64748b' }}
        >
          {achievement.name}
        </h4>
        <p className="achievement-description">{achievement.description}</p>

        {/* Rarity Badge */}
        <span
          className="achievement-rarity"
          style={{
            background: `${rarityColor}20`,
            color: rarityColor,
            borderColor: rarityColor,
          }}
        >
          {achievement.rarity}
        </span>
      </div>

      {/* Progress Bar (for locked achievements) */}
      {!achievement.unlocked && currentStats && (
        <div className="achievement-progress-container">
          <div className="achievement-progress-bar">
            <motion.div
              className="achievement-progress-fill"
              style={{ background: rarityColor }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="achievement-progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {/* XP Reward */}
      {achievement.xpReward > 0 && (
        <div className="achievement-reward">
          <span>+{achievement.xpReward} XP</span>
        </div>
      )}

      {/* Unlocked Date */}
      {achievement.unlocked && achievement.unlockedAt && (
        <div className="achievement-unlocked-date">
          <small>
            Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
          </small>
        </div>
      )}
    </motion.div>
  );
};
