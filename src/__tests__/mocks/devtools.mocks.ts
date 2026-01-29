/**
 * Mock Factories pour DevTools Components
 * Fournit des données réalistes pour tests
 */

export const mockCoreHealth = {
  name: 'TestCore',
  status: 'healthy' as const,
  uptime: 3600,
  metrics: {
    cpu_percent: 45.5,
    memory_mb: 512,
    operations_total: 1234,
  },
};

export const mockCoreHealthMap = new Map([
  ['Orchestrator', { ...mockCoreHealth, name: 'Orchestrator', status: 'healthy' as const }],
  ['StyleEngine', { ...mockCoreHealth, name: 'StyleEngine', status: 'healthy' as const }],
  ['CoherenceEngine', { ...mockCoreHealth, name: 'CoherenceEngine', status: 'degraded' as const }],
  ['ReflectionEngine', { ...mockCoreHealth, name: 'ReflectionEngine', status: 'healthy' as const }],
  ['EmotionEngine', { ...mockCoreHealth, name: 'EmotionEngine', status: 'healthy' as const }],
  ['UnifiedMemory', { ...mockCoreHealth, name: 'UnifiedMemory', status: 'healthy' as const }],
  ['BehaviorEngine', { ...mockCoreHealth, name: 'BehaviorEngine', status: 'healthy' as const }],
  ['AdaptationEngine', { ...mockCoreHealth, name: 'AdaptationEngine', status: 'healthy' as const }],
  ['SystemHealth', { ...mockCoreHealth, name: 'SystemHealth', status: 'healthy' as const }],
]);

export const mockMetricsData = {
  cpu: 45.5,
  memory: 1024,
  fps: 60,
  latency: 12.3,
  operations: 5678,
};

export const mockMetricsHistory = Array.from({ length: 10 }, (_, i) => ({
  timestamp: Date.now() - (9 - i) * 1000,
  cpu: 40 + Math.random() * 20,
  memory: 900 + Math.random() * 200,
  fps: 55 + Math.random() * 10,
}));

export const mockLogEntry = {
  id: '1',
  timestamp: Date.now(),
  level: 'info' as const,
  category: 'system',
  message: 'Test log message',
  metadata: {},
};

export const mockLogs = Array.from({ length: 5 }, (_, i) => ({
  ...mockLogEntry,
  id: String(i + 1),
  message: `Test log message ${i + 1}`,
  level: ['info', 'warn', 'error', 'debug'][i % 4] as 'info' | 'warn' | 'error' | 'debug',
}));

export const mockCoreInfo = {
  name: 'TestCore',
  version: '1.0.0',
  status: 'healthy',
  dependencies: [],
  metrics: [
    { name: 'cpu_usage', value: 45.5, unit: '%' },
    { name: 'memory_usage', value: 512, unit: 'MB' },
    { name: 'operations_total', value: 1234, unit: 'count' },
  ],
};

// Mock pour secureInvoke utilisé par CoreHealthMonitor
export const mockSecureInvoke = (command: string, _args?: Record<string, unknown>) => {
  switch (command) {
    case 'get_core_info':
      return Promise.resolve(mockCoreInfo);
    case 'get_system_metrics':
      return Promise.resolve(mockMetricsData);
    case 'get_logs':
      return Promise.resolve(mockLogs);
    default:
      return Promise.resolve({});
  }
};
