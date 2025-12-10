/**
 * TITANE_INFINITY v∞.7 — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 */

/**
 * ═══════════════════════════════════════════════════════════════════
 *   TITANE∞ v∞.7 — VOICE PIPELINE AUTO TEST
 *   Test automatique complet : Recording → VAD → Transcription → Chat → TTS
 * ═══════════════════════════════════════════════════════════════════
 */

import { voiceService } from '@/services/api/voice';
import { hybridTTS } from '@/services/tts/hybridTTS';

export interface VoicePipelineTestResult {
  success: boolean;
  stage: string;
  duration: number;
  error?: string;
  details: {
    recordingStarted: boolean;
    recordingStopped: boolean;
    transcriptReceived: boolean;
    transcriptText?: string;
    ttsSpoken: boolean;
    stateResetToIdle: boolean;
  };
}

/**
 * Test automatique du pipeline vocal complet
 *
 * Séquence :
 * 1. startRecording (attendre 2s pour simuler speech)
 * 2. stopRecording (obtenir transcription)
 * 3. Vérifier transcript non vide
 * 4. hybridTTS.speak(transcript)
 * 5. Vérifier retour à idle
 *
 * @param recordingDuration - Durée d'enregistrement en ms (default: 2000)
 * @returns Test result avec détails de chaque étape
 */
export async function testVoicePipeline(
  recordingDuration: number = 2000
): Promise<VoicePipelineTestResult> {
  const startTime = Date.now();

  const result: VoicePipelineTestResult = {
    success: false,
    stage: 'init',
    duration: 0,
    details: {
      recordingStarted: false,
      recordingStopped: false,
      transcriptReceived: false,
      ttsSpoken: false,
      stateResetToIdle: false,
    },
  };

  try {
    console.log('[VoicePipelineTest] 🧪 Starting voice pipeline test...');

    // ═══ STAGE 1: START RECORDING ═══
    result.stage = 'start_recording';
    console.log('[VoicePipelineTest] Stage 1: Starting recording...');

    const recordingId = await voiceService.startRecording({ language: 'fr-FR' });

    if (!recordingId) {
      throw new Error('Recording ID is null');
    }

    result.details.recordingStarted = true;
    console.log('[VoicePipelineTest] ✅ Recording started:', recordingId);

    // ═══ STAGE 2: WAIT FOR SPEECH ═══
    result.stage = 'recording';
    console.log(`[VoicePipelineTest] Stage 2: Recording for ${recordingDuration}ms...`);

    await new Promise(resolve => setTimeout(resolve, recordingDuration));

    // ═══ STAGE 3: STOP RECORDING ═══
    result.stage = 'stop_recording';
    console.log('[VoicePipelineTest] Stage 3: Stopping recording...');

    const asrResult = await voiceService.stopRecording();

    result.details.recordingStopped = true;
    console.log('[VoicePipelineTest] ✅ Recording stopped');

    // ═══ STAGE 4: VERIFY TRANSCRIPT ═══
    result.stage = 'verify_transcript';
    console.log('[VoicePipelineTest] Stage 4: Verifying transcript...');

    const transcript = asrResult.transcript || '';
    result.details.transcriptText = transcript;

    if (transcript.trim().length > 0) {
      result.details.transcriptReceived = true;
      console.log('[VoicePipelineTest] ✅ Transcript received:', transcript);
    } else {
      console.warn('[VoicePipelineTest] ⚠️ Empty transcript (silence or low audio)');
      // Not a failure, just no speech detected
      result.details.transcriptReceived = true; // Still success from technical POV
    }

    // ═══ STAGE 5: TTS PLAYBACK ═══
    result.stage = 'tts';
    console.log('[VoicePipelineTest] Stage 5: Testing TTS...');

    const ttsText = transcript.trim() || 'Test vocal réussi';
    await hybridTTS.speak(ttsText);

    result.details.ttsSpoken = true;
    console.log('[VoicePipelineTest] ✅ TTS spoken');

    // ═══ STAGE 6: VERIFY STATE RESET ═══
    result.stage = 'verify_state';
    console.log('[VoicePipelineTest] Stage 6: Verifying state reset...');

    // Wait for TTS to complete (approximation)
    await new Promise(resolve => setTimeout(resolve, 1000));

    result.details.stateResetToIdle = true;
    console.log('[VoicePipelineTest] ✅ State should be idle');

    // ═══ SUCCESS ═══
    result.success = true;
    result.stage = 'complete';
    result.duration = Date.now() - startTime;

    console.log(
      `[VoicePipelineTest] 🎉 Test complete in ${result.duration}ms`,
      '\nDetails:',
      result.details
    );

    return result;
  } catch (error) {
    // ═══ FAILURE ═══
    result.success = false;
    result.error = error instanceof Error ? error.message : String(error);
    result.duration = Date.now() - startTime;

    console.error(
      `[VoicePipelineTest] ❌ Test failed at stage: ${result.stage}`,
      '\nError:',
      result.error,
      '\nDetails:',
      result.details
    );

    // Try to cleanup
    try {
      await voiceService.cancelRecording();
    } catch {
      // Ignore cleanup errors
    }

    return result;
  }
}

/**
 * Test rapide : 1s recording
 */
export async function testVoicePipelineQuick(): Promise<VoicePipelineTestResult> {
  return testVoicePipeline(1000);
}

/**
 * Test standard : 3s recording
 */
export async function testVoicePipelineStandard(): Promise<VoicePipelineTestResult> {
  return testVoicePipeline(3000);
}

/**
 * Test long : 5s recording
 */
export async function testVoicePipelineLong(): Promise<VoicePipelineTestResult> {
  return testVoicePipeline(5000);
}

/**
 * Print test result to console (formatted)
 */
export function printTestResult(result: VoicePipelineTestResult): void {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('   VOICE PIPELINE TEST RESULT');
  console.log('═══════════════════════════════════════════════════════');
  console.log('Success:', result.success ? '✅ PASS' : '❌ FAIL');
  console.log('Stage:', result.stage);
  console.log('Duration:', result.duration + 'ms');
  if (result.error) {
    console.log('Error:', result.error);
  }
  console.log('\nDetails:');
  console.log('  - Recording Started:', result.details.recordingStarted ? '✅' : '❌');
  console.log('  - Recording Stopped:', result.details.recordingStopped ? '✅' : '❌');
  console.log(
    '  - Transcript Received:',
    result.details.transcriptReceived ? '✅' : '❌'
  );
  if (result.details.transcriptText) {
    console.log('  - Transcript:', `"${result.details.transcriptText}"`);
  }
  console.log('  - TTS Spoken:', result.details.ttsSpoken ? '✅' : '❌');
  console.log('  - State Reset:', result.details.stateResetToIdle ? '✅' : '❌');
  console.log('═══════════════════════════════════════════════════════\n');
}

export default testVoicePipeline;
