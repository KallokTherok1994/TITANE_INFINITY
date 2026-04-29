// TITANE∞ — JOB OPERATOR TYPES — LOCK 4: LONG_TASK_RELAY_V1
// Mirror of src-tauri/src/commands/job_operator.rs types

export type JobStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'BLOCKED';

export type JobKind =
  | 'repo_inventory'
  | 'file_analysis'
  | 'grep_analysis'
  | 'test_run'
  | 'build_check'
  | 'browser_extract'
  | 'ide_inspect'
  | 'custom';

export type JobSourceOperator = 'browser' | 'ide' | 'internal';

export interface OperatorJob {
  job_id: string;
  session_id: string;
  authority_level: string;
  job_kind: JobKind;
  scope: string;
  status: JobStatus;
  created_at: string;
  started_at: string | null;
  updated_at: string;
  completed_at: string | null;
  progress_percent: number;
  stage_label: string;
  cancelable: boolean;
  block_reason: string | null;
  result_summary: string | null;
  source_operator: JobSourceOperator;
}

export interface JobCreateRequest {
  job_kind: JobKind;
  scope: string;
  params?: Record<string, unknown>;
}

export interface JobCreateResult {
  ok: boolean;
  job: OperatorJob | null;
  block_reason: string | null;
}

export interface JobListResult {
  ok: boolean;
  jobs: OperatorJob[];
  total_count: number;
  running_count: number;
}

export interface JobOperatorConfig {
  available: boolean;
  max_concurrent_jobs: number;
  max_job_duration_ms: number;
  supported_kinds: string[];
  forbidden_actions: string[];
}

export const JOB_KINDS: JobKind[] = [
  'repo_inventory',
  'file_analysis',
  'grep_analysis',
  'test_run',
  'build_check',
  'browser_extract',
  'ide_inspect',
  'custom',
];

export const JOB_FORBIDDEN_ACTIONS = [
  'auto_commit',
  'auto_push',
  'auto_merge',
  'prod_build',
  'prod_deploy',
  'rm_rf',
  'sudo',
] as const;
