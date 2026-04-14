import React from 'react';
import MonitoringDashboard from '../services/monitoring/MonitoringDashboard';
import DiagnosticDashboard from '../services/diagnostic/DiagnosticDashboard';
import ExplainabilityDashboard from '../services/explainability/ExplainabilityDashboard';
import OrchestratorDashboard from '../services/orchestrator/OrchestratorDashboard';
import SecurityDashboard from '../services/security_active/SecurityDashboard';

/**
 * AgentDashboardsPanel — panneau universel pour tous les dashboards agents avancés
 * Injecté sur toutes les pages principales TITANE
 */
const AgentDashboardsPanel: React.FC = () => (
  <div
    data-testid="agent-dashboards-panel"
    style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 2000, maxWidth: 420 }}
  >
    <MonitoringDashboard />
    <DiagnosticDashboard />
    <ExplainabilityDashboard />
    <OrchestratorDashboard />
    <SecurityDashboard />
  </div>
);

export default AgentDashboardsPanel;
