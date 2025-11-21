// kernel/identity.rs
// Collecte des signaux + normalisation pour le Kernel Profond

use crate::system::cortex_sync::CortexSyncState;
use crate::system::continuum::ContinuumState;
use crate::system::ans::ANSState;
use crate::system::field::FieldState;
use crate::system::swarm::SwarmState;
use crate::system::innersense::InnerSenseState;
/// Signaux collectés pour l'évaluation du Kernel
#[derive(Debug, Clone)]
pub struct KernelInputs {
    pub clarity: f32,
    pub coherence: f32,
    pub stability_trend: f32,
    pub momentum: f32,
    pub pressure: f32,
    pub turbulence: f32,
    pub depth: f32,
    pub tension: f32,
    pub load_level: f32,
    pub swarm_consensus: f32,
}
impl Default for KernelInputs {
    fn default() -> Self {
        Self {
            clarity: 0.5,
            coherence: 0.5,
            stability_trend: 0.5,
            momentum: 0.5,
            pressure: 0.5,
            turbulence: 0.3,
            depth: 0.5,
            tension: 0.3,
            load_level: 0.3,
            swarm_consensus: 0.5,
        }
    }
impl KernelInputs {
    fn clamp(mut self) -> Self {
        self.clarity = self.clarity.clamp(0.0, 1.0);
        self.coherence = self.coherence.clamp(0.0, 1.0);
        self.stability_trend = self.stability_trend.clamp(0.0, 1.0);
        self.momentum = self.momentum.clamp(0.0, 1.0);
        self.pressure = self.pressure.clamp(0.0, 1.0);
        self.turbulence = self.turbulence.clamp(0.0, 1.0);
        self.depth = self.depth.clamp(0.0, 1.0);
        self.tension = self.tension.clamp(0.0, 1.0);
        self.load_level = self.load_level.clamp(0.0, 1.0);
        self.swarm_consensus = self.swarm_consensus.clamp(0.0, 1.0);
        self
/// Collecte et normalise les signaux depuis 6 modules
pub fn collect_kernel_inputs(
    cortex: &CortexSyncState,
    continuum: &ContinuumState,
    ans: &ANSState,
    field: &FieldState,
    swarm: &SwarmState,
    innersense: &InnerSenseState,
) -> Result<KernelInputs, String> {
    // Extraction simple sans transformation
    let clarity = cortex.global_clarity;
    let coherence = cortex.coherence;
    let stability_trend = continuum.stability_trend;
    let momentum = continuum.momentum;
    let pressure = field.pressure;
    let turbulence = field.turbulence;
    let depth = innersense.depth;
    let tension = ans.tension_level;
    let load_level = ans.load_level;
    let swarm_consensus = swarm.consensus;
    // Validation: toutes les valeurs doivent être finies
    if !clarity.is_finite()
        || !coherence.is_finite()
        || !stability_trend.is_finite()
        || !momentum.is_finite()
        || !pressure.is_finite()
        || !turbulence.is_finite()
        || !depth.is_finite()
        || !tension.is_finite()
        || !load_level.is_finite()
        || !swarm_consensus.is_finite()
    {
        return Err("Invalid kernel input values detected".to_string());
    Ok(KernelInputs {
        clarity,
        coherence,
        stability_trend,
        momentum,
        pressure,
        turbulence,
        depth,
        tension,
        load_level,
        swarm_consensus,
    .clamp())
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_kernel_inputs_default() {
        let inputs = KernelInputs::default();
        assert_eq!(inputs.clarity, 0.5);
        assert_eq!(inputs.coherence, 0.5);
        assert_eq!(inputs.tension, 0.3);
    fn test_kernel_inputs_clamp() {
        let inputs = KernelInputs {
            clarity: 1.5,
            coherence: -0.2,
            stability_trend: 2.0,
            pressure: -1.0,
            turbulence: 1.2,
            depth: 0.3,
            tension: 0.8,
            load_level: -0.5,
            swarm_consensus: 1.8,
        .clamp();
        assert_eq!(inputs.clarity, 1.0);
        assert_eq!(inputs.coherence, 0.0);
        assert_eq!(inputs.stability_trend, 1.0);
        assert_eq!(inputs.pressure, 0.0);
        assert_eq!(inputs.turbulence, 1.0);
        assert_eq!(inputs.load_level, 0.0);
        assert_eq!(inputs.swarm_consensus, 1.0);
    fn test_kernel_inputs_all_valid() {
            clarity: 0.7,
            coherence: 0.6,
            momentum: 0.4,
            pressure: 0.3,
            turbulence: 0.2,
            load_level: 0.4,
            swarm_consensus: 0.8,
        };
        // All values should remain unchanged after clamp
        let clamped = inputs.clone().clamp();
        assert_eq!(clamped.clarity, inputs.clarity);
        assert_eq!(clamped.coherence, inputs.coherence);
        assert_eq!(clamped.tension, inputs.tension);
