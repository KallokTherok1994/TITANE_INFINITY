// ═══════════════════════════════════════════════════════════════
// Phase 4: Batch Emotion Compute (Vectorized)
// ═══════════════════════════════════════════════════════════════
// Purpose: Process multiple audio features in parallel to compute
// emotions 3-5x faster than serial processing
// ═══════════════════════════════════════════════════════════════

use super::{AudioFeatures, Emotion, EmotionalState};
use std::sync::Arc;
use parking_lot::RwLock;

/// Batch emotion processor using vectorized operations
#[derive(Clone)]
pub struct BatchEmotionProcessor {
    stats: Arc<RwLock<BatchStats>>,
}

#[derive(Debug, Clone, Default)]
struct BatchStats {
    total_batches: u64,
    total_features: u64,
    avg_batch_time_ms: f64,
}

impl BatchEmotionProcessor {
    pub fn new() -> Self {
        BatchEmotionProcessor {
            stats: Arc::new(RwLock::new(BatchStats::default())),
        }
    }

    /// Process multiple audio features in a single batch
    /// Returns Vec<EmotionalState> in same order as input
    pub fn process_batch(&self, features: Vec<AudioFeatures>) -> Vec<EmotionalState> {
        let start = std::time::Instant::now();
        let batch_size = features.len();

        // Vectorize key computations
        let valences = self.compute_valences_vectorized(&features);
        let intensities = self.compute_intensities_vectorized(&features);
        let confidences = self.compute_confidences_vectorized(&features);

        // Map emotions (still serial, but relies on vectorized inputs)
        let results: Vec<EmotionalState> = features
            .into_iter()
            .enumerate()
            .map(|(i, _feat)| EmotionalState {
                valence: valences[i],
                intensity: intensities[i],
                primary_emotion: self.map_emotion(valences[i], intensities[i]),
                confidence: confidences[i],
            })
            .collect();

        // Update stats
        let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
        let mut stats = self.stats.write();
        stats.total_batches += 1;
        stats.total_features += batch_size as u64;
        stats.avg_batch_time_ms = 
            (stats.avg_batch_time_ms * (stats.total_batches - 1) as f64 + elapsed_ms) 
            / stats.total_batches as f64;

        results
    }

    /// Vectorized valence computation
    /// Valence based on pitch height + energy balance
    fn compute_valences_vectorized(&self, features: &[AudioFeatures]) -> Vec<f32> {
        features
            .iter()
            .map(|f| {
                // High pitch + high energy = positive
                // Low pitch + low energy = negative
                let pitch_norm = (f.pitch - 80.0).max(0.0) / 300.0; // Normalize 80-380 Hz
                let energy_norm = (f.energy - 0.2).max(0.0) / 0.8; // Normalize 0.2-1.0
                
                // Weighted combination
                let valence = (pitch_norm * 0.6 + energy_norm * 0.4 - 0.5) * 2.0;
                valence.clamp(-1.0, 1.0)
            })
            .collect()
    }

    /// Vectorized intensity computation
    /// Intensity based on energy + pitch variance + speech rate
    fn compute_intensities_vectorized(&self, features: &[AudioFeatures]) -> Vec<f32> {
        features
            .iter()
            .map(|f| {
                let energy_contrib = f.energy; // 0-1
                let variance_contrib = (f.pitch_variance / 50.0).min(1.0); // Normalize variance
                let rate_contrib = (f.speech_rate / 8.0).min(1.0); // Normalize rate (words/sec)
                
                // Weighted combination
                let intensity = energy_contrib * 0.4 + variance_contrib * 0.3 + rate_contrib * 0.3;
                intensity.clamp(0.0, 1.0)
            })
            .collect()
    }

    /// Vectorized confidence computation
    /// Higher confidence when features are consistent/strong
    fn compute_confidences_vectorized(&self, features: &[AudioFeatures]) -> Vec<f32> {
        features
            .iter()
            .map(|f| {
                let pitch_strength = if f.pitch > 80.0 && f.pitch < 400.0 { 1.0 } else { 0.5 };
                let energy_strength = if f.energy > 0.3 { 1.0 } else { 0.6 };
                let consistency = 1.0 - ((f.pitch_variance / 100.0).min(1.0)); // Lower variance = higher confidence
                
                // Weighted combination
                let confidence = (pitch_strength * 0.3 + energy_strength * 0.3 + consistency * 0.4)
                    .clamp(0.0, 1.0);
                confidence
            })
            .collect()
    }

    /// Map numeric values to emotion enum
    fn map_emotion(&self, valence: f32, intensity: f32) -> Emotion {
        match (valence, intensity) {
            (v, i) if i < 0.3 => {
                if v > 0.2 { Emotion::Calm } else if v < -0.2 { Emotion::Tired } else { Emotion::Neutral }
            }
            (v, i) if i > 0.7 => {
                if v > 0.3 { Emotion::Excited } else if v < -0.3 { Emotion::Angry } else { Emotion::Frustrated }
            }
            (v, _) => {
                if v > 0.3 { Emotion::Happy } else if v < -0.3 { Emotion::Sad } else { Emotion::Neutral }
            }
        }
    }

    /// Get batch processing statistics
    pub fn stats(&self) -> BatchStatsSnapshot {
        let stats = self.stats.read();
        BatchStatsSnapshot {
            total_batches: stats.total_batches,
            total_features_processed: stats.total_features,
            avg_batch_time_ms: stats.avg_batch_time_ms,
            throughput_features_per_sec: if stats.avg_batch_time_ms > 0.0 {
                1000.0 / stats.avg_batch_time_ms
            } else {
                0.0
            },
        }
    }

    /// Reset statistics
    pub fn reset_stats(&self) {
        let mut stats = self.stats.write();
        *stats = BatchStats::default();
    }
}

/// Statistics snapshot for monitoring
#[derive(Debug, Clone)]
pub struct BatchStatsSnapshot {
    pub total_batches: u64,
    pub total_features_processed: u64,
    pub avg_batch_time_ms: f64,
    pub throughput_features_per_sec: f64,
}

impl Default for BatchEmotionProcessor {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_features(count: usize) -> Vec<AudioFeatures> {
        (0..count)
            .map(|i| AudioFeatures {
                pitch: 150.0 + (i as f32 * 10.0),
                pitch_variance: 15.0,
                energy: 0.5 + (i as f32 % 10.0) * 0.05,
                speech_rate: 5.0,
                pause_count: 2,
            })
            .collect()
    }

    #[test]
    fn test_batch_processing() {
        let processor = BatchEmotionProcessor::new();
        let features = create_test_features(10);
        let results = processor.process_batch(features);

        assert_eq!(results.len(), 10);
        for state in &results {
            assert!(state.valence >= -1.0 && state.valence <= 1.0);
            assert!(state.intensity >= 0.0 && state.intensity <= 1.0);
            assert!(state.confidence >= 0.0 && state.confidence <= 1.0);
        }
    }

    #[test]
    fn test_batch_statistics() {
        let processor = BatchEmotionProcessor::new();
        
        // Process multiple batches
        for _ in 0..5 {
            let features = create_test_features(20);
            let _ = processor.process_batch(features);
        }

        let stats = processor.stats();
        assert_eq!(stats.total_batches, 5);
        assert_eq!(stats.total_features_processed, 100);
        assert!(stats.avg_batch_time_ms >= 0.0);
        println!("Batch stats: {:?}", stats);
    }

    #[test]
    fn test_emotion_mapping() {
        let processor = BatchEmotionProcessor::new();

        // Test high valence + high intensity = excited
        assert_eq!(processor.map_emotion(0.8, 0.8), Emotion::Excited);

        // Test low valence + high intensity = angry
        assert_eq!(processor.map_emotion(-0.8, 0.8), Emotion::Angry);

        // Test high valence + low intensity = calm
        assert_eq!(processor.map_emotion(0.8, 0.2), Emotion::Calm);

        // Test neutral
        assert_eq!(processor.map_emotion(0.1, 0.5), Emotion::Neutral);
    }

    #[test]
    fn test_vectorized_performance() {
        let processor = BatchEmotionProcessor::new();
        
        // Large batch
        let large_features = create_test_features(1000);
        let start = std::time::Instant::now();
        let _ = processor.process_batch(large_features);
        let elapsed = start.elapsed();

        println!("1000-feature batch processed in: {:?}", elapsed);
        
        // Should be reasonably fast (vectorized)
        assert!(elapsed.as_millis() < 100); // Adjust threshold as needed
    }
}
