/**
 * ═══════════════════════════════════════════════════════════
 *   TITANE∞ v15.5 — PROJECT CARD COMPONENT
 *   Carte projet avec barre XP, niveau, progression
 * ═══════════════════════════════════════════════════════════
 */

import React from 'react';
import './styles/ProjectCard.css';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  xp: number;
  maxXp: number;
  level: number;
  categories: string[];
  lastUpdated?: Date;
  onClick?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  xp,
  maxXp,
  level,
  categories,
  lastUpdated,
  onClick
}) => {
  const progress = Math.min((xp / maxXp) * 100, 100);

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-card-header">
        <div className="project-card-info">
          <h3 className="project-card-title">{name}</h3>
          {description && (
            <p className="project-card-description">{description}</p>
          )}
        </div>
        <div className="project-card-level">
          <span className="project-card-level-label">Niv.</span>
          <span className="project-card-level-value">{level}</span>
        </div>
      </div>

      <div className="project-card-xp">
        <div className="project-card-xp-bar">
          <div 
            className="project-card-xp-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="project-card-xp-info">
          <span className="project-card-xp-text">
            {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
          </span>
          <span className="project-card-xp-percent">{progress.toFixed(1)}%</span>
        </div>
      </div>

      <div className="project-card-footer">
        <div className="project-card-categories">
          {categories.slice(0, 3).map((cat, idx) => (
            <span key={idx} className="project-card-category">
              {cat}
            </span>
          ))}
          {categories.length > 3 && (
            <span className="project-card-category-more">
              +{categories.length - 3}
            </span>
          )}
        </div>
        {lastUpdated && (
          <span className="project-card-date">
            {lastUpdated.toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>
    </div>
  );
};
