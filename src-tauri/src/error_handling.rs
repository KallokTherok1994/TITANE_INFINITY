// ═══════════════════════════════════════════════════════════════
//   TITANE∞ — Error Handling Utilities
//   Remplace unwrap() par des patterns sûrs
// ═══════════════════════════════════════════════════════════════

use log::{error, warn};

/// Extension trait pour Result<T, E> avec logging automatique
pub trait ResultExt<T, E> {
    /// Unwrap avec fallback et logging d'erreur
    fn unwrap_or_log(self, fallback: T, context: &str) -> T
    where
        E: std::fmt::Display;
    
    /// Unwrap avec fallback et warning (non-critique)
    fn unwrap_or_warn(self, fallback: T, context: &str) -> T
    where
        E: std::fmt::Display;
}

impl<T, E> ResultExt<T, E> for Result<T, E> {
    fn unwrap_or_log(self, fallback: T, context: &str) -> T
    where
        E: std::fmt::Display,
    {
        match self {
            Ok(val) => val,
            Err(e) => {
                error!("[{}] Error: {} — Using fallback", context, e);
                fallback
            }
        }
    }
    
    fn unwrap_or_warn(self, fallback: T, context: &str) -> T
    where
        E: std::fmt::Display,
    {
        match self {
            Ok(val) => val,
            Err(e) => {
                warn!("[{}] Warning: {} — Using fallback", context, e);
                fallback
            }
        }
    }
}

/// Extension trait pour Option<T> avec logging
pub trait OptionExt<T> {
    /// Unwrap Option avec fallback et logging
    fn unwrap_or_log(self, fallback: T, context: &str) -> T;
    
    /// Unwrap Option avec warning
    fn unwrap_or_warn(self, fallback: T, context: &str) -> T;
}

impl<T> OptionExt<T> for Option<T> {
    fn unwrap_or_log(self, fallback: T, context: &str) -> T {
        match self {
            Some(val) => val,
            None => {
                error!("[{}] None value encountered — Using fallback", context);
                fallback
            }
        }
    }
    
    fn unwrap_or_warn(self, fallback: T, context: &str) -> T {
        match self {
            Some(val) => val,
            None => {
                warn!("[{}] None value encountered — Using fallback", context);
                fallback
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_result_ext_ok() {
        let result: Result<i32, &str> = Ok(42);
        assert_eq!(result.unwrap_or_log(0, "test"), 42);
    }

    #[test]
    fn test_result_ext_err() {
        let result: Result<i32, &str> = Err("test error");
        assert_eq!(result.unwrap_or_log(0, "test"), 0);
    }

    #[test]
    fn test_option_ext_some() {
        let option = Some(42);
        assert_eq!(option.unwrap_or_log(0, "test"), 42);
    }

    #[test]
    fn test_option_ext_none() {
        let option: Option<i32> = None;
        assert_eq!(option.unwrap_or_log(0, "test"), 0);
    }
}
