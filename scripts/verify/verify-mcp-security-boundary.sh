#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "FAIL: $1"
  exit 1
}

test -f .vscode/mcp.json || fail ".vscode/mcp.json missing"
test -x scripts/mcp/start-ollama-dev-mcp.sh || fail "MCP wrapper missing or not executable"

grep -q '"ollama-dev"' .vscode/mcp.json || fail "ollama-dev server missing"
grep -q '"type"[[:space:]]*:[[:space:]]*"stdio"' .vscode/mcp.json || fail "stdio transport missing"
grep -q 'scripts/mcp/start-ollama-dev-mcp.sh' .vscode/mcp.json || fail "MCP wrapper not used"

if grep -q '@latest' .vscode/mcp.json; then
  fail "@latest forbidden in .vscode/mcp.json"
fi

if grep -q '@latest' scripts/mcp/start-ollama-dev-mcp.sh; then
  fail "@latest forbidden in MCP wrapper"
fi

if grep -E 'TOKEN|SECRET|PASSWORD|KEY|GITHUB_TOKEN|OPENAI|ANTHROPIC|GEMINI' .vscode/mcp.json; then
  fail "possible secret-bearing env in mcp.json"
fi

grep -q 'http://127.0.0.1:11434' .vscode/mcp.json scripts/mcp/start-ollama-dev-mcp.sh || fail "OLLAMA local host missing"
if grep -q '0\.0\.0\.0' .vscode/mcp.json scripts/mcp/start-ollama-dev-mcp.sh; then
  fail "non-loopback Ollama host forbidden"
fi
grep -q 'ollama-mcp@2\.1\.0' scripts/mcp/start-ollama-dev-mcp.sh || fail "Pinned MCP package missing in wrapper"
grep -q '/api/version' scripts/mcp/start-ollama-dev-mcp.sh || fail "Ollama API preflight missing in wrapper"
grep -q 'api/version".*>/dev/null' scripts/mcp/start-ollama-dev-mcp.sh || fail "Ollama API preflight must redirect stdout to /dev/null"
grep -q 'ollama list' scripts/mcp/start-ollama-dev-mcp.sh || fail "Ollama model preflight missing in wrapper"

echo_lines="$(grep -n '^[[:space:]]*echo ' scripts/mcp/start-ollama-dev-mcp.sh || true)"
if [[ -n "$echo_lines" ]] && grep -qv '>&2' <<<"$echo_lines"; then
  fail "wrapper diagnostics must go to stderr"
fi

if [[ -d reports/mcp-package-provenance ]]; then
  test -f reports/mcp-package-provenance/ollama-mcp-2.1.0.json || fail "MCP provenance json missing"
  test -f reports/mcp-package-provenance/ollama-mcp-2.1.0.md || fail "MCP provenance markdown missing"
  grep -q 'ollama-mcp' reports/mcp-package-provenance/ollama-mcp-2.1.0.md || fail "MCP provenance markdown incomplete"
fi

echo "PASS: MCP_SECURITY_BOUNDARY"
