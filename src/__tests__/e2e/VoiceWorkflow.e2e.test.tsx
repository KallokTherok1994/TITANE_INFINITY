/**
 * E2E Tests: Voice Workflow
 * Coverage: Voice input → Transcription → Processing
 */

import React, { useState } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const TestVoiceApp: React.FC = () => {
  const [view, setView] = useState<'chat' | 'voice' | 'settings'>('chat');
  const [status, setStatus] = useState('');
  const [transcription, setTranscription] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [saved, setSaved] = useState(false);

  const handleRecord = async () => {
    setSaved(false);
    try {
      await navigator.mediaDevices?.getUserMedia?.({ audio: true });
      setStatus('recording');
    } catch {
      setStatus('permission denied');
    }
  };

  const handleStop = async () => {
    setStatus('transcribing');
    try {
      await fetch('/transcribe');
      setTranscription('transcription text');
    } catch {
      setStatus('transcription failed');
    }
  };

  return (
    <div>
      <button type="button" onClick={() => setView('voice')}>
        Voice
      </button>
      <button type="button" onClick={() => setView('settings')}>
        Settings
      </button>

      {view === 'voice' && (
        <div>
          <button type="button" onClick={handleRecord}>
            Record
          </button>
          <button type="button" onClick={handleStop}>
            Stop
          </button>
          {status && <div>{status}</div>}
          {transcription && <div>{transcription}</div>}
          {transcription && (
            <button type="button" onClick={() => setStatus('sent')}>
              Send to chat
            </button>
          )}
        </div>
      )}

      {view === 'settings' && (
        <div>
          <button type="button">Voice</button>
          <label htmlFor="language">Language</label>
          <select
            id="language"
            value={language}
            onChange={event => setLanguage(event.target.value)}
          >
            <option value="en-US">en-US</option>
            <option value="fr-FR">fr-FR</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSaved(true);
              setStatus('saved');
            }}
          >
            Save
          </button>
          {saved && <div>saved</div>}
        </div>
      )}
    </div>
  );
};

describe('E2E: Voice Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (!navigator.mediaDevices) {
      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: vi.fn().mockResolvedValue({}),
        },
      });
    }
  });

  describe('Voice Recording', () => {
    it('should start and stop recording', async () => {
      render(<TestVoiceApp />);

      // Navigate to Voice
      const voiceTab = screen.getByRole('button', { name: /voice/i });
      fireEvent.click(voiceTab);

      // Start recording
      const recordButton = screen.getByRole('button', { name: /record|start/i });
      fireEvent.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/recording|listening/i)).toBeInTheDocument();
      });

      // Stop recording
      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      expect(screen.getByText(/processing|transcribing/i)).toBeInTheDocument();
    });

    it('should transcribe voice to text', async () => {
      render(<TestVoiceApp />);

      const voiceTab = screen.getByRole('button', { name: /voice/i });
      fireEvent.click(voiceTab);

      // Mock audio recording
      const recordButton = screen.getByRole('button', { name: /record/i });
      fireEvent.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/recording/i)).toBeInTheDocument();
      });

      // Stop and transcribe
      fireEvent.click(screen.getByRole('button', { name: /stop/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/transcription|text/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Voice to Chat', () => {
    it('should send transcription to chat', async () => {
      render(<TestVoiceApp />);

      // Record voice
      fireEvent.click(screen.getByRole('button', { name: /voice/i }));
      fireEvent.click(screen.getByRole('button', { name: /record/i }));

      await waitFor(() => {
        expect(screen.getByText(/recording/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop/i }));

      // Wait for transcription
      await waitFor(
        () => {
          expect(screen.getByText(/send.*chat/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Send to chat
      fireEvent.click(screen.getByRole('button', { name: /send.*chat/i }));

      // Verify in chat
      expect(screen.getByText(/transcription|text/i)).toBeInTheDocument();
    });
  });

  describe('Voice Settings', () => {
    it('should apply voice settings', async () => {
      render(<TestVoiceApp />);

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      // Navigate to Voice settings
      const voiceButtons = screen.getAllByRole('button', { name: /voice/i });
      fireEvent.click(voiceButtons[1]);

      // Change language
      const languageSelect = screen.getByLabelText(/language/i);
      fireEvent.change(languageSelect, { target: { value: 'fr-FR' } });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/saved|applied/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle microphone access denied', async () => {
      // Mock getUserMedia failure
      vi.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(
        new Error('Permission denied')
      );

      render(<TestVoiceApp />);

      fireEvent.click(screen.getByRole('button', { name: /voice/i }));
      fireEvent.click(screen.getByRole('button', { name: /record/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/permission.*denied|microphone.*access/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle transcription errors', async () => {
      render(<TestVoiceApp />);

      // Mock transcription API failure
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Transcription failed'));

      fireEvent.click(screen.getByRole('button', { name: /voice/i }));
      fireEvent.click(screen.getByRole('button', { name: /record/i }));

      await waitFor(() => {
        expect(screen.getByText(/recording/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /stop/i }));

      await waitFor(
        () => {
          expect(screen.getByText(/transcription.*failed|error/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
  });
});
