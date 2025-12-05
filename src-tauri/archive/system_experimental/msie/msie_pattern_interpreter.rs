pub fn interpret_pattern(pattern_value: f32) -> String {
    if pattern_value > 0.8 { "Pattern fort et cohérent".to_string() }
    else if pattern_value > 0.5 { "Pattern modéré".to_string() }
    else { "Pattern faible".to_string() }
}
