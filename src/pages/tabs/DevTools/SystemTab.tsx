/**
 * TITANE∞ v25.7.5 — System Tab
 */

import {
  LazySystemStatusCard,
  LazyLivingEnginesCard,
  LazyCognitiveModuleCard,
} from '../../DevToolsLazy';
import type { SystemStatus } from '../../../components/monitoring/SystemStatusCard';

interface SystemTabProps {
  systemStatus: SystemStatus;
  livingEngines: any;
  moduleMetrics: Record<
    string,
    { value: number; label: string; status: 'stable' | 'active' | 'critical' }
  >;
  errorCount: number;
}

const SystemTab = ({
  systemStatus,
  livingEngines,
  moduleMetrics,
  errorCount,
}: SystemTabProps) => {
  return (
    <div className="devtools-tab-system">
      <div className="devtools-grid devtools-grid--system">
        <LazySystemStatusCard
          status={systemStatus}
          value={`${livingEngines.state.activeThreads || 0} threads`}
          subtitle={`${errorCount} errors detected`}
        />

        <LazyLivingEnginesCard state={livingEngines.state} />

        <div className="devtools-grid devtools-grid--modules">
          <LazyCognitiveModuleCard
            module="helios"
            value={moduleMetrics.helios.value}
            label={moduleMetrics.helios.label}
            status={moduleMetrics.helios.status}
            subtitle="Température optimale"
          />

          <LazyCognitiveModuleCard
            module="nexus"
            value={moduleMetrics.nexus.value}
            label={moduleMetrics.nexus.label}
            status={moduleMetrics.nexus.status}
            subtitle="Réseau stable"
          />

          <LazyCognitiveModuleCard
            module="harmonia"
            value={moduleMetrics.harmonia.value}
            label={moduleMetrics.harmonia.label}
            status={moduleMetrics.harmonia.status}
            subtitle="Parfait équilibre"
          />

          <LazyCognitiveModuleCard
            module="memory"
            value={moduleMetrics.memory.value}
            label={moduleMetrics.memory.label}
            status={moduleMetrics.memory.status}
            subtitle="Couches optimisées"
          />
        </div>
      </div>
    </div>
  );
};

export default SystemTab;
