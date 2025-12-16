/**
 * TITANE∞ v20.0 — Engines Section
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React, { useState } from 'react';
import { useDevToolsStore } from '../store/devtools.store';
import { SectionHeader, EngineCard } from '../components';

/**
 * Engines - Gestion et monitoring des moteurs cognitifs
 */
export function Engines() {
  const { engines, updateEngine, setSelectedEngine } = useDevToolsStore();
  const [filter, setFilter] = useState<'all' | 'running' | 'idle' | 'error'>('all');

  const filteredEngines = engines.filter(e => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  const handleRestart = (id: string) => {
    updateEngine(id, { status: 'starting' });
    setTimeout(() => {
      updateEngine(id, {
        status: 'running',
        lastExecution: Date.now(),
        executionDuration: 0,
      });
    }, 1000);
  };

  const handleInspect = (id: string) => {
    setSelectedEngine(id);
    // IMPLEMENTATION: Open detailed engine inspection modal
    // 1. Component: Create <EngineDetailModal engine={selectedEngine} onClose={() => setSelectedEngine(null)} />
    // 2. Display: Comprehensive metrics (latency, throughput, error rate, memory usage)
    // 3. Configuration: Show current engine config, allow runtime adjustments
    // 4. State: Display internal state (queues, caches, active operations)
    // 5. Performance: Real-time graphs (last 5min) using Chart.js or Recharts
    // 6. Actions: Restart, reset, export logs, run diagnostics
    console.log('Inspect engine:', id);
  };

  const handleViewLogs = (id: string) => {
    setSelectedEngine(id);
    // IMPLEMENTATION: Switch to Logs section with engine filter
    // 1. Callback: onSwitchSection('Logs', { filterByEngine: id })
    // 2. Logs tab: Receive filter prop, update LogViewer to show only engine-specific logs
    // 3. Filter UI: Display "Showing logs for: {engineName}" with clear filter button
    // 4. Log query: Filter by log.source === id or log.tags.includes(engineName)
    // 5. Persistence: Save filter state in sessionStorage for tab switches
    console.log('View logs for:', id);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Cognitive Engines"
        description="Status et contrôle des moteurs TITANE∞"
        actions={
          <div className="flex gap-2">
            {(['all', 'running', 'idle', 'error'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  filter === status ? 'ring-1' : ''
                }`}
                style={{
                  background:
                    filter === status
                      ? 'var(--bg-primary, #727b81)'
                      : 'var(--bg-panel, #101216)',
                  color:
                    filter === status
                      ? 'var(--text-inverse, #ffffff)'
                      : 'var(--text-primary, #e0e0e0)',
                  borderColor: 'var(--border, rgba(196,196,196,0.12))',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
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
            Total Engines
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary, #e0e0e0)' }}
          >
            {engines.length}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border-success, #93b399)',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Running
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-success, #93b399)' }}
          >
            {engines.filter(e => e.status === 'running').length}
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
            Idle
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            {engines.filter(e => e.status === 'idle').length}
          </div>
        </div>

        <div
          className="p-4 rounded-lg border"
          style={{
            background: 'var(--bg-panel, #101216)',
            borderColor: 'var(--border-danger, #8b5f5f)',
          }}
        >
          <div
            className="text-sm mb-1"
            style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
          >
            Errors
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: 'var(--text-danger, #8b5f5f)' }}
          >
            {engines.filter(e => e.errorCount > 0).length}
          </div>
        </div>
      </div>

      {/* Engines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEngines.map(engine => (
          <EngineCard
            key={engine.id}
            engine={engine}
            onRestart={handleRestart}
            onInspect={handleInspect}
            onViewLogs={handleViewLogs}
          />
        ))}
      </div>

      {filteredEngines.length === 0 && (
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
            No engines match the selected filter
          </p>
        </div>
      )}
    </div>
  );
}
