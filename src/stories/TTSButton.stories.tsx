import type { Meta, StoryObj } from '@storybook/react';
import { TTSButton } from '@/components/tts/TTSButton';
import { fn } from '@storybook/test';

const meta = {
  title: 'TTS/TTSButton',
  component: TTSButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onSpeakStart: fn(),
    onSpeakEnd: fn(),
  },
} satisfies Meta<typeof TTSButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { text: 'Bonjour, je suis TITANE∞', size: 'medium' },
};
export const Small: Story = {
  args: { text: 'Texte court', size: 'small' },
};
export const Large: Story = {
  args: { text: 'Synthèse vocale avancée TITANE∞', size: 'large' },
};
export const Disabled: Story = {
  args: { text: 'Désactivé', size: 'medium', disabled: true },
};
export const EmptyText: Story = {
  args: { text: '', size: 'medium' },
};
