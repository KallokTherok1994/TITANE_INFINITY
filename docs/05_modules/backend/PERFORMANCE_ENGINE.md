# ⚡ Performance Engine — Module Documentation

**Version:** v24.2.0  
**Module Path:** `src/services/performanceEngine/` (Frontend) + `src-tauri/src/singularity_fusion/performance.rs` (Backend)  
**Type:** Frontend (Primary) + Backend (Metrics)  
**Complexity:** ⭐⭐⭐⭐ (Advanced - Performance monitoring + auto-optimization)

---

## 📋 MODULE OVERVIEW

### Purpose

Performance Engine est le système de monitoring et d'optimisation des performances de TITANE∞. Il collecte des métriques multi-sources (System, React, IA, Rust), détecte les anomalies, génère des recommandations et s'intègre au Self-Healing Engine pour auto-correction.

### Responsibilities

**Frontend (TypeScript):**
- Orchestration 4 sub-engines (Collector, Analyzer, Advisor, Reporter)
- Real-time metrics collection (FPS, memory, latency, render time)
- Anomaly detection + trend analysis
- Recommendation generation (auto-optimization)
- Performance budgets enforcement
- Dashboard + reporting

**Backend (Rust):**
- System metrics collection (CPU, GPU, memory)
- Performance commands (throttle CPU, optimize GPU)
- Metrics storage + aggregation

### Key Features

- **4-Engine Architecture**: MetricsCollector → Analyzer → Advisor → Reporter
- **Multi-source Metrics**: System (CPU/GPU), React (FPS/render), IA (latency), Tauri (commands)
- **Real-time Monitoring**: 1s collection interval, 5s analysis cycle
- **Performance Grading**: A-F scoring based on thresholds
- **Auto-Optimization**: 15+ optimization strategies (caching, lazy loading, batching, etc.)
- **Budget Enforcement**: Configurable budgets (max latency, memory, CPU)
- **Self-Healing Integration**: Automatic issue → repair coordination
- **4 Performance Profiles**: Development, Production, Benchmark, Low-Power

---

## 🏗️ ARCHITECTURE

### 4-Engine Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE ENGINE ORCHESTRATOR                   │
│                    (index.ts - 624 lines)                           │
│                                                                     │
│  Lifecycle:                                                         │
│  • start() → startCollectionCycle() → executeCycle() (loop)        │
│  • executeCycle() → collect → analyze → advise → report            │
│  • stop() → cleanup timers                                         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    1. METRICS COLLECTOR                             │
│              (metricsCollector.ts - ~800 lines)                     │
│                                                                     │
│  Sources:                                                           │
│  ├─> System: CPU, GPU, Memory, Network (via backend)               │
│  ├─> React: FPS, render time, component count                      │
│  ├─> IA: AI latency, provider status, token throughput             │
│  └─> Tauri: Command latency, IPC overhead                          │
│                                                                     │
│  Output: MetricsSnapshot                                           │
│  ├─> timestamp, snapshotId                                         │
│  ├─> system: { cpu, gpu, memory, network }                         │
│  ├─> react: { fps, renderTime, componentCount }                    │
│  ├─> ai: { latency, provider, tokenThroughput }                    │
│  └─> tauri: { commandLatency, ipcOverhead }                        │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    2. PERFORMANCE ANALYZER                          │
│              (analyzerEngine.ts - ~600 lines)                       │
│                                                                     │
│  Analysis:                                                          │
│  ├─> Threshold Comparison (vs profile thresholds)                  │
│  ├─> Anomaly Detection (outliers, spikes)                          │
│  ├─> Trend Analysis (improving, degrading, stable)                 │
│  ├─> Issue Classification (severity: critical/warning/info)        │
│  └─> Health Score Computation (0.0-1.0)                            │
│                                                                     │
│  Output: AnalysisResult                                            │
│  ├─> issues: PerformanceIssue[] (detected problems)                │
│  ├─> trends: TrendAnalysis[] (performance trends)                  │
│  ├─> healthScore: number (0.0-1.0)                                 │
│  ├─> grade: PerformanceGrade (A/B/C/D/F)                           │
│  └─> summary: string (human-readable)                              │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    3. PERFORMANCE ADVISOR                           │
│              (advisorEngine.ts - ~500 lines)                        │
│                                                                     │
│  Recommendation Generation:                                        │
│  ├─> Issue → Recommendation mapping                                │
│  ├─> Priority ranking (severity-based)                             │
│  ├─> Impact estimation (performance gain)                          │
│  ├─> Auto-apply eligible actions (if enabled)                      │
│  └─> Actionable steps (implementation guide)                       │
│                                                                     │
│  15+ Optimization Types:                                           │
│  • caching, lazy_loading, batching, compression                    │
│  • parallelization, resource_cleanup, code_splitting               │
│  • debouncing, memoization, virtualization, etc.                   │
│                                                                     │
│  Output: AdvisorResult                                             │
│  ├─> recommendations: Recommendation[] (actionable fixes)          │
│  ├─> autoApplied: string[] (already applied IDs)                   │
│  ├─> priorityOrder: string[] (execution order)                     │
│  └─> estimatedImpact: number (aggregate gain)                      │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    4. PERFORMANCE REPORTER                          │
│                (reporter.ts - ~400 lines)                           │
│                                                                     │
│  Reporting:                                                         │
│  ├─> Console Logging (configurable levels)                         │
│  ├─> Dashboard Data Generation (UI integration)                    │
│  ├─> Self-Healing Integration (issue → repair)                     │
│  ├─> Historical Tracking (cycle results storage)                   │
│  └─> Export Reports (JSON/CSV)                                     │
│                                                                     │
│  Self-Healing Handoff:                                             │
│  • Critical issues → SelfHealingEngine                             │
│  • Auto-repair coordination (if enabled)                           │
│  • Feedback loop (repair success tracking)                         │
│                                                                     │
│  Output: PerformanceReport                                         │
│  ├─> cycleResult: PerformanceCycleResult                          │
│  ├─> dashboard: DashboardData (UI state)                           │
│  ├─> selfHealingActions: Action[] (repairs triggered)              │
│  └─> exportData: ExportFormat (JSON/CSV)                           │
└─────────────────────────────────────────────────────────────────────┘

MONITORING CYCLE (5s interval):

1. Collect Metrics (1s) ────────────> MetricsSnapshot
2. Analyze Performance (500ms) ────> AnalysisResult
3. Generate Recommendations (200ms) → AdvisorResult
4. Report + Self-Heal (300ms) ─────> Actions Executed
5. Sleep (3s) ──────────────────────> Next Cycle
```

### Performance Grading Algorithm

```
Health Score Calculation:

healthScore = weightedAverage([
  systemScore  * 0.30,  // CPU/GPU/Memory health
  reactScore   * 0.25,  // FPS/render performance
  aiScore      * 0.25,  // AI latency/throughput
  tauriScore   * 0.20,  // IPC overhead
])

Grade Mapping:
• A: healthScore >= 0.90 (Excellent)
• B: healthScore >= 0.75 (Good)
• C: healthScore >= 0.60 (Acceptable)
• D: healthScore >= 0.40 (Needs Improvement)
• F: healthScore <  0.40 (Critical)

Example:
System: 85% (CPU: 45%, GPU: 30%, Mem: 512MB/2GB) → 0.85
React:  90% (FPS: 58, Render: 12ms) → 0.90
AI:     70% (Latency: 1200ms) → 0.70
Tauri:  95% (IPC: 5ms) → 0.95

Health = 0.85*0.30 + 0.90*0.25 + 0.70*0.25 + 0.95*0.20
       = 0.255 + 0.225 + 0.175 + 0.190
       = 0.845 → Grade B (Good)
```

---

## 🔧 API REFERENCE

### PerformanceEngine (Orchestrator)

**Constructor:**
```typescript
constructor(config?: Partial<PerformanceEngineConfig>)

interface PerformanceEngineConfig {
  profile: PerformanceProfile;        // 'development' | 'production' | 'benchmark' | 'lowpower'
  
  collector: {
    enabled: boolean;
    interval: number;                 // Collection interval (ms, default 1000)
    sources: string[];                // ['system', 'react', 'ai', 'tauri']
    historySize: number;              // Max snapshots to keep (default 100)
  };
  
  analyzer: {
    enabled: boolean;
    thresholds: ThresholdConfig;      // Profile-specific thresholds
    anomalyDetection: boolean;
    trendAnalysis: boolean;
  };
  
  advisor: {
    enabled: boolean;
    maxRecommendations: number;       // Max recommendations per cycle (default 10)
    autoApply: boolean;               // Auto-apply eligible optimizations
    autoApplySeverity: SeverityLevel; // Min severity for auto-apply ('warning' | 'critical')
  };
  
  reporter: {
    enabled: boolean;
    logLevel: 'none' | 'error' | 'warning' | 'info' | 'debug';
    dashboardEnabled: boolean;
    selfHealingIntegration: SelfHealingIntegration;
  };
  
  budgets: PerformanceBudget[];       // Custom budgets
}
```

**Lifecycle Methods:**

```typescript
// Start performance monitoring
start(): void

// Stop monitoring
stop(): void

// Manual cycle execution (on-demand)
executeCycle(): Promise<PerformanceCycleResult>

// Get current state
getState(): PerformanceEngineState

// Get latest snapshot
getLatestSnapshot(): MetricsSnapshot | null

// Get health score
getHealthScore(): number

// Get grade
getGrade(): PerformanceGrade
```

**Event System:**

```typescript
// Subscribe to events
on(event: PerformanceEvent['type'], listener: PerformanceEventListener): void

// Unsubscribe
off(event: PerformanceEvent['type'], listener: PerformanceEventListener): void

// Event types:
// • 'cycle:start', 'cycle:complete'
// • 'metrics:collected'
// • 'issue:detected', 'issue:resolved'
// • 'recommendation:generated', 'recommendation:applied'
// • 'grade:changed'
// • 'self-healing:triggered'
```

### MetricsCollector

**Methods:**

```typescript
// Collect all metrics sources
collectAll(): Promise<MetricsSnapshot>

// Collect specific source
collectSystem(): Promise<SystemMetrics>
collectReact(): Promise<ReactMetrics>
collectAI(): Promise<AIMetrics>
collectTauri(): Promise<TauriMetrics>

// Get history
getHistory(limit?: number): MetricsSnapshot[]

// Clear history
clearHistory(): void
```

**Data Structures:**

```typescript
interface MetricsSnapshot {
  timestamp: number;
  snapshotId: string;
  
  system: {
    cpu: number;              // CPU usage % (0-100)
    gpu: number;              // GPU usage % (0-100)
    memory: number;           // Memory usage MB
    memoryAvailable: number;  // Available memory MB
    network: number;          // Network latency ms
  };
  
  react: {
    fps: number;              // Current FPS (0-60+)
    renderTime: number;       // Avg render time ms
    componentCount: number;   // Active components
    rerenderCount: number;    // Rerender events/s
  };
  
  ai: {
    latency: number;          // AI response latency ms
    provider: string;         // Active provider ('ollama' | 'gemini' | 'unifiedIA')
    tokenThroughput: number;  // Tokens/second
    cacheHitRate: number;     // Cache hit % (0-100)
  };
  
  tauri: {
    commandLatency: number;   // Avg Tauri command latency ms
    ipcOverhead: number;      // IPC overhead ms
    invokeCount: number;      // Invokes/second
  };
}
```

### PerformanceAnalyzer

**Methods:**

```typescript
// Analyze snapshot
analyze(snapshot: MetricsSnapshot): AnalysisResult

// Detect anomalies
detectAnomalies(snapshot: MetricsSnapshot): PerformanceIssue[]

// Analyze trends
analyzeTrends(history: MetricsSnapshot[]): TrendAnalysis[]

// Compute health score
computeHealthScore(snapshot: MetricsSnapshot): number

// Compute grade
computeGrade(healthScore: number): PerformanceGrade
```

**Data Structures:**

```typescript
interface AnalysisResult {
  issues: PerformanceIssue[];
  trends: TrendAnalysis[];
  healthScore: number;
  grade: PerformanceGrade;
  summary: string;
}

interface PerformanceIssue {
  id: string;
  type: string;                 // 'high_cpu' | 'low_fps' | 'slow_ai' | etc.
  severity: SeverityLevel;      // 'info' | 'warning' | 'critical'
  module: TitaneModule;         // Affected module
  metric: string;               // Metric name
  currentValue: number;
  threshold: number;
  description: string;
  detectedAt: number;
}

interface TrendAnalysis {
  metric: string;
  direction: TrendDirection;    // 'improving' | 'degrading' | 'stable'
  change: number;               // % change
  confidence: number;           // 0.0-1.0
}

type PerformanceGrade = 'A' | 'B' | 'C' | 'D' | 'F';
type SeverityLevel = 'info' | 'warning' | 'critical';
```

### PerformanceAdvisor

**Methods:**

```typescript
// Generate recommendations
generateRecommendations(analysis: AnalysisResult): AdvisorResult

// Auto-apply eligible recommendations
autoApply(recommendations: Recommendation[]): string[]

// Estimate impact
estimateImpact(recommendation: Recommendation): number
```

**Data Structures:**

```typescript
interface AdvisorResult {
  recommendations: Recommendation[];
  autoApplied: string[];
  priorityOrder: string[];
  estimatedImpact: number;
}

interface Recommendation {
  id: string;
  type: OptimizationType;
  title: string;
  description: string;
  severity: SeverityLevel;
  estimatedImpact: number;      // Performance gain % (0-100)
  autoApplicable: boolean;
  steps: string[];              // Implementation steps
  affectedModules: TitaneModule[];
}

type OptimizationType =
  | 'caching'
  | 'lazy_loading'
  | 'batching'
  | 'compression'
  | 'parallelization'
  | 'resource_cleanup'
  | 'code_splitting'
  | 'debouncing'
  | 'memoization'
  | 'virtualization'
  | 'web_worker'
  | 'service_worker'
  | 'preloading'
  | 'prefetching'
  | 'tree_shaking';
```

---

## 📊 PERFORMANCE PROFILES

### Development Profile

**Thresholds:**
```typescript
{
  cpu: { warning: 70, critical: 85 },
  memory: { warning: 1024, critical: 1536 },  // MB
  fps: { warning: 50, critical: 40 },
  renderTime: { warning: 20, critical: 30 },  // ms
  aiLatency: { warning: 2000, critical: 5000 }, // ms
  tauriLatency: { warning: 15, critical: 30 }, // ms
}
```

**Use Case:** Development environment, verbose logging, relaxed constraints

### Production Profile

**Thresholds:**
```typescript
{
  cpu: { warning: 60, critical: 80 },
  memory: { warning: 768, critical: 1024 },
  fps: { warning: 55, critical: 45 },
  renderTime: { warning: 16, critical: 25 },
  aiLatency: { warning: 1500, critical: 3000 },
  tauriLatency: { warning: 10, critical: 20 },
}
```

**Use Case:** Production deployment, optimal user experience, strict performance

### Benchmark Profile

**Thresholds:**
```typescript
{
  cpu: { warning: 50, critical: 70 },
  memory: { warning: 512, critical: 768 },
  fps: { warning: 58, critical: 50 },
  renderTime: { warning: 12, critical: 18 },
  aiLatency: { warning: 1000, critical: 2000 },
  tauriLatency: { warning: 8, critical: 15 },
}
```

**Use Case:** Performance testing, competitive benchmarking, max optimization

### Low-Power Profile

**Thresholds:**
```typescript
{
  cpu: { warning: 40, critical: 60 },
  memory: { warning: 384, critical: 512 },
  fps: { warning: 30, critical: 24 },
  renderTime: { warning: 33, critical: 50 },
  aiLatency: { warning: 3000, critical: 6000 },
  tauriLatency: { warning: 20, critical: 40 },
}
```

**Use Case:** Battery-constrained devices, reduce CPU/GPU usage, extend battery life

---

## 🧪 TESTING

### Unit Tests

```typescript
describe('PerformanceEngine', () => {
  let engine: PerformanceEngine;

  beforeEach(() => {
    engine = new PerformanceEngine({
      profile: 'development',
      collector: { interval: 1000 },
    });
  });

  test('should start and collect metrics', async () => {
    engine.start();
    await sleep(2000);
    
    const snapshot = engine.getLatestSnapshot();
    expect(snapshot).toBeDefined();
    expect(snapshot!.system.cpu).toBeGreaterThanOrEqual(0);
    
    engine.stop();
  });

  test('should detect high CPU usage', async () => {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      snapshotId: 'test-1',
      system: { cpu: 90, gpu: 30, memory: 512, memoryAvailable: 1024, network: 50 },
      // ... other metrics
    };
    
    const analysis = engine['analyzer'].analyze(snapshot);
    const cpuIssue = analysis.issues.find(i => i.type === 'high_cpu');
    
    expect(cpuIssue).toBeDefined();
    expect(cpuIssue!.severity).toBe('critical');
  });

  test('should generate recommendations', async () => {
    const analysis = {
      issues: [{ type: 'slow_render', severity: 'warning', /* ... */ }],
      // ... other fields
    };
    
    const result = engine['advisor'].generateRecommendations(analysis);
    
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.recommendations[0].type).toBe('memoization');
  });
});
```

### Integration Tests

```typescript
describe('Performance Engine + Self-Healing Integration', () => {
  test('should trigger self-healing on critical issues', async () => {
    const engine = new PerformanceEngine({
      profile: 'production',
      reporter: {
        selfHealingIntegration: {
          enabled: true,
          minSeverity: 'critical',
        },
      },
    });
    
    engine.start();
    
    // Simulate critical issue
    const criticalSnapshot = createCriticalSnapshot();
    await engine.executeCycle();
    
    // Verify self-healing triggered
    const report = engine.getLastReport();
    expect(report.selfHealingActions.length).toBeGreaterThan(0);
    
    engine.stop();
  });
});
```

---

## ⚡ PERFORMANCE

### Overhead Benchmarks

**Collection Overhead:**
- System metrics: ~5-10ms (backend Tauri call)
- React metrics: ~2-5ms (performance.now(), React DevTools)
- AI metrics: ~1-3ms (cache lookup, provider status)
- Tauri metrics: ~1-2ms (internal tracking)
- **Total collection**: ~10-20ms/cycle

**Analysis Overhead:**
- Threshold comparison: ~1-2ms
- Anomaly detection: ~2-5ms (outlier detection)
- Trend analysis: ~3-8ms (moving averages, regression)
- Health score: ~1-2ms (weighted average)
- **Total analysis**: ~7-17ms/cycle

**Advisor Overhead:**
- Recommendation generation: ~5-10ms (template matching)
- Priority ranking: ~1-2ms (sort)
- Impact estimation: ~2-5ms (heuristic calculation)
- **Total advisor**: ~8-17ms/cycle

**Reporter Overhead:**
- Console logging: ~1-3ms
- Dashboard update: ~2-5ms
- Self-healing handoff: ~3-8ms
- **Total reporter**: ~6-16ms/cycle

**Total Cycle Overhead:** ~31-70ms (avg ~50ms)

**Impact on Application:** <1% overhead (50ms/5000ms = 1%)

### Memory Usage

**Per Snapshot:** ~2KB (JSON serialization)

**History Storage:**
- 100 snapshots: ~200KB
- 1000 snapshots: ~2MB

**Engine Memory:** ~5-10MB total (orchestrator + 4 sub-engines + history)

---

## 🔗 INTEGRATIONS

### Self-Healing Engine

**Integration Point:** Critical issue → auto-repair

```typescript
// Performance Engine detects critical issue
const issue: PerformanceIssue = {
  type: 'high_cpu',
  severity: 'critical',
  currentValue: 95,
  threshold: 80,
  // ...
};

// Reporter triggers self-healing
if (config.reporter.selfHealingIntegration.enabled) {
  await selfHealingEngine.heal({
    type: 'performance_degradation',
    details: issue,
    suggestedActions: ['reduce_cpu_load', 'throttle_rendering'],
  });
}
```

### System Health Engine

**Integration Point:** Shared health scoring

```typescript
// Performance Engine feeds health data to System Health
const performanceHealth = performanceEngine.getHealthScore();

systemHealth.updateModuleHealth('performance_engine', {
  score: performanceHealth,
  grade: performanceEngine.getGrade(),
  issues: performanceEngine.getState().activeIssues,
});
```

### React DevTools

**Integration Point:** React profiling data

```typescript
// Collect React metrics via DevTools Profiler API
const reactMetrics = {
  fps: calculateFPS(),
  renderTime: getAverageRenderTime(),
  componentCount: getActiveComponentCount(),
  rerenderCount: getRerenderRate(),
};
```

---

## 📚 CODE EXAMPLES

### Example 1: Basic Usage

```typescript
import { PerformanceEngine } from '@/services/performanceEngine';

// Initialize engine
const engine = new PerformanceEngine({
  profile: 'production',
  collector: {
    enabled: true,
    interval: 1000,
    sources: ['system', 'react', 'ai', 'tauri'],
  },
  advisor: {
    autoApply: true,
    autoApplySeverity: 'critical',
  },
});

// Subscribe to events
engine.on('issue:detected', (event) => {
  console.warn('Performance issue detected:', event.data);
});

engine.on('grade:changed', (event) => {
  console.log('Performance grade changed to:', event.data.grade);
});

// Start monitoring
engine.start();

// Get current state
setInterval(() => {
  const state = engine.getState();
  console.log(`Health: ${state.healthScore.toFixed(2)} | Grade: ${state.grade}`);
}, 10000);
```

### Example 2: Custom Budgets

```typescript
const engine = new PerformanceEngine({
  profile: 'custom',
  budgets: [
    {
      name: 'AI Response Budget',
      metric: 'ai.latency',
      maxValue: 1500,
      unit: 'ms',
      severity: 'warning',
    },
    {
      name: 'Memory Budget',
      metric: 'system.memory',
      maxValue: 512,
      unit: 'MB',
      severity: 'critical',
    },
    {
      name: 'FPS Budget',
      metric: 'react.fps',
      minValue: 55,
      unit: 'fps',
      severity: 'warning',
    },
  ],
});
```

### Example 3: Manual Optimization

```typescript
// Execute cycle manually
const result = await engine.executeCycle();

// Review recommendations
console.log('Recommendations:');
result.advisor.recommendations.forEach(rec => {
  console.log(`- ${rec.title} (${rec.type})`);
  console.log(`  Impact: ${rec.estimatedImpact}% improvement`);
  console.log(`  Steps:`, rec.steps);
});

// Apply specific recommendation
const cacheRec = result.advisor.recommendations.find(r => r.type === 'caching');
if (cacheRec && cacheRec.autoApplicable) {
  await engine['advisor'].autoApply([cacheRec]);
}
```

---

## 🎯 CROSS-REFERENCES

### Related Modules

- [SELF_HEALING_ENGINE.md](SELF_HEALING_ENGINE.md) — Auto-repair integration
- [SYSTEM_HEALTH_ENGINE.md](SYSTEM_HEALTH_ENGINE.md) — Global health coordination
- [ADAPTIVE_ENGINE.md](ADAPTIVE_ENGINE.md) — Learning-based optimization

### Related Documentation

- [ARCHITECTURE_CURRENT_v24.md](../../00_meta/ARCHITECTURE_CURRENT_v24.md) — System architecture
- [TAURI_COMMANDS_REFERENCE.md](../../02_architecture_reality/TAURI_COMMANDS_REFERENCE.md) — Backend metrics commands

---

**Documentation généré:** 15 décembre 2025  
**Version:** v1.0.0  
**Maintainer:** TITANE∞ Documentation Evolution Engine vΩ

---

_Performance Engine — Continuous optimization_ ⚡✨
