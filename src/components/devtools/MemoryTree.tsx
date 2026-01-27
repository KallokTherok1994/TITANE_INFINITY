/**
 * TITANE∞ v26.4.0 — MemoryTree Component
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
        className="p-2 hover:bg-gray-800 cursor-pointer"
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={() => onNodeClick?.(node)}
      >
        <div className="flex items-center gap-2">
          {node.children && node.children.length > 0 && (
            <span className="text-gray-500">▶</span>
          )}
          <span className="text-sm font-medium text-white">{node.type}</span>
          <span className="text-xs text-gray-400">
            {new Date(node.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate">{node.content}</div>
      </div>
      {node.children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} onNodeClick={onNodeClick} />
      ))}
    </div>
  );
}

export function MemoryTree({ root, onNodeClick }: MemoryTreeProps) {
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <TreeNode node={root} onNodeClick={onNodeClick} />
    </div>
  );
}
