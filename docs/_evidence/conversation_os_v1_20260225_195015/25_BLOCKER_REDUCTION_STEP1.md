# 25_BLOCKER_REDUCTION_STEP1.md

## Objet
Micro-phase de réduction des blocants hard-mode après exécution GO ALL PHASE.

## Changement code appliqué
- Fichier: `src/services/ai/transports/ollamaTransport.ts`
- Action: suppression de l’import direct `invoke` (`@tauri-apps/api/core`) et migration vers `secureInvoke`.
- Ring impacté: **Ring 4 (Modules/UI)**
- Statut changement: **QUALIFIED**

## Validation technique
- Vérification diagnostics fichier modifié: **No errors found**.

## Mesure avant/après (HB4)
- Baseline prod-scope précédente (`__tests__` exclus): `8`
- Post-fix prod-scope: `7`
- Baseline scan large: `11`
- Post-fix scan large: `10`

## Preuves
- `reports/conversation_os_blocker_hb4_triage_20260226T021122Z.log`
- `reports/conversation_os_blocker_hb4_postfix_20260226T021216Z.log`
- `reports/conversation_os_blocker_hb4_prodscope_postfix_20260226T021223Z.log`
- `reports/conversation_os_hardmode_gates_x3_postfix_20260226T021217Z.log`

## Lecture gouvernée
- Réduction effective de la dispersion `invoke`.
- Blocants restant actifs:
  - `C2` URLs externes: `115/115/115`
  - `H2` usages HTTP backend hors gateway unique: `73/73/73`
  - `HB4` résiduel: `7` (prod-scope)

## Décision
- Micro-phase: **PASS (réduction mesurée)**
- État global hard-mode: **BLOCKED** (blocants structurels restants)
