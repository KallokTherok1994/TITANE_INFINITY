#!/usr/bin/env python3
"""
Correction automatique des apostrophes et guillemets JSX
Pour atteindre 10/10 - Bloquant 1: JSX Apostrophes
"""

import re
from pathlib import Path

# Patterns de correction (ordre important!)
CORRECTIONS = [
    # Apostrophes après >
    (r"(>)l'([aeiouéèêàâîïôùûAEIOU])", r"\1l&apos;\2"),
    (r"(>)d'([aeiouéèêàâîïôùûAEIOU])", r"\1d&apos;\2"),
    (r"(>)qu'([aeiouéèêàâîïôùûAEIOU])", r"\1qu&apos;\2"),
    (r"(>)n'([aeiouéèêàâîïôùûAEIOU])", r"\1n&apos;\2"),
    (r"(>)s'([aeiouéèêàâîïôùûAEIOU])", r"\1s&apos;\2"),
    (r"(>)c'([aeiouéèêàâîïôùûAEIOU])", r"\1c&apos;\2"),
    (r"(>)m'([aeiouéèêàâîïôùûAEIOU])", r"\1m&apos;\2"),
    (r"(>)j'([aeiouéèêàâîïôùûAEIOU])", r"\1j&apos;\2"),
    (r"(>)t'([aeiouéèêàâîïôùûAEIOU])", r"\1t&apos;\2"),
    (r"(>)L'([AEIOUÉÈÊÀÂÎÏÔÙÛ])", r"\1L&apos;\2"),
    (r"(>)D'([AEIOUÉÈÊÀÂÎÏÔÙÛ])", r"\1D&apos;\2"),
    
    # Apostrophes dans JSX (après espace)
    (r"(\s)l'([aeiouéèêàâîïôùûAEIOU])", r"\1l&apos;\2"),
    (r"(\s)d'([aeiouéèêàâîïôùûAEIOU])", r"\1d&apos;\2"),
    (r"(\s)qu'([aeiouéèêàâîïôùûAEIOU])", r"\1qu&apos;\2"),
    (r"(\s)n'([aeiouéèêàâîïôùûAEIOU])", r"\1n&apos;\2"),
    (r"(\s)s'([aeiouéèêàâîïôùûAEIOU])", r"\1s&apos;\2"),
    (r"(\s)c'([aeiouéèêàâîïôùûAEIOU])", r"\1c&apos;\2"),
    (r"(\s)m'([aeiouéèêàâîïôùûAEIOU])", r"\1m&apos;\2"),
    (r"(\s)j'([aeiouéèêàâîïôùûAEIOU])", r"\1j&apos;\2"),
    (r"(\s)t'([aeiouéèêàâîïôùûAEIOU])", r"\1t&apos;\2"),
    
    # Guillemets
    (r'>"([^"<]+)"<', r'>&quot;\1&quot;<'),
]

# Liste des fichiers à corriger (depuis eslint output)
FILES_TO_FIX = [
    "src/components/IdentityCenter/IdentityCenter.tsx",
    "src/components/Onboarding/CustomizationStep.tsx",
    "src/components/Onboarding/PrivacyStep.tsx",
    "src/components/Onboarding/ReadyStep.tsx",
    "src/components/audio/ListeningIndicator.tsx",
    "src/components/chat/MessageListOptimized.tsx",
    "src/components/experience/TalentTree.tsx",
    "src/components/physiological/PhysiologicalPanel.tsx",
    "src/components/progression/KnowledgeDomains.tsx",
    "src/components/twin/TwinEvolutionPanel.tsx",
    "src/components/vision/VisionFeedbackCard.tsx",
    "src/components/voice/VoiceControlPanelWithWakeWord.tsx",
    "src/features/admin/AdminPage.tsx",
    "src/features/audio-center/AudioCenterPage.tsx",
    "src/features/developer-mode/DeveloperModePage.tsx",
    "src/features/governance-center/components/APIProviderCard.tsx",
    "src/features/governance-center/tabs/PermissionsTab.tsx",
    "src/features/governance-center/tabs/PoliciesTab.tsx",
    "src/features/memory/MemorySearchPanel.tsx",
    "src/modules/avatar/floating/AvatarFloatingPopup.tsx",
    "src/pages/CloudCenter/SyncConfig.tsx",
    "src/pages/DashboardPage.tsx",
    "src/pages/EvoPage.tsx",
    "src/pages/ProgressionPage.tsx",
    "src/pages/SecureSettings.tsx",
    "src/pages/Sentinel.tsx",
    "src/pages/TimeNavigator.tsx",
    "src/pages/Watchdog.tsx",
    "src/stories/Page.tsx",
    "src/ui/Menu.tsx",
    "src/ui/pages/Chat.tsx",
    "src/ui/pages/ChatIA/ModeEditor.tsx",
    "src/ui/pages/CreationStudio.tsx",
    "src/ui/pages/HyperVisionDashboard.tsx",
    "src/ui/pages/IntrospectionDashboard.tsx",
]

def fix_file(filepath: Path) -> tuple[bool, int]:
    """
    Corrige un fichier TSX.
    Retourne (modifié, nb_corrections)
    """
    try:
        content = filepath.read_text(encoding='utf-8')
        original = content
        corrections = 0
        
        for pattern, replacement in CORRECTIONS:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                corrections += content.count(pattern.replace('\\', ''))
                content = new_content
        
        if content != original:
            filepath.write_text(content, encoding='utf-8')
            return True, corrections
        return False, 0
    except Exception as e:
        print(f"❌ Erreur {filepath}: {e}")
        return False, 0

def main():
    root = Path(__file__).parent.parent
    fixed_files = 0
    total_corrections = 0
    
    print("🔧 Correction automatique JSX apostrophes/guillemets")
    print("=" * 60)
    
    for rel_path in FILES_TO_FIX:
        filepath = root / rel_path
        if not filepath.exists():
            print(f"⚠️  Fichier non trouvé: {rel_path}")
            continue
        
        modified, corrections = fix_file(filepath)
        if modified:
            fixed_files += 1
            total_corrections += corrections
            print(f"✅ {rel_path} ({corrections} corrections)")
    
    print("=" * 60)
    print(f"🎉 {fixed_files} fichiers modifiés")
    print(f"📊 {total_corrections} corrections appliquées")

if __name__ == "__main__":
    main()
