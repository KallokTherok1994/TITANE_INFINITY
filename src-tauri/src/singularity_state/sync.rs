/**
 * ═══════════════════════════════════════════════════════════════════
 * TITANE∞ v14 — EVENT SYNC LAYER (Tauri Events)
 * Synchronisation Rust → Frontend via événements Tauri
 * ═══════════════════════════════════════════════════════════════════
 */
use super::layers::*; // FIX v21: use super instead of crate when included from main.rs
use super::SingularityState;
use serde::Serialize;
use tauri::{AppHandle, Emitter}; // FIX v21: Emitter trait for emit() method

pub struct EventSyncLayer {
    app_handle: AppHandle,
}

impl EventSyncLayer {
    /// Créer un nouveau layer de synchronisation
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    /// Émettre événement Physical Layer updated
    pub async fn emit_physical_updated(&self, physical: &PhysicalLayer) {
        self.emit("singularity:physical:updated", physical).await;
    }

    /// Émettre événement Cognitive Layer updated
    pub async fn emit_cognitive_updated(&self, cognitive: &CognitiveLayer) {
        self.emit("singularity:cognitive:updated", cognitive).await;
    }

    /// Émettre événement Symbolic Layer updated
    pub async fn emit_symbolic_updated(&self, symbolic: &SymbolicLayer) {
        self.emit("singularity:symbolic:updated", symbolic).await;
    }

    /// Émettre événement Adaptive Layer updated
    pub async fn emit_adaptive_updated(&self, adaptive: &AdaptiveLayer) {
        self.emit("singularity:adaptive:updated", adaptive).await;
    }

    /// Émettre événement Meta Layer updated
    pub async fn emit_meta_updated(&self, meta: &MetaLayer) {
        self.emit("singularity:meta:updated", meta).await;
    }

    /// Émettre événement Full State updated
    pub async fn emit_full_state_updated(&self, state: &SingularityState) {
        self.emit("singularity:full:updated", state).await;
    }

    /// Émettre événement générique
    async fn emit<T: Serialize + Clone>(&self, event_name: &str, payload: &T) {
        if let Err(e) = self.app_handle.emit(event_name, payload.clone()) {
            eprintln!("[EventSyncLayer] Failed to emit {}: {}", event_name, e);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Note: Tests nécessitent un AppHandle Tauri réel
    // Tests intégration à ajouter dans tests E2E
}
