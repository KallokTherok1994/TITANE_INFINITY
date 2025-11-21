pub fn predict_anomaly(convergence: f32, alignment: f32) -> f32 {
    let stability = convergence + alignment / 2.0;
    if stability < 0.4 { 0.8 }
    else if stability > 0.7 { 0.1 }
    else { 1.0 - stability }
}
