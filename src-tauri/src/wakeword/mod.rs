// src-tauri/src/wakeword/mod.rs

pub mod engine;
pub mod listener;

pub use engine::WakewordEngine;
pub use listener::WakewordListener;
