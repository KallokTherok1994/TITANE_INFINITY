// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v17.2.0 — APP: MAIN ENTRY POINT
//   Tauri Application Bootstrap
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;
mod types;
mod services;
mod core;
mod engine;
mod api;
mod app;

use app::setup::TitaneApp;
use tauri::Manager;

fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    
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
            
            utils::log_info("Main", "TITANE∞ Backend ready");
            
            Ok(())
        })
        .invoke_handler(api::get_handlers())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
