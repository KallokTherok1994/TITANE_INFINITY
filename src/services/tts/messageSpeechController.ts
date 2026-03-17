import { useSyncExternalStore } from 'react';
import {
  audioService,
  type AudioPlaybackProvider,
} from '@/features/audio-center/services/audioService';

export type MessageSpeechStatus =
  | 'idle'
  | 'loading'
  | 'speaking'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'error';

export interface MessageSpeechState {
  messageId: string;
  status: MessageSpeechStatus;
  provider: AudioPlaybackProvider;
  error: string | null;
  supportsPause: boolean;
  canPlay: boolean;
}

interface MessageSpeechRecord {
  status: MessageSpeechStatus;
  provider: AudioPlaybackProvider;
  error: string | null;
  supportsPause: boolean;
  speakableText: string;
}

interface ControllerState {
  activeMessageId: string | null;
  records: Record<string, MessageSpeechRecord>;
}

const listeners = new Set<() => void>();

let controllerState: ControllerState = {
  activeMessageId: null,
  records: {},
};

const emitChange = () => {
  listeners.forEach(listener => listener());
};

const updateState = (updater: (current: ControllerState) => ControllerState) => {
  controllerState = updater(controllerState);
  emitChange();
};

const buildDefaultRecord = (speakableText: string): MessageSpeechRecord => ({
  status: 'idle',
  provider: null,
  error: null,
  supportsPause: true,
  speakableText,
});

export const extractSpeakableText = (content: string): string => {
  const normalized = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return normalized || content.trim();
};

class MessageSpeechController {
  private runtimePoll: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  getState(): ControllerState {
    return controllerState;
  }

  getMessageState(messageId: string, content: string): MessageSpeechState {
    const speakableText = extractSpeakableText(content);
    const record = controllerState.records[messageId] ?? buildDefaultRecord(speakableText);

    return {
      messageId,
      status: record.status,
      provider: record.provider,
      error: record.error,
      supportsPause: record.supportsPause,
      canPlay: speakableText.length > 0,
    };
  }

  private updateMessage(messageId: string, patch: Partial<MessageSpeechRecord>) {
    updateState(current => {
      const existing = current.records[messageId] ?? buildDefaultRecord('');
      return {
        ...current,
        records: {
          ...current.records,
          [messageId]: {
            ...existing,
            ...patch,
          },
        },
      };
    });
  }

  private setActiveMessage(messageId: string | null) {
    updateState(current => ({
      ...current,
      activeMessageId: messageId,
    }));
  }

  private startRuntimePoll(messageId: string) {
    this.stopRuntimePoll();
    this.runtimePoll = setInterval(() => {
      void this.refreshRuntime(messageId);
    }, 250);
  }

  private stopRuntimePoll() {
    if (this.runtimePoll !== null) {
      clearInterval(this.runtimePoll);
      this.runtimePoll = null;
    }
  }

  private async refreshRuntime(messageId: string): Promise<void> {
    if (controllerState.activeMessageId !== messageId) {
      return;
    }

    const runtime = await audioService.getPlaybackRuntimeState();
    const current = controllerState.records[messageId];
    if (!current) {
      return;
    }

    if (runtime.paused) {
      this.updateMessage(messageId, {
        status: 'paused',
        provider: runtime.provider,
        supportsPause: runtime.supportsPause,
      });
      return;
    }

    if (runtime.speaking) {
      this.updateMessage(messageId, {
        status: 'speaking',
        provider: runtime.provider,
        supportsPause: runtime.supportsPause,
      });
    }
  }

  async playMessage(messageId: string, content: string): Promise<void> {
    const speakableText = extractSpeakableText(content);
    if (!speakableText) {
      this.updateMessage(messageId, {
        status: 'error',
        error: 'Aucun texte lisible à vocaliser.',
        provider: null,
        supportsPause: false,
        speakableText,
      });
      return;
    }

    if (controllerState.activeMessageId && controllerState.activeMessageId !== messageId) {
      await this.stop();
    }

    this.setActiveMessage(messageId);
    this.updateMessage(messageId, {
      status: 'loading',
      error: null,
      provider: null,
      supportsPause: true,
      speakableText,
    });
    this.startRuntimePoll(messageId);

    try {
      await audioService.speak(speakableText, {
        onStart: provider => {
          this.updateMessage(messageId, {
            status: provider === 'webspeech' ? 'speaking' : 'loading',
            provider,
            error: null,
            supportsPause: true,
          });
        },
        onFallback: provider => {
          this.updateMessage(messageId, {
            status: 'loading',
            provider,
            error: null,
            supportsPause: true,
          });
        },
      });
      this.updateMessage(messageId, {
        status: 'completed',
        provider: null,
        error: null,
        supportsPause: true,
      });
    } catch (error) {
      this.updateMessage(messageId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Lecture audio indisponible.',
        provider: null,
        supportsPause: true,
      });
    } finally {
      this.stopRuntimePoll();
      if (controllerState.activeMessageId === messageId) {
        this.setActiveMessage(null);
      }
    }
  }

  async pause(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    if (!activeMessageId) {
      return;
    }

    await audioService.pause();
    this.updateMessage(activeMessageId, {
      status: 'paused',
      provider: controllerState.records[activeMessageId]?.provider ?? null,
      supportsPause: true,
    });
  }

  async resume(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    if (!activeMessageId) {
      return;
    }

    await audioService.resume();
    this.updateMessage(activeMessageId, {
      status: 'speaking',
      provider: controllerState.records[activeMessageId]?.provider ?? null,
      supportsPause: true,
    });
  }

  async stop(): Promise<void> {
    const activeMessageId = controllerState.activeMessageId;
    this.stopRuntimePoll();
    await audioService.stop();

    if (activeMessageId) {
      this.updateMessage(activeMessageId, {
        status: 'stopped',
        provider: null,
        error: null,
        supportsPause: true,
      });
    }

    this.setActiveMessage(null);
  }
}

export const messageSpeechController = new MessageSpeechController();

export const useMessageSpeechState = (
  messageId: string,
  content: string
): MessageSpeechState => {
  useSyncExternalStore(
    listener => messageSpeechController.subscribe(listener),
    () => messageSpeechController.getState(),
    () => messageSpeechController.getState()
  );

  return messageSpeechController.getMessageState(messageId, content);
};