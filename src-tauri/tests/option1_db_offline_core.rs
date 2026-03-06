#![cfg(all(not(feature = "mock"), feature = "full"))]

use std::path::PathBuf;

use titane_infinity::services::db::db_service::Option1DbService;
use titane_infinity::services::db::db_state::DbState;

fn temp_db_path(name: &str) -> PathBuf {
    let mut path = std::env::temp_dir();
    path.push(format!("{}_{}_{}.sqlite", name, std::process::id(), uuid::Uuid::new_v4()));
    path
}

#[test]
fn option1_offline_core_persists_after_reinit() {
    let db_path = temp_db_path("option1_offline_core");

    let state1 = DbState::new(db_path.clone()).expect("state init");
    let service1 = Option1DbService::new(state1);

    let event_id = service1
        .put_event("stream-a", "created", r#"{"k":1}"#, "device-a")
        .expect("put event");
    assert!(!event_id.is_empty());

    service1
        .put_snapshot("stream-a", 1, r#"{"state":"ok"}"#)
        .expect("put snapshot");

    let state2 = DbState::new(db_path.clone()).expect("state re-init");
    let service2 = Option1DbService::new(state2);

    let events = service2.get_stream("stream-a", 10).expect("get stream");
    assert!(!events.is_empty());

    let snapshot = service2
        .get_snapshot("stream-a")
        .expect("get snapshot")
        .expect("snapshot exists");
    assert_eq!(snapshot["version"], 1);

    let _ = std::fs::remove_file(db_path);
}
