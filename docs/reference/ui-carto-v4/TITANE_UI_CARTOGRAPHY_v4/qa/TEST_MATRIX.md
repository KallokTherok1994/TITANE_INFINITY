# Matrice de tests UI (smoke + non-régression)

## 1) Smoke (2 minutes)
- Boot : header visible + route stable
- DEV → Vue d’ensemble : KPI chargent (pas UNKNOWN)
- DEV → Security : liste alertes charge + acquitter fonctionne
- TITANE → Chat : nouvelle conversation + envoyer message (mock si besoin) → bulle assistant ou erreur visible
- TIME → Timeline : page charge sans crash
- STATS → Global Health : pas de TypeError, si data absente affiche N/A + Retry

## 2) Parcours chat (critique)
- Création conversation
- Sélection conversation existante
- Archivage / restauration
- Recherche message
- Pièce jointe (fichier)
- Vision (image) — si disponible
- Audio toggle — si disponible
- Fallback provider (simulate down)

## 3) DEV commands (sécurisé)
- Health check (dry-run)
- Optimize (dry-run)
- Repair (dry-run)
- Backup (création fichier local)

## 4) Résilience
- IPC fail (simulate) → UI affiche “Backend indisponible”
- Provider timeout → circuit breaker + fallback
- Memory service down → UI degrade sans crash

