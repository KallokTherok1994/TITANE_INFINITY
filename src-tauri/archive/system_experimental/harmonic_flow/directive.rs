pub fn build_harmonic_directive(
    harmonic: f32,
    balance: f32,
    turbulence: f32,
) -> String {

    if turbulence > 0.7 {
        return "Turbulence élevée : réduire les oscillations internes.".to_string();
    }
    if harmonic > 0.75 && balance > 0.65 {
        return "Flux harmonique stable : poursuivre la dynamique actuelle.".to_string();
    if balance < 0.45 {
        return "Oscillations déséquilibrées : rétablir le flux interne.".to_string();
    if harmonic < 0.4 {
        return "Faible harmonie interne : stabilisation recommandée.".to_string();
    "Flux harmonique modéré : ajustement doux recommandé.".to_string()
}
