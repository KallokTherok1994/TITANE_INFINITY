// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Adaptive Engine Regulation Module                            ║
// ║ Régulation douce et progressive des états adaptatifs                        ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// analysis module removed - AdaptiveReport not used in v11
/// État du moteur adaptatif
#[derive(Debug, Clone)]
pub struct AdaptiveState {
    /// Indique si le système est initialisé
    #[allow(dead_code)]
    pub initialized: bool,

    /// Stabilité du système (0.0 = instable, 1.0 = parfaitement stable)
    pub stability: f32,
    /// Capacité d'adaptation (0.0 = rigide, 1.0 = très adaptable)
    pub adaptability: f32,
    /// Charge prédite (0.0 = minimal, 1.0 = maximal)
    pub predicted_load: f32,
    /// Tendance générale (-1.0 = détérioration, 0.0 = stable, 1.0 = amélioration)
    pub trend: f32,
    /// Timestamp de la dernière mise à jour (ms)
    pub last_update: u64,
}
impl AdaptiveState {
    /// Crée un nouvel état avec des valeurs initiales optimales
    pub fn new() -> Self {
        Self {
            initialized: true,
            stability: 0.8,
            adaptability: 0.7,
            predicted_load: 0.3,
            trend: 0.0,
            last_update: 0,
        }
    }
}

// regulate() and helper functions removed - not used in v11 simplified architecture
// Future versions may re-enable advanced regulation with AdaptiveReport

// Tests disabled - require removed functions (regulate, smooth_transition, clamp, etc.)
// Re-enable when advanced regulation is implemented
