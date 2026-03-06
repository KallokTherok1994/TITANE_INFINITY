use rusqlite::params;
use serde_json::json;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;
use std::sync::MutexGuard;

use super::db_state::DbState;
use super::db_types::{DbError, DbResult};

#[derive(Clone)]
pub struct Option1DbService {
    state: Arc<DbState>,
}

impl Option1DbService {
    pub fn new(state: Arc<DbState>) -> Self {
        Self { state }
    }

    pub fn state(&self) -> Arc<DbState> {
        Arc::clone(&self.state)
    }

    pub fn kv_set(&self, key: &str, value_json: &str) -> DbResult<()> {
        let ts = now_ts();
        self.state.with_conn(|conn| {
            conn.execute(
                "INSERT INTO kv_settings(key, value_json, updated_at) VALUES(?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at",
                params![key, value_json, ts],
            )
            .map_err(DbError::from)?;
            Ok(())
        })
    }

    pub fn kv_get(&self, key: &str) -> DbResult<Option<String>> {
        self.state.with_conn(|conn| {
            let mut stmt = conn
                .prepare("SELECT value_json FROM kv_settings WHERE key = ?1")
                .map_err(DbError::from)?;
            let result = stmt.query_row(params![key], |row| row.get::<_, String>(0));
            match result {
                Ok(v) => Ok(Some(v)),
                Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
                Err(e) => Err(DbError::from(e)),
            }
        })
    }

    pub fn put_event(
        &self,
        stream: &str,
        event_type: &str,
        payload_json: &str,
        device_id: &str,
    ) -> DbResult<String> {
        let id = Uuid::new_v4().to_string();
        let ts = now_ts();

        self.state.with_conn(|conn| {
            conn.execute(
                "INSERT INTO events(id, stream, type, payload_json, ts, device_id) VALUES(?1, ?2, ?3, ?4, ?5, ?6)",
                params![id, stream, event_type, payload_json, ts, device_id],
            )
            .map_err(DbError::from)?;
            Ok(())
        })?;

        Ok(id)
    }

    pub fn get_stream(&self, stream: &str, limit: u32) -> DbResult<Vec<serde_json::Value>> {
        self.state.with_conn(|conn| {
            let mut stmt = conn
                .prepare(
                    "SELECT id, stream, type, payload_json, ts, device_id FROM events WHERE stream = ?1 ORDER BY ts DESC LIMIT ?2",
                )
                .map_err(DbError::from)?;

            let rows = stmt
                .query_map(params![stream, limit], |row| {
                    Ok(json!({
                        "id": row.get::<_, String>(0)?,
                        "stream": row.get::<_, String>(1)?,
                        "type": row.get::<_, String>(2)?,
                        "payload_json": row.get::<_, String>(3)?,
                        "ts": row.get::<_, i64>(4)?,
                        "device_id": row.get::<_, String>(5)?,
                    }))
                })
                .map_err(DbError::from)?;

            let mut out = Vec::new();
            for row in rows {
                out.push(row.map_err(DbError::from)?);
            }
            Ok(out)
        })
    }

    pub fn put_snapshot(&self, stream: &str, version: i64, state_json: &str) -> DbResult<()> {
        let ts = now_ts();
        self.state.with_conn(|conn| {
            conn.execute(
                "INSERT INTO snapshots(stream, version, state_json, ts) VALUES(?1, ?2, ?3, ?4) ON CONFLICT(stream) DO UPDATE SET version=excluded.version, state_json=excluded.state_json, ts=excluded.ts",
                params![stream, version, state_json, ts],
            )
            .map_err(DbError::from)?;
            Ok(())
        })
    }

    pub fn get_snapshot(&self, stream: &str) -> DbResult<Option<serde_json::Value>> {
        self.state.with_conn(|conn| {
            let mut stmt = conn
                .prepare("SELECT stream, version, state_json, ts FROM snapshots WHERE stream = ?1")
                .map_err(DbError::from)?;
            let result = stmt.query_row(params![stream], |row| {
                Ok(json!({
                    "stream": row.get::<_, String>(0)?,
                    "version": row.get::<_, i64>(1)?,
                    "state_json": row.get::<_, String>(2)?,
                    "ts": row.get::<_, i64>(3)?,
                }))
            });
            match result {
                Ok(v) => Ok(Some(v)),
                Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
                Err(e) => Err(DbError::from(e)),
            }
        })
    }

    pub fn update_sync_meta(&self, ok: bool, error_json: Option<String>) -> DbResult<()> {
        let ts = now_ts();
        self.state.with_conn(|conn| {
            conn.execute(
                "UPDATE sync_meta SET last_sync_ts = ?1, last_sync_ok = ?2, last_error_json = ?3 WHERE id = 1",
                params![ts, if ok { 1 } else { 0 }, error_json],
            )
            .map_err(DbError::from)?;
            Ok(())
        })
    }

    pub fn update_sync_meta_guarded(
        &self,
        gate: &MutexGuard<'_, ()>,
        ok: bool,
        error_json: Option<String>,
    ) -> DbResult<()> {
        let ts = now_ts();
        self.state.with_conn_guarded(gate, |conn| {
            conn.execute(
                "UPDATE sync_meta SET last_sync_ts = ?1, last_sync_ok = ?2, last_error_json = ?3 WHERE id = 1",
                params![ts, if ok { 1 } else { 0 }, error_json],
            )
            .map_err(DbError::from)?;
            Ok(())
        })
    }
}

pub fn now_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |d| d.as_secs() as i64)
}
