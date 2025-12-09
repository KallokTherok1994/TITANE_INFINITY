//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — ROUTINES ENGINE
//! Super Prompt #18 — Gestion des routines et habitudes
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use tokio::sync::RwLock;
use super::time_model::{TemporalContext, TimeOfDay, Season};

/// Pattern de routine
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum RoutinePattern {
    /// Quotidienne (chaque jour)
    Daily,
    /// Hebdomadaire (certains jours)
    Weekly(Vec<u8>), // 0 = Sunday, 6 = Saturday
    /// Mensuelle (certains jours du mois)
    Monthly(Vec<u8>),
    /// À intervalle fixe
    Interval { hours: u32 },
    /// Déclenchée par événement
    EventTriggered(String),
    /// Saisonnière
    Seasonal(Season),
    /// Custom pattern avec expression cron-like
    Custom(String),
}

/// Déclencheur de routine
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RoutineTrigger {
    pub pattern: RoutinePattern,
    pub time_of_day: Option<TimeOfDay>,
    pub hour: Option<u8>,
    pub minute: Option<u8>,
    pub conditions: Vec<TriggerCondition>,
}

impl RoutineTrigger {
    /// Vérifie si le trigger doit se déclencher
    pub fn should_trigger(&self, context: &TemporalContext) -> bool {
        let pattern_matches = self.pattern_matches(context);
        let time_matches = self.time_matches(context);
        let conditions_met = self.conditions_met(context);

        pattern_matches && time_matches && conditions_met
    }

    fn pattern_matches(&self, context: &TemporalContext) -> bool {
        match &self.pattern {
            RoutinePattern::Daily => true,
            RoutinePattern::Weekly(days) => days.contains(&context.now.day_of_week),
            RoutinePattern::Monthly(days) => days.contains(&context.now.day),
            RoutinePattern::Interval { hours: _ } => true, // Checked separately
            RoutinePattern::EventTriggered(_) => false, // Triggered externally
            RoutinePattern::Seasonal(season) => context.now.season == *season,
            RoutinePattern::Custom(_) => true, // Would need cron parser
        }
    }

    fn time_matches(&self, context: &TemporalContext) -> bool {
        if let Some(tod) = &self.time_of_day {
            if context.now.time_of_day != *tod {
                return false;
            }
        }

        if let Some(hour) = self.hour {
            if context.now.hour != hour {
                return false;
            }
        }

        if let Some(minute) = self.minute {
            // Allow ±2 minutes tolerance
            let diff = (context.now.minute as i16 - minute as i16).abs();
            if diff > 2 && diff < 58 {
                return false;
            }
        }

        true
    }

    fn conditions_met(&self, context: &TemporalContext) -> bool {
        self.conditions.iter().all(|c| c.is_met(context))
    }
}

/// Condition de déclenchement
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum TriggerCondition {
    /// Énergie cognitive minimum
    MinEnergy(f32),
    /// Jour de semaine
    Weekday,
    /// Weekend
    Weekend,
    /// Progression de la session minimum
    MinSessionDuration(u64),
    /// Custom condition
    Custom { name: String, value: String },
}

impl TriggerCondition {
    fn is_met(&self, context: &TemporalContext) -> bool {
        match self {
            Self::MinEnergy(min) => context.cognitive_energy_estimate >= *min,
            Self::Weekday => !context.now.is_weekend,
            Self::Weekend => context.now.is_weekend,
            Self::MinSessionDuration(ms) => context.session_duration_ms >= *ms,
            Self::Custom { .. } => true, // External evaluation
        }
    }
}

/// Routine
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Routine {
    pub id: String,
    pub name: String,
    pub description: String,
    pub trigger: RoutineTrigger,
    pub actions: Vec<RoutineAction>,
    pub enabled: bool,
    pub priority: u8,
    pub last_triggered_ms: Option<u64>,
    pub trigger_count: u64,
    pub cooldown_ms: u64,
}

impl Routine {
    pub fn new(id: &str, name: &str, trigger: RoutineTrigger) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            description: String::new(),
            trigger,
            actions: Vec::new(),
            enabled: true,
            priority: 5,
            last_triggered_ms: None,
            trigger_count: 0,
            cooldown_ms: 3600000, // 1 heure par défaut
        }
    }

    /// Vérifie si la routine peut se déclencher
    pub fn can_trigger(&self, context: &TemporalContext) -> bool {
        if !self.enabled {
            return false;
        }

        // Vérifier le cooldown
        if let Some(last) = self.last_triggered_ms {
            let now = context.now.timestamp_ms;
            if now.saturating_sub(last) < self.cooldown_ms {
                return false;
            }
        }

        self.trigger.should_trigger(context)
    }
}

/// Action de routine
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum RoutineAction {
    /// Notification à l'utilisateur
    Notify { message: String, priority: u8 },
    /// Exécution d'une commande
    Execute { command: String, args: Vec<String> },
    /// Modification d'état
    SetState { key: String, value: String },
    /// Émission d'événement
    EmitEvent { event_type: String, data: serde_json::Value },
    /// Suggestion
    Suggest { suggestion: String, reason: String },
    /// Rappel
    Remind { reminder: String, delay_ms: u64 },
}

/// Moteur de routines
pub struct RoutineEngine {
    routines: RwLock<Vec<Routine>>,
    stats: RwLock<RoutineStats>,
}

impl RoutineEngine {
    pub fn new() -> Self {
        Self {
            routines: RwLock::new(Vec::new()),
            stats: RwLock::new(RoutineStats::default()),
        }
    }

    /// Charge les routines par défaut
    pub async fn load_default_routines(&self) {
        let defaults = self.create_default_routines();
        let mut routines = self.routines.write().await;
        routines.extend(defaults);
    }

    /// Crée les routines par défaut
    fn create_default_routines(&self) -> Vec<Routine> {
        vec![
            // Routine matinale
            Routine {
                id: "morning_review".to_string(),
                name: "Morning Review".to_string(),
                description: "Daily morning review of tasks and goals".to_string(),
                trigger: RoutineTrigger {
                    pattern: RoutinePattern::Daily,
                    time_of_day: Some(TimeOfDay::Morning),
                    hour: Some(9),
                    minute: None,
                    conditions: vec![TriggerCondition::Weekday],
                },
                actions: vec![
                    RoutineAction::Notify {
                        message: "Time for your morning review!".to_string(),
                        priority: 5,
                    },
                    RoutineAction::Suggest {
                        suggestion: "Review your tasks for today".to_string(),
                        reason: "Optimal focus time in the morning".to_string(),
                    },
                ],
                enabled: true,
                priority: 7,
                last_triggered_ms: None,
                trigger_count: 0,
                cooldown_ms: 86400000, // 24 heures
            },

            // Pause midi
            Routine {
                id: "midday_break".to_string(),
                name: "Midday Break".to_string(),
                description: "Reminder to take a midday break".to_string(),
                trigger: RoutineTrigger {
                    pattern: RoutinePattern::Daily,
                    time_of_day: Some(TimeOfDay::Midday),
                    hour: Some(12),
                    minute: Some(30),
                    conditions: vec![],
                },
                actions: vec![
                    RoutineAction::Notify {
                        message: "Consider taking a break".to_string(),
                        priority: 3,
                    },
                ],
                enabled: true,
                priority: 4,
                last_triggered_ms: None,
                trigger_count: 0,
                cooldown_ms: 86400000,
            },

            // Revue de fin de journée
            Routine {
                id: "evening_review".to_string(),
                name: "Evening Review".to_string(),
                description: "End of day review and planning".to_string(),
                trigger: RoutineTrigger {
                    pattern: RoutinePattern::Daily,
                    time_of_day: Some(TimeOfDay::Evening),
                    hour: Some(18),
                    minute: None,
                    conditions: vec![TriggerCondition::Weekday],
                },
                actions: vec![
                    RoutineAction::Notify {
                        message: "Time to review your day".to_string(),
                        priority: 5,
                    },
                    RoutineAction::Suggest {
                        suggestion: "Plan tomorrow's priorities".to_string(),
                        reason: "Evening planning improves next day productivity".to_string(),
                    },
                ],
                enabled: true,
                priority: 6,
                last_triggered_ms: None,
                trigger_count: 0,
                cooldown_ms: 86400000,
            },

            // Revue hebdomadaire
            Routine {
                id: "weekly_review".to_string(),
                name: "Weekly Review".to_string(),
                description: "Weekly goals and progress review".to_string(),
                trigger: RoutineTrigger {
                    pattern: RoutinePattern::Weekly(vec![0]), // Sunday
                    time_of_day: Some(TimeOfDay::Evening),
                    hour: Some(19),
                    minute: None,
                    conditions: vec![],
                },
                actions: vec![
                    RoutineAction::Notify {
                        message: "Time for your weekly review!".to_string(),
                        priority: 7,
                    },
                    RoutineAction::EmitEvent {
                        event_type: "weekly_review".to_string(),
                        data: serde_json::json!({ "trigger": "routine" }),
                    },
                ],
                enabled: true,
                priority: 8,
                last_triggered_ms: None,
                trigger_count: 0,
                cooldown_ms: 604800000, // 7 jours
            },

            // Pause régulière
            Routine {
                id: "regular_break".to_string(),
                name: "Regular Break".to_string(),
                description: "Regular break reminder based on session duration".to_string(),
                trigger: RoutineTrigger {
                    pattern: RoutinePattern::Interval { hours: 2 },
                    time_of_day: None,
                    hour: None,
                    minute: None,
                    conditions: vec![TriggerCondition::MinSessionDuration(7200000)], // 2 hours
                },
                actions: vec![
                    RoutineAction::Notify {
                        message: "You've been working for 2 hours. Consider a break.".to_string(),
                        priority: 4,
                    },
                ],
                enabled: true,
                priority: 5,
                last_triggered_ms: None,
                trigger_count: 0,
                cooldown_ms: 7200000, // 2 heures
            },
        ]
    }

    /// Ajoute une routine
    pub async fn add_routine(&self, routine: Routine) {
        let mut routines = self.routines.write().await;
        routines.push(routine);
    }

    /// Supprime une routine
    pub async fn remove_routine(&self, id: &str) -> bool {
        let mut routines = self.routines.write().await;
        let len_before = routines.len();
        routines.retain(|r| r.id != id);
        routines.len() < len_before
    }

    /// Active/désactive une routine
    pub async fn set_enabled(&self, id: &str, enabled: bool) -> bool {
        let mut routines = self.routines.write().await;
        if let Some(routine) = routines.iter_mut().find(|r| r.id == id) {
            routine.enabled = enabled;
            true
        } else {
            false
        }
    }

    /// Vérifie les routines à déclencher
    pub async fn check_triggers(&self, context: &TemporalContext) -> Vec<Routine> {
        let mut routines = self.routines.write().await;
        let mut triggered = Vec::new();

        for routine in routines.iter_mut() {
            if routine.can_trigger(context) {
                routine.last_triggered_ms = Some(context.now.timestamp_ms);
                routine.trigger_count += 1;
                triggered.push(routine.clone());
            }
        }

        if !triggered.is_empty() {
            let mut stats = self.stats.write().await;
            stats.total_triggers += triggered.len() as u64;
        }

        // Trier par priorité
        triggered.sort_by(|a, b| b.priority.cmp(&a.priority));
        triggered
    }

    /// Déclenche une routine par événement
    pub async fn trigger_by_event(&self, event_name: &str, context: &TemporalContext) -> Vec<Routine> {
        let mut routines = self.routines.write().await;
        let mut triggered = Vec::new();

        for routine in routines.iter_mut() {
            if let RoutinePattern::EventTriggered(event) = &routine.trigger.pattern {
                if event == event_name && routine.enabled {
                    routine.last_triggered_ms = Some(context.now.timestamp_ms);
                    routine.trigger_count += 1;
                    triggered.push(routine.clone());
                }
            }
        }

        triggered
    }

    /// Récupère les routines actives
    pub async fn active_routines(&self) -> Vec<Routine> {
        let routines = self.routines.read().await;
        routines.iter().filter(|r| r.enabled).cloned().collect()
    }

    /// Récupère toutes les routines
    pub async fn all_routines(&self) -> Vec<Routine> {
        let routines = self.routines.read().await;
        routines.clone()
    }

    /// Statistiques
    pub async fn stats(&self) -> RoutineStats {
        let routines = self.routines.read().await;
        let stats = self.stats.read().await;

        RoutineStats {
            total_routines: routines.len(),
            active_routines: routines.iter().filter(|r| r.enabled).count(),
            total_triggers: stats.total_triggers,
        }
    }
}

impl Default for RoutineEngine {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistiques des routines
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct RoutineStats {
    pub total_routines: usize,
    pub active_routines: usize,
    pub total_triggers: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_routine_creation() {
        let trigger = RoutineTrigger {
            pattern: RoutinePattern::Daily,
            time_of_day: Some(TimeOfDay::Morning),
            hour: Some(9),
            minute: None,
            conditions: vec![],
        };

        let routine = Routine::new("test", "Test Routine", trigger);
        assert!(routine.enabled);
    }

    #[tokio::test]
    async fn test_routine_engine() {
        let engine = RoutineEngine::new();
        engine.load_default_routines().await;

        let routines = engine.all_routines().await;
        assert!(!routines.is_empty());
    }
}
