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
        let daily = DailyPhase::from_hour(now.hour());

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

    #[test]
    fn test_daily_phase() {
        assert_eq!(DailyPhase::from_hour(8), DailyPhase::Morning);
        assert_eq!(DailyPhase::from_hour(13), DailyPhase::Noon);
        assert_eq!(DailyPhase::from_hour(22), DailyPhase::Night);
    }

    #[test]
    fn test_cognitive_mode() {
        assert_eq!(DailyPhase::Dawn.cognitive_mode(), CognitiveMode::Creative);
        assert_eq!(DailyPhase::Noon.cognitive_mode(), CognitiveMode::Peak);
    }
}
