import type { ClassDiagramAST, ClassDef } from '../parse/class-diagram.js';
import type { LayoutResult } from './types.js';
import type { EngineConfig, InputNode } from './engine.js';
import { measureText } from '../render/measure.js';
import { layeredLayout, edgeKey, parseEdgeKey } from './engine.js';

export interface ClassLayoutConfig {
  nodeSpacing?: number;
  rankSpacing?: number;
}

export function layoutClassDiagram(ast: ClassDiagramAST, config: ClassLayoutConfig = {}): LayoutResult {
  const inputNodes: InputNode[] = [];
  const inputEdges = [];
  const nodeDataMap = new Map<string, unknown>();
  const edgeDataMap = new Map<string, unknown>();

  for (const [id, cls] of ast.classes) {
    const size = measureClassBox(cls);
    inputNodes.push({ id, width: size.width, height: size.height });
    nodeDataMap.set(id, cls);
  }

  for (const ns of ast.namespaces) {
    inputNodes.push({ id: ns.id, width: 0, height: 0 });
    for (const cid of ns.classIds) {
      const n = inputNodes.find((n) => n.id === cid);
      if (n) n.parent = ns.id;
    }
  }

  for (const rel of ast.relationships) {
    inputEdges.push({ source: rel.from, target: rel.to });
    edgeDataMap.set(edgeKey(rel.from, rel.to), rel);
  }

  const rankdir: EngineConfig['rankdir'] =
    ast.direction === 'LR' || ast.direction === 'RL' ? ast.direction : 'TB';

  const result = layeredLayout(inputNodes, inputEdges, {
    rankdir,
    nodesep: config.nodeSpacing ?? 60,
    ranksep: config.rankSpacing ?? 80,
    marginx: 20,
    marginy: 20,
  });

  return {
    width: result.width,
    height: result.height,
    nodes: [...result.nodes.entries()]
      .map(([id, pos]) => ({ id, ...pos, data: nodeDataMap.get(id) }))
      .filter((n) => n.data !== undefined),
    edges: [...result.edges.entries()].map(([key, points]) => {
      const [source, target] = parseEdgeKey(key);
      return { id: key, source, target, points, data: edgeDataMap.get(key) };
    }),
    groups: [...result.groups.entries()].map(([id, box]) => {
      const ns = ast.namespaces.find((n) => n.id === id);
      return { id, ...box, label: ns?.id, data: ns };
    }),
  };
}

const MEASURE_FONT_SIZE = 14;
const MEASURE_LINE_HEIGHT = MEASURE_FONT_SIZE * 1.6;
const MEASURE_PADDING = 16;
const MIN_CLASS_WIDTH = 100;

function measureClassBox(cls: ClassDef): { width: number; height: number } {
  const fontSize = MEASURE_FONT_SIZE;
  const lineH = MEASURE_LINE_HEIGHT;
  const padding = MEASURE_PADDING;

  let maxWidth = measureText(cls.id, fontSize).width;
  if (cls.annotation) maxWidth = Math.max(maxWidth, measureText(`<<${cls.annotation}>>`, 11).width);
  for (const m of cls.members) maxWidth = Math.max(maxWidth, measureText(m.raw, 12).width);

  const attributes = cls.members.filter((m) => !m.isMethod);
  const methods = cls.members.filter((m) => m.isMethod);

  let height = lineH;
  if (cls.annotation) height += lineH * 0.8;
  height += 4 + Math.max(attributes.length, 1) * lineH;
  height += 4 + Math.max(methods.length, 1) * lineH;
  height += padding;

  return { width: Math.max(maxWidth + padding * 2, MIN_CLASS_WIDTH), height };
}
