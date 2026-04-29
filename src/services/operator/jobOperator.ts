// TITANE∞ — JOB OPERATOR SERVICE — LOCK 4: LONG_TASK_RELAY_V1
// Frontend service for governed long-task job relay via canonical IPC.
// One Door: UI → safeInvokeCanonical → IPC → job_operator.rs → execution backend

import { safeInvokeCanonical } from '@/utils/invoke';
import type {
  OperatorJob,
  JobCreateResult,
  JobListResult,
  JobOperatorConfig,
  JobKind,
} from './jobTypes';

// ── Canonical IPC pattern: safeInvokeCanonical<T>(command, args) ─────────────

/**
 * Create a new governed job.
 * Returns ok=false + block_reason on forbidden action or quota exceeded.
 */
export async function createJob(
  jobKind: JobKind,
  scope: string,
  params?: Record<string, unknown>
): Promise<JobCreateResult> {
  const result = await safeInvokeCanonical<JobCreateResult>('job_create', {
    kind: jobKind,
    scope,
    params: params ?? {},
  });
  if (!result.ok || result.content === null) {
    return { ok: false, job: null, block_reason: result.error?.message ?? 'job_create failed' };
  }
  return result.content;
}

/**
 * Start a queued job.
 */
export async function startJob(jobId: string): Promise<OperatorJob> {
  const result = await safeInvokeCanonical<OperatorJob>('job_start', { job_id: jobId });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'job_start failed');
  }
  return result.content;
}

/**
 * Get current status of a job.
 */
export async function getJobStatus(jobId: string): Promise<OperatorJob> {
  const result = await safeInvokeCanonical<OperatorJob>('job_status', { job_id: jobId });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'job_status failed');
  }
  return result.content;
}

/**
 * List all jobs for a session.
 */
export async function listJobs(sessionId: string): Promise<JobListResult> {
  const result = await safeInvokeCanonical<JobListResult>('job_list', { session_id: sessionId });
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'job_list failed');
  }
  return result.content;
}

/**
 * Cancel a cancelable job.
 * Returns true if cancelled, false if not cancelable or not found.
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  const result = await safeInvokeCanonical<boolean>('job_cancel', { job_id: jobId });
  if (!result.ok) {
    throw new Error(result.error?.message ?? 'job_cancel failed');
  }
  return result.content ?? false;
}

/**
 * Get job operator configuration.
 */
export async function getJobOperatorConfig(): Promise<JobOperatorConfig> {
  const result = await safeInvokeCanonical<JobOperatorConfig>('job_get_config', {});
  if (!result.ok || result.content === null) {
    throw new Error(result.error?.message ?? 'job_get_config failed');
  }
  return result.content;
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
