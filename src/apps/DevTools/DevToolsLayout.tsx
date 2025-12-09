/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — DevTools Layout                                 ║
 * ║   SUPER PROMPT #5: Console Cognitive & Diagnostic Suite           ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import './DevToolsLayout.css';

// Panels
import { PipelineDebugger } from './panels/PipelineDebugger';
import { MetricsPanel } from './panels/MetricsPanel';
import { LogsPanel } from './panels/LogsPanel';
import { MemoryInspector } from './panels/MemoryInspector';
import { EngineInspector } from './panels/EngineInspector';
import { SelfHealingPanel } from './panels/SelfHealingPanel';
import { EventTimeline } from './panels/EventTimeline';
import { ConsolePanel } from './panels/ConsolePanel';
import { VoiceMonitor } from './panels/VoiceMonitor';
import { SystemHealthPanel } from './panels/SystemHealthPanel';

type PanelType =
  | 'pipeline'
  | 'metrics'
  | 'logs'
  | 'memory'
  | 'engines'
  | 'self-healing'
  | 'timeline'
  | 'console'
  | 'voice'
  | 'system-health';

interface PanelConfig {
  id: PanelType;
  name: string;
  icon: string;
  component: React.ComponentType;
}

const PANELS: PanelConfig[] = [
  { id: 'pipeline', name: 'OMEGA Pipeline', icon: '🔀', component: PipelineDebugger },
  { id: 'metrics', name: 'Metrics', icon: '📊', component: MetricsPanel },
  { id: 'logs', name: 'Logs', icon: '📝', component: LogsPanel },
  { id: 'memory', name: 'Memory', icon: '🧠', component: MemoryInspector },
  { id: 'engines', name: 'Engines', icon: '⚙️', component: EngineInspector },
  { id: 'self-healing', name: 'Self-Healing', icon: '🩹', component: SelfHealingPanel },
  { id: 'timeline', name: 'Timeline', icon: '⏱️', component: EventTimeline },
  { id: 'console', name: 'Console', icon: '💻', component: ConsolePanel },
  { id: 'voice', name: 'Voice', icon: '🎤', component: VoiceMonitor },
  { id: 'system-health', name: 'System Health', icon: '❤️', component: SystemHealthPanel },
];

export const DevToolsLayout: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('pipeline');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActivePanelComponent =
    PANELS.find((p) => p.id === activePanel)?.component || PipelineDebugger;

  return (
    <div className="devtools-layout">
      {/* Header */}
      <header className="devtools-header">
        <div className="devtools-title">
          <span className="devtools-logo">🔬</span>
          <h1>TITANE∞ DevTools</h1>
          <span className="devtools-version">v20.0</span>
        </div>
        <div className="devtools-actions">
          <button className="btn-icon" title="Recording">
            🔴
          </button>
          <button className="btn-icon" title="Clear">
            🗑️
          </button>
          <button className="btn-icon" title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      <div className="devtools-body">
        {/* Sidebar */}
        <aside className={`devtools-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '▶' : '◀'}
          </button>
          <nav className="sidebar-nav">
            {PANELS.map((panel) => (
              <button
                key={panel.id}
                className={`sidebar-item ${activePanel === panel.id ? 'active' : ''}`}
                onClick={() => setActivePanel(panel.id)}
                title={panel.name}
              >
                <span className="sidebar-icon">{panel.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-label">{panel.name}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Panel */}
        <main className="devtools-main">
          <div className="panel-container">
            <ActivePanelComponent />
          </div>
        </main>
      </div>
    </div>
  );
};
