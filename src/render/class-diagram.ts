import type { LayoutResult } from '../layout/types.js';
import type { ClassDef, ClassRelationship, Visibility } from '../parse/class-diagram.js';
import type { Theme } from './theme.js';
import { rect, line, text, path, defs, arrowDefs, shadowFilter, nodeGradientDefs, gradientFill } from './svg.js';
import { smoothPathD, pointsToPathD } from '../util/math.js';

const FONT_SIZE = 14;
const LINE_HEIGHT = FONT_SIZE * 1.6;
const BOX_PADDING = 8;
const NODE_CORNER_RADIUS = 6;
const SHADOW = 'url(#shadow)';

export function renderClassDiagram(layout: LayoutResult, theme: Theme): string {
  const gradColors = [theme.classHeaderFill, theme.classBodyFill, theme.namespaceFill];
  const out: string[] = [defs([arrowDefs(theme), shadowFilter(), nodeGradientDefs(gradColors)].join('\n'))];

  // namespace groups
  for (const g of layout.groups) {
    out.push(rect(g.x, g.y, g.width, g.height, { fill: theme.namespaceFill, stroke: theme.namespaceStroke, strokeDasharray: '8,4', rx: 8, ry: 8, cssClass: 'vp-d-namespace' }));
    if (g.label) out.push(text(g.x + 8, g.y + 14, g.label, { fill: theme.namespaceLabelColor, fontSize: 12, fontWeight: 'bold', textAnchor: 'start', dominantBaseline: 'auto', cssClass: 'vp-d-namespace-label' }));
  }

  // relationships
  for (const edge of layout.edges) {
    const rel = edge.data as ClassRelationship;
    const marker = relationMarker(rel?.type ?? 'association');
    const dash = isDashed(rel?.type) ? '6,4' : undefined;

    if (edge.points.length >= 2) {
      const d = edge.points.length > 2 ? smoothPathD(edge.points) : pointsToPathD(edge.points);
      out.push(path(d, { stroke: theme.edgeColor, strokeWidth: 1.5, strokeDasharray: dash, markerEnd: marker, cssClass: 'vp-d-edge' }));
    }

    if (rel?.label && edge.points.length >= 2) {
      const mid = edge.points[Math.floor(edge.points.length / 2)];
      out.push(text(mid.x, mid.y - 8, rel.label, { fill: theme.relationLabelColor, fontSize: 11, cssClass: 'vp-d-relation-label' }));
    }

    if (rel?.fromCardinality && edge.points.length >= 2) {
      const p = edge.points[0];
      out.push(text(p.x + 10, p.y - 8, rel.fromCardinality, { fill: theme.relationLabelColor, fontSize: 10, textAnchor: 'start', cssClass: 'vp-d-relation-label' }));
    }
    if (rel?.toCardinality && edge.points.length >= 2) {
      const p = edge.points[edge.points.length - 1];
      out.push(text(p.x - 10, p.y - 8, rel.toCardinality, { fill: theme.relationLabelColor, fontSize: 10, textAnchor: 'end', cssClass: 'vp-d-relation-label' }));
    }
  }

  // class boxes
  for (const node of layout.nodes) {
    const cls = node.data as ClassDef;
    const x = node.x - node.width / 2, y = node.y - node.height / 2;
    const lineH = LINE_HEIGHT, pad = BOX_PADDING;

    // body background with shadow
    out.push(rect(x, y, node.width, node.height, { fill: gradientFill(theme.classBodyFill), stroke: theme.classStroke, strokeWidth: 1.5, rx: NODE_CORNER_RADIUS, ry: NODE_CORNER_RADIUS, filter: SHADOW, cssClass: 'vp-d-class-body' }));

    let cy = y + pad;

    // annotation
    if (cls.annotation) {
      out.push(text(node.x, cy + 6, `\u00AB${cls.annotation}\u00BB`, { fill: theme.annotationColor, fontSize: 11, fontFamily: theme.fontFamily, cssClass: 'vp-d-annotation' }));
      cy += lineH * 0.8;
    }

    // header background
    const headerH = cy - y + lineH;
    out.push(rect(x, y, node.width, headerH, { fill: gradientFill(theme.classHeaderFill), stroke: theme.classStroke, strokeWidth: 1.5, rx: NODE_CORNER_RADIUS, ry: NODE_CORNER_RADIUS, cssClass: 'vp-d-class-header' }));

    // re-render annotation on top
    if (cls.annotation) out.push(text(node.x, y + pad + 6, `\u00AB${cls.annotation}\u00BB`, { fill: theme.classHeaderTextColor, fontSize: 11, cssClass: 'vp-d-class-header-text' }));

    // class name
    let nameLabel = cls.id;
    if (cls.generic) nameLabel += `~${cls.generic}~`;
    out.push(text(node.x, cy + lineH / 2, nameLabel, { fill: theme.classHeaderTextColor, fontSize: 14, fontWeight: 'bold', fontFamily: theme.fontFamily, cssClass: 'vp-d-class-header-text' }));
    cy += lineH;

    // separator + attributes
    out.push(line(x, cy, x + node.width, cy, { stroke: theme.classSectionStroke, strokeWidth: 1, cssClass: 'vp-d-class-section' }));
    cy += 4;

    const attrs = cls.members.filter((m) => !m.isMethod);
    if (attrs.length === 0) { cy += lineH; }
    else { for (const a of attrs) { out.push(text(x + pad, cy + lineH / 2, `${vis(a.visibility)}${a.raw.replace(/^[+\-#~]\s*/, '')}`, { fill: theme.classTextColor, fontSize: 12, textAnchor: 'start', fontFamily: theme.fontFamily, cssClass: 'vp-d-class-text' })); cy += lineH; } }

    // separator + methods
    out.push(line(x, cy, x + node.width, cy, { stroke: theme.classSectionStroke, strokeWidth: 1, cssClass: 'vp-d-class-section' }));
    cy += 4;

    const methods = cls.members.filter((m) => m.isMethod);
    for (const m of methods) {
      out.push(text(x + pad, cy + lineH / 2, `${vis(m.visibility)}${m.raw.replace(/^[+\-#~]\s*/, '')}`, { fill: theme.classTextColor, fontSize: 12, textAnchor: 'start', fontFamily: theme.fontFamily, cssClass: 'vp-d-class-text' }));
      cy += lineH;
    }
  }

  return out.join('\n');
}

function vis(v: Visibility): string {
  const map: Record<string, string> = { public: '+', private: '-', protected: '#', internal: '~' };
  return (v && map[v]) ?? '';
}

function relationMarker(type: string): string | undefined {
  const map: Record<string, string> = {
    inheritance: 'url(#arrow-triangle-open)', realization: 'url(#arrow-triangle-open)',
    composition: 'url(#arrow-diamond-filled)', aggregation: 'url(#arrow-diamond-open)',
    association: 'url(#arrow-normal)', dependency: 'url(#arrow-open)',
  };
  return map[type];
}

function isDashed(type?: string): boolean {
  return type === 'dependency' || type === 'realization' || type === 'link_dashed';
}
