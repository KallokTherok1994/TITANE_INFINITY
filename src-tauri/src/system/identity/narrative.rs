// TITANE∞ v8.0 - Identity Engine: Narrative Generation

pub fn generate_identity_narrative(core: f64, align: f64, cont: f64) -> String {
    if core > 0.7 && align > 0.7 {
        "Identité stable et cohérente.".to_string()
    } else if core < 0.4 {
        "Noyau identitaire faible, recentrage possible.".to_string()
    } else if cont < 0.4 {
        "Continuité instable, direction à stabiliser.".to_string()
    } else {
        "Identité en évolution harmonieuse.".to_string()
    }
}
