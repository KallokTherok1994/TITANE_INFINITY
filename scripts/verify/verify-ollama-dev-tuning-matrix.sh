#!/usr/bin/env bash
set -euo pipefail

MODEL="${TITANE_OLLAMA_DEV_MODEL:-qwen3.5:9b}"
HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
PROMPT="Return exactly: TITANE_TUNING_OK"
STAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
TEMPERATURE="${TITANE_OLLAMA_DEV_TEMPERATURE:-0}"
KEEP_ALIVE="${TITANE_OLLAMA_DEV_MATRIX_KEEP_ALIVE:-15m}"
MATRIX_SPEC="${TITANE_OLLAMA_DEV_MATRIX:-1024:16:30,2048:16:45,4096:32:60}"
EXTENDED_MATRIX_SPEC="${TITANE_OLLAMA_DEV_MATRIX_EXTENDED_SPEC:-8192:32:90,16384:32:120}"
OUT_DIR="reports/ollama-dev-tuning"
JSONL_OUT="$OUT_DIR/latest.jsonl"
MD_OUT="$OUT_DIR/latest.md"
LOCAL_PROFILE_OUT="docs/dev/OLLAMA_DEV_LOCAL_PROFILE.md"
WARM_MODEL_BEFORE_REQUEST=false

if [[ "${TITANE_OLLAMA_DEV_MATRIX_EXTENDED:-0}" == "1" ]]; then
  MATRIX_SPEC="${MATRIX_SPEC},${EXTENDED_MATRIX_SPEC}"
fi

mkdir -p "$OUT_DIR"
: >"$JSONL_OUT"

curl -fsS --max-time 5 "$HOST/api/version" >/dev/null || {
  echo "BLOCKED_OLLAMA_SERVER: Ollama server not reachable at $HOST"
  exit 1
}

OLLAMA_PS_OUTPUT="$(ollama ps || true)"
if grep -Fq "$MODEL" <<<"$OLLAMA_PS_OUTPUT"; then
  WARM_MODEL_BEFORE_REQUEST=true
fi

pnpm run verify:ollama:boundary >/dev/null

append_result() {
  local raw_file="$1"
  local ctx="$2"
  local predict="$3"
  local timeout="$4"
  local status="$5"
  local elapsed="$6"
  local compatibility_retry="$7"
  local error_message="$8"

  node - "$JSONL_OUT" "$raw_file" "$MODEL" "$HOST" "$ctx" "$predict" "$timeout" "$status" "$elapsed" "$compatibility_retry" "$WARM_MODEL_BEFORE_REQUEST" "$KEEP_ALIVE" "$TEMPERATURE" "$error_message" <<'NODE'
const fs = require('node:fs');
const [
  jsonlOut,
  rawFile,
  model,
  host,
  ctx,
  predict,
  timeout,
  status,
  elapsed,
  compatibilityRetry,
  warmModel,
  keepAlive,
  temperature,
  errorMessage,
] = process.argv.slice(2);

let payload = {};
if (rawFile && fs.existsSync(rawFile)) {
  try {
    payload = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
  } catch {
    payload = {};
  }
}

const evalDuration = Number(payload.eval_duration ?? 0);
const evalCount = Number(payload.eval_count ?? 0);
const tokensPerSecond =
  evalCount > 0 && evalDuration > 0 ? Number((evalCount / (evalDuration / 1e9)).toFixed(2)) : null;
const loadDuration = Number(payload.load_duration ?? 0);
const loadProfile =
  warmModel === 'true' ? 'warm_or_resident' : loadDuration >= 1_000_000_000 ? 'cold_or_reloaded' : 'warm_or_resident';

const result = {
  model,
  host,
  ctx: Number(ctx),
  predict: Number(predict),
  timeout_seconds: Number(timeout),
  keep_alive: keepAlive,
  temperature: Number(temperature),
  status,
  elapsed_seconds: Number(elapsed),
  compatibility_retry_used: compatibilityRetry === 'true',
  warm_model_before_request: warmModel === 'true',
  load_profile: loadProfile,
  total_duration: payload.total_duration ?? null,
  load_duration: payload.load_duration ?? null,
  prompt_eval_count: payload.prompt_eval_count ?? null,
  prompt_eval_duration: payload.prompt_eval_duration ?? null,
  eval_count: payload.eval_count ?? null,
  eval_duration: payload.eval_duration ?? null,
  tokens_per_second: tokensPerSecond,
  error: errorMessage || null,
};

fs.appendFileSync(jsonlOut, `${JSON.stringify(result)}\n`);
NODE
}

ANY_PASS=0
PROFILE_COUNT=0

IFS=',' read -r -a PROFILES <<<"$MATRIX_SPEC"
for profile in "${PROFILES[@]}"; do
  IFS=':' read -r ctx predict timeout <<<"$profile"
  PROFILE_COUNT=$((PROFILE_COUNT + 1))
  raw_file="$(mktemp)"
  response_file="$(mktemp)"
  compatibility_retry=false
  error_message=""
  elapsed=0
  status="FAIL"

  start="$(date +%s)"
  if curl -fsS --max-time "$timeout" "$HOST/api/generate" -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"$PROMPT\",
    \"stream\": false,
    \"think\": false,
    \"keep_alive\": \"$KEEP_ALIVE\",
    \"options\": {
      \"num_ctx\": $ctx,
      \"temperature\": $TEMPERATURE,
      \"num_predict\": $predict
    }
  }" >"$response_file"; then
    :
  else
    compatibility_retry=true
    if ! curl -fsS --max-time "$timeout" "$HOST/api/generate" -d "{
      \"model\": \"$MODEL\",
      \"prompt\": \"$PROMPT\",
      \"stream\": false,
      \"think\": false,
      \"keep_alive\": \"$KEEP_ALIVE\",
      \"options\": {
        \"temperature\": $TEMPERATURE,
        \"num_predict\": $predict
      }
    }" >"$response_file"; then
      error_message="timeout_or_request_error"
      status="TIMEOUT"
    fi
  fi
  end="$(date +%s)"
  elapsed="$((end-start))"

  if [[ -s "$response_file" ]]; then
    cp "$response_file" "$raw_file"
    if grep -q '"done"[[:space:]]*:[[:space:]]*true' "$response_file" && grep -q 'TITANE_TUNING_OK' "$response_file"; then
      status="PASS"
      ANY_PASS=1
    elif [[ "$status" != "TIMEOUT" ]]; then
      status="FAIL"
      error_message="unexpected_response"
    fi
  fi

  append_result "$raw_file" "$ctx" "$predict" "$timeout" "$status" "$elapsed" "$compatibility_retry" "$error_message"
  rm -f "$raw_file" "$response_file"
done

node - "$JSONL_OUT" "$MD_OUT" "$LOCAL_PROFILE_OUT" "$MODEL" "$HOST" "$MATRIX_SPEC" "$KEEP_ALIVE" "$TEMPERATURE" "$WARM_MODEL_BEFORE_REQUEST" "$STAMP" <<'NODE'
const fs = require('node:fs');

const [jsonlOut, mdOut, localProfileOut, model, host, matrixSpec, keepAlive, temperature, warmModel, stamp] = process.argv.slice(2);
const lines = fs
  .readFileSync(jsonlOut, 'utf8')
  .split('\n')
  .map(line => line.trim())
  .filter(Boolean);
const results = lines.map(line => JSON.parse(line));
const passing = results.filter(result => result.status === 'PASS');
const fastProfile = [...passing].sort((a, b) => a.elapsed_seconds - b.elapsed_seconds || a.ctx - b.ctx)[0] || null;
const recommended = [...passing].sort((a, b) => b.ctx - a.ctx || a.elapsed_seconds - b.elapsed_seconds)[0] || null;
const extended = [...passing].filter(result => result.ctx > 4096).sort((a, b) => b.ctx - a.ctx || a.elapsed_seconds - b.elapsed_seconds)[0] || null;
const tuningVerdict = recommended ? 'LOCAL_TUNING_PROFILE_RECORDED' : 'LOCAL_TUNING_PROFILE_PARTIAL';
const compatibilityRetry = recommended?.compatibility_retry_used ? 'COMPAT_RETRY_REQUIRED' : 'COMPAT_RETRY_NOT_REQUIRED';
const warmResult = warmModel === 'true' ? 'WARM_MODEL_RESULT' : 'COLD_OR_RELOADED_RESULT';

const exportBlock = recommended
  ? [
      `export TITANE_OLLAMA_DEV_MODEL=${model}`,
      `export TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC=${Math.max(recommended.timeout_seconds, 45)}`,
      `export TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC=${Math.max(recommended.timeout_seconds, 60)}`,
      `export TITANE_OLLAMA_DEV_SMOKE_NUM_CTX=${recommended.ctx}`,
      `export TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT=${Math.max(recommended.predict, 16)}`,
      `export TITANE_OLLAMA_DEV_PERF_TIMEOUT_SEC=${Math.max(recommended.timeout_seconds, 60)}`,
      `export TITANE_OLLAMA_DEV_PERF_NUM_CTX=${recommended.ctx >= 4096 ? recommended.ctx : 4096}`,
      `export TITANE_OLLAMA_DEV_PERF_NUM_PREDICT=${recommended.predict >= 32 ? recommended.predict : 32}`,
      `export TITANE_OLLAMA_DEV_TEMPERATURE=${temperature}`,
    ].join('\n')
  : [
      `export TITANE_OLLAMA_DEV_MODEL=${model}`,
      'export TITANE_OLLAMA_DEV_SMOKE_TIMEOUT_SEC=45',
      'export TITANE_OLLAMA_DEV_COMPAT_TIMEOUT_SEC=60',
      'export TITANE_OLLAMA_DEV_SMOKE_NUM_CTX=2048',
      'export TITANE_OLLAMA_DEV_SMOKE_NUM_PREDICT=16',
      'export TITANE_OLLAMA_DEV_PERF_TIMEOUT_SEC=60',
      'export TITANE_OLLAMA_DEV_PERF_NUM_CTX=4096',
      'export TITANE_OLLAMA_DEV_PERF_NUM_PREDICT=32',
      `export TITANE_OLLAMA_DEV_TEMPERATURE=${temperature}`,
    ].join('\n');

const tableRows = [
  '| ctx | predict | timeout_s | status | elapsed_s | tokens_s | compat_retry | load_profile |',
  '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ...results.map(
    result =>
      `| ${result.ctx} | ${result.predict} | ${result.timeout_seconds} | ${result.status} | ${result.elapsed_seconds} | ${result.tokens_per_second ?? 'n/a'} | ${result.compatibility_retry_used} | ${result.load_profile} |`
  ),
];

const md = `# Ollama Dev Tuning Matrix\n\n- timestamp_utc: ${stamp}\n- model: ${model}\n- host: ${host}\n- matrix_spec: ${matrixSpec}\n- keep_alive: ${keepAlive}\n- temperature: ${temperature}\n- warm_model_before_request: ${warmModel}\n- tuning_matrix_verdict: ${tuningVerdict}\n- recommended_profile: ${recommended ? `ctx=${recommended.ctx} predict=${recommended.predict} timeout=${recommended.timeout_seconds}` : 'none'}\n- compatibility_retry: ${compatibilityRetry}\n- warm_result_note: ${warmResult}\n- jsonl: ${jsonlOut}\n\n## Profiles\n\n${tableRows.join('\n')}\n\n## Recommended env export block\n\n\`\`\`bash\n${exportBlock}\n\`\`\`\n`;

fs.writeFileSync(mdOut, md);

const localProfile = `# OLLAMA DEV LOCAL PROFILE — TITANE_INFINITY\n\n## Current scoped status\n\n- scoped_stack_status: OLLAMA_DEV_STACK_SEALED\n- tuning_matrix_verdict: ${tuningVerdict}\n- warm_result_note: ${warmResult}\n- generated_at_utc: ${stamp}\n\n## Model\n\n- ${model}\n- host: ${host}\n\n## Recommended environment exports\n\n\`\`\`bash\n${exportBlock}\n\`\`\`\n\n## Fast smoke profile\n\n- ${fastProfile ? `ctx=${fastProfile.ctx} predict=${fastProfile.predict} timeout=${fastProfile.timeout_seconds} elapsed=${fastProfile.elapsed_seconds}s` : 'No passing fast profile recorded yet.'}\n\n## Stable work profile\n\n- ${recommended ? `ctx=${recommended.ctx} predict=${recommended.predict} timeout=${recommended.timeout_seconds} compatibility_retry=${recommended.compatibility_retry_used}` : 'No stable work profile recorded yet.'}\n\n## Extended profile, if supported\n\n- ${extended ? `ctx=${extended.ctx} predict=${extended.predict} timeout=${extended.timeout_seconds}` : 'No extended passing profile recorded or extended matrix not enabled.'}\n\n## Known limitations\n\n- Compatibility retry state: ${compatibilityRetry}\n- One-shot performance remains a smoke signal, not a benchmark.\n- VS Code MCP trust remains manual.\n\n## Proof reports\n\n- tuning matrix: ${mdOut}\n- tuning jsonl: ${jsonlOut}\n- performance smoke: reports/ollama-dev-performance/latest.md\n- package provenance: reports/mcp-package-provenance/ollama-mcp-2.1.0.md\n\n## Last certified commands\n\n- pnpm run verify:ollama:dev:live\n- pnpm run verify:ollama:dev:performance\n- pnpm run verify:ollama:dev:tuning\n`;

fs.writeFileSync(localProfileOut, localProfile);
NODE

VERDICT="$(node -e "const fs=require('node:fs');const lines=fs.readFileSync(process.argv[1],'utf8').trim().split('\n').filter(Boolean).map(line=>JSON.parse(line));process.stdout.write(lines.some(line=>line.status==='PASS')?'LOCAL_TUNING_PROFILE_RECORDED':'LOCAL_TUNING_PROFILE_PARTIAL')" "$JSONL_OUT")"

echo "$VERDICT report=$MD_OUT profile=$LOCAL_PROFILE_OUT"

if [[ "$ANY_PASS" -eq 0 ]]; then
  exit 1
fi
