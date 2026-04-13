# TITANE∞ — HA Runbook d'exploitation
> Version: 2026-04-12 | Scope: Linux systemd + Android + Ollama

---

## 1. Vue d'ensemble

Ce runbook couvre les opérations d'exploitation courantes pour maintenir TITANE∞ en disponibilité maximale. Arbre décisionnel rapide :

```
Problème détecté
    │
    ├─ TITANE ne répond plus → §3
    ├─ Ollama HS / modèle absent → §4
    ├─ Android service tué → §5
    ├─ Storm de redémarrage → §6
    └─ Bruit d'alertes → §7
```

**Temps opérateur cible** : chaque section < 30 minutes.

---

## 2. Diagnostic initial (< 5 min)

```bash
# 1 — Dashboard global
bash scripts/health/health-dashboard.sh

# 2 — Contrat de santé JSON
bash scripts/health/health-contract.sh

# 3 — Alertes en cours
bash scripts/health/alert-engine.sh --dry-run
```

**Codes de sortie :**

| Exit | Global status | Action |
|------|--------------|--------|
| 0    | healthy      | RAS    |
| 1    | degraded     | §3 ou §4 selon service concerné |
| 2    | critical     | Stop-the-line → §3 + §4 en parallèle |

---

## 3. TITANE∞ process —  redémarrage / diagnostic

### 3.1 Redémarrage rapide (service systemd installé)

```bash
systemctl --user restart titane-infinity.service
systemctl --user status titane-infinity.service
```

### 3.2 Redémarrage manuel (service non encore installé)

```bash
# Trouver le binaire
BINARY=$(find ~/.local/bin /usr/local/bin runtime/stable \
  -name "titane-infinity" -type f 2>/dev/null | head -n1)

# Lancer en arrière-plan avec log
nohup "$BINARY" >> ~/.titane/logs/titane.log 2>&1 &
echo "PID=$!"
```

### 3.3 Installer le service systemd (première fois)

```bash
bash scripts/systemd/install-services.sh install
systemctl --user enable --now titane-infinity.service
```

### 3.4 Inspection des logs crash

```bash
# dernières lignes du journal systemd
journalctl --user -u titane-infinity.service -n 50 --no-pager

# log fichier
tail -100 ~/.titane/logs/titane.log 2>/dev/null

# alertes TITANE
tail -20 ~/.titane/logs/alerts.log 2>/dev/null
```

### 3.5 Critères de résolution

- `systemctl --user is-active titane-infinity.service` → `active`
- `bash scripts/health/health-contract.sh` → exit 0
- `bash scripts/health/alert-engine.sh` → exit 0

---

## 4. Ollama —  service, modèles, latence

### 4.1 Vérification Ollama

```bash
systemctl status ollama.service
curl -sf http://127.0.0.1:11434/api/tags | python3 -m json.tool
```

### 4.2 Redémarrer Ollama (drop-in override appliqué)

```bash
sudo systemctl restart ollama.service
# Attendre le warmup (~30s)
sleep 30
bash scripts/ollama/model-integrity-check.sh
```

### 4.3 Modèle primaire absent (gemma2:2b)

```bash
# Vérifier les modèles présents
ollama list

# Tirer le modèle primaire
ollama pull gemma2:2b

# Vérifier les fallbacks disponibles
bash scripts/ollama/model-integrity-check.sh
```

**Fallback chain (configuré dans `src-tauri/src/ai/ollama.rs`) :**

```
gemma2:2b → llama3.2 → llama3.1 → mistral
```

Si aucun modèle n'est disponible, TITANE bascule en mode dégradé UI mais ne crash pas.

### 4.4 Warmup forcé

```bash
bash scripts/ollama/model-warmup.sh
```

### 4.5 Critères de résolution

- `curl -sf http://127.0.0.1:11434/api/tags` → JSON non vide
- `bash scripts/ollama/model-integrity-check.sh` → exit 0
- `bash scripts/health/alert-engine.sh` → A02 et A03 absents

---

## 5. Android — ForegroundService, WorkManager

### 5.1 Vérifier que le service tourne (via ADB)

```bash
adb shell dumpsys activity services com.titane.infinity/.TitaneForegroundService
```

### 5.2 Redémarrer le service manuellement

```bash
adb shell am startservice -n com.titane.infinity/.TitaneForegroundService
```

### 5.3 Forcer un reboot de l'appareil (relance BootCompletedReceiver)

Le `BootCompletedReceiver` relance automatiquement `TitaneForegroundService` après :
- Reboot normal
- Samsung Quick Boot / `QUICKBOOT_POWERON`

### 5.4 Limites connues — Android (NON CONTOURNABLES)

| Limite | Impact | Documentation |
|--------|--------|---------------|
| `force-stop` par l'utilisateur | Stoppe définitivement la session, BootReceiver ne recouvre PAS après force-stop sans reboot | Android platform limit |
| OEM battery optimizer (Samsung/Xiaomi) | Peut tuer ForegroundService malgré `START_STICKY` | Désactiver "Optimize battery usage" pour TITANE dans les réglages |
| WorkManager interval minimum = 15 min | Resync périodique au minimum toutes les 15 min | `PeriodicWorkRequest.MIN_PERIODIC_INTERVAL_MILLIS` |
| Android 12+ restriction services foreground démarrés en arrière-plan | `ForegroundServiceStartNotAllowedException` possible dans des contextes restreints | Mitigé : démarrage dans `onCreate()` de MainActivity |
| Doze Mode | Réseau restreint en Doze → requêtes Ollama peuvent être différées | `WorkManager` utilise contrainte `NetworkType.CONNECTED` |

---

## 6. Storm de redémarrage (> 5 restarts / 5 min)

### 6.1 Identifier le problème sous-jacent

```bash
# Voir le nombre de redémarrages
systemctl --user show titane-infinity.service --property=NRestarts

# Derniers crash journals
journalctl --user -u titane-infinity.service -n 100 --no-pager | grep -Ei "error|fail|kill|oom"

# Mémoire disponible
free -h
```

### 6.2 Actions

1. **OOM** : libérer de la RAM, réduire `--num-thread` Ollama
2. **Port déjà occupé** : `lsof -i :4000` puis `kill <PID>`
3. **Dépendance manquante** : lancer le binaire manuellement pour voir l'erreur exacte
4. **Corruption** : réinstaller depuis `runtime/stable/*.AppImage`

### 6.3 Reset du compteur systemd après correction

```bash
systemctl --user reset-failed titane-infinity.service
systemctl --user start titane-infinity.service
```

---

## 7. Réduction du bruit d'alertes

### 7.1 Silence temporaire des notifications desktop

```bash
# Désactiver notify-send pour 1 heure
echo "ALERT_ENGINE_QUIET=1" >> ~/.titane/env
# Réactiver
grep -v ALERT_ENGINE_QUIET ~/.titane/env > /tmp/.titane_env && mv /tmp/.titane_env ~/.titane/env
```

### 7.2 Archive et rotation du log d'alertes

```bash
mv ~/.titane/logs/alerts.log ~/.titane/logs/alerts.$(date +%Y%m%d).log
touch ~/.titane/logs/alerts.log
```

---

## 8. Installation complète (nouvelle machine)

```bash
# 1. Prérequis
sudo apt install -y ollama curl systemd

# 2. Installer les services systemd TITANE
bash scripts/systemd/install-services.sh install

# 3. Override Ollama
sudo cp scripts/systemd/ollama.service.d/titane.conf /etc/systemd/system/ollama.service.d/
sudo systemctl daemon-reload
sudo systemctl restart ollama.service

# 4. Warmup modèles
bash scripts/ollama/model-warmup.sh

# 5. Vérification initiale
bash scripts/health/health-dashboard.sh
bash scripts/health/chaos-scenarios.sh
```

---

## 9. Vérification post-incident (checklist)

```
[ ] bash scripts/health/health-contract.sh     → exit 0
[ ] bash scripts/health/alert-engine.sh        → exit 0
[ ] bash scripts/health/chaos-scenarios.sh     → PASS=6 FAIL=0
[ ] bash scripts/autoheal/detect_recurrence.sh → PASS
[ ] bash scripts/verify_instructions.sh        → PASS
```

---

## 10. Contacts et escalade

- **Repo** : https://github.com/KallokTherok1994/TITANE_INFINITY
- **Branch** : MAIN
- **Governance kernel** : `.github/copilot-instructions.md`
- **AutoHeal registry** : `scripts/autoheal/autoheal_rules.jsonl`

Si blocage > 30 min : créer une entrée `BLOCKED` dans `autoheal_rules.jsonl` avec `next_action` horodatée.
