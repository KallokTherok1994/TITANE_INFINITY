# TITANE∞ — Architecture (FR)

**Version :** 28.0.0  
**Statut :** QUALIFIED  
**Date :** 2026-03-17

> Voir aussi : `docs/ARCHITECTURE.md`, `docs/MAP_ARCHITECTURE_4RING.md`, `docs/IPC_CONTRACT.md`

---

## Modèle 4-Ring

TITANE∞ utilise un modèle d'architecture à **4 anneaux** (rings) pour séparer les responsabilités.

```
Ring 1 — Contrats de type      [src/types/]
Ring 2 — Logique pure          [src/engines/]
Ring 3 — Orchestration I/O     [src/services/]
Ring 4 — UI + OS/IPC           [src/ UI + src-tauri/]
```

### Règles d'importation

- **Pas d'importation inverse** : un ring ne peut pas importer d'un ring extérieur
- Ring 1 → aucune dépendance extérieure
- Ring 2 → peut importer Ring 1 uniquement
- Ring 3 → peut importer Ring 1 et Ring 2
- Ring 4 → peut importer tous les rings

**Statut :** QUALIFIED — vérifié par `test:architecture` et `scripts/verify/`

---

## Frontend (Ring 4 — UI)

| Composant | Technologie | Version |
|---|---|---|
| Framework UI | React | 18.x |
| Langage | TypeScript | 5.5 (strict) |
| Build | Vite | 6.x |
| État | Hooks + Context API | — |
| Communication backend | Tauri IPC | v2 |

**Répertoire :** `src/`

---

## Backend (Ring 4 — OS/IPC)

| Composant | Technologie | Notes |
|---|---|---|
| Runtime | Tauri v2 | Application desktop uniquement |
| Langage backend | Rust 2021 | `src-tauri/src/` |
| Sérialisation IPC | JSON via serde | — |
| Modèle de concurrence | Arc<Mutex<T>> | — |
| Gestion des erreurs | Result<T, E> | Jamais de panic non contrôlé |

**Répertoire :** `src-tauri/`

---

## Contrat IPC

Toutes les communications frontend → backend suivent ce contrat :

```typescript
// Réponse IPC standard
{
  ok: boolean,
  content?: string,
  error?: {
    code: string,
    message: string,
    recoverable: boolean
  },
  meta?: {
    correlationId: string,
    provider: string,
    latencyMs: number
  }
}
```

**Règles du contrat :**
- `ok: false` sur toute erreur — jamais de silence
- Timeout UI : 30 secondes → erreur + bouton "Réessayer"
- L'allowlist Tauri (`src-tauri/allowlist.whitelist.stable.json`) contrôle quelles commandes sont exposées

**Source :** `docs/IPC_CONTRACT.md` (PROVEN)

---

## Politique réseau

```
UI → IPC Tauri → Services (Ring 3) → Network Gateway → Fournisseur externe
```

- **Pas d'accès réseau direct depuis l'UI** — toutes les requêtes passent par l'IPC
- **Online-first gouverné** — connectivité réseau requise pour les fournisseurs cloud
- **Fallback local obligatoire** — doit s'activer si les fournisseurs cloud sont indisponibles (PARTIAL)
- Gate de vérification : `pnpm run verify:online-first` et `pnpm run verify:network-guard`

---

## Modules backend principaux

| Module | Responsabilité | Statut |
|---|---|---|
| Helios | Métriques système | PROVEN |
| Nexus | Graphe de dépendances | PROVEN |
| Harmonia | Équilibrage et harmonisation | QUALIFIED |
| Sentinel | Surveillance sécurité | QUALIFIED |
| Watchdog | Monitoring processus | PROVEN |
| SelfHeal | Auto-réparation | PARTIAL |
| AdaptiveEngine | Adaptation comportementale | PARTIAL |
| Memory | Mémoire hiérarchique STM/MTM/LTM | PARTIAL |

---

## Diagrammes

- Architecture globale : `docs/ARCHITECTURE.md`
- Mapping 4-Ring : `docs/MAP_ARCHITECTURE_4RING.md`
- Surfaces réseau : `docs/MAP_SURFACES_NETWORK.md`
- Diagrammes Mermaid rendus : `docs/diagrams/rendered/`

---

*Documentation en anglais : [docs/dev/en/architecture.md](../en/architecture.md)*
