// src-tauri/src/duplex/mod.rs

pub mod audio_input;
pub mod audio_output;
pub mod buffer;
pub mod pipeline;
pub mod sync;

pub use audio_input::AudioInput;
pub use audio_output::AudioOutput;
pub use buffer::CircularBuffer;
pub use pipeline::DuplexPipeline;
pub use sync::DuplexSync;
