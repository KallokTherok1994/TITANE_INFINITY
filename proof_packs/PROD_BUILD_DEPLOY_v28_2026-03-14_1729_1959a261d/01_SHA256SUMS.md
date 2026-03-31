# ARTIFACTS — SHA256SUMS v28.0.0

Date: 2026-03-14T17:29Z  
Commit: 1959a261d8c7e7f2912464951f1ebfab5b4533bb (MAIN)  
Build method: `pnpm run build:production` (via `tauri build --release`)

## Hashes (nouvelle build)

```
028a1a64dbcb99af5bc82373a38d3aa920389594a5e7ca4c4c470bf2100ffc47  TITANE-Infinity_27.2.0_amd64.AppImage
6adb68c10e0eab53809792d9a5d8f8df184de4ef8f509907bb1c8cfd7c0e07cf  TITANE-Infinity_27.2.0_amd64.deb
9f0dc389d73d33ea6f955f8d13b0f4badd19eb983dcad1a0ccab48d01c4daa66  titane-infinity
```

## Hashes précédents (avant ce PROD deploy)

```
c56ea5a8e9c787413028708e5831e331706378c23a4ce2f48e69707eaaf48286  TITANE-Infinity_27.2.0_amd64.AppImage
48988daf0e19297aa1d97b088929418dee8da29cd2e79fd5b60f1d184a648c40  TITANE-Infinity_27.2.0_amd64.deb
5602052eb4a90810ac11f418b4b8e5dcfe0c3c1d2bf955fb388a9b42beafdf7b  titane-infinity
```

## Raison du changement

Les hashes sont différents car le fix IPC (commit 7d210d2a8) a modifié
le bundle frontend embarqué dans le binaire Tauri.
