# 03_OVERLOAD_ANALYSIS

## S1 - Kernel always-on trop dense
- exact file(s): `.github/copilot-instructions.md`
- overload type: densite normative elevee (22 sections + gates + mapping + progression)
- execution impact: latence de routage et surcharge contexte
- future maintenance impact: drift et contradictions probables
- correction path: extraire workflows lourds vers prompts, garder 10-12 regles kernel
- expected acceleration gain: HIGH (startup plus court, moins de tokens)

## S2 - Doctrine repetee dans plusieurs couches
- exact file(s): `.github/copilot-instructions.md`, `.github/instructions/titane.instructions.md`, `.github/instructions/tauri.instructions.md`, `.github/instructions/frontend.instructions.md`
- overload type: duplication de doctrine globale
- execution impact: conflits d interpretation
- future maintenance impact: edits multiples obligatoires
- correction path: source canonique unique en L1, references courtes en L2
- expected acceleration gain: HIGH

## S3 - Rules path-specific repetent le global
- exact file(s): `.github/instructions/titane.instructions.md`
- overload type: scope mixing
- execution impact: hesitation de priorite
- future maintenance impact: regression doctrinale silencieuse
- correction path: garder uniquement invariants locaux/path-bound
- expected acceleration gain: MEDIUM

## S4 - Logique agent en mode documentation-only
- exact file(s): `.github/copilot-agents.md`, `.github/copilot-agents/*.agent.md`
- overload type: pseudo-routage non mecanise
- execution impact: cout cognitif sans execution garantie
- future maintenance impact: obsolescence rapide
- correction path: migrer vers agents operationnels `.github/agents/` + handoff clair
- expected acceleration gain: MEDIUM

## S5 - Regles binaires encore prose-only
- exact file(s): kernel et path instructions
- overload type: verification manuelle
- execution impact: checks incomplets
- future maintenance impact: dette de governance
- correction path: nouveaux verify scripts + schemas YAML/JSON
- expected acceleration gain: HIGH

## S6 - Preuves/gates decrites en prose
- exact file(s): kernel + docs divers
- overload type: non deterministic validation
- execution impact: PASS non uniformes
- future maintenance impact: QA fragile
- correction path: table gates machine-readable + scripts
- expected acceleration gain: MEDIUM

## S7 - Startup ralenti par lecture large
- exact file(s): kernel global et docs legacy associes
- overload type: broad mandatory context
- execution impact: temps de comprehension augmente
- future maintenance impact: derive vers "narrative governance"
- correction path: PATH_SIMPLE minimal + trigger PATH_HEAVY explicite
- expected acceleration gain: HIGH

## S8 - Modes de session melanges
- exact file(s): `titane.instructions.md`, agents doc-only, kernel
- overload type: doc-only vs full-auto vs execution-first
- execution impact: ambiguite decisionnelle
- future maintenance impact: contradictions recurrentes
- correction path: matrice priorite stricte + statut BLOCKED_DOCTRINE
- expected acceleration gain: MEDIUM
