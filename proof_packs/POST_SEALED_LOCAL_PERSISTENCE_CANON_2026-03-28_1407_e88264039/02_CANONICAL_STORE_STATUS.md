# CANONICAL_STORE_STATUS

Canonical stores and evidence (static):
159:        return path.join("TITANE_INFINITY/runtime/memory/conversation_os_v1.db");
166:        return home.join(".local/share/TITANE_INFINITY/runtime/memory/conversation_os_v1.db");
172:        .join("TITANE_INFINITY/runtime/memory/conversation_os_v1.db")
178:        std::env::var("TITANE_CONVOS_DB_PATH").ok(),
2033:        assert!(path.ends_with("TITANE_INFINITY/runtime/memory/conversation_os_v1.db"));
8:// EVENT STORE: Append-only, immutable, SHA256-verified
19:// - SHA256 hash for every row (integrity verification)
171:    /// Insert event (append-only)
188:    /// Insert snapshot (append-only)
205:    /// Insert provider decision (append-only)
221:    /// Insert source (append-only)
241:    /// Insert failure (append-only)
367:/// Compute SHA256 hash of a string
374:/// Create EventRow with automatic SHA256
393:/// Create SnapshotRow with automatic SHA256
412:/// Create ProviderDecisionRow with automatic SHA256
429:/// Create SourceRow with automatic SHA256
455:/// Create FailureRow with automatic SHA256
494:        assert_eq!(hash.len(), 64); // SHA256 is 64 hex chars
625:        // No update method exists - API enforces append-only
24:        let db_path = app_data_dir.join("option1_libsql_local.db");
22:const MEMORY_DB_VAULT_ID: &str = "memory_files_db";
197:    match vault.load::<MemoryDatabase>(MEMORY_DB_VAULT_ID).await {
242:        .save(MEMORY_DB_VAULT_ID, db)
30:const VAULT_DIR: &str = "vault/encrypted";
79:        let base_path = PathBuf::from(VAULT_DIR);
175:    fn default_ltm_storage_path() -> PathBuf {
221:    pub fn ltm_storage_path(&self) -> PathBuf {
252:                storage_path: Self::default_ltm_storage_path(),
322:    pub ltm_storage_path: String,
338:            ltm_storage_path: "./data/memory/ltm".to_string(),
