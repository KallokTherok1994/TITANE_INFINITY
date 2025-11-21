//! TITANE∞ v11.0 - Macros utilitaires pour normalisation f32
//! Macros harmonisées pour manipulations f32 avec validation intégrée

/// Macro nudge! - Pousse une valeur vers le centre 0.5 progressivement
///
/// # Exemples
/// ```
/// let value = 0.8;
/// let result = nudge!(value, 0.1);  // Pousse 0.8 vers 0.5 avec factor 0.1
/// ```
#[macro_export]
macro_rules! nudge {
    ($value:expr, $factor:expr) => {{
        let v: f32 = $value;
        let f: f32 = $factor;
        let delta: f32 = (0.5_f32 - v).abs() * f;
        if v < 0.5_f32 {
            v + delta.clamp(0.0_f32, 1.0_f32)
        } else {
            v - delta.clamp(0.0_f32, 1.0_f32)
        }
    }};
}

/// Macro check! - Vérifie qu'une valeur est dans [min, max] (ou [0.0, 1.0] par défaut)
///
/// # Exemples
/// ```
/// check!0.7;           // Vérifie [0.0, 1.0]
/// check!(5.0, 0.0, 10.0) // Vérifie [0.0, 10.0]
/// ```
#[macro_export]
macro_rules! check {
    ($value:expr) => {{
        let v = $value;
        (0.0..=1.0).contains(&v)
    }};
    ($value:expr, $min:expr, $max:expr) => {{
        let v = $value;
        ($min..=$max).contains(&v)
    }};
}

/// Macro soften! - Lissage exponentiel entre deux valeurs
///
/// # Exemples
/// ```
/// let result = soften!(0.3, 0.8, 0.2);  // Lissage old->new avec alpha=0.2
/// ```
#[macro_export]
macro_rules! soften {
    ($old:expr, $new:expr, $alpha:expr) => {{
        let old: f32 = $old;
        let new: f32 = $new;
        let alpha_val: f32 = $alpha;
        let a: f32 = alpha_val.clamp(0.0_f32, 1.0_f32);
        old * (1.0_f32 - a) + new * a
    }};
}

/// Macro stabilize! - Stabilise une valeur près d'une cible
///
/// # Exemples
/// ```
/// let result = stabilize!(0.52, 0.5, 0.05);  // Si |value - 0.5| < 0.05, snap to 0.5
/// ```
#[macro_export]
macro_rules! stabilize {
    ($value:expr, $target:expr, $threshold:expr) => {{
        let v: f32 = $value;
        let t: f32 = $target;
        let th_val: f32 = $threshold;
        let th: f32 = th_val.abs();
        if (v - t).abs() < th {
            t
        } else {
            v
        }
    }};
}

/// Macro clamp01! - Clamp une valeur entre 0.0 et 1.0
///
/// # Exemples
/// ```
/// clamp01!1.5;   // 1.0
/// clamp01!(-0.3);  // 0.0
/// ```
#[macro_export]
macro_rules! clamp01 {
    ($value:expr) => {{
        let v: f32 = $value;
        v.clamp(0.0_f32, 1.0_f32)
    }};
}

/// Macro safe_div! - Division sécurisée avec fallback
///
/// # Exemples
/// ```
/// safe_div!(10.0, 2.0, 0.0);   // 5.0
/// safe_div!(10.0, 0.0, 0.0);   // 0.0 (fallback)
/// ```
#[macro_export]
macro_rules! safe_div {
    ($num:expr, $den:expr, $fallback:expr) => {{
        let n: f32 = $num;
        let d: f32 = $den;
        let fb: f32 = $fallback;
        if d.abs() < 1e-6_f32 {
            fb
        } else {
            n / d
        }
    }};
}

/// Macro lerp! - Interpolation linéaire entre deux valeurs
///
/// # Exemples
/// ```
/// lerp!(0.0, 1.0, 0.5);  // 0.5
/// ```
#[macro_export]
macro_rules! lerp {
    ($a:expr, $b:expr, $t:expr) => {{
        let a: f32 = $a;
        let b: f32 = $b;
        let t_val: f32 = $t;
        let t: f32 = t_val.clamp(0.0_f32, 1.0_f32);
        a * (1.0_f32 - t) + b * t
    }};
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_nudge_macro() {
        let v = 0.8;
        let result = nudge!(v, 0.1);
        assert!(result < 0.8);
        assert!(result > 0.5);
    }

    #[test]
    fn test_check_macro() {
        assert!(check!(0.5));
        assert!(check!(0.0));
        assert!(check!(1.0));
        assert!(!check!(1.5));
        assert!(!check!(-0.1));
        assert!(check!(5.0, 0.0, 10.0));
    }

    #[test]
    fn test_soften_macro() {
        let result = soften!(0.0, 1.0, 0.5);
        assert_eq!(result, 0.5);
    }

    #[test]
    fn test_stabilize_macro() {
        let v = 0.52;
        let result = stabilize!(v, 0.5, 0.05);
        assert_eq!(result, 0.5);

        let v2 = 0.7;
        let result2 = stabilize!(v2, 0.5, 0.05);
        assert_eq!(result2, 0.7);
    }

    #[test]
    fn test_clamp01_macro() {
        assert_eq!(clamp01!(1.5), 1.0);
        assert_eq!(clamp01!(-0.3), 0.0);
        assert_eq!(clamp01!(0.7), 0.7);
    }

    #[test]
    fn test_safe_div_macro() {
        assert_eq!(safe_div!(10.0, 2.0, 0.0), 5.0);
        assert_eq!(safe_div!(10.0, 0.0, 0.0), 0.0);
    }

    #[test]
    fn test_lerp_macro() {
        assert_eq!(lerp!(0.0, 1.0, 0.5), 0.5);
        assert_eq!(lerp!(0.0, 10.0, 0.25), 2.5);
    }

    #[test]
    fn test_nudge() {
        let val = 0.8f32;
        let result = nudge!(val, 0.1);
        assert!(result < 0.8);
        assert!(result > 0.5);
    }

    #[test]
    fn test_soften() {
        let old_val = 0.9f32;
        let new_val = soften!(old_val, 0.2, 0.3);
        assert!(new_val < old_val);
        assert!(new_val > 0.2);
    }
}
