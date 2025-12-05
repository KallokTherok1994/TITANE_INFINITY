// TITANE∞ v8.0 - Meaning Engine: Narrative Generation

pub fn generate_narrative(align: f64, depth: f64, ori: f64) -> String {
    if align > 0.7 && depth > 0.6 {
        "Le système avance avec cohérence et présence.".to_string()
    } else if align < 0.4 {
        "Recherche d'un meilleur point de cohérence.".to_string()
    } else if depth < 0.4 {
        "Exploration intérieure encore superficielle.".to_string()
    } else if ori > 0.7 {
        "Direction claire et stable.".to_string()
    } else {
        "Orientation en ajustement.".to_string()
    }
}
