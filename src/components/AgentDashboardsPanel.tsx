import React, { useEffect, useMemo, useState } from 'react';
import MonitoringDashboard from '../services/monitoring/MonitoringDashboard';
import DiagnosticDashboard from '../services/diagnostic/DiagnosticDashboard';
import { ExplainabilityDashboard } from '../services/explainability/ExplainabilityDashboard';
import OrchestratorDashboard from '../services/orchestrator/OrchestratorDashboard';
import SecurityDashboard from '../services/security_active/SecurityDashboard';
import './AgentDashboardsPanel.css';

type AgentDashboardsPanelMode = 'default' | 'compact';

const COMPACT_PANEL_VIEWPORT_HEIGHT = 760;
const AGENT_DASHBOARDS_SEEN_VERSION_KEY = 'titane.agentDashboardsPanel.lastSeenVersion';

function getRuntimeAppVersion(): string {
  const versionCandidate = (globalThis as Record<string, unknown>).__APP_VERSION__;
  if (typeof versionCandidate === 'string' && versionCandidate.trim().length > 0) {
    return versionCandidate;
  }

  return 'dev';
}

function getAgentDashboardsPanelSeenVersion(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(AGENT_DASHBOARDS_SEEN_VERSION_KEY);
  } catch {
    return null;
  }
}

function setAgentDashboardsPanelSeenVersion(version: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(AGENT_DASHBOARDS_SEEN_VERSION_KEY, version);
  } catch {
    // Ignore storage denial and keep the visual affordance visible.
  }
}

export function resolveAgentDashboardsPanelMode(params: {
  pathname?: string;
  search?: string;
  hash?: string;
  hasFullscreenConversation: boolean;
  viewportHeight: number;
}): AgentDashboardsPanelMode {
  const {
    pathname = '',
    search = '',
    hash = '',
    hasFullscreenConversation,
    viewportHeight,
  } = params;

  if (hasFullscreenConversation) {
    return 'compact';
  }

  const normalizedPathname = pathname.toLowerCase();
  const normalizedHash = hash.toLowerCase();
  const routeLooksLikeConversation =
    normalizedPathname === '/chat' ||
    normalizedPathname.endsWith('/chat') ||
    normalizedHash.includes('/chat');

  const searchParams = new URLSearchParams(search);
  const hashQueryIndex = hash.indexOf('?');
  const hashSearchParams =
    hashQueryIndex >= 0 ? new URLSearchParams(hash.slice(hashQueryIndex + 1)) : null;
  const requestedTab = searchParams.get('tab') ?? hashSearchParams?.get('tab');

  if (routeLooksLikeConversation || requestedTab === 'conversation') {
    return 'compact';
  }

  if (viewportHeight > 0 && viewportHeight <= COMPACT_PANEL_VIEWPORT_HEIGHT) {
    return 'compact';
  }

  return 'default';
}

function getAgentDashboardsPanelRuntimeState(): {
  mode: AgentDashboardsPanelMode;
  hasFullscreenConversation: boolean;
} {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { mode: 'default', hasFullscreenConversation: false };
  }

  const hasFullscreenConversation = Boolean(
    document.querySelector('[data-testid="page-conversation"][data-layout="fullscreen"]')
  );

  return {
    mode: resolveAgentDashboardsPanelMode({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      hasFullscreenConversation,
      viewportHeight: window.innerHeight,
    }),
    hasFullscreenConversation,
  };
}

/**
 * AgentDashboardsPanel — panneau universel pour tous les dashboards agents avancés
 * Injecté sur toutes les pages principales TITANE
 */
const AgentDashboardsPanel: React.FC = () => {
  const [runtimeState, setRuntimeState] = useState(() =>
    getAgentDashboardsPanelRuntimeState()
  );
  const [isExpanded, setIsExpanded] = useState(runtimeState.mode === 'default');
  const [hasSeenCurrentVersion, setHasSeenCurrentVersion] = useState(() => {
    return getAgentDashboardsPanelSeenVersion() === getRuntimeAppVersion();
  });

  useEffect(() => {
    const syncRuntimeState = () => {
      const nextState = getAgentDashboardsPanelRuntimeState();
      setRuntimeState(prevState => {
        if (
          prevState.mode === nextState.mode &&
          prevState.hasFullscreenConversation === nextState.hasFullscreenConversation
        ) {
          return prevState;
        }

        return nextState;
      });
    };

    syncRuntimeState();

    const mutationObserver =
      typeof MutationObserver === 'function'
        ? new MutationObserver(() => {
            syncRuntimeState();
          })
        : null;

    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-layout', 'data-testid'],
    });

    window.addEventListener('resize', syncRuntimeState);
    window.addEventListener('hashchange', syncRuntimeState);
    window.addEventListener('popstate', syncRuntimeState);

    return () => {
      mutationObserver?.disconnect();
      window.removeEventListener('resize', syncRuntimeState);
      window.removeEventListener('hashchange', syncRuntimeState);
      window.removeEventListener('popstate', syncRuntimeState);
    };
  }, []);

  useEffect(() => {
    setIsExpanded(runtimeState.mode === 'default');
  }, [runtimeState.mode]);

  useEffect(() => {
    setHasSeenCurrentVersion(
      getAgentDashboardsPanelSeenVersion() === getRuntimeAppVersion()
    );
  }, []);

  const showWhatsNewBadge = !hasSeenCurrentVersion;

  const acknowledgeCurrentVersion = () => {
    setAgentDashboardsPanelSeenVersion(getRuntimeAppVersion());
    setHasSeenCurrentVersion(true);
  };

  const panelLabel = useMemo(() => {
    return isExpanded
      ? 'Masquer les dashboards agents'
      : 'Afficher les dashboards agents';
  }, [isExpanded]);

  return (
    <aside
      data-testid="agent-dashboards-panel"
      data-mode={runtimeState.mode}
      data-expanded={isExpanded ? 'true' : 'false'}
      data-conversation-safe={runtimeState.hasFullscreenConversation ? 'true' : 'false'}
      className={[
        'agent-dashboards-panel',
        runtimeState.mode === 'compact' ? 'agent-dashboards-panel--compact' : '',
        isExpanded
          ? 'agent-dashboards-panel--expanded'
          : 'agent-dashboards-panel--collapsed',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        data-testid="agent-dashboards-panel-toggle"
        data-has-update={showWhatsNewBadge ? 'true' : 'false'}
        className="agent-dashboards-panel__toggle"
        aria-expanded={isExpanded}
        aria-label={panelLabel}
        title={panelLabel}
        onClick={() => {
          acknowledgeCurrentVersion();
          setIsExpanded(prev => !prev);
        }}
      >
        <span className="agent-dashboards-panel__toggle-title-row">
          <span className="agent-dashboards-panel__toggle-title">Agents</span>
          {showWhatsNewBadge && (
            <span
              data-testid="agent-dashboards-panel-whats-new-badge"
              className="agent-dashboards-panel__toggle-badge"
            >
              Nouveau
            </span>
          )}
        </span>
        <span className="agent-dashboards-panel__toggle-meta">5 dashboards</span>
        {showWhatsNewBadge && (
          <span
            data-testid="agent-dashboards-panel-whats-new-text"
            className="agent-dashboards-panel__toggle-update"
          >
            Dashboards mis a jour en v{getRuntimeAppVersion()}
          </span>
        )}
      </button>

      <div
        data-testid="agent-dashboards-panel-content"
        className="agent-dashboards-panel__content"
        hidden={!isExpanded}
      >
        <MonitoringDashboard />
        <DiagnosticDashboard />
        <ExplainabilityDashboard />
        <OrchestratorDashboard />
        <SecurityDashboard />
      </div>
    </aside>
  );
};

export default AgentDashboardsPanel;
