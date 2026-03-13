import type { Theme } from './theme.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function attrs(a: Record<string, string | number | undefined>): string {
  return Object.entries(a)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`)
    .join(' ');
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Shapes ──────────────────────────────────────────────────────────────────

export interface ShapeOpts {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  cssClass?: string;
  rx?: number;
  ry?: number;
}

export function rect(x: number, y: number, w: number, h: number, opts: ShapeOpts = {}): string {
  return `<rect ${attrs({ x, y, width: w, height: h, fill: opts.fill ?? 'none', stroke: opts.stroke ?? '#333', 'stroke-width': opts.strokeWidth ?? 1, 'stroke-dasharray': opts.strokeDasharray, rx: opts.rx, ry: opts.ry, class: opts.cssClass })}/>`;
}

export function roundRect(x: number, y: number, w: number, h: number, r: number, opts: ShapeOpts = {}): string {
  return rect(x, y, w, h, { ...opts, rx: r, ry: r });
}

export function circle(cx: number, cy: number, r: number, opts: ShapeOpts = {}): string {
  return `<circle ${attrs({ cx, cy, r, fill: opts.fill ?? 'none', stroke: opts.stroke ?? '#333', 'stroke-width': opts.strokeWidth ?? 1, class: opts.cssClass })}/>`;
}

export function polygon(points: [number, number][], opts: ShapeOpts = {}): string {
  const pts = points.map(([x, y]) => `${x},${y}`).join(' ');
  return `<polygon ${attrs({ points: pts, fill: opts.fill ?? 'none', stroke: opts.stroke ?? '#333', 'stroke-width': opts.strokeWidth ?? 1, 'stroke-dasharray': opts.strokeDasharray, class: opts.cssClass })}/>`;
}

export function diamond(cx: number, cy: number, w: number, h: number, opts: ShapeOpts = {}): string {
  const hw = w / 2, hh = h / 2;
  return polygon([[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]], opts);
}

export function hexagon(cx: number, cy: number, w: number, h: number, opts: ShapeOpts = {}): string {
  const hw = w / 2, hh = h / 2, inset = w * 0.15;
  return polygon([
    [cx - hw + inset, cy - hh], [cx + hw - inset, cy - hh], [cx + hw, cy],
    [cx + hw - inset, cy + hh], [cx - hw + inset, cy + hh], [cx - hw, cy],
  ], opts);
}

export function stadium(x: number, y: number, w: number, h: number, opts: ShapeOpts = {}): string {
  return roundRect(x, y, w, h, h / 2, opts);
}

// ── Text ────────────────────────────────────────────────────────────────────

export interface TextOpts {
  fill?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  dominantBaseline?: string;
  cssClass?: string;
}

export function text(x: number, y: number, content: string, opts: TextOpts = {}): string {
  const fontSize = opts.fontSize ?? 14;
  const baseAttrs = { fill: opts.fill ?? '#333', 'font-size': fontSize, 'font-family': opts.fontFamily, 'font-weight': opts.fontWeight, 'text-anchor': opts.textAnchor ?? 'middle', 'dominant-baseline': opts.dominantBaseline ?? 'central', class: opts.cssClass };

  const lines = content.split('\n');
  if (lines.length === 1) {
    return `<text ${attrs({ x, y, ...baseAttrs })}>${escapeXml(content)}</text>`;
  }

  // Multiline: center the block vertically around y using <tspan> elements
  const lineHeight = fontSize * 1.4;
  const startY = y - (lineHeight * (lines.length - 1)) / 2;
  const tspans = lines.map((line, i) =>
    `<tspan x="${x}"${i > 0 ? ` dy="${lineHeight}"` : ''}>${escapeXml(line)}</tspan>`,
  ).join('');
  return `<text ${attrs({ x, y: startY, ...baseAttrs })}>${tspans}</text>`;
}

// ── Lines & paths ───────────────────────────────────────────────────────────

export interface LineOpts {
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  markerEnd?: string;
  markerStart?: string;
  cssClass?: string;
}

export function line(x1: number, y1: number, x2: number, y2: number, opts: LineOpts = {}): string {
  return `<line ${attrs({ x1, y1, x2, y2, stroke: opts.stroke ?? '#333', 'stroke-width': opts.strokeWidth ?? 1, 'stroke-dasharray': opts.strokeDasharray, 'marker-end': opts.markerEnd, 'marker-start': opts.markerStart, class: opts.cssClass })}/>`;
}

export function path(d: string, opts: LineOpts & { fill?: string } = {}): string {
  return `<path ${attrs({ d, fill: opts.fill ?? 'none', stroke: opts.stroke ?? '#333', 'stroke-width': opts.strokeWidth ?? 1, 'stroke-dasharray': opts.strokeDasharray, 'marker-end': opts.markerEnd, 'marker-start': opts.markerStart, class: opts.cssClass })}/>`;
}

// ── Structural ──────────────────────────────────────────────────────────────

export function defs(content: string): string { return `<defs>\n${content}\n</defs>`; }

export function wrap(content: string, width: number, height: number, padding = 20, styleBlock?: string): string {
  const w = width + padding * 2, h = height + padding * 2;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">`,
  ];
  if (styleBlock) parts.push(`<style>${styleBlock}</style>`);
  parts.push(
    `<g transform="translate(${padding},${padding})">`,
    content,
    '</g>',
    '</svg>',
  );
  return parts.join('\n');
}

// ── Arrow markers ───────────────────────────────────────────────────────────

export function arrowDefs(theme: Theme): string {
  const c = theme.arrowColor;
  return [
    `<marker id="arrow-normal" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${c}" class="vp-d-arrow-filled"/></marker>`,
    `<marker id="arrow-open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="${c}" stroke-width="1.5" class="vp-d-arrow-stroke"/></marker>`,
    `<marker id="arrow-cross" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 2 2 L 8 8 M 8 2 L 2 8" fill="none" stroke="${c}" stroke-width="1.5" class="vp-d-arrow-stroke"/></marker>`,
    `<marker id="arrow-circle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><circle cx="5" cy="5" r="4" fill="${c}" class="vp-d-arrow-filled"/></marker>`,
    `<marker id="arrow-diamond-filled" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="${c}" class="vp-d-arrow-filled"/></marker>`,
    `<marker id="arrow-diamond-open" viewBox="0 0 12 12" refX="12" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 6 L 6 0 L 12 6 L 6 12 z" fill="white" stroke="${c}" class="vp-d-arrow-open"/></marker>`,
    `<marker id="arrow-triangle-open" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="white" stroke="${c}" class="vp-d-arrow-open"/></marker>`,
  ].join('\n');
}
