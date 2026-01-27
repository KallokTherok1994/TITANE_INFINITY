/**
 * TITANE∞ v20.0 — Memory Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState } from 'react';
import { useDevToolsStore, type MemoryNode } from '../store/devtools.store';
import { SectionHeader, MemoryTree } from '../components';

/**
 * Memory - Exploration de la mémoire TITANE∞ (STM/MTM/LTM)
 */
export function Memory() {
  const { memoryTree } = useDevToolsStore();
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);

  const totalSize = memoryTree.reduce((sum, node) => sum + node.size, 0);
  const totalEntries = memoryTree.reduce((sum, node) => sum + node.entries, 0);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleNodeClick = (node: MemoryNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Memory Explorer"
        description="Inspection hiérarchique STM / MTM / LTM"
        actions={
          <div className="flex gap-2">
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Purge STM
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
              style={{
                background: 'var(--bg-surface, #181c21)',
                color: 'var(--text-primary, #e0e0e0)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              Reload Memory
            </button>
          </div>
        }
      />

      {/* Memory Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Total Size
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {formatBytes(totalSize)}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Total Entries
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {totalEntries}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border, rgba(196,196,196,0.12))',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Memory Layers
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {memoryTree.length}
          </div>
        </div>
      </div>

      {/* Memory Tree */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            Memory Hierarchy
          </h3>
          <MemoryTree nodes={memoryTree} onNodeClick={handleNodeClick} />
        </div>

        {/* Node Details */}
        <div>
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            Node Details
          </h3>
          {selectedNode ? (
            <div
              className="p-4 rounded-lg border space-y-4"
              style={{
                background: 'var(--bg-panel, #101216)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Label
                </div>
                <div
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary, #e0e0e0)' }}
                >
                  {selectedNode.label}
                </div>
              </div>

              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Type
                </div>
                <div
                  className="text-sm font-medium px-2 py-1 rounded-full inline-block"
                  style={{
                    background:
                      selectedNode.type === 'stm'
                        ? 'rgba(114, 123, 129, 0.15)'
                        : selectedNode.type === 'mtm'
                          ? 'rgba(227, 213, 213, 0.15)'
                          : 'rgba(147, 179, 153, 0.15)',
                    color:
                      selectedNode.type === 'stm'
                        ? 'var(--text-info, #727b81)'
                        : selectedNode.type === 'mtm'
                          ? 'var(--text-warning, #e3d5d5)'
                          : 'var(--text-success, #93b399)',
                  }}
                >
                  {selectedNode.type?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Size
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {formatBytes(selectedNode.size)}
                  </div>
                </div>

                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Entries
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {selectedNode.entries}
                  </div>
                </div>
              </div>

              <div>
                <div
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                >
                  Last Update
                </div>
                <div
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary, #e0e0e0)' }}
                >
                  {new Date(selectedNode.lastUpdate).toLocaleString()}
                </div>
              </div>

              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <div
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
                  >
                    Children
                  </div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary, #e0e0e0)' }}
                  >
                    {selectedNode.children.length} sub-nodes
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
                  style={{
                    background: 'var(--bg-surface, #181c21)',
                    color: 'var(--text-primary, #e0e0e0)',
                    borderColor: 'var(--border, rgba(196,196,196,0.12))',
                  }}
                >
                  Inspect Content
                </button>
                <button
                  className="flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors duration-150 hover:bg-opacity-80"
                  style={{
                    background: 'var(--bg-surface, #181c21)',
                    color: 'var(--text-danger, #8b5f5f)',
                    borderColor: 'var(--border-danger, #8b5f5f)',
                  }}
                >
                  Clear Node
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-64 rounded-lg border"
              style={{
                background: 'var(--bg-panel, #101216)',
                borderColor: 'var(--border, rgba(196,196,196,0.12))',
              }}
            >
              <p
                className="text-sm"
                style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
              >
                Select a memory node to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
