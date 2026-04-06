# 13 — ROLLBACK (Session 3)

```bash
git restore -- src/pages/TwinsPage.tsx
git restore -- src/__tests__/twins/twins-context-chain.test.ts
git restore -- scripts/autoheal/autoheal_rules.jsonl
```

After rollback: admin tab hidden again (isAdmin=false). Sessions 1+2 fixes remain intact.
