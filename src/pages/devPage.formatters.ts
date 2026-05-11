export const formatDevHealthScore = (value: number | null): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'N/A';
  }
  return `${value.toFixed(1)}%`;
};

type DevOrchestrationShape = {
  multiAi?: {
    bestProvider?: string | null;
  } | null;
} | null;

export const formatDevBestProvider = (orchestration: DevOrchestrationShape): string => {
  const value = orchestration?.multiAi?.bestProvider;
  return typeof value === 'string' && value.trim().length > 0 ? value : 'N/A';
};
