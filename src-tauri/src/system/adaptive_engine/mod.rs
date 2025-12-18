// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Moteur Adaptatif Intégral (MAI)                              ║
// ║ Système d'analyse et régulation adaptative multi-dimensionnelle             ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

#![allow(dead_code)] // Module architecture - scheduler integration pending

mod regulation;
use crate::types::shared::{HealthStatus, ModuleHealthInfo as ModuleHealth};
type TitaneResult<T> = Result<T, String>;
use crate::shared::utils::current_timestamp;
pub use regulation::AdaptiveState;

const MODULE_NAME: &str = "AdaptiveEngine";
/// Module MAI - Moteur Adaptatif Intégral
#[derive(Debug)]
pub struct AdaptiveEngineModule {
    pub initialized: bool,
    pub last_update: u64,
    pub adaptability: f32,
    #[allow(dead_code)]
    pub predicted_load: f32,
    pub stability: f32,
    pub trend: f32,
    state: AdaptiveState,
    start_time: u64,
}
impl AdaptiveEngineModule {
    /// Initialize AdaptiveEngine module
    pub fn init() -> TitaneResult<Self> {
        log::info!(
            "🧠 [{}] Initializing Moteur Adaptatif Intégral",
            MODULE_NAME
        );

        let state = AdaptiveState::new();
        Ok(Self {
            initialized: true,
            last_update: current_timestamp(),
            adaptability: state.adaptability,
            predicted_load: state.predicted_load,
            stability: state.stability,
            trend: state.trend,
            state,
            start_time: current_timestamp(),
        })
    }

    /// Tick - Analyse et régulation adaptative
    ///
    /// Cette fonction est appelée périodiquement par le scheduler
    /// et effectue l'analyse complète du système pour une régulation adaptative
    pub fn tick(&mut self) -> TitaneResult<()> {
        self.last_update = current_timestamp();
        self.state.last_update = self.last_update;
        Ok(())
    }

    // tick_with_modules removed - not used in v11 architecture
    // Module coordination handled directly by TitaneCore::tick() in main.rs

    /// Get module health
    pub fn health(&self) -> ModuleHealth {
        let current = current_timestamp();
        let uptime = current.saturating_sub(self.start_time);
        let status = if !self.initialized {
            HealthStatus::Offline
        } else if self.stability < 30.0 {
            HealthStatus::Critical
        } else if self.stability < 60.0 {
            HealthStatus::Degraded
        } else {
            HealthStatus::Healthy
        };

        ModuleHealth {
            name: MODULE_NAME.to_string(),
            status,
            uptime,
            last_tick: self.last_update,
            message: format!(
                "Stability: {:.1}% | Adaptability: {:.2} | Trend: {:+.2}",
                self.stability, self.adaptability, self.trend
            ),
        }
    }
}
