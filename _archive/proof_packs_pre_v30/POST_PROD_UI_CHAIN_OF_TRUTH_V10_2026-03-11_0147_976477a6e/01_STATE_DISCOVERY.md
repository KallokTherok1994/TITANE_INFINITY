# 01 State Discovery

Git reality:
- branch MAIN
- head == origin/MAIN == 976477a6e522d2336590de7be4679b94badba6b8
- worktree authority active: /tmp/titane_v6_wt_clean_001321 [MAIN]
- local untracked: .npmrc.e2e_override (out-of-scope)

PR reality:
- PR #179 is MERGED
- merge commit: b573e79c1688a53e4d9d67c4d9039f15212a4944

Proof reality:
- V6/V7/V9/V11 proof packs present
- Latest and most advanced: V11

E2E/runtime reality:
- Canonical WDIO run PASS in V11
- Visual runtime probes PASS x2 in V11 with screenshots

UI reality:
- chat-input/chat-send/chat-message-content validated
- onboarding absent, no IPC fallback marker
- stability confirmed in V11 reruns
