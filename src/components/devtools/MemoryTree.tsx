/**
 * TITANE∞ v35.1.8 — MemoryTree Component
 * Hierarchical memory visualization
 */

import type { MemoryNode } from '@/types';

export interface MemoryTreeProps {
  root: MemoryNode;
  onNodeClick?: (node: MemoryNode) => void;
}

function TreeNode({
  node,
  depth = 0,
  onNodeClick,
}: {
  node: MemoryNode;
  depth?: number;
  onNodeClick?: (node: MemoryNode) => void;
}) {
  const indent = depth * 20;

  return (
    <div>
      <div
        className="p-2 hover:bg-titanium-bg-elevated cursor-pointer"
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={() => onNodeClick?.(node)}
      >
        <div className="flex items-center gap-2">
          {node.children && node.children.length > 0 && (
            <span className="text-titanium-text-disabled">▶</span>
          )}
          <span className="text-sm font-medium text-titanium-text-primary">
            {node.type}
          </span>
          <span className="text-xs text-titanium-text-tertiary">
            {new Date(node.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-titanium-text-disabled mt-1 truncate">
          {node.content}
        </div>
      </div>
      {node.children?.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          onNodeClick={onNodeClick}
        />
      ))}
    </div>
  );
}

export function MemoryTree({ root, onNodeClick }: MemoryTreeProps) {
  return (
    <div className="border border-titanium-border-default rounded-lg overflow-hidden">
      <TreeNode node={root} onNodeClick={onNodeClick} />
    </div>
  );
}
