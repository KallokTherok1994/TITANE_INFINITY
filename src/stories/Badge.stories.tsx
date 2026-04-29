import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
    size: { control: 'select', options: ['sm', 'default'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Étiquette' } };
export const Success: Story = { args: { children: 'Actif', variant: 'success' } };
export const Error: Story = { args: { children: 'Erreur', variant: 'error' } };
export const Warning: Story = { args: { children: 'Avertissement', variant: 'warning' } };
export const Info: Story = { args: { children: 'Info', variant: 'info' } };
export const Small: Story = { args: { children: 'v31.2', size: 'sm', variant: 'default' } };
