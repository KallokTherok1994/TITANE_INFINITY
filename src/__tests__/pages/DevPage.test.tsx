import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DevPage } from '@/pages/DevPage';

const {
  qaGetStateMock,
  qaGetSystemMetricsMock,
  qaListTestSuitesMock,
  qaListAlertsMock,
  orchestrationGetUnifiedStateMock,
} = vi.hoisted(() => ({
  qaGetStateMock: vi.fn(),
  qaGetSystemMetricsMock: vi.fn(),
  qaListTestSuitesMock: vi.fn(),
  qaListAlertsMock: vi.fn(),
  orchestrationGetUnifiedStateMock: vi.fn(),
}));

vi.mock('@/features/one-core/useOneCore', () => ({
  useOneCore: () => ({
    state: null,
    metrics: null,
    diagnostic: null,
    commands: [],
    eventHistory: [],
    loading: false,
    error: null,
    refresh: vi.fn(),
    executeCommand: vi.fn(),
    runDiagnostic: vi.fn(),
    forceSync: vi.fn(),
    cleanup: vi.fn(),
    setMode: vi.fn(),
    verifyIntegrity: vi.fn(),
    getEngineStatus: vi.fn(),
  }),
}));

vi.mock('@/features/qa-monitoring/useQAMonitoring', () => ({
  useQAMonitoring: () => ({
    getState: qaGetStateMock,
    getSystemMetrics: qaGetSystemMetricsMock,
    listTestSuites: qaListTestSuitesMock,
    listAlerts: qaListAlertsMock,
    runTestSuite: vi.fn(),
    acknowledgeAlert: vi.fn(),
  }),
}));

vi.mock('@/services/systemHealthPoller', () => ({
  startSystemHealthPolling: () => ({
    stop: vi.fn(),
  }),
}));

vi.mock('@/stores/systemStore.selectors', () => ({
  useSystemHealth: () => 'Healthy',
}));

vi.mock('@/lib/tauriClient', () => ({
  tauriClient: {
    orchestrationGetUnifiedState: orchestrationGetUnifiedStateMock,
  },
}));

function renderDevPage() {
  return render(
    <MemoryRouter initialEntries={['/dev']}>
      <Routes>
        <Route path="/dev" element={<DevPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DevPage', () => {
  beforeEach(() => {
    qaGetStateMock.mockReset();
    qaGetSystemMetricsMock.mockReset();
    qaListTestSuitesMock.mockReset();
    qaListAlertsMock.mockReset();
    orchestrationGetUnifiedStateMock.mockReset();
  });

  it('keeps the page shell marker visible while data is loading', () => {
    const pending = new Promise(() => undefined);
    qaGetStateMock.mockReturnValue(pending);
    qaGetSystemMetricsMock.mockReturnValue(pending);
    qaListTestSuitesMock.mockReturnValue(pending);
    qaListAlertsMock.mockReturnValue(pending);

    renderDevPage();

    expect(screen.getByTestId('page-dev')).toHaveAttribute('data-dev-state', 'loading');
    expect(screen.getByText('Chargement DEV...')).toBeVisible();
  });

  it('keeps the page shell marker visible when the initial load fails', async () => {
    qaGetStateMock.mockRejectedValueOnce(new Error('Erreur de chargement DEV'));
    qaGetSystemMetricsMock.mockResolvedValue({});
    qaListTestSuitesMock.mockResolvedValue([]);
    qaListAlertsMock.mockResolvedValue([]);

    renderDevPage();

    expect(await screen.findByTestId('page-dev')).toHaveAttribute(
      'data-dev-state',
      'error'
    );
    expect(screen.getByTestId('page-dev')).toHaveTextContent('Erreur de chargement DEV');
  });
});
