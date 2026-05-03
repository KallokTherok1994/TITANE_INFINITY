# 17 Rollback

Targeted rollback for the kept V12 patch:

```bash
pushd /tmp/titane_v6_wt_clean_001321 >/dev/null
git restore -- src/hooks/zoomScale.ts src/hooks/useZoomControl.ts src/hooks/useWindowControls.ts src/__tests__/hooks/useZoomControl.test.tsx src/__tests__/hooks/useWindowControls.test.tsx registry/ui-events.jsonl scripts/autoheal/autoheal_rules.jsonl
rm -rf proof_packs/FRONTEND_UI_PERFECTION_V12_2026-03-11_0617_0c6ccc129
popd >/dev/null
```

If V12 is committed, rollback can also be performed with a single revert commit on the final V12 commit hash.
