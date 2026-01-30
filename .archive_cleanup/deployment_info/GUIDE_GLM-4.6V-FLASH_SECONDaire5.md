# Guide Simple pour GLM-4.6V-Flash (Vision + Texte) - Niveau Secondaire 5

Bienvenue ! Ce guide t'explique comment installer et utiliser **GLM-4.6V-Flash**, un modèle d'IA qui comprend à la fois le texte et les images. C'est comme un robot intelligent qui peut lire des mots et regarder des photos pour répondre à tes questions. Tout se fait sur ton ordinateur (local), pas besoin d'internet pour l'utiliser une fois installé.

Ce guide est fait pour toi, élève de secondaire 5. On explique tout simplement, pas de mots compliqués sans explication. Si un mot technique arrive, on le définit en une phrase.

**Important :** Tout est local d'abord. Le cloud (comme Google Cloud) est optionnel plus tard si tu veux partager ton IA avec d'autres.

## ⚠️ Utilisation Responsable (Niveau Secondaire)

- Ne partage pas d'infos personnelles (nom, adresse) avec l'IA.
- N'utilise pas l'IA pour des décisions médicales ou légales (elle peut se tromper).
- Les images : utilise seulement tes photos ou publiques ; pas celles d'autres sans permission.
- L'IA n'est pas toujours vraie : vérifie les réponses importantes.

## 1. C'est quoi GLM-4.6V-Flash ?

GLM-4.6V-Flash est un **modèle de langage** créé par des chercheurs chinois (THUDM). Un modèle de langage est comme un programme qui apprend à parler et comprendre le texte, mais celui-ci peut aussi regarder des images pour mieux répondre. "Flash" signifie qu'il est rapide et efficace.

Il peut :

- Répondre à des questions en texte.
- Analyser une photo que tu lui donnes (ex. : "Qu'est-ce qu'il y a sur cette image ?").
- Faire des calculs ou appeler des outils (on verra ça plus tard).

C'est open-source (gratuit et modifiable), et on l'utilise via des APIs (interfaces) comme celles d'OpenAI, mais en local.

> 📘 _API : Interface pour parler à l'IA, comme une porte d'entrée._

## 2. Matériel et Prérequis

Avant de commencer, vérifie ton ordinateur. GLM-4.6V-Flash a besoin de puissance pour tourner vite.

### Ordinateur Requis

- **CPU (processeur) :** Au moins 4 cœurs modernes (comme Intel i5 ou AMD Ryzen 5). Plus c'est mieux.
- **RAM (mémoire) :** Minimum 16 Go. Idéal 32 Go ou plus.
- **Carte graphique (GPU) :** Optionnelle mais recommandée pour la vitesse. Une NVIDIA avec au moins 8 Go VRAM (mémoire vidéo). Si pas de GPU, ça marche au ralenti sur CPU.
- **Espace disque :** 20 Go libres pour le modèle et les fichiers.
- **Système :** Windows 10+, Linux (Ubuntu recommandé), ou macOS (avec M1/M2 pour Apple Silicon).

**VRAM** : Mémoire de la carte graphique. GLM-4.6V-Flash a besoin d'environ 8-16 Go VRAM pour bien tourner avec images.

Si ton ordinateur est vieux, ça sera lent, mais ça fonctionne toujours.

### Logiciels de Base

- **Python 3.10+** : Langage de programmation pour l'IA. (On l'installe si pas déjà là.)
- **Git** : Outil pour télécharger du code depuis internet.
- **Virtual Environment (venv)** : Un "environnement virtuel" pour isoler les programmes Python, comme une boîte séparée pour éviter les conflits.

## 3. Installation (Python, Git, venv)

On installe les bases. Fais une étape à la fois.

### Étape 1 : Installer Python

Python est déjà installé sur la plupart des ordinateurs modernes. Vérifie :

**Comment ouvrir un terminal ?**

- **Windows :** Recherche "PowerShell" ou "Invite de commandes" dans le menu Démarrer.
- **Linux :** Recherche "Terminal" dans les applications.
- **macOS :** Recherche "Terminal" dans Spotlight (cmd + espace).

Dans le terminal ouvert, tape les commandes ci-dessous.

- **Windows :** Ouvre PowerShell ou Invite de commande. Tape : `python --version`
- **Linux/macOS :** Ouvre Terminal. Tape : `python3 --version`

✅ Si tu vois "Python 3.10" ou plus, c'est bon.

❌ Si pas installé :

- **Windows :** Va sur python.org, télécharge la version 3.11, installe avec "Add to PATH".
- **Linux :** `sudo apt update && sudo apt install python3 python3-venv` (Ubuntu).
- **macOS :** Installe via Homebrew (`brew install python`) ou télécharge sur python.org.

### Étape 2 : Installer Git

Git télécharge le code.

- **Windows :** Télécharge sur git-scm.com, installe.
- **Linux :** `sudo apt install git`
- **macOS :** `brew install git` ou télécharge.

Vérifie : `git --version`

✅ OK si version affichée.

### Étape 3 : Créer un Dossier Projet

Crée un dossier pour tout ranger.

- **Windows :** Clic droit dans Explorateur > Nouveau dossier > "GLM-Projet"
- **Linux/macOS :** `mkdir GLM-Projet && cd GLM-Projet`

Tous les fichiers iront là.

### Étape 4 : Créer un Environnement Virtuel (venv)

Pour isoler Python.

- **Windows :** `python -m venv glm-env`
- **Linux/macOS :** `python3 -m venv glm-env`

Active-le :

- **Windows :** `glm-env\Scripts\activate` (PowerShell) ou `glm-env\Scripts\activate.bat` (cmd)
- **Linux/macOS :** `source glm-env/bin/activate`

✅ Tu dois voir "(glm-env)" au début de la ligne de commande.

❌ Si erreur : Vérifie Python installé.

## 4. Installation des Librairies (Torch + CUDA Optionnel, vLLM + Clients)

Maintenant, on installe les outils pour l'IA.

### Étape 1 : Mettre à Jour pip

Pip est l'installateur Python.

Dans ton venv activé : `python -m pip install --upgrade pip`

### Étape 2 : Installer PyTorch (avec CUDA si GPU)

PyTorch est la base pour l'IA. CUDA est pour accélérer sur GPU NVIDIA.

> 📘 _CUDA : Logiciel spécial pour faire tourner l'IA plus vite sur les cartes graphiques NVIDIA._

- **Si tu as une NVIDIA GPU :** `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121` (pour CUDA 12.1)
- **Si pas de GPU ou autre carte :** `pip install torch torchvision torchaudio`

Vérifie : `python -c "import torch; print('CUDA disponible :', torch.cuda.is_available())"`

✅ Si GPU : "CUDA disponible : True". Sinon False, mais OK.

### Étape 3 : Installer vLLM et Autres

vLLM sert le modèle via une API rapide.

`pip install vllm openai transformers datasets peft accelerate bitsandbytes`

- **vLLM** : Serveur pour l'IA.
- **OpenAI** : Client pour tester comme si c'était ChatGPT.
- **Transformers** : Bibliothèque pour modèles IA.
- **Datasets, PEFT, Accelerate, bitsandbytes** : Pour le fine-tuning (on verra).

Ça peut prendre du temps.

## 5. Télécharger / Accéder au Modèle

Le modèle est sur Hugging Face (site de partage d'IA).

### Étape 1 : Créer un Compte Hugging Face

Va sur huggingface.co, inscris-toi gratuitement. Ça permet de télécharger des gros fichiers.

### Étape 2 : Générer un Token

Dans ton profil HF > Settings > Access Tokens > Nouveau token (read, pas write). Copie-le.

### Étape 3 : Se Connecter

Dans ton venv : `huggingface-cli login`

Colle ton token quand demandé.

### Étape 4 : Télécharger le Modèle

Le modèle s'appelle "THUDM/glm-4v-9b" (version vision).

Il se met en cache automatiquement. Pour forcer : `python -c "from transformers import AutoModel; AutoModel.from_pretrained('THUDM/glm-4v-9b')"`

✅ Ça télécharge (~20 Go), attends.

❌ Si erreur 401 : Token invalide, recommence login.

## 6. Lancer un Serveur Local (vLLM et Option SGLang)

Le serveur rend l'IA accessible via API.

### Option GPU (Recommandée)

`python -m vllm.entrypoints.openai.api_server --model THUDM/glm-4v-9b --host 0.0.0.0 --port 8000 --trust-remote-code`

- **trust-remote-code** : Permet d'exécuter du code du modèle (sécurisé).

### Option CPU (Plus Lente)

`python -m vllm.entrypoints.openai.api_server --model THUDM/glm-4v-9b --host 0.0.0.0 --port 8000 --trust-remote-code --dtype float32`

Lance dans une nouvelle fenêtre Terminal (venv activé).

✅ Tu vois "Uvicorn running on http://0.0.0.0:8000". Le serveur est prêt.

❌ Si erreur VRAM : Réduit avec `--max-model-len 2048` (limite longueur texte).

**Option Alternative :** SGLang (plus rapide pour vision). `pip install sglang` puis `python -m sglang.launch_server --model THUDM/glm-4v-9b --port 8000`

## 7. Premier Test Texte

Test simple avec texte.

Crée un fichier `test_text.py` dans ton dossier :

```python
import openai

client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="THUDM/glm-4v-9b",
    messages=[{"role": "user", "content": "Salut, comment ça va ?"}]
)

print(response.choices[0].message.content)
```

Lance : `python test_text.py`

✅ Réponse comme "Salut ! Ça va bien, merci."

#### Si ça ne marche pas du premier coup

❌ Erreur : "Connection refused" ou "localhost:8000"
🛠️ Solution : Vérifie que le serveur tourne dans une autre fenêtre. Si pas, relance la commande du serveur.
🧠 Explication : Le script parle au serveur IA ; si le serveur n'est pas démarré, ça échoue.

❌ Erreur : "ModuleNotFoundError: No module named 'openai'"
🛠️ Solution : Active ton venv avec `glm-env\Scripts\activate` (Windows) ou `source glm-env/bin/activate` (Linux/macOS).
🧠 Explication : Les librairies sont dans l'environnement virtuel ; active-le d'abord.

## 8. Premier Test Vision (avec Image)

Maintenant, avec une image. GLM peut analyser des photos.

Prépare une image petite (ex. photo.jpg dans le dossier).

Crée `test_vision.py` :

```python
import openai
import base64

# Encode image en base64
with open("photo.jpg", "rb") as f:
    img_data = base64.b64encode(f.read()).decode()

client = openai.OpenAI(base_url="http://localhost:8000/v1", api_key="dummy")

response = client.chat.completions.create(
    model="THUDM/glm-4v-9b",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Décris cette image."},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_data}"}}
        ]
    }]
)

print(response.choices[0].message.content)
```

Lance : `python test_vision.py`

✅ Description de l'image.

❌ Si erreur format : Image doit être JPEG/PNG, <5MB.

#### Si ça ne marche pas du premier coup

❌ Erreur : "FileNotFoundError: No such file or directory: 'photo.jpg'"
🛠️ Solution : Mets une image appelée `photo.jpg` dans le même dossier que le script.
🧠 Explication : Le script cherche une image ; ajoute une photo réelle.

❌ Erreur : "Connection refused" ou "localhost:8000"
🛠️ Solution : Vérifie que le serveur tourne dans une autre fenêtre.
🧠 Explication : Même que pour test_text.py ; serveur IA doit tourner.

❌ Erreur : "base64 decode error" ou image non décrite
🛠️ Solution : Utilise une image JPEG/PNG petite (<1MB).
🧠 Explication : Le modèle ne gère pas tous les formats ; convertis si besoin.

## 9. Comprendre Tool Calling + Mini Exemple

**Tool calling** : L'IA peut appeler des "outils" (programmes) pour faire des actions, comme une calculatrice.

Exemple : IA calcule 2+2 en appelant un outil Python.

Dans API : Ajoute "tools" dans la requête.

Mini exemple dans test :

```python
# Ajoute dans messages
tools = [{
    "type": "function",
    "function": {
        "name": "calculatrice",
        "description": "Calcule une expression mathématique",
        "parameters": {"type": "object", "properties": {"expr": {"type": "string"}}}
    }
}]

response = client.chat.completions.create(
    model="THUDM/glm-4v-9b",
    messages=[{"role": "user", "content": "Calcule 5*3"}],
    tools=tools
)

if response.choices[0].message.tool_calls:
    # Appelle ta fonction calculatrice ici
    print("Appel outil :", response.choices[0].message.tool_calls[0].function.name)
```

L'IA décide quand appeler l'outil.

## 10. Fine-Tuning Léger (LoRA/QLoRA)

Fine-tuning : Entraîner l'IA sur tes données pour la spécialiser.

On utilise LoRA (Low-Rank Adaptation) : Modifie peu le modèle pour économiser mémoire.

> 📘 _LoRA : Méthode pour ajuster l'IA sans tout changer, comme coller un patch sur un programme._

### 10.1 Préparer Dataset JSONL

Dataset : Fichier texte avec exemples.

> 📘 _JSON : Format simple pour stocker des données, comme une liste de questions-réponses._

Crée `dataset.jsonl` :

```jsonl
{"messages": [{"role": "user", "content": "Salut"}, {"role": "assistant", "content": "Bonjour !"}]}
{"messages": [{"role": "user", "content": "Comment t'appelles-tu ?"}, {"role": "assistant", "content": "Je suis GLM fine-tuné."}]}
```

Ajoute 10-20 exemples.

### 10.2 Script d'Entraînement

Crée `finetune_lora.py` :

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model
from datasets import load_dataset

model_name = "THUDM/glm-4v-9b"
model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True, load_in_4bit=True)  # QLoRA pour économiser RAM
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

# Config LoRA
lora_config = LoraConfig(
    r=16,  # Rang LoRA
    lora_alpha=32,
    target_modules=["query_key_value"],  # Modules à modifier (vérifie pour GLM)
    lora_dropout=0.1
)
model = get_peft_model(model, lora_config)

# Dataset
dataset = load_dataset("json", data_files="dataset.jsonl")["train"]

# Entraînement
training_args = TrainingArguments(
    output_dir="./lora-output",
    num_train_epochs=3,
    per_device_train_batch_size=1,
    save_steps=500,
    logging_steps=10,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    tokenizer=tokenizer,
)

trainer.train()
model.save_pretrained("./lora-model-v1")  # Sauvegarde versionnée
```

Lance : `python finetune_lora.py` (prend du temps, heures sur GPU).

#### Si ça ne marche pas du premier coup

❌ Erreur : "CUDA out of memory" ou "OOM"
🛠️ Solution : Réduis batch_size à 1 ou utilise CPU (--no_cuda).
🧠 Explication : Fine-tuning demande beaucoup de mémoire ; GPU avec 8+ Go VRAM requis.

❌ Erreur : "Dataset not found"
🛠️ Solution : Crée dataset.jsonl dans le même dossier avec exemples JSONL valides.
🧠 Explication : Le script charge un fichier dataset ; vérifie le chemin et format.

❌ Erreur : "target_modules invalid"
🛠️ Solution : Change à ["q_proj", "k_proj", "v_proj"] (modules GLM corrects).
🧠 Explication : GLM a des noms de modules différents ; adapte pour le modèle.

### 10.3 Vérifier LoRA

Après entraînement, les poids LoRA sont ajoutés aux modules spécifiés.

🧠 **Ce que le modèle n’apprend pas** : Il n’apprend pas de nouvelles langues ou faits généraux ; seulement tes exemples.

⚠️ **Pourquoi on n’entraîne pas en continu** : Fine-tuning change le modèle ; sauvegarde versions pour revenir en arrière.

### 10.4 Tester Avant/Après

Crée `test_finetuned.py` :

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel

base_model = AutoModelForCausalLM.from_pretrained("THUDM/glm-4v-9b", trust_remote_code=True)
model = PeftModel.from_pretrained(base_model, "./lora-model-v1")
tokenizer = AutoTokenizer.from_pretrained("THUDM/glm-4v-9b", trust_remote_code=True)

inputs = tokenizer("Salut", return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)
print(tokenizer.decode(outputs[0]))
```

Compare avec modèle original.

#### Si ça ne marche pas du premier coup

❌ Erreur : "No module named 'peft'"
🛠️ Solution : Installe PEFT avec `pip install peft`.
🧠 Explication : PEFT est requis pour charger LoRA ; vérifie installation.

❌ Erreur : "FileNotFoundError: ./lora-model-v1"
🛠️ Solution : Lance finetune_lora.py d'abord pour créer le modèle.
🧠 Explication : Le script charge un modèle LoRA sauvegardé ; entraîne-le avant.

### 10.5 Sauvegarde Versionnée

Sauvegarde comme v1, v2... pour tester différentes versions.

## 11. Re-Servir le Modèle Fine-Tuné

Pour utiliser ton modèle modifié.

Option 1 : Charger en Python, comme dans test_finetuned.py.

Option 2 : Si vLLM supporte LoRA : `python -m vllm.entrypoints.openai.api_server --model THUDM/glm-4v-9b --lora-modules lora=./lora-model-v1`

Puis teste via API comme avant.

## 12. Déploiement Simple

Pour une "production" locale basique.

- **Machine dédiée :** Lance le serveur sur un PC toujours allumé.
- **Service systemd (Linux) :** Crée un fichier service pour auto-démarrage.
- **Sécurité :** Limite accès avec firewall (ex. ufw allow 8000). Pas de mot de passe pour local.
- **Reverse proxy :** Optionnel, utilise Nginx pour HTTPS.

Pas de cloud ici ; c'est local.

## 13. Dépannage

### torch/cuda mismatch

❌ Erreur : "CUDA version mismatch"
🛠️ Solution : Réinstalle PyTorch avec la bonne version CUDA (vérifie `nvidia-smi`).

### Manque de VRAM / OOM

❌ Erreur : "Out of memory"
🛠️ Solution : Utilise `--load-in-4bit` ou réduis batch size.

### bitsandbytes fail

❌ Erreur : "bitsandbytes not compatible"
🛠️ Solution : Installe séparément : `pip install bitsandbytes --index-url https://jllllll.github.io/bitsandbytes-windows-webui` (Windows).

### HF token / 401

❌ Erreur : "401 Unauthorized"
🛠️ Solution : `huggingface-cli login` avec bon token.

### vLLM ne démarre pas

❌ Erreur : Port occupé
🛠️ Solution : Change port `--port 8001`.

### Requête OpenAI incompatible

❌ Erreur : Format mauvais
🛠️ Solution : Vérifie messages[] format exact.

### Image trop grosse / format non supporté

❌ Erreur : Image error
🛠️ Solution : Redimensionne image <1MB, format JPEG/PNG.

### Lenteur CPU

❌ Trop lent
🛠️ Solution : Ajoute GPU ou patiente.

### trust_remote_code nécessaire

❌ Erreur sécurité
🛠️ Solution : Ajoute `--trust-remote-code` (risque faible pour modèles connus).

### Windows path / PowerShell

❌ Chemins avec \
🛠️ Solution : Utilise / ou "chemin" pour espaces.

## 14. Mini Checklist "OK Prêt"

- [ ] Python 3.10+ installé et terminal ouvert
- [ ] Git installé
- [ ] venv créé et activé ((glm-env) visible)
- [ ] Librairies installées (torch avec CUDA si GPU)
- [ ] HF token login OK
- [ ] Modèle téléchargé
- [ ] Serveur lance sans erreur (localhost:8000 répond)
- [ ] test_text.py donne réponse texte
- [ ] test_vision.py décrit image (avec photo.jpg présente)
- [ ] Fine-tuning essayé (optionnel, lora-model-v1 créé)
- [ ] test_finetuned.py montre différence (réponse personnalisée)
- [ ] Checklist complète : Projet fonctionnel !

Maintenant, explore ! Si bloqué, relis le dépannage ou demande à un prof.

**Ressources :** Docs Hugging Face pour GLM, forums AI comme Reddit r/LocalLLaMA.
