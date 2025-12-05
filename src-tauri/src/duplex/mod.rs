// src-tauri/src/duplex/mod.rs

pub mod audio_input;
pub mod audio_output;
pub mod pipeline;
pub mod buffer;
pub mod sync;

pub use audio_input::AudioInput;
pub use audio_output::AudioOutput;
pub use pipeline::DuplexPipeline;
pub use buffer::CircularBuffer;
pub use sync::DuplexSync;
