import { defineConfig } from 'vitepress';
import { render, type RenderOptions } from '../../src/index';
import type MarkdownIt from 'markdown-it';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function diagramPlugin(md: MarkdownIt, options?: RenderOptions): void {
  const originalFence = md.renderer.rules.fence!;
  md.renderer.rules.fence = function (tokens, idx, mdOptions, env, self) {
    const token = tokens[idx];
    if (token.info.trim() === 'mermaid' || token.info.trim() === 'diagram') {
      try {
        const svg = render(token.content, options);
        if (svg) {
          const escaped = escapeHtml(token.content.trim());
          return [
            '<DiagramPreview>',
            `<template #preview>${svg}</template>`,
            `<template #code><pre class="diagram-source"><code>${escaped}</code></pre></template>`,
            '</DiagramPreview>',
          ].join('\n');
        }
      } catch { /* fall through */ }
    }
    return originalFence.call(this, tokens, idx, mdOptions, env, self);
  };
}

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
      md.use(diagramPlugin);
    },
  },
});
