# Proof Pack — v35.0.0 Sprint B.1 (offline-first cache) — validation pre-BUILD

**Date** : 2026-05-14
**Branche** : `MAIN`
**HEAD** : `a798d61be` (v35.0.0 Sprint B.1)
**Périmètre** : validation indépendante du commit `a798d61be` avant déclenchement éventuel de Rule 14 (`BUILD ALL`).
**Mode** : DURABLE.
**Doctrine** : Rule 1 (minimal patch additif), Rule 6 (IPC envelope intact), Rule 10 (AutoHeal), Rule 12 (proof pack), Rule 15 (mapping), Rule 16 (tests), Rule 18 (commit direct-MAIN).

---

## 1. Verdict global

| Gate | Statut | Preuve |
|---|---|---|
| Vitest scope v35 (queryPersister + hooks/queries + ui-audit) | **PASS** 27/27 | `raw/01_vitest_v35_scope.txt` |
| `tsc --noEmit -p tsconfig.json` | **PASS** exit=0 | `raw/02_tsc.txt` |
| AutoHeal `detect_recurrence.sh` | **PASS** entries=1926 | `raw/03_detect_recurrence.txt` |
| `verify_instructions.sh` | **PASS 50 / FAIL 2 tolérés préexistants** | `raw/04_verify_instructions.txt` |
| Git history direct-MAIN | **PASS** push origin/MAIN OK | `raw/05_git_log.txt` |
| Worktree scope propre | **PASS** seuls fichiers hors-scope intentionnels | `raw/06_git_status.txt` |

**VERDICT** : `PASS`

---

## 2. Détail Vitest scope v35

```
✓ src/__tests__/hooks/queries/pilots.test.tsx       (6)
✓ src/__tests__/lib/queryPersister.test.ts          (5)
✓ src/__tests__/hooks/queries/chat.test.tsx         (5)
✓ tests/unit/scripts/test-coverage-matrix.test.ts   (4)
✓ tests/unit/scripts/tag-orphan-pages.test.ts       (7)

Test Files  5 passed (5)
Tests       27 passed (27)
```

Couverture du commit `a798d61be` :
- Nouveau module `src/lib/queryPersister.ts` (5/5)
- Régression hooks de domaine v34.4.0 (chat 5/5, pilots 6/6)
- Régression scripts ui-audit v34.5.0 (orphan 7/7, coverage 4/4)

---

## 3. Détail `verify_instructions.sh` — FAIL tolérés

```
FAIL: G_VSCODE_AGENT_WORKFLOW_PASS
FAIL: G_OLLAMA_BOUNDARY_PASS
SUMMARY: PASS=50 FAIL=2
```

- `G_VSCODE_AGENT_WORKFLOW_PASS` : déclenché par `.vscode/settings.json` modifié localement (toggle dev `chat.mcp.enabled`). **Hors scope v35.0.0** — état préexistant à Phase A. Non staged volontairement (workspace dev override). Aucune régression introduite par B.1.
- `G_OLLAMA_BOUNDARY_PASS` : préexistant depuis v34.x (même état que dans le proof pack v34.4.0). Aucune mutation de surface Ollama dans v35.0.0 Sprint B.1.

Les deux FAIL sont **stables** sur la baseline post-v34.4.0 et restent inchangés après le commit `a798d61be`. Aucun n'est causé par les changements v35.0.0.

---

## 4. Périmètre du commit `a798d61be`

```
16 files changed, 297 insertions(+), 12 deletions(-)
create mode 100644 src/__tests__/lib/queryPersister.test.ts (125 lines)
create mode 100644 src/lib/queryPersister.ts             (100 lines)
modify         src/lib/queryClient.ts                    (+5 -0)
modify         package.json + pnpm-lock.yaml             (2 deps prod ajoutées)
modify         version sync (7 fichiers : 34.5.0 → 35.0.0)
modify         UI_SURFACE_MAP.md + docs/CARTOGRAPHY_COMPLETE.md
modify         scripts/autoheal/autoheal_rules.jsonl     (+1 entrée)
```

Surface UI : **inchangée** (aucun composant React touché).
Surface IPC : **inchangée** (aucun command Tauri touché).
Surface Ring : **inchangée** (`src/lib` reste Ring 3).
Doctrine 4-Ring + One Door + IPC `{ok,content,error}` : **respectée**.

---

## 5. Worktree hors-scope (non staged, intentionnel)

```
 M .vscode/settings.json                                      ← workspace dev override
?? deployment/archive/v34.0.11/                               ← archive préexistante (untracked)
?? deployment/latest/titane-infinity-34.0.12                  ← artefact préexistant (untracked)
?? deployment/latest/titane-infinity_34.0.12_x64_en-US.msi    ← artefact Windows v34.0.12 (untracked)
?? deployment/windows/v34.0.12/titane-infinity_34.0.12_x64_en-US.msi
```

Aucun de ces fichiers n'est lié au commit v35.0.0. Tous sont reportés en l'état depuis la session pré-Phase A.

---

## 6. Rollback plan

### 6.1 Rollback partiel (annule uniquement Sprint B.1, garde Phase A v34.5.0)

```bash
git revert a798d61be --no-edit
# OU bien :
git restore -- package.json pnpm-lock.yaml src/lib/queryClient.ts \
                UI_SURFACE_MAP.md docs/CARTOGRAPHY_COMPLETE.md \
                scripts/autoheal/autoheal_rules.jsonl \
                index.html runtime/stable/manifest.json runtime/stable/tauri.conf.json \
                src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json \
                src-tauri/tauri.base.json tauri.base.json
rm -f src/lib/queryPersister.ts src/__tests__/lib/queryPersister.test.ts
pnpm install
```

Reste alignée sur v34.5.0 (`36848a3b0`).

### 6.2 Rollback total (retour origin/MAIN avant Phase A)

```bash
git reset --hard 6eed5d7d4   # v34.4.0
git push --force-with-lease origin MAIN
```

⚠️ Force-push : à n'utiliser que sur autorisation explicite, perte des commits `36848a3b0` + `a798d61be`.

### 6.3 Désinstallation des dépendances ajoutées

```bash
pnpm remove @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client
```

---

## 7. Conditions de promotion Phase B.2 (BUILD ALL)

Avant de déclencher Rule 14, les conditions suivantes sont vérifiées :

- [x] Bump 34.5.0 → 35.0.0 effectué et sync 7 fichiers OK
- [x] Tests scope v35 PASS (27/27)
- [x] `tsc --noEmit` PASS
- [x] AutoHeal entrée présente + `detect_recurrence` PASS
- [x] `verify_instructions` baseline stable (50 PASS / 2 FAIL tolérés)
- [x] Mapping docs à jour (UI_SURFACE_MAP + CARTOGRAPHY_COMPLETE + AutoHeal scope inclut IPC_CATALOG inchangé)
- [x] Commit `a798d61be` poussé sur `origin/MAIN`
- [x] Rollback plan documenté ci-dessus
- [ ] *BUILD ALL en attente d'autorisation utilisateur* (B.2)

---

## 8. Inventaire artefacts proof pack

```
proof_packs/2026-05-14_v35_0_0_seal/
├── REPORT.md                              ← ce document
└── raw/
    ├── 01_vitest_v35_scope.txt           (PASS 27/27)
    ├── 02_tsc.txt                         (PASS exit=0)
    ├── 03_detect_recurrence.txt           (PASS entries=1926)
    ├── 04_verify_instructions.txt         (PASS 50 / FAIL 2 tolérés)
    ├── 05_git_log.txt                     (HEAD a798d61be)
    └── 06_git_status.txt                  (worktree hors-scope intentionnel)
```

---

## VERDICT

**PASS — Sprint B.1 v35.0.0 validé. Phase B.2 (BUILD ALL) déblocable sur ordre utilisateur.**

---

## 9. Addendum Sprint B.2 (BUILD ALL Linux) — VERDICT PASS

Exécution Rule 14 sur ce poste Linux, post-validation B.1.

### 9.1 Artefacts produits

| Format | Taille | SHA256 | Chemin |
|---|---|---|---|
| `.deb` | 25M | `b1a430c2e6420ec0cfcfc2532d33be5857149b848e8dfbd11940b8f5fbc59de4` | `src-tauri/target/release/bundle/deb/titane-infinity_35.0.0_amd64.deb` |
| `.rpm` | 25M | `9a49dd4df4737c710019e969ab533e2dd5f7b4399015e1fcdd5aca17774110cc` | `src-tauri/target/release/bundle/rpm/titane-infinity-35.0.0-1.x86_64.rpm` |
| `.AppImage` | 95M | `2c6941682e86e64eb84dce33466fadeb6f881e0a3063e1c5c32bee4422611e65` | `src-tauri/target/release/bundle/appimage/titane-infinity_35.0.0_amd64.AppImage` |

Fichier canonique : `RELEASE_ARTIFACTS_CHECKSUMS_35.0.0.txt`. Inventaire : `RELEASE_SURFACE_INVENTORY.md` (entrée v35.0.0 ajoutée).

### 9.2 Gates post-build

- `detect_recurrence` → PASS entries=1927 (`raw/11_detect_recurrence_post_build.txt`)
- `verify_instructions` → PASS=50 / FAIL=2 (baseline tolérée préexistante, non causée par v35) — `raw/12_verify_instructions_post_build.txt`
- Cargo release build : 11m 49s. Bundling Tauri (`deb`,`rpm`,`appimage`) propre — preuve `raw/08_tauri_build.txt`

### 9.3 Périmètre / hors scope

- **Inclus** : Linux x86_64 (AppImage + DEB + RPM).
- **Exclus** : Android APK (toolchain non vérifié sur ce poste), Windows MSI (cross-compile non supporté).
- **Install système** : `BLOCKED_SUDO_REQUIRED` (post-build.sh non interactif). Commande à la demande utilisateur :
  ```
  sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_35.0.0_amd64.deb
  bash scripts/post-build/update-desktop-icons.sh
  ```

### 9.4 AutoHeal

Entrée full-schema `AH-2026-05-14-BUILD-ALL-v35_0_0` ajoutée. `wc -l = 1931` lignes, entries comptées = 1927.

### 9.5 Commit & tag

- Commit Sprint B.2 : `922572362` — `build(release): v35.0.0 BUILD ALL Linux — AppImage+DEB+RPM — VERDICT PASS`
- Push `origin MAIN` : `0ae3d4259..922572362`

### 9.6 Collision tag `v35.0.0` (incident traçable)

Le tag git annoté `v35.0.0` était déjà publié sur `origin` (commit `4a9b2add6e52`, daté 2026-01-30, release "Web Vitals" orpheline ne suivant pas la trajectoire trunk 33.x→34.x→35.x). Operational safety interdit l'écrasement d'un tag publié (Rule 8 stop-the-line).

**Décision** : tag annoté hors namespace semver pour préserver à la fois l'historique publié et l'identité binaire v35.0.0 réellement bundlée ce build.

| Tag | Cible | État |
|---|---|---|
| `v35.0.0` (semver) | `4a9b2add6e52` (release Jan 2026 Web Vitals) | **CONSERVÉ INTACT** |
| `release/v35.0.0-tanstack-persist-2026-05-14` (custom) | `922572362` (trunk TITANE∞ Sprint B.2) | **NOUVEAU** — poussé `origin` |

Aucun rebuild requis (Rule 1) — les SHA256 v35.0.0 du bundle restent l'identité release authentique. Convention future : tout futur `vX.Y.Z` doit vérifier `git ls-remote --tags origin | grep "X.Y.Z"` avant tag pour prévenir une rechute.

### 9.7 Rollback étendu B.1 + B.2

- **Bundle précédent** : `sudo dpkg -i deployment/latest/titane-infinity_34.0.12_amd64.deb`
- **Code persistance** : `git revert 922572362 0ae3d4259 a798d61be`
- **Dépendances** : `pnpm remove @tanstack/query-sync-storage-persister @tanstack/react-query-persist-client`
- **Tag** : `git tag -d release/v35.0.0-tanstack-persist-2026-05-14 && git push --delete origin release/v35.0.0-tanstack-persist-2026-05-14`

