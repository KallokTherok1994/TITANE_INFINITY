// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v30.0.0 — DEFAULT KNOWLEDGE BASE INITIALIZER
//   Charge la base de connaissance par défaut au démarrage.
//   Les données sont embarquées via include_str!() pour garantir
//   leur disponibilité immédiate à l'installation, sans réseau.
// ═══════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::OnceLock;

// ─────────────────────────────────────────────────────────────────
// EMBEDDED DEFAULT KNOWLEDGE (compile-time inclusion)
// include_str!() paths are relative to this source file
// ─────────────────────────────────────────────────────────────────

const ENGINES_CATALOG: &str =
    include_str!("../../data/knowledge_base/default/engines_catalog.json");
const IPC_COMMANDS_CATALOG: &str =
    include_str!("../../data/knowledge_base/default/ipc_commands_catalog.json");
const SYSTEM_ARCHITECTURE: &str =
    include_str!("../../data/knowledge_base/default/system_architecture.json");
const IDENTITY_PROFILE: &str =
    include_str!("../../data/knowledge_base/default/identity_profile.json");
const CAPABILITIES_MATRIX: &str =
    include_str!("../../data/knowledge_base/default/capabilities_matrix.json");
const RESPONSE_GUIDELINES: &str =
    include_str!("../../data/knowledge_base/default/response_guidelines.json");
const OPERATIONAL_KNOWLEDGE: &str =
    include_str!("../../data/knowledge_base/default/operational_knowledge.json");
// ── v30.0.0 expansion ──────────────────────────────────────────────────────
const CONSTITUTION_ETHICS: &str =
    include_str!("../../data/knowledge_base/default/constitution_ethics.json");
const MEMORY_SYSTEM_DEEP: &str =
    include_str!("../../data/knowledge_base/default/memory_system_deep.json");
const AI_PROVIDERS_GUIDE: &str =
    include_str!("../../data/knowledge_base/default/ai_providers_guide.json");
const FRONTEND_MODULES: &str =
    include_str!("../../data/knowledge_base/default/frontend_modules.json");
const DIGITAL_TWIN_SYMBIOSIS: &str =
    include_str!("../../data/knowledge_base/default/digital_twin_symbiosis.json");
const SECURITY_PRIVACY: &str =
    include_str!("../../data/knowledge_base/default/security_privacy.json");
const CLOUD_MULTIMODAL: &str =
    include_str!("../../data/knowledge_base/default/cloud_multimodal.json");
const TROUBLESHOOTING_FAQ: &str =
    include_str!("../../data/knowledge_base/default/troubleshooting_faq.json");
const LEARNING_PROMPTS: &str =
    include_str!("../../data/knowledge_base/default/learning_prompts.json");
const SERVICES_BACKEND: &str =
    include_str!("../../data/knowledge_base/default/services_backend.json");

// ─────────────────────────────────────────────────────────────────
// LAZY STATIC CACHE — parsed once, reused on every call
// ─────────────────────────────────────────────────────────────────

static KB_CACHE: OnceLock<(HashMap<String, KnowledgeBaseEntry>, Vec<String>)> = OnceLock::new();

// ─────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────

/// Single entry in the default knowledge base.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBaseEntry {
    pub id: String,
    pub category: String,
    pub version: String,
    pub description: String,
    pub content: serde_json::Value,
}

/// Result of knowledge base initialization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeBaseInitResult {
    pub success: bool,
    pub entries_loaded: usize,
    pub categories_loaded: Vec<String>,
    pub errors: Vec<String>,
    pub version: String,
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT KNOWLEDGE BASE
// ─────────────────────────────────────────────────────────────────

/// Default knowledge base for TITANE∞.
///
/// Contains pre-seeded knowledge about all engines, IPC commands,
/// system architecture, identity, capabilities, response guidelines,
/// and operational knowledge. Available immediately at installation
/// time — no network, no database, no setup required.
pub struct DefaultKnowledgeBase;

impl DefaultKnowledgeBase {
    const SOURCES: &'static [(&'static str, &'static str)] = &[
        ("engines_catalog", ENGINES_CATALOG),
        ("ipc_commands_catalog", IPC_COMMANDS_CATALOG),
        ("system_architecture", SYSTEM_ARCHITECTURE),
        ("identity_profile", IDENTITY_PROFILE),
        ("capabilities_matrix", CAPABILITIES_MATRIX),
        ("response_guidelines", RESPONSE_GUIDELINES),
        ("operational_knowledge", OPERATIONAL_KNOWLEDGE),
        // v30.0.0 expansion
        ("constitution_ethics", CONSTITUTION_ETHICS),
        ("memory_system_deep", MEMORY_SYSTEM_DEEP),
        ("ai_providers_guide", AI_PROVIDERS_GUIDE),
        ("frontend_modules", FRONTEND_MODULES),
        ("digital_twin_symbiosis", DIGITAL_TWIN_SYMBIOSIS),
        ("security_privacy", SECURITY_PRIVACY),
        ("cloud_multimodal", CLOUD_MULTIMODAL),
        ("troubleshooting_faq", TROUBLESHOOTING_FAQ),
        ("learning_prompts", LEARNING_PROMPTS),
        ("services_backend", SERVICES_BACKEND),
    ];

    /// Load all default knowledge entries from embedded JSON.
    ///
    /// Results are parsed once and cached via `OnceLock`. Subsequent calls
    /// return a clone of the cached data without re-parsing.
    /// Parse errors are collected and returned separately.
    pub fn load_all() -> (HashMap<String, KnowledgeBaseEntry>, Vec<String>) {
        let cached = KB_CACHE.get_or_init(|| {
            let mut entries: HashMap<String, KnowledgeBaseEntry> = HashMap::new();
            let mut errors: Vec<String> = Vec::new();

            for (id, json_str) in Self::SOURCES {
                match serde_json::from_str::<serde_json::Value>(json_str) {
                    Ok(value) => {
                        let category = value
                            .get("category")
                            .and_then(|v| v.as_str())
                            .unwrap_or(id)
                            .to_string();
                        let version = value
                            .get("version")
                            .and_then(|v| v.as_str())
                            .unwrap_or("v30.0.0")
                            .to_string();
                        let description = value
                            .get("description")
                            .and_then(|v| v.as_str())
                            .unwrap_or("")
                            .to_string();

                        let entry = KnowledgeBaseEntry {
                            id: id.to_string(),
                            category: category.clone(),
                            version,
                            description,
                            content: value,
                        };
                        entries.insert(category, entry);
                    }
                    Err(e) => {
                        errors.push(format!("Failed to parse '{}': {}", id, e));
                    }
                }
            }

            (entries, errors)
        });
        cached.clone()
    }

    /// Initialize the default knowledge base and return a result summary.
    ///
    /// This is the main entry point called at app startup.
    /// Logs success or warning for each category via `log::info!` / `log::warn!`.
    pub fn initialize() -> KnowledgeBaseInitResult {
        let (entries, errors) = Self::load_all();
        let entries_loaded = entries.len();
        let mut categories_loaded: Vec<String> = entries.keys().cloned().collect();
        categories_loaded.sort();
        let success = errors.is_empty();

        if success {
            log::info!(
                "[KnowledgeBase] ✅ Default knowledge base v30.0.0 initialized: {} categories",
                entries_loaded
            );
        } else {
            log::warn!(
                "[KnowledgeBase] ⚠️  Default knowledge base initialized with {} errors",
                errors.len()
            );
            for err in &errors {
                log::warn!("[KnowledgeBase]   ✗ {}", err);
            }
        }

        KnowledgeBaseInitResult {
            success,
            entries_loaded,
            categories_loaded,
            errors,
            version: "v30.0.0".to_string(),
        }
    }

    /// Get a specific knowledge entry by category ID.
    pub fn get_entry(category: &str) -> Option<KnowledgeBaseEntry> {
        let (entries, _) = Self::load_all();
        entries.get(category).cloned()
    }

    /// List all category IDs available in the default knowledge base.
    pub fn list_categories() -> Vec<String> {
        let (entries, _) = Self::load_all();
        let mut cats: Vec<String> = entries.keys().cloned().collect();
        cats.sort();
        cats
    }

    /// Check whether all default knowledge entries parse correctly.
    pub fn validate() -> bool {
        let (_, errors) = Self::load_all();
        errors.is_empty()
    }
}

// ─────────────────────────────────────────────────────────────────
// IPC COMMANDS
// ─────────────────────────────────────────────────────────────────

/// Return the full default knowledge base as a JSON string.
#[tauri::command]
pub fn knowledge_base_get_all() -> Result<String, String> {
    let (entries, errors) = DefaultKnowledgeBase::load_all();
    if !errors.is_empty() {
        log::warn!(
            "[KnowledgeBase] knowledge_base_get_all: {} parse errors",
            errors.len()
        );
    }
    serde_json::to_string(&entries).map_err(|e| format!("Serialization error: {}", e))
}

/// Return a specific knowledge category as a JSON string.
#[tauri::command]
pub fn knowledge_base_get_category(category: String) -> Result<String, String> {
    match DefaultKnowledgeBase::get_entry(&category) {
        Some(entry) => {
            serde_json::to_string(&entry).map_err(|e| format!("Serialization error: {}", e))
        }
        None => Err(format!(
            "Category '{}' not found in default knowledge base",
            category
        )),
    }
}

/// List all available knowledge categories.
#[tauri::command]
pub fn knowledge_base_list_categories() -> Result<Vec<String>, String> {
    Ok(DefaultKnowledgeBase::list_categories())
}

/// Validate the integrity of all default knowledge entries.
#[tauri::command]
pub fn knowledge_base_validate() -> Result<bool, String> {
    Ok(DefaultKnowledgeBase::validate())
}

// ─────────────────────────────────────────────────────────────────
// UNIT TESTS
// ─────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_knowledge_base_loads_all_categories() {
        let result = DefaultKnowledgeBase::initialize();
        assert!(
            result.success,
            "Default knowledge base must load without errors: {:?}",
            result.errors
        );
        assert_eq!(
            result.entries_loaded, 17,
            "Must have exactly 17 default knowledge categories"
        );
    }

    #[test]
    fn test_knowledge_base_validate() {
        assert!(
            DefaultKnowledgeBase::validate(),
            "All JSON entries must be valid"
        );
    }

    #[test]
    fn test_knowledge_base_list_categories() {
        let cats = DefaultKnowledgeBase::list_categories();
        assert!(!cats.is_empty(), "Must have at least one category");
        let expected = vec![
            "ai_providers_guide",
            "capabilities_matrix",
            "cloud_multimodal",
            "constitution_ethics",
            "digital_twin_symbiosis",
            "engines_catalog",
            "frontend_modules",
            "identity_profile",
            "ipc_commands_catalog",
            "learning_prompts",
            "memory_system_deep",
            "operational_knowledge",
            "response_guidelines",
            "security_privacy",
            "services_backend",
            "system_architecture",
            "troubleshooting_faq",
        ];
        for cat in &expected {
            assert!(
                cats.contains(&cat.to_string()),
                "Missing expected category: {}",
                cat
            );
        }
    }

    #[test]
    fn test_knowledge_base_engines_catalog() {
        let entry = DefaultKnowledgeBase::get_entry("engines_catalog");
        assert!(entry.is_some(), "engines_catalog must exist");
        let e = entry.unwrap();
        assert_eq!(e.version, "v30.0.0");
        let engines = e
            .content
            .get("engines")
            .expect("engines_catalog must have 'engines' field")
            .as_array()
            .expect("'engines' must be an array");
        assert!(
            engines.len() >= 10,
            "Must have at least 10 engines catalogued, found {}",
            engines.len()
        );
    }

    #[test]
    fn test_knowledge_base_identity_profile() {
        let entry = DefaultKnowledgeBase::get_entry("identity_profile");
        assert!(entry.is_some(), "identity_profile must exist");
        let e = entry.unwrap();
        assert!(
            e.content.get("identity").is_some(),
            "identity_profile must have 'identity' field"
        );
    }

    #[test]
    fn test_knowledge_base_system_architecture() {
        let entry = DefaultKnowledgeBase::get_entry("system_architecture");
        assert!(entry.is_some(), "system_architecture must exist");
        let e = entry.unwrap();
        let arch = e
            .content
            .get("architecture")
            .expect("Must have 'architecture'");
        assert!(
            arch.get("rings").is_some(),
            "Architecture must define 4 rings"
        );
        assert!(
            arch.get("ipc_contract").is_some(),
            "Architecture must define IPC contract"
        );
    }

    #[test]
    fn test_knowledge_base_ipc_commands_catalog() {
        let entry = DefaultKnowledgeBase::get_entry("ipc_commands_catalog");
        assert!(entry.is_some(), "ipc_commands_catalog must exist");
        let e = entry.unwrap();
        let cats = e
            .content
            .get("categories")
            .expect("Must have 'categories'");
        assert!(
            cats.get("ai_chat").is_some(),
            "Must have ai_chat commands"
        );
        assert!(
            cats.get("memory").is_some(),
            "Must have memory commands"
        );
        assert!(
            cats.get("singularity").is_some(),
            "Must have singularity commands"
        );
    }
}
