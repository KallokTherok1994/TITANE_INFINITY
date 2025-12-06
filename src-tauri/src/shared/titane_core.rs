// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — TITANE CORE (Compatibility Bridge)
//   Unified core structure bridging v12 legacy with v14 architecture
// ═══════════════════════════════════════════════════════════════

use crate::core::legacy::{HarmoniaCore, HeliosCore, MemoryCore, NexusCore, SentinelCore};
use crate::shared::types::ModuleHealth;
use std::sync::{Arc, Mutex};

/// Macro for safe mutex locking with auto-recovery
macro_rules! lock_or_recover {
    ($mutex:expr) => {
        $mutex.lock().unwrap_or_else(|poisoned| {
            log::error!("[TitaneCore] CRITICAL: Mutex poisoned, recovering...");
            poisoned.into_inner()
        })
    };
}


/// TitaneCore - Main system core coordinating all modules
/// This bridges v12 legacy architecture with v14 SingularityEngine
#[derive(Clone)]
pub struct TitaneCore {
    /// Helios module (vitals & system monitoring)
    pub helios: Arc<Mutex<HeliosCore>>,

    /// Nexus module (cognitive coordination)
    pub nexus: Arc<Mutex<NexusCore>>,

    /// Memory module (persistent storage)
    pub memory: Arc<Mutex<MemoryCore>>,

    /// Harmonia module (harmony & balance)
    pub harmonia: Arc<Mutex<HarmoniaCore>>,

    /// Sentinel module (security & monitoring)
    pub sentinel: Arc<Mutex<SentinelCore>>,
}

impl Default for TitaneCore {
    fn default() -> Self {
        Self::new()
    }
}

impl TitaneCore {
    /// Create new TitaneCore instance
    pub fn new() -> Self {
        Self {
            helios: Arc::new(Mutex::new(HeliosCore::new())),
            nexus: Arc::new(Mutex::new(NexusCore::new())),
            memory: Arc::new(Mutex::new(MemoryCore::new())),
            harmonia: Arc::new(Mutex::new(HarmoniaCore::new())),
            sentinel: Arc::new(Mutex::new(SentinelCore::new())),
        }
    }

    /// Get health status of all modules
    pub fn health(&self) -> Vec<ModuleHealth> {
        vec![
            self.helios_health(),
            self.nexus_health(),
            self.memory_health(),
            self.harmonia_health(),
            self.sentinel_health(),
        ]
    }

    fn helios_health(&self) -> ModuleHealth {
        let helios = lock_or_recover!(self.helios);
        ModuleHealth {
            name: "Helios".to_string(),
            status: helios.health(),
            uptime: helios.uptime(),
            last_tick: helios.last_tick(),
            message: "System vitals monitoring".to_string(),
        }
    }

    fn nexus_health(&self) -> ModuleHealth {
        let nexus = lock_or_recover!(self.nexus);
        ModuleHealth {
            name: "Nexus".to_string(),
            status: nexus.health(),
            uptime: nexus.uptime(),
            last_tick: nexus.last_tick(),
            message: "Cognitive coordination".to_string(),
        }
    }

    fn memory_health(&self) -> ModuleHealth {
        let memory = lock_or_recover!(self.memory);
        ModuleHealth {
            name: "Memory".to_string(),
            status: memory.health(),
            uptime: memory.uptime(),
            last_tick: memory.last_tick(),
            message: "Persistent memory storage".to_string(),
        }
    }

    fn harmonia_health(&self) -> ModuleHealth {
        let harmonia = lock_or_recover!(self.harmonia);
        ModuleHealth {
            name: "Harmonia".to_string(),
            status: harmonia.health(),
            uptime: harmonia.uptime(),
            last_tick: harmonia.last_tick(),
            message: "System harmony & balance".to_string(),
        }
    }

    fn sentinel_health(&self) -> ModuleHealth {
        let sentinel = lock_or_recover!(self.sentinel);
        ModuleHealth {
            name: "Sentinel".to_string(),
            status: sentinel.health(),
            uptime: sentinel.uptime(),
            last_tick: sentinel.last_tick(),
            message: "Security monitoring".to_string(),
        }
    }

    /// Initialize all modules
    pub async fn init(&mut self) -> Result<(), String> {
        log::info!("🚀 TitaneCore initializing...");

        // Initialize all modules (extract guards before await to avoid holding locks)
        {
            let mut helios = lock_or_recover!(self.helios);
            helios.init().await?;
        }
        {
            let mut nexus = lock_or_recover!(self.nexus);
            nexus.init().await?;
        }
        {
            let mut memory = lock_or_recover!(self.memory);
            memory.init().await?;
        }
        {
            let mut harmonia = lock_or_recover!(self.harmonia);
            harmonia.init().await?;
        }
        {
            let mut sentinel = lock_or_recover!(self.sentinel);
            sentinel.init().await?;
        }

        log::info!("✅ TitaneCore initialized successfully");
        Ok(())
    }

    /// Perform a system tick (update all modules)
    pub async fn tick(&mut self) -> Result<(), String> {
        // Each module updates independently (extract guards before await)
        {
            let mut helios = lock_or_recover!(self.helios);
            helios.tick().await?;
        }
        {
            let mut nexus = lock_or_recover!(self.nexus);
            nexus.tick().await?;
        }
        {
            let mut memory = lock_or_recover!(self.memory);
            memory.tick().await?;
        }
        {
            let mut harmonia = lock_or_recover!(self.harmonia);
            harmonia.tick().await?;
        }
        {
            let mut sentinel = lock_or_recover!(self.sentinel);
            sentinel.tick().await?;
        }

        Ok(())
    }
}
