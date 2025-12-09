/**
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║   TITANE∞ v20.0 — DevTools Entry Point                            ║
 * ║   SUPER PROMPT #5: Console Cognitive & Diagnostic Suite           ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { DevToolsLayout } from './DevToolsLayout';

export const DevToolsApp: React.FC = () => {
  return <DevToolsLayout />;
};

export default DevToolsApp;

// Export all panels for standalone use
export { PipelineDebugger } from './panels/PipelineDebugger';
export { MetricsPanel } from './panels/MetricsPanel';
export { LogsPanel } from './panels/LogsPanel';
export { ConsolePanel } from './panels/ConsolePanel';
export {
  MemoryInspector,
  EngineInspector,
  SelfHealingPanel,
  EventTimeline,
  VoiceMonitor,
  SystemHealthPanel,
} from './panels';

// Export hooks
export { usePipelineEvents } from './hooks/usePipelineEvents';
export { useMetrics } from './hooks/useMetrics';
export { useLogs } from './hooks/useLogs';
export { useMemory } from './hooks/useMemory';
export { useEngines } from './hooks/useEngines';
export { useSelfHealing } from './hooks/useSelfHealing';
export { useConsole } from './hooks/useConsole';

// Export types
export type * from './types';
