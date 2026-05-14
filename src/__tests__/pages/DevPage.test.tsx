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
  useOneCoreMock,
  useSystemHealthMock,
} = vi.hoisted(() => ({
  qaGetStateMock: vi.fn(),
  qaGetSystemMetricsMock: vi.fn(),
  qaListTestSuitesMock: vi.fn(),
  qaListAlertsMock: vi.fn(),
  orchestrationGetUnifiedStateMock: vi.fn(),
  useOneCoreMock: vi.fn(),
  useSystemHealthMock: vi.fn(),
}));

vi.mock('@/features/one-core/useOneCore', () => ({
  useOneCore: () => useOneCoreMock(),
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
  useSystemHealth: () => useSystemHealthMock(),
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
    useSystemHealthMock.mockReset();
    useOneCoreMock.mockReset();

    useSystemHealthMock.mockReturnValue('Healthy');
    useOneCoreMock.mockReturnValue({
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
    });
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

  it('renders wrapped backend health payloads without React child crashes', async () => {
    useSystemHealthMock.mockReturnValue({
      status: 'Healthy',
      available: true,
      error: null,
      fallback: false,
      health: 'Healthy',
    });
    qaGetStateMock.mockResolvedValue({
      health_score: 98,
      active_alerts: 0,
    });
    qaGetSystemMetricsMock.mockResolvedValue({});
    qaListTestSuitesMock.mockResolvedValue([]);
    qaListAlertsMock.mockResolvedValue([]);

    renderDevPage();

    expect(await screen.findByTestId('page-dev')).toHaveAttribute(
      'data-dev-state',
      'ready'
    );
    expect(screen.getByText('Healthy')).toBeVisible();
  });

  it('keeps diagnostics and operations tabs renderable with partial runtime data', async () => {
    useOneCoreMock.mockReturnValue({
      state: {
        version: '1.0.0',
        codename: 'OMEGA',
        centers: undefined,
      },
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
    });
    qaGetStateMock.mockResolvedValue({
      active_monitors: 0,
      active_alerts: 0,
      hardening_level: 'standard',
    });
    qaGetSystemMetricsMock.mockResolvedValue({});
    qaListTestSuitesMock.mockResolvedValue([]);
    qaListAlertsMock.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/dev?tab=operations']}>
        <Routes>
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('page-dev')).toHaveAttribute(
      'data-dev-state',
      'ready'
    );
    expect(screen.getByText('Aucun centre disponible')).toBeVisible();
  });

  it('keeps the validation tab renderable when QA suites payload is not an array', async () => {
    qaGetStateMock.mockResolvedValue({
      health_score: 92,
      test_coverage: 88,
      active_monitors: 1,
      hardening_level: 'standard',
    });
    qaGetSystemMetricsMock.mockResolvedValue({});
    qaListTestSuitesMock.mockResolvedValue({
      success: false,
      fallback: true,
      error: 'No Tauri transport available',
    });
    qaListAlertsMock.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/dev?tab=validation']}>
        <Routes>
          <Route path="/dev" element={<DevPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByTestId('page-dev')).toHaveAttribute(
      'data-dev-state',
      'ready'
    );
    expect(screen.getByTestId('tab-dev-validation')).toBeVisible();
    expect(screen.queryByText(/Erreur dans DevPage/i)).not.toBeInTheDocument();
  });
});
