import type { FlowchartAST, Direction } from '../parse/flowchart.js';
import type { LayoutResult } from './types.js';
import type { EngineConfig, InputNode } from './engine.js';
import { measureNodeSize } from '../render/measure.js';
import { layeredLayout, edgeKey, parseEdgeKey } from './engine.js';

export interface FlowchartLayoutConfig {
  nodeSpacing?: number;
  rankSpacing?: number;
  marginX?: number;
  marginY?: number;
}

const DIRECTION_MAP: Record<Direction, EngineConfig['rankdir']> = {
  TD: 'TB', TB: 'TB', BT: 'BT', LR: 'LR', RL: 'RL',
};

export function layoutFlowchart(ast: FlowchartAST, config: FlowchartLayoutConfig = {}): LayoutResult {
  const inputNodes: InputNode[] = [];
  const inputEdges = [];
  const nodeDataMap = new Map<string, unknown>();
  const edgeDataMap = new Map<string, unknown>();

  for (const [id, node] of ast.nodes) {
    const size = measureNodeSize(node.label);
    const w = node.shape === 'diamond' ? size.width * 1.4 : size.width;
    const h = node.shape === 'diamond' ? size.height * 1.4 : size.height;
    inputNodes.push({ id, width: w, height: h });
    nodeDataMap.set(id, node);
  }

  for (const sg of ast.subgraphs) {
    inputNodes.push({ id: sg.id, width: 0, height: 0 });
    for (const nid of sg.nodeIds) {
      const n = inputNodes.find((n) => n.id === nid);
      if (n) n.parent = sg.id;
    }
  }

  for (const edge of ast.edges) {
    inputEdges.push({ source: edge.source, target: edge.target, minlen: edge.minLength });
    edgeDataMap.set(edgeKey(edge.source, edge.target), edge);
  }

  const result = layeredLayout(inputNodes, inputEdges, {
    rankdir: DIRECTION_MAP[ast.direction],
    nodesep: config.nodeSpacing ?? 50,
    ranksep: config.rankSpacing ?? 50,
    marginx: config.marginX ?? 20,
    marginy: config.marginY ?? 20,
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
      const sg = ast.subgraphs.find((s) => s.id === id);
      return { id, ...box, label: sg?.title, data: sg };
    }),
  };
}
