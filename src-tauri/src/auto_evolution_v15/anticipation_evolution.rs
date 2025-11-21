// 🔮 Anticipation Evolution — Moteur d'anticipation et prédiction
// Comprendre avant que Kevin demande, prédire les besoins

use std::collections::VecDeque;

pub struct AnticipationEngine {
    prediction_history: VecDeque<String>,
    max_history: usize,
}

impl AnticipationEngine {
    pub fn new() -> Self {
        Self {
            prediction_history: VecDeque::new(),
            max_history: 50,
        }
    }

    /// Prédire la réponse optimale selon l'état de Kevin
    pub fn predict_optimal_response(&self, metrics: &super::KevinMetrics) -> String {
        // Analyse multidimensionnelle pour prédire le besoin réel

        // Cas 1: Stress élevé → Besoin d'apaisement
        if metrics.stress_level > 0.7 {
            return "Mode Thérapeute ou Méditation TITANE ZÉRO".to_string();
        }

        // Cas 2: Surcharge cognitive → Besoin de pause
        if metrics.cognitive_load > 0.8 {
            return "Pause immédiate avec déconnexion mentale".to_string();
        }

        // Cas 3: Confusion → Besoin de clarification
        if metrics.clarity_level < 0.3 {
            return "Mode Coach ICF pour structuration".to_string();
        }

        // Cas 4: Fatigue → Besoin de repos
        if metrics.energy_level < 0.3 {
            return "Repos ou méditation profonde".to_string();
        }

        // Cas 5: État optimal → Prêt pour action/création
        if metrics.clarity_level > 0.7 && metrics.energy_level > 0.7 {
            if metrics.creativity_level > 0.6 {
                return "Mode Creator Engine ou action stratégique".to_string();
            } else {
                return "Autopilot Proactif ou mode analyse".to_string();
            }
        }

        // Cas 6: Inspiration créative
        if metrics.creativity_level > 0.7 {
            return "Mode Creator Engine — Moment optimal pour créer".to_string();
        }

        // Cas 7: Focus intense
        if metrics.focus_level > 0.8 {
            return "Mode Analyste ou Project Navigator".to_string();
        }

        // Défaut: État neutre
        "Mode Digital Twin (Kevin+) — Fonctionnement standard".to_string()
    }

    /// Anticiper le prochain besoin (basé sur tendances)
    pub fn anticipate_next_need(&self, metrics: &super::KevinMetrics) -> Option<String> {
        // Détection précoce des besoins émergents

        // Tendance vers fatigue
        if metrics.energy_level < 0.5 && metrics.cognitive_load > 0.6 {
            return Some("⚠️ Risque de fatigue imminente — Pause recommandée dans 15-20min".to_string());
        }

        // Tendance vers surcharge
        if metrics.cognitive_load > 0.65 && metrics.stress_level > 0.5 {
            return Some("⚠️ Risque de surcharge cognitive — Simplifier les tâches".to_string());
        }

        // Tendance vers confusion
        if metrics.clarity_level < 0.5 && metrics.cognitive_load > 0.6 {
            return Some("🌫️ Risque de perte de clarté — Pause ou clarification conseillée".to_string());
        }

        // Opportunité créative
        if metrics.creativity_level > 0.6 && metrics.energy_level > 0.6 {
            return Some("✨ Fenêtre créative ouverte — Moment propice à la création".to_string());
        }

        None
    }

    /// Détecter le mode le plus approprié automatiquement
    pub fn auto_detect_mode(&self, metrics: &super::KevinMetrics) -> String {
        if metrics.stress_level > 0.7 {
            return "Maître-Thérapeute Humaniste".to_string();
        }

        if metrics.cognitive_load > 0.8 {
            return "Méditation profonde TITANE ZÉRO".to_string();
        }

        if metrics.clarity_level < 0.4 {
            return "Coach Professionnel ICF".to_string();
        }

        if metrics.energy_level < 0.3 {
            return "Energy Manager".to_string();
        }

        if metrics.creativity_level > 0.7 {
            return "Creator Engine".to_string();
        }

        if metrics.focus_level > 0.8 {
            return "Flow State Inducer".to_string();
        }

        if metrics.clarity_level > 0.7 && metrics.energy_level > 0.7 {
            return "Autopilot Proactif".to_string();
        }

        "Digital Twin (Kevin+)".to_string()
    }

    /// Évaluer la confiance dans la prédiction
    pub fn prediction_confidence(&self, metrics: &super::KevinMetrics) -> f32 {
        let mut confidence = 0.5;

        // Plus l'état est marqué, plus la confiance est élevée
        if metrics.stress_level > 0.7 || metrics.stress_level < 0.2 {
            confidence += 0.2;
        }

        if metrics.clarity_level > 0.8 || metrics.clarity_level < 0.3 {
            confidence += 0.2;
        }

        if metrics.energy_level > 0.8 || metrics.energy_level < 0.3 {
            confidence += 0.1;
        }

        if confidence > 1.0 {
            1.0
        } else {
            confidence
        }
    }

    /// Enregistrer une prédiction
    pub fn record_prediction(&mut self, prediction: String) {
        self.prediction_history.push_back(prediction);

        if self.prediction_history.len() > self.max_history {
            self.prediction_history.pop_front();
        }
    }

    /// Obtenir l'historique des prédictions
    pub fn get_prediction_history(&self) -> Vec<String> {
        self.prediction_history.iter().cloned().collect()
    }
}

impl Default for AnticipationEngine {
    fn default() -> Self {
        Self::new()
    }
}
