import { defineConfig } from 'vitepress';
import { diagramPlugin } from '../../src/index';

export default defineConfig({
  title: 'vitepress-plugin-mermaid-diagram',
  description: 'Build-time Mermaid-compatible diagram renderer — no mermaid.js required',
  base: '/vitepress-plugin-diagram/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Diagrams', items: [
        { text: 'Flowchart', link: '/diagrams/flowchart' },
        { text: 'Sequence', link: '/diagrams/sequence' },
        { text: 'Class Diagram', link: '/diagrams/class-diagram' },
      ]},
      { text: 'Configuration', link: '/config/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'How It Works', link: '/guide/how-it-works' },
            { text: 'Mermaid Syntax', link: '/guide/mermaid-syntax' },
            { text: 'Sugiyama Algorithm', link: '/guide/sugiyama' },
          ],
        },
      ],
      '/diagrams/': [
        {
          text: 'Diagram Types',
          items: [
            { text: 'Flowchart', link: '/diagrams/flowchart' },
            { text: 'Sequence Diagram', link: '/diagrams/sequence' },
            { text: 'Class Diagram', link: '/diagrams/class-diagram' },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Theme', link: '/config/' },
          ],
        },
      ],
    },
  },

  markdown: {
    config(md) {
      md.use(diagramPlugin, { preview: true });
    },
  },
});
