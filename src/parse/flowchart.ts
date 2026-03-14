import { TokenStream } from './tokenizer.js';
import type { Direction } from './types.js';

// ── Types ───────────────────────────────────────────────────────────────────

export type { Direction } from './types.js';

export type NodeShape =
  | 'rect' | 'round' | 'circle' | 'diamond' | 'hexagon'
  | 'stadium' | 'subroutine' | 'cylinder' | 'doubleCircle'
  | 'asymmetric' | 'parallelogram' | 'parallelogramAlt'
  | 'trapezoid' | 'trapezoidAlt';

export type EdgeLineStyle = 'solid' | 'dotted' | 'thick';
export type ArrowType = 'arrow' | 'open' | 'circle' | 'cross' | 'none';

export interface FlowchartNode {
  id: string;
  label: string;
  shape: NodeShape;
}

export interface FlowchartEdge {
  source: string;
  target: string;
  label?: string;
  lineStyle: EdgeLineStyle;
  arrowType: ArrowType;
  minLength: number;
}

export interface Subgraph {
  id: string;
  title?: string;
  nodeIds: string[];
}

export interface FlowchartAST {
  direction: Direction;
  nodes: Map<string, FlowchartNode>;
  edges: FlowchartEdge[];
  subgraphs: Subgraph[];
}

// ── Parser ──────────────────────────────────────────────────────────────────

export function parseFlowchart(source: string): FlowchartAST {
  const stream = new TokenStream(source);
  const header = stream.expect(
    /^(graph|flowchart)\s+(TD|TB|BT|LR|RL)/i,
    'Expected flowchart header (e.g. "graph TD")',
  );

  const ast: FlowchartAST = {
    direction: header[2].toUpperCase() as Direction,
    nodes: new Map(),
    edges: [],
    subgraphs: [],
  };

  const subgraphStack: Subgraph[] = [];

  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();

    // subgraph start
    const sgMatch = line.match(/^subgraph\s+(\S+)(?:\s+\[(.+)\])?(?:\s+(.+))?$/);
    if (sgMatch) {
      stream.advance();
      subgraphStack.push({
        id: sgMatch[1],
        title: sgMatch[2] ?? sgMatch[3] ?? sgMatch[1],
        nodeIds: [],
      });
      continue;
    }

    // subgraph end
    if (/^end\s*$/i.test(line)) {
      stream.advance();
      if (subgraphStack.length > 0) {
        const sg = subgraphStack.pop()!;
        ast.subgraphs.push(sg);
        if (subgraphStack.length > 0) {
          subgraphStack[subgraphStack.length - 1].nodeIds.push(sg.id);
        }
      }
      continue;
    }

    // skip directive lines
    if (/^(direction|classDef|class|style|click)\s+/i.test(line)) {
      stream.advance();
      continue;
    }

    // node chain with edges
    stream.advance();
    parseNodeChain(line, ast, subgraphStack);
  }

  return ast;
}

// ── Internals ───────────────────────────────────────────────────────────────

const SHAPE_PATTERNS: [RegExp, NodeShape][] = [
  [/^\(\(\((.+?)\)\)\)/, 'doubleCircle'],
  [/^\(\((.+?)\)\)/,     'circle'],
  [/^\(\[(.+?)\]\)/,     'stadium'],
  [/^\[\[(.+?)\]\]/,     'subroutine'],
  [/^\[\((.+?)\)\]/,     'cylinder'],
  [/^\{\{(.+?)\}\}/,     'hexagon'],
  [/^>(.+?)\]/,          'asymmetric'],
  [/^\[\/(.+?)\/\]/,     'parallelogram'],
  [/^\[\\(.+?)\\\]/,     'parallelogramAlt'],
  [/^\[\/(.+?)\\\]/,     'trapezoid'],
  [/^\[\\(.+?)\/\]/,     'trapezoidAlt'],
  [/^\{(.+?)\}/,         'diamond'],
  [/^\((.+?)\)/,         'round'],
  [/^\[(.+?)\]/,         'rect'],
];

function parseNodeChain(line: string, ast: FlowchartAST, subgraphStack: Subgraph[]): void {
  let pos = 0;

  function skip() { while (pos < line.length && line[pos] === ' ') pos++; }

  function parseNodeRef(): string | null {
    skip();
    if (pos >= line.length) return null;

    const idStart = pos;
    while (pos < line.length && /[\w-]/.test(line[pos])) pos++;
    if (pos === idStart) return null;
    const id = line.slice(idStart, pos);

    skip();
    if (pos < line.length && tryParseShape(id)) return id;

    ensureNode(id, id, 'rect', ast);
    trackInSubgraph(id, subgraphStack);
    return id;
  }

  function tryParseShape(id: string): boolean {
    const remaining = line.slice(pos);
    for (const [regex, shape] of SHAPE_PATTERNS) {
      const m = remaining.match(regex);
      if (m) {
        pos += m[0].length;
        ensureNode(id, m[1].trim(), shape, ast);
        trackInSubgraph(id, subgraphStack);
        return true;
      }
    }
    return false;
  }

  function tryParseEdge(): FlowchartEdge | null {
    skip();
    if (pos >= line.length) return null;

    const remaining = line.slice(pos);
    let lineStyle: EdgeLineStyle = 'solid';
    let arrowType: ArrowType = 'arrow';
    let minLength = 1;
    let consumed = 0;

    const edgePatterns: [RegExp, EdgeLineStyle, ArrowType, (m: RegExpMatchArray) => number][] = [
      [/^(={2,})>/,          'thick',  'arrow',  (m) => m[1].length - 1],
      [/^(={3,})/,           'thick',  'none',   (m) => m[1].length - 2],
      [/^-(\.+)-*>/,         'dotted', 'arrow',  () => 1],
      [/^-(\.-)+/,           'dotted', 'none',   () => 1],
      [/^(-{2,})o/,          'solid',  'circle', (m) => m[1].length - 1],
      [/^(-{2,})x/,          'solid',  'cross',  (m) => m[1].length - 1],
      [/^(-{2,})>/,          'solid',  'arrow',  (m) => m[1].length - 1],
      [/^(-{3,})/,           'solid',  'none',   (m) => m[1].length - 2],
    ];

    for (const [regex, ls, at, len] of edgePatterns) {
      const m = remaining.match(regex);
      if (m) {
        // For thick no-arrow, make sure there's no > after
        if (ls === 'thick' && at === 'none' && remaining.slice(m[0].length).startsWith('>')) continue;
        lineStyle = ls; arrowType = at; minLength = len(m); consumed = m[0].length;
        break;
      }
    }

    if (!consumed) return null;
    pos += consumed;
    skip();

    // label: |text|
    let label: string | undefined;
    if (pos < line.length && line[pos] === '|') {
      pos++;
      const labelEnd = line.indexOf('|', pos);
      if (labelEnd !== -1) {
        label = line.slice(pos, labelEnd).trim();
        pos = labelEnd + 1;
      }
    }

    return { source: '', target: '', label, lineStyle, arrowType, minLength };
  }

  // Parse chain: NODE EDGE NODE EDGE NODE ...
  const firstId = parseNodeRef();
  if (!firstId) return;

  let currentId = firstId;
  while (pos < line.length) {
    skip();
    if (pos >= line.length) break;

    const savedPos = pos;
    const edge = tryParseEdge();
    if (!edge) break;

    const targetId = parseNodeRef();
    if (!targetId) { pos = savedPos; break; }

    edge.source = currentId;
    edge.target = targetId;
    ast.edges.push(edge);
    currentId = targetId;
  }
}

function ensureNode(id: string, rawLabel: string, shape: NodeShape, ast: FlowchartAST): void {
  // Convert literal \n escape sequences to actual newlines for multiline labels
  const label = rawLabel.replace(/\\n/g, '\n');
  if (!ast.nodes.has(id)) {
    ast.nodes.set(id, { id, label, shape });
  } else if (rawLabel !== id) {
    const existing = ast.nodes.get(id)!;
    existing.label = label;
    existing.shape = shape;
  }
}

function trackInSubgraph(id: string, stack: Subgraph[]): void {
  if (stack.length > 0) {
    const current = stack[stack.length - 1];
    if (!current.nodeIds.includes(id)) current.nodeIds.push(id);
  }
}
