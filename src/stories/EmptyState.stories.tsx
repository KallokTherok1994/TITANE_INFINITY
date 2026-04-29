import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { fn } from '@storybook/test';

const meta = {
  title: 'Feedback/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  args: { onAction: fn() },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: { title: 'Aucune donnée disponible' },
};

export const WithDescription: Story = {
  args: {
    title: 'Aucune conversation',
    description: 'Posez une question à TITANE∞ pour démarrer.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Aucune conversation',
    description: 'Démarrez une nouvelle session pour explorer TITANE∞.',
    actionLabel: 'Nouvelle conversation',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Aucun résultat',
    description: 'Modifiez vos filtres de recherche.',
    actionLabel: 'Réinitialiser',
  },
};
