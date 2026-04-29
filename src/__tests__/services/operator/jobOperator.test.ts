/**
 * TITANE∞ — Job Operator Tests — LOCK 4: LONG_TASK_RELAY_V1
 *
 * Tests: job lifecycle, session binding, cancelable enforcement,
 * block_reason classification, progress truth, config validation.
 * x3 coverage for critical paths per plan requirement.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @tauri-apps/api/core ─────────────────────────────────────
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';
import {
  createJob,
  startJob,
  getJobStatus,
  listJobs,
  cancelJob,
  getJobOperatorConfig,
  jobOperator,
} from '@/services/operator/jobOperator';
import type {
  OperatorJob,
  JobCreateResult,
  JobListResult,
  JobOperatorConfig,
} from '@/services/operator/jobTypes';
import { JOB_KINDS, JOB_FORBIDDEN_ACTIONS } from '@/services/operator/jobTypes';

const mockedInvoke = vi.mocked(invoke);

// ── Helpers ───────────────────────────────────────────────────────
function makeJob(overrides: Partial<OperatorJob> = {}): OperatorJob {
  return {
    job_id: 'job-001',
    session_id: 'sess-abc',
    authority_level: 'operator',
    job_kind: 'file_analysis',
    scope: 'src/',
    status: 'QUEUED',
    created_at: '2026-04-29T10:00:00Z',
    started_at: null,
    updated_at: '2026-04-29T10:00:00Z',
    completed_at: null,
    progress_percent: 0,
    stage_label: 'queued',
    cancelable: true,
    block_reason: null,
    result_summary: null,
    source_operator: 'internal',
    ...overrides,
  };
}

function makeCreateResult(overrides: Partial<JobCreateResult> = {}): JobCreateResult {
  return {
    ok: true,
    job: makeJob(),
    block_reason: null,
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────
describe('JobOperator — LOCK 4: LONG_TASK_RELAY_V1', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── A: Job lifecycle (create → start → status → cancel) ───────
  describe('A — Job lifecycle', () => {
    it('A1: createJob returns ok=true and OperatorJob on success', async () => {
      mockedInvoke.mockResolvedValueOnce(makeCreateResult());
      const result = await createJob('file_analysis', 'src/');
      expect(result.ok).toBe(true);
      expect(result.job).not.toBeNull();
      expect(result.job?.job_kind).toBe('file_analysis');
      expect(result.job?.scope).toBe('src/');
      expect(result.block_reason).toBeNull();
      expect(mockedInvoke).toHaveBeenCalledWith('job_create', {
        kind: 'file_analysis',
        scope: 'src/',
        params: {},
      });
    });

    it('A2: startJob transitions status to RUNNING', async () => {
      const runningJob = makeJob({ status: 'RUNNING', started_at: '2026-04-29T10:00:01Z', stage_label: 'running' });
      mockedInvoke.mockResolvedValueOnce(runningJob);
      const job = await startJob('job-001');
      expect(job.status).toBe('RUNNING');
      expect(job.started_at).not.toBeNull();
      expect(mockedInvoke).toHaveBeenCalledWith('job_start', { jobId: 'job-001' });
    });

    it('A3: getJobStatus returns current job state', async () => {
      const job = makeJob({ status: 'RUNNING', progress_percent: 42, stage_label: 'processing' });
      mockedInvoke.mockResolvedValueOnce(job);
      const result = await getJobStatus('job-001');
      expect(result.status).toBe('RUNNING');
      expect(result.progress_percent).toBe(42);
      expect(result.stage_label).toBe('processing');
      expect(mockedInvoke).toHaveBeenCalledWith('job_status', { jobId: 'job-001' });
    });

    it('A4: cancelJob returns true for cancelable job', async () => {
      mockedInvoke.mockResolvedValueOnce(true);
      const result = await cancelJob('job-001');
      expect(result).toBe(true);
      expect(mockedInvoke).toHaveBeenCalledWith('job_cancel', { jobId: 'job-001' });
    });

    it('A5: cancelJob returns false for non-cancelable job', async () => {
      mockedInvoke.mockResolvedValueOnce(false);
      const result = await cancelJob('job-system-001');
      expect(result).toBe(false);
    });

    it('A6: full lifecycle create→start→status(COMPLETED)', async () => {
      mockedInvoke
        .mockResolvedValueOnce(makeCreateResult())
        .mockResolvedValueOnce(makeJob({ status: 'RUNNING', started_at: '2026-04-29T10:00:01Z' }))
        .mockResolvedValueOnce(makeJob({ status: 'COMPLETED', progress_percent: 100, completed_at: '2026-04-29T10:00:05Z', result_summary: 'Analysis complete: 42 files.' }));

      const created = await createJob('file_analysis', 'src/');
      expect(created.ok).toBe(true);
      const started = await startJob(created.job!.job_id);
      expect(started.status).toBe('RUNNING');
      const done = await getJobStatus(created.job!.job_id);
      expect(done.status).toBe('COMPLETED');
      expect(done.result_summary).toContain('42 files');
    });
  });

  // ── B: Session binding ─────────────────────────────────────────
  describe('B — Session binding', () => {
    it('B1: listJobs passes sessionId to IPC', async () => {
      const listResult: JobListResult = {
        ok: true,
        jobs: [makeJob({ session_id: 'sess-abc' })],
        total_count: 1,
        running_count: 1,
      };
      mockedInvoke.mockResolvedValueOnce(listResult);
      const result = await listJobs('sess-abc');
      expect(result.ok).toBe(true);
      expect(result.jobs.every(j => j.session_id === 'sess-abc')).toBe(true);
      expect(mockedInvoke).toHaveBeenCalledWith('job_list', { sessionId: 'sess-abc' });
    });

    it('B2: listJobs returns correct counts', async () => {
      const jobs = [
        makeJob({ status: 'RUNNING', session_id: 'sess-xyz' }),
        makeJob({ job_id: 'job-002', status: 'QUEUED', session_id: 'sess-xyz' }),
      ];
      mockedInvoke.mockResolvedValueOnce({ ok: true, jobs, total_count: 2, running_count: 1 });
      const result = await listJobs('sess-xyz');
      expect(result.total_count).toBe(2);
      expect(result.running_count).toBe(1);
    });

    it('B3: listJobs with different session returns empty list', async () => {
      mockedInvoke.mockResolvedValueOnce({ ok: true, jobs: [], total_count: 0, running_count: 0 });
      const result = await listJobs('sess-other');
      expect(result.jobs).toHaveLength(0);
      expect(result.total_count).toBe(0);
    });
  });

  // ── C: cancelable enforcement ─────────────────────────────────
  describe('C — Cancelable enforcement', () => {
    it('C1: job with cancelable=true can be cancelled', async () => {
      mockedInvoke.mockResolvedValueOnce(makeCreateResult({ job: makeJob({ cancelable: true }) }));
      mockedInvoke.mockResolvedValueOnce(true);
      const { job } = await createJob('file_analysis', 'src/');
      expect(job!.cancelable).toBe(true);
      const cancelled = await cancelJob(job!.job_id);
      expect(cancelled).toBe(true);
    });

    it('C2: job with cancelable=false returns false on cancel', async () => {
      mockedInvoke.mockResolvedValueOnce(false);
      const result = await cancelJob('job-system');
      expect(result).toBe(false);
    });

    it('C3: COMPLETED job cancel returns false', async () => {
      mockedInvoke.mockResolvedValueOnce(false);
      const result = await cancelJob('job-completed');
      expect(result).toBe(false);
    });
  });

  // ── D: block_reason classification ───────────────────────────
  describe('D — Block reason classification', () => {
    it('D1: createJob returns ok=false and block_reason for forbidden action', async () => {
      mockedInvoke.mockResolvedValueOnce({
        ok: false,
        job: null,
        block_reason: 'Forbidden action: auto_commit',
      });
      const result = await createJob('custom', 'scripts/', { action: 'auto_commit' });
      expect(result.ok).toBe(false);
      expect(result.job).toBeNull();
      expect(result.block_reason).toContain('auto_commit');
    });

    it('D2: createJob returns ok=false for quota exceeded', async () => {
      mockedInvoke.mockResolvedValueOnce({
        ok: false,
        job: null,
        block_reason: 'Max concurrent jobs reached (10)',
      });
      const result = await createJob('test_run', 'tests/');
      expect(result.ok).toBe(false);
      expect(result.block_reason).toContain('10');
    });

    it('D3: BLOCKED status job has non-null block_reason', async () => {
      const blocked = makeJob({ status: 'BLOCKED', block_reason: 'Dependency unavailable' });
      mockedInvoke.mockResolvedValueOnce(blocked);
      const job = await getJobStatus('job-blocked');
      expect(job.status).toBe('BLOCKED');
      expect(job.block_reason).not.toBeNull();
    });
  });

  // ── E: Progress truth ─────────────────────────────────────────
  describe('E — Progress tracking truth', () => {
    it('E1: progress_percent is between 0 and 100', async () => {
      const job = makeJob({ progress_percent: 67, status: 'RUNNING' });
      mockedInvoke.mockResolvedValueOnce(job);
      const result = await getJobStatus('job-001');
      expect(result.progress_percent).toBeGreaterThanOrEqual(0);
      expect(result.progress_percent).toBeLessThanOrEqual(100);
    });

    it('E2: COMPLETED job has progress_percent=100', async () => {
      const job = makeJob({ status: 'COMPLETED', progress_percent: 100, completed_at: '2026-04-29T10:00:10Z' });
      mockedInvoke.mockResolvedValueOnce(job);
      const result = await getJobStatus('job-001');
      expect(result.progress_percent).toBe(100);
      expect(result.completed_at).not.toBeNull();
    });

    it('E3: QUEUED job has progress_percent=0', async () => {
      const job = makeJob({ status: 'QUEUED', progress_percent: 0, started_at: null });
      mockedInvoke.mockResolvedValueOnce(job);
      const result = await getJobStatus('job-new');
      expect(result.progress_percent).toBe(0);
      expect(result.started_at).toBeNull();
    });
  });

  // ── F: Config validation ──────────────────────────────────────
  describe('F — Config validation', () => {
    it('F1: getJobOperatorConfig returns valid config shape', async () => {
      const config: JobOperatorConfig = {
        available: true,
        max_concurrent_jobs: 10,
        max_job_duration_ms: 300000,
        supported_kinds: ['repo_inventory', 'file_analysis', 'grep_analysis', 'test_run', 'build_check', 'browser_extract', 'ide_inspect', 'custom'],
        forbidden_actions: ['auto_commit', 'auto_push', 'auto_merge', 'prod_build', 'prod_deploy', 'rm_rf', 'sudo'],
      };
      mockedInvoke.mockResolvedValueOnce(config);
      const result = await getJobOperatorConfig();
      expect(result.available).toBe(true);
      expect(result.max_concurrent_jobs).toBe(10);
      expect(result.supported_kinds).toContain('file_analysis');
      expect(result.forbidden_actions).toContain('auto_commit');
      expect(mockedInvoke).toHaveBeenCalledWith('job_get_config');
    });

    it('F2: JOB_KINDS constant contains all 8 kinds', () => {
      expect(JOB_KINDS).toHaveLength(8);
      expect(JOB_KINDS).toContain('repo_inventory');
      expect(JOB_KINDS).toContain('custom');
    });

    it('F3: JOB_FORBIDDEN_ACTIONS contains security-critical actions', () => {
      const forbidden = [...JOB_FORBIDDEN_ACTIONS];
      expect(forbidden).toContain('auto_commit');
      expect(forbidden).toContain('prod_deploy');
      expect(forbidden).toContain('rm_rf');
      expect(forbidden).toContain('sudo');
    });
  });

  // ── G: jobOperator singleton ──────────────────────────────────
  describe('G — jobOperator singleton', () => {
    it('G1: jobOperator exposes all 6 methods', () => {
      expect(typeof jobOperator.createJob).toBe('function');
      expect(typeof jobOperator.startJob).toBe('function');
      expect(typeof jobOperator.getJobStatus).toBe('function');
      expect(typeof jobOperator.listJobs).toBe('function');
      expect(typeof jobOperator.cancelJob).toBe('function');
      expect(typeof jobOperator.getJobOperatorConfig).toBe('function');
    });

    it('G2: jobOperator.createJob delegates to createJob function', async () => {
      mockedInvoke.mockResolvedValueOnce(makeCreateResult());
      const result = await jobOperator.createJob('grep_analysis', 'src/services/');
      expect(result.ok).toBe(true);
      expect(mockedInvoke).toHaveBeenCalledWith('job_create', expect.objectContaining({ kind: 'grep_analysis' }));
    });
  });
});
