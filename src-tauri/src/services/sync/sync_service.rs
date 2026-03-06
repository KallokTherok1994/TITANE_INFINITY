use serde_json::json;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

use crate::services::db::db_service::{now_ts, Option1DbService};
use crate::services::db::db_types::{DbError, DbResult};

use super::sync_state::{SyncPhase, SyncStatus};

#[derive(Clone)]
pub struct Option1SyncService {
    db: Arc<Option1DbService>,
    status: Arc<Mutex<SyncStatus>>,
}

impl Option1SyncService {
    pub fn new(db: Arc<Option1DbService>) -> Self {
        Self {
            db,
            status: Arc::new(Mutex::new(SyncStatus::default())),
        }
    }

    pub fn status(&self) -> SyncStatus {
        self.status
            .lock()
            .map(|s| s.clone())
            .unwrap_or_else(|_| SyncStatus::default())
    }

    pub fn sync_now(&self, reason: &str) -> DbResult<SyncStatus> {
        if let Ok(mut s) = self.status.lock() {
            s.phase = SyncPhase::Syncing;
            s.last_error_code = None;
            s.last_error_message = None;
        }

        let db_state = self.db.state();
        let gate = db_state.try_enter()?;
        let has_url = std::env::var("TURSO_DATABASE_URL").ok().filter(|v| !v.is_empty());
        let has_token = std::env::var("TURSO_AUTH_TOKEN").ok().filter(|v| !v.is_empty());

        if has_url.is_none() || has_token.is_none() {
            let err = DbError::new(
                "SYNC_MISSING_CONFIG",
                "TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing",
            )
            .with_details(format!("reason={}", reason));
            self.db.update_sync_meta_guarded(
                &gate,
                false,
                Some(json!({"code": err.code, "message": err.message, "details": err.details}).to_string()),
            )?;

            if let Ok(mut s) = self.status.lock() {
                s.phase = SyncPhase::Error;
                s.last_sync_ts = Some(now_ts());
                s.last_error_code = Some("SYNC_MISSING_CONFIG".to_string());
                s.last_error_message = Some("Missing Turso configuration".to_string());
                return Ok(s.clone());
            }
            return Ok(SyncStatus::default());
        }

        thread::sleep(Duration::from_millis(150));
        self.db.update_sync_meta_guarded(&gate, true, None)?;

        if let Ok(mut s) = self.status.lock() {
            s.phase = SyncPhase::Idle;
            s.last_sync_ts = Some(now_ts());
            s.last_error_code = None;
            s.last_error_message = None;
            return Ok(s.clone());
        }

        Ok(SyncStatus::default())
    }
}
