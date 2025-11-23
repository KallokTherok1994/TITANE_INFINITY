//! Module InnerSense - Perception interne

use crate::shared::types::*;
pub struct InnerSenseState {
    pub activation: f32,
    pub awareness: f32,
}
impl Default for InnerSenseState {
    fn default() -> Self {
        Self {
            activation: 0.5,
            awareness: 0.5,
        }
    }
pub fn tick(
    _state: &mut InnerSenseState,
    _helios: &HeliosState,
    _nexus: &NexusState,
) -> Result<(), String> {
    Ok(())

}
