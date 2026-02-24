// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — CACHE SERVICE (Ring 3)
//   P3.0 QUALIFIED++ — SQLite meta + blob files, dedup by hash
//   Sandbox: data/research/cache/ ONLY
// ═══════════════════════════════════════════════════════════════

use crate::types::research::{CacheEvent, CacheEventKind};
use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

// ─────────────────────────────────────────────────────────────────
// ERROR
// ─────────────────────────────────────────────────────────────────

#[derive(Debug)]
pub enum CacheError {
    SandboxViolation(String),
    Db(String),
    Io(String),
}

impl std::fmt::Display for CacheError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CacheError::SandboxViolation(s) => write!(f, "SandboxViolation: {}", s),
            CacheError::Db(s) => write!(f, "DbError: {}", s),
            CacheError::Io(s) => write!(f, "IoError: {}", s),
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// CACHE ENTRY (meta row)
// ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct CacheEntry {
    pub url: String,
    pub final_url: String,
    pub status: u16,
    pub content_type: String,
    pub fetched_at: u64,
    pub etag: Option<String>,
    pub last_modified: Option<String>,
    pub bytes: u64,
    pub blob_hash: String,
    pub raw_hash: String,
    pub expires_at: Option<u64>,
}

// ─────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────

pub struct CacheService {
    sandbox_root: PathBuf,
    db_path: PathBuf,
    blobs_dir: PathBuf,
}

impl CacheService {
    /// Create (or open) the cache service.
    /// `sandbox_root` must be an absolute path under `data/research`.
    pub fn new(sandbox_root: PathBuf) -> Result<Self, CacheError> {
        let db_path = sandbox_root.join("cache").join("meta.sqlite");
        let blobs_dir = sandbox_root.join("cache").join("blobs");

        let svc = CacheService {
            sandbox_root: sandbox_root.clone(),
            db_path,
            blobs_dir,
        };
        svc.enforce_sandbox_path(&sandbox_root)?;
        svc.init_dirs()?;
        svc.init_db()?;
        Ok(svc)
    }

    // ── Sandbox guard ─────────────────────────────────────────────

    /// Hard-check: path must be under sandbox_root.
    /// Uses canonicalization when both paths exist; falls back to lexical check
    /// for paths not yet created (e.g., new blob files).
    pub fn enforce_sandbox_path(&self, path: &Path) -> Result<(), CacheError> {
        // Try canonicalize-based check first (resolves symlinks and ..)
        if let (Ok(canon_path), Ok(canon_root)) =
            (path.canonicalize(), self.sandbox_root.canonicalize())
        {
            if !canon_path.starts_with(&canon_root) {
                return Err(CacheError::SandboxViolation(format!(
                    "Path '{}' is outside sandbox '{}'",
                    canon_path.display(),
                    canon_root.display()
                )));
            }
            return Ok(());
        }

        // Fallback: lexical check for paths not yet created
        let root = self
            .sandbox_root
            .to_str()
            .unwrap_or("")
            .trim_end_matches('/');
        let p = path.to_str().unwrap_or("").trim_end_matches('/');

        // Reject any path containing ".." (basic traversal guard for non-existent paths)
        if p.contains("..") {
            return Err(CacheError::SandboxViolation(format!(
                "Path '{}' contains '..' and cannot be verified against sandbox '{}'",
                p, root
            )));
        }

        if !p.starts_with(root) && p != root {
            return Err(CacheError::SandboxViolation(format!(
                "Path '{}' is outside sandbox '{}'",
                p, root
            )));
        }
        Ok(())
    }

    // ── Init ──────────────────────────────────────────────────────

    fn init_dirs(&self) -> Result<(), CacheError> {
        std::fs::create_dir_all(&self.blobs_dir).map_err(|e| CacheError::Io(e.to_string()))?;
        Ok(())
    }

    fn open_db(&self) -> Result<Connection, CacheError> {
        Connection::open(&self.db_path).map_err(|e| CacheError::Db(e.to_string()))
    }

    fn init_db(&self) -> Result<(), CacheError> {
        let conn = self.open_db()?;
        conn.execute_batch(
            "PRAGMA journal_mode=WAL;
             CREATE TABLE IF NOT EXISTS cache_entries (
               url            TEXT PRIMARY KEY,
               final_url      TEXT NOT NULL,
               status         INTEGER NOT NULL,
               content_type   TEXT NOT NULL DEFAULT '',
               fetched_at     INTEGER NOT NULL,
               etag           TEXT,
               last_modified  TEXT,
               bytes          INTEGER NOT NULL DEFAULT 0,
               blob_hash      TEXT NOT NULL DEFAULT '',
               raw_hash       TEXT NOT NULL DEFAULT '',
               expires_at     INTEGER
             );
             CREATE TABLE IF NOT EXISTS robots_cache (
               domain         TEXT PRIMARY KEY,
               content        TEXT NOT NULL,
               fetched_at     INTEGER NOT NULL
             );",
        )
        .map_err(|e| CacheError::Db(e.to_string()))?;

        // P4 idempotent migration: add text extraction columns if missing
        let migrations = [
            "ALTER TABLE cache_entries ADD COLUMN text_hash TEXT NULL",
            "ALTER TABLE cache_entries ADD COLUMN extracted_at INTEGER NULL",
            "ALTER TABLE cache_entries ADD COLUMN text_len INTEGER NULL",
        ];
        for sql in &migrations {
            // Ignore "duplicate column" errors (SQLite error code 1 with message "duplicate column name")
            match conn.execute_batch(sql) {
                Ok(_) => {}
                Err(e) => {
                    let msg = e.to_string();
                    if !msg.contains("duplicate column") {
                        return Err(CacheError::Db(format!(
                            "migration failed: {} — {}",
                            sql, msg
                        )));
                    }
                }
            }
        }
        Ok(())
    }

    // ── Public API ────────────────────────────────────────────────

    /// Lookup a URL in the meta cache. Returns Some(CacheEntry) on HIT.
    pub fn lookup(&self, url: &str) -> Result<Option<CacheEntry>, CacheError> {
        let conn = self.open_db()?;
        let mut stmt = conn
            .prepare(
                "SELECT url, final_url, status, content_type, fetched_at,
                        etag, last_modified, bytes, blob_hash, raw_hash, expires_at
                 FROM cache_entries WHERE url = ?1",
            )
            .map_err(|e| CacheError::Db(e.to_string()))?;

        let result = stmt.query_row(params![url], |row| {
            Ok(CacheEntry {
                url: row.get(0)?,
                final_url: row.get(1)?,
                status: row.get::<_, i64>(2)? as u16,
                content_type: row.get(3)?,
                fetched_at: row.get::<_, i64>(4)? as u64,
                etag: row.get(5)?,
                last_modified: row.get(6)?,
                bytes: row.get::<_, i64>(7)? as u64,
                blob_hash: row.get(8)?,
                raw_hash: row.get(9)?,
                expires_at: row.get::<_, Option<i64>>(10)?.map(|v| v as u64),
            })
        });

        match result {
            Ok(entry) => Ok(Some(entry)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(CacheError::Db(e.to_string())),
        }
    }

    /// Write response bytes to cache.
    /// Returns (CacheEntry, CacheEvent).
    /// Dedup: if blob_hash already exists on disk, blob write is skipped.
    pub fn write(
        &self,
        url: &str,
        final_url: &str,
        status: u16,
        content_type: &str,
        etag: Option<&str>,
        last_modified: Option<&str>,
        body: &[u8],
    ) -> Result<(CacheEntry, CacheEvent), CacheError> {
        let now = now_unix_ms();
        let blob_hash = sha256_hex(body);
        let raw_hash = blob_hash.clone();
        let bytes = body.len() as u64;

        // Blob path
        let blob_path = self.blobs_dir.join(format!("{}.bin", blob_hash));
        self.enforce_sandbox_path(&blob_path)?;

        // Dedup: skip writing blob if already present
        let dedup = blob_path.exists();
        if !dedup {
            std::fs::write(&blob_path, body).map_err(|e| CacheError::Io(e.to_string()))?;
        }

        // Upsert meta
        let conn = self.open_db()?;
        conn.execute(
            "INSERT OR REPLACE INTO cache_entries
             (url, final_url, status, content_type, fetched_at, etag, last_modified,
              bytes, blob_hash, raw_hash, expires_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, NULL)",
            params![
                url,
                final_url,
                status as i64,
                content_type,
                now as i64,
                etag,
                last_modified,
                bytes as i64,
                blob_hash,
                raw_hash,
            ],
        )
        .map_err(|e| CacheError::Db(e.to_string()))?;

        let event_kind = if dedup {
            CacheEventKind::Skip
        } else {
            CacheEventKind::Write
        };

        let entry = CacheEntry {
            url: url.to_string(),
            final_url: final_url.to_string(),
            status,
            content_type: content_type.to_string(),
            fetched_at: now,
            etag: etag.map(|s| s.to_string()),
            last_modified: last_modified.map(|s| s.to_string()),
            bytes,
            blob_hash: blob_hash.clone(),
            raw_hash,
            expires_at: None,
        };

        let event = CacheEvent {
            kind: event_kind,
            url: url.to_string(),
            blob_hash: Some(blob_hash),
            bytes: Some(bytes),
            ts: now,
        };

        Ok((entry, event))
    }

    // ── Robots cache ──────────────────────────────────────────────

    /// Read cached robots.txt content for a domain.
    pub fn get_robots(&self, domain: &str) -> Result<Option<String>, CacheError> {
        let conn = self.open_db()?;
        let result = conn.query_row(
            "SELECT content FROM robots_cache WHERE domain = ?1",
            params![domain],
            |row| row.get::<_, String>(0),
        );
        match result {
            Ok(c) => Ok(Some(c)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(CacheError::Db(e.to_string())),
        }
    }

    /// Store robots.txt content for a domain.
    pub fn put_robots(&self, domain: &str, content: &str) -> Result<(), CacheError> {
        let conn = self.open_db()?;
        let now = now_unix_ms() as i64;
        conn.execute(
            "INSERT OR REPLACE INTO robots_cache (domain, content, fetched_at)
             VALUES (?1, ?2, ?3)",
            params![domain, content, now],
        )
        .map_err(|e| CacheError::Db(e.to_string()))?;
        Ok(())
    }

    // ── Extraction meta (P4) ──────────────────────────────────────

    /// Store text extraction metadata for a cached URL (P4 idempotent upsert).
    pub fn update_extract_meta(
        &self,
        url: &str,
        text_hash: &str,
        text_len: usize,
    ) -> Result<(), CacheError> {
        let conn = self.open_db()?;
        let now = now_unix_ms() as i64;
        conn.execute(
            "UPDATE cache_entries SET text_hash = ?1, extracted_at = ?2, text_len = ?3
             WHERE url = ?4",
            params![text_hash, now, text_len as i64, url],
        )
        .map_err(|e| CacheError::Db(e.to_string()))?;
        Ok(())
    }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

fn sha256_hex(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex_encode(&result)
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn now_unix_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn tmp_sandbox() -> PathBuf {
        let dir = std::env::temp_dir()
            .join("titane_research_test")
            .join(uuid_simple());
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn uuid_simple() -> String {
        format!(
            "{:x}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap_or_default()
                .subsec_nanos()
        )
    }

    // G_SANDBOX_WRITE_ONLY: paths outside sandbox must fail
    #[test]
    fn g_sandbox_violation() {
        let sandbox = tmp_sandbox();
        let svc = CacheService::new(sandbox.clone()).unwrap();
        let outside = PathBuf::from("/tmp/outside_sandbox/evil.txt");
        let result = svc.enforce_sandbox_path(&outside);
        assert!(result.is_err());
        match result.unwrap_err() {
            CacheError::SandboxViolation(_) => {}
            e => panic!("expected SandboxViolation, got {:?}", e),
        }
    }

    // Path inside sandbox must pass
    #[test]
    fn g_sandbox_inside_ok() {
        let sandbox = tmp_sandbox();
        let svc = CacheService::new(sandbox.clone()).unwrap();
        let inside = sandbox.join("cache").join("blobs").join("abc.bin");
        assert!(svc.enforce_sandbox_path(&inside).is_ok());
    }

    // G_CACHE_HIT_NO_NETWORK: write then lookup
    #[test]
    fn g_cache_write_then_lookup() {
        let sandbox = tmp_sandbox();
        let svc = CacheService::new(sandbox).unwrap();
        let url = "https://example.com/test";
        let body = b"hello world cache";

        // MISS before write
        let hit = svc.lookup(url).unwrap();
        assert!(hit.is_none(), "should be MISS before write");

        // WRITE
        let (entry, event) = svc
            .write(url, url, 200, "text/html", None, None, body)
            .unwrap();
        assert_eq!(event.kind, CacheEventKind::Write);
        assert_eq!(entry.bytes, body.len() as u64);

        // HIT after write
        let hit = svc.lookup(url).unwrap();
        assert!(hit.is_some(), "should be HIT after write");
        let cached = hit.unwrap();
        assert_eq!(cached.status, 200);
        assert_eq!(cached.bytes, body.len() as u64);
    }

    // Dedup: writing same body twice → second is SKIP, blob unchanged
    #[test]
    fn g_cache_dedup_skip() {
        let sandbox = tmp_sandbox();
        let svc = CacheService::new(sandbox).unwrap();
        let body = b"dedup test body";

        let (_, ev1) = svc
            .write(
                "https://a.com/1",
                "https://a.com/1",
                200,
                "text/html",
                None,
                None,
                body,
            )
            .unwrap();
        assert_eq!(ev1.kind, CacheEventKind::Write);

        // Different URL, same body → same hash → SKIP
        let (_, ev2) = svc
            .write(
                "https://b.com/2",
                "https://b.com/2",
                200,
                "text/html",
                None,
                None,
                body,
            )
            .unwrap();
        assert_eq!(ev2.kind, CacheEventKind::Skip);
    }

    // Robots cache round-trip
    #[test]
    fn g_robots_cache_round_trip() {
        let sandbox = tmp_sandbox();
        let svc = CacheService::new(sandbox).unwrap();
        let domain = "example.com";
        assert!(svc.get_robots(domain).unwrap().is_none());
        svc.put_robots(domain, "User-agent: *\nDisallow: /secret")
            .unwrap();
        let content = svc.get_robots(domain).unwrap();
        assert!(content.is_some());
        assert!(content.unwrap().contains("Disallow"));
    }
}
