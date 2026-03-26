# V25 Chat Baseline Scenario

Canonical question used:
- `Parle-moi de tes modules actifs et de l'etat de ton orchestrateur.`

Scenario steps:
1. Open TITANE real surface.
2. Capture S1 before typing.
3. Fill input with canonical question.
4. Trigger send through supported path.
5. Wait for processing/reasoning signal.
6. Capture assistant response and runtime badges.
7. Capture final stabilized state.

Observed:
- `inputTyped=true`
- `sendEnabledAfterTyping=true`
- `sendClicked=true`
- `responseReceived=true`
- `responseText="Mode OFFLINE_SIM actif. Reponse hors ligne deterministe."`

Outcome:
- Flow executes end-to-end visually.
- Response content demonstrates degraded simulated mode, not healthy real provider/orchestrator response.

## Postbuild rerun

- Run: `run_chat_postbuild`
- Exit: `RC=0`
- Same canonical question
- Same final assistant response text: `Mode OFFLINE_SIM actif. Reponse hors ligne deterministe.`

Stability:
- Degraded response is reproducible before and after rebuild.
