import type { Meta, StoryObj } from '@storybook/react';
import { DevSudoBadge } from '@/components/dev/DevSudoBadge';

const meta = {
  title: 'Dev/DevSudoBadge',
  component: DevSudoBadge,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof DevSudoBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { active: true, compact: false },
};

export const Compact: Story = {
  args: { active: true, compact: true },
};

export const Inactive: Story = {
  args: { active: false },
};
