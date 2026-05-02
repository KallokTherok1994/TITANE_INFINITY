import { describe, expect, it } from 'vitest';

import { ACTIVE_MODE_IDS } from '@/services/ai/chatModes.config';
import { CHAT_MODES_CONFIG } from '@/services/ai/chatModes.data';
import {
  MODE_PROFILE_MAP,
  getEffectiveProfile,
  getModeProfileDefault,
  hasExplicitModeProfile,
} from '@/services/ai/responsePolicy';

describe('Chat modes profile coverage', () => {
  it('every active mode has an explicit response-profile mapping', () => {
    const missing = ACTIVE_MODE_IDS.filter(modeId => !hasExplicitModeProfile(modeId));

    expect(missing).toEqual([]);
  });

  it('specialized active modes no longer fall back silently to BALANCED', () => {
    expect(MODE_PROFILE_MAP.htf_soumission).toBe('ARCHITECT');
    expect(MODE_PROFILE_MAP.psychologie_profils).toBe('DEEP');
    expect(MODE_PROFILE_MAP.humain_total).toBe('DEVELOPED');
    expect(MODE_PROFILE_MAP.kalloks_arts).toBe('DEVELOPED');
  });

  it('neutral runtime selection follows the explicit default profile per active mode', () => {
    const message = 'Besoin de ton aide sur ce sujet.';

    for (const modeId of ACTIVE_MODE_IDS) {
      const mode = CHAT_MODES_CONFIG[modeId];
      const { selectionResult, profile } = getEffectiveProfile(
        modeId,
        message,
        mode.maxTokens,
        mode.temperature
      );

      expect(selectionResult.profileId, `${modeId} profile mismatch`).toBe(
        getModeProfileDefault(modeId)
      );
      expect(profile.maxTokens, `${modeId} runtime cap mismatch`).toBe(mode.maxTokens);
    }
  });
});
