// ═══════════════════════════════════════════════════════════════════════════════
// TITANE∞ v∞ - DEVELOPER MODE TYPES
// OPUS #10 - IA Developer Mode v∞
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type PatchType =
  | 'Replace'
  | 'Insert'
  | 'Delete'
  | 'Create'
  | 'Refactor'
  | 'Optimize';

export type ChangeSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface PatchAction {
  patch_type: PatchType;
  file_path: string;
  description: string;
  changes: PatchChange[];
  severity: ChangeSeverity;
  requires_review: boolean;
}

export interface PatchChange {
  line_start: number;
  line_end: number;
  old_content: string;
  new_content: string;
}

export interface PatchMetadata {
  author: string;
  timestamp: string;
  commit_hash: string;
  branch: string;
}

export interface PatchResult {
  success: boolean;
  patch_id: string;
  applied_at: string;
  affected_files: string[];
  backup_id: string;
  validation_passed: boolean;
  tests_passed: boolean;
  errors: string[];
  warnings: string[];
}

export interface TestRunResult {
  passed: boolean;
  total: number;
  passed_count: number;
  failed_count: number;
  skipped_count: number;
  duration_ms: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY & STATE
// ═══════════════════════════════════════════════════════════════════════════════

export interface PatchHistoryEntry {
  patch_id: string;
  description: string;
  applied_at: string;
  status: 'Applied' | 'Rolled Back' | 'Failed';
  severity: ChangeSeverity;
  affected_files: string[];
  author: string;
}

export interface PatchHistory {
  total_patches: number;
  successful: number;
  failed: number;
  rolled_back: number;
  patches: PatchHistoryEntry[];
}

export interface DeveloperModeState {
  enabled: boolean;
  authorized_user: string | null;
  session_start: string | null;
  patches_this_session: number;
  pending_patches: number;
  last_activity: string | null;
  security_level: 'Standard' | 'Elevated' | 'Admin';
  features_enabled: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECURITY & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SecurityValidation {
  is_valid: boolean;
  user_verified: boolean;
  permissions_ok: boolean;
  no_dangerous_patterns: boolean;
  audit_logged: boolean;
  violations: string[];
}

export interface DiffPreview {
  file_path: string;
  changes: DiffChange[];
  total_additions: number;
  total_deletions: number;
  risk_score: number;
}

export interface DiffChange {
  change_type: 'Addition' | 'Deletion' | 'Modification';
  line_number: number;
  content: string;
  context_before: string[];
  context_after: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUGGESTIONS & ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CodeSuggestion {
  id: string;
  type: 'Refactor' | 'Optimize' | 'Fix' | 'Security' | 'Style';
  description: string;
  file_path: string;
  line_range: [number, number];
  priority: 'Low' | 'Medium' | 'High';
  auto_applicable: boolean;
  estimated_impact: string;
}

export interface FileAnalysis {
  file_path: string;
  language: string;
  lines_of_code: number;
  complexity_score: number;
  suggestions: CodeSuggestion[];
  potential_issues: string[];
  last_modified: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD PIPELINE (OPUS #9)
// ═══════════════════════════════════════════════════════════════════════════════

export interface BuildStatus {
  stage: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message: string;
  started_at: string;
  completed_at: string | null;
}

export interface BuildResult {
  success: boolean;
  build_id: string;
  version: string;
  artifacts: string[];
  duration_ms: number;
  size_bytes: number;
  optimizations: string[];
  warnings: string[];
  errors: string[];
}

export interface BuildConfig {
  target: 'debug' | 'release';
  platforms: ('linux' | 'windows' | 'macos')[];
  optimize: boolean;
  strip_symbols: boolean;
  include_debug_info: boolean;
  custom_flags: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DevModeDashboard {
  state: DeveloperModeState;
  recent_patches: PatchHistoryEntry[];
  pending_suggestions: CodeSuggestion[];
  active_builds: BuildStatus[];
  system_health: 'healthy' | 'degraded' | 'critical';
  last_updated: string;
}

export interface UnifiedEnginesDashboard {
  qa: {
    state: unknown;
    last_run: string | null;
  };
  monitoring: {
    state: unknown;
    health: string;
  };
  developer_mode: {
    state: DeveloperModeState;
    enabled: boolean;
  };
  build: {
    last_build: BuildResult | null;
    status: string;
  };
  system: {
    uptime_seconds: number;
    version: string;
    platform: string;
  };
  timestamp: string;
}
