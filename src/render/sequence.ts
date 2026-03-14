import type { LayoutResult } from '../layout/types.js';
import type { Message, Note, Block } from '../parse/sequence.js';
import type { Theme } from './theme.js';
import { rect, roundRect, line, text, path, defs, arrowDefs, shadowFilter, nodeGradientDefs, gradientFill } from './svg.js';

const BLOCK_LABEL_CHAR_WIDTH = 8;
const BLOCK_LABEL_PADDING = 16;
const BLOCK_LABEL_HEIGHT = 20;
const SHADOW = 'url(#shadow)';

export function renderSequence(layout: LayoutResult, theme: Theme): string {
  const gradColors = [theme.participantFill, theme.noteFill, theme.blockLabelFill];
  const out: string[] = [defs([arrowDefs(theme), shadowFilter(), nodeGradientDefs(gradColors)].join('\n'))];

  // lifelines
  for (const node of layout.nodes) {
    const data = node.data as Record<string, unknown>;
    if (data.kind === 'lifeline') {
      out.push(line(node.x, node.y, node.x, node.y + node.height, { stroke: theme.lifeline, strokeWidth: 1, strokeDasharray: '6,4', cssClass: 'vp-d-lifeline' }));
    }
  }

  // block groups
  for (const group of layout.groups) {
    const block = group.data as Block;
    out.push(roundRect(group.x, group.y, group.width, group.height, 6, { fill: 'none', stroke: theme.blockStroke, strokeWidth: 1, cssClass: 'vp-d-block' }));

    const labelW = block.type.length * BLOCK_LABEL_CHAR_WIDTH + BLOCK_LABEL_PADDING;
    out.push(rect(group.x, group.y, labelW, BLOCK_LABEL_HEIGHT, { fill: gradientFill(theme.blockLabelFill), stroke: theme.blockStroke, strokeWidth: 1, rx: 6, cssClass: 'vp-d-block-label-bg' }));
    out.push(text(group.x + labelW / 2, group.y + 10, block.type, { fill: theme.blockLabelColor, fontSize: 11, fontWeight: 'bold', cssClass: 'vp-d-block-label' }));

    if (group.label && group.label !== block.type) {
      const cond = group.label.replace(/^[^\[]*\[/, '').replace(/\]$/, '');
      if (cond) out.push(text(group.x + labelW + 8, group.y + 14, cond, { fill: theme.blockLabelColor, fontSize: 11, textAnchor: 'start', dominantBaseline: 'auto', cssClass: 'vp-d-block-label' }));
    }
  }

  // participant boxes
  for (const node of layout.nodes) {
    const data = node.data as Record<string, unknown>;
    if (data.kind !== 'participant-box') continue;

    const x = node.x - node.width / 2, y = node.y - node.height / 2;

    if (data.type === 'actor') {
      const cx = node.x, headY = y + 8;
      out.push('<g class="vp-d-actor">');
      out.push(`<circle cx="${cx}" cy="${headY}" r="6" fill="none" stroke="${theme.actorColor}" stroke-width="1.5"/>`);
      out.push(line(cx, headY + 6, cx, headY + 18, { stroke: theme.actorColor, strokeWidth: 1.5 }));
      out.push(line(cx - 10, headY + 10, cx + 10, headY + 10, { stroke: theme.actorColor, strokeWidth: 1.5 }));
      out.push(line(cx, headY + 18, cx - 8, headY + 28, { stroke: theme.actorColor, strokeWidth: 1.5 }));
      out.push(line(cx, headY + 18, cx + 8, headY + 28, { stroke: theme.actorColor, strokeWidth: 1.5 }));
      out.push('</g>');
      out.push(text(cx, y + node.height + 10, data.label as string, { fill: theme.participantTextColor, fontSize: theme.fontSize, cssClass: 'vp-d-participant-text' }));
    } else {
      out.push(roundRect(x, y, node.width, node.height, 6, { fill: gradientFill(theme.participantFill), stroke: theme.participantStroke, strokeWidth: 1.5, filter: SHADOW, cssClass: 'vp-d-participant' }));
      out.push(text(node.x, node.y, data.label as string, { fill: theme.participantTextColor, fontSize: theme.fontSize, fontWeight: '600', fontFamily: theme.fontFamily, cssClass: 'vp-d-participant-text' }));
    }
  }

  // notes
  for (const node of layout.nodes) {
    const data = node.data as Record<string, unknown>;
    if (data.kind !== 'note') continue;

    const note = node.data as Note;
    const x = node.x - node.width / 2, y = node.y - node.height / 2, fold = 8;
    const d = `M ${x} ${y} L ${x + node.width - fold} ${y} L ${x + node.width} ${y + fold} L ${x + node.width} ${y + node.height} L ${x} ${y + node.height} Z`;
    out.push(path(d, { fill: gradientFill(theme.noteFill), stroke: theme.noteStroke, strokeWidth: 1, cssClass: 'vp-d-note' }));
    out.push(path(`M ${x + node.width - fold} ${y} L ${x + node.width - fold} ${y + fold} L ${x + node.width} ${y + fold}`, { stroke: theme.noteStroke, strokeWidth: 1, cssClass: 'vp-d-note' }));
    out.push(text(node.x, node.y, note.text, { fill: theme.noteTextColor, fontSize: 12, cssClass: 'vp-d-note-text' }));
  }

  // messages
  for (const edge of layout.edges) {
    const msg = edge.data as Message;
    if (!msg || msg.kind !== 'message') continue;

    const start = edge.points[0], end = edge.points[edge.points.length - 1];
    const dash = msg.lineStyle === 'dotted' ? '6,4' : undefined;
    const marker = msg.arrowHead === 'arrow' ? 'url(#arrow-normal)' : msg.arrowHead === 'cross' ? 'url(#arrow-cross)' : 'url(#arrow-open)';

    if (edge.points.length === 2) {
      out.push(line(start.x, start.y, end.x, end.y, { stroke: theme.edgeColor, strokeWidth: 1.5, strokeDasharray: dash, markerEnd: marker, cssClass: 'vp-d-message' }));
    } else {
      const d = edge.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
      out.push(path(d, { stroke: theme.edgeColor, strokeWidth: 1.5, strokeDasharray: dash, markerEnd: marker, cssClass: 'vp-d-message' }));
    }

    out.push(text((start.x + end.x) / 2, start.y - 8, msg.text, { fill: theme.messageLabelColor, fontSize: 12, cssClass: 'vp-d-message-label' }));
  }

  return out.join('\n');
}
