pub struct TemporalWindow {
    pub short_term: Vec<f32>,
    pub mid_term: Vec<f32>,
    pub long_term: Vec<f32>,
}

impl TemporalWindow {
    pub fn new() -> Self {
        Self {
            short_term: Vec::new(),
            mid_term: Vec::new(),
            long_term: Vec::new(),
        }
    }
