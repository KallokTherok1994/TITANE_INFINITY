// TITANE∞ v8.0 - Mission Engine: Directive Generation

pub fn build_mission_directive(axis: f64, vector: f64, coherence: f64) -> String {
    if coherence > 0.75 {
        return "Consolider la trajectoire actuelle.".to_string();
    }

    if vector > axis {
        return "Accroître l'élan évolutif dans la direction actuelle.".to_string();
    }

    if axis > 0.6 && coherence < 0.5 {
        return "Stabiliser l'axe interne avant d'avancer.".to_string();
    }

    "Ajuster la direction et clarifier la prochaine étape.".to_string()
}
