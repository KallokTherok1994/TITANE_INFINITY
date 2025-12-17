/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v25.6.0 — OPTIMIZATION MODULE EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Unified exports for Phase 12 optimization modules
 *
 * @version 25.6.0
 * @created 2025-12-17
 * @phase 12 - Ultimate Optimization
 */

// GPU Accelerator V2
export {
  GPUAcceleratorV2,
  gpuAcceleratorV2,
  type GPUv2Config,
  type GPUv2Capabilities,
  type GPUTask,
  type GPUTaskResult,
  type GPUv2Metrics,
} from './GPUAcceleratorV2';

// WebAssembly Compute
export {
  WebAssemblyCompute,
  webAssemblyCompute,
  type WASMConfig,
  type WASMCapabilities,
  type ComputeTask,
  type ComputeResult,
  type WASMMetrics,
} from './WebAssemblyCompute';

// Service Worker Manager
export {
  ServiceWorkerManager,
  serviceWorkerManager,
  type ServiceWorkerConfig,
  type ServiceWorkerMetrics,
} from './ServiceWorkerManager';

// IndexedDB Optimizer
export {
  IndexedDBOptimizer,
  indexedDBOptimizer,
  type IndexedDBConfig,
  type StoreConfig,
  type IndexConfig,
  type QueryOptions,
  type IndexedDBMetrics,
} from './IndexedDBOptimizer';
