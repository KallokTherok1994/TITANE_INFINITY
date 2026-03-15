# 01 SCOPE AND COLLISIONS

Scope certifié dans cette session
- Shell global: navigation haute, routing principal, chargement de pages.
- TITANE: conversation, mémoire.
- TIME, DEV, ADMIN: chargement, navigation, sous-onglets visibles.
- Invariants gouvernés: Tauri-only, online-first.
- Build frontend sécurisé et tests Rust.

Snapshot dépôt
| Item | Value |
|---|---|
| Branch | MAIN |
| Head | c5abe3eb2 |
| git status --porcelain | vide |

Collision check
| Gate | Result | Detail |
|---|---|---|
| G_SCOPE_ISOLATED | PASS | aucun changement utilisateur en cours |
| G_NO_ACTIVE_PHASE_COLLISION | PASS | aucun overlap détecté sur fichiers critiques |

Propriétaires critiques identifiés
- Routes/shell: src/App.tsx
- Navigation haute: src/components/layout/TopNav.tsx
- Chat canonique: src/pages/TitanePage.tsx -> src/components/sections/ConversationSection.tsx
- Mémoire canonique: src/pages/TitanePage.tsx -> src/components/sections/MemorySection.tsx
- TIME: src/pages/TimePage.tsx
- DEV: src/pages/DevPage.tsx
- ADMIN: src/features/admin/AdminPage.tsx
- Configuration admin: src/pages/ConfigurationHub.tsx
