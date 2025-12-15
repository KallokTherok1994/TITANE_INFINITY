/**
 * TITANE∞ v∞ — Proprietary License
 * © 2025 Humain Total / Kevin Thibault / TITANE Team. All rights reserved.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * TITANE∞ v∞ - AUDIO PIPELINE AUTO-TEST ENGINE
 * Automated testing suite for voice pipeline validation
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { voiceService } from '@/services/api/voice';
import { audioStateMachine } from '@/services/audio/audioStateMachine';
import { hybridTTS } from '@/services/tts/hybridTTS';
import { secureInvoke } from '@/lib/security';

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
  timestamp: number;
}

/**
 * Audio Pipeline Auto-Test Engine
 */
class AudioAutoTest {
  /**
   * Run full test suite
   */
  async runFullSuite(): Promise<TestSuite> {
    console.log('[AudioAutoTest] 🧪 Starting full test suite...');
    const startTime = Date.now();
    const results: TestResult[] = [];

    // 1. Test backend connectivity
    results.push(await this.testBackendConnectivity());

    // 2. Test microphone availability
    results.push(await this.testMicrophoneAvailability());

    // 3. Test recording start/stop
    results.push(await this.testRecordingCycle());

    // 4. Test state machine transitions
    results.push(await this.testStateMachine());

    // 5. Test TTS availability
    results.push(await this.testTTSAvailability());

    // 6. Test audio device enumeration
    results.push(await this.testAudioDevices());

    // Compile results
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const totalDuration = Date.now() - startTime;

    const suite: TestSuite = {
      name: 'TITANE∞ Audio Pipeline Test Suite',
      results,
      passed,
      failed,
      totalDuration,
      timestamp: Date.now(),
    };

    console.log(
      `[AudioAutoTest] ✅ Suite completed: ${passed}/${results.length} passed in ${totalDuration}ms`
    );
    return suite;
  }

  /**
   * Test 1: Backend connectivity
   */
  private async testBackendConnectivity(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const isRecording = await secureInvoke<boolean>('is_recording', {});
      return {
        name: 'Backend Connectivity',
        passed: true,
        duration: Date.now() - startTime,
        details: { isRecording },
      };
    } catch (error) {
      return {
        name: 'Backend Connectivity',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 2: Microphone availability
   */
  private async testMicrophoneAvailability(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const result = await secureInvoke<{ success: boolean }>('test_microphone', {
        durationMs: 1000,
      });
      return {
        name: 'Microphone Availability',
        passed: result.success === true,
        duration: Date.now() - startTime,
        details: result,
      };
    } catch (error) {
      return {
        name: 'Microphone Availability',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 3: Recording cycle (start → stop)
   */
  private async testRecordingCycle(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // Start recording
      const recordingId = await voiceService.startRecording({ language: 'fr-FR' });
      if (!recordingId) {
        throw new Error('Failed to get recording ID');
      }

      // Wait 500ms
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if recording
      const isRecording = await secureInvoke<boolean>('is_recording', {});
      if (!isRecording) {
        throw new Error('Recording not active after start');
      }

      // Stop recording
      const result = await voiceService.stopRecording();

      // Verify stopped
      const isRecordingAfterStop = await secureInvoke<boolean>('is_recording', {});
      if (isRecordingAfterStop) {
        throw new Error('Recording still active after stop');
      }

      return {
        name: 'Recording Cycle (start/stop)',
        passed: true,
        duration: Date.now() - startTime,
        details: {
          recordingId,
          transcript: result.transcript,
          confidence: result.confidence,
        },
      };
    } catch (error) {
      // Cleanup on error
      try {
        await voiceService.cancelRecording();
      } catch (cleanupError) {
        console.debug('[AudioAutoTest] Cleanup error suppressed:', cleanupError);
      }

      return {
        name: 'Recording Cycle (start/stop)',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 4: State machine transitions
   */
  private async testStateMachine(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // Reset to known state
      audioStateMachine.reset();

      if (audioStateMachine.getState() !== 'idle') {
        throw new Error('Failed to reset to idle');
      }

      // Test valid transitions
      const transitions = [
        { event: 'VAD_SPEECH_START' as const, expectedState: 'user_speaking' as const },
        { event: 'VAD_SPEECH_END' as const, expectedState: 'processing' as const },
        { event: 'TTS_START' as const, expectedState: 'ai_speaking' as const },
        { event: 'TTS_END' as const, expectedState: 'idle' as const },
      ];

      for (const { event, expectedState } of transitions) {
        const success = audioStateMachine.transition(event);
        const actualState = audioStateMachine.getState();

        if (!success || actualState !== expectedState) {
          throw new Error(
            `Transition failed: ${event} → expected ${expectedState}, got ${actualState}`
          );
        }
      }

      return {
        name: 'State Machine Transitions',
        passed: true,
        duration: Date.now() - startTime,
        details: { transitions: transitions.length },
      };
    } catch (error) {
      // Reset on error
      audioStateMachine.forceReset();

      return {
        name: 'State Machine Transitions',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 5: TTS availability
   */
  private async testTTSAvailability(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const status = await hybridTTS.getStatus();
      return {
        name: 'TTS Availability',
        passed: status.available,
        duration: Date.now() - startTime,
        details: { ...status } as Record<string, unknown>,
      };
    } catch (error) {
      return {
        name: 'TTS Availability',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Test 6: Audio device enumeration
   */
  private async testAudioDevices(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const [outputDevices, inputDevices] = await Promise.all([
        secureInvoke<any[]>('get_audio_output_devices', {}),
        secureInvoke<any[]>('get_audio_input_devices', {}),
      ]);

      const hasOutput = outputDevices && outputDevices.length > 0;
      const hasInput = inputDevices && inputDevices.length > 0;

      return {
        name: 'Audio Device Enumeration',
        passed: hasOutput && hasInput,
        duration: Date.now() - startTime,
        details: {
          outputDevices: outputDevices?.length || 0,
          inputDevices: inputDevices?.length || 0,
        },
      };
    } catch (error) {
      return {
        name: 'Audio Device Enumeration',
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Quick diagnostic test
   */
  async quickDiagnostic(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Test backend
    try {
      await secureInvoke('is_recording', {});
    } catch (error) {
      issues.push('Backend unresponsive');
    }

    // Test microphone
    try {
      const result = await secureInvoke<{ success: boolean }>('test_microphone', {
        durationMs: 500,
      });
      if (!result.success) {
        issues.push('Microphone unavailable');
      }
    } catch (error) {
      issues.push('Microphone test failed');
    }

    // Test state machine
    const state = audioStateMachine.getState();
    if (state === 'error') {
      issues.push('State machine in error state');
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate test report
   */
  generateReport(suite: TestSuite): string {
    let report = `
╔════════════════════════════════════════════════════════════════╗
║  TITANE∞ AUDIO PIPELINE TEST REPORT                           ║
╚════════════════════════════════════════════════════════════════╝

Suite: ${suite.name}
Date: ${new Date(suite.timestamp).toLocaleString()}
Duration: ${suite.totalDuration}ms

Results: ${suite.passed}/${suite.results.length} tests passed

`;

    suite.results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      report += `${index + 1}. ${icon} ${result.name} (${result.duration}ms)\n`;
      if (result.error) {
        report += `   Error: ${result.error}\n`;
      }
      if (result.details) {
        report += `   Details: ${JSON.stringify(result.details, null, 2)}\n`;
      }
      report += '\n';
    });

    return report;
  }
}

// Export singleton
export const audioAutoTest = new AudioAutoTest();
export default audioAutoTest;
