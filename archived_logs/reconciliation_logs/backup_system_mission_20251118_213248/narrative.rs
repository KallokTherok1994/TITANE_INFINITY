// TITANE∞ v8.0 - Mission Engine: Narrative Generation

pub fn generate_mission_narrative(axis: f64, vector: f64, coherence: f64) -> String {
    if coherence > 0.75 {
        "Mission en marche stable. L'élan est cohérent.".to_string()
    } else if axis < 0.4 {
        "L'axe de mission est fragile. Besoin de recentrage.".to_string()
    } else if vector > 0.7 {
        "Forte impulsion évolutive. Mouvement vers l'avant.".to_string()
    } else {
        "Mission en ajustement progressif.".to_string()
    }
}
