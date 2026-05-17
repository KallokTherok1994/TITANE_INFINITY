---
description: Decide whether BUILD ALL is allowed by routing through the pre-build certifier and emitting a build permission matrix plus proof artifacts.
mode: agent
---

# Pre-BUILD Certification

> **Agent**: invoke `pre-build-certifier` for this session.

Use `.github/agents/pre-build-certifier.agent.md`.

Goal:
Certify whether BUILD ALL is allowed.

Do not build unless:

```txt
BUILD_ALLOWED=YES
```

Required lifecycle:

1. Discover authority.
2. Detect canonical pipeline.
3. Verify worktree.
4. Verify instructions.
5. Verify agent config.
6. Verify toolchain.
7. Verify frontend.
8. Verify backend/Tauri/IPC/network.
9. Clean stale state safely.
10. Run `pnpm run dev:tauri`.
11. Capture DevTools Console.
12. Capture HTTP/Network.
13. Capture WebUI route proof.
14. Capture visible UI proof where applicable.
15. Run E2E/Desktop proof.
16. Verify runtime promotion truth.
17. Run AutoHeal/anti-regression.
18. Produce `BUILD_PERMISSION_MATRIX.md`.
19. Produce proof pack.
20. Return final verdict.

No build while any lane is red, unknown, partial, blocked, warning-unclassified, or missing.
