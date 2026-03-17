# TITANE∞ — Glossaire

**Statut :** DOC_ONLY (définitions terminologiques canoniques)  
**Date :** 2026-03-17  
**Verrouillage bilingue :** Voir `GLOSSARY_FR_EN_LOCK.md`

---

## A

**Allowlist**  
Liste blanche contrôlée des commandes IPC Tauri que le frontend est autorisé à invoquer. Localisée dans `src-tauri/allowlist.whitelist.stable.json`. Toute commande absente de l'allowlist est bloquée au niveau Tauri.

**Architecture 4-Ring**  
Le modèle architectural par couches utilisé dans TITANE∞. Ring 1 (types, pas d'I/O) → Ring 2 (engines, logique pure) → Ring 3 (services, I/O gouvernée) → Ring 4 (couche UI + OS/IPC). Aucune importation inverse entre les rings n'est autorisée.

**AutoHeal**  
Le système de registre d'auto-réparation automatisée. Chaque correctif est capturé comme entrée JSON dans `scripts/autoheal/autoheal_rules.jsonl`. Le gate `detect_recurrence.sh` vérifie qu'aucune règle n'a été silencieusement violée.

**Autorité canonique**  
Voir : **Source canonique de vérité**.

---

## B

**Bannière legacy**  
Bloc de texte en tête d'un document obsolète indiquant son statut et pointant vers le document canonique courant.

**Bilingue (parité bilingue)**  
L'exigence que la documentation FR et EN maintienne un alignement structurel. Aucune divergence sémantique silencieuse n'est acceptée.

---

## C

**Canon / Canonique**  
Un document, fichier ou affirmation qui est la source d'autorité de référence pour un sujet donné. Les sources canoniques prévalent sur toute documentation contradictoire.

**Source canonique de vérité**  
L'unique source faisant autorité pour un fait donné (version, affirmation d'architecture, résultat de gate). Dans TITANE∞, `package.json` est la source canonique de la version produit.

**Contrôle de frontière**  
Une surface réseau ou I/O explicitement gouvernée par l'architecture. Dans TITANE∞, la frontière IPC entre le frontend et le backend Tauri est la frontière contrôlée principale.

---

## D

**DOC_ONLY**  
Étiquette de statut indiquant qu'une affirmation est documentée mais n'a aucune preuve d'exécution directe dans le dépôt.

---

## E

**E2E (test de bout en bout)**  
Tests qui exercent la pile d'application complète de l'UI au backend. TITANE∞ utilise Playwright (E2E navigateur) et WDIO (desktop Tauri E2E). Le full E2E est désactivé par défaut (`FULL_E2E_ENABLED=false`).

---

## F

**Fallback local**  
Comportement de repli activé quand les fournisseurs en ligne sont indisponibles. Requis par la politique online-first gouvernée. Voir : **Mode dégradé**.

**Fallback honnête**  
Un fallback qui rapporte avec précision son état dégradé à l'utilisateur, plutôt que de présenter silencieusement une fausse réponse de succès. Requis par le contrat IPC.

**Frontière contrôlée**  
Voir : **Contrôle de frontière**.

---

## G

**Gate**  
Un script de vérification qui doit passer avant qu'une action gouvernée puisse se poursuivre. Exemples : `scripts/verify_instructions.sh`, `scripts/autoheal/detect_recurrence.sh`.

**Gouverné**  
Un processus, appel réseau ou capacité soumis aux règles de gouvernance TITANE∞ (gates, exigences de preuve, contrats IPC).

**Gouvernance**  
L'ensemble des règles, gates, disciplines de preuve et standards documentaires qui régissent le développement, la release et l'exploitation de TITANE∞.

---

## I

**IPC (Communication Inter-Processus)**  
Le canal de communication entre le frontend React et le backend Rust Tauri. Les payloads IPC doivent respecter le contrat : `{ ok: boolean, content?: string, error?: {...} }`.

**Contrat IPC**  
La spécification formelle du format de payload IPC. Défini dans `docs/IPC_CONTRACT.md`. Règle clé : aucun échec silencieux, aucune réponse mensongère.

---

## L

**Local-first (marqueur de compatibilité)**  
Le label "local-first" dans certains fichiers est un **marqueur de compatibilité uniquement** — il ne signifie pas que le produit fonctionne en mode local-first en pratique. La doctrine active est **online-first gouverné avec fallback local obligatoire**.

**Legacy doc**  
Un fichier de documentation qui n'est plus d'actualité mais est conservé pour la traçabilité historique. Les docs legacy doivent avoir une bannière indiquant leur statut et pointant vers le doc canonique courant.

---

## M

**Marqueur de compatibilité**  
Voir : **Local-first (marqueur de compatibilité)**.

**Mode dégradé**  
Un état d'exécution où l'application fonctionne avec une capacité réduite suite à un échec de fournisseur, une indisponibilité réseau ou un problème de configuration. Statut : PARTIAL.

---

## O

**Online-first gouverné**  
La doctrine de politique réseau de TITANE∞. L'application suppose et nécessite une connectivité réseau pour les opérations principales du fournisseur IA. Un fallback local obligatoire doit être disponible.

**OS cognitif**  
Le cadrage produit de TITANE∞ — une application desktop agissant comme un "système d'exploitation cognitif" pour les interactions IA. Voir `README.md`. Statut : DOC_ONLY (cadrage marketing).

---

## P

**Pack de preuve**  
Un répertoire sous `proof_packs/` contenant des artefacts (VERDICT.md, ROLLBACK.md, sorties de gates) qui prouvent qu'une session gouvernée a été complétée correctement.

**PLANNED**  
Étiquette de statut indiquant une fonctionnalité ou comportement documenté comme intention future mais non implémenté actuellement.

**PROVEN**  
Étiquette de statut indiquant qu'une affirmation est directement vérifiable dans le dépôt.

**Proof-driven (piloté par la preuve)**  
La posture de développement exigeant que les affirmations soient soutenues par des preuves vérifiables avant d'être déclarées PASS ou complètes.

---

## R

**Registre append-only**  
Un fichier de registre où les entrées sont seulement ajoutées, jamais supprimées ni réécrites. Utilisé pour la traçabilité de gouvernance. Statut : PARTIAL — tous les registres ne sont pas forcés append-only au niveau outillage.

**Ring**  
Voir : **Architecture 4-Ring**.

**Rollback**  
Un ensemble explicite de commandes `git restore` permettant d'annuler un changement donné. Requis pour chaque session gouvernée.

**Runtime-proven**  
Une affirmation ou comportement vérifié dans une exécution réelle (pas seulement une revue de code ou de la documentation). Distinct de DOC_ONLY.

---

## S

**Stop-the-line**  
Une règle de gouvernance exigeant que le travail s'arrête immédiatement quand un gate critique échoue, qu'un invariant est violé, ou qu'une contradiction reste non résolue.

---

## T

**Tauri-only**  
La contrainte de runtime de production : TITANE∞ est une application desktop Tauri. Pas de serveur web, pas d'Electron, pas de HTTP frontend direct. Tout I/O passe par l'IPC Tauri.

**Modèle de vérité**  
La politique documentaire de TITANE∞ exigeant que chaque affirmation soit classée par son statut de preuve (PROVEN, PARTIAL, DOC_ONLY, etc.) et que les contradictions soient nommées explicitement.

---

## U

**User-facing (orienté utilisateur)**  
Une fonctionnalité, comportement ou document destiné aux utilisateurs finaux (pas aux développeurs ou mainteneurs).

---

## V

**Autorité de version**  
La source canonique déterminant la version courante du produit. Dans TITANE∞ : `package.json`.

---

*Généré : 2026-03-17 | Voir aussi : `GLOSSARY_FR_EN_LOCK.md` pour le mapping terminologique bilingue*
