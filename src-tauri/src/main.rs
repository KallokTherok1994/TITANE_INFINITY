// TITANE_INFINITY v14 — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — MAIN ENTRY POINT (MOCK BACKEND MODE)
//   Frontend-only development with mocked backend commands
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use titane_infinity::mock_commands;
use tauri::Manager;

fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    println!("╔══════════════════════════════════════════════════════════════╗");
    println!("║     TITANE∞ v18 — MOCK BACKEND MODE + CHAT AI              ║");
    println!("║     Frontend Development - Mocked Data                      ║");
    println!("╚══════════════════════════════════════════════════════════════╝");

    log::info!("Starting TITANE∞ v18 in MOCK BACKEND mode");
    log::info!("All backend commands return mocked data for frontend development");
    log::info!("Chat AI mock orchestrator: 8 commands registered");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            log::info!("✅ Mock Backend initialized");
            log::info!("✅ Dialog plugin registered");

            // Auto-open DevTools in debug mode
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    log::info!("DevTools opened automatically (debug mode)");
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // ═══════════════════════════════════════════════════════════════
            // MOCK COMMANDS - Frontend Development
            // ═══════════════════════════════════════════════════════════════

            // Helios - System Monitoring
            mock_commands::get_helios_state,
            mock_commands::get_system_health,

            // Memory - Storage & Timeline
            mock_commands::get_memory_state,
            mock_commands::write_snapshot,
            mock_commands::read_snapshot,
            mock_commands::write_log,
            mock_commands::read_logs,
            mock_commands::add_timeline_event,
            mock_commands::get_timeline,
            mock_commands::get_active_projects,
            mock_commands::get_recent_decisions,
            mock_commands::get_knowledge,
            mock_commands::get_active_rituals,
            mock_commands::save_chat_interaction,

            // Nexus - Validation
            mock_commands::validate_nexus,
            mock_commands::get_nexus_graph,

            // Singularity - Unity State
            mock_commands::singularity_get_full_state,
            mock_commands::singularity_get_physical,
            mock_commands::singularity_get_cognitive,
            mock_commands::singularity_get_global_coherence,
            mock_commands::singularity_is_critical,
            mock_commands::get_singularity_state,
            mock_commands::sync_singularity,
            mock_commands::singularity_get_symbolic,
            mock_commands::singularity_get_adaptive,
            mock_commands::singularity_get_meta,

            // DevTools - Logging & Debug
            mock_commands::get_logs,
            mock_commands::clear_logs,
            mock_commands::get_system_info,

            // Helios + Memory - Additional Metrics (v∞)
            mock_commands::get_helios_metrics,
            mock_commands::memory_get_state,

            // Experience - XP & Knowledge Domains (v24)
            mock_commands::experience_get_state,
            mock_commands::experience_update_state,

            // Memory - File Ingestion (v24)
            mock_commands::memory_ingest_file,
            mock_commands::import_file,

            // Chat AI - Unified Command (v∞)
            mock_commands::chat_generate,
            mock_commands::upload_and_process_file,

            // Memory Persistence - v∞.C
            mock_commands::get_all_files,
            mock_commands::get_files_by_category,
            mock_commands::clear_memory,
            mock_commands::store_file,

            // Chat AI - Mock Orchestrator (v18)
            mock_commands::chat_send_message,
            mock_commands::chat_get_providers_status,
            mock_commands::chat_check_providers,
            mock_commands::chat_create_conversation,
            mock_commands::chat_get_conversation,
            mock_commands::chat_delete_conversation,
            mock_commands::chat_set_gemini_key,
            mock_commands::chat_stream_message,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    log::info!("TITANE∞ v14 Mock Backend shutdown");
}
