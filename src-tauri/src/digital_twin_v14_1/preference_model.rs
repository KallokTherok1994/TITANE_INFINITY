// TITANE∞ v14.1 - Preference Model
use std::collections::HashMap;

pub struct PreferenceModel {
    preferences: HashMap<String, f32>,
}

impl PreferenceModel {
    pub fn new() -> Self {
        Self {
            preferences: HashMap::new(),
        }
    }
}

impl Default for PreferenceModel {
    fn default() -> Self {
        Self::new()
    }
}
