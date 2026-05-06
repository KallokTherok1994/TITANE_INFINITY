# RESEARCH SOURCE MAP SUMMARY — Lock A0 v5
# Date: 2026-05-06

## Source Map Location

`docs/research/COPILOT_INSTRUCTION_SYSTEM_SOURCE_MAP.md`

## Entries (6 total)

| ID | Source | Type | Status | Doctrine Impact |
|----|--------|------|--------|----------------|
| S001 | VS Code Copilot Custom Instructions | official | VERIFIED | adopted |
| S002 | VS Code Copilot Prompt Files Workflow | official | VERIFIED | adopted |
| S003 | VS Code Copilot Agent Mode (Custom Agents) | official | VERIFIED | adopted |
| S004 | GitHub Copilot Coding Agent Best Practices | official | TO_VERIFY | candidate |
| S005 | Prompt Engineering — Governance and Traceability | article | TO_VERIFY | candidate |
| S006 | VS Code Copilot — Avoid Conflicting Instructions | official | TO_VERIFY | candidate |

## Research Boundary

This pass was bounded to:
- Copilot instruction system structure
- Prompt files workflow
- Custom agent mode
- Coding agent / Autopilot best practices
- Prompt governance and traceability
- Instruction overload prevention

NOT researched (deferred to later locks):
- MemoryGraph, RAG, OMEGA
- Research Engine (C3)
- Provider/Model routing (C0)
- AI governance beyond instruction system

## Adoption Rules

- S001, S002, S003: VERIFIED against official VS Code docs — adopted as doctrine support
- S004, S005, S006: TO_VERIFY — treated as advisory only, not adopted
- No TO_VERIFY source was promoted as authoritative TITANE doctrine

## Validator

`verify_copilot_instruction_source_map.sh` — PASS (exit 0)
