# 12 - Commands Used

Core commands used in V66:

```bash
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD
git rev-parse origin/MAIN
git rev-list --left-right --count origin/MAIN...HEAD
git status --porcelain=v1
git diff --name-only
git ls-files --others --exclude-standard
node -e 'const fs=require("fs");const p=JSON.parse(fs.readFileSync("package.json","utf8"));process.stdout.write(p.scripts&&p.scripts.build?"PASS":"FAIL")'
bash scripts/autoheal/detect_recurrence.sh
bash scripts/verify_instructions.sh
pnpm -s verify:registry
```

Not executed due to strict HOLD:
- `git commit`
- `git push`
- `pnpm run build:production`
- `./mega-deploy.sh`
