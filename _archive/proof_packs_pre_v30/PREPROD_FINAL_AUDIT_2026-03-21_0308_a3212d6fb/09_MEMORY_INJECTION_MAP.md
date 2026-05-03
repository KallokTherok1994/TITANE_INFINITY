# 09_MEMORY_INJECTION_MAP

Memory injection chain (current code truth):

- UI input -> conversation request
- conversation_generate command path
- unified memory recall injection into system prompt (recently fixed family)
- metadata feedback for recalled memory IDs/count

Session proof level:

- Source/path audit: done
- Dedicated memory runtime replay in this session: not executed

Classification:

- PARTIAL_CHAIN (honest; no fake PASS)
