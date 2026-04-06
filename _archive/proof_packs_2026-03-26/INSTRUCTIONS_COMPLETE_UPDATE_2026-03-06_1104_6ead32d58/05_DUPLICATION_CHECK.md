# 05_DUPLICATION_CHECK

## B) Duplication checks

1. Fichiers: kernel + couches scopees
- probleme: duplication de tokens PROD/status/AutoHeal canonical path
- canonical winner: `.github/copilot-instructions.md`
- resolution minimale: aucune (deja conforme)
- patch now: NO
- rollback: n/a

2. Fichiers: indexes prompts/agents
- probleme: mismatch index/fichiers
- canonical winner: scripts verify indexes
- resolution minimale: aucune (PASS)
- patch now: NO
- rollback: n/a

3. Archives/proof packs historiques
- probleme: repetitions textuelles d'anciens contenus
- canonical winner: couche active `.github/**`
- resolution minimale: ne pas toucher (transitional)
- patch now: NO
- rollback: n/a

## Conclusion

- Duplication harmful active: **Aucune**.
