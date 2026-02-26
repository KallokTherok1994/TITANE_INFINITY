// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Conversation OS v1 — DbService (Ring 3)
// Evidence: docs/_evidence/conversation_os_v1_20260225_224546/
// Status: EXPERIMENTAL
// Ring: 3 (Services — I/O, persistence)
// ═══════════════════════════════════════════════════════════════
//
// EVENT STORE: Append-only, immutable, SHA256-verified
//
// TABLES:
// - events: All conversation events (user/assistant messages)
// - snapshots: Memory summaries
// - provider_decisions: AI provider selection decisions
// - sources: Citations/sources used in responses
// - failures: Explicit failure tracking
//
// RULES:
// - NO UPDATE/DELETE in runtime code paths
// - SHA256 hash for every row (integrity verification)
// - All timestamps in Unix epoch (ms)
//
// ═══════════════════════════════════════════════════════════════

use rusqlite::{Connection, Result as SqliteResult, params};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

// ───────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EventRow {
    pub id: String,
    pub ts: i64,
    pub session_id: String,
    pub kind: String,
    pub payload_json: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotRow {
    pub id: String,
    pub ts: i64,
    pub session_id: String,
    pub summary_fr: String,
    pub state_json: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderDecisionRow {
    pub id: String,
    pub ts: i64,
    pub session_id: String,
    pub decision_json: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SourceRow {
    pub id: String,
    pub ts: i64,
    pub session_id: String,
    pub provider: String,
    pub url: String,
    pub title: String,
    pub snippet: String,
    pub retrieved_at: i64,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureRow {
    pub id: String,
    pub ts: i64,
    pub session_id: String,
    pub class: String,
    pub detail_json: String,
    pub sha256: String,
}

// ───────────────────────────────────────────────────────────────
// DBSERVICE
// ───────────────────────────────────────────────────────────────

pub struct DbService {
    conn: Arc<Mutex<Connection>>,
}

impl DbService {
    /// Create new DbService with schema initialization
    pub fn new(db_path: PathBuf) -> SqliteResult<Self> {
        let conn = Connection::open(db_path)?;
        
        // Create tables (idempotent)
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                ts INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                kind TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                UNIQUE(id)
            );
            CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id, ts);
            CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);

            CREATE TABLE IF NOT EXISTS snapshots (
                id TEXT PRIMARY KEY,
                ts INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                summary_fr TEXT NOT NULL,
                state_json TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                UNIQUE(id)
            );
            CREATE INDEX IF NOT EXISTS idx_snapshots_session ON snapshots(session_id, ts DESC);

            CREATE TABLE IF NOT EXISTS provider_decisions (
                id TEXT PRIMARY KEY,
                ts INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                decision_json TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                UNIQUE(id)
            );
            CREATE INDEX IF NOT EXISTS idx_provider_decisions_session ON provider_decisions(session_id, ts);

            CREATE TABLE IF NOT EXISTS sources (
                id TEXT PRIMARY KEY,
                ts INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                provider TEXT NOT NULL,
                url TEXT NOT NULL,
                title TEXT NOT NULL,
                snippet TEXT NOT NULL,
                retrieved_at INTEGER NOT NULL,
                sha256 TEXT NOT NULL,
                UNIQUE(id)
            );
            CREATE INDEX IF NOT EXISTS idx_sources_session ON sources(session_id, ts);

            CREATE TABLE IF NOT EXISTS failures (
                id TEXT PRIMARY KEY,
                ts INTEGER NOT NULL,
                session_id TEXT NOT NULL,
                class TEXT NOT NULL,
                detail_json TEXT NOT NULL,
                sha256 TEXT NOT NULL,
                UNIQUE(id)
            );
            CREATE INDEX IF NOT EXISTS idx_failures_session ON failures(session_id, ts);
            "#,
        )?;

        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    // ─────────────────────────────────────────────────────────────
    // APPEND-ONLY WRITES
    // ─────────────────────────────────────────────────────────────

    /// Insert event (append-only)
    pub fn insert_event(&self, event: EventRow) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO events (id, ts, session_id, kind, payload_json, sha256) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                event.id,
                event.ts,
                event.session_id,
                event.kind,
                event.payload_json,
                event.sha256,
            ],
        )?;
        Ok(())
    }

    /// Insert snapshot (append-only)
    pub fn insert_snapshot(&self, snapshot: SnapshotRow) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO snapshots (id, ts, session_id, summary_fr, state_json, sha256) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                snapshot.id,
                snapshot.ts,
                snapshot.session_id,
                snapshot.summary_fr,
                snapshot.state_json,
                snapshot.sha256,
            ],
        )?;
        Ok(())
    }

    /// Insert provider decision (append-only)
    pub fn insert_provider_decision(&self, decision: ProviderDecisionRow) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO provider_decisions (id, ts, session_id, decision_json, sha256) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                decision.id,
                decision.ts,
                decision.session_id,
                decision.decision_json,
                decision.sha256,
            ],
        )?;
        Ok(())
    }

    /// Insert source (append-only)
    pub fn insert_source(&self, source: SourceRow) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO sources (id, ts, session_id, provider, url, title, snippet, retrieved_at, sha256) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                source.id,
                source.ts,
                source.session_id,
                source.provider,
                source.url,
                source.title,
                source.snippet,
                source.retrieved_at,
                source.sha256,
            ],
        )?;
        Ok(())
    }

    /// Insert failure (append-only)
    pub fn insert_failure(&self, failure: FailureRow) -> SqliteResult<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO failures (id, ts, session_id, class, detail_json, sha256) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                failure.id,
                failure.ts,
                failure.session_id,
                failure.class,
                failure.detail_json,
                failure.sha256,
            ],
        )?;
        Ok(())
    }

    // ─────────────────────────────────────────────────────────────
    // QUERIES (READ-ONLY)
    // ─────────────────────────────────────────────────────────────

    /// Get events for session
    pub fn get_events(&self, session_id: &str, limit: u32) -> SqliteResult<Vec<EventRow>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, ts, session_id, kind, payload_json, sha256 FROM events WHERE session_id = ?1 ORDER BY ts DESC LIMIT ?2"
        )?;
        
        let rows = stmt.query_map(params![session_id, limit], |row| {
            Ok(EventRow {
                id: row.get(0)?,
                ts: row.get(1)?,
                session_id: row.get(2)?,
                kind: row.get(3)?,
                payload_json: row.get(4)?,
                sha256: row.get(5)?,
            })
        })?;

        let mut events = Vec::new();
        for row in rows {
            events.push(row?);
        }
        Ok(events)
    }

    /// Get latest snapshot for session
    pub fn get_latest_snapshot(&self, session_id: &str) -> SqliteResult<Option<SnapshotRow>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, ts, session_id, summary_fr, state_json, sha256 FROM snapshots WHERE session_id = ?1 ORDER BY ts DESC LIMIT 1"
        )?;
        
        let mut rows = stmt.query(params![session_id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(SnapshotRow {
                id: row.get(0)?,
                ts: row.get(1)?,
                session_id: row.get(2)?,
                summary_fr: row.get(3)?,
                state_json: row.get(4)?,
                sha256: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    /// Get sources for session
    pub fn get_sources(&self, session_id: &str, limit: u32) -> SqliteResult<Vec<SourceRow>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, ts, session_id, provider, url, title, snippet, retrieved_at, sha256 FROM sources WHERE session_id = ?1 ORDER BY ts DESC LIMIT ?2"
        )?;
        
        let rows = stmt.query_map(params![session_id, limit], |row| {
            Ok(SourceRow {
                id: row.get(0)?,
                ts: row.get(1)?,
                session_id: row.get(2)?,
                provider: row.get(3)?,
                url: row.get(4)?,
                title: row.get(5)?,
                snippet: row.get(6)?,
                retrieved_at: row.get(7)?,
                sha256: row.get(8)?,
            })
        })?;

        let mut sources = Vec::new();
        for row in rows {
            sources.push(row?);
        }
        Ok(sources)
    }

    /// Get failures for session
    pub fn get_failures(&self, session_id: &str, limit: u32) -> SqliteResult<Vec<FailureRow>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, ts, session_id, class, detail_json, sha256 FROM failures WHERE session_id = ?1 ORDER BY ts DESC LIMIT ?2"
        )?;
        
        let rows = stmt.query_map(params![session_id, limit], |row| {
            Ok(FailureRow {
                id: row.get(0)?,
                ts: row.get(1)?,
                session_id: row.get(2)?,
                class: row.get(3)?,
                detail_json: row.get(4)?,
                sha256: row.get(5)?,
            })
        })?;

        let mut failures = Vec::new();
        for row in rows {
            failures.push(row?);
        }
        Ok(failures)
    }
}

// ───────────────────────────────────────────────────────────────
// UTILITIES
// ───────────────────────────────────────────────────────────────

/// Compute SHA256 hash of a string
pub fn compute_sha256(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    format!("{:x}", hasher.finalize())
}

/// Create EventRow with automatic SHA256
pub fn create_event(
    id: String,
    ts: i64,
    session_id: String,
    kind: String,
    payload_json: String,
) -> EventRow {
    let sha256 = compute_sha256(&payload_json);
    EventRow {
        id,
        ts,
        session_id,
        kind,
        payload_json,
        sha256,
    }
}

/// Create SnapshotRow with automatic SHA256
pub fn create_snapshot(
    id: String,
    ts: i64,
    session_id: String,
    summary_fr: String,
    state_json: String,
) -> SnapshotRow {
    let sha256 = compute_sha256(&state_json);
    SnapshotRow {
        id,
        ts,
        session_id,
        summary_fr,
        state_json,
        sha256,
    }
}

/// Create ProviderDecisionRow with automatic SHA256
pub fn create_provider_decision(
    id: String,
    ts: i64,
    session_id: String,
    decision_json: String,
) -> ProviderDecisionRow {
    let sha256 = compute_sha256(&decision_json);
    ProviderDecisionRow {
        id,
        ts,
        session_id,
        decision_json,
        sha256,
    }
}

/// Create SourceRow with automatic SHA256
pub fn create_source(
    id: String,
    ts: i64,
    session_id: String,
    provider: String,
    url: String,
    title: String,
    snippet: String,
    retrieved_at: i64,
) -> SourceRow {
    let payload = format!("{}{}{}{}", provider, url, title, snippet);
    let sha256 = compute_sha256(&payload);
    SourceRow {
        id,
        ts,
        session_id,
        provider,
        url,
        title,
        snippet,
        retrieved_at,
        sha256,
    }
}

/// Create FailureRow with automatic SHA256
pub fn create_failure(
    id: String,
    ts: i64,
    session_id: String,
    class: String,
    detail_json: String,
) -> FailureRow {
    let sha256 = compute_sha256(&detail_json);
    FailureRow {
        id,
        ts,
        session_id,
        class,
        detail_json,
        sha256,
    }
}

// ───────────────────────────────────────────────────────────────
// TESTS
// ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn get_timestamp_ms() -> i64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis() as i64
    }

    #[test]
    fn test_sha256_computation() {
        let data = r#"{"message": "test"}"#;
        let hash = compute_sha256(data);
        assert_eq!(hash.len(), 64); // SHA256 is 64 hex chars
    }

    #[test]
    fn test_create_event() {
        let event = create_event(
            "evt_001".to_string(),
            get_timestamp_ms(),
            "sess_001".to_string(),
            "user_message".to_string(),
            r#"{"content": "hello"}"#.to_string(),
        );
        assert_eq!(event.id, "evt_001");
        assert_eq!(event.sha256.len(), 64);
    }

    #[test]
    fn test_db_service_insert_and_get() -> SqliteResult<()> {
        let db = DbService::new(PathBuf::from(":memory:"))?;
        
        let event = create_event(
            "evt_test".to_string(),
            get_timestamp_ms(),
            "sess_test".to_string(),
            "user_message".to_string(),
            r#"{"content": "test message"}"#.to_string(),
        );

        db.insert_event(event.clone())?;

        let events = db.get_events("sess_test", 10)?;
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].id, "evt_test");
        assert_eq!(events[0].sha256, event.sha256);

        Ok(())
    }

    #[test]
    fn test_snapshot_insert_and_get_latest() -> SqliteResult<()> {
        let db = DbService::new(PathBuf::from(":memory:"))?;

        let snapshot = create_snapshot(
            "snap_test".to_string(),
            get_timestamp_ms(),
            "sess_snap".to_string(),
            "Résumé FR".to_string(),
            r#"{"state":"ok"}"#.to_string(),
        );

        db.insert_snapshot(snapshot.clone())?;

        let latest = db.get_latest_snapshot("sess_snap")?;
        assert!(latest.is_some());

        let latest = latest.expect("snapshot should exist");
        assert_eq!(latest.id, "snap_test");
        assert_eq!(latest.session_id, "sess_snap");
        assert_eq!(latest.sha256.len(), 64);
        assert_eq!(latest.sha256, snapshot.sha256);

        Ok(())
    }

    #[test]
    fn test_source_insert_and_get() -> SqliteResult<()> {
        let db = DbService::new(PathBuf::from(":memory:"))?;

        let source = create_source(
            "src_test".to_string(),
            get_timestamp_ms(),
            "sess_src".to_string(),
            "brave".to_string(),
            "https://example.com".to_string(),
            "Example".to_string(),
            "Snippet".to_string(),
            get_timestamp_ms(),
        );

        db.insert_source(source.clone())?;

        let sources = db.get_sources("sess_src", 10)?;
        assert_eq!(sources.len(), 1);
        assert_eq!(sources[0].id, "src_test");
        assert_eq!(sources[0].url, "https://example.com");
        assert_eq!(sources[0].sha256.len(), 64);
        assert_eq!(sources[0].sha256, source.sha256);

        Ok(())
    }

    #[test]
    fn test_failure_insert_and_get() -> SqliteResult<()> {
        let db = DbService::new(PathBuf::from(":memory:"))?;

        let failure = create_failure(
            "fail_test".to_string(),
            get_timestamp_ms(),
            "sess_fail".to_string(),
            "CREDENTIALS_MISSING".to_string(),
            r#"{"provider":"brave"}"#.to_string(),
        );

        db.insert_failure(failure.clone())?;

        let failures = db.get_failures("sess_fail", 10)?;
        assert_eq!(failures.len(), 1);
        assert_eq!(failures[0].id, "fail_test");
        assert_eq!(failures[0].class, "CREDENTIALS_MISSING");
        assert_eq!(failures[0].sha256.len(), 64);
        assert_eq!(failures[0].sha256, failure.sha256);

        Ok(())
    }

    #[test]
    fn test_append_only_no_update() -> SqliteResult<()> {
        // This test documents that UPDATE is not provided in the API
        // (no update method exists)
        let db = DbService::new(PathBuf::from(":memory:"))?;
        
        let event = create_event(
            "evt_immutable".to_string(),
            get_timestamp_ms(),
            "sess_test".to_string(),
            "user_message".to_string(),
            r#"{"content": "original"}"#.to_string(),
        );

        db.insert_event(event)?;

        // No update method exists - API enforces append-only
        // If we try to insert same ID again, it will fail (UNIQUE constraint)
        let duplicate = create_event(
            "evt_immutable".to_string(),
            get_timestamp_ms(),
            "sess_test".to_string(),
            "user_message".to_string(),
            r#"{"content": "modified"}"#.to_string(),
        );

        let result = db.insert_event(duplicate);
        assert!(result.is_err()); // Should fail due to UNIQUE constraint

        Ok(())
    }
}
