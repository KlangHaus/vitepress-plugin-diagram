// Core diagram renderer
export { render, type RenderOptions } from './diagram.js';

// Re-export everything from diagram for advanced usage
export * from './parse/index.js';
export * from './layout/index.js';
export { renderSVG, defaultTheme, measureText, measureNodeSize } from './render/index.js';
export type { Theme } from './render/theme.js';
export type { DiagramKind } from './render/index.js';
export type { Point } from './util/math.js';

// VitePress / markdown-it plugin
export { diagramPlugin } from './markdown-it.js';

// Vite plugin
export { viteDiagramPlugin } from './vite.js';
