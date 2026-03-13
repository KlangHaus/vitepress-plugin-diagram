import type MarkdownIt from 'markdown-it';
import { render, type RenderOptions } from './diagram.js';

export function diagramPlugin(md: MarkdownIt, options?: RenderOptions): void {
  const originalFence = md.renderer.rules.fence!;

  md.renderer.rules.fence = function (tokens, idx, mdOptions, env, self) {
    const token = tokens[idx];
    const info = token.info.trim();

    if (info === 'mermaid' || info === 'diagram') {
      try {
        // Disable inline dark mode <style> to avoid Vue template compiler error
        // ("Tags with side effect are ignored in client component templates").
        // Dark mode is handled via an external CSS file instead.
        const svg = render(token.content, { ...options, darkTheme: false });
        if (svg) return `<div class="vp-diagram">${svg}</div>`;
      } catch {
        // Fall through to default on parse error
      }
    }

    return originalFence.call(this, tokens, idx, mdOptions, env, self);
  };
}
