╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   TITANE∞ v15.1 — GUIDE DE TEST CHAT IA                                    ║
║   Validation rapide du fix "réponse qui disparaît"                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
🚀 TEST RAPIDE (5 minutes)
═══════════════════════════════════════════════════════════════════════════════

1️⃣ LANCER L'APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Terminal:
```bash
npm run tauri:dev
```

Attendre que l'interface charge complètement.

2️⃣ OUVRIR LE CHAT IA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Cliquer sur l'icône Chat / IA dans l'interface
• Vérifier que la fenêtre de chat s'ouvre

3️⃣ TEST DE BASE : UN MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dans le chat, envoyer:
```
Bonjour TITANE, peux-tu me confirmer que tu fonctionnes correctement ?
```

✅ ATTENDU:
• Votre message apparaît dans le chat
• Un spinner "TITANE réfléchit..." s'affiche
• Une réponse IA apparaît
• ⚠️ CRITIQUE: La réponse IA RESTE VISIBLE (ne disparaît PAS)

❌ SI LA RÉPONSE DISPARAÎT → Le bug n'est pas résolu, réouvrir le ticket

4️⃣ TEST STABILITÉ : 3 MESSAGES CONSÉCUTIFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Envoyer ces 3 messages l'un après l'autre:

Message 1:
```
Compte jusqu'à 3 en français
```

Message 2:
```
Maintenant en anglais
```

Message 3:
```
Maintenant en espagnol
```

✅ ATTENDU:
• Vous voyez 6 messages au total (3 user + 3 IA)
• TOUS les messages restent visibles
• Aucun message ne disparaît
• Vous pouvez scroller et voir l'historique complet

❌ SI UN MESSAGE DISPARAÎT → Bug toujours présent

5️⃣ TEST CHANGEMENT DE MODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si votre interface a un sélecteur de mode (default, brainstorming, etc.):

1. Envoyer un message en mode "default"
2. Attendre la réponse
3. Changer vers mode "brainstorming"
4. Envoyer un nouveau message
5. Revenir au mode "default"

✅ ATTENDU:
• L'historique de chaque mode est sauvegardé
• Quand vous revenez à un mode, vous retrouvez les messages précédents
• Pas de crash, pas de perte de données

═══════════════════════════════════════════════════════════════════════════════
🧪 TESTS AVANCÉS (Optionnels)
═══════════════════════════════════════════════════════════════════════════════

6️⃣ TEST SPAM RAPIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Envoyer rapidement 5 messages courts:
```
Test 1
Test 2
Test 3
Test 4
Test 5
```

✅ ATTENDU:
• Les messages sont envoyés avec debounce (300ms)
• Certains peuvent être ignorés si trop rapides (normal)
• Aucun crash
• Les réponses reçues restent visibles

7️⃣ TEST PROVIDER FALLBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Si vous avez configuré Gemini:
• Envoyer un message (devrait utiliser Gemini)

Si Gemini n'est PAS configuré:
• Le système doit fallback sur Ollama ou Local
• Vous devez voir un message IA quand même (même basique)

✅ ATTENDU:
• Pas de crash si provider indisponible
• Message clair si aucun provider configuré
• Fallback automatique fonctionnel

8️⃣ TEST CONSOLE (Pour les devs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ouvrir DevTools (F12 ou Ctrl+Shift+I)

Envoyer un message et observer la console:

✅ ATTENDU:
```
╔════════════════════════════════════════════════════════════╗
║  USE CHAT v15: Initialization (Composition Hook)           ║
╚════════════════════════════════════════════════════════════╝

═════════════════════════════════════════════════════════════
💬 USE CHAT v24.20: Send message start (cached + debounced)
📝 Content: "..."
🎯 Mode: default
═════════════════════════════════════════════════════════════

✅ User message added + saved (total: 1)
🚀 Calling generate() [Cache MISS]...
✅ Response received
✅ AI response added + saved (total: 2)
🎉 USE CHAT v24.20: Message processed successfully!
```

❌ NE PAS VOIR:
```
🚨 CRITICAL: Messages were reset!
🔄 USE CHAT v24.20: Mode changed (répété plusieurs fois)
```

═══════════════════════════════════════════════════════════════════════════════
📋 CHECKLIST VALIDATION
═══════════════════════════════════════════════════════════════════════════════

Cocher après validation:

TESTS DE BASE:
□ Application lance sans erreur
□ Chat IA s'ouvre correctement
□ 1 message envoyé → réponse visible ET persistante
□ 3 messages consécutifs → tous visibles
□ Aucun message ne disparaît

TESTS AVANCÉS:
□ Changement de mode fonctionne
□ Historique sauvegardé par mode
□ Spam rapide géré (debounce)
□ Fallback providers OK
□ Console propre (pas d'erreur critique)

PROD (Si build):
□ npm run tauri:build réussit
□ Binary lance depuis .desktop
□ Chat IA fonctionne en mode offline
□ Messages persistent après restart

═══════════════════════════════════════════════════════════════════════════════
🐛 SIGNALER UN PROBLÈME
═══════════════════════════════════════════════════════════════════════════════

Si un test échoue, fournir:

1. Console logs (F12 → Console → copier)
2. Scénario exact (steps pour reproduire)
3. Mode utilisé (dev / prod)
4. Provider configuré (Gemini / Ollama / Local)
5. Screenshot si possible

═══════════════════════════════════════════════════════════════════════════════
✅ RÉSULTAT ATTENDU FINAL
═══════════════════════════════════════════════════════════════════════════════

Après ces tests, le Chat IA doit être:

✅ Stable (messages ne disparaissent jamais)
✅ Persistant (historique sauvegardé)
✅ Robuste (pas de crash)
✅ Utilisable (UX fluide)

Si TOUS les tests passent → Bug résolu, Chat IA 100% opérationnel ! 🎉

════════════════════════════════════════════════════════════════════════════════
