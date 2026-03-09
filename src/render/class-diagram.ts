import type { LayoutResult } from '../layout/types.js';
import type { ClassDef, ClassRelationship, Visibility } from '../parse/class-diagram.js';
import type { Theme } from './theme.js';
import { rect, line, text, path, defs, arrowDefs } from './svg.js';
import { smoothPathD, pointsToPathD } from '../util/math.js';

export function renderClassDiagram(layout: LayoutResult, theme: Theme): string {
  const out: string[] = [defs(arrowDefs(theme))];

  // namespace groups
  for (const g of layout.groups) {
    out.push(rect(g.x, g.y, g.width, g.height, { fill: theme.namespaceFill, stroke: theme.namespaceStroke, strokeDasharray: '8,4', rx: 4, ry: 4 }));
    if (g.label) out.push(text(g.x + 8, g.y + 14, g.label, { fill: theme.namespaceLabelColor, fontSize: 12, fontWeight: 'bold', textAnchor: 'start', dominantBaseline: 'auto' }));
  }

  // relationships
  for (const edge of layout.edges) {
    const rel = edge.data as ClassRelationship;
    const marker = relationMarker(rel?.type ?? 'association');
    const dash = isDashed(rel?.type) ? '6,4' : undefined;

    if (edge.points.length >= 2) {
      const d = edge.points.length > 2 ? smoothPathD(edge.points) : pointsToPathD(edge.points);
      out.push(path(d, { stroke: theme.edgeColor, strokeWidth: 1.5, strokeDasharray: dash, markerEnd: marker }));
    }

    if (rel?.label && edge.points.length >= 2) {
      const mid = edge.points[Math.floor(edge.points.length / 2)];
      out.push(text(mid.x, mid.y - 8, rel.label, { fill: theme.relationLabelColor, fontSize: 11 }));
    }

    if (rel?.fromCardinality && edge.points.length >= 2) {
      const p = edge.points[0];
      out.push(text(p.x + 10, p.y - 8, rel.fromCardinality, { fill: theme.relationLabelColor, fontSize: 10, textAnchor: 'start' }));
    }
    if (rel?.toCardinality && edge.points.length >= 2) {
      const p = edge.points[edge.points.length - 1];
      out.push(text(p.x - 10, p.y - 8, rel.toCardinality, { fill: theme.relationLabelColor, fontSize: 10, textAnchor: 'end' }));
    }
  }

  // class boxes
  for (const node of layout.nodes) {
    const cls = node.data as ClassDef;
    const x = node.x - node.width / 2, y = node.y - node.height / 2;
    const lineH = 14 * 1.6, pad = 8;

    out.push(rect(x, y, node.width, node.height, { fill: theme.classBodyFill, stroke: theme.classStroke, strokeWidth: 1.5 }));

    let cy = y + pad;

    // annotation
    if (cls.annotation) {
      out.push(text(node.x, cy + 6, `\u00AB${cls.annotation}\u00BB`, { fill: theme.annotationColor, fontSize: 11, fontFamily: theme.fontFamily }));
      cy += lineH * 0.8;
    }

    // header background
    const headerH = cy - y + lineH;
    out.push(rect(x, y, node.width, headerH, { fill: theme.classHeaderFill, stroke: theme.classStroke, strokeWidth: 1.5 }));

    // re-render annotation on top
    if (cls.annotation) out.push(text(node.x, y + pad + 6, `\u00AB${cls.annotation}\u00BB`, { fill: theme.classHeaderTextColor, fontSize: 11 }));

    // class name
    let nameLabel = cls.id;
    if (cls.generic) nameLabel += `~${cls.generic}~`;
    out.push(text(node.x, cy + lineH / 2, nameLabel, { fill: theme.classHeaderTextColor, fontSize: 14, fontWeight: 'bold', fontFamily: theme.fontFamily }));
    cy += lineH;

    // separator + attributes
    out.push(line(x, cy, x + node.width, cy, { stroke: theme.classSectionStroke, strokeWidth: 1 }));
    cy += 4;

    const attrs = cls.members.filter((m) => !m.isMethod);
    if (attrs.length === 0) { cy += lineH; }
    else { for (const a of attrs) { out.push(text(x + pad, cy + lineH / 2, `${vis(a.visibility)}${a.raw.replace(/^[+\-#~]\s*/, '')}`, { fill: theme.classTextColor, fontSize: 12, textAnchor: 'start', fontFamily: theme.fontFamily })); cy += lineH; } }

    // separator + methods
    out.push(line(x, cy, x + node.width, cy, { stroke: theme.classSectionStroke, strokeWidth: 1 }));
    cy += 4;

    const methods = cls.members.filter((m) => m.isMethod);
    for (const m of methods) {
      out.push(text(x + pad, cy + lineH / 2, `${vis(m.visibility)}${m.raw.replace(/^[+\-#~]\s*/, '')}`, { fill: theme.classTextColor, fontSize: 12, textAnchor: 'start', fontFamily: theme.fontFamily }));
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
