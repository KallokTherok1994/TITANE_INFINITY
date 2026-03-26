# 05 BUILD ENV TRUTH MAP
| Tool       | Installed      | Required       | Status  |
|------------|----------------|----------------|---------|
| node       | v18.19.1       | >=20.0.0       | BLOCKED |
| pnpm       | 9.15.5         | ^9.0.0         | PASS    |
| cargo      | 1.85.0-stable  | (implicit)     | PASS    |
| rustc      | 1.85.0         | (implicit)     | PASS    |
| tauri-cli  | 2.10.0         | ^2             | PASS    |
| DISPLAY    | :1             | required       | PASS    |
| Xvfb       | /usr/bin/Xvfb  | required       | PASS    |

## Primary blocker
G_PNPM_BUILD=FAIL: Vite 7.3.1 uses crypto.hash() which requires Node >=21.7
engine-strict=true in .npmrc — build rejected at pnpm install AND at Vite runtime

## Next action (<30 min)
Install Node >=22:
  nvm install 22 && nvm use 22
  OR: fnm install 22 && fnm use 22
  Then: pnpm install && pnpm build
