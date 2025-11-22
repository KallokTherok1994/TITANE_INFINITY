// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — MAIN ENTRY POINT
//   Backend Architecture Refactor - Clean, Modular, Performant
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;
mod types;
mod services;
mod core;
mod engine;
mod api;
mod app;
mod system;
mod shared;

use app::setup::TitaneApp;
use tauri::Manager;
use std::sync::Mutex;
use system::persona_engine::PersonaEngine;

fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    
    println!(">>> TITANE∞ BACKEND STARTING...");
    
    utils::log_info("Main", &format!("Starting {} v{}", utils::APP_NAME, utils::APP_VERSION));
    utils::log_info("Main", utils::APP_DESCRIPTION);
    
    tauri::Builder::default()
        .setup(|app| {
            // Get app data directory
            let app_data_dir = app.path().app_data_dir()
                .map_err(|e| format!("Failed to get app data dir: {}", e))?;
            
            // Initialize TITANE∞
            let titane_app = TitaneApp::new(app_data_dir)
                .map_err(|e| format!("Failed to initialize TITANE: {}", e))?;
            
            // Register core modules as state
            app.manage(titane_app.helios);
            app.manage(titane_app.nexus);
            app.manage(titane_app.harmonia);
            app.manage(titane_app.sentinel);
            app.manage(titane_app.memory);
            app.manage(titane_app.evolution);
            
            // 🌟 Initialize Persona Engine v24
            let persona_engine = PersonaEngine::new();
            app.manage(Mutex::new(persona_engine));
            utils::log_info("Main", "Persona Engine v24 initialized ✅");
            
            utils::log_info("Main", "TITANE∞ Backend ready ✅");
            println!(">>> TITANE∞ BACKEND INITIALIZED SUCCESSFULLY");
            
            // 🔧 AUTO-OPEN DEVTOOLS (Debug mode)
            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    utils::log_info("Main", "DevTools opened automatically (debug mode)");
                    println!(">>> DEVTOOLS OPENED");
                }
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Core v17.2.0 commands
            api::get_helios_state,
            api::get_system_health,
            api::get_memory_state,
            api::write_snapshot,
            api::read_snapshot,
            api::write_log,
            api::read_logs,
            api::add_timeline_event,
            api::run_evolution,
            api::get_evolution_state,
            api::quick_health_check,
            api::get_full_system_state,
            api::get_nexus_state,
            api::get_harmonia_state,
            api::get_sentinel_state,
            // Legacy compatibility commands
            api::memory_save_entry,
            api::memory_clear,
            api::delete_conversation,
            api::clear_all_memory,
            api::meta_mode_reset,
            api::speak,
            api::start_recording,
            api::stop_recording,
            api::get_system_status,
            api::harmonia_get_flows,
            api::nexus_get_graph,
            api::helios_get_metrics,
            api::memory_get_state,
            // 🌟 Persona Engine v24 commands
            system::persona_engine::commands::persona_initialize,
            system::persona_engine::commands::persona_get_state,
            system::persona_engine::commands::persona_update,
            system::persona_engine::commands::persona_react,
            system::persona_engine::commands::persona_reset,
            system::persona_engine::commands::persona_get_multipliers,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
