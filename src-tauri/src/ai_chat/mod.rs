// TITANE∞ v12 - AI Chat Entry Point
// Integration point for AI Chat and Voice Mode

mod ai;
mod audio;
mod memory;
mod modules;
mod tts;

pub mod ai_chat_commands;

use ai_chat_commands::AIChatState;

pub fn setup_ai_chat() -> AIChatState {
    log::info!("Setting up AI Chat & Voice Mode...");
    
    // Load environment variables
    dotenv::dotenv().ok();
    
    let state = AIChatState::new();
    
    log::info!("✅ AI Chat & Voice Mode initialized");
    
    state
}

pub fn get_ai_commands() -> Vec<Box<dyn tauri::Invoker>> {
    vec![
        tauri::generate_handler![
            ai_chat_commands::ai_query,
            ai_chat_commands::speak,
            ai_chat_commands::start_recording,
            ai_chat_commands::stop_recording,
            ai_chat_commands::transcribe_audio,
            ai_chat_commands::create_conversation,
            ai_chat_commands::load_conversation,
            ai_chat_commands::list_conversations,
            ai_chat_commands::delete_conversation,
            ai_chat_commands::clear_all_memory,
            ai_chat_commands::check_connection,
            ai_chat_commands::health_check,
            ai_chat_commands::get_vad_state,
            ai_chat_commands::get_module_status,
        ],
    ]
}
