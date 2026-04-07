#![cfg(all(not(feature = "mock"), feature = "full"))]

use std::path::PathBuf;

use rusqlite::Connection;
use titane_infinity::services::db::db_migrations::apply_migrations;

fn temp_db_path(name: &str) -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push(format!(
        "{}_{}_{}.sqlite",
        name,
        std::process::id(),
        uuid::Uuid::new_v4()
    ));
    path
}

#[test]
fn option1_migrations_are_idempotent() {
    let db_path = temp_db_path("option1_migrations");
    let conn = Connection::open(&db_path).expect("open db");

    apply_migrations(&conn).expect("first migration");
    apply_migrations(&conn).expect("second migration");

    let count: i64 = conn
        .query_row(
            "SELECT COUNT(1) FROM schema_migrations WHERE version = '0001_base'",
            [],
            |row| row.get(0),
        )
        .expect("count migration row");
    assert_eq!(count, 1);

    let _ = std::fs::remove_file(db_path);
}
