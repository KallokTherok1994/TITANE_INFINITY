## 2026-04-24 : Migration documentaire

- Centralisation de tous les fichiers `.md.md` et anciens index dans `docs/99_ARCHIVE/`
- Harmonisation des dossiers d’archive et audits
- README.md = surface documentaire canonique
- Inventaires et logs : `docs/92_maintenance/`
# RELEASE SURFACE INVENTORY — TITANE∞ (Current canonical: v31.2.39 — Historical baseline preserved below)

## Release v31.2.39 — 2026-04-29 (BUILD ALL — Phase 43 KB pharmacologie+gastro + agents knowledge_manager+research_enricher)

| Surface | Truth | Status |
|---|---|---|
| `package.json` version | 31.2.39 | ✅ PASS |
| `src-tauri/Cargo.toml` version | 31.2.39 | ✅ PASS |
| `src-tauri/tauri.conf.json` version | 31.2.39 | ✅ PASS |
| `runtime/stable/manifest.json` version | 31.2.39 | ✅ PASS |
| AppImage | titane-infinity_31.2.39_amd64.AppImage (92M) | ✅ PASS |
| DEB | titane-infinity_31.2.39_amd64.deb (23M) | ✅ PASS |
| RPM | titane-infinity-31.2.39-1.x86_64.rpm (23M) | ✅ PASS |
| deployment/latest/VERSION.txt | 31.2.39 | ✅ PASS |
| deployment/latest/MANIFEST.json | 31.2.39 | ✅ PASS |
| RELEASE_ARTIFACTS_CHECKSUMS_31.2.39.txt | sha256 3 artifacts | ✅ PASS |
| detect_recurrence | PASS 1471 entries | ✅ PASS |
| vitest | PASS 6770 tests | ✅ PASS |
| cargo_build | PASS release 12m46s | ✅ PASS |
| AutoHeal | AH-BUILD-31.2.39-2026-04-29 | ✅ PASS |
| dpkg system install | `/usr/bin/titane-infinity` 49M 2026-04-29 21:06 | ✅ PASS |
| desktop launcher | `Exec=/usr/bin/titane-infinity` + `Icon=titane-infinity` | ✅ PASS |

**Artefacts phase 43 :**
- KB `pharmacologie_clinique_avancee.json` v31.7.3 (7 sections)
- KB `gastroenterologie_hepatologie.json` v31.7.4 (7 sections)
- Agent `knowledge_manager` (src/services/knowledge_manager/)
- Agent `research_enricher` (src/services/research_enricher/)
- Lint fix: apostrophe dans research_enricher/index.ts:79

**Checksums (SHA256) :**
- AppImage: `0be3c40566cb3090b1560dccc2363de604e3534cce9231fd115f146baf1a0407`
- DEB: `c384104ed501a83312c68666098c09f1d6c4f686beb11edf7f1017ea74c03b13`
- RPM: `9c950b28f72a85f352a6676cffba144a3c8134269cbaacef2edfb6d143190c51`

---

## Release v31.2.14 — 2026-04-27 (BUILD ALL — Release complète + Tests + Governance)

| Surface | Truth | Status |
|---|---|---|
| `package.json` version | 31.2.14 | ✅ PASS |
| `src-tauri/Cargo.toml` version | 31.2.14 | ✅ PASS |
| `src-tauri/tauri.conf.json` version | 31.2.14 | ✅ PASS |
| `runtime/stable/tauri.conf.json` version | 31.2.14 | ✅ PASS |
| `tauri.base.json` version | 31.2.14 | ✅ PASS |
| Vitest | 415 fichiers PASS (5320+ tests) | ✅ PASS |
| Playwright E2E | 125+ PASS, 0 FAIL | ✅ PASS |
| Rust cargo test | PASS (handlers.rs fixes: anomaly field + ConnectInfo args) | ✅ PASS |
| Prettier format | 48 fichiers auto-fix | ✅ PASS |
| TypeScript check | 0 erreurs | ✅ PASS |
| ESLint | 0 erreurs | ✅ PASS |
| AppImage artifact | `Titan-Stable_31.2.14_amd64.AppImage` | ✅ PASS |
| DEB artifact | `Titan-Stable_31.2.14_amd64.deb` | ✅ PASS |
| Android APK | Samsung Galaxy S25 Ultra — `com.titane.infinity` | ✅ PASS |
| `deployment/latest/` | v31.2.14 MANIFEST.json + SHA256SUMS.txt + SIZES.txt | ✅ PASS |
| `RELEASE_ARTIFACTS_CHECKSUMS_31.2.14.txt` | généré | ✅ PASS |
| Mandatory gates | `detect_recurrence`, `verify_instructions`, `verify:registry`, `verify:ollama:cline` | ✅ PASS |
| AutoHeal | AH-2026-04-27-BUILD-ALL-31.2.14-0001 (full schema) | ✅ PASS |

> Release v31.2.14 : BUILD ALL complet couvrant range 31.2.9→31.2.14. Corrections test Vitest (mock hoisting TDZ), Playwright (strict mode + nextStep runtime), Rust (AnomalyDetector missing field + ConnectInfo arg count). 48 fichiers reformatés. Artefacts Linux + Android produits et déployés.



## Release v31.2.13 — 2026-04-27 (DX Optimization + Champion Runtime Validation + Scripts Archive)

| Surface | Truth | Status |
|---|---|---|
| `package.json` version | 31.2.13 | ✅ PASS |
| `src-tauri/Cargo.toml` version | 31.2.13 | ✅ PASS |
| `src-tauri/tauri.conf.json` version | 31.2.13 | ✅ PASS |
| `src/services/ai/championChallenger.ts` | `validateChampionAvailability()` — validation proactive champion vs Ollama `/api/tags` au démarrage | ✅ PASS |
| `scripts/ollama/install-models.sh` | Champion `gemma2:2b` promu modèle principal (alignement doctrine) | ✅ PASS |
| `scripts/ollama/install-models-auto.sh` | Champion `gemma2:2b` promu modèle principal | ✅ PASS |
| `scripts/ollama/quick-install.sh` | Modèle canonique aligné sur `gemma2:2b` | ✅ PASS |
| `package.json` scripts DX | `dev:quick-check`, `dev:proof-quick`, `dev:gates-fast` ajoutés | ✅ PASS |
| `scripts/archive/` | Scripts obsolètes v24/v26 archivés (non supprimés) | ✅ PASS |
| `src-tauri/Cargo.toml` description | Mise à jour vers v31.2.13 Multi-Agent + Remote Gateway | ✅ PASS |
| Mandatory gates | `detect_recurrence`, `verify_instructions`, `verify:registry` | ✅ PASS |
| `tests/unit/services/ai/championChallengerValidation.test.ts` | 5 tests validation champion runtime | ✅ PASS |

> Cette release 31.2.13 est la release de gouvernance DX : validation runtime champion Ollama, alignement modèle canonique dans les scripts, archivage scripts obsolètes, raccourcis DX, et correction drift description Cargo.toml. Aucun bump de version binaire — governance-only release.

## Release v31.2.7 — 2026-04-27 (Build prod + release locale + serveur réseau)

| Surface | Truth | Status |
|---|---|---|
| `package.json` version | 31.2.7 | ✅ PASS |
| `src-tauri/Cargo.toml` version | 31.2.7 | ✅ PASS |
| `src-tauri/tauri.conf.json` version | 31.2.7 | ✅ PASS |
| `src/components/sections/ConversationSection.tsx` | Mode store brut normalisé via `validateModeId` avant résumé runtime et badges | ✅ PASS |
| `pnpm run check` | TypeScript repasse à 0 erreur après le correctif local | ✅ PASS |
| `src-tauri/target/release/bundle/appimage/Titan-Stable_31.2.7_amd64.AppImage` | Built locally (94484984 bytes) | ✅ PASS |
| `src-tauri/target/release/bundle/deb/Titan-Stable_31.2.7_amd64.deb` | Built locally (21797182 bytes) | ✅ PASS |
| `src-tauri/target/release/titane-infinity` | Built locally (SHA256: 272b66159ec37a1e68afb3444f3768c75237bd64bf0aef8b2f668e1b118884ec) | ✅ PASS |
| `deployment/latest/MANIFEST.json` | Published to 31.2.7 desktop truth | ✅ PASS |
| `deployment/latest/SHA256SUMS.txt` | Published to 31.2.7 desktop truth | ✅ PASS |
| `deployment/latest/SIZES.txt` | Published to 31.2.7 desktop truth | ✅ PASS |
| `deployment/latest/Titan-Stable_31.2.7_amd64.AppImage` | Published to 31.2.7 desktop truth | ✅ PASS |
| `deployment/latest/Titan-Stable_31.2.7_amd64.deb` | Published to 31.2.7 desktop truth | ✅ PASS |
| `deployment/latest/titane-infinity` | Published to 31.2.7 desktop truth | ✅ PASS |
| `scripts/post-build/update-desktop-icons.sh` | Launcher local et caches utilisateur synchronisés; sync système et binaire installés requièrent sudo non interactif | ✅ PASS / ⏳ BLOCKED_SUDO |
| `scripts/android/vite-network-server.sh` | Serveur canonique prêt sur `http://127.0.0.1:1420` et exposé en réseau | ✅ PASS |
| Mandatory gates (`detect_recurrence`, `verify_instructions`, `verify:registry`) | All PASS post-fix | ✅ PASS |

> Cette release locale 31.2.7 est scellée pour la vérité desktop publiée et pour l autorité réseau canonique. La synchronisation hôte `/usr/bin/titane-infinity` et `/usr/share/applications/titane-infinity.desktop` reste honnêtement `BLOCKED_SUDO_REQUIRED` car le post-build non interactif ne peut pas pousser les surfaces système sans sudo.

## Release v31.1.4 — 2026-04-24 (BUILD ALL: Format + Governance + Linux Launcher)

| Surface | Truth | Status |
|---|---|---|
| `package.json` version | 31.1.4 | ✅ PASS |
| `src-tauri/Cargo.toml` version | 31.1.4 | ✅ PASS |
| `src-tauri/tauri.conf.json` version | 31.1.4 | ✅ PASS |
| Format corrections (19 files) | prettier auto-corrected ARCHITECTURE.md, UI_SURFACE_MAP.md, performance-analysis.md, security/*.ts, stores/*.ts, e2e/*.js, SPRINT_*.files | ✅ PASS |
| Build pipeline | lint (660 non-blocking), format, typecheck, vite, tauri, post-build | ✅ PASS |
| `src-tauri/target/release/bundle/deb/Titan-Stable_31.1.3_amd64.deb` | Built locally (21M) | ✅ PASS |
| `src-tauri/target/release/bundle/appimage/Titan-Stable_31.1.3_amd64.AppImage` | Built locally (90M) | ✅ PASS |
| `src-tauri/target/release/bundle/rpm/` | Built locally | ✅ PASS |
| `src-tauri/target/release/titane-infinity` binary | SHA256: 3fb5ba875935b899bf01799fd40fc6875855c331798f23febc2708e85bba5c38 | ✅ PASS |
| `~/.local/share/applications/titane-infinity.desktop` | Canonical user-local launcher with Exec=/usr/bin/titane-infinity, Icon=titane-infinity, Actions=Logs,Config | ✅ PASS |
| Playwright E2E | 98 PASS, 6 FAIL (CSP+profile constraints, not regressions), 4 SKIP | ✅ DOCUMENTED |
| Mandatory gates (detect_recurrence, verify_instructions, verify_agents_index, verify_prompt_files_index) | All PASS | ✅ PASS |
| Registry entries | ui-events.jsonl + autoheal_rules.jsonl appended with full metadata | ✅ PASS |
| Cartography | docs/CARTOGRAPHY_COMPLETE.md Phase A-D narrative | ✅ PASS |
| System launcher sync | BLOCKED_SUDO_REQUIRED (user-local ✅, system requires sudo) | ⏳ BLOCKED_SUDO |

## Addendum — 2026-04-24 — Release Auth Compile Guard Truth

| Surface | Truth | Status |
|---|---|---|
| `src-tauri/src/auth/dev_token.rs` | Dev-token generation remains debug-only; release builds return explicit disabled/false no-op stubs | PASS |
| `src-tauri/src/main.rs` | `DEFAULT_ENCRYPTION_KEY` is exactly 32 bytes for `SecurityManager::new` | PASS |
| `cargo check --manifest-path src-tauri/Cargo.toml` | Auth/dev-token command surface compiles after guarded release stubs | PASS |

## Addendum — 2026-04-24 — Post-build Launcher Noninteractive Sudo Truth

| Surface | Truth | Status |
|---|---|---|
| `scripts/post-build/update-desktop-icons.sh` | No longer exits fatally when only host-wide binary/launcher sync needs interactive sudo | PASS |
| `~/.local/share/applications/titane-infinity.desktop` | Regenerated through `scripts/update-desktop-icon.sh` during post-build | PASS |
| User icon/cache refresh | `update-desktop-database`, `gtk-update-icon-cache`, `xdg-desktop-menu forceupdate` are attempted without root and tolerated when unavailable | PASS |
| `/usr/bin/titane-infinity` | Copy remains blocked without noninteractive/root sudo | BLOCKED_SUDO_REQUIRED |
| `/usr/share/applications/titane-infinity.desktop` | System launcher replication remains blocked without noninteractive/root sudo | BLOCKED_SUDO_REQUIRED |
| `/usr/share/icons/hicolor/*/apps/titane-infinity.png` | System icon replication remains blocked without noninteractive/root sudo | BLOCKED_SUDO_REQUIRED |

> The canonical post-build script now returns exit 0 after completing user-scoped launcher/icon/cache refresh and prints explicit `sync système=BLOCKED_SUDO_REQUIRED, sync binaire=BLOCKED_SUDO_REQUIRED` when host-wide sync cannot run. This closes the false fatal error in noninteractive build sessions while preserving the missing system proof honestly.

## Addendum — 2026-04-23 — v31.1.2 Governance Seal

| Surface | Détail | Status |
|---|---|---|
| Version source | `package.json`, `Cargo.toml`, `tauri.conf.json`, manifests | PASS — 31.1.2 |
| `deployment/latest/` | MANIFEST.json + SHA256SUMS.txt + SIZES.txt | PASS |
| Rust unused imports | `src-tauri/src/doc_engine/commands.rs` | FIXED — 0 warnings |
| PerformanceTest.tsx | TODO supprimé, imports propres | FIXED |
| PerformanceTest tests | 5 tests Vitest (data-testid stables) | PASS |
| DocCenterPage tests | 12 tests Vitest | PASS |
| verify_instructions.sh | 33/33 PASS | PASS |
| detect_recurrence.sh | PASS (1244 entrées) | PASS |
| README.md | Authority mise à jour v31.1.2 | PASS |

| Surface | Fichier | Status |
|---|---|---|
| Backend `export_docx_file` IPC | `src-tauri/src/doc_engine/commands.rs` | PASS — 3/3 Rust tests |
| Frontend `/doc-center` UI | `src/pages/DocCenterPage.tsx` | PASS — 12/12 Vitest tests |
| E2E Playwright | `e2e/doc-center-export-docx.spec.ts` | READY |
| E2E WDIO desktop | `e2e/desktop/doc-center-export-docx.wdio.test.js` | READY |
| Contrat IPC | `tests/contract/tauri-ipc-contract.test.ts` | PASS |
| TypeScript check | `pnpm run check` | PASS — 0 erreurs |
| AutoHeal | `scripts/autoheal/autoheal_rules.jsonl` | AH-0001/0002/0003 ajoutés |
| Governance | `UI_SURFACE_MAP.md`, `ARCHITECTURE.md`, `CARTOGRAPHY_COMPLETE.md` | PASS |

## Addendum — 2026-04-19 — Linux System Launcher User-Home Truth

| Surface | Truth | Status |
|---|---|---|
| `/usr/share/applications/titane-infinity.desktop` | Version and icon are synchronized to v31.0.3, but the existing `Logs` / `Config` actions were generated once under `/root/.titane` before the sudo-home fix landed | BLOCKED_SUDO_RERUN_REQUIRED |
| `scripts/update-desktop-icon.sh` | Now resolves the real target user home from `SUDO_USER` before generating launcher actions | PASS |
| `tests/unit/scripts/updateDesktopIconScripts.test.ts` | Locks sudo-home preservation in the launcher generator | PASS |

> This addendum records the follow-up fix after the first successful system icon sync. The host-wide launcher needs one more sudo rerun of the canonical post-build script so the already-updated v31.0.3 entry regenerates `Logs` and `Config` against the real user home instead of `/root/.titane`.

## Addendum — 2026-04-19 — Linux Menu And Dock Icon Refresh Truth

| Surface | Truth | Status |
|---|---|---|
| `~/.local/share/applications/titane-infinity.desktop` | Refreshed with `Name=TITANE∞ v31.0.3`, `Exec=/usr/bin/titane-infinity`, `Icon=titane-infinity` | PASS |
| `~/.local/share/icons/hicolor/128x128/apps/titane-infinity.png` | Refreshed from repo canonical icon set | PASS |
| `~/.local/share/icons/hicolor/256x256/apps/titane-infinity.png` | Refreshed from repo canonical icon set | PASS |
| `~/.local/share/icons/hicolor/512x512/apps/titane-infinity.png` | Refreshed from repo canonical icon set | PASS |
| `/usr/share/applications/titane-infinity.desktop` | System refresh still requires interactive sudo | BLOCKED_SUDO_REQUIRED |
| `/usr/share/icons/hicolor/*/apps/titane-infinity.png` | System multi-resolution refresh still requires interactive sudo | BLOCKED_SUDO_REQUIRED |

> This addendum seals the local Linux menu/dock icon refresh truth for the current session. The user-scoped launcher and hicolor icon set are refreshed and cached, while host-wide launcher/icon replication remains blocked until interactive sudo is available.

## Addendum — 2026-04-19 — TITANE∞ v31.0.3 Desktop Publication Truth

Canonical target version: **31.0.3**

| Surface | Truth | Status |
|---|---|---|
| `src-tauri/target/release/bundle/appimage/TITANE Infinity_31.0.3_amd64.AppImage` | Built locally | PASS |
| `src-tauri/target/release/bundle/deb/TITANE Infinity_31.0.3_amd64.deb` | Built locally | PASS |
| `src-tauri/target/release/bundle/rpm/TITANE Infinity-31.0.3-1.x86_64.rpm` | Built locally | PASS |
| `deployment/latest/MANIFEST.json` | Published to 31.0.3 desktop truth | PASS |
| `deployment/latest/SHA256SUMS.txt` | Published to 31.0.3 desktop truth | PASS |
| `deployment/latest/CHECKSUMS.sha256` | Published to 31.0.3 desktop truth | PASS |
| `deployment/latest/CHECKSUMS.txt` | Published to 31.0.3 desktop truth | PASS |
| `deployment/latest/SIZES.txt` | Published to 31.0.3 desktop truth | PASS |
| `deployment/latest/titane-infinity` | Published to 31.0.3 desktop truth | PASS |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v31.0.3` | PASS |
| `/usr/bin/titane-infinity` | Still exposes installed 31.0.2 binary | BLOCKED_SUDO_REQUIRED |
| `/usr/share/applications/titane-infinity.desktop` | Still exposes `Name=TITANE∞ v31.0.2` | BLOCKED_SUDO_REQUIRED |
| `Android build/install lane` | No connected device or emulator in this governed session | BLOCKED |

> This addendum seals the Linux desktop publication truth for 31.0.3 while keeping the full BUILD ALL verdict blocked: the local desktop bundles and deployment/latest are real, but the host-wide installed binary and system launcher were not refreshed because system sync requires interactive sudo, and Android device truth remains unavailable.

## Addendum — 2026-04-19 — TITANE∞ v31.0.3 Source Version Surface Sync

Canonical target version: **31.0.3**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `src-tauri/Cargo.toml` | `31.0.3` | UPDATED_TO_31_0_3 |
| `src-tauri/Cargo.lock` | `31.0.3` | UPDATED_TO_31_0_3 |
| `src-tauri/tauri.conf.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `src-tauri/tauri.base.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `tauri.base.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `runtime/stable/tauri.conf.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `runtime/stable/manifest.json` | `31.0.3` | UPDATED_TO_31_0_3 |
| `RELEASE_SURFACE_INVENTORY.md` | `31.0.3` | UPDATED_TO_31_0_3 |

> This addendum records the governed Rule 13 patch bump and source-surface sync to 31.0.3. Desktop bundles now exist and deployment/latest is aligned to the same version, but BUILD ALL cannot be sealed until system launcher sync and Android device truth are proven.

## Addendum — 2026-04-18 — TITANE∞ v31.0.2 Windows MSI Release Truth

Canonical target version: **31.0.2**

| Surface | Truth | Status |
|---|---|---|
| `GitHub Actions run 24615984266` | Windows MSI fallback lane completed on `e370ff71068b4786c7e77b92dee6e9f64d957313` | PASS |
| `GitHub release v31.0.2` | Published | PASS |
| `TITANE.Infinity_31.0.2_x64_en-US.msi` | Uploaded to release | PASS |
| `SHA256SUMS.txt` | Uploaded to release | PASS |

> This addendum seals the Windows remote MSI publication truth for 31.0.2. Android build/install proof remains outside the current PASS scope and is still required before BUILD ALL can be sealed.

## Addendum — 2026-04-18 — TITANE∞ v31.0.2 Desktop Publication Truth

Canonical target version: **31.0.2**

| Surface | Truth | Status |
|---|---|---|
| `src-tauri/target/release/bundle/appimage/TITANE Infinity_31.0.2_amd64.AppImage` | Built locally | PASS |
| `src-tauri/target/release/bundle/deb/TITANE Infinity_31.0.2_amd64.deb` | Built locally | PASS |
| `src-tauri/target/release/bundle/rpm/TITANE Infinity-31.0.2-1.x86_64.rpm` | Built locally | PASS |
| `deployment/latest/MANIFEST.json` | Published to 31.0.2 desktop truth | PASS |
| `deployment/latest/SHA256SUMS.txt` | Published to 31.0.2 desktop truth | PASS |
| `deployment/latest/SIZES.txt` | Published to 31.0.2 desktop truth | PASS |
| `/usr/bin/titane-infinity` | Synchronized with local 31.0.2 build | PASS |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v31.0.2` | PASS |
| `/usr/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v31.0.2` | PASS |

> This addendum seals the Linux desktop publication truth for 31.0.2 only. Android build/install proof and Windows MSI proof are not claimed by this addendum and remain outside the current desktop-only PASS scope.

## Addendum — 2026-04-18 — TITANE∞ v31.0.2 Source Version Surface Sync

Canonical target version: **31.0.2**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `src-tauri/Cargo.toml` | `31.0.2` | UPDATED_TO_31_0_2 |
| `src-tauri/Cargo.lock` | `31.0.2` | UPDATED_TO_31_0_2 |
| `src-tauri/tauri.conf.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `src-tauri/tauri.base.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `tauri.base.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `runtime/stable/tauri.conf.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `runtime/stable/manifest.json` | `31.0.2` | UPDATED_TO_31_0_2 |
| `RELEASE_SURFACE_INVENTORY.md` | `31.0.2` | UPDATED_TO_31_0_2 |

> This addendum records the governed Rule 13 patch bump and source-surface sync to 31.0.2. No packaged artifact, deployment/latest publication, launcher sync, or installed-host truth is claimed until the current BUILD ALL execution produces executable proof.

## Addendum — 2026-04-18 — TITANE∞ v31.0.1 Source Version Surface Sync

Canonical target version: **31.0.1**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `src-tauri/Cargo.toml` | `31.0.1` | UPDATED_TO_31_0_1 |
| `src-tauri/Cargo.lock` | `31.0.1` | PENDING_BUILD_SYNC |
| `src-tauri/tauri.conf.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `src-tauri/tauri.base.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `tauri.base.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `runtime/stable/tauri.conf.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `runtime/stable/manifest.json` | `31.0.1` | UPDATED_TO_31_0_1 |
| `RELEASE_SURFACE_INVENTORY.md` | `31.0.1` | UPDATED_TO_31_0_1 |

> This addendum reopens source-version sync so the embedded conversation proof can be rebuilt against the current chat/journal fixes instead of a stale release binary. No packaged artifact, launcher, or installed-host truth is claimed until the governed rebuild and rerun complete.

## Addendum — 2026-04-17 — TITANE∞ v30.1.34 Packaged Runtime Qualification

Canonical target version: **30.1.34**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `30.1.34` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.1.34` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.1.34` | KEEP_AS_CANON |
| `src-tauri/tauri.base.json` | `30.1.34` | KEEP_AS_CANON |
| `tauri.base.json` | `30.1.34` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `30.1.34` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.1.34` | KEEP_AS_CANON |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.34.txt` | `30.1.34` | ADDED_AS_PROOF |
| `deployment/latest/MANIFEST.json` | `30.1.34` | UPDATED_TO_30_1_34 |
| `deployment/latest/CHECKSUMS.sha256` | `30.1.34` | UPDATED_TO_30_1_34 |
| `deployment/latest/CHECKSUMS.txt` | `30.1.34` | UPDATED_TO_30_1_34 |
| `deployment/latest/SHA256SUMS.txt` | `30.1.34` | UPDATED_TO_30_1_34 |
| `deployment/latest/SIZES.txt` | `30.1.34` | UPDATED_TO_30_1_34 |
| `/usr/bin/titane-infinity` | `30.1.34` | HOST_SYNC_VERIFIED |
| `~/.local/share/applications/titane-infinity.desktop` | `30.1.34` | HOST_SYNC_VERIFIED |
| `/usr/share/applications/titane-infinity.desktop` | `30.1.34` | HOST_SYNC_VERIFIED |

### Artifact Status Summary — v30.1.34

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.34_amd64.AppImage` | `92957176` bytes | `c1988796092df2193732e86afbe5fbe357f523637ef04951574b7fb8d06ecdba` | QUALIFIED_BUILD |
| `TITANE Infinity_30.1.34_amd64.deb` | `20177926` bytes | `b82e416a7ac642ec973640cf9629088d8fe873cfa55cc2a62439689793894559` | INSTALLED_AND_QUALIFIED |
| `TITANE Infinity-30.1.34-1.x86_64.rpm` | `20178719` bytes | `f6a6d824068b505250b89138410bc2a09f30c054d80a9149d766e665cee0917c` | CHECKSUM_VERIFIED |
| `titane-infinity` | `45287240` bytes | `ed4bd1b40cdac7289c20a41d05710f91eb487968ba63b30051eb3b23dfcc9674` | INSTALLED_BINARY_MATCHED |

> The 30.1.34 desktop packaging lane is now fully aligned: the installed DEB exposes the governed security audit bridge on `/usr/bin/titane-infinity`, both launchers point to the canonical installed binary, and the installed/runtime WDIO proof writes the federated journal plus signed export into AppData without falling back to the workspace debug binary.

## Addendum — 2026-04-17 — TITANE∞ v30.1.33 Packaged Runtime Qualification

Canonical target version: **30.1.33**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `30.1.33` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.1.33` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.1.33` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.1.33` | KEEP_AS_CANON |
| `titane-infinity.desktop` | `30.1.33` | UPDATED_TO_30_1_33 |
| `deployment/latest/MANIFEST.json` | `30.1.33` | UPDATED_TO_30_1_33 |
| `deployment/latest/CHECKSUMS.sha256` | `30.1.33` | UPDATED_TO_30_1_33 |
| `deployment/latest/SHA256SUMS.txt` | `30.1.33` | UPDATED_TO_30_1_33 |
| `deployment/latest/SIZES.txt` | `30.1.33` | UPDATED_TO_30_1_33 |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.33.txt` | `30.1.33` | ADDED_AS_PROOF |
| `/usr/bin/titane-infinity` | `30.1.33` | HOST_SYNC_VERIFIED |
| `~/.local/share/applications/titane-infinity.desktop` | `30.1.33` | HOST_SYNC_PENDING_RECHECK |
| `/usr/share/applications/titane-infinity.desktop` | `30.1.33` | HOST_SYNC_PENDING_RECHECK |

### Artifact Status Summary — v30.1.33

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.33_amd64.AppImage` | `92871160` bytes | `331dd0b81d7ca6585e4530350a89eba60ca61d4f499beca7e1fda53a1ca77650` | QUALIFIED_BOOT |
| `TITANE Infinity_30.1.33_amd64.deb` | `20055506` bytes | `e68cab034a26932ac56e8bc53e8be7308f3d3685aa7e313d61c2caccbfbf59aa` | INSTALLED |
| `TITANE Infinity-30.1.33-1.x86_64.rpm` | `20056546` bytes | `aa0ec13e202f001db90186ce0c244006730fde86c0671e72a76049f931019403` | CHECKSUM_VERIFIED |
| `titane-infinity` | `45081952` bytes | `858c49bca7807ff4dcecef616ce7f07e422198be453720c1258ebe90128286d0` | INSTALLED_BINARY |

> The packaged AppImage and the installed DEB both reach `Main window shown successfully` and `BOOT:READY` on the 30.1.33 lane. The remaining risk before this addendum was metadata drift: stale published manifest/checksums and a stale launcher source at `v30.1.26`.

## Addendum — 2026-04-16 — TITANE∞ v30.1.31 Local Production Desktop Build

Canonical target version: **30.1.31**

| File / Surface | Version | Status |
|---|---|---|
| `package.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `src-tauri/Cargo.toml` | `30.1.31` | UPDATED_TO_30_1_31 |
| `src-tauri/tauri.conf.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `src-tauri/tauri.base.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `tauri.base.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `runtime/stable/tauri.conf.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `runtime/stable/manifest.json` | `30.1.31` | UPDATED_TO_30_1_31 |
| `RELEASE_ARTIFACTS_CHECKSUMS.txt` | `30.1.31` | UPDATED_TO_CURRENT_BUILD |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.31.txt` | `30.1.31` | ADDED_AS_PROOF |
| `RELEASE_v30.1.31.md` | `30.1.31` | ADDED_AS_PROOF |
| `~/.local/share/applications/titane-infinity.desktop` | `30.1.30` | HOST_SYNC_BLOCKED |
| `/usr/share/applications/titane-infinity.desktop` | `30.1.30` | HOST_SYNC_BLOCKED |
| `/usr/bin/titane-infinity` | `30.1.30` | HOST_SYNC_BLOCKED |

### Artifact Status Summary — v30.1.31

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.31_amd64.AppImage` | `92871160` bytes | `ace698eebb8b359e27fa2d8026023bf7215e34d694523f23da53576a90620145` | BUILT |
| `TITANE Infinity_30.1.31_amd64.deb` | `20055246` bytes | `e8e08cee9233a0f52adeaba380f18e3d05af598b3bc5b4212eb037b38d479d26` | BUILT |
| `TITANE Infinity-30.1.31-1.x86_64.rpm` | `20055993` bytes | `04909df258c1380fad190fdeed56c6d774a11914ad2b9c330506cf901c53898c` | BUILT |
| `titane-infinity` | `45078400` bytes | `e40316585f332503bf77f7992d91b8d1d33127a26a378951ad3cfdc88b03e286` | BUILT |

> The local production desktop build succeeded on 2026-04-16, but the canonical Linux host-sync step remains blocked by interactive `sudo`, so the installed binary and launchers still expose `30.1.30`.

Generated: 2026-04-14
Session: REPO_OFFICIALIZATION_28_5_0
Historical baseline version: **28.5.0**

---

## ROOT

| File | Version found | Action |
|---|---|---|
| `package.json` | `28.5.0` | KEEP_AS_CANON |
| `README.md` | `v28.5.0` | KEEP_AS_CANON |
| `CHANGELOG.md` | `28.5.0` (top entry) | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `28.5.0` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `28.5.0` | KEEP_AS_CANON |

---

## DOCS

| File | Version found | Action |
|---|---|---|
| `docs/README.md` | `v28.5.0` | KEEP_AS_CANON |
| `docs/90_release/PRODUCTION_RELEASE_v28.5.0.md` | `28.5.0` | KEEP_AS_CANON |
| `docs/90_release/PRODUCTION_RELEASE_v28.0.0.md` | `28.0.0` | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_v27.2.0_ENTRY.md` | `27.2.0` | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_v27.0.1_PRODUCTION.md` | `27.0.1` | KEEP_AS_HISTORY |
| `docs/90_release/RELEASE_NOTE_v27.2.0_POSTDEPLOY_2026-03-06.md` | `27.2.0` | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_v27.2.0_COMPLETE.md` | `27.2.0` | KEEP_AS_HISTORY |
| `docs/90_release/PRODUCTION_DEPLOYMENT_v27.2.0_SEALED.md` | `27.2.0` | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_COMPLETE_EXECUTIVE_SUMMARY_v27.0.1.md` | `27.0.1` | KEEP_AS_HISTORY |
| `docs/90_release/PRODUCTION_DEPLOYMENT_v27.0.1_FINAL.md` | `27.0.1` | KEEP_AS_HISTORY |
| `docs/90_release/PRODUCTION_SEAL_v27.4.1.md` | `27.4.1` | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_v26.2.0.md` | `26.2.0` | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_EXECUTION_REPORT_v26.3.0.md` | `26.3.0` | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_FINAL_REPORT_v26.3.0.md` | `26.3.0` | KEEP_AS_HISTORY |
| `docs/90_release/PRODUCTION_HANDOFF_v26.3.0.md` | `26.3.0` | KEEP_AS_HISTORY |
| `docs/90_release/CHANGELOG_V4.md` through `CHANGELOG_V19.md` | historical | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_SUCCESS_v35.0.0.md` | `35.0.0` (historical fantasy) | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_SUCCESS_v36.0.0.md` | `36.0.0` (historical fantasy) | KEEP_AS_HISTORY |
| `docs/90_release/DEPLOYMENT_LOG_v37.0.0.md` | `37.0.0` (historical fantasy) | KEEP_AS_HISTORY |

---

## DEPLOYMENT

| File | Version found | Action |
|---|---|---|
| `deployment/latest/MANIFEST.json` | `28.0.0` → `28.5.0` | UPDATE_TO_28_5_0 (done) |
| `deployment/latest/SHA256SUMS.txt` | `28.0.0` → pending | UPDATE_TO_28_5_0 (done) |
| `deployment/latest/CHECKSUMS.sha256` | `28.0.0` → pending | UPDATE_TO_28_5_0 (done) |
| `deployment/latest/MANIFEST_v28.0.0.json` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0.txt` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0_2026-03-20.txt` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0_omega-icons.txt` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v28.0.0_providers_fix.txt` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/SHA256SUMS_v27.*.txt` | `27.x` | KEEP_AS_HISTORY |
| `deployment/latest/MANIFEST_v27.*.json` | `27.x` | KEEP_AS_HISTORY |
| `deployment/latest/TITANE-Infinity_27.2.0_amd64.*` | `27.2.0` | KEEP_AS_HISTORY |
| `deployment/latest/TITANE-Infinity_28.0.0_amd64.*` | `28.0.0` | KEEP_AS_HISTORY |
| `deployment/latest/certification/` | multi-version | KEEP_AS_HISTORY |

---

## GITHUB / AUTOMATION

| File | Version found | Action |
|---|---|---|
| `.github/workflows/ci.yml` | N/A (no hardcoded version) | KEEP_AS_CANON |
| `.github/workflows/rust.yml` | N/A | KEEP_AS_CANON |
| `scripts/autoheal/autoheal_rules.jsonl` | AH entries up to v28.5.0 | KEEP_AS_CANON |

---

## Artifact Status Summary

| Artifact | v28.0.0 | v28.5.0 |
|---|---|---|
| `TITANE-Infinity_*.amd64.AppImage` | ✅ Built + checksummed | ⏳ Pending build |
| `TITANE-Infinity_*.amd64.deb` | ✅ Built + checksummed | ⏳ Pending build |
| `Titan-Stable_*.amd64.AppImage` | ✅ Built + checksummed | ⏳ Pending build |
| `Titan-Stable_*.amd64.deb` | ✅ Built + checksummed | ⏳ Pending build |

> Binary artifacts for v28.5.0 are pending build and gate completion.

---

## Addendum — 2026-04-05 — TITANE∞ v29.0.0 Major Release Refresh

Session: `PROD_RELEASE_29_0_0`
Canonical target version: **29.0.0**

### Updated Current Surfaces

| File / Surface | Version found | Action |
|---|---|---|
| `package.json` | `29.0.0` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `29.0.0` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `29.0.0` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `29.0.0` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `29.0.0` | KEEP_AS_CANON |
| `README.md` / `docs/README.md` | `v29.0.0` | KEEP_AS_CANON |
| `deployment/latest/MANIFEST.json` | `29.0.0` | UPDATED_TO_29_0_0 |
| `deployment/latest/CHECKSUMS.sha256` / `CHECKSUMS.txt` / `SHA256SUMS.txt` | `29.0.0` hashes | UPDATED_TO_29_0_0 |
| `deployment/latest/SIZES.txt` | `29.0.0` sizes | UPDATED_TO_29_0_0 |
| `RELEASE_ARTIFACTS_CHECKSUMS_29.0.0.txt` | `29.0.0` | ADDED_AS_PROOF |

### Artifact Status Summary — v29.0.0

| Artifact | Status |
|---|---|
| `Titan-Stable_29.0.0_amd64.AppImage` | ✅ Built + deployed + checksummed |
| `Titan-Stable_29.0.0_amd64.deb` | ✅ Built + deployed + checksummed |
| `TITANE-Infinity_29.0.0_amd64.deb` | ✅ Built + checksummed |
| `TITANE-Infinity-29.0.0-1.x86_64.rpm` | ✅ Built + checksummed |

> v29.0.0 is the active canonical release stream for repository + deployment metadata as of 2026-04-05.
> Current stable deployment truth remains `AppImage + DEB`; any additional DEB/RPM checksum rows are retained as secondary build-output proof, not as a second active deployment matrix.
> No artifact checksums can be claimed for v28.5.0 without actual build proof.

---

## Addendum — 2026-04-06 — TITANE∞ v30.0.0 Major Release

Session: `PROD_RELEASE_30_0_0`
Canonical target version: **30.0.0**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.0.0` | UPDATED_TO_30_0_0 |
| `src-tauri/Cargo.toml` | `30.0.0` | UPDATED_TO_30_0_0 |
| `src-tauri/tauri.conf.json` | `30.0.0` | UPDATED_TO_30_0_0 |
| `runtime/stable/tauri.conf.json` | `30.0.0` | UPDATED_TO_30_0_0 |
| `runtime/stable/manifest.json` | `30.0.0` | UPDATED_TO_30_0_0 |
| `README.md` / `docs/README.md` | `v30.0.0` | UPDATED_TO_30_0_0 |
| `deployment/latest/MANIFEST.json` | `30.0.0` | UPDATED_TO_30_0_0 |
| `deployment/latest/CHECKSUMS.txt` / `SHA256SUMS.txt` | `30.0.0` artifact names | UPDATED_TO_30_0_0 |
| `deployment/latest/SIZES.txt` | `30.0.0` artifact names | UPDATED_TO_30_0_0 |
## Addendum — 2026-04-06 — TITANE∞ v30.0.0 Major Release Upgrade Cycle

Canonical target version: **30.0.0**

| File | Version | Status |
|---|---|---|
| `package.json` | `30.0.0` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.0.0` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.0.0` | KEEP_AS_CANON |
| `tauri.base.json` | `30.0.0` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `30.0.0` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.0.0` | KEEP_AS_CANON |
| `README.md` / `docs/README.md` | `v30.0.0` | KEEP_AS_CANON |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.0.0.txt` | `30.0.0` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.0.0

| Artifact | Status |
|---|---|
| `Titan-Stable_30.0.0_amd64.AppImage` | ⏳ PENDING_BUILD |
| `Titan-Stable_30.0.0_amd64.deb` | ⏳ PENDING_BUILD |

> v30.0.0 is the active canonical release stream for repository + deployment metadata as of 2026-04-06.
> Production builds are executed on user request or via BUILD ALL command (Rule 11/14).
> v30.0.0 is the active canonical release stream as of 2026-04-06. Artifacts pending build.

---

## ADDENDUM v30.1.7 — 2025-04-13

### Version Files Updated

| File | Version | Action |
|---|---|---|
| `package.json` | `30.1.7` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.1.7` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.1.7` | KEEP_AS_CANON |
| `tauri.base.json` | `30.1.7` | KEEP_AS_CANON |
| `src-tauri/tauri.base.json` | `30.1.7` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `30.1.7` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.1.7` | KEEP_AS_CANON |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.7.txt` | `30.1.7` | ADDED_AS_PROOF |
| `RELEASE_v30.1.7.md` | `30.1.7` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.1.7

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE-Infinity_30.1.7_amd64.AppImage` | 95M | `d9e10549fb1d6853cdbf60f846f57e10d33d55b5959a146a6166530057f6bc6a` | BUILT ✅ |
| `TITANE-Infinity_30.1.7_amd64.deb` | 26M | `6624179eb8fa0880ae0f74faf35b4d42cddd5683e73cb3fd6d5ef9d3b1d2d0d9` | BUILT ✅ INSTALLED ✅ |
| `TITANE-Infinity-30.1.7-1.x86_64.rpm` | 26M | `cbc4379317ff4ca871517c30839cf5a165320608ef6492fe62c6796b762dc2e8` | BUILT ✅ |
| Android APK (universal) | 59M | `60529efe6b4f26bbcded4843d1a11bbc587b374b20adc512904311d119c3906e` | BUILT ✅ |
| Android AAB (universalRelease) | 38M | `c9f108a12aed344686c56588479a5c89148d6e9699d8e01ab48b21140e0cd3e3` | BUILT ✅ |

> v30.1.7 is the active canonical production release as of 2025-04-13.
> Built via BUILD ALL sequence (Rule 14). DEB installed on host system.

---

## RELEASE v30.1.8 — Addendum (2026-04-13)

| Artifact | Path | SHA256 |
|---|---|---|
| DEB | `src-tauri/target/release/bundle/deb/TITANE-Infinity_30.1.8_amd64.deb` | `faf8ea7b8e1b359ddc3c30c78caca585bfd7f7897aa346ffcf2ae591ec8a4fd8` |
| RPM | `src-tauri/target/release/bundle/rpm/TITANE-Infinity-30.1.8-1.x86_64.rpm` | `46dd89f39a7ed2c89d6e8cfae47d9ff60bbdd6b9aafe99f2be9eef7ec8f3d1fc` |
| AppImage | `src-tauri/target/release/bundle/appimage/TITANE-Infinity_30.1.8_amd64.AppImage` | `cc5d6600c5b374c9118ccf4da655b94370662cbbdbc2cf9a4a1043d4dd5bc4b2` |
| APK (unsigned) | `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk` | `dbb45dee12df7deee5a7b36a175a68e295b20a2aac188b4f467f0c705f6bdf0c` |
| AAB | `src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab` | `ba2becbbfabc75c60ceb3523d34804fe38bd0aa7924f1875aa6da224165865af` |

| File | Version | Action |
|---|---|---|
| `package.json` | `30.1.8` | CURRENT |
| `src-tauri/Cargo.toml` | `30.1.8` | CURRENT |
| `src-tauri/tauri.conf.json` | `30.1.8` | CURRENT |
| `RELEASE_v30.1.8.md` | `30.1.8` | CURRENT |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.8.txt` | `30.1.8` | CURRENT |
| `RELEASE_v30.1.8_SEALED.txt` | `30.1.8` | CURRENT |

---

## Addendum — 2026-04-15 — Local Desktop Build + Host Install v30.1.24

Session: `LOCAL_DESKTOP_INSTALL_30_1_24`
Canonical target version: **30.1.24**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| `src-tauri/Cargo.toml` | `30.1.24` | UPDATED_TO_30_1_24 |
| `src-tauri/tauri.conf.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| `src-tauri/tauri.base.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| `tauri.base.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| `runtime/stable/tauri.conf.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| `runtime/stable/manifest.json` | `30.1.24` | UPDATED_TO_30_1_24 |
| Host package `titane-infinity` | `30.1.24` | INSTALLED_ON_HOST |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.24` | VERIFIED |
| `/usr/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.24` | VERIFIED |

### Artifact Status Summary — v30.1.24

| Artifact | Status |
|---|---|
| `TITANE Infinity_30.1.24_amd64.deb` | BUILT ✅ INSTALLED ✅ |
| `TITANE Infinity_30.1.24_amd64.AppImage` | BUILT ✅ |
| `TITANE Infinity-30.1.24-1.x86_64.rpm` | BUILT ✅ |
| `/usr/bin/titane-infinity` | MATCHES_LOCAL_BUILD ✅ |

> v30.1.24 is installed on the local Linux host as of 2026-04-15.
> This addendum records local build/install truth only; deployment/latest publication surfaces were not updated in this session.

Key change: feat(ui) — Zoom + / Zoom − buttons in TopNav top-right

---

## ADDENDUM v30.1.22 — 2026-04-15

### Version Files Updated

| File | Version | Action |
|---|---|---|
| `package.json` | `30.1.22` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.1.22` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.1.22` | KEEP_AS_CANON |
| `tauri.base.json` | `30.1.22` | KEEP_AS_CANON |
| `src-tauri/tauri.base.json` | `30.1.22` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `30.1.22` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.1.22` | KEEP_AS_CANON |
| `deployment/latest/MANIFEST.json` | `30.1.22` | UPDATED_TO_30_1_22 |
| `deployment/latest/CHECKSUMS.txt` | `30.1.22` | UPDATED_TO_30_1_22 |
| `deployment/latest/CHECKSUMS.sha256` | `30.1.22` | UPDATED_TO_30_1_22 |
| `deployment/latest/SHA256SUMS.txt` | `30.1.22` | UPDATED_TO_30_1_22 |
| `deployment/latest/SIZES.txt` | `30.1.22` | UPDATED_TO_30_1_22 |
| `RELEASE_ARTIFACTS_CHECKSUMS.txt` | `30.1.22` | UPDATED_TO_30_1_22 |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.22.txt` | `30.1.22` | ADDED_AS_PROOF |
| `RELEASE_v30.1.22.md` | `30.1.22` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.1.22

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.22_amd64.AppImage` | 89M | `5993ee382d3a0326b9f902b08b5b36dbf53ec053cb5b095c86fcee9306ad3a4c` | BUILT ✅ DEPLOYED ✅ |
| `TITANE Infinity_30.1.22_amd64.deb` | 20M | `d1c074bfa70d369176e83a4e2e9aad5ba750f402489100d8ed4f61a0dc1def34` | BUILT ✅ INSTALLED ✅ |
| `TITANE Infinity-30.1.22-1.x86_64.rpm` | 20M | `469d1b3fdfd9c46487d25f61b392f6bcb70144ba655c2cc3be9f9631419fd1e3` | BUILT ✅ |
| `app-universal-release-unsigned.apk` | 67M | `ecae4c5bf2bed392157570817f31c2e097134e870f0a08b194e5aeaab242b637` | BUILT ✅ |
| `app-universal-release.aab` | 42M | `3a4ae8f07ea35d74e099c98c80c3b5cb8aa3fb737a9b0ceffcb3c3ff8774c449` | BUILT ✅ |
| Windows MSI | — | — | N/A LOCAL_LINUX_HOST |

> v30.1.22 is the active local BUILD ALL output as of 2026-04-15.
> Desktop launchers were resynchronized after install and now point consistently to `/usr/bin/titane-infinity` with Name `TITANE∞ v30.1.22`.
> Windows MSI remains available only through the on-demand GitHub workflow on a Windows runner; no local MSI build proof was generated on this Linux host.

## ADDENDUM v30.1.23 — 2026-04-15

### Version Files Updated

| File | Version | Action |
|---|---|---|
| `package.json` | `30.1.23` | KEEP_AS_CANON |
| `src-tauri/Cargo.toml` | `30.1.23` | KEEP_AS_CANON |
| `src-tauri/tauri.conf.json` | `30.1.23` | KEEP_AS_CANON |
| `tauri.base.json` | `30.1.23` | KEEP_AS_CANON |
| `src-tauri/tauri.base.json` | `30.1.23` | KEEP_AS_CANON |
| `runtime/stable/tauri.conf.json` | `30.1.23` | KEEP_AS_CANON |
| `runtime/stable/manifest.json` | `30.1.23` | KEEP_AS_CANON |
| `deployment/latest/MANIFEST.json` | `30.1.23` | UPDATED_TO_30_1_23 |
| `deployment/latest/CHECKSUMS.txt` | `30.1.23` | UPDATED_TO_30_1_23 |
| `deployment/latest/CHECKSUMS.sha256` | `30.1.23` | UPDATED_TO_30_1_23 |
| `deployment/latest/SHA256SUMS.txt` | `30.1.23` | UPDATED_TO_30_1_23 |
| `deployment/latest/SIZES.txt` | `30.1.23` | UPDATED_TO_30_1_23 |
| `RELEASE_ARTIFACTS_CHECKSUMS.txt` | `30.1.23` | UPDATED_TO_30_1_23 |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.23.txt` | `30.1.23` | ADDED_AS_PROOF |
| `RELEASE_v30.1.23.md` | `30.1.23` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.1.23

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.23_amd64.AppImage` | 89M | `11db4adbb7dacc5502451a3bfda05abeb364b1848a33e5cfef61d5323d31df06` | BUILT ✅ DEPLOYED ✅ |
| `TITANE Infinity_30.1.23_amd64.deb` | 20M | `04335c44a29718838abba211d50e3664514a6b090928b54b7d02468ffbfba875` | BUILT ✅ DEPLOYED ✅ INSTALL_BLOCKED_BY_SUDO |
| `TITANE Infinity-30.1.23-1.x86_64.rpm` | 20M | `76498a300170c3ee20ac36ee299efee400a3e05d4fe779bf0f26d8400b73fadf` | BUILT ✅ DEPLOYED ✅ |
| `app-universal-release-unsigned.apk` | 67M | `4441f6ea337c7477d34f32d15f77e85aee4fcd905500066c9ddaef12aa846cd6` | BUILT ✅ |
| `app-universal-release.aab` | 42M | `3a4ae8f07ea35d74e099c98c80c3b5cb8aa3fb737a9b0ceffcb3c3ff8774c449` | BUILT ✅ |
| Windows MSI | — | — | N/A LOCAL_LINUX_HOST |

> v30.1.23 is the active local desktop BUILD ALL output as of 2026-04-15.
> `deployment/latest` now points to the desktop 30.1.23 artifacts and binary hash.
> Host installation and system launcher synchronization remain blocked in this session because `sudo dpkg -i ...` and `scripts/post-build/update-desktop-icons.sh` require interactive sudo approval.
> Local launcher regeneration completed, but it still resolves `Exec=/usr/bin/titane-infinity`; `dpkg -s titane-infinity` proves the installed package is still `30.1.22`.

---

## Addendum — 2026-04-15 — Android Build + Windows Qualification v30.1.25

Session: `WINDOWS_ANDROID_BUILD_30_1_25`
Canonical target version: **30.1.25**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.1.25` | UPDATED_TO_30_1_25 |
| `src-tauri/Cargo.toml` | `30.1.25` | UPDATED_TO_30_1_25 |
| `src-tauri/tauri.conf.json` | `30.1.25` | UPDATED_TO_30_1_25 |
| `src-tauri/tauri.base.json` | `30.1.25` | UPDATED_TO_30_1_25 |
| `tauri.base.json` | `30.1.25` | UPDATED_TO_30_1_25 |
| `runtime/stable/tauri.conf.json` | `30.1.25` | UPDATED_TO_30_1_25 |
| `runtime/stable/manifest.json` | `30.1.25` | UPDATED_TO_30_1_25 |

### Artifact Status Summary — v30.1.25

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `app-universal-release-unsigned.apk` | `69936527` bytes | `4441f6ea337c7477d34f32d15f77e85aee4fcd905500066c9ddaef12aa846cd6` | BUILT ✅ |
| `app-universal-release.aab` | `43510592` bytes | `cfe4b132610cfab40058318a5255b948503dffd222f4fa4064f6fa7b3fc08bd9` | BUILT ✅ |
| Windows MSI local build | — | — | BLOCKED_LOCAL_TOOLCHAIN |

---

## Addendum — 2026-04-15 — Local UI Build Refresh v30.1.27

Session: `LOCAL_UI_BUILD_REFRESH_30_1_27`
Canonical target version: **30.1.27**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `src-tauri/Cargo.toml` | `30.1.27` | UPDATED_TO_30_1_27 |
| `src-tauri/tauri.conf.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `src-tauri/tauri.base.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `tauri.base.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `runtime/stable/tauri.conf.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `runtime/stable/manifest.json` | `30.1.27` | UPDATED_TO_30_1_27 |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.27.txt` | `30.1.27` | ADDED_AS_PROOF |
| `RELEASE_v30.1.27.md` | `30.1.27` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.1.27

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.27_amd64.AppImage` | `92903928` bytes | `0d025afdff213cc27a567598ada72eb716a7cd979d5f3a969d975eee174ae17e` | BUILT ✅ LOCAL_ONLY |
| `TITANE Infinity_30.1.27_amd64.deb` | `20091694` bytes | `83f138a8a2477c91120f3c3c97a3d0456739f988a8423c403763d721a1a8b1e6` | BUILT ✅ LOCAL_ONLY |
| `TITANE Infinity-30.1.27-1.x86_64.rpm` | `20091246` bytes | `4d8d71059ae2b396aa566f88ee6c9ba7778fc0a40fbdca7eb816e9afbd6ee2a7` | BUILT ✅ LOCAL_ONLY |
| `src-tauri/target/release/titane-infinity` | `45109712` bytes | `6a405c49428d735087bb4f4405c6021bc87bd2f2ee216cf25521a0f74d3d5f9a` | BUILT ✅ LOCAL_ONLY |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.26` | STALE_PENDING_SUDO_SYNC |
| `/usr/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.26` | STALE_PENDING_SUDO_SYNC |

> v30.1.27 is the current local desktop build truth after the recent conversation UI refresh on 2026-04-15.
> `deployment/latest` remains on v30.1.26 because this session rebuilt desktop artifacts locally but did not republish the latest deployment surfaces.
> Post-build Linux launcher synchronization is BLOCKED in this session by interactive `sudo` prompts, so installed/system launchers still advertise v30.1.26.
> Android artifacts were not rebuilt in this refresh; the validated change scope for this session is the desktop build plus targeted Android browser-mobile UI proof.

> Android release artifacts were generated on the local Linux host and verified with `android:artifact:check` plus direct SHA256/size capture.
> No Android device or emulator was connected in this session, so no install or runtime smoke proof is claimed for v30.1.25.
> No local Windows artifact is claimed for v30.1.25 on this host: repo truth requires a Windows runner or Windows machine with MSVC/WebView2, and the Linux host lacks `pwsh`, MinGW, and `cargo-xwin`.
> The repository does provide an on-demand Windows MSI workflow at `.github/workflows/windows-msi-on-demand.yml`, but it was not dispatched from this unpushed local v30.1.25 worktree.

---

## Addendum — 2026-04-15 — Windows MSI CI Artifact v30.1.25

Session: `WINDOWS_MSI_CI_30_1_25`
Canonical target version: **30.1.25**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `.github/workflows/windows-msi-on-demand.yml` | action runtime refresh | UPDATED_TO_NODE24_COMPAT_ACTIONS |
| GitHub Actions run `24465327619` | `success` | VERIFIED |
| GitHub artifact `windows-msi-3` | `30.1.25` | VERIFIED |

### Artifact Status Summary — Windows CI v30.1.25

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.25_x64_en-US.msi` | `17211392` bytes | `f8f602231bd41169dc218aeb9e06e173f769cc80708835f9903b7a0444e634c6` | BUILT_CI ✅ |
| `SHA256SUMS.txt` | `105` bytes | contains MSI hash | VERIFIED ✅ |
| GitHub artifact archive `windows-msi-3` | `16997560` bytes | GitHub artifact payload | UPLOADED ✅ |

> The Windows MSI was produced by the repository's canonical GitHub Windows lane: run `24465327619` of `.github/workflows/windows-msi-on-demand.yml` completed with `success`.
> The downloaded artifact bundle was verified locally on 2026-04-15 with `sha256sum -c SHA256SUMS.txt` and matched the MSI payload exactly.
> The workflow file was also refreshed to `actions/checkout@v6.0.2` and `actions/upload-artifact@v7.0.1` so future runs stop relying on Node 20-based action runtimes.
> This addendum does not claim release-tag publication; the workflow run uploaded a build artifact only.

---

## Addendum — 2026-04-15 — Windows Release Publication v30.1.25

Session: `WINDOWS_MSI_RELEASE_30_1_25`
Canonical target version: **30.1.25**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| GitHub Actions run `24466843763` | `success` | VERIFIED |
| GitHub release `v30.1.25` | published | RELEASED |
| GitHub release asset `TITANE.Infinity_30.1.25_x64_en-US.msi` | `30.1.25` | RELEASED |
| GitHub release asset `SHA256SUMS.txt` | release checksum | RELEASED |

### Artifact Status Summary — Windows Release v30.1.25

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE.Infinity_30.1.25_x64_en-US.msi` | `17211392` bytes | `31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8` | RELEASED ✅ |
| `SHA256SUMS.txt` | `105` bytes | asset digest `44700487df5b477e2128ce8ded08e05b527124712680d201b1c170e3d30f88be` | RELEASED ✅ |

> GitHub release URL: `https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v30.1.25`.
> Release assets were published from the rerun `24466843763`, whose terminal summary no longer emitted the previous `ANNOTATIONS` block about Node 20-based actions.
> GitHub normalized the uploaded MSI asset filename from spaces to dots in the published release asset name; checksum verification was performed before upload on the exact MSI payload generated by the rerun.

---

## Addendum — 2026-04-15 — Windows Release Assets Refresh v30.1.25

Session: `WINDOWS_MSI_RELEASE_REFRESH_30_1_25`
Canonical target version: **30.1.25**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| GitHub release `v30.1.25` | published | WINDOWS_ASSETS_REFRESHED |
| GitHub release asset `TITANE.Infinity_30.1.25_x64_en-US.msi` | `30.1.25` | CLOBBER_REFRESHED |
| GitHub release asset `SHA256SUMS.txt` | release checksum | CLOBBER_REFRESHED |
| GitHub Actions run `24470399167` | `cancelled` | REDUNDANT_RERUN_STOPPED |

### Artifact Status Summary — Windows Release Refresh v30.1.25

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE.Infinity_30.1.25_x64_en-US.msi` | `17211392` bytes | `31517da7cafec2fbd5b6333c1bfcf24028d525d6733a1d779fc1f924a60bc3b8` | REFRESHED ✅ |
| `SHA256SUMS.txt` | `105` bytes | asset digest `44700487df5b477e2128ce8ded08e05b527124712680d201b1c170e3d30f88be` | REFRESHED ✅ |

> Release assets were refreshed at `2026-04-15T18:20:31Z`–`2026-04-15T18:20:33Z` by re-uploading the last validated Windows artifact from run `24466843763` with `gh release upload --clobber`.
> The MSI payload checksum was revalidated locally with `sha256sum -c SHA256SUMS.txt` before the refresh, and the published asset digests remained identical to the previously sealed Windows release payload.
> An additional rerun `24470399167` was started for a full rebuild but canceled while still in `Build MSI` to avoid a redundant later overwrite once the deterministic refresh from the already validated artifact had completed.

---

## Addendum — 2026-04-15 — BUILD ALL Local v30.1.28

Session: `BUILD_ALL_LOCAL_30_1_28`
Canonical target version: **30.1.28**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.1.28` | VERIFIED_CANONICAL |
| `src-tauri/Cargo.toml` | `30.1.28` | VERIFIED_CANONICAL |
| `src-tauri/tauri.conf.json` | `30.1.28` | VERIFIED_CANONICAL |
| `src-tauri/tauri.base.json` | `30.1.28` | VERIFIED_CANONICAL |
| `tauri.base.json` | `30.1.28` | VERIFIED_CANONICAL |
| `runtime/stable/tauri.conf.json` | `30.1.28` | VERIFIED_CANONICAL |
| `runtime/stable/manifest.json` | `30.1.28` | VERIFIED_CANONICAL |
| `deployment/latest/MANIFEST.json` | `30.1.28` | UPDATED_TO_30_1_28 |
| `deployment/latest/CHECKSUMS.txt` | `30.1.28` | UPDATED_TO_30_1_28 |
| `deployment/latest/CHECKSUMS.sha256` | `30.1.28` | UPDATED_TO_30_1_28 |
| `deployment/latest/SHA256SUMS.txt` | `30.1.28` | UPDATED_TO_30_1_28 |
| `deployment/latest/SIZES.txt` | `30.1.28` | UPDATED_TO_30_1_28 |
| `RELEASE_ARTIFACTS_CHECKSUMS_30.1.28.txt` | `30.1.28` | ADDED_AS_PROOF |
| `RELEASE_v30.1.28.md` | `30.1.28` | ADDED_AS_PROOF |

### Artifact Status Summary — v30.1.28

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `TITANE Infinity_30.1.28_amd64.AppImage` | `92891640` bytes | `58567aca0006222dbd039cc35d6c01d7b104f4dd6c541ed6c1eb16a62a7a240b` | BUILT ✅ PUBLISHED_LOCAL |
| `TITANE Infinity_30.1.28_amd64.deb` | `20078936` bytes | `3fd0202ff0a509ef4ee48e6cf566648556a4997cbc5ef99b067afdd372c3cf9b` | BUILT ✅ PUBLISHED_LOCAL |
| `TITANE Infinity-30.1.28-1.x86_64.rpm` | `20079454` bytes | `c5c5ba2268c076558f4611d4e69b4c491215d36cc3e09e262fa806c79195f017` | BUILT ✅ PUBLISHED_LOCAL |
| `src-tauri/target/release/titane-infinity` | `45079512` bytes | `61c1b918edb24b1d8b69bdcc2e1809493118c1bf9cd9e635dc9af90536cf9516` | BUILT ✅ LOCAL_BINARY |
| `app-universal-release-unsigned.apk` | `69940619` bytes | `f38932fe6b5dc3f46cba9f6e593726f7cd09f83d5bee18c9dd8078d5c5f43b3b` | BUILT ✅ UNSIGNED_RELEASE |
| `app-universal-release.aab` | `43522156` bytes | `f0f52996b39beca1184163c15880e1578595d037d04abc38157cb3564b357aff` | BUILT ✅ |
| `dpkg -s titane-infinity` | `30.1.26` | host install truth | STALE_PENDING_SUDO_INSTALL |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.26` | `/usr/bin/titane-infinity` | ALIGNED_TO_INSTALLED_BINARY |

> `deployment/latest` is now aligned to the desktop 30.1.28 artifacts and the current release binary hash.
> The Android lane completed successfully on the local Linux host: `android:artifact:check` passed, and `android:env:check` now reports one ready device (`R5CY326GJAM`).
> The Android release APK remains unsigned by repo truth (`explicit_signing_config=no`), so the strongest honest target remains the unsigned release APK or debug install helper.
> Linux host installation is still on v30.1.26 because the system DEB reinstall and post-build system sync remain blocked by interactive `sudo` in this session.
> No local Windows artifact is claimed for v30.1.28 on this Linux host: `pwsh`, MinGW, and `cargo-xwin` remain missing.

---

## Addendum — 2026-04-16 — BUILD ALL Attempt v30.1.29

Session: `BUILD_ALL_ATTEMPT_30_1_29`
Canonical target version: **30.1.29**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `src-tauri/Cargo.toml` | `30.1.29` | UPDATED_TO_30_1_29 |
| `src-tauri/Cargo.lock` | `30.1.29` | UPDATED_TO_30_1_29 |
| `src-tauri/tauri.conf.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `src-tauri/tauri.base.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `tauri.base.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `runtime/stable/tauri.conf.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `runtime/stable/manifest.json` | `30.1.29` | UPDATED_TO_30_1_29 |
| `titane-infinity.desktop` | `Name=TITANE∞ v30.1.26` | REGENERATED_TO_INSTALLED_BINARY_TRUTH |
| `~/.local/share/applications/titane-infinity.desktop` | `Name=TITANE∞ v30.1.26` | REGENERATED_TO_INSTALLED_BINARY_TRUTH |
| `reports/BUILD_ALL_2026-04-16_v30.1.29.md` | `30.1.29` | ADDED_AS_BLOCKED_PROOF |
| `proof_packs/BUILD_ALL_2026-04-16_v30.1.29/*` | `30.1.29` | ADDED_AS_BLOCKED_PROOF |

### Artifact Status Summary — v30.1.29

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `src-tauri/target/release/bundle/*30.1.29*` | — | — | NOT_EMITTED_YET |
| `src-tauri/target/release/titane-infinity` | `45079512` bytes | previous `30.1.28` binary still present | STALE_PREVIOUS_BUILD |
| `app-universal-release-unsigned.apk` | previous `30.1.28` output still present | previous `30.1.28` hash | STALE_PENDING_BUILD_LOCK |
| `app-universal-release.aab` | previous `30.1.28` output still present | previous `30.1.28` hash | STALE_PENDING_BUILD_LOCK |
| `dpkg -s titane-infinity` | `30.1.26` | host install truth | STALE_PENDING_SUDO_INSTALL |

> The desktop build command `pnpm exec tauri build --config src-tauri/tauri.conf.json` was started and remained active at proof time with `rustc` still consuming ~100% CPU while no 30.1.29 bundle file had been emitted yet.
> The Android build command `pnpm run android:build:full` was started but remained blocked on Cargo's artifact directory lock while the desktop release link was still active.
> `deployment/latest` was intentionally left on 30.1.28 because no honest 30.1.29 desktop artifact, size, or checksum existed yet in this session.
> Local launcher regeneration completed truthfully through `bash scripts/update-desktop-icon.sh`, and the menu/dock entries still advertise `v30.1.26` because `/usr/bin/titane-infinity` remains the selected installed binary.
> System install and system launcher synchronization remain blocked by interactive `sudo`, so no claim is made for `/usr/bin/titane-infinity` or `/usr/share/applications` moving to 30.1.29 in this session.

---

## Addendum — 2026-04-24 — Continuation Version Sync v31.2.0

Session: `CONTINUATION_CONFORMANCE_V31_2_0`
Canonical target version: **31.2.0**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `31.2.0` | UPDATED_TO_31_2_0 |
| `src-tauri/Cargo.toml` | `31.2.0` | UPDATED_TO_31_2_0 |
| `src-tauri/Cargo.lock` | `31.2.0` | UPDATED_TO_31_2_0 |
| `src-tauri/tauri.conf.json` | `31.2.0` | UPDATED_TO_31_2_0 |
| `src-tauri/tauri.base.json` | `31.2.0` | UPDATED_TO_31_2_0 |
| `tauri.base.json` | `31.2.0` | UPDATED_TO_31_2_0 |
| `runtime/stable/tauri.conf.json` | `31.2.0` | UPDATED_TO_31_2_0 |
| `runtime/stable/manifest.json` | `31.2.0` | UPDATED_TO_31_2_0 |

### Artifact Status Summary — v31.2.0

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `src-tauri/target/release/bundle/*31.2.0*` | — | — | NOT_PROVEN_IN_THIS_CONTINUATION |
| `deployment/latest/*` | — | — | NOT_UPDATED_IN_THIS_CONTINUATION |
| `dpkg -s titane-infinity` | unknown | host install truth | NOT_RECHECKED |

> This continuation seals version-surface synchronization only. No new production artifact publication is claimed in this addendum.

---

## Addendum — 2026-04-24 — Production Build v31.2.1

Session: `BUILD_PROD_V31_2_1`
Canonical target version: **31.2.1**

### Updated Current Surfaces

| File / Surface | Version | Action |
|---|---|---|
| `package.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `src-tauri/Cargo.toml` | `31.2.1` | UPDATED_TO_31_2_1 |
| `src-tauri/Cargo.lock` | `31.2.1` | UPDATED_TO_31_2_1 |
| `src-tauri/tauri.conf.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `src-tauri/tauri.base.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `tauri.base.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `runtime/stable/tauri.conf.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `runtime/stable/manifest.json` | `31.2.1` | UPDATED_TO_31_2_1 |
| `RELEASE_SURFACE_INVENTORY.md` | `31.2.1` | UPDATED_TO_31_2_1 |

### Artifact Status Summary — v31.2.1

| Artifact | Size | SHA256 | Status |
|---|---|---|---|
| `src-tauri/target/release/bundle/appimage/Titan-Stable_31.2.1_amd64.AppImage` | `90M` | `573421210bd158002658270c1c4ae483145fbc2995506569028ba68052beb8ac` | BUILT |
| `src-tauri/target/release/bundle/deb/Titan-Stable_31.2.1_amd64.deb` | `21M` | `6631088a9f45c53b2722d2ef29849e34baff172d7d801d0526d4e2fbb298979e` | BUILT |
| `/home/titane-os/.local/share/applications/titane-infinity.desktop` | `Exec=/usr/bin/titane-infinity` | `Icon=titane-infinity` | VERIFIED_USER_LAUNCHER |
| `/usr/share/applications/titane-infinity.desktop` | `Exec=/usr/bin/titane-infinity` | `Icon=titane-infinity` | VERIFIED_EXISTING_SYSTEM_LAUNCHER |

> Production build completed with `pnpm run build:production`. Post-build launcher refresh succeeded for the user launcher and reported `BLOCKED_SUDO_REQUIRED` for system-wide synchronization; however, the existing system desktop entry already exposes the canonical `Exec=/usr/bin/titane-infinity` and `Icon=titane-infinity` values.

## Addendum — 2026-04-28 — Remote Gateway v31.2.2

Session: `REMOTE_GATEWAY_INTERNET_ACCESS`
Canonical target version: **31.2.2**

New capability: **Accès Internet à TITANE** via serveur axum HTTP/WS embarqué + Cloudflare Tunnel.

| Fichier | Version | Statut |
|---|---|---|
| `package.json` | `31.2.2` | UPDATED_TO_31_2_2 |
| `src-tauri/Cargo.toml` | `31.2.2` | UPDATED_TO_31_2_2 |
| `src-tauri/Cargo.lock` | `31.2.2` | UPDATED_TO_31_2_2 |
| `runtime/stable/manifest.json` | `31.2.2` | UPDATED_TO_31_2_2 |

### New Surfaces — v31.2.2

| Surface | Fichiers | Statut |
|---|---|---|
| `remote_gateway` Rust (Ring 0) | `src-tauri/src/remote_gateway/` (8 fichiers) | ADDED |
| Transport TypeScript | `src/lib/remoteTransport.ts`, `remoteStream.ts`, `transport.ts` | ADDED |
| Cloudflare Tunnel scripts | `scripts/remote/` (5 scripts + template) | ADDED |
| Tests contrat | `tests/contract/remote-gateway-contract.test.ts` (20 PASS) | ADDED |
| E2E remote | `e2e/remote-gateway.spec.ts` (8 scenarios) | ADDED |

**Activation** : `TITANE_REMOTE_ENABLED=1` (opt-in, désactivé par défaut). Port `TITANE_REMOTE_PORT=7420`.

---

## v31.2.9 — BUILD ALL (2026-04-27)

| Fichier | Version | Statut |
|---|---|---|
| `package.json` | `31.2.9` | UPDATED_TO_31_2_9 |
| `src-tauri/Cargo.toml` | `31.2.9` | UPDATED_TO_31_2_9 |
| `src-tauri/Cargo.lock` | `31.2.9` | UPDATED_TO_31_2_9 |
| `tauri.base.json` | `31.2.9` | UPDATED_TO_31_2_9 |
| `src-tauri/tauri.conf.json` | `31.2.9` | UPDATED_TO_31_2_9 |
| `runtime/stable/manifest.json` | `31.2.9` | UPDATED_TO_31_2_9 |

### Artifacts — v31.2.9

| Artifact | SHA256 | Taille |
|---|---|---|
| `Titan-Stable_31.2.9_amd64.AppImage` | `cb6e0997...` | 91 MiB |
| `Titan-Stable_31.2.9_amd64.deb` | `83b177c8...` | 21 MiB |
| `titane-infinity` (binary) | `120f8aef...` | 46 MiB |

### New Surfaces — v31.2.9

| Surface | Fichiers | Statut |
|---|---|---|
| Admin onglet `remote-keys` | `src/features/admin/AdminPage.tsx`, `types.ts` | ADDED |
| `RemoteKeyDashboard` monté | `/admin?tab=remote-keys` | MOUNTED |
| `AgentConfigPanel` | `src/components/RemoteKeyDashboard/AgentConfigPanel.tsx` | ADDED |
| `RemoteKeyAgent` étendu (train/AI) | `src/services/remoteKeyManager/` | UPDATED |
| HTF module complet | `src/services/htf/`, `src/components/htf/`, `src/stores/useHTFStore.ts` | ADDED |
| Gateway remote network v31.2.9 | Port 7420, PID 499009, `/api/health` OK | ACTIVE |

### Gates v31.2.9

| Gate | Résultat |
|---|---|
| `tsc --noEmit` | PASS |
| `verify:final100` | PASS |
| `detect_recurrence` | PASS (1357 entrées) |
| `verify_instructions` | PASS 33/33 |
| `verify:registry` | PASS |
| Remote gateway health | `{"ok":true,"version":"31.2.9"}` |
| JWT auth smoke | TOKEN 185 chars OK |

---

## Release v31.2.37 — 2026-04-28

### Artifacts

| Artifact | SHA256 | Size |
|---|---|---|
| `titane-infinity_31.2.37_amd64.deb` | `e1b9084cf48ac3bbae905dbfd3319467babe3aa3959490f343c114a8cdece282` | 22 MiB |
| `titane-infinity-31.2.37-1.x86_64.rpm` | `96a4cebade0beb10c3965ecbd239b48276cffd2a8124770d0e8cdcca16b9ed3c` | 22 MiB |
| `titane-infinity_31.2.37_amd64.AppImage` | `22c9b2dc6a6fa3d787fde800eae94d8fe2e93094f07eabac98ede42b38356ee2` | 91 MiB |
| `titane-infinity` (binary) | `752f03f07c5e2cefc3d80d3d1d8203150ba24ca0906e92bdc0bfd0b70404ef86` | 47 MiB |

### Changes — v31.2.37

| Surface | Status |
|---|---|
| Web search (Wikipedia direct FR+EN) | FIXED — browserWebSearch() calls Wikipedia JSON API directly |
| Remote Gateway (Axum+JWT port 7420) | NEW — handlers.rs web_search/web_research match arms |
| remoteTransport.ts + safeInvokeCanonical | NEW — Tauri→Gateway→NO_TRANSPORT routing |
| UI unification (dead code removal) | DONE — 4 dead layout files deleted, export cleaned |
| TopNav mobile zoom controls hidden | FIXED — hidden sm:flex |
| App.tsx maxVisibleItems dynamic | FIXED — isMobile ? 3 : 5 |
| 13 Vitest test failures | FIXED — 250/250 PASS |
| Post-build icons/launchers | DONE — local sync OK, sudo reinstall requires user action |

### Gates v31.2.37

| Gate | Result |
|---|---|
| `detect_recurrence` | PASS (1410 entries) |
| Version bump | 31.2.35 → 31.2.37 (6 files) |
| AutoHeal entry | AH-2026-04-28-BUILD-ALL-v31.2.37-0015 |
| DEB artifact | titane-infinity_31.2.37_amd64.deb 22MiB |
| sudo reinstall | BLOCKED_SUDO_REQUIRED — run manually: sudo dpkg -i src-tauri/target/release/bundle/deb/titane-infinity_31.2.37_amd64.deb |
