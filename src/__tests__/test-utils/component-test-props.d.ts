/**
 * TITANE∞ v26.4.0 — Test Utilities: Extended Component Props
 * 
 * Ce fichier étend les props des composants pour permettre aux tests
 * de passer des données mockées directement via props, même si le composant
 * réel ne les accepte pas (car il fetch les données lui-même).
 * 
 * Cette approche est standard dans les tests React pour permettre
 * un contrôle précis des données sans avoir à mocker les appels API.
 */

import '@testing-library/react';
import type { CoreHealth, SystemEvent, LogEntry, MemoryNode, Engine } from '@/types';

declare module '@/components/devtools/CoreHealthMonitor' {
  interface CoreHealthMonitorProps {
    health?: CoreHealth;
    showAlerts?: boolean;
    history?: CoreHealth[];
    showChart?: boolean;
  }
}

declare module '@/components/devtools/LogFilters' {
  interface LogFiltersProps {
    onChange?: (filters: any) => void;
    categories?: string[];
    showDateRange?: boolean;
  }
}

declare module '@/components/devtools/LogViewer' {
  interface LogViewerProps {
    logs?: LogEntry[];
    onClear?: () => void;
    onExport?: () => void;
  }
}

declare module '@/components/devtools/EventStream' {
  interface EventStreamProps {
    events?: SystemEvent[];
    showTimestamps?: boolean;
    autoScroll?: boolean;
    onClear?: () => void;
  }
}

declare module '@/components/devtools/LogLine' {
  interface LogLineProps {
    log: LogEntry;
    showTimestamp?: boolean;
    showCategory?: boolean;
    showIcon?: boolean | string;
    showMetadata?: boolean;
    maxLength?: number;
  }
}

declare module '@/components/devtools/EngineCard' {
  interface EngineCardProps {
    engine: Engine;
    showMetrics?: boolean;
    onStop?: () => void;
    onRestart?: () => void;
    expandable?: boolean;
  }
}

declare module '@/components/devtools/MemoryTree' {
  interface MemoryTreeProps {
    tree?: MemoryNode;
  }
}
