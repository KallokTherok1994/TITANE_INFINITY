// Copyright (C) 2024 Soan Kabirou KPADE
// SPDX-License-Identifier: MIT OR Apache-2.0

//! Détection dissonances cognitives

#![allow(unused_imports)]
#![allow(dead_code)]

use super::harmonic_state::HarmonicState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dissonance {
    pub source: String,
    pub severity: f32,
    pub description: String,
}

pub struct DissonanceDetector {
    threshold: f32,
}

impl DissonanceDetector {
    pub fn new(threshold: f32) -> Self {
        Self { threshold }
    }

    pub async fn detect(&self, state: &HarmonicState) -> Vec<Dissonance> {
        let mut dissonances = Vec::new();

        if state.cognitive_resonance < self.threshold {
            dissonances.push(Dissonance {
                source: "cognitive".to_string(),
                severity: self.threshold - state.cognitive_resonance,
                description: "Low cognitive resonance".to_string(),
            });
        }

        if state.logical_alignment < self.threshold {
            dissonances.push(Dissonance {
                source: "logical".to_string(),
                severity: self.threshold - state.logical_alignment,
                description: "Logical inconsistency detected".to_string(),
            });
        }

        dissonances
    }
}

impl Default for DissonanceDetector {
    fn default() -> Self {
        Self::new(0.5)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dissonance_detector_default() {
        let detector = DissonanceDetector::default();
        assert_eq!(detector.threshold, 0.5);
    }

    #[test]
    fn test_dissonance_detector_new() {
        let detector = DissonanceDetector::new(0.7);
        assert_eq!(detector.threshold, 0.7);
    }

    #[tokio::test]
    async fn test_detect_no_dissonance() {
        let detector = DissonanceDetector::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.8;
        state.logical_alignment = 0.8;

        let dissonances = detector.detect(&state).await;
        assert!(dissonances.is_empty());
    }

    #[tokio::test]
    async fn test_detect_cognitive_dissonance() {
        let detector = DissonanceDetector::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.3; // Below threshold

        let dissonances = detector.detect(&state).await;
        assert!(!dissonances.is_empty());
        assert!(dissonances.iter().any(|d| d.source == "cognitive"));
    }

    #[tokio::test]
    async fn test_detect_logical_dissonance() {
        let detector = DissonanceDetector::default();
        let mut state = HarmonicState::default();
        state.logical_alignment = 0.2; // Below threshold

        let dissonances = detector.detect(&state).await;
        assert!(!dissonances.is_empty());
        assert!(dissonances.iter().any(|d| d.source == "logical"));
    }

    #[tokio::test]
    async fn test_detect_multiple_dissonances() {
        let detector = DissonanceDetector::default();
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.2;
        state.logical_alignment = 0.3;

        let dissonances = detector.detect(&state).await;
        assert_eq!(dissonances.len(), 2);
    }

    #[tokio::test]
    async fn test_dissonance_severity_calculation() {
        let detector = DissonanceDetector::new(0.6);
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.4; // severity = 0.6 - 0.4 = 0.2

        let dissonances = detector.detect(&state).await;
        assert!(!dissonances.is_empty());
        let cog_diss = dissonances
            .iter()
            .find(|d| d.source == "cognitive")
            .unwrap();
        assert!((cog_diss.severity - 0.2).abs() < 0.01);
    }

    #[test]
    fn test_dissonance_structure() {
        let dissonance = Dissonance {
            source: "test".to_string(),
            severity: 0.5,
            description: "Test dissonance".to_string(),
        };

        assert_eq!(dissonance.source, "test");
        assert_eq!(dissonance.severity, 0.5);
        assert_eq!(dissonance.description, "Test dissonance");
    }

    #[test]
    fn test_dissonance_clone() {
        let dissonance = Dissonance {
            source: "original".to_string(),
            severity: 0.3,
            description: "Clone test".to_string(),
        };

        let cloned = dissonance.clone();
        assert_eq!(cloned.source, "original");
        assert_eq!(cloned.severity, 0.3);
    }

    #[tokio::test]
    async fn test_high_threshold_more_sensitive() {
        let detector = DissonanceDetector::new(0.8);
        let mut state = HarmonicState::default();
        state.cognitive_resonance = 0.6; // Above 0.5 but below 0.8

        let dissonances = detector.detect(&state).await;
        assert!(!dissonances.is_empty()); // Should detect dissonance
    }
}
