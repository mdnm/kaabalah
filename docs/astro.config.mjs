import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.kaabalah.com',
  trailingSlash: 'always',
  redirects: {
    '/getting-started/getting-started/': '/getting-started/',
    '/getting-started/concepts-and-terminology/': '/getting-started/concepts/',
    '/getting-started/practical-recipes/': '/getting-started/recipes/',
    '/guides/using-kaabalah-in-real-projects/': '/guides/real-projects/',
  },
  integrations: [
    starlight({
      title: 'Kaabalah Docs',
      description:
        'A comprehensive TypeScript library for numerology, astrology, kaabalah, and tarot',
      logo: {
        src: './src/assets/logo.svg',
        alt: 'Kaabalah',
      },
      favicon: '/favicon.svg',
      head: [
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' } },
        { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' } },
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://docs.kaabalah.com/og-image.png' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Kaabalah Docs' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: 'https://docs.kaabalah.com/og-image.png' } },
        { tag: 'meta', attrs: { name: 'theme-color', content: '#000010' } },
        { tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'Kaabalah',
            description: 'A comprehensive TypeScript library for numerology, astrology, kaabalah, gematria, tarot, and Ifa divination',
            url: 'https://docs.kaabalah.com',
            codeRepository: 'https://github.com/mdnm/kaabalah',
            programmingLanguage: 'TypeScript',
            runtimePlatform: 'Node.js',
            license: 'https://opensource.org/licenses/AGPL-3.0',
            applicationCategory: 'DeveloperApplication',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }),
        },
      ],
      social: {
        github: 'https://github.com/mdnm/kaabalah',
      },
      components: {
        Footer: './src/components/Footer.astro',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          autogenerate: { directory: 'getting-started' },
        },
        {
          label: 'Modules',
          autogenerate: { directory: 'modules' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        {
          label: 'About',
          autogenerate: { directory: 'about' },
        },
      ],
    }),
  ],
});
