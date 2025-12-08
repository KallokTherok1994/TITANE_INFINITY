//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ANOMALY DETECTOR
//! Détection de comportements anormaux
//! ═══════════════════════════════════════════════════════════════════════════════

use super::system_health::SystemHealth;

/// Seuils de détection d'anomalie
#[derive(Clone, Debug)]
pub struct AnomalyThresholds {
    pub error_rate_warning: f32,
    pub error_rate_critical: f32,
    pub latency_warning_ms: u64,
    pub latency_critical_ms: u64,
    pub memory_warning: f32,
    pub memory_critical: f32,
    pub cache_hit_min: f32,
}

impl Default for AnomalyThresholds {
    fn default() -> Self {
        Self {
            error_rate_warning: 0.03,
            error_rate_critical: 0.1,
            latency_warning_ms: 200,
            latency_critical_ms: 500,
            memory_warning: 0.7,
            memory_critical: 0.9,
            cache_hit_min: 0.5,
        }
    }
}

/// Catégorie d'anomalie
#[derive(Clone, Debug, PartialEq)]
pub enum AnomalyLevel {
    /// 0.0 - 0.3 : Tout va bien
    Normal,
    /// 0.3 - 0.6 : Attention requise
    Warning,
    /// 0.6 - 1.0 : Action immédiate
    Critical,
}

impl AnomalyLevel {
    pub fn from_score(score: f32) -> Self {
        if score < 0.3 {
            AnomalyLevel::Normal
        } else if score < 0.6 {
            AnomalyLevel::Warning
        } else {
            AnomalyLevel::Critical
        }
    }
}

/// Détecteur d'anomalies
pub struct AnomalyDetector {
    thresholds: AnomalyThresholds,
}

impl AnomalyDetector {
    /// Crée un nouveau détecteur avec seuils par défaut
    pub fn new() -> Self {
        Self {
            thresholds: AnomalyThresholds::default(),
        }
    }

    /// Crée avec des seuils personnalisés
    pub fn with_thresholds(thresholds: AnomalyThresholds) -> Self {
        Self { thresholds }
    }

    /// Calcule le score d'anomalie global (0.0 - 1.0)
    pub fn compute_score(&self, health: &SystemHealth) -> f32 {
        let mut score = 0.0;

        // Pénalité pour taux d'erreur élevé
        if health.error_rate > self.thresholds.error_rate_critical {
            score += 0.4;
        } else if health.error_rate > self.thresholds.error_rate_warning {
            score += 0.2;
        }

        // Pénalité pour latence OMEGA élevée
        if health.omega_latency > self.thresholds.latency_critical_ms {
            score += 0.35;
        } else if health.omega_latency > self.thresholds.latency_warning_ms {
            score += 0.15;
        }

        // Pénalité pour utilisation mémoire élevée
        if health.memory_usage > self.thresholds.memory_critical {
            score += 0.35;
        } else if health.memory_usage > self.thresholds.memory_warning {
            score += 0.15;
        }

        // Pénalité pour faible taux de cache
        if health.cache_hit_rate < self.thresholds.cache_hit_min {
            score += 0.15;
        }

        // Pénalité pour latences moteurs élevées
        let slow_engines = health
            .engine_latencies
            .values()
            .filter(|&&l| l > 100)
            .count();
        if slow_engines > 2 {
            score += 0.2;
        } else if slow_engines > 0 {
            score += 0.1;
        }

        // Pénalité pour intégrité faible
        if health.integrity < 0.9 {
            score += 0.2 * (1.0 - health.integrity);
        }

        score.min(1.0)
    }

    /// Retourne le niveau d'anomalie
    pub fn get_level(&self, health: &SystemHealth) -> AnomalyLevel {
        AnomalyLevel::from_score(self.compute_score(health))
    }

    /// Analyse détaillée des anomalies
    pub fn analyze(&self, health: &SystemHealth) -> Vec<String> {
        let mut issues = Vec::new();

        if health.error_rate > self.thresholds.error_rate_warning {
            issues.push(format!(
                "High error rate: {:.1}%",
                health.error_rate * 100.0
            ));
        }

        if health.omega_latency > self.thresholds.latency_warning_ms {
            issues.push(format!("High OMEGA latency: {}ms", health.omega_latency));
        }

        if health.memory_usage > self.thresholds.memory_warning {
            issues.push(format!(
                "High memory usage: {:.0}%",
                health.memory_usage * 100.0
            ));
        }

        if health.cache_hit_rate < self.thresholds.cache_hit_min {
            issues.push(format!(
                "Low cache hit rate: {:.0}%",
                health.cache_hit_rate * 100.0
            ));
        }

        for (engine, &latency) in &health.engine_latencies {
            if latency > 100 {
                issues.push(format!("Slow engine {}: {}ms", engine, latency));
            }
        }

        if health.integrity < 0.95 {
            issues.push(format!(
                "Reduced integrity: {:.0}%",
                health.integrity * 100.0
            ));
        }

        issues
    }
}

impl Default for AnomalyDetector {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_healthy_score() {
        let detector = AnomalyDetector::new();
        let health = SystemHealth::healthy();
        let score = detector.compute_score(&health);
        assert!(score < 0.3);
    }

    #[test]
    fn test_high_error_rate() {
        let detector = AnomalyDetector::new();
        let mut health = SystemHealth::healthy();
        health.error_rate = 0.15;
        let score = detector.compute_score(&health);
        assert!(score > 0.3);
    }

    #[test]
    fn test_critical_detection() {
        let detector = AnomalyDetector::new();
        let mut health = SystemHealth::healthy();
        health.error_rate = 0.2;
        health.memory_usage = 0.95;
        health.omega_latency = 600;

        let level = detector.get_level(&health);
        assert_eq!(level, AnomalyLevel::Critical);
    }

    #[test]
    fn test_analyze() {
        let detector = AnomalyDetector::new();
        let mut health = SystemHealth::healthy();
        health.error_rate = 0.1;

        let issues = detector.analyze(&health);
        assert!(!issues.is_empty());
    }
}
