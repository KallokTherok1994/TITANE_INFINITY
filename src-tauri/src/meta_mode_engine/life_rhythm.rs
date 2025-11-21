#![allow(dead_code)]
//! ⏰ LIFE RHYTHM ENGINE
//! Gestion énergie + charge mentale + rythme circadien

use chrono::{DateTime, Utc, Timelike};

pub struct LifeRhythmEngine {
    last_rest_time: Option<DateTime<Utc>>,
}

impl LifeRhythmEngine {
    pub fn new() -> Self {
        Self {
            last_rest_time: None,
        }
    }
    
    /// Détecter le besoin de pause selon rythme
    pub fn needs_rest(&self, current_energy: f32, saturation: f32) -> bool {
        current_energy < 0.3 || saturation > 0.8
    }
    
    /// Suggérer le meilleur moment pour tâche complexe
    pub fn optimal_time_for_complex_task(&self) -> String {
        let now = Utc::now();
        let hour = now.hour();
        
        if (9..=12).contains(&hour) {
            "Pic cognitif matinal : idéal pour tâches complexes".to_string()
        } else if (14..=17).contains(&hour) {
            "Pic d'après-midi : bon pour tâches moyennes".to_string()
        } else {
            "Énergie basse : privilégier tâches simples ou repos".to_string()
        }
    }
}
