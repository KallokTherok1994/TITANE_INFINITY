# PROJECT CONTEXT

**Project:** TITANE_INFINITY  
**Repo:** C:\Dev\TITANE_INFINITY  
**Branch:** MAIN  
**HEAD at bootstrap:** 6c6aa6e01  
**Bootstrap date:** 2026-05-28

## Description

TITANE_INFINITY is a desktop application built with Tauri v2 + React + TypeScript.
Current version: 35.x (see package.json).
Product chat uses Ollama + gemma2:2b as default.
Dev tooling uses qwen3.5:9b via MCP.

## Stack

- Frontend: React + TypeScript + Vite
- Desktop: Tauri v2 (Rust backend)
- Chat AI: Ollama (gemma2:2b product, qwen3.5:9b dev)
- Package manager: pnpm (corepack) — npm forbidden
- OS target: Windows 11 (primary)
- Shell: PowerShell (primary), Bash (legacy fallback)

## Current NEXUS phase

GATE_4_AGENT_OS_CREATION

## Key governance files

- docs/nexus-v36/ — bootstrap reports and proofs
- .titane-dev/ — local dev Agent OS
- OLLAMA_RUNTIME_MAP.md — model boundary record
- UI_SURFACE_MAP.md — surface registry
- scripts/titane-dev/ — Windows-first scripts

## Key constraints

- src/ and src-tauri/ must not be mutated without Surface Decision Matrix + Kevin approval
- gemma2:2b must remain product chat default
- MCP trust requires manual VS Code approval
- verify:ollama:dev:live and verify:ollama:dev:stack remain BLOCKED_USER_STOP until Kevin approves
