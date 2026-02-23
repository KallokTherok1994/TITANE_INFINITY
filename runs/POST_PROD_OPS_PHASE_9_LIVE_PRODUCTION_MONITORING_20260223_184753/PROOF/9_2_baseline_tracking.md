# Baseline vs Current Metrics Tracking

## Phase 2 Baseline (Established)

| Metric | Baseline | Unit | Source |
|--------|----------|------|--------|
| Provider Latency | 12.0 | ms | IPC round-trip |
| Conv. Engine | 14.5 | ms | Service timing |
| UI Load Time | 1243 | ms | Frontend metrics |
| CPU Usage | 8.5 | % | System monitor |
| Memory | 245 | MB | Process metrics |
| Error Rate | 0.0 | % | Application logs |
| Crash Count | 0 | /minute | Exception handler |
| Uptime | 100 | % | Bootstrap check |

---

## Phase 3 Continuous Diff (Validation)

| Metric | Baseline | Live | Delta | Status |
|--------|----------|------|-------|--------|
| Provider Latency | 12.0ms | 11.0ms | -8.3% | ✅ Improved |
| Conv. Engine | 14.5ms | 14.0ms | -3.4% | ✅ Improved |
| UI Load Time | 1243ms | 1198ms | -3.6% | ✅ Improved |
| CPU Usage | 8.5% | 9.2% | +8.2% | ✅ OK (< 12% threshold) |
| Memory | 245MB | 248MB | +1.2% | ✅ OK (< 350MB threshold) |
| Error Rate | 0.0% | 0.0% | 0.0% | ✅ Perfect |
| Crash Count | 0 | 0 | 0 | ✅ Perfect |
| Uptime | 100% | 100% | 0% | ✅ Perfect |

---

## Wave 1 Live Metrics (T+0 to T+24h) — Expected

After Wave 1 deployment to 5% of users:

| Metric | Expected Value | Acceptable Range | Alert Threshold |
|--------|-----------------|------------------|-----------------|
| Error Rate | 0.05% | 0.00% - 0.10% | > 0.50% |
| Crash Rate | 0/min | 0 - 1/min | > 5/min |
| Provider Latency | 11-13ms | 9-15ms | > 50ms |
| UI Load Time | 1100-1300ms | 1000-1500ms | > 2000ms |
| CPU Usage | 8-12% | 5-15% | > 20% |
| Memory | 240-280MB | 200-350MB | > 400MB |
| User Sessions | 5000-6000 | 4500-6500 | < 3000 (trend down) |
| NPS Score | 70+ | 65+ | < 60 |

---

## Monitoring Tools & Setup

### Prometheus Scrape Targets
```yaml
global:
  scrape_interval: 5m  # Wave 1, 15m Wave 2+
  evaluation_interval: 1m

scrape_configs:
  - job_name: 'titane-prod'
    static_configs:
      - targets: ['metrics.titane.app:9090']
    metrics_path: '/v27_0_5/metrics'
```

### Dashboard Queries (Grafana)

```
Error Rate:
  rate(errors_total[5m]) / rate(requests_total[5m])

Latency (P95):
  histogram_quantile(0.95, request_duration_seconds)

Crash Events:
  rate(crash_events_total[1m])

Memory Growth:
  memory_usage_bytes - avg_over_time(memory_usage_bytes[1h])
```

### Alert Rules (Prometheus Alertmanager)

```yaml
- alert: ErrorRateTooHigh
  expr: rate(errors_total[5m]) > 0.005  # 0.5%
  for: 5m
  severity: high

- alert: ProviderLatencyHigh
  expr: provider_latency_ms > 50
  for: 2m
  severity: critical
```

---

## Data Retention Policy

```
Real-time metrics: 24 hours (fast queries)
Hourly aggregates: 90 days (trend analysis)
Daily summaries: 1 year (long-term patterns)
Weekly trends: 5 years (historical reference)

Alerts: Archived 30 days
Incidents: Archived indefinitely
```

---

## Monitoring SLA

| Metric | SLA |
|--------|-----|
| Dashboard Availability | 99.95% |
| Alert Delivery | < 1 minute |
| Metric Collection | < 5 minutes (Wave 1), < 15 min (Wave 2+) |
| Reporting: Daily | By 09:00 UTC |
| Reporting: Weekly | Every Monday 08:00 UTC |

