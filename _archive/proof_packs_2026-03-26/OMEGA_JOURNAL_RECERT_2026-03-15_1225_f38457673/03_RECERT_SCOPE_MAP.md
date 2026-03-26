# 03_RECERT_SCOPE_MAP

## A. RECERT_SCOPE_MAP

| Sujet | État attendu après Prompt #1 | État réel trouvé | Delta | Statut |
|-------|------------------------------|-----------------|-------|--------|
| Durée | Câblé via providerStatus.latency/1000 post-load | Patch présent dans staged (Chat.tsx ligne ~1413) | Aucun | VERIFIED |
| Fichier Système (caption) | oj-non-capture conditionnel sur sources | Patch présent (conditional className) | Aucun | VERIFIED |
| Fichier Système (runtime grid) | oj-non-capture conditionnel | Patch présent | Aucun | VERIFIED |
| Score qualité | Fallback completion-based IIFE | Patch présent (Chat.tsx ~863) | Aucun | VERIFIED |
| XP essentiel | lastGainAmount conditionnel | Patch présent (~ligne 408) | Aucun | VERIFIED |
| XP détaillé/expert "Gain par message" | lastGainAmount conditionnel | Patch présent (~ligne 630) | Aucun | VERIFIED |
| XP décorate Runtime Grid "XP gagné" | lastGainAmount attendu | **+5 hardcodé — RÉSIDUEL** | DELTA | RÉSIDUEL_CORRIGÉ |
| Scroll molette | .oj-journal-body overflow-y:auto | CSS présent dans staged | Aucun | VERIFIED |
| autoheal_rules.jsonl (format) | Format `id,date,scope,symptom,...` | Index avait ancien format → worktree correct → git add effectué | DELTA | CORRIGÉ |
| AutoHeal rules scope OMEGA_JOURNAL | 5 entrées correctes | 5 entrées + 1 résiduelle (006) | DELTA+ | ENRICHI |

## B. FIELD_RECERT_MAP

| Champ | Définition canonique | Source runtime | Contrat | UI visible | Interaction | Statut |
|-------|---------------------|----------------|---------|------------|-------------|--------|
| Durée | Temps réel de réponse provider | providerStatus.latency (ms) → /1000 → elapsedTime prop | Chat.tsx→ThinkingPanel | durationDisplay badge + runtime grid | lecture | VERIFIED_RUNTIME_TRUTH |
| Fichier Système | Sources de prompt système injectées | memoryTrace.systemPromptSources | ThinkingPanel prop | caption + runtime grid conditionnel | lecture | CAPTURED_AND_RENDERED |
| Score qualité | Taux de complétion pipeline (steps) | steps[] + resolvedProvider | Chat.tsx IIFE | `${score*100}%` ou NON INSTRUMENTÉ | lecture | CAPTURED_AND_RENDERED (honnête) |
| XP gain | Dernier gain réel domain chat | xpTrace.lastGainAmount | useExperience → Chat → ThinkingPanel | toutes sections XP (post-recert) | lecture | VERIFIED_RUNTIME_TRUTH |
| Scroll molette | Conteneur scrollable Journal OMEGA | CSS overflow-y:auto | .oj-journal-body | max-height:480px + scroll | molette | VERIFIED_RUNTIME_TRUTH |
| AutoHeal | Règles déclenchables | autoheal_rules.jsonl | detect_recurrence.sh | N/A (non visible UI) | N/A | CAPTURED_AND_RENDERED |
