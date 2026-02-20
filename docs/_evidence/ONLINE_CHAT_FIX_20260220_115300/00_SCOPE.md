# Scope

But
- Eliminer les faux messages offline quand les providers sont disponibles.
- Definir un contrat decision online/offline unique et trace.
- Ajouter un gate NO_FALSE_OFFLINE minimal.

Non buts
- Refactor global du pipeline chat.
- Changer l UX en dehors des messages de fallback timeout.
- Changer les flows de build ou packaging.

Ring impacte
- Ring 4: src-tauri (conversation_engine)
- Ring 4: src (services conversationEngine + types)

Statut
- EXPERIMENTAL
