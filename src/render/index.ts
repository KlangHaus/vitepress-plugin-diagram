import type { LayoutResult } from '../layout/types.js';
import type { Theme } from './theme.js';
import { wrap } from './svg.js';
import { renderFlowchart } from './flowchart.js';
import { renderSequence } from './sequence.js';
import { renderClassDiagram } from './class-diagram.js';

export type DiagramKind = 'flowchart' | 'sequence' | 'classDiagram';

export function renderSVG(layout: LayoutResult, kind: DiagramKind, theme: Theme): string {
  let content: string;

  switch (kind) {
    case 'flowchart':    content = renderFlowchart(layout, theme); break;
    case 'sequence':     content = renderSequence(layout, theme); break;
    case 'classDiagram': content = renderClassDiagram(layout, theme); break;
  }

  return wrap(content, layout.width, layout.height);
}

export { defaultTheme, type Theme } from './theme.js';
export { measureText, measureNodeSize } from './measure.js';
