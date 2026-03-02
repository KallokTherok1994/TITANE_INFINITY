# ROLLBACK

git restore -- src/hooks/useChat.ts
git restore -- e2e/smoke.test.ts
git restore -- e2e/user-flows.test.ts
git restore -- e2e/critical/app-launch.spec.ts
git restore -- e2e/critical/engine-navigation.spec.ts
git restore -- e2e/critical/visual-engine.spec.ts
git restore -- e2e/runtime-validation/chat-ar20.spec.ts
git restore -- e2e/feedback-loop.spec.ts
git restore -- playwright.config.ts
git restore -- scripts/e2e/vite-e2e-watch.cjs
git clean -fd proof_packs/OMEGA_AUDIT_*
git restore -- .last_omega_pack
