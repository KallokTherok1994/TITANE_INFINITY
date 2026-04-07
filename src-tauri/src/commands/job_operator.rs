// TITANE∞ — JOB OPERATOR COMMANDS — LOCK 4
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum JobStatus {
    Queued,
    Running,
    Completed,
    Failed,
    Cancelled,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperatorJob {
    pub job_id: String,
    pub session_id: String,
    pub authority_level: String,
    pub job_kind: String,
    pub scope: String,
    pub status: JobStatus,
    pub created_at: String,
    pub started_at: Option<String>,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub progress_percent: u8,
    pub stage_label: String,
    pub cancelable: bool,
    pub block_reason: Option<String>,
    pub result_summary: Option<String>,
    pub source_operator: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobCreateResult {
    pub ok: bool,
    pub job: Option<OperatorJob>,
    pub block_reason: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobListResult {
    pub ok: bool,
    pub jobs: Vec<OperatorJob>,
    pub total_count: usize,
    pub running_count: usize,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JobOperatorConfig {
    pub available: bool,
    pub max_concurrent_jobs: u32,
    pub max_job_duration_ms: u64,
    pub supported_kinds: Vec<String>,
    pub forbidden_actions: Vec<String>,
}

const MAX_JOBS: u32 = 10;
const KINDS: &[&str] = &[
    "repo_inventory",
    "file_analysis",
    "grep_analysis",
    "test_run",
    "build_check",
    "browser_extract",
    "ide_inspect",
    "custom",
];
const FORBIDDEN: &[&str] = &[
    "auto_commit",
    "auto_push",
    "auto_merge",
    "prod_build",
    "prod_deploy",
    "rm_rf",
    "sudo",
];

pub struct JobOperatorState {
    pub jobs: Mutex<HashMap<String, OperatorJob>>,
}
impl Default for JobOperatorState {
    fn default() -> Self {
        Self {
            jobs: Mutex::new(HashMap::new()),
        }
    }
}

fn now_iso() -> String {
    let d = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    format!(
        "{}.{:03}Z",
        chrono::DateTime::<chrono::Utc>::from(
            chrono::DateTime::<chrono::Utc>::from_timestamp(d.as_secs() as i64, 0)
                .unwrap_or_default()
        )
        .format("%Y-%m-%dT%H:%M:%S"),
        d.subsec_millis()
    )
}
fn gen_id() -> String {
    let d = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    format!("job_{}_{:08x}", d.as_secs(), d.subsec_nanos())
}

#[tauri::command]
pub async fn job_create(
    state: tauri::State<'_, JobOperatorState>,
    session_id: String,
    job_kind: String,
    scope: String,
) -> Result<JobCreateResult, String> {
    if !KINDS.contains(&job_kind.as_str()) {
        return Ok(JobCreateResult {
            ok: false,
            job: None,
            block_reason: Some(format!("Unsupported kind:{}", job_kind)),
        });
    }
    {
        let j = state.jobs.lock().map_err(|e| e.to_string())?;
        if j.values()
            .filter(|j| matches!(j.status, JobStatus::Running))
            .count()
            >= MAX_JOBS as usize
        {
            return Ok(JobCreateResult {
                ok: false,
                job: None,
                block_reason: Some("Max concurrent jobs reached".into()),
            });
        }
    }
    let id = gen_id();
    let now = now_iso();
    let job = OperatorJob {
        job_id: id.clone(),
        session_id: session_id.clone(),
        authority_level: "OBSERVE".into(),
        job_kind: job_kind.clone(),
        scope: scope.clone(),
        status: JobStatus::Queued,
        created_at: now.clone(),
        started_at: None,
        updated_at: now,
        completed_at: None,
        progress_percent: 0,
        stage_label: "Queued".into(),
        cancelable: true,
        block_reason: None,
        result_summary: None,
        source_operator: "internal".into(),
    };
    state
        .jobs
        .lock()
        .map_err(|e| e.to_string())?
        .insert(id.clone(), job.clone());
    log::info!("[Job] Created:{id} kind:{job_kind}");
    Ok(JobCreateResult {
        ok: true,
        job: Some(job),
        block_reason: None,
    })
}

#[tauri::command]
pub async fn job_start(
    state: tauri::State<'_, JobOperatorState>,
    job_id: String,
) -> Result<OperatorJob, String> {
    let mut j = state.jobs.lock().map_err(|e| e.to_string())?;
    let job = j.get_mut(&job_id).ok_or("Job not found")?;
    if !matches!(job.status, JobStatus::Queued) {
        return Err(format!("Not QUEUED:{:?}", job.status));
    }
    let now = now_iso();
    job.status = JobStatus::Running;
    job.started_at = Some(now.clone());
    job.updated_at = now;
    job.stage_label = "Running".into();
    log::info!("[Job] Started:{job_id}");
    Ok(job.clone())
}

#[tauri::command]
pub async fn job_status(
    state: tauri::State<'_, JobOperatorState>,
    job_id: String,
) -> Result<OperatorJob, String> {
    state
        .jobs
        .lock()
        .map_err(|e| e.to_string())?
        .get(&job_id)
        .cloned()
        .ok_or("Job not found".into())
}

#[tauri::command]
pub async fn job_list(
    state: tauri::State<'_, JobOperatorState>,
    session_id: String,
) -> Result<JobListResult, String> {
    let j = state.jobs.lock().map_err(|e| e.to_string())?;
    let v: Vec<_> = j
        .values()
        .filter(|j| j.session_id == session_id)
        .cloned()
        .collect();
    Ok(JobListResult {
        ok: true,
        total_count: v.len(),
        running_count: v
            .iter()
            .filter(|j| matches!(j.status, JobStatus::Running))
            .count(),
        jobs: v,
    })
}

#[tauri::command]
pub async fn job_cancel(
    state: tauri::State<'_, JobOperatorState>,
    job_id: String,
) -> Result<bool, String> {
    let mut j = state.jobs.lock().map_err(|e| e.to_string())?;
    let job = j.get_mut(&job_id).ok_or("Job not found")?;
    if !job.cancelable {
        return Err("Not cancelable".into());
    }
    if matches!(
        job.status,
        JobStatus::Completed | JobStatus::Cancelled | JobStatus::Failed
    ) {
        return Err(format!("Already {:?}", job.status));
    }
    let now = now_iso();
    job.status = JobStatus::Cancelled;
    job.completed_at = Some(now.clone());
    job.updated_at = now;
    job.stage_label = "Cancelled".into();
    job.result_summary = Some("Cancelled by user".into());
    log::info!("[Job] Cancelled:{job_id}");
    Ok(true)
}

#[tauri::command]
pub async fn job_get_config() -> Result<JobOperatorConfig, String> {
    Ok(JobOperatorConfig {
        available: true,
        max_concurrent_jobs: MAX_JOBS,
        max_job_duration_ms: 1_800_000,
        supported_kinds: KINDS.iter().map(|s| s.to_string()).collect(),
        forbidden_actions: FORBIDDEN.iter().map(|s| s.to_string()).collect(),
    })
}
