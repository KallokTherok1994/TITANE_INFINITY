# 15 - Provider Tool Truth Matrix

| Element | Preuve | Statut | Label |
|---|---|---|---|
| Ollama reachable | test-chat-system x3 | PASS | PRESENT_AND_PROVEN |
| Fallback annonce | message cible dans script + checks | PASS | PRESENT_AND_PROVEN |
| Tool invocation verifiee en chat E2E | non prouvee | BLOCKED | TOOL_LIE |
| silent fallback | non concluant cote E2E chat | BLOCKED | FALLBACK_MASKING |
