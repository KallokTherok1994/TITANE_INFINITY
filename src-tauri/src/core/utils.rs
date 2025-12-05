// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                       TITANE∞ v14 - Core Utilities                          ║
// ║                    Unified timestamp and helper functions                   ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

use chrono::Utc;

/// Get current timestamp in milliseconds since epoch (unified timestamp source)
#[inline]
pub fn now_ms() -> u64 {
    Utc::now().timestamp_millis() as u64
}

/// Calculate elapsed time in milliseconds
#[inline]
pub fn elapsed_ms(start: u64) -> u64 {
    now_ms().saturating_sub(start)
}

/// Check if duration has elapsed since timestamp
#[inline]
pub fn has_elapsed(start: u64, duration_ms: u64) -> bool {
    elapsed_ms(start) >= duration_ms
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_now_ms() {
        let t1 = now_ms();
        std::thread::sleep(std::time::Duration::from_millis(10));
        let t2 = now_ms();
        assert!(t2 > t1);
        assert!(t2 - t1 >= 10);
    }

    #[test]
    fn test_elapsed_ms() {
        let start = now_ms();
        std::thread::sleep(std::time::Duration::from_millis(50));
        let elapsed = elapsed_ms(start);
        assert!(elapsed >= 50);
    }

    #[test]
    fn test_has_elapsed() {
        let start = now_ms();
        assert!(!has_elapsed(start, 100));
        std::thread::sleep(std::time::Duration::from_millis(100));
        assert!(has_elapsed(start, 100));
    }
}
