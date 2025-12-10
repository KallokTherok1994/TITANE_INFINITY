/**
 * TITANE∞ v20.0 — MemoryTree Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState } from 'react';
import type { MemoryNode } from '../store/devtools.store';

export interface MemoryTreeProps {
  nodes: MemoryNode[];
  onNodeClick?: (node: MemoryNode) => void;
  className?: string;
}

const memoryTypeIcons: Record<MemoryNode['type'], string> = {
  stm: '⚡',
  mtm: '📦',
  ltm: '🗄️',
};

const memoryTypeColors: Record<MemoryNode['type'], string> = {
  stm: 'var(--text-info, #727b81)',
  mtm: 'var(--text-warning, #e3d5d5)',
  ltm: 'var(--text-success, #93b399)',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function MemoryTreeNode({
  node,
  level = 0,
  onNodeClick,
}: {
  node: MemoryNode;
  level?: number;
  onNodeClick?: (node: MemoryNode) => void;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onNodeClick?.(node);
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white hover:bg-opacity-5 transition-colors duration-150"
        style={{
          paddingLeft: `${level * 20 + 12}px`,
        }}
      >
        {/* Expand Icon */}
        {hasChildren && (
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {expanded ? '▼' : '▶'}
          </span>
        )}

        {/* Type Icon */}
        <span className="text-base" style={{ color: memoryTypeColors[node.type] }}>
          {memoryTypeIcons[node.type]}
        </span>

        {/* Label */}
        <span
          className="flex-1 text-sm font-medium"
          style={{ color: 'var(--text-primary, #e0e0e0)' }}
        >
          {node.label}
        </span>

        {/* Entries Count */}
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--bg-surface, #181c21)',
            color: 'var(--text-muted, rgba(255,255,255,0.60))',
          }}
        >
          {node.entries} entries
        </span>

        {/* Size */}
        <span
          className="text-xs font-mono"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
        >
          {formatBytes(node.size)}
        </span>

        {/* Last Update */}
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          title={new Date(node.lastUpdate).toLocaleString()}
        >
          {formatRelativeTime(node.lastUpdate)}
        </span>
      </button>

      {/* Children */}
      {expanded && hasChildren && node.children && (
        <div>
          {node.children.map(child => (
            <MemoryTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * MemoryTree - Explorateur hiérarchique de mémoire
 *
 * @example
 * ```tsx
 * <MemoryTree
 *   nodes={memoryNodes}
 *   onNodeClick={(node) => console.log('Clicked', node)}
 * />
 * ```
 */
export function MemoryTree({ nodes, onNodeClick, className = '' }: MemoryTreeProps) {
  return (
    <div
      className={`rounded-lg border overflow-hidden ${className}`}
      style={{
        background: 'var(--bg-panel, #101216)',
        borderColor: 'var(--border, rgba(196,196,196,0.12))',
      }}
    >
      {nodes.map(node => (
        <MemoryTreeNode key={node.id} node={node} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
}
