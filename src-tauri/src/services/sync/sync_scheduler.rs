use std::time::Duration;

pub struct SyncSchedulerConfig {
    pub enabled: bool,
    pub interval: Duration,
    pub max_retries: u8,
    pub max_backoff: Duration,
}

impl Default for SyncSchedulerConfig {
    fn default() -> Self {
        Self {
            enabled: std::env::var("OPTION1_SYNC_ENABLED")
                .ok()
                .map(|v| v == "true" || v == "1")
                .unwrap_or(false),
            interval: Duration::from_millis(
                std::env::var("OPTION1_SYNC_INTERVAL_MS")
                    .ok()
                    .and_then(|v| v.parse::<u64>().ok())
                    .unwrap_or(120_000),
            ),
            max_retries: 3,
            max_backoff: Duration::from_secs(30),
        }
    }
}
