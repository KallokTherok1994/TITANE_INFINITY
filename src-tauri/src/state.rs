use crate::security::{RateLimiter, AuditLogger};

pub struct AppState {
    pub rate_limiter: RateLimiter,
    pub audit_logger: AuditLogger,
}

impl AppState {
    pub fn new() -> TitaneResult<Self> {
        let rate_limiter = RateLimiter::new(100, 60); // 100 req/min
        let audit_logger = AuditLogger::new(
            app_dir.join("logs").join("audit.log")
        );

        Ok(Self {
            rate_limiter,
            audit_logger,
        })
    }
}