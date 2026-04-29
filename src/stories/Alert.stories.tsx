import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '@/components/ui/alert';
import { fn } from '@storybook/test';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  args: { onDismiss: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning', 'info'],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Message informatif générique.' },
};
export const Error: Story = {
  args: { children: 'Connexion au backend échouée.', variant: 'error' },
};
export const Success: Story = {
  args: { children: 'Sauvegarde effectuée avec succès.', variant: 'success' },
};
export const Warning: Story = {
  args: { children: 'Mémoire disponible inférieure à 500 MB.', variant: 'warning' },
};
export const Info: Story = {
  args: { children: 'Mise à jour disponible : v31.3.0', variant: 'info' },
};
export const Dismissible: Story = {
  args: { children: 'Cliquez sur × pour fermer.', variant: 'info', dismissible: true },
};
