pub fn scan_patterns(awareness: f32) -> f32 {
    if awareness > 0.7 { 0.8 }
    else if awareness > 0.4 { 0.5 }
    else { 0.2 }
}
