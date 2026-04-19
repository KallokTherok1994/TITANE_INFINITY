use base64::Engine as _;
use chrono::Utc;
use ed25519_dalek::{Signer, SigningKey};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

use crate::security_audit_bridge::{DbError, IpcResponse};

const HYBRID_MEMORY_DIR: &str = "hybrid_memory";
const HYBRID_MEMORY_EXPORTS_DIR: &str = "exports";
const HYBRID_MEMORY_KEYS_FILE: &str = "governed_export_signing_key.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HybridMemoryReportPublishRequest {
    pub report_title: String,
    pub report_markdown: String,
    pub active_preset: String,
    pub shadow_read_status: String,
    pub qualification: String,
    pub query: Option<String>,
    pub preset_history: Vec<String>,
    pub generated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HybridMemoryPublishedExport {
    pub export_id: String,
    pub export_path: String,
    pub metadata_path: String,
    pub sha256: String,
    pub signature: String,
    pub public_key: String,
    pub fingerprint: String,
    pub published_at: String,
    pub scope: String,
    pub active_preset: String,
    pub qualification: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HybridMemorySigningKeyStore {
    private_key: String,
    public_key: String,
    fingerprint: String,
    created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct HybridMemorySignedExportFile {
    kind: String,
    scope: String,
    published_at: String,
    payload_sha256: String,
    signature: String,
    public_key: String,
    fingerprint: String,
    markdown_path: String,
    content: HybridMemoryReportPublishRequest,
}

#[tauri::command]
pub async fn hybrid_memory_publish_governed_report(
    app: AppHandle,
    payload: HybridMemoryReportPublishRequest,
) -> IpcResponse<HybridMemoryPublishedExport> {
    match publish_hybrid_memory_report_impl(&app, payload) {
        Ok(content) => IpcResponse::success(content),
        Err(error) => IpcResponse::failure(error),
    }
}

fn publish_hybrid_memory_report_impl(
    app: &AppHandle,
    payload: HybridMemoryReportPublishRequest,
) -> Result<HybridMemoryPublishedExport, DbError> {
    let storage_dir = ensure_hybrid_memory_dir(app)?;
    publish_hybrid_memory_report_to_dir(&storage_dir, payload)
}

fn ensure_hybrid_memory_dir(app: &AppHandle) -> Result<PathBuf, DbError> {
    let base_dir = app.path().app_data_dir().map_err(|error| {
        DbError::new(
            "HYBRID_MEMORY_APP_DATA",
            "Failed to resolve hybrid memory app data directory",
        )
        .with_details(error.to_string())
    })?;
    let storage_dir = base_dir.join(HYBRID_MEMORY_DIR);
    fs::create_dir_all(&storage_dir).map_err(io_error(
        "HYBRID_MEMORY_DIR_CREATE",
        "Failed to create hybrid memory governed directory",
    ))?;

    Ok(storage_dir)
}

fn publish_hybrid_memory_report_to_dir(
    storage_dir: &Path,
    payload: HybridMemoryReportPublishRequest,
) -> Result<HybridMemoryPublishedExport, DbError> {
    let signing_store = load_or_create_signing_key(storage_dir)?;
    let signing_key = decode_signing_key(&signing_store.private_key)?;
    let payload_bytes = payload.report_markdown.as_bytes();
    let sha256 = hex_sha256(payload_bytes);
    let signature = base64::engine::general_purpose::STANDARD
        .encode(signing_key.sign(payload_bytes).to_bytes());
    let published_at = Utc::now().to_rfc3339();
    let export_id = format!(
        "hybrid-memory-{}-{}",
        Utc::now().timestamp_millis(),
        &sha256[..12]
    );
    let export_dir = storage_dir.join(HYBRID_MEMORY_EXPORTS_DIR);
    fs::create_dir_all(&export_dir).map_err(io_error(
        "HYBRID_MEMORY_EXPORT_DIR",
        "Failed to create hybrid memory export directory",
    ))?;

    let markdown_path = export_dir.join(format!("{}.md", export_id));
    let metadata_path = export_dir.join(format!("{}.json", export_id));

    fs::write(&markdown_path, payload.report_markdown.as_bytes()).map_err(io_error(
        "HYBRID_MEMORY_EXPORT_WRITE",
        "Failed to write governed hybrid memory markdown export",
    ))?;

    let signed_export = HybridMemorySignedExportFile {
        kind: "hybrid-memory-governed-export".to_string(),
        scope: "tauri-app-data".to_string(),
        published_at: published_at.clone(),
        payload_sha256: sha256.clone(),
        signature: signature.clone(),
        public_key: signing_store.public_key.clone(),
        fingerprint: signing_store.fingerprint.clone(),
        markdown_path: markdown_path.display().to_string(),
        content: payload.clone(),
    };

    fs::write(
        &metadata_path,
        serde_json::to_vec_pretty(&signed_export).map_err(|error| {
            DbError::new(
                "HYBRID_MEMORY_EXPORT_SERIALIZE",
                "Failed to serialize governed hybrid memory export metadata",
            )
            .with_details(error.to_string())
        })?,
    )
    .map_err(io_error(
        "HYBRID_MEMORY_METADATA_WRITE",
        "Failed to write governed hybrid memory export metadata",
    ))?;

    Ok(HybridMemoryPublishedExport {
        export_id,
        export_path: markdown_path.display().to_string(),
        metadata_path: metadata_path.display().to_string(),
        sha256,
        signature,
        public_key: signing_store.public_key,
        fingerprint: signing_store.fingerprint,
        published_at,
        scope: "tauri-app-data".to_string(),
        active_preset: payload.active_preset,
        qualification: payload.qualification,
    })
}

fn load_or_create_signing_key(base_dir: &Path) -> Result<HybridMemorySigningKeyStore, DbError> {
    let path = base_dir.join(HYBRID_MEMORY_KEYS_FILE);

    if path.exists() {
        let raw = fs::read_to_string(&path).map_err(io_error(
            "HYBRID_MEMORY_KEY_READ",
            "Failed to read governed hybrid memory signing key",
        ))?;
        return serde_json::from_str(&raw).map_err(|error| {
            DbError::new(
                "HYBRID_MEMORY_KEY_PARSE",
                "Failed to parse governed hybrid memory signing key",
            )
            .with_details(error.to_string())
        });
    }

    let secret: [u8; 32] = rand::random();
    let signing_key = SigningKey::from_bytes(&secret);
    let public_key = signing_key.verifying_key().to_bytes();
    let fingerprint = hex_sha256(&public_key)[..32].to_string();
    let store = HybridMemorySigningKeyStore {
        private_key: base64::engine::general_purpose::STANDARD.encode(secret),
        public_key: base64::engine::general_purpose::STANDARD.encode(public_key),
        fingerprint,
        created_at: Utc::now().to_rfc3339(),
    };

    fs::write(
        &path,
        serde_json::to_vec_pretty(&store).map_err(|error| {
            DbError::new(
                "HYBRID_MEMORY_KEY_SERIALIZE",
                "Failed to serialize governed hybrid memory signing key",
            )
            .with_details(error.to_string())
        })?,
    )
    .map_err(io_error(
        "HYBRID_MEMORY_KEY_WRITE",
        "Failed to persist governed hybrid memory signing key",
    ))?;

    Ok(store)
}

fn decode_signing_key(encoded: &str) -> Result<SigningKey, DbError> {
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(encoded)
        .map_err(|error| {
            DbError::new(
                "HYBRID_MEMORY_KEY_DECODE",
                "Failed to decode governed hybrid memory private key",
            )
            .with_details(error.to_string())
        })?;
    let secret: [u8; 32] = bytes.try_into().map_err(|_| {
        DbError::new(
            "HYBRID_MEMORY_KEY_LENGTH",
            "Governed hybrid memory private key has invalid length",
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

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn sample_payload() -> HybridMemoryReportPublishRequest {
        HybridMemoryReportPublishRequest {
            report_title: "TITANE Hybrid Memory Report".to_string(),
            report_markdown: "# TITANE Hybrid Memory Report\n\n- Preset actif: Equilibre"
                .to_string(),
            active_preset: "Equilibre".to_string(),
            shadow_read_status: "ready".to_string(),
            qualification: "partial".to_string(),
            query: Some("Atlas memory".to_string()),
            preset_history: vec!["Observation -> Equilibre (preset)".to_string()],
            generated_at: Utc::now().to_rfc3339(),
        }
    }

    #[test]
    fn creates_governed_hybrid_memory_markdown_and_metadata() {
        let dir = TempDir::new().expect("temp dir should exist");
        let export = publish_hybrid_memory_report_to_dir(dir.path(), sample_payload())
            .expect("hybrid memory export should succeed");

        let markdown = fs::read_to_string(&export.export_path)
            .expect("markdown export should be readable");
        let metadata = fs::read_to_string(&export.metadata_path)
            .expect("metadata export should be readable");

        assert!(markdown.contains("Preset actif: Equilibre"));
        assert!(metadata.contains("hybrid-memory-governed-export"));
        assert!(metadata.contains(&export.signature));
        assert!(metadata.contains(&export.sha256));
    }
}