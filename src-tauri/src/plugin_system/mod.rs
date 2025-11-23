// Plugin System Module
// Infrastructure modulaire pour cores extensibles

pub mod core_module;
pub mod core_trait; // Simplified trait for Phase 2
pub mod registry;
pub mod orchestrator;
pub mod profiles;
pub mod event_bus;
pub mod cores;
pub mod core_system;

pub use core_module::*;
pub use core_trait::*;
pub use registry::*;
pub use orchestrator::*;
pub use profiles::*;
pub use event_bus::*;
pub use cores::*;
pub use core_system::*;
