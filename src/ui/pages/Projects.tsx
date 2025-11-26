/**
 * TITANE∞ v15 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * Unauthorized use, reproduction, modification, distribution or extraction
 * of the software, its architecture, engines or components is strictly prohibited.
 * See LICENSE.md for the full legal terms (FR/EN).
 */

/**
 * ═══════════════════════════════════════════════════════════
 *   TITANE∞ v15.5 — PROJECTS PAGE
 *   Liste des projets, XP, niveaux, catégories, bouton Chat contextualisé
 * ═══════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { HUDFrame } from '../components/HUDFrame';
import { ProjectCard } from '../components/ProjectCard';
import './styles/Projects.css';

interface Project {
  id: string;
  name: string;
  description: string;
  xp: number;
  maxXp: number;
  level: number;
  categories: string[];
  lastUpdated: Date;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'TITANE∞ Core',
    description: 'Moteur principal et système auto-évolutif',
    xp: 8540,
    maxXp: 10000,
    level: 12,
    categories: ['Architecture', 'Backend', 'AI'],
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'UI/UX Rebuild v15.5',
    description: 'Refonte complète de l interface utilisateur',
    xp: 3200,
    maxXp: 5000,
    level: 7,
    categories: ['Frontend', 'Design', 'React'],
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'EXP Fusion Engine',
    description: 'Système d expérience et progression',
    xp: 1850,
    maxXp: 3000,
    level: 5,
    categories: ['Backend', 'Database', 'Analytics'],
    lastUpdated: new Date()
  }
];

export const ProjectsPage: React.FC = () => {
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [_selectedProject, setSelectedProject] = useState<string | null>(null); // TODO: Ajouter highlight projet
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChat = (_projectId: string) => {
    // TODO: Router navigation avec contexte projet
    // Le paramètre sera utilisé pour la navigation contextuelle
  };

  return (
    <div className="projects-page">
      <HUDFrame title="Projets" icon="📁">
        {/* Header avec recherche */}
        <div className="projects-header">
          <div className="projects-stats">
            <div className="projects-stat">
              <span className="projects-stat-value">{projects.length}</span>
              <span className="projects-stat-label">Projets actifs</span>
            </div>
            <div className="projects-stat">
              <span className="projects-stat-value">
                {projects.reduce((acc, p) => acc + p.xp, 0).toLocaleString()}
              </span>
              <span className="projects-stat-label">XP Total</span>
            </div>
            <div className="projects-stat">
              <span className="projects-stat-value">
                {(projects.reduce((acc, p) => acc + p.level, 0) / projects.length).toFixed(1)}
              </span>
              <span className="projects-stat-label">Niveau Moyen</span>
            </div>
          </div>

          <input
            type="text"
            className="projects-search"
            placeholder="🔍 Rechercher un projet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Liste des projets */}
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div key={project.id} className="projects-item">
              <ProjectCard
                {...project}
                onClick={() => setSelectedProject(project.id)}
              />
              <button
                className="projects-chat-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenChat(project.id);
                }}
              >
                💬 Ouvrir le Chat pour ce projet
              </button>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="projects-empty">
            <div className="projects-empty-icon">📁</div>
            <p className="projects-empty-text">
              Aucun projet ne correspond à votre recherche
            </p>
          </div>
        )}
      </HUDFrame>
    </div>
  );
};
