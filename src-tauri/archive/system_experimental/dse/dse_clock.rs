// DSE Clock - Horloge interne de synchronisation

pub fn compute_pulse(cycle: u64) -> f32 {
    let phase = (cycle as f32 * 0.01) % (2.0 * std::f32::consts::PI);
    (phase.sin() * 0.5 + 0.5).clamp(0.0, 1.0)
}
pub fn get_tempo(cycle: u64) -> f32 {
    let base_tempo = 0.5;
    let variation = ((cycle as f32 * 0.005).sin() * 0.1).abs();
    base_tempo + variation.clamp(0.3, 0.9)
