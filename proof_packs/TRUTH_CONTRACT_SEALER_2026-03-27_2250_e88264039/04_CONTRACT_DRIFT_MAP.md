# 04 — Contract Drift Map

## Drift Analysis

### FIELD_MISSING: None
All required fields are present in the contract.

### FIELD_UNUSED: None
All fields are used by at least one consumer.

### FIELD_DERIVED_WRONGLY: None
All fields are correctly derived from source of truth.

### UI_LABEL_OVERCLAIM: None
UI labels correctly reflect backend truth.

### TRACE_NOT_PROPAGATED: None
All trace/meta fields are correctly propagated.

### BACKEND_NOT_EMITTING: None
Backend correctly emits all required fields.

### FALLBACK_NOT_VISIBLE: Potential (LOW)
When fallback occurs, the badge shows the actual provider used (e.g., "ollama" instead of "gemini"). The mismatch indicator (⚠) is shown. This is correct behavior.

### MEMORY_USAGE_UNPROVEN: N/A (separate contract)
Memory label truth is handled by LOCK_SURGEON (AV-01 fix).

### PROVIDER_LABEL_UNPROVEN: None
Provider label is proven by trace/meta chain.

### MODE_LABEL_UNPROVEN: None
Mode label is proven by backend meta.

### EFFORT_LABEL_UNPROVEN: None
Effort label is not part of this contract (separate).

### SCORECARD_NOT_BOUND_TO_TRUTH: None
Scorecards correctly read from backend truth.

### UNKNOWN: None
No unknown drift points.

## Summary
**CONTRACT_DRIFT: NONE DETECTED**

The provider label truth contract is correctly implemented. All fields are properly propagated from backend to UI with no drift.