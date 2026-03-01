# User Feedback Collection Strategy

## Automated Feedback Channels

### In-App Feedback Widget

```
Trigger: After 5 minutes of usage with v27.0.5
Prompt: "How's v27.0.5 working for you?"
Options:
  ⭐⭐⭐⭐⭐ Excellent
  ⭐⭐⭐⭐  Good
  ⭐⭐⭐    OK
  ⭐⭐     Not great
  ⭐      Broken

If ≤ 3 stars: "What's the main issue?"
  → Provider disconnects
  → Slow responses
  → UI freezing
  → Other: [text field]

Data sent to: logs/feedback/wave_[n]_feedback.jsonl
```

### Crash Report Opt-In

```
If app crashes:
"Would you like to help us fix this?"
→ Send crash report (auto-includes diagnostics)
→ Add optional comment
→ Confirmation: "Thanks! We received your report"

Data sent to: logs/crashes/wave_[n]_crashes.jsonl
Trigger: Incident management system
```

### Performance Monitoring Telemetry

```
Silent collection (no user action needed):
  • Response latency: provider_latency_ms
  • UI load time: ui_load_time_ms
  • Error count: daily
  • Provider connection status: continuous
  • CPU/Memory: baseline vs current

Data sent to: logs/telemetry/wave_[n]_metrics.jsonl (anonymized)
```

## Manual Feedback Channels

### Support Email

```
support@titane.app
Subject: v27.0.5 feedback

Categorized as:
  • Bug report
  • Feature request
  • Performance feedback
  • Other

SLA: Response within 12 hours
```

### In-App Support Chat

```
"Contact Support" → Live chat
Topic: v27.0.5 experience
Logged: support/live_chat_v27_0_5.jsonl
```

### Surveys

```
Wave 1 (24h after deployment):
  • Quick poll (3 questions, 1 min)
  • "How's v27.0.5?" with NPS score
  • "Main issue (if any)?" dropdown

Wave 1→2 Transition (48h):
  • Detailed NPS survey (5-10 questions)
  • Feature satisfaction?
  • Recommendation likelihood?

Post-GA (7 days):
  • Net Promoter Score survey
  • Comparative: v27.0.5 vs v27.0.4?
  • Feature requests for v27.1.0?
```

## Feedback Analysis Pipeline

```
Raw Feedback (JSONL)
    ↓
Parse & Categorize
    ├─ Issue type (performance, stability, feature)
    ├─ Severity (critical, high, medium, low)
    ├─ Frequency (how many users report same issue?)
    └─ Sentiment (positive, neutral, negative)
    ↓
Dashboard
    ├─ Real-time error rate graph
    ├─ NPS trend
    ├─ Top issues list
    └─ Wave success criteria (on-track? at-risk?)
    ↓
Decision Gate
    ├─ ✅ Continue to next wave? (all metrics green)
    ├─ ⚠️  Hold wave? (review needed, not yet critical)
    └─ 🛑 Rollback? (critical issue threshold crossed)
```

## Success Metrics from Feedback

| Metric            | Wave 1  | Wave 2  | Wave 3 (GA) |
| ----------------- | ------- | ------- | ----------- |
| Average Rating    | ≥ 4.0/5 | ≥ 4.1/5 | ≥ 4.2/5     |
| NPS Score         | ≥ 60    | ≥ 65    | ≥ 70        |
| Critical Issues   | 0       | 0       | ≤ 1         |
| "Would Recommend" | ≥ 85%   | ≥ 90%   | ≥ 92%       |
