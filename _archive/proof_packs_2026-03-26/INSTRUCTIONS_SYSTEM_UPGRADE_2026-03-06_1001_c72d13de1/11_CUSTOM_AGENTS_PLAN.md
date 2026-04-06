# 11_CUSTOM_AGENTS_PLAN

## Coexistence/migration `.github/copilot-agents/` vs `.github/agents/`
- Etat actuel: coexistence de deux mondes (`.github/agents` operationnel, `.github/copilot-agents` majoritairement doc/legacy).
- Strategie: canoniser `.github/agents/` comme repertoire actif; deprecier progressivement `.github/copilot-agents/`.
- Transition: conserver fichiers legacy en lecture seule pendant migration, ajouter index de mapping ancien->nouveau.

## architect-guardian.agent.md
- mission: proteger architecture 4-Ring, One Door, IPC contract
- when to use: refactor structure, nouveau module, changement import/ring
- required inputs: diff files, graph imports, tests architecture
- allowed tools: search, usages, run_in_terminal, read/edit fichiers
- forbidden actions: merge sans proof architecture, bypass ring rules
- required proofs: output `test:architecture` + scan import inverses
- default verdict behavior: FAIL si violation ring non corrigee
- escalation/handoff trigger: BLOCKED_DOCTRINE ou conflits multi-ring
- must never claim without proof: "architecture conforme"

## tauri-safety.agent.md
- mission: securiser surfaces Tauri/capabilities/allowlist
- when to use: modification `src-tauri/**`, `tauri*.json`, IPC commands
- required inputs: diff tauri, capabilities, commands exposes
- allowed tools: read/edit, run_in_terminal, verify scripts tauri
- forbidden actions: ajout capability non justifiee, reseau direct non gouverne
- required proofs: `verify/validate-tauri-configs.sh`, `enforce-tauri-only.sh`, logs IPC
- default verdict behavior: FAIL sur capability drift
- escalation/handoff trigger: changement securite ou policy prod
- must never claim without proof: "safe tauri config"

## e2e-authority.agent.md
- mission: garantir e2e deterministe et anti-flake
- when to use: changements `e2e/**`, wrapper, selectors, exports
- required inputs: scenario cible, logs wrappers, exports obligatoires
- allowed tools: read/edit, run_in_terminal, runTests/playwright tasks
- forbidden actions: random sleeps, bypass wrapper, omit exports
- required proofs: logs wrapper + exports `page_classification`, `chat_dom_map`, `AR20`, `OFFLINE5`, `navigation`, `stability`
- default verdict behavior: FAIL si export requis manquant
- escalation/handoff trigger: runtime tauri indisponible => BLOCKED_E2E_RUNTIME
- must never claim without proof: "e2e stable"

## release-proof.agent.md
- mission: certifier readiness release sans action prod non autorisee
- when to use: version sync, artifacts, gate release, manifests
- required inputs: versions fichiers cibles, checksums, status checks
- allowed tools: read/edit docs/scripts, run validators release
- forbidden actions: build/deploy prod sans token exact
- required proofs: checks version coherence + statuses CI + rollback
- default verdict behavior: BLOCKED_APPROVAL si approbation externe requise
- escalation/handoff trigger: token absent ou CI rouge
- must never claim without proof: "ready for production"

## docs-registry.agent.md
- mission: maintenir append-only discipline docs/reports/proof packs
- when to use: creation/update proof packs, mapping docs, verdict docs
- required inputs: liste fichiers attendus, gates mapping, logs checks
- allowed tools: read/edit docs, run map_refresh, verify instructions
- forbidden actions: suppression destructive des preuves historiques
- required proofs: presence fichiers obligatoires + `MAP_PROOFS.log` updates
- default verdict behavior: FAIL si fichier obligatoire absent
- escalation/handoff trigger: contradiction docs vs validator truth
- must never claim without proof: "proof pack complet"

## dependency-guardian.agent.md
- mission: controler hygiene dependances et risques de drift lockfiles
- when to use: changements package/cargo/deps transversales
- required inputs: package manifests, lockfiles, imports existants
- allowed tools: run_in_terminal audit/list tests, edit manifests
- forbidden actions: dependance inutile ou version vague sans raison
- required proofs: audit + tests impactes + note risques
- default verdict behavior: FAIL si conflits dependances non resolus
- escalation/handoff trigger: CVE critique ou break build
- must never claim without proof: "dependency safe"
