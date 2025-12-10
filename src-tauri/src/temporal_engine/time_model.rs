//! ═══════════════════════════════════════════════════════════════════════════════
//! TITANE∞ v20Ω — TIME MODEL
//! Super Prompt #18 — Modèle du temps multi-échelle
//! ═══════════════════════════════════════════════════════════════════════════════

use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio::sync::RwLock;

/// Échelle temporelle
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum TimeScale {
    /// Immédiat (< 1 minute)
    Immediate,
    /// Court terme (minutes à heures)
    ShortTerm,
    /// Moyen terme (heures à jours)
    MediumTerm,
    /// Long terme (jours à semaines)
    LongTerm,
    /// Stratégique (semaines à mois)
    Strategic,
    /// Existentiel (mois à années)
    Existential,
}

impl TimeScale {
    /// Durée typique en millisecondes
    pub fn typical_duration_ms(&self) -> u64 {
        match self {
            Self::Immediate => 60_000,           // 1 minute
            Self::ShortTerm => 3_600_000,        // 1 heure
            Self::MediumTerm => 86_400_000,      // 1 jour
            Self::LongTerm => 604_800_000,       // 1 semaine
            Self::Strategic => 2_592_000_000,    // 30 jours
            Self::Existential => 31_536_000_000, // 1 an
        }
    }
}

/// Moment dans le temps
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct Moment {
    pub timestamp_ms: u64,
    pub year: u16,
    pub month: u8,
    pub day: u8,
    pub hour: u8,
    pub minute: u8,
    pub second: u8,
    pub day_of_week: u8, // 0 = Sunday, 6 = Saturday
    pub day_of_year: u16,
    pub week_of_year: u8,
    pub is_weekend: bool,
    pub season: Season,
    pub time_of_day: TimeOfDay,
}

impl Moment {
    pub fn now() -> Self {
        let timestamp_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self::from_timestamp(timestamp_ms)
    }

    pub fn from_timestamp(timestamp_ms: u64) -> Self {
        // Calcul simplifié (approximatif pour la démo)
        let secs = timestamp_ms / 1000;
        let days_since_epoch = secs / 86400;

        // Approximation de l'année
        let year = 1970 + (days_since_epoch / 365) as u16;
        let day_of_year = (days_since_epoch % 365) as u16;

        // Approximation du mois et jour
        let month = (day_of_year / 30 + 1).min(12) as u8;
        let day = (day_of_year % 30 + 1).min(31) as u8;

        // Jour de la semaine
        let day_of_week = ((days_since_epoch + 4) % 7) as u8; // 1970-01-01 était un jeudi

        // Heure du jour
        let seconds_today = secs % 86400;
        let hour = (seconds_today / 3600) as u8;
        let minute = ((seconds_today % 3600) / 60) as u8;
        let second = (seconds_today % 60) as u8;

        // Week of year
        let week_of_year = (day_of_year / 7 + 1).min(52) as u8;

        // Weekend
        let is_weekend = day_of_week == 0 || day_of_week == 6;

        // Saison (hémisphère nord)
        let season = match month {
            3..=5 => Season::Spring,
            6..=8 => Season::Summer,
            9..=11 => Season::Autumn,
            _ => Season::Winter,
        };

        // Moment de la journée
        let time_of_day = match hour {
            5..=8 => TimeOfDay::EarlyMorning,
            9..=11 => TimeOfDay::Morning,
            12..=13 => TimeOfDay::Midday,
            14..=17 => TimeOfDay::Afternoon,
            18..=21 => TimeOfDay::Evening,
            22..=23 => TimeOfDay::Night,
            _ => TimeOfDay::LateNight,
        };

        Self {
            timestamp_ms,
            year,
            month,
            day,
            hour,
            minute,
            second,
            day_of_week,
            day_of_year,
            week_of_year,
            is_weekend,
            season,
            time_of_day,
        }
    }

    /// Distance temporelle vers un autre moment
    pub fn distance_to(&self, other: &Moment) -> i64 {
        other.timestamp_ms as i64 - self.timestamp_ms as i64
    }
}

/// Saison
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum Season {
    #[default]
    Spring,
    Summer,
    Autumn,
    Winter,
}

/// Moment de la journée
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub enum TimeOfDay {
    EarlyMorning,
    #[default]
    Morning,
    Midday,
    Afternoon,
    Evening,
    Night,
    LateNight,
}

impl TimeOfDay {
    /// Convertit une heure (0-23) en période de la journée appropriée
    pub fn from_hour(hour: u8) -> Self {
        match hour {
            0..=5 => Self::LateNight,    // 00:00-05:59
            6..=8 => Self::EarlyMorning, // 06:00-08:59
            9..=11 => Self::Morning,     // 09:00-11:59
            12..=13 => Self::Midday,     // 12:00-13:59
            14..=17 => Self::Afternoon,  // 14:00-17:59
            18..=20 => Self::Evening,    // 18:00-20:59
            21..=22 => Self::Night,      // 21:00-22:59
            _ => Self::LateNight,        // 23:00
        }
    }
}

/// Contexte temporel complet
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TemporalContext {
    pub now: Moment,
    pub session_start: Moment,
    pub session_duration_ms: u64,
    pub day_progress: f32, // 0.0 - 1.0
    pub week_progress: f32,
    pub month_progress: f32,
    pub year_progress: f32,
    pub cognitive_energy_estimate: f32, // 0.0 - 1.0
    pub optimal_for: Vec<ActivityType>,
}

impl Default for TemporalContext {
    fn default() -> Self {
        let now = Moment::now();
        Self {
            now: now.clone(),
            session_start: now,
            session_duration_ms: 0,
            day_progress: 0.5,
            week_progress: 0.5,
            month_progress: 0.5,
            year_progress: 0.5,
            cognitive_energy_estimate: 0.7,
            optimal_for: vec![ActivityType::Focus],
        }
    }
}

/// Type d'activité cognitive
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActivityType {
    Focus,          // Travail profond
    Creative,       // Créativité
    Administrative, // Tâches admin
    Social,         // Interactions
    Learning,       // Apprentissage
    Review,         // Révision
    Planning,       // Planification
    Rest,           // Repos
}

/// Modèle du temps
pub struct TimeModel {
    state: RwLock<TimeModelState>,
}

struct TimeModelState {
    current: Moment,
    session_start: Moment,
    reference_points: Vec<ReferencePoint>,
}

impl Default for TimeModelState {
    fn default() -> Self {
        let now = Moment::now();
        Self {
            current: now.clone(),
            session_start: now,
            reference_points: Vec::new(),
        }
    }
}

/// Point de référence temporel
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ReferencePoint {
    pub id: String,
    pub moment: Moment,
    pub label: String,
    pub significance: f32,
}

impl TimeModel {
    pub fn new() -> Self {
        Self {
            state: RwLock::new(TimeModelState::default()),
        }
    }

    /// Synchronise avec l'heure actuelle
    pub async fn sync_now(&self) {
        let now = Moment::now();
        let mut state = self.state.write().await;
        state.current = now;
    }

    /// Obtient le contexte temporel actuel
    pub async fn current_context(&self) -> TemporalContext {
        let state = self.state.read().await;
        let now = &state.current;
        let session_start = &state.session_start;

        // Calcul des progressions
        let day_progress = (now.hour as f32 * 60.0 + now.minute as f32) / (24.0 * 60.0);
        let week_progress = (now.day_of_week as f32 + day_progress) / 7.0;
        let month_progress = (now.day as f32 - 1.0 + day_progress) / 30.0;
        let year_progress = (now.day_of_year as f32 + day_progress) / 365.0;

        // Estimation de l'énergie cognitive
        let cognitive_energy = self.estimate_cognitive_energy(now);

        // Activités optimales pour ce moment
        let optimal_for = self.optimal_activities(now);

        TemporalContext {
            now: now.clone(),
            session_start: session_start.clone(),
            session_duration_ms: now.timestamp_ms.saturating_sub(session_start.timestamp_ms),
            day_progress,
            week_progress,
            month_progress,
            year_progress,
            cognitive_energy_estimate: cognitive_energy,
            optimal_for,
        }
    }

    /// Estime l'énergie cognitive basée sur le moment
    fn estimate_cognitive_energy(&self, moment: &Moment) -> f32 {
        // Modèle circadien simplifié
        let hour = moment.hour as f32;

        let base_energy = match moment.time_of_day {
            TimeOfDay::EarlyMorning => 0.6,
            TimeOfDay::Morning => 0.9,
            TimeOfDay::Midday => 0.7,
            TimeOfDay::Afternoon => 0.8,
            TimeOfDay::Evening => 0.6,
            TimeOfDay::Night => 0.4,
            TimeOfDay::LateNight => 0.2,
        };

        // Ajustement weekend
        let weekend_factor: f32 = if moment.is_weekend { 0.9 } else { 1.0 };

        // Pic cognitif vers 10h et 15h
        let circadian_bonus: f32 = if (9.0..=11.0).contains(&hour) || (14.0..=16.0).contains(&hour)
        {
            0.1
        } else {
            0.0
        };

        let result = base_energy * weekend_factor + circadian_bonus;
        result.min(1.0)
    }

    /// Détermine les activités optimales
    fn optimal_activities(&self, moment: &Moment) -> Vec<ActivityType> {
        match moment.time_of_day {
            TimeOfDay::EarlyMorning => vec![ActivityType::Planning, ActivityType::Review],
            TimeOfDay::Morning => vec![ActivityType::Focus, ActivityType::Creative],
            TimeOfDay::Midday => vec![ActivityType::Social, ActivityType::Administrative],
            TimeOfDay::Afternoon => vec![ActivityType::Focus, ActivityType::Learning],
            TimeOfDay::Evening => vec![ActivityType::Review, ActivityType::Creative],
            TimeOfDay::Night => vec![ActivityType::Rest, ActivityType::Review],
            TimeOfDay::LateNight => vec![ActivityType::Rest],
        }
    }

    /// Ajoute un point de référence
    pub async fn add_reference_point(&self, point: ReferencePoint) {
        let mut state = self.state.write().await;
        state.reference_points.push(point);
    }

    /// Calcule le temps jusqu'à un point de référence
    pub async fn time_until(&self, reference_id: &str) -> Option<i64> {
        let state = self.state.read().await;
        state
            .reference_points
            .iter()
            .find(|p| p.id == reference_id)
            .map(|p| state.current.distance_to(&p.moment))
    }

    /// Calcule le temps depuis un point de référence
    pub async fn time_since(&self, reference_id: &str) -> Option<i64> {
        let state = self.state.read().await;
        state
            .reference_points
            .iter()
            .find(|p| p.id == reference_id)
            .map(|p| -state.current.distance_to(&p.moment))
    }
}

impl Default for TimeModel {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_moment_now() {
        let moment = Moment::now();
        assert!(moment.timestamp_ms > 0);
        assert!(moment.year >= 2024);
    }

    #[test]
    fn test_time_scale_duration() {
        assert_eq!(TimeScale::Immediate.typical_duration_ms(), 60_000);
        assert_eq!(TimeScale::ShortTerm.typical_duration_ms(), 3_600_000);
    }

    #[tokio::test]
    async fn test_time_model_context() {
        let model = TimeModel::new();
        model.sync_now().await;
        let context = model.current_context().await;
        assert!(context.day_progress >= 0.0 && context.day_progress <= 1.0);
    }
}
