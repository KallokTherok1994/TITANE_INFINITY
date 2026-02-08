# BASELINE_IMPORT_SEARCH

Commandes exécutées:

```
find . -maxdepth 5 -type f \( -iname "*v5*.zip" -o -iname "*kevin*.*" -o -iname "*cartograph*.*" -o -iname "*ui*carto*.*" \) \
  | sed 's|^\./||'

find docs -type f \( -iname "*.zip" -o -iname "*.pdf" -o -iname "*.docx" -o -iname "*.md" \) \
  | grep -Ei "(kevin|v5|carto|ui-carto|cartography)" || true
```

Sorties:

```
.archive_cleanup/analysis_docs/APPROVAL_REQUEST_KEVIN_v27_SPRINT.md
.archive_cleanup/history/PRESENTATION_FINALE_KEVIN_v26.3.0.md
.archive_cleanup/history/DECISION_FINALE_KEVIN_v26.4.0.md
.archive_cleanup/history/KEVIN_DECISION_POINT_v26.4.0.md
.archive_cleanup/history/EXECUTIVE_REPORT_KEVIN_SPRINT6_v26.4.0.md
.archive_cleanup/deployment_info/EXECUTIVE_SUMMARY_FOR_KEVIN.md
.archive_cleanup/deployment_info/EXECUTIVE_SUMMARY_1PAGE_KEVIN.md
.archive_cleanup/config_ci_cd/CHECKLIST_KEVIN_ACTIONS.md
docs/ui-carto-copilot/VERIFICATION/KEVIN_V5_IMPORT_LOG.md
docs/ui-carto-copilot/VERIFICATION/02-kevin-v5-presence.md
docs/ui-carto-copilot/VERIFICATION/KEVIN_V5_IMPORT_FAIL.md
docs/ui-carto-copilot/VERIFICATION/KEVIN_V5_IMPORT_PROOF.md
docs/ui-carto-copilot/VERIFICATION/SEAL_UI_CARTOGRAPHY.md.INVALIDATED
docs/ui-carto-copilot/VERIFICATION/MISSING_KEVIN_V5.md
docs/ui-carto-copilot/70-compare/70-delta-template-vs-kevin-v5.md
docs/99_ARCHIVE/merged/CARTOGRAPHIE_TERMINEE_CHAT_IA_VOIX_v17.3.0.md
docs/99_ARCHIVE/sessions/REGLES_PERMANENTES_KEVIN_THIBAULT.md
docs/99_ARCHIVE/versions/v15/PHASE_1_CARTOGRAPHIE_v15.md
docs/reference/kevin-v5/KEVIN_V5_IMPORT_CHECKLIST.md
docs/reference/kevin-v5/KEVIN_V5_IMPORT_SPEC.md
docs/reference/kevin-v5/KEVIN_V5_IMPORT_EXAMPLE.md
SESSION_EXECUTION_SUMMARY_KEVIN.md
```
