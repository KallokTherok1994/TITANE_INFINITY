]633;E;{   echo "# 05_CHANGES_APPLIED"\x3b   echo\x3b   echo "- Date: $(date -Is)"\x3b   echo\x3b   echo "## Diff ciblé (fichiers modifiés)"\x3b   echo '```bash'\x3b   echo '$ git diff --name-only -- .github scripts/autoheal scripts/verify_instructions.sh'\x3b   git diff --name-only -- .github scripts/autoheal scripts/verify_instructions.sh\x3b   echo '```'\x3b   echo\x3b   echo "## Résumé avant/après"\x3b   echo "- `.github/copilot-instructions.md`: ajout format de sortie obligatoire, migration AutoHeal vers `scripts/autoheal/*`, règle constitutionnelle anti-récurrence, gates AH enrichies."\x3b   echo "- `.github/copilot-setup-checklist.md`: ajout Inventory/Contradictions + obligations AutoHeal/detect_recurrence/verify_instructions."\x3b   echo "- `.github/copilot-workflow.mermaid`: pipeline complet Bootstrap->Inventory->Contradictions->Patch->Verify->AutoHeal->Proof-pack->Verdict."\x3b   echo "- `.github/instructions/tests-e2e.instructions.md`: path AutoHeal canonique + garde récurrence + anti-flaky renforcé."\x3b   echo "- `.github/instructions/titane.instructions.md`: alignement stopline/verify-or-rollback sur `scripts/autoheal/*`."\x3b   echo "- `.github/instructions/frontend.instructions.md` et `.github/instructions/tauri.instructions.md`: clarification doctrine (compat marker vs doctrine active)."\x3b   echo "- `.github/instructions/docs-registry.instructions.md`: `applyTo` étendu à `proof_packs/**`."\x3b   echo "- `scripts/autoheal/*`: système append-only + garde anti-récurrence créé."\x3b   echo "- `scripts/verify_instructions.sh`: gate doc automatisée (frontmatter, mermaid, markers, autoheal)."\x3b   echo\x3b   echo "## Pourquoi"\x3b   echo "- Supprimer les ambiguïtés doctrinales et rendre la gouvernance exécutable sans dérive."\x3b   echo "- Rendre obligatoire la capture de chaque fix + test anti-récurrence."\x3b   echo "- Garantir un verdict binaire prouvable par scripts et artefacts."\x3b } > "$PACK_DIR/05_CHANGES_APPLIED.md";961edc3e-8c4f-40ac-9850-04d2f72954dc]633;C# 05_CHANGES_APPLIED

- Date: 2026-03-04T17:17:11-05:00

## Diff ciblé (fichiers modifiés)
```bash
$ git diff --name-only -- .github scripts/autoheal scripts/verify_instructions.sh
.github/copilot-instructions.md
.github/copilot-setup-checklist.md
.github/copilot-workflow.mermaid
.github/instructions/docs-registry.instructions.md
.github/instructions/frontend.instructions.md
.github/instructions/tauri.instructions.md
.github/instructions/tests-e2e.instructions.md
.github/instructions/titane.instructions.md
```

## Résumé avant/après
- : ajout format de sortie obligatoire, migration AutoHeal vers , règle constitutionnelle anti-récurrence, gates AH enrichies.
- : ajout Inventory/Contradictions + obligations AutoHeal/detect_recurrence/verify_instructions.
- : pipeline complet Bootstrap->Inventory->Contradictions->Patch->Verify->AutoHeal->Proof-pack->Verdict.
- : path AutoHeal canonique + garde récurrence + anti-flaky renforcé.
- : alignement stopline/verify-or-rollback sur .
-  et : clarification doctrine (compat marker vs doctrine active).
- :  étendu à .
- : système append-only + garde anti-récurrence créé.
- PASS: G_DOC_COPILOT_INSTRUCTIONS_PRESENT
PASS: G_DOC_WORKFLOW_PRESENT
PASS: G_DOC_CHECKLIST_PRESENT
PASS: G_FRONTMATTER_docs-registry.instructions.md
PASS: G_FRONTMATTER_frontend.instructions.md
PASS: G_FRONTMATTER_tauri.instructions.md
PASS: G_FRONTMATTER_tests-e2e.instructions.md
PASS: G_FRONTMATTER_titane.instructions.md
PASS: G_MERMAID_SYNTAX_MIN
PASS: G_AUTOHEAL_FILE_README.md
PASS: G_AUTOHEAL_FILE_autoheal_rules.jsonl
PASS: G_AUTOHEAL_FILE_apply_autoheal.sh
PASS: G_AUTOHEAL_FILE_detect_recurrence.sh
INFO: autoheal-jsonl-valid
PASS: G_AUTOHEAL_JSONL_VALID
PASS: G_MARKER_VERDICT_UNIQUE
# 05_CHANGES_APPLIED

- Date: 2026-03-04T17:17:11-05:00

## Diff ciblé (fichiers modifiés)

```bash
git diff --name-only -- .github scripts/autoheal scripts/verify_instructions.sh
```

## Résumé avant/après

- `.github/copilot-instructions.md` : ajout du format de sortie opératoire, migration AutoHeal vers `scripts/autoheal/*`, règle anti-récurrence explicite, gates AH enrichies.
- `.github/copilot-setup-checklist.md` : ajout des étapes Inventory/Contradictions et obligations AutoHeal (`detect_recurrence` + `verify_instructions`).
- `.github/copilot-workflow.mermaid` : pipeline gouverné complet (`Bootstrap -> Inventory -> Contradictions -> Patch -> Verify -> AutoHeal Append -> Proof-pack -> Verdict`).
- `.github/instructions/tests-e2e.instructions.md` : path AutoHeal canonique + gate récurrence + anti-flaky conservé.
- `.github/instructions/titane.instructions.md` : alignement stopline et verify-or-rollback sur `scripts/autoheal/*`.
- `.github/instructions/frontend.instructions.md` et `.github/instructions/tauri.instructions.md` : clarification doctrine (marqueur compatibilité vs doctrine active).
- `.github/instructions/docs-registry.instructions.md` : `applyTo` étendu à `proof_packs/**`.
- `scripts/autoheal/*` : système append-only anti-récurrence créé.
- `scripts/verify_instructions.sh` : gate doc automatisée (présence fichiers, frontmatter, mermaid, marqueurs, autoheal).

## Pourquoi

- Supprimer les ambiguïtés doctrinales et rendre la gouvernance exécutable sans dérive.
- Rendre obligatoire la capture de chaque fix avec garde anti-récurrence.
- Garantir un verdict binaire prouvable par scripts et artefacts.
