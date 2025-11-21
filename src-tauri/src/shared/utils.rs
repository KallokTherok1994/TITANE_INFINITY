//! TITANE∞ v10 - Utilitaires de conversion et clamping
//! Norme: États internes = f32, Calculs = f64, Conversions explicites

use std::time::{SystemTime, UNIX_EPOCH};

/// Timestamp actuel en millisecondes
#[inline]
pub fn timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Alias pour timestamp() - compatibilité modules legacy
#[inline]
pub fn current_timestamp() -> u64 {
    timestamp()
}

/// Clamp générique pour f32
#[inline]
pub fn clamp(v: f32, min: f32, max: f32) -> f32 {
    v.clamp(min, max)
}

/// Clamp une valeur f32 entre 0.0 et 1.0
#[allow(dead_code)]
#[inline]
pub fn clamp01_f32(v: f32) -> f32 {
    v.clamp(0.0, 1.0)
}

/// Clamp une valeur f64 entre 0.0 et 1.0
#[allow(dead_code)]
#[inline]
pub fn clamp01_f64(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}

/// Clamp une valeur f32 entre min et max
#[allow(dead_code)]
#[inline]
pub fn clamp_f32(v: f32, min: f32, max: f32) -> f32 {
    v.clamp(min, max)
}

/// Clamp une valeur f64 entre min et max
#[allow(dead_code)]
#[inline]
pub fn clamp_f64(v: f64, min: f64, max: f64) -> f64 {
    v.clamp(min, max)
}

/// Convertit f32 → f64 (précision accrue pour calculs)
#[allow(dead_code)]
#[inline]
pub fn f32_to_f64(v: f32) -> f64 {
    v as f64
}

/// Convertit f64 → f32 (retour état)
#[allow(dead_code)]
#[inline]
pub fn f64_to_f32(v: f64) -> f32 {
    v as f32
}

/// Lissage exponentiel f32
#[allow(dead_code)]
#[inline]
pub fn smooth_f32(old: f32, new: f32, alpha: f32) -> f32 {
    old * (1.0 - alpha) + new * alpha
}

/// Lissage exponentiel f64
#[allow(dead_code)]
#[inline]
pub fn smooth_f64(old: f64, new: f64, alpha: f64) -> f64 {
    old * (1.0 - alpha) + new * alpha
}

/// Calcul sécurisé avec conversion f32 → f64 → f32
#[allow(dead_code)]
#[inline]
pub fn safe_calc_f32(value: f32, factor: f64) -> f32 {
    ((value as f64) * factor).clamp(0.0, 1.0) as f32
}

/// Nudge progressif vers 0.5
#[allow(dead_code)]
#[inline]
pub fn nudge_to_center_f32(value: f32, factor: f32) -> f32 {
    let delta = (0.5 - value).abs() * factor;
    value + delta.clamp(0.0, 1.0)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_clamp01_f32() {
        assert_eq!(clamp01_f32(1.5), 1.0);
        assert_eq!(clamp01_f32(-0.5), 0.0);
        assert_eq!(clamp01_f32(0.5), 0.5);
    }

    #[test]
    fn test_safe_calc() {
        let result = safe_calc_f32(0.8, 0.3);
        assert!((0.0..=1.0).contains(&result));
    }

    #[test]
    fn test_smooth() {
        let result = smooth_f32(0.5, 1.0, 0.3);
        assert!(result > 0.5 && result < 1.0);
    }

    #[test]
    fn test_nudge() {
        let result = nudge_to_center_f32(0.8, 0.1);
        assert!(result < 0.8);
    }
}
