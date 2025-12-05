// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║ TITANE∞ v8.0 - Adaptive Engine Analysis Module                              ║
// ║ Analyse multi-dimensionnelle des états système pour régulation adaptative   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use crate::shared::types::ModuleHealth;
use crate::shared::utils::clamp;
use crate::system::memory::MemoryModule;
/// Rapport d'analyse adaptative du système
#[derive(Debug, Clone)]
pub struct AdaptiveReport {
    /// Charge système globale (0.0 = minimal, 1.0 = maximal)
    pub load: f32,

    /// Pression sur les ressources (0.0 = détendu, 1.0 = saturé)
    pub pressure: f32,
    /// Harmonie entre modules (0.0 = désynchronisé, 1.0 = parfait)
    pub harmony: f32,
    /// Intégrité globale (0.0 = compromis, 1.0 = intact)
    pub integrity: f32,
    /// Risque d'anomalie détecté (0.0 = aucun, 1.0 = critique)
    pub anomaly_risk: f32,
    /// Tendance générale (-1.0 = détérioration, 0.0 = stable, 1.0 = amélioration)
    pub trend: f32,
}
impl AdaptiveReport {
    /// Crée un rapport avec des valeurs par défaut saines
    fn default() -> Self {
        Self {
            load: 0.3,
            pressure: 0.2,
            harmony: 0.8,
            integrity: 1.0,
            anomaly_risk: 0.0,
            trend: 0.0,
        }
    }
}

/// Analyse l'état de tous les modules et génère un rapport adaptatif
///
/// # Arguments
/// * `helios_health` - État du module Helios (vitalité système)
/// * `nexus_health` - État du module Nexus (interconnexions)
/// * `harmonia_health` - État du module Harmonia (synchronisation)
/// * `sentinel_health` - État du module Sentinel (sécurité)
/// * `watchdog_health` - État du module Watchdog (surveillance)
/// * `memory` - État du module Memory (persistance)
/// # Returns
/// * `Result<AdaptiveReport, String>` - Rapport d'analyse ou erreur
pub fn analyze(
    helios_health: &ModuleHealth,
    nexus_health: &ModuleHealth,
    harmonia_health: &ModuleHealth,
    sentinel_health: &ModuleHealth,
    watchdog_health: &ModuleHealth,
    memory: &MemoryModule,
) -> Result<AdaptiveReport, String> {
    // Extraire les métriques de santé normalisées
    let helios_score = health_to_score(helios_health);
    let nexus_score = health_to_score(nexus_health);
    let harmonia_score = health_to_score(harmonia_health);
    let sentinel_score = health_to_score(sentinel_health);
    let watchdog_score = health_to_score(watchdog_health);
    let memory_score = memory_health_score(memory);
    // Calculer la charge système (moyenne pondérée)
    let load = calculate_load(helios_score, nexus_score, harmonia_score, memory_score);
    // Calculer la pression (écart-type et valeurs extrêmes)
    let pressure = calculate_pressure(sentinel_score, watchdog_score);

    // Calculer l'harmonie (cohérence entre modules)
    let harmony = calculate_harmony(harmonia_score);

    // Calculer l'intégrité (modules de sécurité)
    let integrity = calculate_integrity(helios_score, nexus_score);

    // Détecter les risques d'anomalie
    let anomaly_risk = calculate_anomaly_risk(pressure, harmony, integrity);

    // Calculer la tendance générale
    let trend = calculate_trend(integrity, anomaly_risk);

    Ok(AdaptiveReport {
        load: clamp(load, 0.0, 1.0),
        pressure: clamp(pressure, 0.0, 1.0),
        harmony: clamp(harmony, 0.0, 1.0),
        integrity: clamp(integrity, 0.0, 1.0),
        anomaly_risk: clamp(anomaly_risk, 0.0, 1.0),
        trend: clamp(trend, -1.0, 1.0),
    })
}

/// Convertit un état de santé en score normalisé (0.0 à 1.0)
fn health_to_score(health: &ModuleHealth) -> f32 {
    use crate::shared::types::HealthStatus;
    match health.status {
        HealthStatus::Healthy => 1.0,
        HealthStatus::Degraded => 0.6,
        HealthStatus::Critical => 0.3,
        HealthStatus::Offline => 0.0,
    }
}

/// Évalue la santé du module Memory
fn memory_health_score(memory: &MemoryModule) -> f32 {
    if !memory.state.initialized {
        return 0.0;
    }

    // Score basé sur l'état d'initialisation et la disponibilité
    if memory.memory_initialized {
        0.9
    } else {
        0.5
    }
}

/// Calcule la charge système globale
fn calculate_load(helios: f32, nexus: f32, harmonia: f32, memory: f32) -> f32 {
    // Moyenne pondérée : Helios et Memory ont plus de poids
    let weighted_sum = (helios * 0.35) + (nexus * 0.25) + (harmonia * 0.25) + (memory * 0.15);
    // Inverser car score élevé = faible charge
    1.0 - weighted_sum
}
/// Calcule la pression sur les ressources
#[allow(dead_code)]
fn calculate_pressure(sentinel: f32, watchdog: f32) -> f32 {
    // Pression = inverse de la moyenne des scores de surveillance
    1.0 - (sentinel + watchdog) / 2.0
}

/// Calcule l'harmonie entre les modules
#[allow(dead_code)]
fn calculate_harmony(harmonia: f32) -> f32 {
    // L'harmonie est directement le score du module Harmonia
    harmonia
}

/// Calcule l'intégrité du système
#[allow(dead_code)]
fn calculate_integrity(helios: f32, nexus: f32) -> f32 {
    // Intégrité = moyenne des modules vitaux
    (helios + nexus) / 2.0
}

/// Calcule le risque d'anomalie
#[allow(dead_code)]
fn calculate_anomaly_risk(pressure: f32, harmony: f32, integrity: f32) -> f32 {
    // Risque élevé si :
    // - Pression élevée
    // - Harmonie faible
    // - Intégrité faible
    let pressure_risk = pressure * 0.4;
    let harmony_risk = (1.0 - harmony) * 0.3;
    let integrity_risk = (1.0 - integrity) * 0.3;

    pressure_risk + harmony_risk + integrity_risk
}

/// Calcule la tendance générale du système
#[allow(dead_code)]
fn calculate_trend(integrity: f32, anomaly_risk: f32) -> f32 {
    // Tendance positive si intégrité élevée et risque faible
    // Tendance négative si intégrité faible et risque élevé
    integrity - anomaly_risk
}

#[cfg(test)]
mod tests {
    use super::*;
    #[allow(dead_code)]
    fn create_test_health(status: HealthStatus) -> ModuleHealth {
        ModuleHealth {
            name: "Test".to_string(),
            status,
            uptime: 1000,
            last_tick: 1000,
            message: "Test".to_string(),
        }
    }

    #[test]
    fn test_health_to_score() {
        assert_eq!(
            health_to_score(&create_test_health(HealthStatus::Healthy)),
            1.0
        );
        assert_eq!(
            health_to_score(&create_test_health(HealthStatus::Degraded)),
            0.6
        );
        assert_eq!(
            health_to_score(&create_test_health(HealthStatus::Critical)),
            0.3
        );
        assert_eq!(
            health_to_score(&create_test_health(HealthStatus::Offline)),
            0.0
        );
    }

    #[test]
    fn test_clamp() {
        fn test_clamp() {
            assert_eq!(clamp(0.5, 0.0, 1.0), 0.5);
            assert_eq!(clamp(-0.5, 0.0, 1.0), 0.0);
            assert_eq!(clamp(1.5, 0.0, 1.0), 1.0);
        }

        #[test]
        fn test_calculate_trend() {
            let trend = calculate_trend(0.8, 0.2);
            assert!(trend > 0.0); // Tendance positive attendue

            let trend_neg = calculate_trend(0.2, 0.8);
            assert!(trend_neg < 0.0); // Tendance négative attendue
        }
    }
}
