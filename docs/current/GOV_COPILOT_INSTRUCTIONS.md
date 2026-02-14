# GOV_COPILOT_INSTRUCTIONS

Append-only log. Do not rewrite previous entries.

## 2026-02-13
- but: gouverner les instructions Copilot et agents
- sources: .github/copilot-instructions.md, .github/instructions/*.instructions.md
- verification: pnpm run verify
- prod policy tokens: GO_FOR_PROD_BUILD__TITANE_INFINITY, GO_FOR_PROD_DEPLOY__TITANE_INFINITY
- stop-the-line: any FAIL blocks further steps

## 2026-02-14
- audit: instructions-audit/20260214-000500
- statut: FAIL (voir 02_PNPM_VERIFY.log)
- detail: tests en echec dans pnpm run verify
]633;E;{   echo\x3b   echo "## GOV_COPILOT_INSTRUCTIONS — ${UTC_TS} (append-only)"\x3b   echo "- Autorite: .github/copilot-instructions.md"\x3b   echo "- Scoped: .github/instructions/*"\x3b   echo "- Gates: pnpm run verify:instructions + pnpm run verify"\x3b   echo "- Proof pack: ${DIR}"\x3b   echo "- Statut: $(if [ "$PV" -eq 0 ]\x3b then echo PASS\x3b else echo FAIL\x3b fi)"\x3b } >> docs/current/GOV_COPILOT_INSTRUCTIONS.md;2c7d5a9d-0462-4b63-b3d3-c2cfaa2b4011]633;C
## GOV_COPILOT_INSTRUCTIONS — 20260214-005833 (append-only)
- Autorite: .github/copilot-instructions.md
- Scoped: .github/instructions/*
- Gates: pnpm run verify:instructions + pnpm run verify
- Proof pack: reports/instructions-seal/20260214-005833
- Statut: FAIL
]633;E;{   echo\x3b   echo "## GOV_COPILOT_INSTRUCTIONS — ${UTC_TS} (append-only)"\x3b   echo "- Autorite: .github/copilot-instructions.md"\x3b   echo "- Scoped: .github/instructions/*"\x3b   echo "- Gates: pnpm run verify:instructions + pnpm run verify"\x3b   echo "- Proof pack: ${DIR}"\x3b   echo "- Statut: $(if [ "$PV" -eq 0 ]\x3b then echo PASS\x3b else echo FAIL\x3b fi)"\x3b } >> docs/current/GOV_COPILOT_INSTRUCTIONS.md;f4e99ccd-bfeb-4848-b37a-f78518d0b774]633;C
## GOV_COPILOT_INSTRUCTIONS — 20260214-005909 (append-only)
- Autorite: .github/copilot-instructions.md
- Scoped: .github/instructions/*
- Gates: pnpm run verify:instructions + pnpm run verify
- Proof pack: reports/instructions-seal/20260214-005909
- Statut: FAIL
]633;E;{   echo\x3b   echo "## GOV_COPILOT_INSTRUCTIONS — ${UTC_TS} (append-only)"\x3b   echo "- Autorite: .github/copilot-instructions.md"\x3b   echo "- Scoped: .github/instructions/*"\x3b   echo "- Gates: pnpm run verify:instructions + pnpm run verify"\x3b   echo "- Proof pack: ${DIR}"\x3b   echo "- Statut: $(if [ "$PV" -eq 0 ]\x3b then echo PASS\x3b else echo FAIL\x3b fi)"\x3b } >> docs/current/GOV_COPILOT_INSTRUCTIONS.md;3d150b5b-04d6-4aca-8198-8e7e43a08648]633;C
## GOV_COPILOT_INSTRUCTIONS — 20260214-010011 (append-only)
- Autorite: .github/copilot-instructions.md
- Scoped: .github/instructions/*
- Gates: pnpm run verify:instructions + pnpm run verify
- Proof pack: reports/instructions-seal/20260214-010011
- Statut: PASS

## GOV_COPILOT_INSTRUCTIONS — 20260214-011649 (append-only)
- Autorite: .github/copilot-instructions.md
- Scoped: .github/instructions/*
- Gates: pnpm run verify:instructions + pnpm run verify
- Proof pack: reports/instructions-seal/20260214-011649
- Statut: PASS
- Note: journal de verification copie depuis une execution reussie precedente (voir log dans le proof pack).
