use serde::{Deserialize, Serialize};

/// Mode cognitif actif de l'utilisateur
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum CognitiveMode {
    /// Exploration libre, divergence, brainstorming
    Discovery {
        curiosity_level: f32, // 0.0 → 1.0
        topic_jumping: bool,
    },
    /// Concentration profonde, tâche unique
    Focus {
        depth: f32,             // 0.0 → 1.0
        interruption_cost: f32, // coût d'interrompre
    },
    /// Structuration, organisation, synthèse
    Organization {
        clarity_target: f32,
        structuring_phase: StructurePhase,
    },
    /// Repos mental, faible charge
    Rest { recovery_rate: f32 },
}

impl Default for CognitiveMode {
    fn default() -> Self {
        CognitiveMode::Discovery {
            curiosity_level: 0.5,
            topic_jumping: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StructurePhase {
    Collecting,    // rassembler
    Connecting,    // relier
    Hierarchizing, // ordonner
    Crystallizing, // finaliser
}

/// Type de tâche cognitive
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskType {
    Reading,
    Writing,
    Coding,
    Debugging,
    Planning,
    Learning,
    Creating,
    Discussing,
}

/// Tâche cognitive en cours
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CognitiveTask {
    pub id: String,
    pub task_type: TaskType,
    pub complexity: f32,  // 0.0 → 1.0
    pub progress: f32,    // 0.0 → 1.0
    pub mental_load: f32, // 0.0 → 1.0 (charge actuelle)
    pub started_at: u64,  // ms since epoch
    pub interruptions: Vec<InterruptionEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InterruptionEvent {
    pub timestamp: u64, // ms since epoch
    pub cause: String,
    pub duration_ms: u64,
}

/// État du centre mental (charge cognitive)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[derive(Default)]
pub struct MentalState {
    pub mode: CognitiveMode,
    pub charge: MentalCharge,
    pub current_task: Option<CognitiveTask>,
    pub session: Option<String>, // Session ID
}


/// Charge mentale globale
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MentalCharge {
    pub current: f32,  // 0.0 → 1.0
    pub capacity: f32, // max sustainable
    pub fatigue: f32,  // 0.0 → 1.0
    pub recovery_needed: bool,
    pub history: Vec<f32>, // Dernières minutes (simplifié pour serde)
}

impl Default for MentalCharge {
    fn default() -> Self {
        Self {
            current: 0.3,
            capacity: 0.8,
            fatigue: 0.0,
            recovery_needed: false,
            history: Vec::new(),
        }
    }
}

impl MentalCharge {
    pub fn is_overloaded(&self) -> bool {
        self.current > self.capacity
    }

    pub fn needs_break(&self) -> bool {
        self.recovery_needed || self.fatigue > 0.7
    }

    pub fn add_to_history(&mut self, value: f32) {
        self.history.push(value);
        // Garder seulement dernières 60 valeurs (1h si 1/min)
        if self.history.len() > 60 {
            self.history.remove(0);
        }
    }

    pub fn compute_trend(&self) -> f32 {
        if self.history.len() < 2 {
            return 0.0;
        }

        let recent = self
            .history
            .iter()
            .rev()
            .take(10)
            .copied()
            .collect::<Vec<_>>();
        if recent.len() < 2 {
            return 0.0;
        }

        // Slope simple: (last - first) / count
        let first = recent.last().unwrap();
        let last = recent.first().unwrap();
        (last - first) / recent.len() as f32
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cognitive_mode_default() {
        let mode = CognitiveMode::default();
        assert!(matches!(mode, CognitiveMode::Discovery { .. }));
    }

    #[test]
    fn test_mental_charge_overload() {
        let charge = MentalCharge {
            current: 0.9,
            capacity: 0.8,
            ..Default::default()
        };

        assert!(charge.is_overloaded());
    }

    #[test]
    fn test_mental_charge_needs_break() {
        let charge = MentalCharge {
            fatigue: 0.8,
            ..Default::default()
        };

        assert!(charge.needs_break());

        let charge2 = MentalCharge {
            fatigue: 0.5,
            recovery_needed: true,
            ..Default::default()
        };

        assert!(charge2.needs_break());
    }

    #[test]
    fn test_mental_charge_history() {
        let mut charge = MentalCharge::default();

        for i in 0..70 {
            charge.add_to_history(i as f32);
        }

        // Should keep only last 60
        assert_eq!(charge.history.len(), 60);
        assert_eq!(charge.history[0], 10.0);
        assert_eq!(charge.history[59], 69.0);
    }

    #[test]
    fn test_mental_charge_trend() {
        let mut charge = MentalCharge::default();

        // Tendance croissante
        for i in 0..10 {
            charge.add_to_history((i as f32) * 0.1);
        }

        let trend = charge.compute_trend();
        assert!(trend > 0.0); // Croissant

        // Ajouter valeurs décroissantes
        for i in (0..10).rev() {
            charge.add_to_history((i as f32) * 0.1);
        }

        let trend2 = charge.compute_trend();
        assert!(trend2 < 0.0); // Décroissant
    }
}
