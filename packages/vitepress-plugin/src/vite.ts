import type { Plugin } from 'vite';
import { render, type RenderOptions } from 'diagram';

export function viteDiagramPlugin(options?: RenderOptions): Plugin {
  return {
    name: 'vite-plugin-diagram',
    enforce: 'pre',

    transform(code, id) {
      if (!id.endsWith('.mmd')) return null;

      const svg = render(code, options);
      if (svg) return { code: `export default ${JSON.stringify(svg)};`, map: null };
      return null;
    },
  };
}
