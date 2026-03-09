import type MarkdownIt from 'markdown-it';
import { render, type RenderOptions } from './diagram.js';

export function diagramPlugin(md: MarkdownIt, options?: RenderOptions): void {
  const originalFence = md.renderer.rules.fence!;

  md.renderer.rules.fence = function (tokens, idx, mdOptions, env, self) {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info === 'mermaid' || info === 'diagram') {
      try {
        const svg = render(token.content, options);
        if (svg) return `<div class="vp-diagram">${svg}</div>`;
      } catch {
        // Fall through to default on parse error
      }
    }

    return originalFence.call(this, tokens, idx, mdOptions, env, self);
  };
}
