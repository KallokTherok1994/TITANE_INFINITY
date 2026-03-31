# 16 — VÉRIFICATION POST-ACTION

## df -h /
```
Sys. de fichiers Taille Utilisé Dispo Uti% Monté sur
/dev/nvme0n1p2     915G    556G  313G  65% /
```

## du -sh repo
```
37G	.
```

## du -sh src-tauri/target/ deployment/latest/
```
15G	src-tauri/target/
705M	deployment/latest/
```

## git worktree list
```
/home/titane-os/Documents/GitHub/TITANE_INFINITY  8e09aab32 [MAIN]
```

## Release binary intact
```
-rwxrwxr-x 2 titane-os titane-os 42371408 mars  22 12:07 src-tauri/target/release/titane-infinity
```

## AppImages intact
```
deployment/latest/TITANE-Infinity_28.5.0_amd64.AppImage
deployment/latest/TITANE-Infinity_28.6.0_amd64.AppImage
deployment/latest/TITANE-Infinity_28.7.0_amd64.AppImage
deployment/latest/Titan-Stable_27.2.0_amd64.AppImage
deployment/latest/Titan-Stable_28.0.0_amd64.AppImage
deployment/latest/Titan-Stable_28.5.0_amd64.AppImage
```
