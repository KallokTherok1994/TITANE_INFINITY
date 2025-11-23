pub fn build_micro_directive(
    micro_stability: f32,
    micro_balance: f32,
    micro_turbulence: f32,
) -> String {

    if micro_turbulence > 0.7 {
        return "Micro-instabilité détectée : réduire les sous-oscillations internes.".to_string();
    }
    if micro_stability > 0.75 && micro_balance > 0.65 {
        return "Micro-dynamique stable : flux interne optimal.".to_string();
    if micro_balance < 0.45 {
        return "Déséquilibre fin : ajustement subtil recommandé.".to_string();
    if micro_stability < 0.4 {
        return "Stabilité fragile : stabilisation micrométrique conseillée.".to_string();
    "Micro-dynamique modérée : poursuivre avec attention.".to_string()
}
