/**
 * TITANE∞ v26.0 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * MemoryTreeViewer - Visualisation en arbre de la mémoire TITANE
 * Utilise react-d3-tree pour afficher hiérarchie court/moyen/long terme
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { Search, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { filterMemoryTree, type MemoryTreeNodeData } from './memoryTreeData';
import { useDebounce } from '@/hooks/useDebounce';
import './MemoryTreeViewer.css';

interface MemoryTreeViewerProps {
  data?: MemoryTreeNodeData;
  onNodeClick?: (node: MemoryTreeNodeData) => void;
  showAttributes?: boolean;
  selectedEntryId?: string | null;
  isLoading?: boolean;
}

export const MemoryTreeViewer: React.FC<MemoryTreeViewerProps> = ({
  data,
  onNodeClick,
  showAttributes = true,
  selectedEntryId = null,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedHierarchyPointRef = useRef<{ x: number; y: number } | null>(null);
  const [translate, setTranslate] = useState({ x: 400, y: 200 });
  const [zoom, setZoom] = useState(0.8);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string>('all');

  selectedHierarchyPointRef.current = null;

  const treeData = useMemo(() => {
    if (!data) {
      return null;
    }

    return filterMemoryTree(data, debouncedSearchTerm.trim(), selectedType);
  }, [data, debouncedSearchTerm, selectedType]);
  const isBootstrappingMemory = isLoading && !data;
  const hasPersistentTree = Boolean(data);
  const hasFilteredTree = Boolean(treeData);

  // Store searchTerm in ref to check match without re-creating callback
  const searchTermRef = React.useRef(debouncedSearchTerm);
  React.useEffect(() => {
    searchTermRef.current = debouncedSearchTerm;
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const updateDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        return;
      }

      setDimensions(prev =>
        prev.width === rect.width && prev.height === rect.height
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };

    updateDimensions();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const observer = new ResizeObserver(() => updateDimensions());
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!selectedEntryId || !selectedHierarchyPointRef.current) {
      return;
    }

    const nextTranslate = {
      x: -selectedHierarchyPointRef.current.x * zoom + dimensions.width / 2,
      y: -selectedHierarchyPointRef.current.y * zoom + dimensions.height / 2,
    };

    setTranslate(prev =>
      Math.abs(prev.x - nextTranslate.x) < 0.5 && Math.abs(prev.y - nextTranslate.y) < 0.5
        ? prev
        : nextTranslate
    );
  }, [selectedEntryId, zoom, dimensions, treeData]);

  // Node rendering avec style personnalisé
  const renderCustomNode = useCallback(
    ({
      nodeDatum,
      hierarchyPointNode,
    }: {
      nodeDatum: MemoryTreeNodeData;
      hierarchyPointNode: { x: number; y: number };
    }) => {
      // Access searchTerm via ref to avoid adding it to dependencies
      const currentSearch = searchTermRef.current.toLowerCase();
      const isMatch = currentSearch
        ? nodeDatum.name.toLowerCase().includes(currentSearch)
        : false;
      const isSelected =
        selectedEntryId !== null &&
        String(nodeDatum.attributes?.entryId ?? '') === selectedEntryId;

      if (isSelected) {
        selectedHierarchyPointRef.current = hierarchyPointNode;
      }

      return (
        <g>
          {/* Node circle */}
          <circle
            r={isSelected ? 24 : 20}
            fill={getNodeColor(nodeDatum)}
            stroke={isSelected ? '#22d3ee' : isMatch ? '#f59e0b' : '#3b82f6'}
            strokeWidth={isSelected ? 4 : isMatch ? 3 : 2}
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
            fontWeight={isSelected || isMatch ? 'bold' : 'normal'}
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
    [showAttributes, onNodeClick, selectedEntryId]
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.3));
  const handleReset = () => {
    setZoom(0.8);
    setTranslate({ x: 400, y: 200 });
  };

  const handleTreeUpdate = useCallback(
    (nextState: { translate: { x: number; y: number }; zoom: number }) => {
      setTranslate(prev =>
        Math.abs(prev.x - nextState.translate.x) < 0.5 &&
        Math.abs(prev.y - nextState.translate.y) < 0.5
          ? prev
          : nextState.translate
      );
      setZoom(prev => (Math.abs(prev - nextState.zoom) < 0.001 ? prev : nextState.zoom));
    },
    []
  );

  return (
    <div className="memory-tree-container" ref={containerRef}>
      {selectedEntryId && (
        <div
          className="memory-tree-selection-state"
          data-testid="memory-tree-selection-state"
        >
          Entree synchronisee: {selectedEntryId}
        </div>
      )}

      {hasPersistentTree && !isBootstrappingMemory && (
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
      )}

      {/* Tree visualization */}
      <div className="memory-tree-canvas">
        {!hasPersistentTree ? (
          isBootstrappingMemory ? (
            <div className="memory-tree-empty-state" role="status">
              <strong>Chargement de l&apos;arbre mémoire</strong>
              <span>TITANE reconstruit actuellement la hiérarchie persistante.</span>
            </div>
          ) : (
            <div className="memory-tree-empty-state" role="status">
              <strong>Aucune entrée mémoire disponible</strong>
              <span>
                L&apos;arbre s&apos;activera dès qu&apos;une entrée réelle sera présente.
              </span>
            </div>
          )
        ) : !hasFilteredTree ? (
          <div className="memory-tree-empty-state" role="status">
            Aucun nœud ne correspond aux filtres actifs
          </div>
        ) : (
          <Tree
            data={treeData ?? undefined}
            dimensions={dimensions}
            translate={translate}
            zoom={zoom}
            onUpdate={handleTreeUpdate}
            orientation="vertical"
            pathFunc="step"
            renderCustomNodeElement={renderCustomNode}
            nodeSize={{ x: 200, y: 150 }}
            separation={{ siblings: 1.5, nonSiblings: 2 }}
            enableLegacyTransitions
            transitionDuration={300}
          />
        )}
      </div>

      {hasPersistentTree && !isBootstrappingMemory && (
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
      )}
    </div>
  );
};

// Get node color based on type
function getNodeColor(node: MemoryTreeNodeData): string {
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
function getNodeIcon(node: MemoryTreeNodeData): string {
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
