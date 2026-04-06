use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SyncPhase {
    Idle,
    Syncing,
    Error,
}

#[derive(Debug, Clone, Serialize)]
pub struct SyncStatus {
    pub phase: SyncPhase,
    pub last_sync_ts: Option<i64>,
    pub last_error_code: Option<String>,
    pub last_error_message: Option<String>,
}

impl Default for SyncStatus {
    fn default() -> Self {
        Self {
            phase: SyncPhase::Idle,
            last_sync_ts: None,
            last_error_code: None,
            last_error_message: None,
        }
    }
}
