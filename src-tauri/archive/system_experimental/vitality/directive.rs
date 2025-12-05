pub fn build_energy_directive(
    vitality: f32,
    flow: f32,
    tension: f32,
) -> String {

    if tension > 0.75 {
        return "Réduire la charge interne : tension élevée détectée.".to_string();
    }
    if vitality > 0.7 && flow > 0.6 {
        return "Énergie stable et fluide : progression optimale.".to_string();
    if vitality < 0.4 {
        return "Vitalité réduite : stabilisation et recentrage recommandés.".to_string();
    if flow < 0.45 {
        return "Flux limité : activer une circulation interne plus douce.".to_string();
    "Énergie équilibrée : poursuivre le rythme actuel.".to_string()
}
