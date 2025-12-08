// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Providers Module
//   SUPER PROMPT #8 — Common Provider Interface
// ═══════════════════════════════════════════════════════════════

pub mod claude;
pub mod openai;
pub mod local;
pub mod titane_engine;

use crate::ai::{AiRequest, AiResponse, AIError};
use async_trait::async_trait;

/// Trait commun pour tous les providers IA
#[async_trait]
pub trait AiProvider: Send + Sync {
    /// Génère une réponse IA
    async fn generate(&self, req: &AiRequest) -> Result<AiResponse, AIError>;

    /// Nom du provider
    fn name(&self) -> &'static str;

    /// Vérifie si le provider est disponible
    async fn is_available(&self) -> bool;

    /// Coût estimé par 1k tokens (pour optimisation)
    fn cost_per_1k_tokens(&self) -> f32;

    /// Latence moyenne en ms (pour routage)
    fn average_latency_ms(&self) -> u128;
}

/// Résultat standardisé d'un provider
pub type ProviderResult = Result<AiResponse, AIError>;
