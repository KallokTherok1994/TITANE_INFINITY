/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ — DOCS ENGINE COMMANDS
 * Commandes Tauri pour la documentation embarquée
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
use super::docs_engine::{CommandCategory, CommandDoc, DocsRegistry, DOCS_ENGINE};

/// Macro for safe RwLock read access with auto-recovery
macro_rules! read_or_recover {
    ($rwlock:expr) => {
        $rwlock.read().unwrap_or_else(|poisoned| {
            log::error!("[DocsCommands] CRITICAL: RwLock poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}

/// Rechercher dans la documentation
#[tauri::command]
pub fn titan_docs_search(query: String) -> Vec<CommandDoc> {
    let engine = read_or_recover!(DOCS_ENGINE);
    engine.search(&query).into_iter().cloned().collect()
}

/// Obtenir la documentation d'une commande
#[tauri::command]
pub fn titan_docs_get(command_name: String) -> Option<CommandDoc> {
    let engine = read_or_recover!(DOCS_ENGINE);
    engine.get(&command_name).cloned()
}

/// Lister toutes les commandes
#[tauri::command]
pub fn titan_docs_list(category: Option<String>) -> Vec<CommandDoc> {
    let engine = read_or_recover!(DOCS_ENGINE);

    let cat = category.and_then(|c| match c.to_lowercase().as_str() {
        "state" => Some(CommandCategory::State),
        "memory" => Some(CommandCategory::Memory),
        "ai" => Some(CommandCategory::AI),
        "audio" => Some(CommandCategory::Audio),
        "filesystem" | "fs" => Some(CommandCategory::FileSystem),
        "security" => Some(CommandCategory::Security),
        "devtools" | "dev" => Some(CommandCategory::DevTools),
        "settings" => Some(CommandCategory::Settings),
        "metrics" => Some(CommandCategory::Metrics),
        "network" => Some(CommandCategory::Network),
        _ => None,
    });

    engine.list(cat).into_iter().cloned().collect()
}

/// Lister les commandes d'un module
#[tauri::command]
pub fn titan_docs_list_by_module(module: String) -> Vec<CommandDoc> {
    let engine = read_or_recover!(DOCS_ENGINE);
    engine
        .list_by_module(&module)
        .into_iter()
        .cloned()
        .collect()
}

/// Obtenir le registre complet
#[tauri::command]
pub fn titan_docs_registry() -> DocsRegistry {
    let engine = read_or_recover!(DOCS_ENGINE);
    engine.get_registry().clone()
}

/// Générer la documentation Markdown
#[tauri::command]
pub fn titan_docs_generate_markdown() -> String {
    let engine = read_or_recover!(DOCS_ENGINE);
    engine.generate_markdown()
}
