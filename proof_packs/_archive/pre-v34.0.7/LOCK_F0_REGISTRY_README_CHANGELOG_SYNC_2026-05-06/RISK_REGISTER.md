# F0 Risk Register

**Lock:** F0  
**Date:** 2026-05-06

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|------------|
| F0-R01 | README falsely claims SEALED | LOW — mitigated by validator C02 | HIGH | verify_readme_changelog_registry_sync C02 checks explicitly |
| F0-R02 | D5 pack prematurely promoted to SEALED | LOW — existing pack is PROVISIONAL | HIGH | verify_intelligence_seal_prereqs C03 checks VERDICT line |
| F0-R03 | Desktop E2E registry drift recurs after F1 | MEDIUM | MEDIUM | Re-run verify_readme_changelog_registry_sync after F1 |
| F0-R04 | CHANGELOG Unreleased section merged without seal | LOW | MEDIUM | D5 seal requires T4 approval — CHANGELOG note explicit |
| F0-R05 | Registry sync diverges again | LOW | MEDIUM | detect_recurrence.sh auto-captures any repeat pattern |
| F0-R06 | Memory files accidentally staged | LOW — excluded by `.gitignore` check | HIGH | FILES_CHANGED.md lists NOT_STAGED; git diff --cached verified before commit |
