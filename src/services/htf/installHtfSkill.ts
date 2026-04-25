// HTF Module — L'Humain à tout faire
// Installe le skill HTF au démarrage si absent

import { installSkill, getSkillById } from '../skills';
import { htfSkillDefinition, HTF_SKILL_ID } from './htfSkillDefinition';

export function installHtfSkillIfAbsent(): void {
  try {
    const existing = getSkillById(HTF_SKILL_ID);
    if (!existing) {
      installSkill(htfSkillDefinition);
    }
  } catch (e) {
    console.warn('[HTF] Failed to install HTF skill:', e);
  }
}
