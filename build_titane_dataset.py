#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
═══════════════════════════════════════════════════════════════════════════
  TITANE∞ LOCAL TRAINING — DATASET BUILDER v∞
  Extraction automatique des super-prompts, exemples dev, patterns TITANE∞
  Génération dataset.jsonl pour fine-tuning Ollama (LLama 3.1)
═══════════════════════════════════════════════════════════════════════════
"""

import os
import re
import json
import glob
from pathlib import Path
from typing import List, Dict, Any

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

WORKSPACE_ROOT = Path(__file__).parent
OUTPUT_DIR = WORKSPACE_ROOT / "titane_local_training"
DATASET_FILE = OUTPUT_DIR / "dataset.jsonl"

# Patterns pour extraction
SUPER_PROMPT_PATTERN = r"(?:#|##)\s*SUPER\s*PROMPT[^\n]*\n(.*?)(?=\n#|\Z)"
CODE_EXAMPLE_PATTERN = r"```(?:rust|typescript|tsx|ts|javascript|jsx)\n(.*?)```"
FIX_PATTERN = r"(?:fix|correction|patch|refactor)[:\s]*(.{20,500})"

# ═══════════════════════════════════════════════════════════════════════════
# DATASET TYPES
# ═══════════════════════════════════════════════════════════════════════════

class DatasetBuilder:
    """Constructeur de dataset TITANE∞ pour fine-tuning local"""

    def __init__(self):
        self.examples: List[Dict[str, str]] = []
        self.stats = {
            "super_prompts": 0,
            "dev_examples": 0,
            "introspection": 0,
            "ui_ux": 0,
            "style": 0,
            "memory": 0
        }

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE A — SUPER PROMPTS TITANE∞
    # ═══════════════════════════════════════════════════════════════════════

    def extract_super_prompts(self):
        """Extrait tous les super-prompts des fichiers .md"""
        print("📦 [TYPE A] Extraction des super-prompts TITANE∞...")

        super_prompt_files = [
            "SUPER_PROMPT_TITANE_LOCAL_MODEL_v∞.md",
            "SUPER_PROMPT_OPTIMIZER_TITANE_LOCAL_v∞.md",
            "SINGULARITY_ENGINE_v∞.md",
            "SELF_HEALING_ENGINE_v∞.md",
            "MEMORY_ETERNAL_v∞.md"
        ]

        for filename in super_prompt_files:
            filepath = WORKSPACE_ROOT / filename
            if not filepath.exists():
                continue

            content = filepath.read_text(encoding="utf-8")

            # Extraire le super-prompt complet
            if "SUPER PROMPT" in content or "SYSTÈME" in content:
                # Titre du super-prompt
                title_match = re.search(r"#\s*([^\n]+TITANE[^\n]+)", content)
                title = title_match.group(1) if title_match else filename

                # Contenu (première section importante)
                sections = re.split(r"\n#{1,2}\s", content)
                if len(sections) > 1:
                    main_content = sections[1][:1000]  # Limiter à 1000 chars

                    self.examples.append({
                        "prompt": f"Active le système {title}",
                        "response": main_content.strip()
                    })
                    self.stats["super_prompts"] += 1

        print(f"   ✅ {self.stats['super_prompts']} super-prompts extraits")

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE B — EXEMPLES DEV (Rust/Tauri/React/TS)
    # ═══════════════════════════════════════════════════════════════════════

    def extract_dev_examples(self):
        """Extrait exemples de code Rust/TypeScript/React"""
        print("🔧 [TYPE B] Extraction des exemples dev...")

        # Fichiers sources
        rust_files = list(WORKSPACE_ROOT.glob("src-tauri/**/*.rs"))
        ts_files = list(WORKSPACE_ROOT.glob("src/**/*.ts")) + list(WORKSPACE_ROOT.glob("src/**/*.tsx"))

        # Rust examples
        for filepath in rust_files[:10]:  # Limiter à 10 fichiers
            content = filepath.read_text(encoding="utf-8", errors="ignore")

            # Chercher fonctions Tauri
            tauri_commands = re.findall(r"#\[tauri::command\]\s*(?:pub\s+)?async\s+fn\s+(\w+)[^{]*\{([^}]{50,500})", content)

            for cmd_name, cmd_body in tauri_commands:
                self.examples.append({
                    "prompt": f"Crée un handler Tauri pour {cmd_name}",
                    "response": f"```rust\n#[tauri::command]\nasync fn {cmd_name} {{\n{cmd_body.strip()}\n}}\n```"
                })
                self.stats["dev_examples"] += 1

        # TypeScript examples
        for filepath in ts_files[:10]:
            content = filepath.read_text(encoding="utf-8", errors="ignore")

            # Chercher fonctions/composants
            functions = re.findall(r"(?:export\s+)?(?:const|function)\s+(\w+)[^{]*\{([^}]{50,300})", content)

            for func_name, func_body in functions[:3]:  # 3 par fichier max
                self.examples.append({
                    "prompt": f"Implémente la fonction {func_name}",
                    "response": f"```typescript\nfunction {func_name} {{\n{func_body.strip()}\n}}\n```"
                })
                self.stats["dev_examples"] += 1

        print(f"   ✅ {self.stats['dev_examples']} exemples dev extraits")

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE C — EXEMPLES INTROSPECTION
    # ═══════════════════════════════════════════════════════════════════════

    def add_introspection_examples(self):
        """Ajoute exemples d'introspection et self-healing"""
        print("🧠 [TYPE C] Génération exemples introspection...")

        introspection_examples = [
            {
                "prompt": "Détecte les incohérences dans le module Audio",
                "response": "Analyse du module Audio:\n1. Vérification de la couche PHYSIQUE (drivers)\n2. Vérification de la couche COGNITIVE (state management)\n3. Détection: AudioEngine.isPlaying = true mais audioRef.current = null\n4. Incohérence détectée: état désynchronisé\n5. Moteurs impliqués: Audio Engine, State Engine\n6. Singularity Alignment: COGNITIVE (state) ↔ PHYSIQUE (hardware)"
            },
            {
                "prompt": "Identifie les moteurs impliqués dans un crash UI",
                "response": "Introspection crash UI:\n1. Couche SYMBOLIQUE: UI/UX Engine\n2. Couche COGNITIVE: State Management\n3. Analyse stack trace\n4. Cause: useEffect cleanup manquant\n5. Moteurs impactés: React Engine, Memory Engine\n6. Fix: Ajouter cleanup dans useEffect dependencies"
            },
            {
                "prompt": "Aligne Singularity Engine sur le module Camera",
                "response": "Alignement Singularity Camera:\n1. PHYSIQUE: camera.getVideoTracks() ✅\n2. COGNITIVE: cameraState.isActive ✅\n3. SYMBOLIQUE: UI CameraPreview ✅\n4. ADAPTATIVE: context.camera.ready ✅\n5. MÉTA: logging camera events ✅\n6. SINGULARITÉ: tous moteurs synchronisés ✅"
            }
        ]

        for example in introspection_examples:
            self.examples.append(example)
            self.stats["introspection"] += 1

        print(f"   ✅ {self.stats['introspection']} exemples introspection ajoutés")

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE D — EXEMPLES UI/UX
    # ═══════════════════════════════════════════════════════════════════════

    def add_ui_ux_examples(self):
        """Ajoute exemples UI/UX TITANE∞"""
        print("🎨 [TYPE D] Génération exemples UI/UX...")

        ui_examples = [
            {
                "prompt": "Corrige l'espacement dans SettingsPanel",
                "response": "```tsx\n// Fix espacement SettingsPanel\n<div className=\"space-y-4 p-6\">\n  <h2 className=\"text-lg font-semibold\">Settings</h2>\n  <div className=\"space-y-2\">\n    {/* Contenu */}\n  </div>\n</div>\n```"
            },
            {
                "prompt": "Optimise le rendu de la liste de modèles IA",
                "response": "```tsx\n// Optimisation avec React.memo + virtualization\nimport { memo } from 'react';\n\nconst ModelItem = memo(({ model }) => (\n  <div className=\"p-2 hover:bg-gray-100\">{model.name}</div>\n));\n\nexport const ModelList = ({ models }) => (\n  <div className=\"overflow-y-auto max-h-96\">\n    {models.map(m => <ModelItem key={m.id} model={m} />)}\n  </div>\n);\n```"
            }
        ]

        for example in ui_examples:
            self.examples.append(example)
            self.stats["ui_ux"] += 1

        print(f"   ✅ {self.stats['ui_ux']} exemples UI/UX ajoutés")

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE E — EXEMPLES STYLE TITANE∞
    # ═══════════════════════════════════════════════════════════════════════

    def add_style_examples(self):
        """Ajoute exemples du style de communication TITANE∞"""
        print("💬 [TYPE E] Génération exemples style TITANE∞...")

        style_examples = [
            {
                "prompt": "Comment réponds-tu aux demandes de fix ?",
                "response": "Réponse TITANE∞:\n1. Analyse rapide (lecture code)\n2. Mini-diagnostic (source problème)\n3. Micro-fix (correctif ciblé)\n4. Mini-optimisation (amélioration)\n5. Singularity Alignment (cohérence)\n6. Résultat concis\n\nStyle: court, technique, structuré, chirurgical."
            },
            {
                "prompt": "Quel est ton rôle ?",
                "response": "TITANE-LOCAL ENGINE v∞:\n- Moteur interne (pas assistant général)\n- Expert Rust/Tauri/React\n- Self-healing automatique\n- Alignement Singularity constant\n- Réponses <400 tokens\n- Show don't tell\n- Fix fast"
            }
        ]

        for example in style_examples:
            self.examples.append(example)
            self.stats["style"] += 1

        print(f"   ✅ {self.stats['style']} exemples style ajoutés")

    # ═══════════════════════════════════════════════════════════════════════
    # TYPE F — EXEMPLES MÉMOIRE
    # ═══════════════════════════════════════════════════════════════════════

    def add_memory_examples(self):
        """Ajoute exemples de gestion mémoire TITANE∞"""
        print("💾 [TYPE F] Génération exemples mémoire...")

        memory_examples = [
            {
                "prompt": "Comment sauvegardes-tu l'état TITANE∞ ?",
                "response": "Sauvegarde état:\n1. Capture state (Zustand persist)\n2. Snapshot memory (Memory Engine)\n3. Autosave (toutes les 30s)\n4. Compression cognitive\n5. LocalStorage + IndexedDB\n6. Reconstruction au démarrage"
            },
            {
                "prompt": "Reconstruit la mémoire après crash",
                "response": "Reconstruction mémoire:\n1. Lecture localStorage (dernier état)\n2. Validation JSON\n3. Restauration state partielle\n4. Self-healing modules cassés\n5. Alignement Singularity\n6. État reconstruit stable"
            }
        ]

        for example in memory_examples:
            self.examples.append(example)
            self.stats["memory"] += 1

        print(f"   ✅ {self.stats['memory']} exemples mémoire ajoutés")

    # ═══════════════════════════════════════════════════════════════════════
    # GÉNÉRATION DATASET
    # ═══════════════════════════════════════════════════════════════════════

    def build_dataset(self):
        """Construit le dataset complet"""
        print("\n" + "═" * 80)
        print("🚀 TITANE∞ DATASET BUILDER — Démarrage")
        print("═" * 80 + "\n")

        # Extraction
        self.extract_super_prompts()
        self.extract_dev_examples()
        self.add_introspection_examples()
        self.add_ui_ux_examples()
        self.add_style_examples()
        self.add_memory_examples()

        # Création répertoire
        OUTPUT_DIR.mkdir(exist_ok=True)

        # Écriture dataset.jsonl
        with open(DATASET_FILE, "w", encoding="utf-8") as f:
            for example in self.examples:
                f.write(json.dumps(example, ensure_ascii=False) + "\n")

        # Stats finales
        total = len(self.examples)
        print("\n" + "═" * 80)
        print("✅ DATASET GÉNÉRÉ")
        print("═" * 80)
        print(f"📊 Statistiques:")
        print(f"   • Super-prompts: {self.stats['super_prompts']}")
        print(f"   • Dev examples: {self.stats['dev_examples']}")
        print(f"   • Introspection: {self.stats['introspection']}")
        print(f"   • UI/UX: {self.stats['ui_ux']}")
        print(f"   • Style: {self.stats['style']}")
        print(f"   • Memory: {self.stats['memory']}")
        print(f"   • TOTAL: {total} exemples")
        print(f"\n📦 Fichier: {DATASET_FILE}")
        print(f"   Taille: {DATASET_FILE.stat().st_size / 1024:.1f} KB")
        print("\n🎯 Prochaine étape:")
        print(f"   ./train_titane_local.sh")
        print("═" * 80 + "\n")

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    builder = DatasetBuilder()
    builder.build_dataset()
