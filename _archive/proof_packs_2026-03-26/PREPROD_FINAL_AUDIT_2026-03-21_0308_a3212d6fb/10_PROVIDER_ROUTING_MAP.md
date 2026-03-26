# 10_PROVIDER_ROUTING_MAP

Provider chain map:

- UI selection/state
- frontend provider service + circuit breaker
- invoke path to Tauri backend
- backend provider availability and failure counters
- response metadata propagation back to UI

Latest fix family reviewed:

- failure counter reset after successful provider health probe
- frontend circuit breaker success reset behavior

Session proof level:

- Source and recent change audit: done
- Full live provider routing replay in this session: not executed

Classification:

- PARTIAL_CHAIN
