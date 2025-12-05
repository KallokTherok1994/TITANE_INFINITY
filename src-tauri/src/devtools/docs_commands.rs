/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TITANE∞ — DOCS ENGINE COMMANDS
 * Commandes Tauri pour la documentation embarquée
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

use super::docs_engine::{CommandDoc, CommandCategory, DocsRegistry, DOCS_ENGINE};

/// Rechercher dans la documentation
#[tauri::command]
pub fn titan_docs_search(query: String) -> Vec<CommandDoc> {
    let engine = DOCS_ENGINE.read().unwrap();
    engine.search(&query).into_iter().cloned().collect()
}

/// Obtenir la documentation d'une commande
#[tauri::command]
pub fn titan_docs_get(command_name: String) -> Option<CommandDoc> {
    let engine = DOCS_ENGINE.read().unwrap();
    engine.get(&command_name).cloned()
}

/// Lister toutes les commandes
#[tauri::command]
pub fn titan_docs_list(category: Option<String>) -> Vec<CommandDoc> {
    let engine = DOCS_ENGINE.read().unwrap();

    let cat = category.and_then(|c| {
        match c.to_lowercase().as_str() {
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
        }
    });

    engine.list(cat).into_iter().cloned().collect()
}

/// Lister les commandes d'un module
#[tauri::command]
pub fn titan_docs_list_by_module(module: String) -> Vec<CommandDoc> {
    let engine = DOCS_ENGINE.read().unwrap();
    engine.list_by_module(&module).into_iter().cloned().collect()
}

/// Obtenir le registre complet
#[tauri::command]
pub fn titan_docs_registry() -> DocsRegistry {
    let engine = DOCS_ENGINE.read().unwrap();
    engine.get_registry().clone()
}

/// Générer la documentation Markdown
#[tauri::command]
pub fn titan_docs_generate_markdown() -> String {
    let engine = DOCS_ENGINE.read().unwrap();
    engine.generate_markdown()
}
