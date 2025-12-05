// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — TITANE CORE (Compatibility Bridge)
//   Unified core structure bridging v12 legacy with v14 architecture
// ═══════════════════════════════════════════════════════════════

use crate::core::legacy::{HarmoniaCore, HeliosCore, MemoryCore, NexusCore, SentinelCore};
use crate::shared::types::ModuleHealth;
use std::sync::{Arc, Mutex};

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
        let helios = self.helios.lock().unwrap();
        ModuleHealth {
            name: "Helios".to_string(),
            status: helios.health(),
            uptime: helios.uptime(),
            last_tick: helios.last_tick(),
            message: "System vitals monitoring".to_string(),
        }
    }

    fn nexus_health(&self) -> ModuleHealth {
        let nexus = self.nexus.lock().unwrap();
        ModuleHealth {
            name: "Nexus".to_string(),
            status: nexus.health(),
            uptime: nexus.uptime(),
            last_tick: nexus.last_tick(),
            message: "Cognitive coordination".to_string(),
        }
    }

    fn memory_health(&self) -> ModuleHealth {
        let memory = self.memory.lock().unwrap();
        ModuleHealth {
            name: "Memory".to_string(),
            status: memory.health(),
            uptime: memory.uptime(),
            last_tick: memory.last_tick(),
            message: "Persistent memory storage".to_string(),
        }
    }

    fn harmonia_health(&self) -> ModuleHealth {
        let harmonia = self.harmonia.lock().unwrap();
        ModuleHealth {
            name: "Harmonia".to_string(),
            status: harmonia.health(),
            uptime: harmonia.uptime(),
            last_tick: harmonia.last_tick(),
            message: "System harmony & balance".to_string(),
        }
    }

    fn sentinel_health(&self) -> ModuleHealth {
        let sentinel = self.sentinel.lock().unwrap();
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
            let mut helios = self.helios.lock().unwrap();
            helios.init().await?;
        }
        {
            let mut nexus = self.nexus.lock().unwrap();
            nexus.init().await?;
        }
        {
            let mut memory = self.memory.lock().unwrap();
            memory.init().await?;
        }
        {
            let mut harmonia = self.harmonia.lock().unwrap();
            harmonia.init().await?;
        }
        {
            let mut sentinel = self.sentinel.lock().unwrap();
            sentinel.init().await?;
        }

        log::info!("✅ TitaneCore initialized successfully");
        Ok(())
    }

    /// Perform a system tick (update all modules)
    pub async fn tick(&mut self) -> Result<(), String> {
        // Each module updates independently (extract guards before await)
        {
            let mut helios = self.helios.lock().unwrap();
            helios.tick().await?;
        }
        {
            let mut nexus = self.nexus.lock().unwrap();
            nexus.tick().await?;
        }
        {
            let mut memory = self.memory.lock().unwrap();
            memory.tick().await?;
        }
        {
            let mut harmonia = self.harmonia.lock().unwrap();
            harmonia.tick().await?;
        }
        {
            let mut sentinel = self.sentinel.lock().unwrap();
            sentinel.tick().await?;
        }

        Ok(())
    }
}
