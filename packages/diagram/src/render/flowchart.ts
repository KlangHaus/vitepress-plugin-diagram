import type { LayoutResult } from '../layout/types.js';
import type { FlowchartNode, FlowchartEdge } from '../parse/flowchart.js';
import type { Theme } from './theme.js';
import { rect, roundRect, circle, diamond, hexagon, stadium, text, path, defs, arrowDefs } from './svg.js';
import { smoothPathD, pointsToPathD } from '../util/math.js';

export function renderFlowchart(layout: LayoutResult, theme: Theme): string {
  const out: string[] = [defs(arrowDefs(theme))];

  // subgraph groups
  for (const g of layout.groups) {
    out.push(rect(g.x, g.y, g.width, g.height, { fill: theme.subgraphFill, stroke: theme.subgraphStroke, strokeDasharray: '5,5', rx: 4, ry: 4 }));
    if (g.label) out.push(text(g.x + 8, g.y + 14, g.label, { fill: theme.subgraphLabelColor, fontSize: 12, textAnchor: 'start', dominantBaseline: 'auto' }));
  }

  // edges
  for (const edge of layout.edges) {
    const data = edge.data as FlowchartEdge;
    const marker = markerEnd(data?.arrowType ?? 'arrow');
    const dash = strokeDash(data?.lineStyle ?? 'solid');
    const sw = data?.lineStyle === 'thick' ? 2.5 : 1.5;

    if (edge.points.length >= 2) {
      const d = edge.points.length > 2 ? smoothPathD(edge.points) : pointsToPathD(edge.points);
      out.push(path(d, { stroke: theme.edgeColor, strokeWidth: sw, strokeDasharray: dash, markerEnd: marker }));
    }

    if (data?.label && edge.points.length >= 2) {
      const mid = edge.points[Math.floor(edge.points.length / 2)];
      out.push(rect(mid.x - 20, mid.y - 10, 40, 20, { fill: theme.edgeLabelBg, stroke: 'none', rx: 3, ry: 3 }));
      out.push(text(mid.x, mid.y, data.label, { fill: theme.edgeLabelColor, fontSize: 12 }));
    }
  }

  // nodes
  for (const node of layout.nodes) {
    const data = node.data as FlowchartNode;
    const x = node.x - node.width / 2, y = node.y - node.height / 2;

    // Semantic colors per shape
    const shapeFill = (shape: string) => {
      switch (shape) {
        case 'diamond':      return { fill: theme.decisionFill, stroke: theme.decisionStroke };
        case 'circle': case 'doubleCircle': case 'stadium':
                             return { fill: theme.terminalFill, stroke: theme.terminalStroke };
        case 'parallelogram': case 'cylinder':
                             return { fill: theme.dataFill, stroke: theme.dataStroke };
        default:             return { fill: theme.processFill, stroke: theme.processStroke };
      }
    };
    const { fill, stroke } = shapeFill(data.shape);
    const opts = { fill, stroke, strokeWidth: 1.5 };

    switch (data.shape) {
      case 'rect':         out.push(rect(x, y, node.width, node.height, opts)); break;
      case 'round':        out.push(roundRect(x, y, node.width, node.height, 8, opts)); break;
      case 'circle':       out.push(circle(node.x, node.y, Math.max(node.width, node.height) / 2, opts)); break;
      case 'doubleCircle': {
        const r = Math.max(node.width, node.height) / 2;
        out.push(circle(node.x, node.y, r, opts)); out.push(circle(node.x, node.y, r - 4, opts)); break;
      }
      case 'diamond':      out.push(diamond(node.x, node.y, node.width, node.height, opts)); break;
      case 'hexagon':      out.push(hexagon(node.x, node.y, node.width, node.height, opts)); break;
      case 'stadium':      out.push(stadium(x, y, node.width, node.height, opts)); break;
      case 'subroutine':
        out.push(rect(x, y, node.width, node.height, opts));
        out.push(rect(x + 8, y, 0, node.height, { stroke }));
        out.push(rect(x + node.width - 8, y, 0, node.height, { stroke }));
        break;
      case 'cylinder':     out.push(renderCylinder(node.x, node.y, node.width, node.height, opts)); break;
      default:             out.push(rect(x, y, node.width, node.height, opts));
    }

    out.push(text(node.x, node.y, data.label, { fill: theme.nodeTextColor, fontSize: theme.fontSize, fontFamily: theme.fontFamily }));
  }

  return out.join('\n');
}

function renderCylinder(cx: number, cy: number, w: number, h: number, opts: { fill?: string; stroke?: string; strokeWidth?: number }): string {
  const x = cx - w / 2, y = cy - h / 2, ry = 8;
  const body = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 1 ${x + w} ${y + ry} L ${x + w} ${y + h - ry} A ${w / 2} ${ry} 0 0 1 ${x} ${y + h - ry} Z`;
  const top = `M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`;
  return [
    path(body, { fill: opts.fill, stroke: opts.stroke, strokeWidth: opts.strokeWidth }),
    path(top, { stroke: opts.stroke, strokeWidth: opts.strokeWidth }),
  ].join('\n');
}

function markerEnd(type: string): string | undefined {
  const map: Record<string, string> = { arrow: 'url(#arrow-normal)', open: 'url(#arrow-open)', circle: 'url(#arrow-circle)', cross: 'url(#arrow-cross)' };
  return map[type];
}

function strokeDash(style: string): string | undefined {
  return style === 'dotted' ? '5,5' : undefined;
}
