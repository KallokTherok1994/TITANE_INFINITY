import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AgentDashboardsPanel, {
  resolveAgentDashboardsPanelMode,
} from '../AgentDashboardsPanel';

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
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    setWindowLocation('/');
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
