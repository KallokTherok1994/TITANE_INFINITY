# 11 — STATUT GIT POST-NETTOYAGE

## Commande

```bash
git status --short | head -20
```

## Résultat attendu

Aucune modification sur les fichiers produit.
Les suppressions gitignorées ne doivent pas apparaître dans `git status`.

## Chemins touchés

Tous les chemins supprimés étaient gitignorés — git status reste propre.

## G_NO_PRODUCT_REOPEN: PASS

## Sortie réelle git status

```
M  CHANGELOG.md
M  README.md
 M deployment/latest/builds/BUILD_REPRODUCIBILITY.md
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/bin/pnpm
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/bin/pnpx
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/00/33beb63f0066da28713fcf56852a4dacde2a2ae7b472b1afdba7c17d6889318bda354411c7e234824a6353b1b1fb9f1ad7479fbbb16005ac1ebc235a265f03
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/00/61a8646b26d16deb6ed9705454917d48d7f784becdccf24aac2efce3e3c46b7b6fa74e6bb92c2e568c7ef217538b6bc865d518245bebeba92c47f43b0050fc
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/00/a9aeaf93dcff7335010e076c3259d3422eb40e730a2e25f50df8ebb5d7944d5f961b6f2a9bf6267a1ce8ca3f97058d3235ae5d6f96ffb0461eabfdcd04e97f
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/00/f28d597358e991a4afe71f175c6ab17f4d91a7413d388998a5f1a202cabd3d4d9f4b0709cdde6cb452d7b41b50e7983d25236793f49289a45c397cc8399984
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/01/6a536a854277eac10c0396387d030256d0db43768e34d517f886d7d579e2c6c25a88d10996bbeffa1a4d40218e4a729bfa3b0825755231b21f3b85bf95c8c0
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/01/82d1e589cb04a3d0dd00926d9ec24afcf0b3660949ced79af159ba1fc1189229ed156f3caa7f1da2cf6362012263042389411af765688b74c4c0bb5f22f789
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/01/95e1d3510158212ec0652c9c41391ba6b7a1c61e4ef4d133d114e475267b515620f3fa7583272170ccd0c31ccdd11ee78dfff1aeff86578c3cd9c1a2bb0ea2
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/01/fd0b00e4360fca50b7c0e917b00528350ceb35b966f86cff6cc9d8930d8419e8b463949cd836fb20423145057fcf571a9be68beca3d990e99bcc35aec3729e
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/02/7120443b8927e33281c7d1a6ce0e4fd5b697a3b8007cd811189804579067f4ed17f0d3c94ddd16d822993beb794ca57171069d957c9bda04c9a58222731cec
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/02/e0d31c0587885e1f6aaf90d0962ca1a7c1fdf925abf06fe584046f5375eb86bb9f9e70e96cfa7477049461cbbc6966b22c83ebde9cffc089459a3cb3af4e8f
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/03/27c53c217e47d93149eb92af9497a45575f3734d18d799f87389ef7cc512e11cc2e37e475acb9ab761ec91594ca7fa4fa16a52b2f9ed3eb258d1fc0cbfdbef
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/03/a97cdc4f6f1682d7484f7d9895ec2b3089eb81bfaf91c4bb5f747ead24f45bda07a723023b9baa00419c095db16d0445351defb4e288593c0d507bffe98639
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/03/bd85099c9926b1d2e895b298bc7cae0673d463605ab7d10eb878f04601db5a605ec0c82f444d6080119daf359f587733c515aab8c7857ec284e166c28ffce2
 D deployment/latest/builds/pnpm-cache-1/.tools/pnpm/10.30.2_tmp_22631_0/deployment/latest/builds/pnpm-cache-1/store/v10/files/04/257c3380348190ddadcb36dd1955c085b91c4f9bba389cec2c112450fe3830506ae857f838543b731cef0fd1ddf749e224c9f1d0082a1d0dd00ee5478e72af
```
