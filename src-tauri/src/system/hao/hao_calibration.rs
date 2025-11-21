use super::HAOState;

pub fn recalibrate(state: &mut HAOState) -> Result<(), String> {
    state.calibration_status = 0.5;
    state.system_directive_alignment = "Recalibration en cours".to_string();
    Ok(())
}
