// ═══════════════════════════════════════════════════════════════════════════
//   TITANE∞ BOOT ORCHESTRATOR v∞
//   Super Prompt #4 - Phase 2: Boot Sequence Robuste
// ═══════════════════════════════════════════════════════════════════════════
//
// Séquence boot orchestrée:
// OS → Tauri → Security → Memory → Identity → Engines → UI
//
// Event TITANE_READY émis quand système complet ready
// Retry/timeout pour engines critiques
// Fallback graceful si engine échoue
//
// © 2025 Kevin Thibault / TITANE Team. Tous droits réservés.

use std::time::Duration;
use tokio::time::timeout;

/// Priorité boot engine
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum BootPriority {
    /// 🔥 CRITIQUE: Doit réussir ou app crash (Security, Memory, Identity, Singularity, Meta)
    Critical = 4,
    /// ⚡ HAUTE: Système dégradé si échec mais continue (Cognitive, Adaptive, Chat, Evolution, Watchdog)
    High = 3,
    /// 🟡 MOYENNE: Features optionnelles (Avatar, Voice, Reality, Narrative)
    Medium = 2,
    /// 🟢 BASSE: Nice-to-have (Cloud, QA, DevTools)
    Low = 1,
}

/// État boot d'un engine
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EngineBootState {
    /// Engine pas encore initialisé
    NotStarted,
    /// Engine en cours d'initialisation
    Initializing,
    /// Engine prêt (init réussi)
    Ready,
    /// Engine échoué (mais app continue si priorité < Critical)
    Failed(String),
    /// Engine en fallback mode (fonctionnement dégradé)
    FallbackMode,
}

/// Metadata d'un engine boot
#[derive(Debug, Clone)]
pub struct EngineBootInfo {
    pub name: String,
    pub priority: BootPriority,
    pub state: EngineBootState,
    pub init_duration_ms: Option<u64>,
    pub retry_count: u32,
    pub error_message: Option<String>,
}

impl EngineBootInfo {
    pub fn new(name: String, priority: BootPriority) -> Self {
        Self {
            name,
            priority,
            state: EngineBootState::NotStarted,
            init_duration_ms: None,
            retry_count: 0,
            error_message: None,
        }
    }

    pub fn is_ready(&self) -> bool {
        self.state == EngineBootState::Ready
    }

    pub fn is_failed(&self) -> bool {
        matches!(self.state, EngineBootState::Failed(_))
    }
}

/// Orchestrateur boot TITANE∞
pub struct BootOrchestrator {
    engines: Vec<EngineBootInfo>,
    total_duration_ms: u64,
    is_ready: bool,
}

impl BootOrchestrator {
    pub fn new() -> Self {
        Self {
            engines: Vec::new(),
            total_duration_ms: 0,
            is_ready: false,
        }
    }

    /// Enregistre un engine à initialiser
    pub fn register_engine(&mut self, name: String, priority: BootPriority) {
        self.engines.push(EngineBootInfo::new(name, priority));
    }

    /// Boot séquence complète avec retry et fallback
    pub async fn boot_sequence(&mut self) -> Result<(), String> {
        let start = std::time::Instant::now();

        log::info!("╔══════════════════════════════════════════════════════════════╗");
        log::info!("║     TITANE∞ BOOT ORCHESTRATOR v∞ — STARTING                 ║");
        log::info!("╚══════════════════════════════════════════════════════════════╝");

        // Trier engines par priorité (Critical → High → Medium → Low)
        self.engines.sort_by(|a, b| b.priority.cmp(&a.priority));

        // Clone engine names pour éviter borrow issues
        let engine_names: Vec<(String, BootPriority)> = self
            .engines
            .iter()
            .map(|e| (e.name.clone(), e.priority))
            .collect();

        for (engine_name, priority) in engine_names {
            log::info!(
                "🔄 Initializing {} (priority: {:?})...",
                engine_name,
                priority
            );

            // Find engine info
            let engine_info = self
                .engines
                .iter_mut()
                .find(|e| e.name == engine_name)
                .unwrap();

            engine_info.state = EngineBootState::Initializing;

            match Self::init_engine_with_retry_static(engine_info).await {
                Ok(duration_ms) => {
                    engine_info.state = EngineBootState::Ready;
                    engine_info.init_duration_ms = Some(duration_ms);
                    log::info!("✅ {} ready in {}ms", engine_info.name, duration_ms);
                }
                Err(e) => {
                    engine_info.error_message = Some(e.clone());

                    if engine_info.priority == BootPriority::Critical {
                        // Engine critique échoué → abort complet
                        engine_info.state = EngineBootState::Failed(e.clone());
                        log::error!(
                            "❌ CRITICAL ENGINE FAILED: {} - {}",
                            engine_info.name,
                            e
                        );
                        return Err(format!(
                            "Critical engine '{}' failed to initialize: {}",
                            engine_info.name, e
                        ));
                    } else {
                        // Engine non-critique échoué → fallback mode
                        engine_info.state = EngineBootState::FallbackMode;
                        log::warn!(
                            "⚠️ {} failed (non-critical), fallback mode: {}",
                            engine_info.name,
                            e
                        );
                    }
                }
            }
        }

        self.total_duration_ms = start.elapsed().as_millis() as u64;
        self.is_ready = true;

        log::info!("╔══════════════════════════════════════════════════════════════╗");
        log::info!("║     TITANE∞ BOOT COMPLETE — SYSTEM READY                    ║");
        log::info!("║     Total boot time: {}ms                                   ║", self.total_duration_ms);
        log::info!("╚══════════════════════════════════════════════════════════════╝");

        Ok(())
    }

    /// Initialise un engine avec retry et timeout
    async fn init_engine_with_retry_static(
        engine_info: &mut EngineBootInfo,
    ) -> Result<u64, String> {
        let max_retries = if engine_info.priority == BootPriority::Critical {
            3
        } else {
            1
        };

        let timeout_duration = match engine_info.priority {
            BootPriority::Critical => Duration::from_secs(30),
            BootPriority::High => Duration::from_secs(15),
            BootPriority::Medium => Duration::from_secs(10),
            BootPriority::Low => Duration::from_secs(5),
        };

        for attempt in 1..=max_retries {
            engine_info.retry_count = attempt;

            let start = std::time::Instant::now();

            // Timeout init engine
            // Timeout init engine
            let result = timeout(timeout_duration, Self::init_engine_static(&engine_info.name)).await;
            let duration_ms = start.elapsed().as_millis() as u64;

            match result {
                Ok(Ok(())) => {
                    return Ok(duration_ms);
                }
                Ok(Err(e)) => {
                    if attempt < max_retries {
                        log::warn!(
                            "⚠️ {} init attempt {}/{} failed: {} (retrying...)",
                            engine_info.name,
                            attempt,
                            max_retries,
                            e
                        );
                        tokio::time::sleep(Duration::from_millis(500)).await;
                    } else {
                        return Err(format!("Failed after {} attempts: {}", max_retries, e));
                    }
                }
                Err(_) => {
                    if attempt < max_retries {
                        log::warn!(
                            "⚠️ {} init attempt {}/{} timed out (retrying...)",
                            engine_info.name,
                            attempt,
                            max_retries
                        );
                        tokio::time::sleep(Duration::from_millis(500)).await;
                    } else {
                        return Err(format!(
                            "Timed out after {} attempts ({}s each)",
                            max_retries,
                            timeout_duration.as_secs()
                        ));
                    }
                }
            }
        }

        Err("Max retries exceeded".to_string())
    }

    /// Initialise un engine spécifique (à override par chaque engine)
    async fn init_engine_static(engine_name: &str) -> Result<(), String> {
        // Placeholder: chaque engine aura sa propre logique init
        // Pour l'instant, succès immédiat
        match engine_name {
            "SecuritySystem" => {
                // Simule init Security
                tokio::time::sleep(Duration::from_millis(100)).await;
                Ok(())
            }
            "MemoryEngine" => {
                // Simule init Memory
                tokio::time::sleep(Duration::from_millis(200)).await;
                Ok(())
            }
            "IdentityEngine" => {
                // Simule init Identity
                tokio::time::sleep(Duration::from_millis(150)).await;
                Ok(())
            }
            _ => {
                // Generic init
                tokio::time::sleep(Duration::from_millis(50)).await;
                Ok(())
            }
        }
    }

    /// Retourne état boot complet
    pub fn get_boot_report(&self) -> BootReport {
        let ready_count = self.engines.iter().filter(|e| e.is_ready()).count();
        let failed_count = self.engines.iter().filter(|e| e.is_failed()).count();
        let fallback_count = self
            .engines
            .iter()
            .filter(|e| e.state == EngineBootState::FallbackMode)
            .count();

        BootReport {
            is_ready: self.is_ready,
            total_duration_ms: self.total_duration_ms,
            total_engines: self.engines.len(),
            ready_engines: ready_count,
            failed_engines: failed_count,
            fallback_engines: fallback_count,
            engines: self.engines.clone(),
        }
    }
}

impl Default for BootOrchestrator {
    fn default() -> Self {
        Self::new()
    }
}

/// Rapport boot TITANE∞
#[derive(Debug, Clone)]
pub struct BootReport {
    pub is_ready: bool,
    pub total_duration_ms: u64,
    pub total_engines: usize,
    pub ready_engines: usize,
    pub failed_engines: usize,
    pub fallback_engines: usize,
    pub engines: Vec<EngineBootInfo>,
}

impl BootReport {
    pub fn is_healthy(&self) -> bool {
        self.is_ready && self.failed_engines == 0
    }

    pub fn summary(&self) -> String {
        format!(
            "TITANE∞ Boot Report: {} engines, {} ready, {} failed, {} fallback ({}ms)",
            self.total_engines,
            self.ready_engines,
            self.failed_engines,
            self.fallback_engines,
            self.total_duration_ms
        )
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_boot_orchestrator_success() {
        let mut orchestrator = BootOrchestrator::new();

        orchestrator.register_engine("SecuritySystem".to_string(), BootPriority::Critical);
        orchestrator.register_engine("MemoryEngine".to_string(), BootPriority::Critical);
        orchestrator.register_engine("IdentityEngine".to_string(), BootPriority::Critical);
        orchestrator.register_engine("ChatEngine".to_string(), BootPriority::High);

        let result = orchestrator.boot_sequence().await;
        assert!(result.is_ok());

        let report = orchestrator.get_boot_report();
        assert!(report.is_ready);
        assert_eq!(report.ready_engines, 4);
        assert_eq!(report.failed_engines, 0);
    }

    #[test]
    fn test_engine_boot_info() {
        let mut info = EngineBootInfo::new("TestEngine".to_string(), BootPriority::High);

        assert_eq!(info.state, EngineBootState::NotStarted);
        assert!(!info.is_ready());

        info.state = EngineBootState::Ready;
        assert!(info.is_ready());

        info.state = EngineBootState::Failed("Test error".to_string());
        assert!(info.is_failed());
    }

    #[test]
    fn test_boot_priority_ordering() {
        assert!(BootPriority::Critical > BootPriority::High);
        assert!(BootPriority::High > BootPriority::Medium);
        assert!(BootPriority::Medium > BootPriority::Low);
    }
}
