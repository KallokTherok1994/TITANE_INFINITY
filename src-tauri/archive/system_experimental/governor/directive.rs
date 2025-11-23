// TITANE∞ v8.0 - Governor Engine: Directive Generation

pub fn build_governor_directive(regulation: f64, deviation: f64, homeostasis: f64) -> String {
    if homeostasis > 0.75 {
        return "Maintenir l'équilibre actuel.".to_string();
    }
    if regulation > 0.6 {
        return "Ralentir et stabiliser les processus internes.".to_string();
    if deviation > 0.6 {
        return "Réduire la dérive cognitive, recentrer les axes.".to_string();
    if homeostasis < 0.4 {
        return "Renforcer la stabilité avant progression.".to_string();
    "Continuer avec vigilance et ajustements légers.".to_string()
}
