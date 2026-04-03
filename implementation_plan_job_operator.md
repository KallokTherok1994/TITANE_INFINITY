# Implementation Plan — LOCK 4: LONG_TASK_RELAY_V1

## [Overview]

Implement LOCK 4 — LONG_TASK_RELAY_V1: the first governed job kernel for TITANE∞, providing explicit long-task jobs as runtime objects with honest lifecycle, progress tracking, and bounded execution.

**Active Sub-Lock**: JOB_KERNEL — No truthful job model exists. Session state has `pause_state` and `handoff_state` fields but the corresponding capabilities are ABSENT. Need to create the job kernel from scratch.

**Actionability**: local_actionable — All prerequisites exist locally.

## [Types]

Single sentence: Define job types for job lifecycle, progress tracking, and bounded execution.

```typescript
// src/services/operator/jobTypes.ts

type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'BLOCKED';

type JobKind = 'repo_inventory' | 'file_analysis' | 'grep_analysis' | 'test_run' | 'build_check' | 'browser_extract' | 'ide_inspect' | 'custom';

interface OperatorJob {
  job_id: string;
  session_id: string;
  authority_level: AuthorityLevel;
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
  source_operator: 'browser' | 'ide' | 'internal';
}

interface JobCreateRequest {
  job_kind: JobKind;
  scope: string;
  params?: Record<string, unknown>;
}

interface JobCreateResult {
  ok: boolean;
  job: OperatorJob | null;
  block_reason: string | null;
}

interface JobListResult {
  ok: boolean;
  jobs: OperatorJob[];
  total_count: number;
  running_count: number;
}
```

## [Files]

Single sentence: Create job operator service, Rust IPC commands, and update capability registry classification.

**New files to create:**
- `src/services/operator/jobTypes.ts` — TypeScript types for job operator
- `src/services/operator/jobOperator.ts` — Frontend service for job relay
- `src-tauri/src/commands/job_operator.rs` — Rust IPC commands (job_create, job_start, job_status, job_list, job_cancel, job_get_config)
- `src/__tests__/services/operator/jobOperator.test.ts` — Tests for job operator

**Existing files to modify:**
- `src-tauri/src/main.rs` — Add job_operator module declaration and command registrations
- `src/services/operator/types.ts` — Update long_task_job_engine from ABSENT to CONFIGURED
- `src-tauri/src/commands/capability_commands.rs` — Update long_task_job_engine classification

## [Functions]

Single sentence: Implement job lifecycle management, progress tracking, and bounded execution via IPC.

**New functions (Rust - `src-tauri/src/commands/job_operator.rs`):**
- `job_create(kind, scope, params) -> Result<JobCreateResult, String>` — Creates a new governed job
- `job_start(job_id) -> Result<OperatorJob, String>` — Starts a queued job
- `job_status(job_id) -> Result<OperatorJob, String>` — Returns current job state
- `job_list(session_id) -> Result<JobListResult, String>` — Lists jobs for a session
- `job_cancel(job_id) -> Result<bool, String>` — Cancels a cancelable job
- `job_get_config() -> Result<JobOperatorConfig, String>` — Returns configuration

**New functions (TypeScript - `src/services/operator/jobOperator.ts`):**
- `createJob(kind, scope, params?): Promise<JobCreateResult>` — Creates a new job
- `startJob(jobId: string): Promise<OperatorJob>` — Starts a job
- `getJobStatus(jobId: string): Promise<OperatorJob>` — Gets job status
- `listJobs(sessionId: string): Promise<JobListResult>` — Lists jobs
- `cancelJob(jobId: string): Promise<boolean>` — Cancels a job
- `getJobOperatorConfig(): Promise<JobOperatorConfig>` — Config check

## [Classes]

Single sentence: No new classes needed; job operator uses functional approach with stateless IPC commands and singleton session management.

## [Dependencies]

Single sentence: No new dependencies required; job operator uses existing session authority and browser/IDE operators as execution backends.

## [Testing]

Single sentence: Create unit tests for job types and integration tests for IPC commands.

**Test file: `src/__tests__/services/operator/jobOperator.test.ts`**
- Test job lifecycle (create → start → status → cancel)
- Test session binding
- Test cancelable enforcement
- Test block_reason classification
- Test progress tracking truth
- x3 for critical paths: session binding, cancelable enforcement, block_reason

## [Implementation Order]

1. **Create `src/services/operator/jobTypes.ts`** — Define all job operator types
2. **Create `src-tauri/src/commands/job_operator.rs`** — Implement Rust IPC commands
3. **Update `src-tauri/src/main.rs`** — Add module declaration and command registrations
4. **Create `src/services/operator/jobOperator.ts`** — Frontend service
5. **Update `src/services/operator/types.ts`** — Update long_task_job_engine from ABSENT to CONFIGURED
6. **Update `src-tauri/src/commands/capability_commands.rs`** — Update Rust registry
7. **Create `src/__tests__/services/operator/jobOperator.test.ts`** — Tests
8. **Run tests** — Validate all tests pass
9. **Create proof pack** — Generate proof pack