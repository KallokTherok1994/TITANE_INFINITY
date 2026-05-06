# AUTHORITY MAP — Lock A0I
# Date: 2026-05-06

| Layer | File | Role in A0I |
|-------|------|-------------|
| L1 | `.github/copilot-instructions.md` | Constitutional kernel — not modified |
| L2 | `.github/instructions/*.instructions.md` | Scoped instructions — not modified |
| L3 | `AGENTS.md` | Repo agents — not modified |
| L4 | `.github/agents/*.agent.md` | Custom agents — not modified |
| L5 | `.github/prompts/*.prompt.md` | Prompts — not modified |
| L6 | `scripts/verify_instructions.sh` | Master gate — run, not modified |
| L6 | `scripts/verify/verify_autopilot_lock_bounds.sh` | Boundary gate — run |
| L6 | `scripts/verify/verify_copilot_instruction_source_map.sh` | Source map gate — run |
| L6 | `scripts/autoheal/detect_recurrence.sh` | Recurrence gate — run |
| L7 | `docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md` | Source map — read |
| L8 | `proof_packs/LOCK_A0_INSTRUCTIONS_SYSTEM_ALIGNMENT_2026-05-06/VERDICT.md` | Historical proof — read |
| L8 | `proof_packs/LOCK_A0_INSTRUCTIONS_SYSTEM_ALIGNMENT_2026-05-06/VALIDATORS.log` | Historical proof — read |
