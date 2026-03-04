# MOVE_PLAN

## Plan formalisé (FROM -> TO)
1. home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/specs/OMEGA_V2_SPECS.md
   -> docs/06_api/OMEGA_V2_SPECS.md
   Raison: markdown versionné hors zone docs canonique.

## Rollback associé
- git restore --staged docs/06_api/OMEGA_V2_SPECS.md
- git restore --worktree docs/06_api/OMEGA_V2_SPECS.md
- git checkout HEAD~1 -- home/titane-os/Documents/GitHub/TITANE_INFINITY/docs/specs/OMEGA_V2_SPECS.md
