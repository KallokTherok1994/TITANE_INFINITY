import type { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from '@/components/devtools/SectionHeader';

const meta = {
  title: 'DevTools/SectionHeader',
  component: SectionHeader,
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = {
  args: { title: 'Moteurs actifs' },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Métriques de performance',
    subtitle: 'Mis à jour toutes les 5 secondes',
  },
};

export const WithAction: Story = {
  args: {
    title: 'Logs système',
    subtitle: '1234 entrées',
    action: '<button>Effacer</button>',
  },
};
