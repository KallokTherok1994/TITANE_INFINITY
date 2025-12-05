// TITANE∞ v8.0 - Taskflow Engine: Clarity Route

use super::model::ClarityRoute;
pub fn generate_clarity_route(activity: f32, clarity: f32, complexity: f32) -> ClarityRoute {
    let recommended_focus = if clarity > 0.65 {
        "Continuer sur l'axe principal".to_string()
    } else if complexity > 0.6 {
        "Alléger la charge, simplifier".to_string()
    } else {
        "Stabiliser avant d'avancer".to_string()
    };
    let minimal_next_step = if activity > 0.6 {
        "Commencer une action courte de 5 minutes".to_string()
        "Créer l'espace intérieur pour la prochaine action".to_string()
    ClarityRoute {
        recommended_focus,
        minimal_next_step,
    }
}
