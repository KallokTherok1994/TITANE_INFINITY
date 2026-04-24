import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AgentDashboardsPanel, {
  resolveAgentDashboardsPanelMode,
} from '../AgentDashboardsPanel';

function setSeenVersion(version: string | null) {
  if (version === null) {
    window.localStorage.removeItem('titane.agentDashboardsPanel.lastSeenVersion');
    return;
  }

  window.localStorage.setItem('titane.agentDashboardsPanel.lastSeenVersion', version);
}

function setWindowLocation(url: string) {
  window.history.replaceState({}, 'test', url);
}

function appendFullscreenConversationMarker() {
  const marker = document.createElement('div');
  marker.setAttribute('data-testid', 'page-conversation');
  marker.setAttribute('data-layout', 'fullscreen');
  document.body.appendChild(marker);
  return marker;
}

describe('AgentDashboardsPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('__APP_VERSION__', 'test');
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    window.localStorage.clear();
    setWindowLocation('/');
    vi.unstubAllGlobals();
  });

  it('classifies fullscreen conversation surfaces as compact-safe', () => {
    expect(
      resolveAgentDashboardsPanelMode({
        pathname: '/titane',
        search: '?tab=conversation',
        hash: '',
        hasFullscreenConversation: true,
        viewportHeight: 900,
      })
    ).toBe('compact');
  });

  it('stays expanded on standard application routes', async () => {
    setWindowLocation('/dev');

    render(<AgentDashboardsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('agent-dashboards-panel')).toHaveAttribute(
        'data-mode',
        'default'
      );
    });

    expect(screen.getByTestId('agent-dashboards-panel')).toHaveAttribute(
      'data-expanded',
      'true'
    );
    expect(screen.getByTestId('agent-dashboards-panel-content')).not.toHaveAttribute(
      'hidden'
    );
    expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
  });

  it('shows a versioned whats-new affordance until the panel is opened once', async () => {
    setWindowLocation('/dev');
    setSeenVersion('older-version');

    render(<AgentDashboardsPanel />);

    const toggle = screen.getByTestId('agent-dashboards-panel-toggle');

    await waitFor(() => {
      expect(toggle).toHaveAttribute('data-has-update', 'true');
    });

    expect(
      screen.getByTestId('agent-dashboards-panel-whats-new-badge')
    ).toHaveTextContent('Nouveau');
    expect(
      screen.getByTestId('agent-dashboards-panel-whats-new-text')
    ).toHaveTextContent('Dashboards mis a jour en vtest');

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(toggle).toHaveAttribute('data-has-update', 'false');
    });

    expect(
      screen.queryByTestId('agent-dashboards-panel-whats-new-badge')
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem('titane.agentDashboardsPanel.lastSeenVersion')).toBe(
      'test'
    );
  });

  it('keeps the whats-new affordance hidden when the current version was already acknowledged', async () => {
    setWindowLocation('/dev');
    setSeenVersion('test');

    render(<AgentDashboardsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('agent-dashboards-panel-toggle')).toHaveAttribute(
        'data-has-update',
        'false'
      );
    });

    expect(
      screen.queryByTestId('agent-dashboards-panel-whats-new-badge')
    ).not.toBeInTheDocument();
  });

  it('collapses into a safe dock on the fullscreen conversation surface', async () => {
    setWindowLocation('/titane?tab=conversation');
    const marker = appendFullscreenConversationMarker();

    render(<AgentDashboardsPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('agent-dashboards-panel')).toHaveAttribute(
        'data-mode',
        'compact'
      );
    });

    expect(screen.getByTestId('agent-dashboards-panel')).toHaveAttribute(
      'data-expanded',
      'false'
    );
    expect(screen.getByTestId('agent-dashboards-panel-content')).toHaveAttribute(
      'hidden'
    );

    fireEvent.click(screen.getByTestId('agent-dashboards-panel-toggle'));

    await waitFor(() => {
      expect(screen.getByTestId('agent-dashboards-panel')).toHaveAttribute(
        'data-expanded',
        'true'
      );
    });

    expect(screen.getByTestId('agent-dashboards-panel-content')).not.toHaveAttribute(
      'hidden'
    );

    marker.remove();
  });
});
