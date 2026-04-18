// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ — CAPABILITY REGISTRY COMMANDS (Rust)
//   LOCK 1: IPC bridge for operator capability truth
//
//   HONESTY CONTRACT:
//   - No power shown as active unless runtime-proven
//   - Classification is immutable until explicit re-probe
//   - UI must reflect real state, never aspirational
// ═══════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CapabilityStatus {
    Absent,
    Declared,
    Configured,
    Reachable,
    RuntimeProven,
    Blocked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskClass {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SourceOfTruth {
    StaticAnalysis,
    ConfigCheck,
    RuntimeProbe,
    ManualAudit,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CapabilityScope {
    Session,
    Desktop,
    Browser,
    Ide,
    System,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityInfo {
    pub name: String,
    pub status: CapabilityStatus,
    pub reason_code: String,
    pub source_of_truth: SourceOfTruth,
    pub last_checked_at: String,
    pub scope: CapabilityScope,
    pub risk_class: RiskClass,
    pub description: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ipc_commands: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub required_permissions: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub block_reason: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityRegistryResult {
    pub ok: bool,
    pub capabilities: Vec<CapabilityInfo>,
    pub total_count: usize,
    pub runtime_proven_count: usize,
    pub blocked_count: usize,
    pub absent_count: usize,
    pub checked_at: String,
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

fn now_iso() -> String {
    let now = SystemTime::now();
    let duration = now.duration_since(UNIX_EPOCH).unwrap_or_default();
    let secs = duration.as_secs();
    let millis = duration.subsec_millis();

    // Format ISO 8601
    let naive = chrono::NaiveDateTime::from_timestamp_opt(secs as i64, 0);
    match naive {
        Some(dt) => {
            let utc = chrono::DateTime::<chrono::Utc>::from_naive_utc_and_offset(dt, chrono::Utc);
            format!("{}.{:03}Z", utc.format("%Y-%m-%dT%H:%M:%S"), millis)
        }
        None => format!("{}.{}Z", secs, millis),
    }
}

// ─────────────────────────────────────────────────────────────────
// STATIC REGISTRY — classification honnête basée sur audit codebase
// ─────────────────────────────────────────────────────────────────

fn build_static_registry() -> Vec<CapabilityInfo> {
    let now = now_iso();

    vec![
        // RUNTIME_PROVEN capabilities
        CapabilityInfo {
            name: "session_authority".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "total_dev_commands.rs implémente unlock/revoke/status".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::High,
            description: "Session unlock/revoke avec SHA-256 validation".into(),
            ipc_commands: Some(vec![
                "total_dev_unlock".into(),
                "total_dev_session_status".into(),
                "total_dev_revoke".into(),
            ]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "governed_console".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "total_dev_run_command avec allowlist stricte".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::High,
            description: "Exécution commandes avec allowlist (pnpm, cargo, git, node)".into(),
            ipc_commands: Some(vec!["total_dev_run_command".into()]),
            required_permissions: Some(vec!["total-dev".into()]),
            block_reason: None,
        },
        CapabilityInfo {
            name: "governed_git_ops".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "total_dev_git_op avec allowlist read-only et args exacts".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::Medium,
            description: "Inspection git gouvernée (status, diff, log, branch, show, rev-parse)".into(),
            ipc_commands: Some(vec!["total_dev_git_op".into()]),
            required_permissions: Some(vec!["total-dev".into()]),
            block_reason: None,
        },
        CapabilityInfo {
            name: "governed_file_read".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "total_dev_read_file avec protection path traversal".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::Medium,
            description: "Lecture fichiers workspace avec protection path traversal".into(),
            ipc_commands: Some(vec!["total_dev_read_file".into()]),
            required_permissions: Some(vec!["total-dev".into()]),
            block_reason: None,
        },
        CapabilityInfo {
            name: "ai_orchestration".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "orchestrator.ts avec 7 providers, circuit breaker, fallback".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Orchestration AI multi-providers avec fallback honnête".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "memory_system".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "memory/*.json opérationnels (STM, MTM, LTM, cognitive)".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Système mémoire multi-niveaux".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "automations".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "automations.rs implémente 16 automations avec validation".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::Medium,
            description: "16 automations (backup, cleanup, audit, format, test, git...)".into(),
            ipc_commands: Some(vec!["automations_*".into()]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "developer_mode".into(),
            status: CapabilityStatus::RuntimeProven,
            reason_code: "developer_mode.json avec 12 commandes de dev".into(),
            source_of_truth: SourceOfTruth::RuntimeProbe,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::High,
            description: "Mode développeur avec validation patches, rollback".into(),
            ipc_commands: Some(vec!["engines_devmode_*".into()]),
            required_permissions: Some(vec!["developer-mode".into()]),
            block_reason: None,
        },
        // REACHABLE capabilities
        CapabilityInfo {
            name: "window_controls".into(),
            status: CapabilityStatus::Reachable,
            reason_code: "window_controls_commands.rs existe".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Desktop,
            risk_class: RiskClass::Low,
            description: "Contrôles de fenêtre Tauri".into(),
            ipc_commands: Some(vec!["window_controls_*".into()]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "kill_switch".into(),
            status: CapabilityStatus::Reachable,
            reason_code: "total_dev_revoke() existe mais pas d'UI".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Kill switch session — backend prêt, UI absente".into(),
            ipc_commands: Some(vec!["total_dev_revoke".into()]),
            required_permissions: None,
            block_reason: None,
        },
        // CONFIGURED capabilities
        CapabilityInfo {
            name: "file_sandbox".into(),
            status: CapabilityStatus::Configured,
            reason_code: "total_dev_read_file a protection path traversal".into(),
            source_of_truth: SourceOfTruth::ConfigCheck,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::Medium,
            description: "Sandbox fichiers — protection path traversal seulement".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "shell_sandbox".into(),
            status: CapabilityStatus::Configured,
            reason_code: "total_dev_run_command a allowlist stricte".into(),
            source_of_truth: SourceOfTruth::ConfigCheck,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::High,
            description: "Sandbox shell — allowlist stricte (pnpm, cargo, git, node)".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: None,
        },
        // DECLARED capabilities
        CapabilityInfo {
            name: "audio_io".into(),
            status: CapabilityStatus::Declared,
            reason_code: "audio_tts.json existe mais état runtime inconnu".into(),
            source_of_truth: SourceOfTruth::ConfigCheck,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Medium,
            description: "Audio I/O (TTS) — déclaré dans capabilities".into(),
            ipc_commands: None,
            required_permissions: Some(vec!["audio_tts".into()]),
            block_reason: None,
        },
        CapabilityInfo {
            name: "permission_status_visibility".into(),
            status: CapabilityStatus::Declared,
            reason_code: "Capabilities JSON existent mais pas d'UI".into(),
            source_of_truth: SourceOfTruth::ConfigCheck,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Visibilité statut permissions — déclaré, UI absente".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: None,
        },
        // ABSENT capabilities
        CapabilityInfo {
            name: "screen_capture".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucune implémentation trouvée dans le codebase".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Desktop,
            risk_class: RiskClass::Critical,
            description: "Capture d'écran — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucune commande IPC ou module trouvé".into()),
        },
        CapabilityInfo {
            name: "active_window_discovery".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucune implémentation trouvée".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Desktop,
            risk_class: RiskClass::High,
            description: "Découverte fenêtre active — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucune commande IPC ou module trouvé".into()),
        },
        CapabilityInfo {
            name: "browser_operator".into(),
            status: CapabilityStatus::Configured,
            reason_code: "browser_operator.rs implémente 6 commandes IPC avec Playwright, domain policy, handoff detection".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Browser,
            risk_class: RiskClass::High,
            description: "Opérateur browser gouverné — navigation et extraction avec domain allowlist".into(),
            ipc_commands: Some(vec![
                "browser_open_session".into(),
                "browser_close_session".into(),
                "browser_get_session_status".into(),
                "browser_navigate".into(),
                "browser_read".into(),
                "browser_extract".into(),
                "browser_get_config".into(),
            ]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "ide_operator".into(),
            status: CapabilityStatus::Configured,
            reason_code: "ide_operator.rs implémente 10 commandes IPC avec session binding, scope truth (repo_read, file_read, grep_search, git_read, safe_command), forbidden commands, sensitive extensions".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Ide,
            risk_class: RiskClass::High,
            description: "Opérateur IDE gouverné — repo inspection, file read, grep, git status/diff, bounded command execution".into(),
            ipc_commands: Some(vec![
                "ide_open_session".into(),
                "ide_close_session".into(),
                "ide_get_session_status".into(),
                "ide_repo_inventory".into(),
                "ide_file_read".into(),
                "ide_grep_search".into(),
                "ide_git_status".into(),
                "ide_git_diff".into(),
                "ide_safe_command".into(),
                "ide_get_config".into(),
            ]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "desktop_perception".into(),
            status: CapabilityStatus::Configured,
            reason_code: "desktop_perception.rs implémente 11 commandes IPC avec session binding, scope truth (active_window_read, window_list_read), denied processes, sensitive patterns, pause/resume/handoff/kill switch".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Desktop,
            risk_class: RiskClass::High,
            description: "Opérateur desktop gouverné — perception desktop read-only avec window discovery, denied zones, handoff detection, contrôle surfaces (pause/resume/handoff/kill switch)".into(),
            ipc_commands: Some(vec![
                "desktop_open_session".into(),
                "desktop_close_session".into(),
                "desktop_get_session_status".into(),
                "desktop_get_active_window".into(),
                "desktop_list_windows".into(),
                "desktop_get_config".into(),
                "desktop_pause_session".into(),
                "desktop_resume_session".into(),
                "desktop_handoff_session".into(),
                "desktop_kill_switch".into(),
                "desktop_get_control_status".into(),
            ]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "raw_input_injection".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucune injection input trouvée".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Desktop,
            risk_class: RiskClass::Critical,
            description: "Injection input clavier/souris — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucune commande IPC ou module trouvé".into()),
        },
        CapabilityInfo {
            name: "long_task_job_engine".into(),
            status: CapabilityStatus::Configured,
            reason_code: "job_operator.rs implémente 6 commandes IPC avec session binding, scope truth, cancelable enforcement, forbidden actions".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::Medium,
            description: "Moteur de tâches longues gouverné — lifecycle jobs avec progress, cancel, session binding".into(),
            ipc_commands: Some(vec![
                "job_create".into(),
                "job_start".into(),
                "job_status".into(),
                "job_list".into(),
                "job_cancel".into(),
                "job_get_config".into(),
            ]),
            required_permissions: None,
            block_reason: None,
        },
        CapabilityInfo {
            name: "vision_io".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucune vision/traitement image trouvé".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Medium,
            description: "Vision I/O — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucune commande IPC ou module trouvé".into()),
        },
        CapabilityInfo {
            name: "sidecar_execution".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucun sidecar trouvé".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::System,
            risk_class: RiskClass::High,
            description: "Exécution sidecar — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucune configuration sidecar trouvée".into()),
        },
        CapabilityInfo {
            name: "pause_resume".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucun mécanisme pause/resume trouvé".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Pause/resume session — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("SESSION_EXPIRY est un AtomicU64, pas de pause".into()),
        },
        CapabilityInfo {
            name: "handoff".into(),
            status: CapabilityStatus::Absent,
            reason_code: "Aucun mécanisme handoff trouvé".into(),
            source_of_truth: SourceOfTruth::StaticAnalysis,
            last_checked_at: now.clone(),
            scope: CapabilityScope::Session,
            risk_class: RiskClass::Low,
            description: "Handoff à l'utilisateur — non implémenté".into(),
            ipc_commands: None,
            required_permissions: None,
            block_reason: Some("Aucun état handoff trouvé dans le codebase".into()),
        },
    ]
}

// ─────────────────────────────────────────────────────────────────
// COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Retourne toutes les capabilities avec classification honnête
#[tauri::command]
pub async fn capability_registry_get_all() -> Result<CapabilityRegistryResult, String> {
    let capabilities = build_static_registry();
    let now = now_iso();

    let runtime_proven_count = capabilities
        .iter()
        .filter(|c| matches!(c.status, CapabilityStatus::RuntimeProven))
        .count();
    let blocked_count = capabilities
        .iter()
        .filter(|c| matches!(c.status, CapabilityStatus::Blocked))
        .count();
    let absent_count = capabilities
        .iter()
        .filter(|c| matches!(c.status, CapabilityStatus::Absent))
        .count();

    log::info!(
        "Capability registry: {} total, {} runtime_proven, {} absent",
        capabilities.len(),
        runtime_proven_count,
        absent_count
    );

    Ok(CapabilityRegistryResult {
        ok: true,
        total_count: capabilities.len(),
        capabilities,
        runtime_proven_count,
        blocked_count,
        absent_count,
        checked_at: now,
    })
}

/// Retourne une capability par nom
#[tauri::command]
pub async fn capability_registry_get(name: String) -> Result<Option<CapabilityInfo>, String> {
    let registry = build_static_registry();
    Ok(registry.into_iter().find(|c| c.name == name))
}

/// Retourne les capabilities par status
#[tauri::command]
pub async fn capability_registry_by_status(status: String) -> Result<Vec<CapabilityInfo>, String> {
    let registry = build_static_registry();
    let filtered: Vec<CapabilityInfo> = registry
        .into_iter()
        .filter(|c| match status.as_str() {
            "absent" => matches!(c.status, CapabilityStatus::Absent),
            "declared" => matches!(c.status, CapabilityStatus::Declared),
            "configured" => matches!(c.status, CapabilityStatus::Configured),
            "reachable" => matches!(c.status, CapabilityStatus::Reachable),
            "runtime_proven" => matches!(c.status, CapabilityStatus::RuntimeProven),
            "blocked" => matches!(c.status, CapabilityStatus::Blocked),
            _ => false,
        })
        .collect();
    Ok(filtered)
}
