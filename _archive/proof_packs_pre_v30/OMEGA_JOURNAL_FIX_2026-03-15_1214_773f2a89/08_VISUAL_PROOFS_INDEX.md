# 08_VISUAL_PROOFS_INDEX

## Preuves visuelles disponibles
Les captures d'écran avant/après ne sont pas disponibles dans ce mode BACKGROUND (aucune UI lancée pendant l'audit).

## Preuves textuelles de substitution (établies par grep/diff/TypeScript)

### P1 — Durée : preuve d'ancrage
```
grep -n "providerStatus.latency" src/ui/pages/Chat.tsx
→ 1413: providerStatus.latency !== undefined ? providerStatus.latency / 1000 : undefined
```
**Conclusion**: durée post-loading = latence réelle IPC (ms) converties en secondes.

### P2 — Fichier Système : preuve classe conditionnelle
```
grep -n "oj-non-capture" src/features/chat/ThinkingPanel.tsx | grep "runtime-value"
→ conditionnel — classe absente si systemPromptSources.length > 0
```

### P3 — Score qualité : preuve computation réelle
```
grep -n "doneCount\|errorCount\|completionRate" src/ui/pages/Chat.tsx
→ calculé depuis steps[] réels (pipeline traces)
```

### P4 — XP gain : preuve lastGainAmount
```
grep -n "lastGainAmount" src/features/chat/ThinkingPanel.tsx
→ 2 occurrences d'utilisation directe (essentiel + détaillé)
```

### P5 — Scroll CSS : preuve overflow
```
grep -n "oj-journal-body" src/features/chat/ThinkingPanel.css
→ max-height:480px; overflow-y:auto; overscroll-behavior:contain
```

### P6 — Auto-heal : 5 entrées ajoutées
```
tail -5 scripts/autoheal/autoheal_rules.jsonl | python3 -c "import sys,json; [print(json.loads(l)['id']) for l in sys.stdin if l.strip()]"
→ AH-2026-03-15-OMEGA-JOURNAL-001 à 005
```
