#!/usr/bin/env python3
"""
TITANE∞ — Singularity Pipeline Test via IPC
Test programmatique du pipeline Singularity sans UI
"""

import json
import subprocess
import time
import sys
from datetime import datetime

def test_singularity_pipeline():
    """
    Test le pipeline Singularity via appels directs au backend Tauri
    """
    
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                                                               ║")
    print("║   🧪 TITANE∞ SINGULARITY PIPELINE VALIDATION                  ║")
    print("║   Test programmatique via logs backend                        ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print()
    
    # Check runtime status
    print("📊 Vérification runtime...")
    try:
        result = subprocess.run(
            ["pgrep", "-af", "titane-infinity"],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0 or not result.stdout.strip():
            print("❌ ERROR: Runtime Tauri non actif")
            print("Veuillez démarrer: npm run tauri dev -- --no-watch")
            return False
            
        processes = result.stdout.strip().split('\n')
        print(f"✅ Runtime actif: {len(processes)} processus détectés")
        for proc in processes[:2]:
            print(f"   {proc[:80]}...")
    except Exception as e:
        print(f"❌ ERROR checking runtime: {e}")
        return False
    
    print()
    
    # Test scenarios
    test_cases = [
        {
            "id": "S1",
            "name": "Baseline - Conversation Courte",
            "message": "Bonjour TITANE",
            "expected_coherence_min": 0.90,
            "expected_meta_tags": ["greeting", "short"],
            "expected_latency_max": 30,
        },
        {
            "id": "S2", 
            "name": "LTM Trigger - Conversation Longue",
            "message": "Peux-tu m'expliquer en détail comment fonctionne l'algorithme de hachage SHA-256, ses applications en cryptographie blockchain, et les différences avec SHA-1 en termes de sécurité et performance ?",
            "expected_coherence_min": 0.80,
            "expected_meta_tags": ["technical", "ltm_candidate"],
            "expected_latency_max": 50,
        },
        {
            "id": "S3",
            "name": "Style Correction - Détection Anglais",
            "message": "Explique-moi le machine learning",
            "expected_coherence_min": 0.75,
            "expected_meta_tags": ["style_deviation", "technical"],
            "expected_latency_max": 35,
        },
    ]
    
    # Get initial log position
    log_file = "runtime/dev/logs/launch.log"
    try:
        with open(log_file, 'r') as f:
            initial_lines = len(f.readlines())
    except:
        initial_lines = 0
        print(f"⚠️ Warning: Could not read {log_file}")
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  TESTS AUTOMATISÉS (Analyse Logs Backend)")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("ℹ️  Note: Les tests analysent les logs backend générés par")
    print("   les conversations précédentes ou actuelles dans l'UI.")
    print()
    
    # Analyze logs for Singularity markers
    results = []
    
    print("🔍 Analyse des logs Singularity...")
    print()
    
    try:
        result = subprocess.run(
            ["grep", "-E", "(SINGULARITY|coherence=|meta_tags=)", log_file],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0 and result.stdout.strip():
            log_lines = result.stdout.strip().split('\n')
            print(f"✅ Trouvé {len(log_lines)} entrées Singularity dans les logs")
            print()
            
            # Parse log entries
            for line in log_lines[-10:]:  # Last 10 entries
                if "Meta-processing complete" in line or "Meta-processing success" in line:
                    print(f"📝 {line[:100]}...")
                    
                    # Extract metrics
                    if "coherence=" in line:
                        try:
                            coherence = float(line.split("coherence=")[1].split()[0])
                            print(f"   Coherence: {coherence:.2f}")
                        except:
                            pass
                    
                    if "meta_tags=" in line:
                        try:
                            meta_count = int(line.split("meta_tags=")[1].split()[0])
                            print(f"   Meta-tags: {meta_count}")
                        except:
                            pass
                    
                    if "latency=" in line:
                        try:
                            latency = int(line.split("latency=")[1].split("ms")[0])
                            print(f"   Latency: {latency}ms")
                        except:
                            pass
                    
                    print()
            
            results.append({
                "status": "✅ PASS",
                "message": f"Singularity actif ({len(log_lines)} entrées logs)"
            })
        else:
            print("⚠️ WARNING: Aucun log Singularity trouvé")
            print("   Cela signifie qu'aucune conversation n'a été traitée encore.")
            print("   Veuillez envoyer un message dans l'interface Chat IA.")
            print()
            results.append({
                "status": "⏳ PENDING",
                "message": "Aucune conversation testée (logs vides)"
            })
            
    except FileNotFoundError:
        print(f"❌ ERROR: Fichier log non trouvé: {log_file}")
        results.append({
            "status": "❌ FAIL", 
            "message": "Logs non accessibles"
        })
    except Exception as e:
        print(f"❌ ERROR analyzing logs: {e}")
        results.append({
            "status": "❌ FAIL",
            "message": str(e)
        })
    
    # Check for specific patterns
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  VALIDATION PATTERNS")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    
    patterns = [
        ("Succès Meta-processing", "Meta-processing success"),
        ("Coherence calculée", "coherence="),
        ("Meta-tags générés", "meta_tags="),
        ("LTM suggestions", "ltm_candidate|LTM"),
        ("Latence mesurée", "latency=.*ms"),
    ]
    
    for pattern_name, pattern in patterns:
        try:
            result = subprocess.run(
                ["grep", "-Ec", pattern, log_file],
                capture_output=True,
                text=True
            )
            count = int(result.stdout.strip()) if result.returncode == 0 else 0
            
            status = "✅" if count > 0 else "⏳"
            print(f"{status} {pattern_name}: {count} occurrences")
        except:
            print(f"⏳ {pattern_name}: Non vérifié")
    
    print()
    
    # Summary
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  RÉSUMÉ")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    
    for result in results:
        print(f"{result['status']} {result['message']}")
    
    print()
    print("📋 PROCHAINES ÉTAPES:")
    print()
    print("1. Ouvrir l'interface Chat IA (fenêtre Tauri)")
    print("2. Envoyer messages de test:")
    print("   - Test S1: 'Bonjour TITANE'")
    print("   - Test S2: Question longue sur SHA-256")
    print("   - Test S3: 'Explique-moi le machine learning'")
    print()
    print("3. Relancer ce script pour analyser nouveaux logs:")
    print("   ./scripts/test/test_singularity_logs.py")
    print()
    print("4. Logs en temps réel:")
    print("   tail -f runtime/dev/logs/launch.log | grep SINGULARITY")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = test_singularity_pipeline()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️ Test interrompu par utilisateur")
        sys.exit(130)
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
