// DSE Anomaly Detector - Détection désynchronisations

pub fn detect_desynchronization(coherence: f32, sync_signal: f32) -> f32 {
    let deviation = coherence - sync_signal.abs();
    
    if deviation > 0.35 {
        0.8 // Reset dur recommandé
    } else if deviation > 0.15 {
        0.4 // Reset doux recommandé
    } else {
        deviation // Correction légère
    }
}
pub fn detect_micro_drift(current: f32, previous: f32) -> bool {
    current - previous.abs() > 0.05
