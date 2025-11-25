// TITANE_INFINITY v∞ — Proprietary License
// © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.

// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v∞ — MAIN ENTRY POINT
//   Super-Prompts H→N: Security, Permissions, Encryption, Time-Travel
// ═══════════════════════════════════════════════════════════════

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use titane_infinity::{mock_commands, secure_commands, time_commands};

#[tokio::main]
async fn main() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    println!("╔══════════════════════════════════════════════════════════════╗");
    println!("║     TITANE∞ v∞ — SECURED + ENCRYPTED + TIME-TRAVEL          ║");
    println!("║     Super-Prompts H, I, J, K, L, M, N Active                ║");
    println!("╚══════════════════════════════════════════════════════════════╝");

    log::info!("🔐 Starting TITANE∞ v∞ Security System...");

    // ═══════════════════════════════════════════════════════════════
    // PRE-BOOT VALIDATION (Super-Prompt L4)
    // ═══════════════════════════════════════════════════════════════
    match titane_infinity::security::pre_boot_validation::validate_pre_boot().await {
        Ok(validation) => {
            if validation.is_valid() {
                log::info!("✅ Pre-boot validation passed");
            } else {
                log::error!("❌ Pre-boot validation failed - aborting");
                log::error!("{}", validation.report());
                std::process::exit(1);
            }
        }
        Err(e) => {
            log::error!("❌ Pre-boot validation error: {}", e);
            std::process::exit(1);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZE SECURITY SYSTEM (Super-Prompts J, K)
    // ═══════════════════════════════════════════════════════════════
    use titane_infinity::security::encryption;
    use titane_infinity::security::sandbox;

    if let Err(e) = encryption::initialize_crypto_engine().await {
        log::error!("❌ Failed to initialize crypto engine: {}", e);
        std::process::exit(1);
    }

    // Initialize VaultEngine with master key (Super-Prompt J3)
    let master_key = encryption::get_master_key().await
        .expect("Master key not initialized");
    if let Err(e) = titane_infinity::memory_persistence::init_vault_engine(&master_key).await {
        log::error!("❌ Failed to initialize VaultEngine: {}", e);
        std::process::exit(1);
    }

    if let Err(e) = sandbox::initialize_sandbox().await {
        log::error!("❌ Failed to initialize sandbox: {}", e);
        std::process::exit(1);
    }

    log::info!("✅ Security System initialized");
    log::info!("✅ VaultEngine: Memory encryption ready");
    log::info!("✅ Permissions: ROOT/SYSTEM/IA/USER active");
    log::info!("✅ Encryption: AES-256-GCM + Ed25519");
    log::info!("✅ Sandbox: /userdata/imports/ ready");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|_app| {
            log::info!("✅ Tauri Builder initialized");

            // Auto-open DevTools in debug mode
            #[cfg(debug_assertions)]
            {
                if let Some(window) = _app.get_webview_window("main") {
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

            // ═══════════════════════════════════════════════════════════════
            // SECURE COMMANDS v∞ - Super-Prompts H, I, J, K
            // ═══════════════════════════════════════════════════════════════
            secure_commands::secure_import_file,
            secure_commands::secure_read_file,
            secure_commands::secure_list_files,
            secure_commands::secure_delete_file,
            secure_commands::get_permission_audit,
            secure_commands::validate_chat_message,
            secure_commands::check_system_integrity,

            // ═══════════════════════════════════════════════════════════════
            // TIME-TRAVEL COMMANDS v∞ - Super-Prompt N
            // ═══════════════════════════════════════════════════════════════
            time_commands::list_snapshots,
            time_commands::get_travel_stats,
            time_commands::restore_snapshot,
            time_commands::delete_snapshot,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    log::info!("TITANE∞ v∞ shutdown - Security System offline");
}
