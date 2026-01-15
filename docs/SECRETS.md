# TITANE∞ — Secrets (Policy)

## Règle principale
- **Aucun secret ne doit être versionné. Jamais.**
- **Seuls les fichiers `*.example` sont versionnables** (templates sans valeurs réelles).

## Où stocker les secrets (local-only)
Ces fichiers sont **locaux** et **ignorés par git**:
- `.env` (copie de [`.env.example`](../.env.example))
- `.env.deploy` (copie de [`.env.deploy.example`](../.env.deploy.example))
- `.env.gpg` (copie de [`.env.gpg.example`](../.env.gpg.example))
- `.env.ollama` (copie de [`.env.ollama.example`](../.env.ollama.example))
- `.tunnel-access.txt` (copie de [`.tunnel-access.example.txt`](../.tunnel-access.example.txt))
- `.current-server-info` (copie de [`.current-server-info.example`](../.current-server-info.example))

## Initialisation rapide
1) Copier le template voulu (ex: `cp .env.example .env`).
2) Remplir les valeurs localement.
3) Vérifier que git n’affiche aucun fichier sensible: `git status --porcelain` doit rester vide.

## Rotation en cas de fuite (procédure)
1) **Révoquer** immédiatement la clé/token côté fournisseur.
2) **Générer** un nouveau secret.
3) **Purger** l’historique si un secret a été commité (outil: `git filter-repo`), puis forcer le push (coordination requise).
4) **Re-sécuriser**: vérifier `CI secret scan` + relancer une validation locale.

## Exceptions
- Aucune exception pour les secrets.
- Les références de type `OPENAI_API_KEY`/`GEMINI_API_KEY` dans le code/tests/docs sont autorisées **si** elles ne contiennent pas de valeurs réelles.
