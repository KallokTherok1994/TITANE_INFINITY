# PHASE 1 — DEPLOY MECHANISM DISCOVERY

## Search 1: Deployment keywords in scripts/

```
scripts/deployment/tauri-full-deploy.sh
scripts/deployment/deploy-fix-complete.sh
scripts/deployment/certified-deploy.sh
scripts/create-release-v27.0.2.sh
scripts/audit/05-deployment-audit.sh
scripts/deploy_titane.sh
scripts/build/build-release.sh
scripts/setup/update_deployment_icons.sh
scripts/setup/create_release_package.sh
scripts/gates/g9-release-seal.sh
scripts/deploy-orchestrator.py
scripts/cleanup/post-deploy-dependencies.sh
scripts/launch/deploy_full_local_dev.sh
scripts/verify/pre-deployment-check.sh
scripts/governance/prod-cert-release.sh
scripts/deploy-complete.sh
scripts/v26_deployment_verify.sh
scripts/deploy/deploy-network.sh
scripts/deploy/deploy_final_omnis.sh
scripts/deploy/deploy_v16.2.2.sh
scripts/deploy/deploy_post_reboot.sh
scripts/deploy/deploy.sh
scripts/deploy-production.sh
```

## Search 2: Deployment directory structure

```
total 164
drwxrwxr-x 12 titane-os titane-os  4096 févr. 20 12:22 .
drwxrwxr-x 58 titane-os titane-os 36864 févr. 23 14:33 ..
-rw-rw-r--  1 titane-os titane-os 11169 janv. 19 15:24 ADMIN_ACCESS_GUIDE.md
-rw-rw-r--  1 titane-os titane-os  8293 févr.  1 09:54 DEPLOYMENT_MANIFEST_v27.0.0.md
-rwxrwxr-x  1 titane-os titane-os  8012 janv.  4 20:05 deploy-to-server.sh
drwxrwxr-x  6 titane-os titane-os  4096 févr. 23 10:52 latest
drwxrwxr-x  2 titane-os titane-os  4096 déc.  17 12:35 nginx
-rw-rw-r--  1 titane-os titane-os 16372 janv.  4 20:05 POST_DEPLOY_VALIDATION.md
drwxrwxr-x  4 titane-os titane-os  4096 févr.  2 12:41 production
-rw-rw-r--  1 titane-os titane-os  8687 janv.  4 20:05 QUICK_DEPLOY.md
-rwxrwxr-x  1 titane-os titane-os  3064 déc.  17 12:47 setup-admin-access.sh
drwxrwxr-x  3 titane-os titane-os  4096 févr. 18 21:24 staging
-rwxrwxr-x  1 titane-os titane-os  2586 janv. 31 15:30 test-installation.sh
-rw-rw-r--  1 titane-os titane-os   135 janv. 26 20:38 TITANE-Infinity_26.2.0_amd64.deb.sha256
drwxrwxr-x  2 titane-os titane-os  4096 janv. 18 10:54 v26.3.0
drwxrwxr-x  2 titane-os titane-os  4096 janv. 29 09:24 v26.4.0
-rw-rw-r--  1 titane-os titane-os   135 janv. 31 15:29 v27.0.0-checksums.txt
drwxrwxr-x  3 titane-os titane-os  4096 févr.  4 11:53 v27.0.0-PRODUCTION
-rw-rw-r--  1 titane-os titane-os   418 févr.  4 17:13 v27.0.0-PRODUCTION-SHA256.txt
drwxrwxr-x  2 titane-os titane-os  4096 févr. 20 12:28 v27.0.2_prod_final
drwxrwxr-x  3 titane-os titane-os  4096 févr. 16 14:31 v27.0.3
drwxrwxr-x  3 titane-os titane-os  4096 févr.  9 09:54 v27.4.1
```

```
total 747772
drwxrwxr-x  6 titane-os titane-os      4096 févr. 23 10:52 .
drwxrwxr-x 12 titane-os titane-os      4096 févr. 20 12:22 ..
drwxrwxr-x  4 titane-os titane-os      4096 févr. 23 13:14 builds
drwxrwxr-x 34 titane-os titane-os      4096 févr. 19 07:37 certification
-rw-rw-r--  1 titane-os titane-os       508 févr. 18 21:49 CHECKSUMS.sha256
-rw-rw-r--  1 titane-os titane-os       203 févr. 13 18:27 HASHES_v27.0.1_clean.txt
-rw-rw-r--  1 titane-os titane-os       203 févr. 13 18:27 HASHES_v27.0.1_final.txt
-rw-rw-r--  1 titane-os titane-os       984 févr. 23 09:04 MANIFEST.json
-rw-rw-r--  1 titane-os titane-os      4059 févr. 20 05:56 MANIFEST_v27.0.2.md
-rw-rw-r--  1 titane-os titane-os      1344 févr. 22 09:29 MANIFEST_v27.0.5.md
drwxrwxr-x  4 titane-os titane-os      4096 févr. 18 20:44 release
-rw-rw-r--  1 titane-os titane-os      2126 févr.  6 10:34 RELEASE_v27.0.1.md
-rw-rw-r--  1 titane-os titane-os       203 févr. 22 09:29 SHA256SUMS.txt
-rw-rw-r--  1 titane-os titane-os       305 févr. 20 05:55 SHA256SUMS_v27.0.2.txt
-rw-rw-r--  1 titane-os titane-os       305 févr. 23 09:04 SHA256SUMS_v27.0.5.txt
-rw-rw-r--  1 titane-os titane-os       203 févr.  6 10:34 SHA256_v27.0.1_final.txt
-rw-rw-r--  1 titane-os titane-os       203 févr.  5 16:14 SHA256_v27.0.1.txt
-rw-rw-r--  1 titane-os titane-os       305 févr. 20 05:55 SHA256_v27.0.2.txt
-rw-rw-r--  1 titane-os titane-os       305 févr. 22 09:29 SHA256_v27.0.5.txt
-rw-rw-r--  1 titane-os titane-os       103 févr. 22 09:29 SIZES.txt
-rw-rw-r--  1 titane-os titane-os        79 févr.  5 21:22 SIZES_v27.0.1.txt
-rw-rw-r--  1 titane-os titane-os       155 févr. 20 05:55 SIZES_v27.0.2.txt
-rw-rw-r--  1 titane-os titane-os       155 févr. 23 09:04 SIZES_v27.0.5.txt
-rwxrwxr-x  1 titane-os titane-os  23288440 févr. 23 09:04 titane-infinity
-rwxr-xr-x  1 titane-os titane-os  85600760 févr. 18 21:42 TITANE-Infinity_26.3.0_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os   9989722 févr. 18 21:42 TITANE-Infinity_26.3.0_amd64.deb
-rw-rw-r--  1 titane-os titane-os   9968942 janv. 29 11:36 TITANE-Infinity-26.4.0-1.x86_64.rpm
-rwxr-xr-x  1 titane-os titane-os  85580280 janv. 29 11:36 TITANE-Infinity_26.4.0_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os   9967846 janv. 29 11:36 TITANE-Infinity_26.4.0_amd64.deb
-rw-rw-r--  1 titane-os titane-os       135 janv. 26 20:38 TITANE-Infinity_26.4.0_amd64.deb.sha256
-rwxr-xr-x  1 titane-os titane-os 100309496 févr. 12 20:46 TITANE-Infinity_27.0.1_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os  26319838 févr. 12 20:46 TITANE-Infinity_27.0.1_amd64.deb
-rw-rw-r--  1 titane-os titane-os  13736013 févr. 20 05:55 TITANE-Infinity-27.0.2-1.x86_64.rpm
-rwxr-xr-x  1 titane-os titane-os  89180664 févr. 20 05:55 TITANE-Infinity_27.0.2_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os  13760504 févr. 20 05:55 TITANE-Infinity_27.0.2_amd64.deb
-rw-rw-r--  1 titane-os titane-os  13789589 févr. 23 09:04 TITANE-Infinity-27.0.5-1.x86_64.rpm
-rwxr-xr-x  1 titane-os titane-os  89242104 févr. 23 09:04 TITANE-Infinity_27.0.5_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os  13810220 févr. 23 09:04 TITANE-Infinity_27.0.5_amd64.deb
-rwxrwxr-x  1 titane-os titane-os       808 févr. 13 18:27 titane-wrapper.sh
-rwxr-xr-x  1 titane-os titane-os  85531128 janv. 25 13:46 Titan-Stable_26.2.0_amd64.AppImage
-rw-rw-r--  1 titane-os titane-os   9909578 janv. 25 13:46 Titan-Stable_26.2.0_amd64.deb
-rwxr-xr-x  1 titane-os titane-os  85572088 févr.  2 08:28 Titan-Stable_27.0.0_amd64.AppImage
drwxrwxr-x  2 titane-os titane-os      4096 janv. 29 22:51 v27.0.0
```

## Search 3: Updater configuration in Tauri

```

```

## Search 4: Release/channel keywords in codebase

README.md:10:**Qualité (v27.0.5) :** Build + packaging validés, artefacts publiés (`deployment/latest`) — Production Ready ✅
README.md:34:📄 [Notes de release complètes](https://github.com/KallokTherok1994/TITANE_INFINITY/releases/tag/v27.0.5) | 🔐 [Checksums](./deployment/latest/SHA256SUMS_v27.0.5.txt)
README.md:335:- **[Deployment Guide](docs/DEPLOYMENT.md)** — Production deployment guide
deployment/POST*DEPLOY_VALIDATION.md:649:- **Quick Deploy:** `deployment/QUICK_DEPLOY.md`
deployment/POST_DEPLOY_VALIDATION.md:650:- **Admin Access:** `deployment/ADMIN_ACCESS_GUIDE.md`
deployment/production/v27.0.0/DEPLOYMENT_MANIFEST.md:29:Latest stable baseline available at: `deployment/stable/` directory
deployment/deploy-to-server.sh:108:# Create deployment directory
deployment/deploy-to-server.sh:129: deployment/nginx/titane-infinity.conf \
deployment/deploy-to-server.sh:163: deployment/setup-admin-access.sh \
deployment/v27.0.2_prod_final/FINAL_VERIFICATION_REPORT.md:56:- **Command**: `./deployment/v27.0.2_prod_final/TITANE-Infinity_27.0.2_amd64.AppImage`
deployment/v27.0.2_prod_final/FINAL_VERIFICATION_REPORT.md:108:- Monitoring configured for first 24h after deployment
deployment/v27.0.2_prod_final/FINAL_VERIFICATION_REPORT.md:186:# Deploy v27.0.1 from deployment/latest/
deployment/v27.0.2_prod_final/VERDICT.md:61:**Verification**: SHA256 hashes recorded in `deployment/v27.0.2_prod_final/{APPIMAGE,DEB,RPM}.sha256`
deployment/v27.0.2_prod_final/VERDICT.md:118:**Artifacts location**: `deployment/v27.0.2_prod_final/`
deployment/v27.0.3/certification/SEAL_v27.0.3.md:11:- `phase2/deployment_gate/` — Full POST-P2 deployment gate (14 phases)
scripts/install-appimage.sh:26:if [ ! -f "deployment/latest/${APPIMAGE_NAME}" ]; then
scripts/install-appimage.sh:28: echo " Chemin attendu: deployment/latest/${APPIMAGE_NAME}"
scripts/install-appimage.sh:42:cp "deployment/latest/${APPIMAGE_NAME}" "$INSTALL_DIR/titane-infinity"
deployment/v27.0.3/certification/phase2/ci_proof/06_CI_VERDICT.md:23:- Gateway: Does NOT block deployment; local proof is primary evidence
deployment/v27.0.3/certification/phase2/ci_proof/05_commit_status_curl.json:74: "deployments_url": "https://api.github.com/repos/KallokTherok1994/TITANE_INFINITY/deployments"
deployment/v27.0.3/certification/phase2/ci_proof/FINAL_REPORT.md:27: - Interpretation: CI infrastructure not deployed (not a failure)
deployment/v27.0.3/certification/phase2/ci_proof/FINAL_REPORT.md:50:| Archive Integrity | ✅ PASS | deployment/latest/certification/* unchanged |
deployment/v27.0.3/certification/phase2/ci_proof/FINAL_REPORT.md:90:- Archive P2 proofs to deployment/v27.0.3/certification/ (if deploying)
deployment/v27.0.3/certification/phase2/MANIFEST_SHA256.txt:1:08fc200b0dd71088f29e15bb5cad4ebd452ea2e3096165265a96c8b828f81114 ./deployment_gate/00_phase.txt
deployment/v27.0.3/certification/phase2/MANIFEST_SHA256.txt:2:0b84c07eab80621e275295d90012c5532ca0e8008fb54afd01220da543490bc7 ./deployment_gate/11_DEPLOYMENT_GATE_SUMMARY.md
deployment/v27.0.3/certification/phase2/MANIFEST_SHA256.txt:5:192fdc2e755463d2a210996e652bac3c2c235a7163843fabe9874239192bb194 ./deployment_gate/17_instructions_echoed.txt
scripts/validate-auto-heal.sh:66:test_script "scripts/verify/pre-deployment-check.sh" "Pre-Deployment Check"
scripts/certification/lib_cert.sh:15: local pack_dir="deployment/latest/certification/master_runs/${phase_id}*${utc}"
scripts/certification/lib_cert.sh:223: local registry="deployment/latest/certification/MASTER_REGISTRY.jsonl"
scripts/certification/run-master-chat-to-prod.sh:10:MASTER_DIR="$REPO_ROOT/deployment/latest/certification/master_runs/$MASTER_RUN_ID"
