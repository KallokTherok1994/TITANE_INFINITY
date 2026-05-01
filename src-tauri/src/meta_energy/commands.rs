// ═══════════════════════════════════════════════════════════════
// TITANE∞ — Meta-Energy IPC Commands
// V32 Phase 9 — SP#20 Énergie Cognitive
// ═══════════════════════════════════════════════════════════════
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;
use tokio::sync::RwLock;

use crate::meta_energy::config::MetaEnergyConfig;
use crate::meta_energy::energy_model::{EnergyState, EnergySnapshot};
use crate::meta_energy::fatigue_engine::FatigueEngine;
use crate::meta_energy::recovery_engine::RecoveryEngine;
use crate::meta_energy::load_balancer::{LoadBalance, LoadBalancer};
use crate::meta_energy::homeostasis::HomeostasisController;
use crate::meta_energy::predictor::EnergyPredictor;

// ─── State ───────────────────────────────────────────────────

pub struct MetaEnergyState {
    pub energy: EnergyState,
    pub config: MetaEnergyConfig,
    pub history: Vec<EnergySnapshot>,
    pub fatigue_engine: FatigueEngine,
    pub recovery_engine: RecoveryEngine,
    pub load_balancer: LoadBalancer,
    pub homeostasis: HomeostasisController,
    pub predictor: EnergyPredictor,
}

impl MetaEnergyState {
    pub fn new(config: MetaEnergyConfig) -> Self {
        let energy = EnergyState::new(1.0, config.regeneration_rate);
        let fatigue_engine = FatigueEngine::new(config.exhaustion_threshold);
        let recovery_engine = RecoveryEngine::new(config.min_recovery_seconds, config.regeneration_rate);
        let load_balancer = LoadBalancer::new(1.0);
        let homeostasis = HomeostasisController::new(config.target_energy, config.tolerance);
        let predictor = EnergyPredictor::new(
            config.forecast_horizon_hours,
            config.regeneration_rate,
            config.base_consumption_rate,
        );

        Self {
            energy,
            config,
            history: Vec::new(),
            fatigue_engine,
            recovery_engine,
            load_balancer,
            homeostasis,
            predictor,
        }
    }
}

// ─── Response types ──────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaEnergyStateResponse {
    pub energy_level: f32,
    pub max_capacity: f32,
    pub normalized: f32,
    pub fatigue_level: String,
    pub cognitive_multiplier: f32,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaEnergyDiagnosticsResponse {
    pub energy_level: f32,
    pub fatigue_level: String,
    pub homeostasis_in_balance: bool,
    pub homeostasis_deviation: f32,
    pub history_entries: usize,
    pub config_target_energy: f32,
}

// ─── Commands ────────────────────────────────────────────────

/// Obtenir l'état énergétique courant
#[tauri::command]
pub async fn meta_energy_get_state(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<MetaEnergyStateResponse, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    let fatigue = state.fatigue_engine.assess(normalized);

    Ok(MetaEnergyStateResponse {
        energy_level: state.energy.current,
        max_capacity: state.energy.max_capacity,
        normalized,
        fatigue_level: fatigue.as_str().to_string(),
        cognitive_multiplier: fatigue.cognitive_multiplier(),
        timestamp: state.energy.timestamp,
    })
}

/// Obtenir le niveau de fatigue
#[tauri::command]
pub async fn meta_energy_get_fatigue(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<String, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    Ok(state.fatigue_engine.assess(normalized).as_str().to_string())
}

/// Obtenir le plan de récupération
#[tauri::command]
pub async fn meta_energy_get_recovery_plan(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<crate::meta_energy::recovery_engine::RecoveryPlan, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    let fatigue = state.fatigue_engine.assess(normalized);
    Ok(state.recovery_engine.plan(&fatigue, normalized))
}

/// Obtenir l'équilibre de charge
#[tauri::command]
pub async fn meta_energy_get_load_balance(
    requested_load: f32,
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<LoadBalance, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    let fatigue = state.fatigue_engine.assess(normalized);
    Ok(state.load_balancer.balance(requested_load, &fatigue))
}

/// Obtenir l'évaluation homéostatique
#[tauri::command]
pub async fn meta_energy_get_homeostasis(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<crate::meta_energy::homeostasis::HomeoBalance, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    Ok(state.homeostasis.assess(normalized))
}

/// Obtenir la prévision énergétique
#[tauri::command]
pub async fn meta_energy_get_forecast(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<crate::meta_energy::predictor::EnergyForecast, String> {
    let state = state.read().await;
    Ok(state.predictor.forecast(state.energy.normalized(), &state.history))
}

/// Appliquer un delta d'énergie (simulation de consommation ou récupération)
#[tauri::command]
pub async fn meta_energy_apply_delta(
    delta: f32,
    activity: String,
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<MetaEnergyStateResponse, String> {
    let mut state = state.write().await;
    let before = state.energy.normalized();

    // Record snapshot before applying
    let before_fatigue = state.fatigue_engine.assess(before).cognitive_multiplier();
    let before_ts = state.energy.timestamp;
    state.history.push(EnergySnapshot {
        energy_level: before,
        fatigue_level: before_fatigue,
        timestamp: before_ts,
        activity: activity.clone(),
    });

    // Keep history bounded (last 1000)
    if state.history.len() > 1000 {
        state.history.remove(0);
    }

    state.energy.apply_delta(delta.clamp(-0.5, 0.5));

    let normalized = state.energy.normalized();
    let fatigue = state.fatigue_engine.assess(normalized);

    Ok(MetaEnergyStateResponse {
        energy_level: state.energy.current,
        max_capacity: state.energy.max_capacity,
        normalized,
        fatigue_level: fatigue.as_str().to_string(),
        cognitive_multiplier: fatigue.cognitive_multiplier(),
        timestamp: state.energy.timestamp,
    })
}

/// Diagnostics complets du moteur méta-énergie
#[tauri::command]
pub async fn meta_energy_get_diagnostics(
    state: State<'_, Arc<RwLock<MetaEnergyState>>>,
) -> Result<MetaEnergyDiagnosticsResponse, String> {
    let state = state.read().await;
    let normalized = state.energy.normalized();
    let fatigue = state.fatigue_engine.assess(normalized);
    let balance = state.homeostasis.assess(normalized);

    Ok(MetaEnergyDiagnosticsResponse {
        energy_level: normalized,
        fatigue_level: fatigue.as_str().to_string(),
        homeostasis_in_balance: balance.in_balance,
        homeostasis_deviation: balance.deviation,
        history_entries: state.history.len(),
        config_target_energy: state.config.target_energy,
    })
}
