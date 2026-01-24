/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * MemoryTreeViewer - Visualisation en arbre de la mémoire TITANE
 * Utilise react-d3-tree pour afficher hiérarchie court/moyen/long terme
 */

import React, { useState, useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import './MemoryTreeViewer.css';

interface MemoryNode {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: MemoryNode[];
}

interface TreeNodeData {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children?: TreeNodeData[];
}

interface MemoryTreeViewerProps {
  data?: MemoryNode;
  onNodeClick?: (node: TreeNodeData) => void;
  showAttributes?: boolean;
}

export const MemoryTreeViewer: React.FC<MemoryTreeViewerProps> = ({
  data,
  onNodeClick,
  showAttributes = true,
}) => {
  const [translate, setTranslate] = useState({ x: 400, y: 200 });
  const [zoom, setZoom] = useState(0.8);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock data si pas de données fournies
  const baseTreeData = useMemo(() => {
    if (data) return data;
    return generateMockMemoryTree();
  }, [data]);

  // ⚠️ FIX: Memoize filtered tree to prevent infinite loop
  // Tree only re-renders when searchTerm/data changes, not on every keystroke
  const treeData = useMemo(() => {
    return baseTreeData; // Filtering logic can be added here if needed
  }, [baseTreeData]);

  // Store searchTerm in ref to check match without re-creating callback
  const searchTermRef = React.useRef(searchTerm);
  React.useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Node rendering avec style personnalisé
  const renderCustomNode = useCallback(
    ({ nodeDatum }: { nodeDatum: TreeNodeData }) => {
      // Access searchTerm via ref to avoid adding it to dependencies
      const currentSearch = searchTermRef.current.toLowerCase();
      const isMatch = currentSearch ? nodeDatum.name.toLowerCase().includes(currentSearch) : false;

      return (
        <g>
          {/* Node circle */}
          <circle
            r={20}
            fill={getNodeColor(nodeDatum)}
            stroke={isMatch ? '#f59e0b' : '#3b82f6'}
            strokeWidth={isMatch ? 3 : 2}
            style={{ cursor: 'pointer' }}
            onClick={() => onNodeClick?.(nodeDatum)}
          />

          {/* Node icon */}
          <text
            fill="#ffffff"
            fontSize="16"
            textAnchor="middle"
            dy=".3em"
            style={{ pointerEvents: 'none' }}
          >
            {getNodeIcon(nodeDatum)}
          </text>

          {/* Node label */}
          <text
            fill="#e2e8f0"
            fontSize="12"
            fontWeight={isMatch ? 'bold' : 'normal'}
            textAnchor="middle"
            dy="35"
            style={{ pointerEvents: 'none' }}
          >
            {nodeDatum.name}
          </text>

          {/* Attributes (if enabled) */}
          {showAttributes && nodeDatum.attributes && (
            <text
              fill="#94a3b8"
              fontSize="10"
              textAnchor="middle"
              dy="50"
              style={{ pointerEvents: 'none' }}
            >
              {Object.keys(nodeDatum.attributes).length} attr.
            </text>
          )}
        </g>
      );
    },
    [showAttributes, onNodeClick]
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setZoom(0.8);
    setTranslate({ x: 400, y: 200 });
  };

  return (
    <div className="memory-tree-container">
      {/* Toolbar */}
      <div className="memory-tree-toolbar">
        {/* Search */}
        <div className="memory-tree-search">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher dans la mémoire..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filter */}
        <select
          className="memory-tree-filter"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="all">Tous types</option>
          <option value="short">Court terme</option>
          <option value="mid">Moyen terme</option>
          <option value="long">Long terme</option>
        </select>

        {/* Zoom controls */}
        <div className="memory-tree-controls">
          <button onClick={handleZoomOut} title="Zoom arrière">
            <ZoomOut size={16} />
          </button>
          <button onClick={handleZoomIn} title="Zoom avant">
            <ZoomIn size={16} />
          </button>
          <button onClick={handleReset} title="Réinitialiser">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {/* Tree visualization */}
      <div className="memory-tree-canvas">
        <Tree
          data={treeData}
          translate={translate}
          zoom={zoom}
          orientation="vertical"
          pathFunc="step"
          renderCustomNodeElement={renderCustomNode}
          nodeSize={{ x: 200, y: 150 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          enableLegacyTransitions
          transitionDuration={300}
        />
      </div>

      {/* Legend */}
      <div className="memory-tree-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }} />
          <span>Court terme</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#3b82f6' }} />
          <span>Moyen terme</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#8b5cf6' }} />
          <span>Long terme</span>
        </div>
      </div>
    </div>
  );
};

// Get node color based on type
function getNodeColor(node: TreeNodeData): string {
  const type = node.attributes?.type || 'mid';

  switch (type) {
    case 'short':
      return '#10b981';
    case 'mid':
      return '#3b82f6';
    case 'long':
      return '#8b5cf6';
    default:
      return '#64748b';
  }
}

// Get node icon
function getNodeIcon(node: TreeNodeData): string {
  const type = node.attributes?.type || 'mid';

  switch (type) {
    case 'short':
      return '⚡';
    case 'mid':
      return '🧠';
    case 'long':
      return '💎';
    default:
      return '📝';
  }
}

// Generate mock memory tree
function generateMockMemoryTree(): MemoryNode {
  return {
    name: 'Mémoire TITANE',
    attributes: { type: 'root' },
    children: [
      {
        name: 'Court Terme',
        attributes: { type: 'short', count: 247 },
        children: [
          {
            name: 'Session Active',
            attributes: { type: 'short', entries: 42 },
            children: [
              { name: 'Conv. récente', attributes: { type: 'short' } },
              { name: 'Contexte actuel', attributes: { type: 'short' } },
            ],
          },
          {
            name: 'Buffer Temporaire',
            attributes: { type: 'short', entries: 205 },
          },
        ],
      },
      {
        name: 'Moyen Terme',
        attributes: { type: 'mid', count: 1832 },
        children: [
          {
            name: 'Sessions Récentes',
            attributes: { type: 'mid', entries: 432 },
            children: [
              { name: 'Semaine passée', attributes: { type: 'mid' } },
              { name: 'Mois en cours', attributes: { type: 'mid' } },
            ],
          },
          {
            name: 'Apprentissages',
            attributes: { type: 'mid', entries: 1400 },
            children: [
              { name: 'Patterns détectés', attributes: { type: 'mid' } },
              { name: 'Contextes appris', attributes: { type: 'mid' } },
            ],
          },
        ],
      },
      {
        name: 'Long Terme',
        attributes: { type: 'long', count: 4521 },
        children: [
          {
            name: 'Connaissances',
            attributes: { type: 'long', entries: 3200 },
            children: [
              { name: 'Concepts', attributes: { type: 'long' } },
              { name: 'Procédures', attributes: { type: 'long' } },
            ],
          },
          {
            name: 'Identité',
            attributes: { type: 'long', entries: 1321 },
            children: [
              { name: 'Valeurs', attributes: { type: 'long' } },
              { name: 'Préférences', attributes: { type: 'long' } },
            ],
          },
        ],
      },
    ],
  };
}
