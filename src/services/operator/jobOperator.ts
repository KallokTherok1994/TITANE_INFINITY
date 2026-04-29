// TITANE∞ — JOB OPERATOR SERVICE — LOCK 4: LONG_TASK_RELAY_V1
// Frontend service for governed long-task job relay via canonical IPC.
// One Door: UI → IPC → job_operator.rs → execution backend

import { invoke } from '@tauri-apps/api/core';
import type {
  OperatorJob,
  JobCreateResult,
  JobListResult,
  JobOperatorConfig,
  JobKind,
} from './jobTypes';

// ── IPC contract: { ok, content, error } ───────────────────────
// job_operator commands return plain structs (not wrapped in content) —
// unwrapped at the Rust layer; types are correct as returned.

/**
 * Create a new governed job.
 * Returns ok=false + block_reason on forbidden action or quota exceeded.
 */
export async function createJob(
  jobKind: JobKind,
  scope: string,
  params?: Record<string, unknown>
): Promise<JobCreateResult> {
  return invoke<JobCreateResult>('job_create', {
    kind: jobKind,
    scope,
    params: params ?? {},
  });
}

/**
 * Start a queued job.
 */
export async function startJob(jobId: string): Promise<OperatorJob> {
  return invoke<OperatorJob>('job_start', { jobId });
}

/**
 * Get current status of a job.
 */
export async function getJobStatus(jobId: string): Promise<OperatorJob> {
  return invoke<OperatorJob>('job_status', { jobId });
}

/**
 * List all jobs for a session.
 */
export async function listJobs(sessionId: string): Promise<JobListResult> {
  return invoke<JobListResult>('job_list', { sessionId });
}

/**
 * Cancel a cancelable job.
 * Returns true if cancelled, false if not cancelable or not found.
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  return invoke<boolean>('job_cancel', { jobId });
}

/**
 * Get job operator configuration.
 */
export async function getJobOperatorConfig(): Promise<JobOperatorConfig> {
  return invoke<JobOperatorConfig>('job_get_config');
}

// Singleton export for service-style usage
export const jobOperator = {
  createJob,
  startJob,
  getJobStatus,
  listJobs,
  cancelJob,
  getJobOperatorConfig,
};
