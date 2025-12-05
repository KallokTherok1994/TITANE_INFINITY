# TITANE∞ v24.30 - API REFERENCE

## Table of Contents

1. [SingularityAutonomyEngine](#singularityautonomyengine)
2. [CognitiveOptimizationEngine](#cognitiveoptimizationengine)
3. [LongContextOptimizer](#longcontextoptimizer)
4. [SingularityFusionEngine](#singularityfusionengine)
5. [RealTimeExecutionEngine](#realtimeexecutionengine)
6. [DevModeEngine](#devmodeengine)

---

## SingularityAutonomyEngine

**Location**: `src/core/autonomy/SingularityAutonomyEngine.ts`

### Singleton Access

```typescript
import { AutonomyEngine } from '@/core/autonomy/SingularityAutonomyEngine';
```

### Methods

#### `start(): void`

Start autonomous maintenance cycle (30s interval).

```typescript
AutonomyEngine.start();
```

#### `stop(): void`

Stop autonomous maintenance cycle.

```typescript
AutonomyEngine.stop();
```

#### `async auto_scan(): Promise<ScanResult>`

Scan backend/frontend health.

**Returns**:
```typescript
{
  backend_health: number;    // 0-100
  frontend_health: number;   // 0-100
  issues_found: number;
  scan_duration_ms: number;
}
```

#### `async auto_detect(scanResult): Promise<DetectionResult>`

Detect anomalies from scan.

**Parameters**:
- `scanResult: ScanResult`

**Returns**:
```typescript
{
  anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
  }>;
  critical_count: number;
  warnings_count: number;
}
```

#### `async auto_fix(detectionResult): Promise<FixResult>`

Automatically fix detected issues.

**Parameters**:
- `detectionResult: DetectionResult`

**Returns**:
```typescript
{
  fixed_issues: string[];
  success_count: number;
  failed_count: number;
  fix_duration_ms: number;
}
```

#### Other Methods

- `async auto_heal(detectionResult): Promise<HealResult>`
- `async auto_optimize(): Promise<OptimizationResult>`
- `async auto_evolve(): Promise<EvolutionResult>`
- `async auto_test(): Promise<TestResult>`
- `async auto_shield(): Promise<ShieldResult>`
- `async auto_analyse(detectionResult): Promise<AnalyseResult>`
- `async auto_report(report): Promise<void>`

### State Access

```typescript
const state = AutonomyEngine['autonomyState'];

interface AutonomyState {
  health_score: number;               // 0-100
  stability_index: number;            // 0-100
  pipeline_integrity: number;         // 0-100
  auto_evolution_level: number;       // 0-10
  cycle_count: number;
  errors_fixed: number;
  warnings_resolved: number;
  optimizations_applied: number;
  evolutions_completed: number;
  last_cycle_duration_ms: number;
  average_cycle_duration_ms: number;
}
```

---

## CognitiveOptimizationEngine

**Location**: `src/core/cognitive/CognitiveOptimizationEngine.ts`

### Singleton Access

```typescript
import { CognitiveOptimizer } from '@/core/cognitive/CognitiveOptimizationEngine';
```

### Methods

#### `async analyzeIntention(message: string): Promise<IntentionAnalysis>`

Analyze user message intention.

**Parameters**:
- `message: string` - User message

**Returns**:
```typescript
{
  intention: string;           // 'greeting', 'request_information', etc.
  confidence: number;          // 0-1
  entities: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}
```

#### `async checkCoherence(response, context): Promise<CoherenceCheck>`

Check response coherence.

**Parameters**:
- `response: string`
- `context: CognitiveContext`

**Returns**:
```typescript
{
  is_coherent: boolean;
  coherence_score: number;        // 0-1
  inconsistencies: string[];
  corrected_response: string | null;
}
```

#### `async optimizeLongContext(messages): Promise<ContextOptimization>`

Optimize long conversation context.

**Parameters**:
- `messages: CognitiveMessage[]`

**Returns**:
```typescript
{
  compressed_messages: CognitiveMessage[];
  compression_ratio: number;         // 0-1
  tokens_saved: number;
  semantic_preservation: number;     // 0-1
}
```

#### `async memoryGating(query, threshold): Promise<MemoryGatingResult>`

Retrieve relevant memories via semantic search.

**Parameters**:
- `query: string`
- `threshold: number` (default: 0.7)

**Returns**:
```typescript
{
  relevant_memories: Array<{
    content: string;
    similarity: number;
  }>;
  threshold: number;
  retrieved_count: number;
}
```

#### `async optimizeFullPipeline(userMessage, history): Promise<...>`

Execute complete cognitive optimization pipeline.

**Parameters**:
- `userMessage: string`
- `history: CognitiveMessage[]`

**Returns**:
```typescript
{
  intention: IntentionAnalysis;
  optimized_context: CognitiveContext;
  semantic_clusters: SemanticCluster[];
  pipeline_duration_ms: number;
}
```

---

## LongContextOptimizer

**Location**: `src/core/context/LongContextOptimizer.ts`

### Singleton Access

```typescript
import { ContextOptimizer } from '@/core/context/LongContextOptimizer';
```

### Methods

#### `async compressContext(messages, options): Promise<CompressionResult>`

Compress long context (4-50k → 8k tokens).

**Parameters**:
- `messages: ContextMessage[]`
- `options`:
  ```typescript
  {
    maxTokens?: number;           // Default: 8000
    targetRatio?: number;         // Default: 0.2 (1:5)
    preserveRecent?: number;      // Default: 5
    strategy?: 'semantic_grouping' | 'importance_scoring' | 'hybrid';
  }
  ```

**Returns**:
```typescript
{
  original_messages: ContextMessage[];
  compressed_messages: ContextMessage[];
  original_tokens: number;
  compressed_tokens: number;
  compression_ratio: number;
  semantic_preservation: number;
  removed_noise: string[];
  prioritized_segments: string[];
  execution_time_ms: number;
}
```

#### `async semanticGrouping(messages, options): Promise<SemanticGroup[]>`

Group messages by semantic similarity.

**Parameters**:
- `messages: ContextMessage[]`
- `options`:
  ```typescript
  {
    numGroups?: number;
    algorithm?: 'kmeans' | 'hierarchical' | 'dbscan';
    minGroupSize?: number;
  }
  ```

**Returns**: Array of `SemanticGroup`

#### `async selectiveInjection(baseContext, additionalContext, options): Promise<InjectionResult>`

Inject only relevant messages.

**Parameters**:
- `baseContext: ContextMessage[]`
- `additionalContext: ContextMessage[]`
- `options`:
  ```typescript
  {
    relevanceThreshold?: number;  // Default: 0.6
    maxInjected?: number;         // Default: 10
  }
  ```

#### `async removeNoise(messages, options): Promise<NoiseRemovalResult>`

Remove duplicates, low-relevance, contradictions.

**Parameters**:
- `messages: ContextMessage[]`
- `options`:
  ```typescript
  {
    removeDuplicates?: boolean;
    removeLowRelevance?: boolean;
    removeContradictions?: boolean;
    removeCircular?: boolean;
    minImportance?: number;
  }
  ```

#### `async gateContext(messages, options): Promise<GatingResult>`

Filter messages by importance threshold.

**Parameters**:
- `messages: ContextMessage[]`
- `options`:
  ```typescript
  {
    threshold?: number;             // Default: 0.7
    preserveRecent?: number;
    preserveSystemMessages?: boolean;
  }
  ```

---

## SingularityFusionEngine

**Location**: `src/core/singularity/SingularityFusionEngine.ts`

### Singleton Access

```typescript
import { FusionEngine } from '@/core/singularity/SingularityFusionEngine';
```

### Methods

#### `async initialize(initialState): Promise<void>`

Initialize fusion engine with state.

**Parameters**:
- `initialState: SingularityState`

#### `async executeSingularityCycle(input): Promise<FusionResult>`

Execute complete 9-step fusion cycle.

**Parameters**:
```typescript
{
  userMessage: string;
  conversationHistory: any[];
  userPreferences: {
    theme?: string;
    intensity?: number;
    motion?: boolean;
  };
}
```

**Returns**:
```typescript
{
  success: boolean;
  response_text: string;
  audio_buffer: ArrayBuffer;
  lipsync_data: LipSyncData;
  animation_data: AnimationData;
  updated_state: SingularityState;
  stats: {
    step1_analyse_ms: number;
    step2_activation_ms: number;
    step3_styles_ms: number;
    step4_generation_ms: number;
    step5_tts_ms: number;
    step6_lipsync_ms: number;
    step7_avatar_ms: number;
    step8_state_ms: number;
    step9_optimize_ms: number;
    total_cycle_ms: number;
  };
  error?: string;
}
```

### 9-Step Pipeline

1. **step1_Analyse** - Analyze intention
2. **step2_ActivateModules** - Activate relevant modules
3. **step3_AdjustStyles** - Adjust visual/audio styles
4. **step4_GenerateIA** - Generate AI response
5. **step5_PrepareTTS** - Generate audio
6. **step6_LipSync** - Synchronize lip movements
7. **step7_AnimateAvatar** - Animate avatar
8. **step8_UpdateState** - Update system state
9. **step9_AutoOptimize** - Auto-optimize performance

---

## RealTimeExecutionEngine

**Location**: `src/core/realtime/RealTimeExecutionEngine.ts`

### Singleton Access

```typescript
import { RealtimeEngine } from '@/core/realtime/RealTimeExecutionEngine';
```

### Methods

#### `start(targetFPS: number): void`

Start execution loop at target FPS.

**Parameters**:
- `targetFPS: number` (default: 60)

#### `stop(): void`

Stop execution loop.

#### `enqueueAudio(buffer, options): void`

Enqueue audio task (critical priority).

**Parameters**:
- `buffer: ArrayBuffer`
- `options`: Audio options

#### `enqueueAvatar(animation, options): void`

Enqueue avatar task (high priority).

**Parameters**:
- `animation: any`
- `options`: Animation options

#### `enqueueUIEvent(event, options): void`

Enqueue UI event (normal priority).

**Parameters**:
- `event: any`
- `options`: Event options

#### `enqueueNetwork(payload, options): void`

Enqueue network task (low priority).

**Parameters**:
- `payload: any`
- `options`: Network options

### Metrics

```typescript
const metrics = RealtimeEngine['metrics'];

interface ExecutionMetrics {
  fps: number;
  avgFrameTime: number;
  audioLatency: number;
  avatarLatency: number;
  droppedFrames: number;
}
```

---

## DevModeEngine

**Location**: `src/core/devmode/DevModeEngine.ts`

### Singleton Access

```typescript
import { DevMode } from '@/core/devmode/DevModeEngine';
```

### Methods

#### `async patch(request): Promise<PatchResult>`

Apply targeted bug fix.

**Parameters**:
```typescript
{
  location: CodeLocation;
  issue_description: string;
  expected_behavior: string;
  test_case?: string;
}
```

#### `async refactor(request): Promise<RefactorResult>`

Refactor code intelligently.

**Parameters**:
```typescript
{
  location: CodeLocation;
  refactor_type: 'extract_function' | 'rename' | 'simplify' | 'modernize' | 'typing';
  options?: {
    new_name?: string;
    target_lines?: number[];
  };
}
```

#### `async audit(request): Promise<AuditResult>`

Audit code quality, performance, security.

**Parameters**:
```typescript
{
  scope: 'file' | 'directory' | 'module' | 'full_project';
  target_path: string;
  checks: Array<'quality' | 'performance' | 'security' | 'architecture' | 'dependencies'>;
}
```

**Returns**:
```typescript
{
  total_issues: number;
  issues_by_severity: Record<string, number>;
  issues: AuditIssue[];
  code_quality_score: number;    // 0-100
  performance_score: number;     // 0-100
  security_score: number;        // 0-100
  execution_time_ms: number;
}
```

#### `async optimize(request): Promise<OptimizeResult>`

Optimize performance.

**Parameters**:
```typescript
{
  location: CodeLocation;
  optimization_targets: Array<'speed' | 'memory' | 'network' | 'bundle_size' | 'rendering'>;
  constraints?: {
    max_complexity?: number;
    preserve_api?: boolean;
  };
}
```

#### `async fusion(request): Promise<FusionResult>`

Merge multiple files/modules.

**Parameters**:
```typescript
{
  source_files: string[];
  output_file: string;
  fusion_strategy: 'merge' | 'compose' | 'inherit' | 'aggregate';
  options?: {
    deduplicate?: boolean;
    optimize?: boolean;
  };
}
```

#### `async hardening(request): Promise<HardeningResult>`

Harden code with error handling, validation, rollback.

**Parameters**:
```typescript
{
  location: CodeLocation;
  hardening_levels: Array<'error_handling' | 'input_validation' | 'state_rollback' | 'logging' | 'monitoring'>;
}
```

#### `getOperationStats(): OperationStats`

Get DevMode operation statistics.

**Returns**:
```typescript
{
  total_operations: number;
  success_rate: number;
  average_duration_ms: number;
  operations_by_command: Record<string, number>;
}
```

---

## Common Types

### CodeLocation

```typescript
interface CodeLocation {
  file_path: string;
  start_line: number;
  end_line: number;
  function_name?: string;
  class_name?: string;
}
```

### ContextMessage

```typescript
interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens: number;
  timestamp: number;
  importance: number;           // 0-1
  semantic_vector?: number[];
  metadata?: Record<string, unknown>;
}
```

### SingularityState

```typescript
interface SingularityState {
  physical: PhysicalLayer;
  cognitive: CognitiveLayer;
  symbolic: SymbolicLayer;
  adaptive: AdaptiveLayer;
  meta: MetaLayer;
  autonomy?: AutonomyLayer;
  progression?: ProgressionState;
  timestamp: number;
  signature: string;
}
```

---

© 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
