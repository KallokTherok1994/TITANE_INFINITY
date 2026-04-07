#![cfg(all(not(feature = "mock"), feature = "full"))]

use std::path::PathBuf;

use titane_infinity::services::db::db_service::Option1DbService;
use titane_infinity::services::db::db_state::DbState;

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
fn option1_sync_lock_blocks_concurrent_db_query() {
    let db_path = temp_db_path("option1_sync_lock");
    let state = DbState::new(db_path.clone()).expect("state init");
    let service = Option1DbService::new(state.clone());

    let gate = state.try_enter().expect("lock acquired");
    let result = service.kv_set("k", "{}");
    assert!(result.is_err());
    let err = result.err().expect("error available");
    assert_eq!(err.code, "DB_BUSY");

    drop(gate);
    let _ = std::fs::remove_file(db_path);
}
