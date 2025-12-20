#![allow(unused_imports)]
#![allow(dead_code)]
// ═══════════════════════════════════════════════════════════════
//   CYCLE DEFINITIONS — Daily, Weekly, Monthly, Seasonal
//   SUPER PROMPT #16
// ═══════════════════════════════════════════════════════════════

use chrono::{DateTime, Datelike, Local, Timelike};
use serde::{Deserialize, Serialize};

/// Daily Phase (Circadian Rhythm)
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum DailyPhase {
    Dawn,      // 5-7h
    Morning,   // 7-12h
    Noon,      // 12-14h
    Afternoon, // 14-18h
    Dusk,      // 18-20h
    Night,     // 20-5h
}

impl DailyPhase {
    pub fn from_hour(hour: u32) -> Self {
        match hour {
            5..=6 => DailyPhase::Dawn,
            7..=11 => DailyPhase::Morning,
            12..=13 => DailyPhase::Noon,
            14..=17 => DailyPhase::Afternoon,
            18..=19 => DailyPhase::Dusk,
            _ => DailyPhase::Night,
        }
    }

    pub fn cognitive_mode(&self) -> CognitiveMode {
        match self {
            DailyPhase::Dawn => CognitiveMode::Creative,
            DailyPhase::Morning => CognitiveMode::Analytical,
            DailyPhase::Noon => CognitiveMode::Peak,
            DailyPhase::Afternoon => CognitiveMode::Execution,
            DailyPhase::Dusk => CognitiveMode::Synthesis,
            DailyPhase::Night => CognitiveMode::Consolidation,
        }
    }
}

/// Weekly Phase
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum WeeklyPhase {
    Monday,    // Structuration
    Tuesday,   // Production
    Wednesday, // Créativité
    Thursday,  // Optimisation
    Friday,    // Synthèse
    Weekend,   // Régénération
}

impl WeeklyPhase {
    pub fn from_date(date: &DateTime<Local>) -> Self {
        match date.weekday() {
            chrono::Weekday::Mon => WeeklyPhase::Monday,
            chrono::Weekday::Tue => WeeklyPhase::Tuesday,
            chrono::Weekday::Wed => WeeklyPhase::Wednesday,
            chrono::Weekday::Thu => WeeklyPhase::Thursday,
            chrono::Weekday::Fri => WeeklyPhase::Friday,
            _ => WeeklyPhase::Weekend,
        }
    }

    pub fn cognitive_focus(&self) -> &'static str {
        match self {
            WeeklyPhase::Monday => "Structuration",
            WeeklyPhase::Tuesday => "Production",
            WeeklyPhase::Wednesday => "Créativité",
            WeeklyPhase::Thursday => "Optimisation",
            WeeklyPhase::Friday => "Synthèse",
            WeeklyPhase::Weekend => "Régénération",
        }
    }
}

/// Monthly Phase
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum MonthlyPhase {
    Week1, // Élans
    Week2, // Focus
    Week3, // Consolidation
    Week4, // Libération
}

impl MonthlyPhase {
    pub fn from_date(date: &DateTime<Local>) -> Self {
        let day = date.day();
        match day {
            1..=7 => MonthlyPhase::Week1,
            8..=14 => MonthlyPhase::Week2,
            15..=21 => MonthlyPhase::Week3,
            _ => MonthlyPhase::Week4,
        }
    }
}

/// Seasonal Phase
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum SeasonalPhase {
    Spring, // Expansion
    Summer, // Intensité
    Autumn, // Récolte
    Winter, // Introspection
}

impl SeasonalPhase {
    pub fn from_date(date: &DateTime<Local>) -> Self {
        let month = date.month();
        match month {
            3..=5 => SeasonalPhase::Spring,
            6..=8 => SeasonalPhase::Summer,
            9..=11 => SeasonalPhase::Autumn,
            _ => SeasonalPhase::Winter,
        }
    }

    pub fn cognitive_tendency(&self) -> &'static str {
        match self {
            SeasonalPhase::Spring => "Expansion",
            SeasonalPhase::Summer => "Intensité",
            SeasonalPhase::Autumn => "Récolte",
            SeasonalPhase::Winter => "Introspection",
        }
    }
}

/// Cognitive Mode
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CognitiveMode {
    Creative,
    Analytical,
    Peak,
    Execution,
    Synthesis,
    Consolidation,
}

/// Complete Cycle State
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CycleState {
    pub daily_phase: DailyPhase,
    pub weekly_phase: WeeklyPhase,
    pub monthly_phase: MonthlyPhase,
    pub seasonal_phase: SeasonalPhase,
    pub cognitive_mode: CognitiveMode,
    pub timestamp: i64,
}

impl CycleState {
    pub fn current() -> Self {
        let now = Local::now();
        // In tests we want deterministic behavior (no dependence on local time).
        let daily = if cfg!(test) {
            DailyPhase::Noon
        } else {
            DailyPhase::from_hour(now.hour())
        };

        Self {
            daily_phase: daily,
            weekly_phase: WeeklyPhase::from_date(&now),
            monthly_phase: MonthlyPhase::from_date(&now),
            seasonal_phase: SeasonalPhase::from_date(&now),
            cognitive_mode: daily.cognitive_mode(),
            timestamp: now.timestamp(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // ─────────────────────────────────────────────────────────────
    // DailyPhase Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_daily_phase() {
        assert_eq!(DailyPhase::from_hour(8), DailyPhase::Morning);
        assert_eq!(DailyPhase::from_hour(13), DailyPhase::Noon);
        assert_eq!(DailyPhase::from_hour(22), DailyPhase::Night);
    }

    #[test]
    fn test_daily_phase_dawn() {
        assert_eq!(DailyPhase::from_hour(5), DailyPhase::Dawn);
        assert_eq!(DailyPhase::from_hour(6), DailyPhase::Dawn);
    }

    #[test]
    fn test_daily_phase_morning() {
        assert_eq!(DailyPhase::from_hour(7), DailyPhase::Morning);
        assert_eq!(DailyPhase::from_hour(11), DailyPhase::Morning);
    }

    #[test]
    fn test_daily_phase_noon() {
        assert_eq!(DailyPhase::from_hour(12), DailyPhase::Noon);
        assert_eq!(DailyPhase::from_hour(13), DailyPhase::Noon);
    }

    #[test]
    fn test_daily_phase_afternoon() {
        assert_eq!(DailyPhase::from_hour(14), DailyPhase::Afternoon);
        assert_eq!(DailyPhase::from_hour(17), DailyPhase::Afternoon);
    }

    #[test]
    fn test_daily_phase_dusk() {
        assert_eq!(DailyPhase::from_hour(18), DailyPhase::Dusk);
        assert_eq!(DailyPhase::from_hour(19), DailyPhase::Dusk);
    }

    #[test]
    fn test_daily_phase_night() {
        assert_eq!(DailyPhase::from_hour(20), DailyPhase::Night);
        assert_eq!(DailyPhase::from_hour(0), DailyPhase::Night);
        assert_eq!(DailyPhase::from_hour(4), DailyPhase::Night);
    }

    #[test]
    fn test_daily_phase_clone() {
        let phase = DailyPhase::Morning;
        let cloned = phase.clone();
        assert_eq!(phase, cloned);
    }

    #[test]
    fn test_daily_phase_copy() {
        let phase = DailyPhase::Morning;
        let copied = phase;
        assert_eq!(phase, copied);
    }

    #[test]
    fn test_daily_phase_debug() {
        let debug = format!("{:?}", DailyPhase::Dawn);
        assert_eq!(debug, "Dawn");
    }

    #[test]
    fn test_daily_phase_serialization() {
        let phase = DailyPhase::Noon;
        let json = serde_json::to_string(&phase)
            .expect("serialize DailyPhase should succeed");
        let restored: DailyPhase = serde_json::from_str(&json)
            .expect("deserialize DailyPhase should succeed");
        assert_eq!(phase, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // CognitiveMode Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cognitive_mode() {
        assert_eq!(DailyPhase::Dawn.cognitive_mode(), CognitiveMode::Creative);
        assert_eq!(DailyPhase::Noon.cognitive_mode(), CognitiveMode::Peak);
    }

    #[test]
    fn test_cognitive_mode_morning() {
        assert_eq!(
            DailyPhase::Morning.cognitive_mode(),
            CognitiveMode::Analytical
        );
    }

    #[test]
    fn test_cognitive_mode_afternoon() {
        assert_eq!(
            DailyPhase::Afternoon.cognitive_mode(),
            CognitiveMode::Execution
        );
    }

    #[test]
    fn test_cognitive_mode_dusk() {
        assert_eq!(DailyPhase::Dusk.cognitive_mode(), CognitiveMode::Synthesis);
    }

    #[test]
    fn test_cognitive_mode_night() {
        assert_eq!(
            DailyPhase::Night.cognitive_mode(),
            CognitiveMode::Consolidation
        );
    }

    #[test]
    fn test_cognitive_mode_clone() {
        let mode = CognitiveMode::Peak;
        let cloned = mode.clone();
        assert_eq!(mode, cloned);
    }

    #[test]
    fn test_cognitive_mode_copy() {
        let mode = CognitiveMode::Creative;
        let copied = mode;
        assert_eq!(mode, copied);
    }

    #[test]
    fn test_cognitive_mode_debug() {
        let debug = format!("{:?}", CognitiveMode::Analytical);
        assert_eq!(debug, "Analytical");
    }

    #[test]
    fn test_cognitive_mode_serialization() {
        let mode = CognitiveMode::Synthesis;
        let json = serde_json::to_string(&mode)
            .expect("serialize CognitiveMode should succeed");
        let restored: CognitiveMode = serde_json::from_str(&json)
            .expect("deserialize CognitiveMode should succeed");
        assert_eq!(mode, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // WeeklyPhase Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_weekly_phase_cognitive_focus_monday() {
        assert_eq!(WeeklyPhase::Monday.cognitive_focus(), "Structuration");
    }

    #[test]
    fn test_weekly_phase_cognitive_focus_tuesday() {
        assert_eq!(WeeklyPhase::Tuesday.cognitive_focus(), "Production");
    }

    #[test]
    fn test_weekly_phase_cognitive_focus_wednesday() {
        assert_eq!(WeeklyPhase::Wednesday.cognitive_focus(), "Créativité");
    }

    #[test]
    fn test_weekly_phase_cognitive_focus_thursday() {
        assert_eq!(WeeklyPhase::Thursday.cognitive_focus(), "Optimisation");
    }

    #[test]
    fn test_weekly_phase_cognitive_focus_friday() {
        assert_eq!(WeeklyPhase::Friday.cognitive_focus(), "Synthèse");
    }

    #[test]
    fn test_weekly_phase_cognitive_focus_weekend() {
        assert_eq!(WeeklyPhase::Weekend.cognitive_focus(), "Régénération");
    }

    #[test]
    fn test_weekly_phase_clone() {
        let phase = WeeklyPhase::Friday;
        let cloned = phase.clone();
        assert_eq!(phase, cloned);
    }

    #[test]
    fn test_weekly_phase_copy() {
        let phase = WeeklyPhase::Monday;
        let copied = phase;
        assert_eq!(phase, copied);
    }

    #[test]
    fn test_weekly_phase_debug() {
        let debug = format!("{:?}", WeeklyPhase::Wednesday);
        assert_eq!(debug, "Wednesday");
    }

    #[test]
    fn test_weekly_phase_serialization() {
        let phase = WeeklyPhase::Thursday;
        let json = serde_json::to_string(&phase)
            .expect("serialize WeeklyPhase should succeed");
        let restored: WeeklyPhase = serde_json::from_str(&json)
            .expect("deserialize WeeklyPhase should succeed");
        assert_eq!(phase, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // MonthlyPhase Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_monthly_phase_clone() {
        let phase = MonthlyPhase::Week1;
        let cloned = phase.clone();
        assert_eq!(phase, cloned);
    }

    #[test]
    fn test_monthly_phase_copy() {
        let phase = MonthlyPhase::Week2;
        let copied = phase;
        assert_eq!(phase, copied);
    }

    #[test]
    fn test_monthly_phase_debug() {
        let debug = format!("{:?}", MonthlyPhase::Week3);
        assert_eq!(debug, "Week3");
    }

    #[test]
    fn test_monthly_phase_serialization() {
        let phase = MonthlyPhase::Week4;
        let json = serde_json::to_string(&phase)
            .expect("serialize MonthlyPhase should succeed");
        let restored: MonthlyPhase = serde_json::from_str(&json)
            .expect("deserialize MonthlyPhase should succeed");
        assert_eq!(phase, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // SeasonalPhase Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_seasonal_phase_cognitive_tendency_spring() {
        assert_eq!(SeasonalPhase::Spring.cognitive_tendency(), "Expansion");
    }

    #[test]
    fn test_seasonal_phase_cognitive_tendency_summer() {
        assert_eq!(SeasonalPhase::Summer.cognitive_tendency(), "Intensité");
    }

    #[test]
    fn test_seasonal_phase_cognitive_tendency_autumn() {
        assert_eq!(SeasonalPhase::Autumn.cognitive_tendency(), "Récolte");
    }

    #[test]
    fn test_seasonal_phase_cognitive_tendency_winter() {
        assert_eq!(SeasonalPhase::Winter.cognitive_tendency(), "Introspection");
    }

    #[test]
    fn test_seasonal_phase_clone() {
        let phase = SeasonalPhase::Spring;
        let cloned = phase.clone();
        assert_eq!(phase, cloned);
    }

    #[test]
    fn test_seasonal_phase_copy() {
        let phase = SeasonalPhase::Summer;
        let copied = phase;
        assert_eq!(phase, copied);
    }

    #[test]
    fn test_seasonal_phase_debug() {
        let debug = format!("{:?}", SeasonalPhase::Autumn);
        assert_eq!(debug, "Autumn");
    }

    #[test]
    fn test_seasonal_phase_serialization() {
        let phase = SeasonalPhase::Winter;
        let json = serde_json::to_string(&phase)
            .expect("serialize SeasonalPhase should succeed");
        let restored: SeasonalPhase = serde_json::from_str(&json)
            .expect("deserialize SeasonalPhase should succeed");
        assert_eq!(phase, restored);
    }

    // ─────────────────────────────────────────────────────────────
    // CycleState Tests
    // ─────────────────────────────────────────────────────────────

    #[test]
    fn test_cycle_state_current() {
        let state = CycleState::current();
        assert!(state.timestamp > 0);
    }

    #[test]
    fn test_cycle_state_clone() {
        let state = CycleState::current();
        let cloned = state.clone();
        assert_eq!(state.timestamp, cloned.timestamp);
    }

    #[test]
    fn test_cycle_state_debug() {
        let state = CycleState::current();
        let debug = format!("{:?}", state);
        assert!(debug.contains("CycleState"));
    }

    #[test]
    fn test_cycle_state_serialization() {
        let state = CycleState::current();
        let json = serde_json::to_string(&state)
            .expect("serialize CycleState should succeed");
        let restored: CycleState = serde_json::from_str(&json)
            .expect("deserialize CycleState should succeed");
        assert_eq!(state.timestamp, restored.timestamp);
    }

    #[test]
    fn test_cycle_state_daily_phase_cognitive_mode_sync() {
        let state = CycleState::current();
        assert_eq!(state.daily_phase.cognitive_mode(), state.cognitive_mode);
    }
}
