# BOOTSTRAP

Commands:
- git status --porcelain=v1
- git rev-parse --short HEAD
- git branch --show-current
- git log -20 --oneline
- git diff --stat
- git diff --name-only
- git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
- grep '"version"' package.json
- grep '^version' src-tauri/Cargo.toml
- rg -n "PROVIDER_UNAVAILABLE|HONEST_OFFLINE_DEGRADED|ProviderDecisionMeta|provider_requested|provider_selected|provider_used|fallback_used|degraded_mode" src src-tauri docs proof_packs scripts .clinerules
- find reports/tauri_memory_e2e -maxdepth 2 -type f | sort

Key outputs (abridged):

- git status --porcelain=v1
  - M .clinerules/05-truth-surface.md
  - M docs/AUDIT_CHAT_IA_ORCHESTRATEUR_2026-03-26.md
  - M scripts/autoheal/autoheal_rules.jsonl
  - M scripts/e2e/run-memory-chat-proof-ui.sh
  - M scripts/e2e/run-online-chat-proof-ui.sh
  - ... (governance/proof dirtiness only)
  - ?? docs/governance/PROVIDER_RUNTIME_STABILITY_SPEC.md
  - ?? proof_packs/POST_SEALED_PROVIDER_RUNTIME_BREAK_2026-03-28_1224_e88264039/
  - ?? proof_packs/POST_SEALED_MEMORY_RUNTIME_BREAK_2026-03-28_1210_e88264039/
  - ?? proof_packs/POST_SEALED_MEMORY_SEAL_CANON_2026-03-28_1149_e88264039/

- git rev-parse --short HEAD
  - e88264039

- git branch --show-current
  - MAIN

- versions
  - package.json: "version": "28.88.0"
  - src-tauri/Cargo.toml: version = "28.88.0"

- git diff -- src src-tauri package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
  - (no output)

- reports/tauri_memory_e2e (recent)
  - reports/tauri_memory_e2e/20260328T170158Z/*
  - reports/tauri_memory_e2e/20260328T170242Z/*
  - reports/tauri_memory_e2e/20260328T170352Z/*
