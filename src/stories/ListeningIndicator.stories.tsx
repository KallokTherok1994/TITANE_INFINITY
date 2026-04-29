import type { Meta, StoryObj } from '@storybook/react';
import { ListeningIndicator } from '@/components/audio/ListeningIndicator';

const meta = {
  title: 'Audio/ListeningIndicator',
  component: ListeningIndicator,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof ListeningIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { isActive: true },
};

export const ActiveWithTranscript: Story = {
  args: {
    isActive: true,
    transcript: 'Bonjour TITANE, quel est mon planning du jour ?',
  },
};

export const Inactive: Story = {
  args: { isActive: false },
};
