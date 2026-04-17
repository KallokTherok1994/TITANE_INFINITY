use base64::Engine as _;
use chrono::Utc;
use ed25519_dalek::{Signer, SigningKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

use crate::services::db::db_types::{DbError, IpcResponse};

const SECURITY_AUDIT_DIR: &str = "security_active";
const SECURITY_AUDIT_JOURNAL_FILE: &str = "federated_audit_journal.json";
const SECURITY_AUDIT_KEYS_FILE: &str = "governed_export_signing_key.json";
const SECURITY_AUDIT_EXPORTS_DIR: &str = "exports";
const SECURITY_AUDIT_JOURNAL_LIMIT: usize = 200;
const SECURITY_AUDIT_RETENTION_MS: i64 = 7 * 24 * 60 * 60 * 1000;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditEventRecord {
    pub id: String,
    pub category: String,
    pub severity: String,
    pub source: String,
    pub message: String,
    pub correlation_key: String,
    pub timestamp: i64,
    pub last_seen: i64,
    pub acknowledged: bool,
    pub session_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditCorrelationSummary {
    pub key: String,
    pub detection_count: usize,
    pub containment_count: usize,
    pub open_count: usize,
    pub highest_severity: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditSessionSummary {
    pub session_id: String,
    pub detection_count: usize,
    pub containment_count: usize,
    pub open_count: usize,
    pub highest_severity: String,
    pub last_seen: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditSyncRequest {
    pub events: Vec<SecurityAuditEventRecord>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditPublishRequest {
    pub severity_filter: String,
    pub events: Vec<SecurityAuditEventRecord>,
    pub correlation_summaries: Vec<SecurityAuditCorrelationSummary>,
    pub session_summaries: Vec<SecurityAuditSessionSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditPublishedExport {
    pub export_id: String,
    pub export_path: String,
    pub sha256: String,
    pub signature: String,
    pub public_key: String,
    pub fingerprint: String,
    pub published_at: String,
    pub severity_filter: String,
    pub event_count: usize,
    pub scope: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SecurityAuditSyncContent {
    pub storage_path: String,
    pub event_count: usize,
    pub federated_session_count: usize,
    pub updated_at: String,
    pub events: Vec<SecurityAuditEventRecord>,
    pub last_published_export: Option<SecurityAuditPublishedExport>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SecurityAuditJournalStore {
    updated_at: String,
    events: Vec<SecurityAuditEventRecord>,
    last_published_export: Option<SecurityAuditPublishedExport>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SecurityAuditSigningKeyStore {
    private_key: String,
    public_key: String,
    fingerprint: String,
    created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SecurityAuditSignedExportFile {
    kind: String,
    scope: String,
    published_at: String,
    payload_sha256: String,
    signature: String,
    public_key: String,
    fingerprint: String,
    content: SecurityAuditPublishRequest,
}

#[tauri::command]
pub async fn security_audit_sync_journal(
    app: AppHandle,
    payload: SecurityAuditSyncRequest,
) -> IpcResponse<SecurityAuditSyncContent> {
    match sync_security_audit_journal_impl(&app, payload) {
        Ok(content) => IpcResponse::success(content),
        Err(error) => IpcResponse::failure(error),
    }
}

#[tauri::command]
pub async fn security_audit_publish_signed_export(
    app: AppHandle,
    payload: SecurityAuditPublishRequest,
) -> IpcResponse<SecurityAuditPublishedExport> {
    match publish_security_audit_export_impl(&app, payload) {
        Ok(content) => IpcResponse::success(content),
        Err(error) => IpcResponse::failure(error),
    }
}

fn sync_security_audit_journal_impl(
    app: &AppHandle,
    payload: SecurityAuditSyncRequest,
) -> Result<SecurityAuditSyncContent, DbError> {
    let storage_dir = ensure_security_audit_dir(app)?;
    let journal_path = storage_dir.join(SECURITY_AUDIT_JOURNAL_FILE);
    let mut journal = read_security_audit_journal(&journal_path)?;

    journal.events = merge_security_audit_events(journal.events, payload.events);
    journal.updated_at = Utc::now().to_rfc3339();
    write_security_audit_journal(&journal_path, &journal)?;

    Ok(SecurityAuditSyncContent {
        storage_path: journal_path.display().to_string(),
        event_count: journal.events.len(),
        federated_session_count: unique_session_count(&journal.events),
        updated_at: journal.updated_at.clone(),
        events: journal.events,
        last_published_export: journal.last_published_export,
    })
}

fn publish_security_audit_export_impl(
    app: &AppHandle,
    payload: SecurityAuditPublishRequest,
) -> Result<SecurityAuditPublishedExport, DbError> {
    let storage_dir = ensure_security_audit_dir(app)?;
    let journal_path = storage_dir.join(SECURITY_AUDIT_JOURNAL_FILE);
    let mut journal = read_security_audit_journal(&journal_path)?;

    journal.events = merge_security_audit_events(journal.events, payload.events.clone());
    journal.updated_at = Utc::now().to_rfc3339();

    let signing_store = load_or_create_signing_key(&storage_dir)?;
    let signing_key = decode_signing_key(&signing_store.private_key)?;
    let payload_bytes = serde_json::to_vec(&payload).map_err(|error| {
        DbError::new(
            "SECURITY_AUDIT_EXPORT_SERIALIZE",
            "Failed to serialize security audit export",
        )
        .with_details(error.to_string())
    })?;
    let sha256 = hex_sha256(&payload_bytes);
    let signature = base64::engine::general_purpose::STANDARD
        .encode(signing_key.sign(&payload_bytes).to_bytes());
    let published_at = Utc::now().to_rfc3339();
    let export_id = format!(
        "security-audit-{}-{}",
        Utc::now().timestamp_millis(),
        &sha256[..12]
    );
    let export_dir = storage_dir.join(SECURITY_AUDIT_EXPORTS_DIR);
    fs::create_dir_all(&export_dir).map_err(io_error(
        "SECURITY_AUDIT_EXPORT_DIR",
        "Failed to create governed export directory",
    ))?;
    let export_path = export_dir.join(format!("{}.json", export_id));

    let signed_file = SecurityAuditSignedExportFile {
        kind: "security-audit-governed-export".to_string(),
        scope: "tauri-app-data".to_string(),
        published_at: published_at.clone(),
        payload_sha256: sha256.clone(),
        signature: signature.clone(),
        public_key: signing_store.public_key.clone(),
        fingerprint: signing_store.fingerprint.clone(),
        content: payload.clone(),
    };

    fs::write(
        &export_path,
        serde_json::to_vec_pretty(&signed_file).map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_EXPORT_SERIALIZE",
                "Failed to encode governed export file",
            )
            .with_details(error.to_string())
        })?,
    )
    .map_err(io_error(
        "SECURITY_AUDIT_EXPORT_WRITE",
        "Failed to write governed export file",
    ))?;

    let published = SecurityAuditPublishedExport {
        export_id,
        export_path: export_path.display().to_string(),
        sha256,
        signature,
        public_key: signing_store.public_key,
        fingerprint: signing_store.fingerprint,
        published_at,
        severity_filter: payload.severity_filter,
        event_count: payload.events.len(),
        scope: "tauri-app-data".to_string(),
    };

    journal.last_published_export = Some(published.clone());
    write_security_audit_journal(&journal_path, &journal)?;

    Ok(published)
}

fn ensure_security_audit_dir(app: &AppHandle) -> Result<PathBuf, DbError> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_APPDATA",
                "Failed to resolve application data directory",
            )
            .with_details(error.to_string())
        })?
        .join(SECURITY_AUDIT_DIR);

    fs::create_dir_all(&dir).map_err(io_error(
        "SECURITY_AUDIT_DIR",
        "Failed to create security audit directory",
    ))?;

    Ok(dir)
}

fn read_security_audit_journal(path: &Path) -> Result<SecurityAuditJournalStore, DbError> {
    if !path.exists() {
        return Ok(SecurityAuditJournalStore {
            updated_at: Utc::now().to_rfc3339(),
            events: Vec::new(),
            last_published_export: None,
        });
    }

    let raw = fs::read_to_string(path).map_err(io_error(
        "SECURITY_AUDIT_JOURNAL_READ",
        "Failed to read security audit journal",
    ))?;

    serde_json::from_str(&raw).map_err(|error| {
        DbError::new(
            "SECURITY_AUDIT_JOURNAL_PARSE",
            "Failed to parse security audit journal",
        )
        .with_details(error.to_string())
    })
}

fn write_security_audit_journal(
    path: &Path,
    journal: &SecurityAuditJournalStore,
) -> Result<(), DbError> {
    fs::write(
        path,
        serde_json::to_vec_pretty(journal).map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_JOURNAL_SERIALIZE",
                "Failed to serialize security audit journal",
            )
            .with_details(error.to_string())
        })?,
    )
    .map_err(io_error(
        "SECURITY_AUDIT_JOURNAL_WRITE",
        "Failed to persist security audit journal",
    ))
}

fn merge_security_audit_events(
    existing: Vec<SecurityAuditEventRecord>,
    incoming: Vec<SecurityAuditEventRecord>,
) -> Vec<SecurityAuditEventRecord> {
    let now = Utc::now().timestamp_millis();
    let cutoff = now - SECURITY_AUDIT_RETENTION_MS;
    let mut merged = std::collections::BTreeMap::<String, SecurityAuditEventRecord>::new();

    for event in existing.into_iter().chain(incoming) {
        if event.last_seen < cutoff {
            continue;
        }

        match merged.get_mut(&event.id) {
            Some(current) => {
                current.timestamp = current.timestamp.min(event.timestamp);
                current.last_seen = current.last_seen.max(event.last_seen);
                current.acknowledged = current.acknowledged || event.acknowledged;
                if severity_rank(&event.severity) > severity_rank(&current.severity) {
                    current.severity = event.severity.clone();
                }
                current.message = event.message.clone();
                current.source = event.source.clone();
                current.category = event.category.clone();
                current.correlation_key = event.correlation_key.clone();
                if event.session_id.is_some() {
                    current.session_id = event.session_id.clone();
                }
            }
            None => {
                merged.insert(event.id.clone(), event);
            }
        }
    }

    let mut events = merged.into_values().collect::<Vec<_>>();
    events.sort_by(|left, right| {
        right
            .last_seen
            .cmp(&left.last_seen)
            .then_with(|| left.id.cmp(&right.id))
    });
    events.truncate(SECURITY_AUDIT_JOURNAL_LIMIT);
    events
}

fn unique_session_count(events: &[SecurityAuditEventRecord]) -> usize {
    let mut sessions = std::collections::BTreeSet::new();
    for event in events {
        sessions.insert(
            event
                .session_id
                .clone()
                .unwrap_or_else(|| "runtime-shared".to_string()),
        );
    }
    sessions.len()
}

fn load_or_create_signing_key(base_dir: &Path) -> Result<SecurityAuditSigningKeyStore, DbError> {
    let path = base_dir.join(SECURITY_AUDIT_KEYS_FILE);

    if path.exists() {
        let raw = fs::read_to_string(&path).map_err(io_error(
            "SECURITY_AUDIT_KEY_READ",
            "Failed to read governed export signing key",
        ))?;
        return serde_json::from_str(&raw).map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_KEY_PARSE",
                "Failed to parse governed export signing key",
            )
            .with_details(error.to_string())
        });
    }

    let secret: [u8; 32] = rand::random();
    let signing_key = SigningKey::from_bytes(&secret);
    let public_key = signing_key.verifying_key().to_bytes();
    let fingerprint = hex_sha256(&public_key)[..32].to_string();
    let store = SecurityAuditSigningKeyStore {
        private_key: base64::engine::general_purpose::STANDARD.encode(secret),
        public_key: base64::engine::general_purpose::STANDARD.encode(public_key),
        fingerprint,
        created_at: Utc::now().to_rfc3339(),
    };

    fs::write(
        &path,
        serde_json::to_vec_pretty(&store).map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_KEY_SERIALIZE",
                "Failed to serialize governed export signing key",
            )
            .with_details(error.to_string())
        })?,
    )
    .map_err(io_error(
        "SECURITY_AUDIT_KEY_WRITE",
        "Failed to persist governed export signing key",
    ))?;

    Ok(store)
}

fn decode_signing_key(encoded: &str) -> Result<SigningKey, DbError> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(encoded)
        .map_err(|error| {
            DbError::new(
                "SECURITY_AUDIT_KEY_DECODE",
                "Failed to decode governed export private key",
            )
            .with_details(error.to_string())
        })?;
    let secret: [u8; 32] = bytes.try_into().map_err(|_| {
        DbError::new(
            "SECURITY_AUDIT_KEY_LENGTH",
            "Governed export private key has invalid length",
        )
    })?;

    Ok(SigningKey::from_bytes(&secret))
}

fn hex_sha256(bytes: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

fn io_error(code: &'static str, message: &'static str) -> impl Fn(std::io::Error) -> DbError {
    move |error| DbError::new(code, message).with_details(error.to_string())
}

fn severity_rank(severity: &str) -> u8 {
    match severity {
        "critical" => 2,
        "warning" => 1,
        _ => 0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_security_dir(test_name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "titane-security-audit-{}-{}",
            test_name,
            Utc::now().timestamp_nanos_opt().unwrap_or_default()
        ));
        fs::create_dir_all(&dir).expect("temp security audit dir should be created");
        dir
    }

    #[test]
    fn merges_events_across_sessions_and_bounds_history() {
        let now = Utc::now().timestamp_millis();
        let merged = merge_security_audit_events(
            vec![SecurityAuditEventRecord {
                id: "event-a".to_string(),
                category: "detection".to_string(),
                severity: "warning".to_string(),
                source: "ui".to_string(),
                message: "old".to_string(),
                correlation_key: "alpha".to_string(),
                timestamp: now - 1000,
                last_seen: now - 1000,
                acknowledged: false,
                session_id: Some("session-alpha".to_string()),
            }],
            vec![SecurityAuditEventRecord {
                id: "event-a".to_string(),
                category: "detection".to_string(),
                severity: "critical".to_string(),
                source: "health".to_string(),
                message: "new".to_string(),
                correlation_key: "alpha".to_string(),
                timestamp: now,
                last_seen: now,
                acknowledged: true,
                session_id: Some("session-beta".to_string()),
            }],
        );

        assert_eq!(merged.len(), 1);
        assert_eq!(merged[0].severity, "critical");
        assert!(merged[0].acknowledged);
        assert_eq!(merged[0].session_id.as_deref(), Some("session-beta"));
    }

    #[test]
    fn writes_and_reads_journal_roundtrip() {
        let dir = temp_security_dir("journal-roundtrip");
        let journal_path = dir.join(SECURITY_AUDIT_JOURNAL_FILE);
        let now = Utc::now().timestamp_millis();
        let journal = SecurityAuditJournalStore {
            updated_at: Utc::now().to_rfc3339(),
            events: vec![SecurityAuditEventRecord {
                id: "event-roundtrip".to_string(),
                category: "detection".to_string(),
                severity: "warning".to_string(),
                source: "ui".to_string(),
                message: "roundtrip".to_string(),
                correlation_key: "roundtrip-key".to_string(),
                timestamp: now,
                last_seen: now,
                acknowledged: false,
                session_id: Some("session-roundtrip".to_string()),
            }],
            last_published_export: Some(SecurityAuditPublishedExport {
                export_id: "export-roundtrip".to_string(),
                export_path: "/tmp/export-roundtrip.json".to_string(),
                sha256: "abc123".to_string(),
                signature: "sig".to_string(),
                public_key: "pub".to_string(),
                fingerprint: "fp".to_string(),
                published_at: Utc::now().to_rfc3339(),
                severity_filter: "warning".to_string(),
                event_count: 1,
                scope: "tauri-app-data".to_string(),
            }),
        };

        write_security_audit_journal(&journal_path, &journal).expect("journal should write");
        let loaded = read_security_audit_journal(&journal_path).expect("journal should read");

        assert_eq!(loaded.events.len(), 1);
        assert_eq!(loaded.events[0].id, "event-roundtrip");
        assert_eq!(unique_session_count(&loaded.events), 1);
        assert_eq!(
            loaded
                .last_published_export
                .as_ref()
                .map(|export| export.export_id.as_str()),
            Some("export-roundtrip")
        );

        fs::remove_dir_all(dir).expect("temp security audit dir should be removed");
    }

    #[test]
    fn creates_signed_governed_export_file() {
        let dir = temp_security_dir("signed-export");
        let request = SecurityAuditPublishRequest {
            severity_filter: "critical".to_string(),
            events: vec![SecurityAuditEventRecord {
                id: "containment-1".to_string(),
                category: "containment".to_string(),
                severity: "critical".to_string(),
                source: "policy".to_string(),
                message: "Transport gate: IPC enforced".to_string(),
                correlation_key: "transport".to_string(),
                timestamp: Utc::now().timestamp_millis(),
                last_seen: Utc::now().timestamp_millis(),
                acknowledged: false,
                session_id: Some("session-proof".to_string()),
            }],
            correlation_summaries: vec![SecurityAuditCorrelationSummary {
                key: "transport".to_string(),
                detection_count: 0,
                containment_count: 1,
                open_count: 1,
                highest_severity: "critical".to_string(),
            }],
            session_summaries: vec![SecurityAuditSessionSummary {
                session_id: "session-proof".to_string(),
                detection_count: 0,
                containment_count: 1,
                open_count: 1,
                highest_severity: "critical".to_string(),
                last_seen: Utc::now().timestamp_millis(),
            }],
        };

        let store = load_or_create_signing_key(&dir).expect("signing key should exist");
        let signing_key =
            decode_signing_key(&store.private_key).expect("signing key should decode");
        let payload_bytes = serde_json::to_vec(&request).expect("payload should serialize");
        let export_id = format!("test-{}", &hex_sha256(&payload_bytes)[..8]);
        let export_dir = dir.join(SECURITY_AUDIT_EXPORTS_DIR);
        fs::create_dir_all(&export_dir).expect("export dir should exist");
        let export_path = export_dir.join(format!("{}.json", export_id));
        let signature = base64::engine::general_purpose::STANDARD
            .encode(signing_key.sign(&payload_bytes).to_bytes());

        let export_file = SecurityAuditSignedExportFile {
            kind: "security-audit-governed-export".to_string(),
            scope: "tauri-app-data".to_string(),
            published_at: Utc::now().to_rfc3339(),
            payload_sha256: hex_sha256(&payload_bytes),
            signature: signature.clone(),
            public_key: store.public_key.clone(),
            fingerprint: store.fingerprint.clone(),
            content: request,
        };

        fs::write(
            &export_path,
            serde_json::to_vec_pretty(&export_file).expect("signed export should serialize"),
        )
        .expect("signed export file should be written");

        let written =
            fs::read_to_string(&export_path).expect("signed export file should be readable");
        assert!(written.contains("security-audit-governed-export"));
        assert!(written.contains(&signature));
        assert!(written.contains(&store.fingerprint));

        fs::remove_dir_all(dir).expect("temp security audit dir should be removed");
    }
}
