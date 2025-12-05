// TITANE∞ v8.0 - Autonomic Evolution Supervisor: Directive Generation

pub fn build_supervision_directive(stability: f32, coherence: f32, drift_risk: f32) -> String {
    if drift_risk > 0.7 {
        return "Ralentir l'évolution : risque de dérive élevé.".to_string();
    }
    if stability > 0.75 && coherence > 0.7 {
        return "Trajectoire stable : évolution fluide recommandée.".to_string();
    if stability < 0.45 {
        return "Stabiliser avant de poursuivre la maturation.".to_string();
    if coherence < 0.5 {
        return "Renforcer la cohérence interne avant progression.".to_string();
    "Évolution progressive et sous supervision active.".to_string()
}
