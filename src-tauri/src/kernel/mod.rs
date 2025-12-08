// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v20Ω — KERNEL MODULE
//   OS Kernel — Runtime, Scheduler, Core Loop & Governance
//   Super Prompt #11: Cognitive Operating System Foundation
// ═══════════════════════════════════════════════════════════════

// Core Kernel modules
pub mod runtime;
pub mod scheduler;
pub mod core_loop;
pub mod signals;
pub mod resources;
pub mod priorities;
pub mod kernel_state;
pub mod watchdog;
pub mod governance;
pub mod events;
pub mod integrations;

// Re-exports — Runtime
pub use runtime::{KernelRuntime, RuntimeConfig};

// Re-exports — Scheduler
pub use scheduler::{CognitiveScheduler, SchedulerJob, EngineOutput};
pub use priorities::CognitivePriority;

// Re-exports — Core Loop
pub use core_loop::{CoreLoop, CoreLoopConfig};

// Re-exports — Signals
pub use signals::{KernelSignal, SignalBus};

// Re-exports — State
pub use kernel_state::{KernelState, KernelLoad, EngineStatus, KernelSnapshot};

// Re-exports — Watchdog
pub use watchdog::{KernelWatchdog, WatchdogConfig};

// Re-exports — Governance
pub use governance::{KernelPolicy, GovernanceEngine};

// Re-exports — Events
pub use events::{KernelEvent, EventPriority};

// Re-exports — Resources
pub use resources::{ResourceManager, ResourceLimits};

// Re-exports — Integrations
pub use integrations::{
    OmegaKernelBridge, OmegaRequest, OmegaResponse, OmegaStats,
    MemoryKernelBridge, MemoryOperation, MemoryResult, MemoryHealthSnapshot, MemoryStats,
};

// ═══════════════════════════════════════════════════════════════
// VERSION
// ═══════════════════════════════════════════════════════════════

pub const KERNEL_VERSION: &str = "v20Ω.0";
pub const KERNEL_CODENAME: &str = "Cognitive OS Kernel";
