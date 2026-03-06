use rusqlite::{params, Connection};

use super::db_types::{DbError, DbResult};

const MIGRATIONS: [(&str, &str); 2] = [
    (
        "0001_base",
        r#"
        CREATE TABLE IF NOT EXISTS kv_settings (
            key TEXT PRIMARY KEY,
            value_json TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            stream TEXT NOT NULL,
            type TEXT NOT NULL,
            payload_json TEXT NOT NULL,
            ts INTEGER NOT NULL,
            device_id TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_stream_ts ON events(stream, ts DESC);

        CREATE TABLE IF NOT EXISTS snapshots (
            stream TEXT PRIMARY KEY,
            version INTEGER NOT NULL,
            state_json TEXT NOT NULL,
            ts INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS sync_meta (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            last_sync_ts INTEGER,
            last_sync_ok INTEGER NOT NULL DEFAULT 0,
            last_error_json TEXT
        );
        INSERT OR IGNORE INTO sync_meta(id, last_sync_ts, last_sync_ok, last_error_json)
        VALUES (1, NULL, 0, NULL);
        "#,
    ),
    (
        "0002_schema_migrations",
        r#"
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version TEXT PRIMARY KEY,
            applied_at INTEGER NOT NULL
        );
        "#,
    ),
];

pub fn apply_migrations(conn: &Connection) -> DbResult<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at INTEGER NOT NULL);",
    )
    .map_err(DbError::from)?;

    for (version, sql) in MIGRATIONS {
        let exists: i64 = conn
            .query_row(
                "SELECT COUNT(1) FROM schema_migrations WHERE version = ?1",
                params![version],
                |row| row.get(0),
            )
            .map_err(DbError::from)?;

        if exists == 0 {
            conn.execute_batch(sql).map_err(DbError::from)?;
            conn.execute(
                "INSERT INTO schema_migrations(version, applied_at) VALUES(?1, strftime('%s','now'))",
                params![version],
            )
            .map_err(DbError::from)?;
        }
    }

    Ok(())
}
