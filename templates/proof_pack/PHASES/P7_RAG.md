# Phase P7 — RAG

<!-- APPEND-ONLY -->

## Objectives

- Verify RAG (Retrieval-Augmented Generation) pipeline integrity
- Verify no data leakage between sessions (memory isolation)
- Verify local-first fallback for RAG queries

## Checklist

- [ ] `bash checks/check_G8_MEMORY_ISOLATION.sh` — PASS
- [ ] RAG queries tested with local Ollama model
- [ ] RAG queries tested with external provider (if configured)
- [ ] No cross-session data in RAG context window
- [ ] Fallback to offline generator verified

## Evidence

> Paste RAG test outputs here.

## Notes

> Document any RAG configuration changes and their impact.
