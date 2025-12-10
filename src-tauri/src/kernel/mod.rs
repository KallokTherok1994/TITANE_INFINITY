// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL MODULE
//   OS Kernel — Runtime, Scheduler, Core Loop & Governance
//   Super Prompt #11: Cognitive Operating System Foundation
// ═══════════════════════════════════════════════════════════════

// Core Kernel modules
pub mod core_loop;
pub mod events;
pub mod governance;
pub mod integrations;
pub mod kernel_state;
pub mod priorities;
pub mod resources;
pub mod runtime;
pub mod scheduler;
pub mod signals;
pub mod watchdog;

// Re-exports — Runtime
pub use runtime::{KernelRuntime, RuntimeConfig};

// Re-exports — Scheduler
pub use priorities::CognitivePriority;
pub use scheduler::{CognitiveScheduler, EngineOutput, SchedulerJob};

// Re-exports — Core Loop
pub use core_loop::{CoreLoop, CoreLoopConfig};

// Re-exports — Signals
pub use signals::{KernelSignal, SignalBus};

// Re-exports — State
pub use kernel_state::{EngineStatus, KernelLoad, KernelSnapshot, KernelState};

// Re-exports — Watchdog
pub use watchdog::{KernelWatchdog, WatchdogConfig};

// Re-exports — Governance
pub use governance::{GovernanceEngine, KernelPolicy};

// Re-exports — Events
pub use events::{EventPriority, KernelEvent};

// Re-exports — Resources
pub use resources::{ResourceLimits, ResourceManager};

// Re-exports — Integrations
pub use integrations::{
    MemoryHealthSnapshot, MemoryKernelBridge, MemoryOperation, MemoryResult, MemoryStats,
    OmegaKernelBridge, OmegaRequest, OmegaResponse, OmegaStats,
};

// ═══════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════

pub const KERNEL_VERSION: &str = "v20Ω.0";
pub const KERNEL_CODENAME: &str = "Cognitive OS Kernel";
