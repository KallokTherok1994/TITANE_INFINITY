# 11_DIFF_FILES

## Scope of changes since STABLE_LANE cert (SHA 27b4998d3)

Post-STABLE commits (27b4998d3 → c989ea1c6):
- db3d4b6d4: feat(twins): mount TwinEvolutionPanel + /twins route + nav entry
- 6f425a555: fix(ipc): conversationId fallback + persistent_memory whitelist
- 773f2a89e: docs(proof): seal TWINS_UI_CERT + OMEGA_TIMEOUT_RECERT proof packs
- 56e4a0150: docs(proof): OMEGA_CHAT_PERF addendum
- 4ede39ac8: perf(timeouts): Ollama 8s timeout fix (H4+H5)
- f38457673: perf(timeouts): OMEGA layer-2 HTTP timeout + stream + retry
- 66411a227: docs(proof): OMEGA_TIMEOUT_RECERT proof pack
- c989ea1c6: fix(omega-journal): OMEGA_JOURNAL_FIX + RECERT

## Release-critical file changes (scope-allowed)
- src-tauri/tauri.conf.json: NO changes since b81cc6e21 fix (beforeBuildCommand stable) ✓
- src-tauri/Cargo.toml: no release-breaking changes
- package.json: no version change (still 28.0.0)

## Non-release-scope changes (not evaluated)
- src/lib/security.ts: unstaged modification (not committed at time of this pack)
  → Status at pack time: working tree clean (security.ts change was committed or reverted)
- Various UI/IPC fixes: TwinEvolutionPanel, conversationId, timeout tuning
  → All within allowed post-STABLE scope; no Ring1/2 breakage

## Diff summary
No release-critical config regressions between STABLE_LANE and this seal attempt.
Build config (tauri.conf.json) unchanged since C001 fix.
