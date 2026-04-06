# 14_ROLLBACK

## Rollback Command
```bash
git restore -- src/pages/TitanePage.tsx src/App.tsx scripts/autoheal/autoheal_rules.jsonl
```

## What Rollback Restores
- TitanePage: removes symbiose tab (TabId, handlers, JSX, renderActiveSection case, TwinEvolutionPanel import)
- App.tsx: restores TwinsPage lazy import, twins topNavSection entry, /twins route mount, /twin → /twins redirect
- autoheal_rules.jsonl: removes AH-2026-03-21-TWINS-FUSION entry

## What Rollback Does NOT Touch
- TwinsPage.tsx (never modified)
- TwinEvolutionPanel.tsx (never modified)
- All hooks, services, backend (never modified)
- Proof pack directory (can be deleted separately if needed)

## Estimated Rollback Time: < 1 minute
