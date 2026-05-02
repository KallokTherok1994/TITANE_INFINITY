import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { fn } from '@storybook/test';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: { onClick: fn() },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Action', variant: 'default' } };
export const Primary: Story = { args: { children: 'Confirmer', variant: 'primary' } };
export const Destructive: Story = {
  args: { children: 'Supprimer', variant: 'destructive' },
};
export const Outline: Story = { args: { children: 'Annuler', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Ignorer', variant: 'ghost' } };
export const Small: Story = {
  args: { children: 'Petit', variant: 'primary', size: 'sm' },
};
export const Large: Story = {
  args: { children: 'Grand', variant: 'primary', size: 'lg' },
};
export const Loading: Story = {
  args: { children: 'Chargement...', variant: 'primary', loading: true },
};
export const Disabled: Story = {
  args: { children: 'Désactivé', variant: 'primary', disabled: true },
};
