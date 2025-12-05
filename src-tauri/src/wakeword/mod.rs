// src-tauri/src/wakeword/mod.rs

pub mod listener;
pub mod engine;

pub use listener::WakewordListener;
pub use engine::WakewordEngine;
