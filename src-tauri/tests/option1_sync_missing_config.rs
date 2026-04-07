#![cfg(all(not(feature = "mock"), feature = "full"))]

use std::path::PathBuf;

use titane_infinity::services::db::db_service::Option1DbService;
use titane_infinity::services::db::db_state::DbState;
use titane_infinity::services::sync::sync_service::Option1SyncService;

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
fn option1_sync_missing_config_is_honest_and_crud_still_works() {
    let prev_url = std::env::var("TURSO_DATABASE_URL").ok();
    let prev_token = std::env::var("TURSO_AUTH_TOKEN").ok();

    unsafe {
        std::env::remove_var("TURSO_DATABASE_URL");
        std::env::remove_var("TURSO_AUTH_TOKEN");
    }

    let db_path = temp_db_path("option1_sync_missing_config");
    let state = DbState::new(db_path.clone()).expect("state init");
    let db = std::sync::Arc::new(Option1DbService::new(state));
    let sync = Option1SyncService::new(std::sync::Arc::clone(&db));

    let status = sync.sync_now("test-missing-config").expect("sync call");
    assert_eq!(
        status.last_error_code.as_deref(),
        Some("SYNC_MISSING_CONFIG")
    );

    db.kv_set("k", "{\"ok\":true}").expect("kv set still works");
    let read = db.kv_get("k").expect("kv get still works");
    assert_eq!(read.as_deref(), Some("{\"ok\":true}"));

    match prev_url {
        Some(v) => unsafe { std::env::set_var("TURSO_DATABASE_URL", v) },
        None => unsafe { std::env::remove_var("TURSO_DATABASE_URL") },
    }
    match prev_token {
        Some(v) => unsafe { std::env::set_var("TURSO_AUTH_TOKEN", v) },
        None => unsafe { std::env::remove_var("TURSO_AUTH_TOKEN") },
    }

    let _ = std::fs::remove_file(db_path);
}
