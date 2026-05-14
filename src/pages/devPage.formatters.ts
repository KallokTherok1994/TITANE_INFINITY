export const formatDevHealthScore = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
};

export const toDevFiniteNumber = (value: unknown, fallback: number = 0): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

type DevOrchestrationShape = {
  multiAi?: {
    bestProvider?: string | null;
  } | null;
} | null;

type DevBackendHealthShape =
  | string
  | {
      status?: string | null;
      health?: string | null;
      available?: boolean | null;
      fallback?: boolean | null;
      error?: string | null;
    }
  | null;

export const formatDevBestProvider = (orchestration: DevOrchestrationShape): string => {
  const value = orchestration?.multiAi?.bestProvider;
  return typeof value === 'string' && value.trim().length > 0 ? value : 'N/A';
};

export const formatDevBackendHealth = (value: DevBackendHealthShape): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return 'N/A';
  }

  if (typeof value.status === 'string' && value.status.trim().length > 0) {
    return value.status;
  }

  if (typeof value.health === 'string' && value.health.trim().length > 0) {
    return value.health;
  }

  if (value.available === false) {
    return 'Offline';
  }

  if (value.fallback) {
    return 'Fallback';
  }

  return 'N/A';
};

export const getDevHealthVariant = (
  value: DevBackendHealthShape
): 'success' | 'warning' | 'error' | 'info' => {
  const label = formatDevBackendHealth(value).toLowerCase();

  if (label === 'healthy') {
    return 'success';
  }

  if (label === 'warning' || label === 'fallback') {
    return 'warning';
  }

  if (label === 'critical' || label === 'offline') {
    return 'error';
  }

  return 'info';
};

export const getDevSurfaceTruthVariant = (
  value: DevBackendHealthShape
): 'LIVE' | 'PARTIAL' | 'DEGRADED' => {
  const label = formatDevBackendHealth(value).toLowerCase();

  if (label === 'healthy') {
    return 'LIVE';
  }

  if (label === 'warning' || label === 'fallback') {
    return 'PARTIAL';
  }

  return 'DEGRADED';
};
