# 08 Expected Vs Observed UI

| Marqueur UI | Attendu | Observé runtime | Criticité | Statut | Preuve |
|-------------|---------|-----------------|-----------|--------|--------|
| app root monte correctement | Root React actif | `rootChildCount=3` | Critique | PASS | `artifacts/run2/v12-ui-runtime-run2.json` |
| shell principal visible | AppShell + TopNav visibles | `shellVisible=true`, `nav-top-main` présent | Critique | PASS | `artifacts/run2/screens/run2-initial-shell.png` |
| dashboard/surface canonique visible | `/titane` rendu | `href=tauri://localhost/titane` | Critique | PASS | `artifacts/run3/v12-ui-runtime-run3.json` |
| theme cohérent | thème dark stable | `theme=dark` | Haute | PASS | `artifacts/run4/v12-ui-runtime-run4.json` |
| sidebar/topbar non cassées | top navigation exploitable | TopNav height stable à 64px | Haute | PASS | `artifacts/run2/v12-ui-runtime-run2.json` |
| zone centrale utilisable | panneau central actif | `mainRect.height=1200` + réponse visible | Critique | PASS | `artifacts/run3/screens/run3-after-response.png` |
| input principal visible | `chat-input` présent | `chatInputVisible=true` | Critique | PASS | `artifacts/run2/v12-ui-runtime-run2.json` |
| action principale possible | envoi possible | `sendTriggered=true` | Critique | PASS | `artifacts/run4/screens/run4-after-input.png` |
| feedback/réponse visible | réponse assistant visible | `chatResponseVisible=true` | Critique | PASS | `artifacts/run4/screens/run4-after-response.png` |
| absence overlay bloquant | pas d'écran superposé | `overlayAbsent=true` | Haute | PASS | `artifacts/run3/v12-ui-runtime-run3.json` |
| absence clipping critique | shell exploitable | aucun clipping critique observé | Haute | PASS | `artifacts/run2/screens/run2-initial-shell.png` |
| absence écran parasite | onboarding/fatal absent | `onboardingAbsent=true` | Critique | PASS | `artifacts/run4/v12-ui-runtime-run4.json` |
