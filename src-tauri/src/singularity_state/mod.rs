/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — SINGULARITY STATE BACKEND
 * État unifié backend Rust avec synchronisation Tauri
 * ═══════════════════════════════════════════════════════════════════
 *
 * Architecture 5 Layers:
 * - PhysicalLayer : Helios, health, metrics système
 * - CognitiveLayer: Memory, conversation, knowledge
 * - SymbolicLayer : Persona, archetypes, visual
 * - AdaptiveLayer : Evolution, learning, auto-heal
 * - MetaLayer     : UI, runtime, introspection
 *
 * Synchronisation:
 * - Backend Rust → Frontend React (Tauri events)
 * - Frontend React → Backend Rust (invoke commands)
 * - Persistence SQLite (état sauvegardé)
 */
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::RwLock;

// Sub-modules
pub mod commands;
pub mod layers;
pub mod persistence;
pub mod sync;

pub use layers::*;
pub use persistence::PersistenceLayer;
pub use sync::EventSyncLayer;

// ═══════════════════════════════════════════════════════════════════
// CORE STRUCTURES
// ═══════════════════════════════════════════════════════════════════

/// État unifié de la singularité (5 layers)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SingularityState {
    /// Layer 1: État physique (hardware, santé système)
    pub physical: PhysicalLayer,

    /// Layer 2: État cognitif (mémoire, AI, knowledge)
    pub cognitive: CognitiveLayer,

    /// Layer 3: État symbolique (persona, archetypes)
    pub symbolic: SymbolicLayer,

    /// Layer 4: État adaptatif (évolution, apprentissage)
    pub adaptive: AdaptiveLayer,

    /// Layer 5: État meta (UI, runtime, introspection)
    pub meta: MetaLayer,

    /// Timestamp dernière mise à jour (ms)
    pub timestamp: u64,

    /// Signature unique de l'état
    pub signature: String,
}

impl Default for SingularityState {
    fn default() -> Self {
        Self {
            physical: PhysicalLayer::default(),
            cognitive: CognitiveLayer::default(),
            symbolic: SymbolicLayer::default(),
            adaptive: AdaptiveLayer::default(),
            meta: MetaLayer::default(),
            timestamp: current_timestamp(),
            signature: generate_signature(),
        }
    }
}

impl SingularityState {
    /// Créer un nouvel état avec timestamp actuel
    pub fn new() -> Self {
        Self::default()
    }

    /// Mettre à jour le timestamp
    pub fn update_timestamp(&mut self) {
        self.timestamp = current_timestamp();
        self.signature = generate_signature();
    }

    /// Vérifier la cohérence globale (0-1)
    pub fn global_coherence(&self) -> f32 {
        let physical_score = self.physical.health_score();
        let cognitive_score = self.cognitive.coherence_score();
        let symbolic_score = self.symbolic.stability_score();
        let adaptive_score = self.adaptive.evolution_capacity;
        let meta_score = self.meta.runtime_health;

        (physical_score + cognitive_score + symbolic_score + adaptive_score + meta_score) / 5.0
    }

    /// Vérifier si système en état critique
    pub fn is_critical(&self) -> bool {
        self.global_coherence() < 0.3 || self.physical.is_critical()
    }
}

// ═══════════════════════════════════════════════════════════════════
// SINGULARITY ENGINE (Backend Manager)
// ═══════════════════════════════════════════════════════════════════

/// Moteur backend gérant l'état unifié
pub struct SingularityEngine {
    /// État partagé thread-safe
    state: Arc<RwLock<SingularityState>>,

    /// Layer de persistence (SQLite)
    persistence: PersistenceLayer,

    /// Layer de synchronisation (Tauri events)
    sync: EventSyncLayer,

    /// Handle Tauri pour émettre des événements
    app_handle: AppHandle,
}

impl SingularityEngine {
    /// Créer un nouveau moteur
    pub fn new(app_handle: AppHandle) -> Self {
        let state = Arc::new(RwLock::new(SingularityState::new()));
        let persistence = PersistenceLayer::new();
        let sync = EventSyncLayer::new(app_handle.clone());

        Self {
            state,
            persistence,
            sync,
            app_handle,
        }
    }

    /// Initialiser le moteur (charger état persisté)
    pub async fn initialize(&self) -> Result<(), String> {
        // Charger état depuis SQLite si disponible
        if let Ok(persisted_state) = self.persistence.load_state().await {
            let mut state = self.state.write().await;
            *state = persisted_state;
        }

        Ok(())
    }

    /// Obtenir l'état complet (lecture)
    pub async fn get_full_state(&self) -> SingularityState {
        self.state.read().await.clone()
    }

    /// Mettre à jour Physical Layer
    pub async fn update_physical(&self, physical: PhysicalLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.physical = physical;
        state.update_timestamp();

        // Émettre événement vers frontend
        self.sync.emit_physical_updated(&state.physical).await;

        // Persister (async, non-bloquant)
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Cognitive Layer
    pub async fn update_cognitive(&self, cognitive: CognitiveLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.cognitive = cognitive;
        state.update_timestamp();

        self.sync.emit_cognitive_updated(&state.cognitive).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Symbolic Layer
    pub async fn update_symbolic(&self, symbolic: SymbolicLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.symbolic = symbolic;
        state.update_timestamp();

        self.sync.emit_symbolic_updated(&state.symbolic).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Adaptive Layer
    pub async fn update_adaptive(&self, adaptive: AdaptiveLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.adaptive = adaptive;
        state.update_timestamp();

        self.sync.emit_adaptive_updated(&state.adaptive).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour Meta Layer
    pub async fn update_meta(&self, meta: MetaLayer) -> Result<(), String> {
        let mut state = self.state.write().await;
        state.meta = meta;
        state.update_timestamp();

        self.sync.emit_meta_updated(&state.meta).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Mettre à jour état complet (full sync)
    pub async fn update_full_state(&self, new_state: SingularityState) -> Result<(), String> {
        let mut state = self.state.write().await;
        *state = new_state;
        state.update_timestamp();

        // Émettre événement full sync
        self.sync.emit_full_state_updated(&state).await;
        self.persistence.save_state(&state).await.ok();

        Ok(())
    }

    /// Obtenir cohérence globale
    pub async fn get_global_coherence(&self) -> f32 {
        self.state.read().await.global_coherence()
    }

    /// Vérifier état critique
    pub async fn is_critical(&self) -> bool {
        self.state.read().await.is_critical()
    }

    /// Sauvegarder manuellement l'état
    pub async fn save_state(&self) -> Result<(), String> {
        let state = self.state.read().await;
        self.persistence.save_state(&state).await
    }

    /// Charger état depuis persistence
    pub async fn load_state(&self) -> Result<(), String> {
        let persisted_state = self.persistence.load_state().await?;
        let mut state = self.state.write().await;
        *state = persisted_state;
        Ok(())
    }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

fn current_timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
}

fn generate_signature() -> String {
    use rand::Rng;
    let timestamp = current_timestamp();
    let random: u32 = rand::thread_rng().gen();
    format!("TITANE-{}-{:x}", timestamp, random)
}

// ═══════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_singularity_state_creation() {
        let state = SingularityState::new();
        assert!(state.timestamp > 0);
        assert!(!state.signature.is_empty());
        assert!(state.global_coherence() >= 0.0);
        assert!(state.global_coherence() <= 1.0);
    }

    #[test]
    fn test_state_coherence() {
        let state = SingularityState::default();
        let coherence = state.global_coherence();
        assert!(coherence >= 0.0 && coherence <= 1.0);
    }

    #[tokio::test]
    async fn test_state_updates() {
        let state = Arc::new(RwLock::new(SingularityState::new()));

        {
            let mut s = state.write().await;
            s.physical.cpu_usage = 0.5;
            s.update_timestamp();
        }

        let s = state.read().await;
        assert_eq!(s.physical.cpu_usage, 0.5);
    }
}
