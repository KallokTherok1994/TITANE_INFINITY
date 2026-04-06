# 04 — AUDIT FINDINGS MATRIX

| ISSUE_ID | SEVERITY | CATEGORY | FILES | ROOT_CAUSE_HYPOTHESIS | USER_IMPACT | PROOF | FIX_PRIORITY | PATCHABLE_HERE | STATUS |
|---|---|---|---|---|---|---|---|---|---|
| F-001 | P0 | IPC/Registration | main.rs, twin_commands.rs | 8 commandes twin_* non enregistrées dans generate_handler[] | Tous appels IPC twin_* échouaient | AH-2026-03-15-TWINS-001 | DONE | YES | RESOLVED (session antérieure) |
| F-002 | P1 | UI/Silence | TwinEvolutionPanel.tsx | error field non destructuré depuis hooks | Erreurs IPC silencieuses pour l'utilisateur | AH-2026-03-15-TWINS-002 | DONE | YES | RESOLVED (session antérieure) |
| F-003 | P2 | UI/Cosmetic | TwinEvolutionPanel.tsx | `identity?.version` sans fallback | Affiche "vundefined" si identity null | Inspection code | P2 | YES | RESOLVED (cette session) |
| F-004 | P2 | Accessibility | TwinEvolutionPanel.tsx | Aucun aria-label sur boutons tabs | Non-accessible keyboard/screen reader | Inspection code | P2 | YES | RESOLVED (cette session) |
| F-005 | P2 | E2E stability | TwinEvolutionPanel.tsx | Aucun data-testid | E2E impossible sans sélecteur stable | Inspection code | P2 | YES | RESOLVED (cette session) |
| F-006 | P2 | UI/Silence | TwinEvolutionPanel.tsx FusionTab | `return null` sans message si fusionIndex manquant | Contenu vide invisible pour l'utilisateur | Inspection code | P2 | YES | RESOLVED (cette session) |
| F-007 | P2 | Dead code | src/hooks/useTwinBehavior.ts | Hook défini mais jamais importé | Aucun impact fonctionnel | grep résultat vide | P2 | NO | DEFERRED (pas de défaut utilisateur) |
| F-008 | P2 | Test coverage | e2e/, tests/ | Aucun test E2E ou unitaire pour la page /twins | Régression non détectable en CI | Scan e2e/ tests/ | P2 | NO | DEFERRED (scope E2E séparé) |
