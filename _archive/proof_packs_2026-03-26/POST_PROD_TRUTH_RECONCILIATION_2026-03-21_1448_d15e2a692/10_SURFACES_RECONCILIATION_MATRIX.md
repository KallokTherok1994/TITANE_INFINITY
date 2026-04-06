# Surfaces Reconciliation Matrix

| Surface | Status | Notes |
|---------|--------|-------|
| package.json version | ✅ 28.6.0 | canonical |
| tauri.conf.json version | ✅ 28.6.0 | canonical |
| Cargo.toml version | ✅ 28.6.0 | canonical |
| README.md header | ✅ 28.6.0 | patched (4 stale refs fixed) |
| README.md download section | ✅ 28.6.0 | pre-existing in d15e2a692 |
| README.md architecture heading | ✅ 28.6.0 | patched |
| CHANGELOG.md [28.6.0] entry | ✅ EXISTS | added by d15e2a692 |
| REGISTRY_APPEND.jsonl 28.6.0 | ✅ APPENDED | this session |
| RELEASE_v28.6.0_SEALED.txt | ✅ EXISTS | 2026-03-21T14:39:10Z |
| RELEASE_ARTIFACTS_CHECKSUMS_28.6.0.txt | ✅ EXISTS | |
| GitHub Release v28.6.0 | ✅ PUBLISHED | 2026-03-21T14:38:50Z |
| cargo check | ✅ EXIT 0 | |
| tsc --noEmit | ✅ EXIT 0 | |
| verify_instructions | ✅ PASS=20 FAIL=0 | |
| Desktop E2E (tauri-driver) | ✅ PROVEN_DESKTOP (partial) | 18/25 specs, 7 Ollama-dep failures |
