import type { Meta, StoryObj } from '@storybook/react';
import { StatusPill } from '@/components/devtools/StatusPill';

const meta = {
  title: 'DevTools/StatusPill',
  component: StatusPill,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'error', 'warning'],
    },
  },
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = { args: { status: 'active', label: 'Actif' } };
export const Inactive: Story = { args: { status: 'inactive', label: 'Inactif' } };
export const Error: Story = { args: { status: 'error', label: 'Erreur' } };
export const Warning: Story = { args: { status: 'warning', label: 'Avertissement' } };
export const DefaultLabel: Story = { args: { status: 'active' } };
