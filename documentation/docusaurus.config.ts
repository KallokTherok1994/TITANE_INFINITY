/**
 * ═══════════════════════════════════════════════════════════════
 * TITANE∞ v∞ — Docusaurus Configuration
 * Documentation automation pipeline
 * Super-Prompt K — Synchronisation docs techniques avec code
 * ═══════════════════════════════════════════════════════════════
 */

import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'TITANE∞ Documentation',
  tagline: "Documentation technique — Système d'intelligence cognitive v∞",
  favicon: 'img/titane-favicon.ico',

  url: 'https://docs.titane-infinity.dev',
  baseUrl: '/',

  organizationName: 'KallokTherok1994',
  projectName: 'TITANE_INFINITY',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/KallokTherok1994/TITANE_INFINITY/tree/main/documentation/',
          routeBasePath: '/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/KallokTherok1994/TITANE_INFINITY/tree/main/documentation/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/titane-social-card.jpg',
    navbar: {
      title: 'TITANE∞',
      logo: {
        alt: 'TITANE∞ Logo',
        src: 'img/titane-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'architectureSidebar',
          position: 'left',
          label: 'Architecture',
        },
        {
          type: 'docSidebar',
          sidebarId: 'modulesSidebar',
          position: 'left',
          label: 'Modules',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'API',
        },
        {
          type: 'docSidebar',
          sidebarId: 'guidesSidebar',
          position: 'left',
          label: 'Guides',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/KallokTherok1994/TITANE_INFINITY',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            { label: 'Architecture', to: '/architecture/ARCHITECTURE' },
            { label: 'Modules', to: '/modules/memory' },
            { label: 'API Reference', to: '/api/API_SURFACE' },
          ],
        },
        {
          title: 'Communauté',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/KallokTherok1994/TITANE_INFINITY',
            },
            { label: 'CHANGELOG', to: '/CHANGELOG' },
          ],
        },
        {
          title: 'Légal',
          items: [{ label: 'Licence', to: '/LICENSE' }],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Humain Total / Kevin Thibault / TITANE Team.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['rust', 'toml', 'json', 'bash'],
    },
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
