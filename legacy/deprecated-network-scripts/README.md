# Scripts Réseau Dépréciés

**AVERTISSEMENT:** Ces scripts sont **INTERDITS** pour TITANE∞.

## Politique Tauri-Only

TITANE∞ suit une philosophie **Tauri-only, local-first** stricte:

- ❌ PAS de tunnels (Cloudflare, ngrok, etc.)
- ✅ Application desktop locale uniquement
- ✅ Isolation réseau pour sécurité maximale

## Scripts Déplacés (2026-02-04)

Les scripts suivants ont été déplacés ici depuis la racine du projet car ils violent la politique Tauri-only:

- `deploy-http-server.sh` - Serveur HTTP Node.js (INTERDIT)
- `deploy-http-server-pure.sh` - Serveur HTTP Python (INTERDIT)
- `deploy-network.sh` - Configuration réseau générique (INTERDIT)
- `setup-cloudflare-tunnel.sh` - Tunnel Cloudflare (INTERDIT)
- `deploy-interactive.sh` - Déploiement réseau interactif (INTERDIT)

## Raison du Déplacement

Ces scripts contredisent les principes fondamentaux de TITANE∞:

1. **Sécurité:** Exposition réseau = surface d'attaque
2. **Architecture:** Tauri = desktop app isolée, pas serveur web
3. **Gouvernance:** Règles SEAL interdisent scripts réseau à la racine

## Alternatives Autorisées

Pour le développement local:

- `pnpm run dev` - Mode développement Tauri (port 5173 interne uniquement)
- `pnpm run tauri dev` - Application Tauri en développement

Pour la production:

- `pnpm run build` - Build AppImage/DEB
- Aucun serveur réseau nécessaire

## Référence

- Voir `.github/copilot-instructions.md` - "Tauri-only (no HTTP servers)"
- Voir `reports/seal/SEAL_C_GAP_LIST.md` - seal-gap-001
- Registry: `registry/repo-events.jsonl` - repo-seal-gap-001-20260204-001

---

**Si vous avez besoin d'un serveur web, vous utilisez le mauvais projet.**
TITANE∞ est une application desktop Tauri, pas une application web.
