/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.25.0 — DEV-SUDO TYPES (Shared Interfaces)
 *   Break circular dependencies by extracting types
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface DevSudoCommand {
  type: 'dev-sudo';
  action: DevSudoAction;
  params: Record<string, unknown>;
  raw: string;
}

export type DevSudoAction =
  // Corrections & Fixes
  | 'fix-deps'
  | 'fix-opus'
  | 'fix-error'
  | 'repair-component'
  | 'self-heal'
  | 'deep-heal'
  | 'auto-fix'

  // Diagnostic & Analysis
  | 'diagnostic'
  | 'status-full'
  | 'introspect'
  | 'analyze-module'
  | 'scan-modules'
  | 'scan-opus'
  | 'scan-errors'
  | 'health-check'
  | 'analyze-rust'
  | 'analyze-tauri'

  // Dev Operations
  | 'restart-tauri'
  | 'test-bubble'
  | 'test-module'
  | 'show-code'
  | 'whitelist-tauri'
  | 'create-component'
  | 'add-feature'
  | 'merge-opus'

  // Console Commands
  | 'console-ls'
  | 'console-open'
  | 'console-patch'
  | 'console-rebuild'

  // Optimization
  | 'optimize-build'
  | 'optimize-ui'
  | 'optimize-rust'
  | 'optimize-react'

  // API & Connections
  | 'connect-api'
  | 'test-api'
  | 'verify-keys'

  // DevOps
  | 'full-sync'
  | 'verify-architecture'
  | 'generate-report'

  // IDE Mode (Super Prompt #7)
  | 'open-file'
  | 'view-file'
  | 'create-file'
  | 'patch-file'
  | 'goto-function'
  | 'goto-component'
  | 'goto-handler'
  | 'copilot-suggest'
  | 'auto-complete'
  | 'refactor-component'
  | 'refactor-hook'
  | 'refactor-handler'
  | 'explain-code'
  | 'auto-import'
  | 'generate-module'
  | 'run-tests'
  | 'master-analysis'
  | 'architect-refactor'
  | 'code-review'

  // Singularity Mind Engine (Super Prompt #8)
  | 'singularity-scan'
  | 'brain-analysis'
  | 'cognitive-check'
  | 'meta-repair'
  | 'evolution-report'
  | 'coherence-check'

  // Vision Engine (Super Prompt #9)
  | 'vision-analyze'
  | 'ui-diagnostic'
  | 'design-review'
  | 'frontend-optimize'
  | 'visual-repair'

  // Backend & API Master (Super Prompt #10)
  | 'backend-analysis'
  | 'fix-handler'
  | 'create-api'
  | 'whitelist-command'
  | 'optimize-cargo'
  | 'build-backend'
  | 'analyze-security'

  // Memory Eternal Engine (Super Prompt #11)
  | 'memory-scan'
  | 'memory-heal'
  | 'memory-deepheal'
  | 'memory-snapshot'
  | 'memory-export'
  | 'memory-import'
  | 'memory-rebuild'
  | 'memory-optimize'

  // TITANE∞ ONE Unified Brain
  | 'titane-one-introspect'
  | 'titane-one-evolve'
  | 'titane-one-heal'
  | 'titane-one-fullheal'
  | 'titane-one-unify'
  | 'titane-one-optimize'
  | 'titane-one-vision-all'
  | 'titane-one-analyze-dev'
  | 'titane-one-analyze-ui'
  | 'titane-one-analyze-backend'
  | 'titane-one-analyze-memory'
  | 'titane-one-singularity-scan'

  // AI Local Model
  | 'ia-add'
  | 'ia-test'
  | 'ia-set-default'
  | 'ia-enable-devmode'
  | 'ia-scan'
  | 'ia-status'

  // AI Local Training
  | 'ia-train'
  | 'ia-dataset'
  | 'ia-test-model'
  | 'ia-benchmark'

  // AI Bubble Engine
  | 'chat-open'
  | 'chat-close'
  | 'chat-minimize'
  | 'chat-maximize'
  | 'chat-clear'
  | 'chat-set-model'
  | 'chat-dev'
  | 'chat-inspect'
  | 'chat-autoheal'
  | 'chat-fullscreen'
  | 'chat-follow'

  // Data Collector Engine
  | 'dataset-collect'
  | 'dataset-clean'
  | 'dataset-generate'
  | 'dataset-training-pack'
  | 'dataset-compress'
  | 'dataset-add'
  | 'dataset-sync-memory'
  | 'dataset-export'

  // Hybrid Engine
  | 'hybrid-open'
  | 'hybrid-close'
  | 'hybrid-console'
  | 'hybrid-bubble'
  | 'hybrid-heal'
  | 'hybrid-inspect';

export interface DevSudoResult {
  handled: boolean;
  success: boolean;
  response: string;
  data?: unknown;
  error?: string;
  metadata?: DevSudoMetadata;
}

export interface DevSudoMetadata {
  executionTime?: number;
  affectedFiles?: string[];
  changesCount?: number;
  warnings?: string[];
  suggestions?: string[];
}

export interface DevSudoHandlerContext {
  command: DevSudoCommand;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Handler function type for individual DevSudo actions
 */
export type DevSudoHandler = (
  params?: Record<string, unknown>
) => Promise<DevSudoResult>;

/**
 * Handler registry type
 */
export type DevSudoHandlerRegistry = Record<DevSudoAction, DevSudoHandler>;
