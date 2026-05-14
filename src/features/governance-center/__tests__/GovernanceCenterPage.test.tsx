import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GovernanceCenterPage } from '@/features/governance-center/GovernanceCenterPage';

const useGovernanceMock = vi.fn();
const useIdentityMatrixMock = vi.fn();
const useSingularityStateSafeMock = vi.fn();

vi.mock('@/features/governance-center/hooks/useGovernance', () => ({
  useGovernance: () => useGovernanceMock(),
}));

vi.mock('@/hooks/useIdentityMatrix', () => ({
  useIdentityMatrix: () => useIdentityMatrixMock(),
}));

vi.mock('@/hooks/useSingularityStateSafe', () => ({
  useSingularityStateSafe: () => useSingularityStateSafeMock(),
}));

vi.mock('@/features/governance-center/tabs/SecretsTab', () => ({
  SecretsTab: () => <div data-testid="gov-secrets-tab" />,
}));
vi.mock('@/features/governance-center/tabs/PoliciesTab', () => ({
  PoliciesTab: () => <div data-testid="gov-policies-tab" />,
}));
vi.mock('@/features/governance-center/tabs/PermissionsTab', () => ({
  PermissionsTab: () => <div data-testid="gov-permissions-tab" />,
}));
vi.mock('@/features/governance-center/tabs/SecurityLogTab', () => ({
  SecurityLogTab: () => <div data-testid="gov-logs-tab" />,
}));

describe('GovernanceCenterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useIdentityMatrixMock.mockReturnValue({
      matrix: {},
      isLoaded: true,
      loading: false,
    });
    useSingularityStateSafeMock.mockReturnValue(null);
    useGovernanceMock.mockReturnValue({
      loading: false,
      error: null,
      activeTab: 'secrets',
      setActiveTab: vi.fn(),
      setError: vi.fn(),
      refreshAll: vi.fn(),
      loadPolicies: vi.fn(),
      loadPermissionMatrix: vi.fn(),
      loadPermissionAudit: vi.fn(),
      loadSecurityLog: vi.fn(),
      exportSecurityLog: vi.fn(),
      clearSecurityLog: vi.fn(),
      togglePolicy: vi.fn(),
      createPolicy: vi.fn(),
      deletePolicy: vi.fn(),
      clearPermissionAudit: vi.fn(),
      setGeminiKey: vi.fn(),
      setOpenAIKey: vi.fn(),
      setAnthropicKey: vi.fn(),
      setCopilotKey: vi.fn(),
      storeSecret: vi.fn(),
      deleteSecret: vi.fn(),
      geminiStatus: null,
      openaiStatus: null,
      anthropicStatus: null,
      copilotStatus: null,
      secretsStatus: null,
      policies: [],
      permissionMatrix: {},
      permissionAudit: [],
      securityLog: [],
      logFilters: {},
    });
  });

  it('renders the refresh action with sufficient contrast fallback color', () => {
    render(<GovernanceCenterPage />);

    expect(screen.getByTestId('page-governance-center')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actualiser toutes les données/i })).toHaveStyle({
      color: '#93b399',
    });
  });
});