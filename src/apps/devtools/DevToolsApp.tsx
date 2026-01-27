/**
 * TITANE∞ v20.0 — DevToolsApp Component
 * Super Prompt #3: DevTools UI Advanced Suite
 * @license MIT
 */

import React from 'react';
import { Tabs } from '../../components/ui/tabs';
import { useAllDevToolsEvents } from './hooks';
import {
  Dashboard,
  Metrics,
  Logs,
  Engines,
  Memory,
  OmegaPipeline,
  Errors,
} from './sections';

export type DevToolsSection =
  | 'dashboard'
  | 'metrics'
  | 'logs'
  | 'engines'
  | 'memory'
  | 'pipeline'
  | 'errors';

export interface DevToolsAppProps {
  defaultSection?: DevToolsSection;
  className?: string;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'metrics', label: 'Metrics', icon: '📈' },
  { id: 'logs', label: 'Logs', icon: '📝' },
  { id: 'engines', label: 'Engines', icon: '⚙️' },
  { id: 'memory', label: 'Memory', icon: '🧠' },
  { id: 'pipeline', label: 'Pipeline', icon: '🔄' },
  { id: 'errors', label: 'Errors', icon: '⚠️' },
];

/**
 * DevToolsApp - Shell principal des DevTools TITANE∞
 *
 * Intègre toutes les sections de monitoring, diagnostics et contrôle
 * Active automatiquement tous les listeners Tauri events
 *
 * @example
 * ```tsx
 * <DevToolsApp defaultSection="dashboard" />
 * ```
 */
export function DevToolsApp({
  defaultSection = 'dashboard',
  className = '',
}: DevToolsAppProps) {
  // Activer tous les listeners Tauri events
  useAllDevToolsEvents();

  return (
    <div
      className={`h-full flex flex-col ${className}`}
      style={{
        background: 'var(--bg-base, #050607)',
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 border-b"
        style={{
          background: 'var(--bg-elevated, #0b0d0f)',
          borderColor: 'var(--border, rgba(196,196,196,0.12))',
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary, #e0e0e0)' }}
              >
                TITANE∞ DevTools
              </h1>
              <p
                className="text-xs"
                style={{ color: 'var(--text-muted, rgba(255,255,255,0.60))' }}
              >
                System Monitoring & Diagnostics Console
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--bg-success, #93b399)' }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: 'var(--text-success, #93b399)' }}
              >
                System Online
              </span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs tabs={tabs} defaultTab={defaultSection}>
            {(activeSection: string) => (
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  {activeSection === 'dashboard' && <Dashboard />}
                  {activeSection === 'metrics' && <Metrics />}
                  {activeSection === 'logs' && <Logs />}
                  {activeSection === 'engines' && <Engines />}
                  {activeSection === 'memory' && <Memory />}
                  {activeSection === 'pipeline' && <OmegaPipeline />}
                  {activeSection === 'errors' && <Errors />}
                </div>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default DevToolsApp;
