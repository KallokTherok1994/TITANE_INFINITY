# ROLLBACK

- git restore -- playwright.config.ts
- git clean -fd proof_packs/PROD_INFINITE_LOAD_*
- git restore -- .last_prod_infinite_pack
- git reset --hard 9383521a12de
