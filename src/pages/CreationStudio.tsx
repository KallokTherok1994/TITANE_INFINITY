/**
 * TITANE∞ v30.1.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v30.1.0 — Creation Studio Page
 * Studio de création : interface pour créer du contenu, projets, assets.
 * Layout : header + zone de travail principale + sidebar d'outils.
 * ═══════════════════════════════════════════════════════════════
 */

import React, { useState, memo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Layers,
  Plus,
  FileText,
  Image,
  Code2,
  Music,
  Video,
  Wand2,
  FolderOpen,
  Star,
  Clock,
  Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

type AssetType = 'text' | 'image' | 'code' | 'audio' | 'video' | 'template';

interface CreationTool {
  id: AssetType;
  label: string;
  icon: React.ReactNode;
  description: string;
  status: 'available' | 'beta' | 'coming';
}

interface RecentProject {
  id: string;
  name: string;
  type: AssetType;
  updatedAt: string;
  status: 'draft' | 'active' | 'published';
}

// ─────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────

const TOOLS: CreationTool[] = [
  {
    id: 'text',
    label: 'Éditeur Texte',
    icon: <FileText className="w-5 h-5" />,
    description: 'Rédaction assistée par IA, prompts, articles',
    status: 'available',
  },
  {
    id: 'code',
    label: 'Code Studio',
    icon: <Code2 className="w-5 h-5" />,
    description: 'Génération et refactoring de code',
    status: 'available',
  },
  {
    id: 'image',
    label: 'Image Builder',
    icon: <Image className="w-5 h-5" />,
    description: "Génération et manipulation d'images",
    status: 'beta',
  },
  {
    id: 'audio',
    label: 'Audio Studio',
    icon: <Music className="w-5 h-5" />,
    description: 'Synthèse vocale, musique, podcasts',
    status: 'available',
  },
  {
    id: 'video',
    label: 'Vidéo Engine',
    icon: <Video className="w-5 h-5" />,
    description: 'Montage et génération vidéo',
    status: 'coming',
  },
  {
    id: 'template',
    label: 'Templates',
    icon: <Wand2 className="w-5 h-5" />,
    description: 'Modèles et workflows prédéfinis',
    status: 'available',
  },
];

const RECENT_PROJECTS: RecentProject[] = [
  {
    id: '1',
    name: "Rapport d'audit V30",
    type: 'text',
    updatedAt: '2026-04-11',
    status: 'active',
  },
  {
    id: '2',
    name: 'Module TITANE API',
    type: 'code',
    updatedAt: '2026-04-10',
    status: 'draft',
  },
  {
    id: '3',
    name: 'Présentation système',
    type: 'image',
    updatedAt: '2026-04-09',
    status: 'published',
  },
  {
    id: '4',
    name: 'Voice greeting V∞',
    type: 'audio',
    updatedAt: '2026-04-08',
    status: 'active',
  },
];

const STATUS_COLORS = {
  available: 'success',
  beta: 'warning',
  coming: 'neutral',
} as const;

const PROJECT_STATUS_COLORS = {
  draft: 'neutral',
  active: 'primary',
  published: 'success',
} as const;

const TOOL_ICONS: Record<AssetType, React.ReactNode> = {
  text: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  template: <Wand2 className="w-4 h-4" />,
};

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export const CreationStudio: React.FC = memo(() => {
  const [activeTool, setActiveTool] = useState<AssetType | null>(null);
  const [workspaceContent, setWorkspaceContent] = useState('');

  return (
    <div
      className="min-h-screen bg-gray-900 text-white"
      data-testid="page-creation-studio"
    >
      {/* ── Header ── */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Layers className="w-7 h-7 text-violet-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Creation Studio</h1>
              <p className="text-sm text-gray-400">
                Créez du contenu, des projets et des assets avec l'IA TITANE∞
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="info" size="sm">
              v30.1.0
            </Badge>
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Nouveau projet
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="flex max-w-7xl mx-auto h-[calc(100vh-73px)]">
        {/* Sidebar d'outils */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Outils de création
          </p>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              disabled={tool.status === 'coming'}
              className={[
                'w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3',
                activeTool === tool.id
                  ? 'bg-violet-900/60 border border-violet-600'
                  : 'hover:bg-gray-700 border border-transparent',
                tool.status === 'coming' ? 'opacity-40 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <span className="text-violet-400 mt-0.5">{tool.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{tool.label}</span>
                  {tool.status !== 'available' && (
                    <Badge variant={STATUS_COLORS[tool.status]} size="sm">
                      {tool.status}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {tool.description}
                </p>
              </div>
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span>Studio actif</span>
              <Badge variant="success" size="sm" dot />
            </div>
          </div>
        </aside>

        {/* Zone de travail principale */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTool ? (
            <div className="flex-1 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-violet-400">{TOOL_ICONS[activeTool]}</span>
                  <h2 className="text-lg font-semibold">
                    {TOOLS.find(t => t.id === activeTool)?.label}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    Sauvegarder
                  </Button>
                  <Button variant="primary" size="sm">
                    <Wand2 className="w-4 h-4 mr-1" />
                    Générer avec IA
                  </Button>
                </div>
              </div>
              <Card variant="glass" elevation="md" padding={0} className="flex-1">
                <textarea
                  className="w-full h-full bg-transparent text-white placeholder-gray-500 p-4 resize-none outline-none font-mono text-sm"
                  placeholder={`Contenu ${TOOLS.find(t => t.id === activeTool)?.label.toLowerCase()}...`}
                  value={workspaceContent}
                  onChange={e => setWorkspaceContent(e.target.value)}
                />
              </Card>
            </div>
          ) : (
            <div className="flex-1 p-6">
              {/* Welcome + récents */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">
                  Bienvenue dans le Creation Studio
                </h2>
                <p className="text-gray-400 text-sm">
                  Sélectionnez un outil dans la sidebar pour commencer à créer.
                </p>
              </div>

              {/* Quick-action cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {TOOLS.filter(t => t.status !== 'coming').map(tool => (
                  <Card
                    key={tool.id}
                    variant="solid"
                    elevation="sm"
                    padding={4}
                    hoverable
                    onClick={() => setActiveTool(tool.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-900/40 rounded-lg text-violet-400">
                        {tool.icon}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{tool.label}</p>
                        <p className="text-xs text-gray-400">{tool.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Projets récents */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                    Projets récents
                  </h3>
                </div>
                <div className="flex flex-col gap-2">
                  {RECENT_PROJECTS.map(project => (
                    <Card
                      key={project.id}
                      variant="bordered"
                      elevation="none"
                      padding={3}
                      hoverable
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">{TOOL_ICONS[project.type]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Modifié le {project.updatedAt}
                          </p>
                        </div>
                        <Badge variant={PROJECT_STATUS_COLORS[project.status]} size="sm">
                          {project.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar droite - Stats */}
        <aside className="w-56 bg-gray-800 border-l border-gray-700 p-4 flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Statistiques
          </p>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-400">Projets actifs</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {RECENT_PROJECTS.filter(p => p.status === 'active').length}
            </p>
          </Card>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Total projets</span>
            </div>
            <p className="text-2xl font-bold text-white">{RECENT_PROJECTS.length}</p>
          </Card>
          <Card variant="solid" padding={3}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-gray-400">Outils dispo</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {TOOLS.filter(t => t.status !== 'coming').length}
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
});
CreationStudio.displayName = 'CreationStudio';

export default CreationStudio;
