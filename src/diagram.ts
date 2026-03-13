import { detectDiagramType } from './parse/tokenizer.js';
import { parseFlowchart } from './parse/flowchart.js';
import { parseSequence } from './parse/sequence.js';
import { parseClassDiagram } from './parse/class-diagram.js';
import { layoutFlowchart, type FlowchartLayoutConfig } from './layout/flowchart.js';
import { layoutSequence, type SequenceLayoutConfig } from './layout/sequence.js';
import { layoutClassDiagram, type ClassLayoutConfig } from './layout/class-diagram.js';
import { renderSVG } from './render/index.js';
import { defaultTheme, darkTheme as defaultDarkTheme, type Theme } from './render/theme.js';
import type { LayoutResult } from './layout/types.js';

export interface RenderOptions {
  theme?: Partial<Theme>;
  /** Dark mode theme. Set to `false` to disable dark mode styles. Default: built-in dark theme. */
  darkTheme?: Partial<Theme> | false;
  flowchart?: FlowchartLayoutConfig;
  sequence?: SequenceLayoutConfig;
  classDiagram?: ClassLayoutConfig;
}

/**
 * Parse Mermaid-compatible source and render to an SVG string.
 * Returns `null` if the diagram type is not recognized.
 */
export function render(source: string, options?: RenderOptions): string | null {
  const type = detectDiagramType(source);
  if (!type) return null;

  const theme: Theme = { ...defaultTheme, ...options?.theme };
  const dark: Theme | undefined = options?.darkTheme === false
    ? undefined
    : { ...defaultDarkTheme, ...(typeof options?.darkTheme === 'object' ? options.darkTheme : {}) };
  let layout: LayoutResult;

  switch (type) {
    case 'flowchart':    layout = layoutFlowchart(parseFlowchart(source), options?.flowchart); break;
    case 'sequence':     layout = layoutSequence(parseSequence(source), options?.sequence); break;
    case 'classDiagram': layout = layoutClassDiagram(parseClassDiagram(source), options?.classDiagram); break;
  }

  return renderSVG(layout, type, theme, dark);
}

// Re-export everything for advanced usage
export * from './parse/index.js';
export * from './layout/index.js';
export { renderSVG, defaultTheme, darkTheme, darkModeCSS, measureText, measureNodeSize } from './render/index.js';
export type { Theme } from './render/theme.js';
export type { DiagramKind } from './render/index.js';
export type { Point } from './util/math.js';
