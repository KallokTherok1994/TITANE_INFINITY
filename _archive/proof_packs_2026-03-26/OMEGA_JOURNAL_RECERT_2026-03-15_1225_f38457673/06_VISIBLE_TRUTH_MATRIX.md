# 06_VISIBLE_TRUTH_MATRIX

## VISIBLE_TRUTH_MATRIX

| Cas | Avant patch (session #1 base) | Après session #1 | Après recertification | Visible ? | Preuve | Verdict |
|-----|-------------------------------|-----------------|----------------------|-----------|--------|---------|
| Durée après réponse | "NON CAPTURÉ" toujours | Real latency/1000 si disponible | Identique | ✅ | diff Chat.tsx ~1413 staged | VERIFIED_RUNTIME_TRUTH |
| Fichier Système (sources présentes) | "NON CAPTURÉ" grisé | "N sources injectées" non grisé | Identique | ✅ | diff ThinkingPanel.tsx staged | CAPTURED_AND_RENDERED |
| Fichier Système (sources absentes) | "NON CAPTURÉ" | "NON INSTRUMENTÉ" honnête | Identique | ✅ | Libellé honnête | CAPTURED_AND_RENDERED |
| Score qualité (pipeline done) | null → rien | Score % réel | Identique | ✅ | diff Chat.tsx ~863 staged | CAPTURED_AND_RENDERED |
| Score qualité (loading) | null | "NON INSTRUMENTÉ" | Identique | ✅ | guard `!isLoading && steps.length > 0` | CAPTURED_AND_RENDERED |
| XP gagné essentiel | "+5 XP Chat" fixe | lastGainAmount conditionnel | Identique | ✅ | diff ~408 staged | VERIFIED_RUNTIME_TRUTH |
| XP gagné runtime grid | "NON CAPTURÉ" | "+5 XP" hardcodé | lastGainAmount conditionnel | ✅ | patch résiduel recert | VERIFIED_RUNTIME_TRUTH |
| XP "Gain par message" détaillé | "+5 XP" fixe | lastGainAmount conditionnel | Identique | ✅ | diff ~630 staged | VERIFIED_RUNTIME_TRUTH |
| Scroll molette journal | Inactif (no CSS) | Actif max-height:480px | Identique | ✅ | diff ThinkingPanel.css staged | VERIFIED_RUNTIME_TRUTH |
| autoheal rules | Absentes scope OMEGA_JOURNAL | 5 règles format correct | +1 règle résiduelle (006) | N/A | detect_recurrence PASS entries=284 | CAPTURED_AND_RENDERED |

## Limites honnêtes

| Dimension | Statut | Raison |
|-----------|--------|--------|
| Visual runtime en Tauri lancé | NOT_TESTED_VISUAL | Aucune instance Tauri lancée — vérification source code uniquement |
| validationScore Rust backend | NOT_INSTRUMENTED | ConversationMetadata struct sans ce champ — fallback front-end honnête documenté |
| Scroll double-scroll | NOT_TESTED_VISUAL | Vérification CSS uniquement, pas test UI interactif |
