# 12_PROMPT_FILES_PLAN

## Principes
- Scope etroit
- Reutilisable
- Plus precis que always-on
- Connecte aux fichiers repo pertinents
- Sans duplication de doctrine globale

## Prompt files requis

### .github/prompts/audit-instructions.prompt.md
- scope: audit complet instructions/gates/proofs
- usage: PATH_HEAVY instructions governance
- inputs: liste instructions + validators
- outputs: gaps, contradictions, gates

### .github/prompts/fix-instructions-drift.prompt.md
- scope: corriger drift minimal patch
- usage: quand contradiction/duplication detectee
- inputs: contradictions file + inventory
- outputs: patch plan + checks

### .github/prompts/update-mapping.prompt.md
- scope: MAJ MAP docs et log
- usage: changement surfaces/IPC/architecture
- inputs: diffs code + map files
- outputs: map updates + map gates

### .github/prompts/run-proof-pack.prompt.md
- scope: produire proof pack standard
- usage: sessions gouvernees
- inputs: objectif session + checks results
- outputs: structure proof-pack complete

### .github/prompts/release-readiness.prompt.md
- scope: pre-release gating
- usage: release branch prep
- inputs: version files + CI + checksums
- outputs: go/no-go qualifie

### .github/prompts/contradiction-resolution.prompt.md
- scope: resoudre conflit de couches
- usage: BLOCKED_DOCTRINE risques
- inputs: matrix priorite + fichiers en conflit
- outputs: winner layer + patch minimal

### .github/prompts/simple-fast-session.prompt.md
- scope: chemin simple low-cost
- usage: petit fix local
- inputs: path impacte
- outputs: minimal discovery + targeted proof

### .github/prompts/heavy-runtime-session.prompt.md
- scope: chemin heavy runtime/governance
- usage: IPC/Tauri/E2E/release/instruction architecture
- inputs: bootstrap complet
- outputs: full analysis + full gate pack
