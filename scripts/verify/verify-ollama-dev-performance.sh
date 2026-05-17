#!/usr/bin/env bash
set -euo pipefail

MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OUT_DIR="reports/ollama-dev-performance"
JSON_OUT="$OUT_DIR/latest.json"
MD_OUT="$OUT_DIR/latest.md"
STRICT_TIMEOUT_SEC="${TITANE_OLLAMA_DEV_PERF_TIMEOUT_SEC:-60}"
COMPAT_TIMEOUT_SEC="${TITANE_OLLAMA_DEV_PERF_COMPAT_TIMEOUT_SEC:-30}"
KEEP_ALIVE="${TITANE_OLLAMA_DEV_PERF_KEEP_ALIVE:-15m}"
TEMPERATURE="${TITANE_OLLAMA_DEV_TEMPERATURE:-0}"
PERF_NUM_CTX="${TITANE_OLLAMA_DEV_PERF_NUM_CTX:-4096}"
PERF_NUM_PREDICT="${TITANE_OLLAMA_DEV_PERF_NUM_PREDICT:-48}"
RAW_OUT="$(mktemp)"
STRICT_OUT="$(mktemp)"
COMPATIBILITY_RETRY_USED=false
MODEL_OVERRIDE_USED=false
WARM_MODEL_BEFORE_REQUEST=false

if [[ "$MODEL" != "qwen3.5:9b" ]]; then
  MODEL_OVERRIDE_USED=true
fi

OLLAMA_PS_OUTPUT="$(ollama ps || true)"
if grep -Fq "$MODEL" <<<"$OLLAMA_PS_OUTPUT"; then
  WARM_MODEL_BEFORE_REQUEST=true
fi

cleanup() {
  rm -f "$RAW_OUT"
  rm -f "$STRICT_OUT"
}
trap cleanup EXIT

mkdir -p "$OUT_DIR"

curl -fsS --max-time 5 "$HOST/api/version" >/dev/null || {
  echo "BLOCKED_OLLAMA_SERVER: Ollama server not reachable at $HOST"
  exit 1
}

START="$(date +%s)"

if ! curl -fsS --max-time "$STRICT_TIMEOUT_SEC" "$HOST/api/generate" -d "{
  \"model\": \"$MODEL\",
  \"prompt\": \"Summarize TITANE local development readiness in one short sentence.\",
  \"stream\": false,
  \"think\": false,
  \"keep_alive\": \"$KEEP_ALIVE\",
  \"options\": { \"num_ctx\": $PERF_NUM_CTX, \"temperature\": $TEMPERATURE, \"num_predict\": $PERF_NUM_PREDICT }
}" >"$STRICT_OUT"; then
  echo "WARN: strict performance smoke probe timed out; retrying compatibility payload"
  COMPATIBILITY_RETRY_USED=true
  if ! curl -fsS --max-time "$COMPAT_TIMEOUT_SEC" "$HOST/api/generate" -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"Summarize TITANE local development readiness in one short sentence.\",
    \"stream\": false,
    \"think\": false,
    \"keep_alive\": \"$KEEP_ALIVE\",
    \"options\": { \"temperature\": $TEMPERATURE, \"num_predict\": $PERF_NUM_PREDICT }
  }" >"$RAW_OUT"; then
    echo "FAIL_PERFORMANCE: performance smoke generation timed out or errored"
    exit 1
  fi
else
  cp "$STRICT_OUT" "$RAW_OUT"
fi

END="$(date +%s)"
ELAPSED="$((END-START))"

grep -q '"done"[[:space:]]*:[[:space:]]*true' "$RAW_OUT" || {
  echo "FAIL_PERFORMANCE: generation did not complete"
  cat "$RAW_OUT"
  exit 1
}

TITANE_STRICT_TIMEOUT_SEC="$STRICT_TIMEOUT_SEC" \
TITANE_COMPAT_TIMEOUT_SEC="$COMPAT_TIMEOUT_SEC" \
TITANE_KEEP_ALIVE="$KEEP_ALIVE" \
TITANE_TEMPERATURE="$TEMPERATURE" \
TITANE_PERF_NUM_CTX="$PERF_NUM_CTX" \
TITANE_PERF_NUM_PREDICT="$PERF_NUM_PREDICT" \
node - "$RAW_OUT" "$JSON_OUT" "$MODEL" "$HOST" "$ELAPSED" "$COMPATIBILITY_RETRY_USED" "$MODEL_OVERRIDE_USED" "$WARM_MODEL_BEFORE_REQUEST" <<'NODE'
const fs = require('node:fs');
const [
  rawPath,
  jsonPath,
  model,
  host,
  elapsed,
  compatibilityRetryUsed,
  modelOverrideUsed,
  warmModelBeforeRequest,
] = process.argv.slice(2);
const raw = fs.readFileSync(rawPath, 'utf8');
const payload = JSON.parse(raw);
const evalDuration = Number(payload.eval_duration ?? 0);
const evalCount = Number(payload.eval_count ?? 0);
const tokensPerSecond =
  evalCount > 0 && evalDuration > 0 ? Number((evalCount / (evalDuration / 1e9)).toFixed(2)) : null;
const loadDuration = Number(payload.load_duration ?? 0);
const loadProfile =
  warmModelBeforeRequest === 'true'
    ? 'warm_or_resident'
    : loadDuration >= 1_000_000_000
      ? 'cold_or_reloaded'
      : 'warm_or_resident';
const report = {
  model,
  host,
  elapsed_seconds: Number(elapsed),
  strict_timeout_seconds: Number(process.env.TITANE_STRICT_TIMEOUT_SEC || 0),
  compat_timeout_seconds: Number(process.env.TITANE_COMPAT_TIMEOUT_SEC || 0),
  keep_alive: process.env.TITANE_KEEP_ALIVE || null,
  temperature: Number(process.env.TITANE_TEMPERATURE || 0),
  perf_num_ctx: Number(process.env.TITANE_PERF_NUM_CTX || 0),
  perf_num_predict: Number(process.env.TITANE_PERF_NUM_PREDICT || 0),
  compatibility_retry_used: compatibilityRetryUsed === 'true',
  model_override_used: modelOverrideUsed === 'true',
  warm_model_before_request: warmModelBeforeRequest === 'true',
  load_profile: loadProfile,
  total_duration: payload.total_duration ?? null,
  load_duration: payload.load_duration ?? null,
  prompt_eval_count: payload.prompt_eval_count ?? null,
  prompt_eval_duration: payload.prompt_eval_duration ?? null,
  eval_count: payload.eval_count ?? null,
  eval_duration: payload.eval_duration ?? null,
  tokens_per_second: tokensPerSecond,
  verdict: 'PASS: OLLAMA_DEV_PERFORMANCE_SMOKE',
  raw: payload,
};
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
NODE

TOKENS_PER_SECOND="$(node -e "const fs=require('node:fs');const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(String(r.tokens_per_second ?? 'n/a'))" "$JSON_OUT")"
LOAD_PROFILE="$(node -e "const fs=require('node:fs');const r=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(String(r.load_profile ?? 'unknown'))" "$JSON_OUT")"

cat >"$MD_OUT" <<EOF
# Ollama Dev Performance Smoke

- model: $MODEL
- host: $HOST
- elapsed_seconds: $ELAPSED
- compatibility_retry_used: $COMPATIBILITY_RETRY_USED
- model_override_used: $MODEL_OVERRIDE_USED
- warm_model_before_request: $WARM_MODEL_BEFORE_REQUEST
- keep_alive: $KEEP_ALIVE
- temperature: $TEMPERATURE
- strict_timeout_sec: $STRICT_TIMEOUT_SEC
- compat_timeout_sec: $COMPAT_TIMEOUT_SEC
- perf_num_ctx: $PERF_NUM_CTX
- perf_num_predict: $PERF_NUM_PREDICT
- load_profile: $LOAD_PROFILE
- tokens_per_second: $TOKENS_PER_SECOND
- json: $JSON_OUT

## Verdict

PASS: OLLAMA_DEV_PERFORMANCE_SMOKE

## Notes

- Timing fields are taken from the Ollama API payload when present.
- A low elapsed time on a resident model is not treated as inherently optimal without the load profile context above.
EOF

echo "PASS: OLLAMA_DEV_PERFORMANCE_SMOKE elapsed=${ELAPSED}s report=$MD_OUT"
