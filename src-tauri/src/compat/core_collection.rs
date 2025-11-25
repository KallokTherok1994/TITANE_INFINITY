// ═══════════════════════════════════════════════════════════════
//   TITANE∞ v14 — CORE COLLECTION BRIDGE
//   Compatibility layer v12 ↔ v14
// ═══════════════════════════════════════════════════════════════

use crate::core::{legacy::*, SingularityEngine};
use std::sync::{Arc, Mutex};

/// CoreCollection - Bridge between v12 API and v14 SingularityEngine
///
/// This provides backward compatibility for legacy code that expects
/// individual module cores (Helios, Nexus, Harmonia, Sentinel)
/// while actually using the unified SingularityEngine v14 underneath.
pub struct CoreCollection {
    /// Reference to unified SingularityEngine v14
    engine: Arc<Mutex<SingularityEngine>>,

    /// Legacy adapters (lightweight wrappers)
    helios_adapter: Arc<Mutex<HeliosCore>>,
    nexus_adapter: Arc<Mutex<NexusCore>>,
    harmonia_adapter: Arc<Mutex<HarmoniaCore>>,
    sentinel_adapter: Arc<Mutex<SentinelCore>>,
    memory_adapter: Arc<Mutex<MemoryCore>>,
}

impl CoreCollection {
    /// Create new CoreCollection with SingularityEngine
    pub fn new(engine: Arc<Mutex<SingularityEngine>>) -> Self {
        Self {
            engine,
            helios_adapter: Arc::new(Mutex::new(HeliosCore::new())),
            nexus_adapter: Arc::new(Mutex::new(NexusCore::new())),
            harmonia_adapter: Arc::new(Mutex::new(HarmoniaCore::new())),
            sentinel_adapter: Arc::new(Mutex::new(SentinelCore::new())),
            memory_adapter: Arc::new(Mutex::new(MemoryCore::new())),
        }
    }

    /// Get legacy Helios adapter
    ///
    /// Note: This returns a lightweight adapter. For v14 features,
    /// use engine() to access the full SingularityEngine.
    pub fn helios(&self) -> Arc<Mutex<HeliosCore>> {
        Arc::clone(&self.helios_adapter)
    }

    /// Get legacy Nexus adapter
    pub fn nexus(&self) -> Arc<Mutex<NexusCore>> {
        Arc::clone(&self.nexus_adapter)
    }

    /// Get legacy Harmonia adapter
    pub fn harmonia(&self) -> Arc<Mutex<HarmoniaCore>> {
        Arc::clone(&self.harmonia_adapter)
    }

    /// Get legacy Sentinel adapter
    pub fn sentinel(&self) -> Arc<Mutex<SentinelCore>> {
        Arc::clone(&self.sentinel_adapter)
    }

    /// Get legacy Memory adapter
    pub fn memory(&self) -> Arc<Mutex<MemoryCore>> {
        Arc::clone(&self.memory_adapter)
    }

    /// Get unified SingularityEngine (v14 API)
    ///
    /// Prefer this over legacy adapters for new code.
    pub fn engine(&self) -> Arc<Mutex<SingularityEngine>> {
        Arc::clone(&self.engine)
    }

    /// Sync all modules to SingularityEngine state
    ///
    /// Call this periodically to ensure legacy adapters reflect
    /// the current state of the unified engine.
    pub async fn sync_to_engine(&self) -> Result<(), String> {
        let mut engine = self
            .engine
            .lock()
            .map_err(|e| format!("Failed to lock engine: {}", e))?;

        engine
            .sync()
            .await
            .map_err(|e| format!("Failed to sync engine: {:?}", e))?;

        Ok(())
    }
}

impl Default for CoreCollection {
    fn default() -> Self {
        let engine = Arc::new(Mutex::new(SingularityEngine::new()));
        Self::new(engine)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_core_collection_creation() {
        let engine = Arc::new(Mutex::new(SingularityEngine::new()));
        let collection = CoreCollection::new(engine);

        // Verify all adapters are accessible
        let _helios = collection.helios();
        let _nexus = collection.nexus();
        let _harmonia = collection.harmonia();
        let _sentinel = collection.sentinel();
        let _memory = collection.memory();
    }

    #[tokio::test]
    async fn test_sync_to_engine() {
        let collection = CoreCollection::default();

        // Initialize engine
        {
            let mut engine = collection.engine().lock().unwrap();
            engine.init().await.unwrap();
        }

        // Test sync
        let result = collection.sync_to_engine().await;
        assert!(result.is_ok());
    }
}
