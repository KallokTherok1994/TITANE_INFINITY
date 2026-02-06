/**
 * E2E Tests: Voice Workflow
 * Coverage: Voice input → Transcription → Processing
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '@/App';

describe('E2E: Voice Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Voice Recording', () => {
    it('should start and stop recording', async () => {
      render(<App />);

      // Navigate to Voice
      const voiceTab = screen.getByRole('button', { name: /voice/i });
      fireEvent.click(voiceTab);

      // Start recording
      const recordButton = screen.getByRole('button', { name: /record|start/i });
      fireEvent.click(recordButton);

      expect(screen.getByText(/recording|listening/i)).toBeInTheDocument();

      // Stop recording
      const stopButton = screen.getByRole('button', { name: /stop/i });
      fireEvent.click(stopButton);

      expect(screen.getByText(/processing|transcribing/i)).toBeInTheDocument();
    });

    it('should transcribe voice to text', async () => {
      render(<App />);

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
      render(<App />);

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
      render(<App />);

      // Open settings
      fireEvent.click(screen.getByRole('button', { name: /settings/i }));

      // Navigate to Voice settings
      fireEvent.click(screen.getByText(/voice/i));

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

      render(<App />);

      fireEvent.click(screen.getByRole('button', { name: /voice/i }));
      fireEvent.click(screen.getByRole('button', { name: /record/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/permission.*denied|microphone.*access/i)
        ).toBeInTheDocument();
      });
    });

    it('should handle transcription errors', async () => {
      render(<App />);

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
