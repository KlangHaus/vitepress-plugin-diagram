/**
 * Sugiyama-style layered graph layout algorithm.
 * Zero-dependency replacement for @dagrejs/dagre.
 *
 * Pipeline:
 *   1. Remove cycles       (DFS back-edge reversal)
 *   2. Assign ranks         (Kahn's topological sort + longest path)
 *   3. Normalize            (add dummy nodes for edges spanning > 1 rank)
 *   4. Order within ranks   (barycenter crossing minimization)
 *   5. Assign coordinates   (median alignment + overlap resolution)
 *   6. Denormalize          (remove dummy nodes, collect edge bend points)
 */

import type { Point } from '../util/math.js';

// ── Public types ────────────────────────────────────────────────────────────

export interface EngineConfig {
  rankdir: 'TB' | 'BT' | 'LR' | 'RL';
  nodesep: number;
  ranksep: number;
  marginx: number;
  marginy: number;
}

export interface InputNode {
  id: string;
  width: number;
  height: number;
  parent?: string;
}

export interface InputEdge {
  source: string;
  target: string;
  minlen?: number;
}

export interface EngineOutput {
  nodes: Map<string, { x: number; y: number; width: number; height: number }>;
  edges: Map<string, Point[]>;
  groups: Map<string, { x: number; y: number; width: number; height: number }>;
  width: number;
  height: number;
}

// ── Internal types ──────────────────────────────────────────────────────────

interface INode {
  id: string;
  width: number;
  height: number;
  rank: number;
  order: number;
  x: number;
  y: number;
  isDummy: boolean;
  parent?: string;
}

interface IEdge {
  source: string;
  target: string;
  minlen: number;
  reversed: boolean;
}

interface DummyChain {
  originalSource: string;
  originalTarget: string;
  dummyIds: string[];
  reversed: boolean;
}

interface AdjMap {
  preds: Map<string, string[]>;
  succs: Map<string, string[]>;
}

// ── Main entry ──────────────────────────────────────────────────────────────

export function layeredLayout(
  inputNodes: InputNode[],
  inputEdges: InputEdge[],
  config: Partial<EngineConfig> = {},
): EngineOutput {
  const cfg: EngineConfig = {
    rankdir: config.rankdir ?? 'TB',
    nodesep: config.nodesep ?? 50,
    ranksep: config.ranksep ?? 50,
    marginx: config.marginx ?? 20,
    marginy: config.marginy ?? 20,
  };

  const parentIds = new Set<string>();
  for (const n of inputNodes) if (n.parent) parentIds.add(n.parent);

  const isHoriz = cfg.rankdir === 'LR' || cfg.rankdir === 'RL';
  const nodes = new Map<string, INode>();
  for (const n of inputNodes) {
    if (parentIds.has(n.id)) continue;
    nodes.set(n.id, {
      id: n.id,
      width:  isHoriz ? n.height : n.width,
      height: isHoriz ? n.width  : n.height,
      rank: 0, order: 0, x: 0, y: 0,
      isDummy: false,
      parent: n.parent,
    });
  }

  let edges: IEdge[] = inputEdges
    .filter((e) => nodes.has(e.source) && nodes.has(e.target))
    .map((e) => ({ source: e.source, target: e.target, minlen: e.minlen ?? 1, reversed: false }));

  edges = removeCycles(nodes, edges);
  assignRanks(nodes, edges);
  const { allEdges, dummyChains } = normalize(nodes, edges);

  const layers = buildLayers(nodes);
  minimizeCrossings(layers, nodes, allEdges);
  assignCoordinates(layers, nodes, allEdges, cfg);

  const edgePoints = denormalize(nodes, dummyChains, edges);
  applyDirection(nodes, edgePoints, cfg);
  const groups = computeGroups(nodes, inputNodes, parentIds);

  let maxX = 0, maxY = 0;
  for (const n of nodes.values()) {
    maxX = Math.max(maxX, n.x + n.width / 2);
    maxY = Math.max(maxY, n.y + n.height / 2);
  }
  for (const pts of edgePoints.values()) {
    for (const p of pts) { maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  }

  const outNodes = new Map<string, { x: number; y: number; width: number; height: number }>();
  for (const [id, n] of nodes) {
    if (n.isDummy) continue;
    const orig = inputNodes.find((o) => o.id === id);
    outNodes.set(id, { x: n.x, y: n.y, width: orig?.width ?? n.width, height: orig?.height ?? n.height });
  }

  return { nodes: outNodes, edges: edgePoints, groups, width: maxX, height: maxY };
}

// ── Phase 1: Cycle removal ─────────────────────────────────────────────────

function removeCycles(nodes: Map<string, INode>, edges: IEdge[]): IEdge[] {
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const toReverse = new Set<number>();

  const adj = new Map<string, number[]>();
  for (const id of nodes.keys()) adj.set(id, []);
  for (let i = 0; i < edges.length; i++) adj.get(edges[i].source)?.push(i);

  function dfs(v: string): void {
    visited.add(v); inStack.add(v);
    for (const ei of adj.get(v) ?? []) {
      const w = edges[ei].target;
      if (inStack.has(w)) toReverse.add(ei);
      else if (!visited.has(w)) dfs(w);
    }
    inStack.delete(v);
  }

  for (const id of nodes.keys()) if (!visited.has(id)) dfs(id);

  return edges.map((e, i) =>
    toReverse.has(i)
      ? { source: e.target, target: e.source, minlen: e.minlen, reversed: true }
      : e,
  );
}

// ── Phase 2: Rank assignment ────────────────────────────────────────────────

function assignRanks(nodes: Map<string, INode>, edges: IEdge[]): void {
  const inDeg = new Map<string, number>();
  const adj = new Map<string, { target: string; minlen: number }[]>();

  for (const id of nodes.keys()) { inDeg.set(id, 0); adj.set(id, []); }
  for (const e of edges) {
    adj.get(e.source)!.push({ target: e.target, minlen: e.minlen });
    inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  const rank = new Map<string, number>();

  for (const [id, deg] of inDeg) {
    if (deg === 0) { queue.push(id); rank.set(id, 0); }
  }

  while (queue.length > 0) {
    const v = queue.shift()!;
    const r = rank.get(v)!;
    for (const { target, minlen } of adj.get(v) ?? []) {
      const nr = r + minlen;
      if (nr > (rank.get(target) ?? 0)) rank.set(target, nr);
      const d = inDeg.get(target)! - 1;
      inDeg.set(target, d);
      if (d === 0) queue.push(target);
    }
  }

  for (const id of nodes.keys()) if (!rank.has(id)) rank.set(id, 0);
  for (const [id, r] of rank) { const n = nodes.get(id); if (n) n.rank = r; }
}

// ── Phase 3: Normalize ─────────────────────────────────────────────────────

function normalize(
  nodes: Map<string, INode>, edges: IEdge[],
): { allEdges: IEdge[]; dummyChains: DummyChain[] } {
  let dummyCount = 0;
  const dummyChains: DummyChain[] = [];
  const allEdges: IEdge[] = [];

  for (const edge of edges) {
    const span = nodes.get(edge.target)!.rank - nodes.get(edge.source)!.rank;
    if (span <= 1) { allEdges.push(edge); continue; }

    const chain: string[] = [];
    let prev = edge.source;
    const srcRank = nodes.get(edge.source)!.rank;

    for (let r = srcRank + 1; r < srcRank + span; r++) {
      const did = `__d${dummyCount++}`;
      nodes.set(did, { id: did, width: 0, height: 0, rank: r, order: 0, x: 0, y: 0, isDummy: true });
      chain.push(did);
      allEdges.push({ source: prev, target: did, minlen: 1, reversed: false });
      prev = did;
    }

    allEdges.push({ source: prev, target: edge.target, minlen: 1, reversed: false });
    dummyChains.push({ originalSource: edge.source, originalTarget: edge.target, dummyIds: chain, reversed: edge.reversed });
  }

  return { allEdges, dummyChains };
}

// ── Phase 4: Crossing minimization ─────────────────────────────────────────

function buildLayers(nodes: Map<string, INode>): string[][] {
  let maxRank = 0;
  for (const n of nodes.values()) if (n.rank > maxRank) maxRank = n.rank;

  const layers: string[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const [id, node] of nodes) layers[node.rank].push(id);
  for (const layer of layers) layer.sort();

  return layers;
}

function buildAdj(nodes: Map<string, INode>, edges: IEdge[]): AdjMap {
  const preds = new Map<string, string[]>();
  const succs = new Map<string, string[]>();
  for (const id of nodes.keys()) { preds.set(id, []); succs.set(id, []); }
  for (const e of edges) {
    if (nodes.has(e.source) && nodes.has(e.target)) {
      succs.get(e.source)!.push(e.target);
      preds.get(e.target)!.push(e.source);
    }
  }
  return { preds, succs };
}

function countCrossings(layers: string[][], adj: AdjMap): number {
  let crossings = 0;
  for (let li = 0; li < layers.length - 1; li++) {
    const top = layers[li];
    const bot = layers[li + 1];
    const topIdx = new Map<string, number>();
    top.forEach((id, i) => topIdx.set(id, i));
    const botIdx = new Map<string, number>();
    bot.forEach((id, i) => botIdx.set(id, i));

    const pairs: [number, number][] = [];
    for (const tid of top) {
      const ti = topIdx.get(tid)!;
      for (const s of adj.succs.get(tid) ?? []) {
        const bi = botIdx.get(s);
        if (bi !== undefined) pairs.push([ti, bi]);
      }
    }

    for (let a = 0; a < pairs.length; a++) {
      for (let b = a + 1; b < pairs.length; b++) {
        if ((pairs[a][0] - pairs[b][0]) * (pairs[a][1] - pairs[b][1]) < 0) crossings++;
      }
    }
  }
  return crossings;
}

function minimizeCrossings(layers: string[][], nodes: Map<string, INode>, edges: IEdge[]): void {
  const adj = buildAdj(nodes, edges);
  let bestLayers = layers.map((l) => [...l]);
  let bestCrossings = countCrossings(layers, adj);

  for (let iter = 0; iter < 24; iter++) {
    if (iter % 2 === 0) {
      for (let i = 1; i < layers.length; i++) orderByBarycenter(layers, i, adj, 'preds');
    } else {
      for (let i = layers.length - 2; i >= 0; i--) orderByBarycenter(layers, i, adj, 'succs');
    }
    const c = countCrossings(layers, adj);
    if (c < bestCrossings) { bestCrossings = c; bestLayers = layers.map((l) => [...l]); }
    if (bestCrossings === 0) break;
  }

  for (let i = 0; i < layers.length; i++) layers[i] = bestLayers[i];
  for (const layer of layers) layer.forEach((id, j) => { const n = nodes.get(id); if (n) n.order = j; });
}

function orderByBarycenter(layers: string[][], li: number, adj: AdjMap, dir: 'preds' | 'succs'): void {
  const refLi = dir === 'preds' ? li - 1 : li + 1;
  if (refLi < 0 || refLi >= layers.length) return;

  const refIdx = new Map<string, number>();
  layers[refLi].forEach((id, i) => refIdx.set(id, i));

  const bc = new Map<string, number>();
  for (const nid of layers[li]) {
    const neighbors = (dir === 'preds' ? adj.preds : adj.succs).get(nid) ?? [];
    const positions = neighbors.map((n) => refIdx.get(n)).filter((x): x is number => x !== undefined);
    if (positions.length > 0) bc.set(nid, positions.reduce((a, b) => a + b, 0) / positions.length);
  }

  layers[li] = [...layers[li]].sort((a, b) => {
    const ba = bc.get(a), bb = bc.get(b);
    if (ba !== undefined && bb !== undefined) return ba - bb;
    if (ba !== undefined) return -1;
    if (bb !== undefined) return 1;
    return 0;
  });
}

// ── Phase 5: Coordinate assignment ──────────────────────────────────────────

function assignCoordinates(layers: string[][], nodes: Map<string, INode>, edges: IEdge[], cfg: EngineConfig): void {
  const { nodesep, ranksep } = cfg;

  // Initial x: center each layer
  for (const layer of layers) {
    let x = 0;
    for (const id of layer) {
      const n = nodes.get(id)!;
      n.x = x + n.width / 2;
      x += n.width + nodesep;
    }
    const total = x - nodesep;
    const off = total / 2;
    for (const id of layer) nodes.get(id)!.x -= off;
  }

  // Iterative median alignment
  const adj = buildAdj(nodes, edges);

  for (let iter = 0; iter < 30; iter++) {
    const forward = iter % 2 === 0;
    const order = forward ? range(0, layers.length) : range(layers.length - 1, -1);

    for (const li of order) {
      const refLi = forward ? li - 1 : li + 1;
      if (refLi < 0 || refLi >= layers.length) continue;

      for (const id of layers[li]) {
        const n = nodes.get(id)!;
        const neighbors = (forward ? adj.preds : adj.succs).get(id) ?? [];
        const xs = neighbors.map((nb) => nodes.get(nb)?.x).filter((x): x is number => x !== undefined);

        if (xs.length > 0) {
          xs.sort((a, b) => a - b);
          const mid = Math.floor(xs.length / 2);
          n.x = xs.length % 2 === 1 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
        }
      }

      resolveOverlaps(layers[li], nodes, nodesep);
    }
  }

  // y from rank — use cumulative heights so ranksep is the gap between edges, not centers
  const rankMaxHeight = new Map<number, number>();
  for (const n of nodes.values()) {
    const cur = rankMaxHeight.get(n.rank) ?? 0;
    if (n.height > cur) rankMaxHeight.set(n.rank, n.height);
  }

  const maxRank = Math.max(...[...rankMaxHeight.keys()], 0);
  const rankY = new Map<number, number>();
  let cumulativeY = 0;
  for (let r = 0; r <= maxRank; r++) {
    const h = rankMaxHeight.get(r) ?? 0;
    rankY.set(r, cumulativeY + h / 2);
    cumulativeY += h + ranksep;
  }

  for (const n of nodes.values()) n.y = rankY.get(n.rank) ?? 0;

  // shift to positive
  let minX = Infinity, minY = Infinity;
  for (const n of nodes.values()) {
    minX = Math.min(minX, n.x - n.width / 2);
    minY = Math.min(minY, n.y - n.height / 2);
  }
  for (const n of nodes.values()) { n.x -= minX; n.y -= minY; }
}

function resolveOverlaps(layer: string[], nodes: Map<string, INode>, nodesep: number): void {
  if (layer.length <= 1) return;
  const sorted = [...layer].sort((a, b) => nodes.get(a)!.x - nodes.get(b)!.x);
  for (let i = 1; i < sorted.length; i++) {
    const prev = nodes.get(sorted[i - 1])!;
    const curr = nodes.get(sorted[i])!;
    const minX = prev.x + prev.width / 2 + nodesep + curr.width / 2;
    if (curr.x < minX) curr.x = minX;
  }
}

// ── Phase 6: Denormalize ────────────────────────────────────────────────────

function denormalize(
  nodes: Map<string, INode>, dummyChains: DummyChain[], originalEdges: IEdge[],
): Map<string, Point[]> {
  const edgePoints = new Map<string, Point[]>();
  const chainSet = new Set<string>();
  for (const c of dummyChains) chainSet.add(edgeKey(c.originalSource, c.originalTarget));

  // Direct edges
  for (const edge of originalEdges) {
    const key = edgeKey(edge.source, edge.target);
    const origKey = edge.reversed ? edgeKey(edge.target, edge.source) : key;
    if (chainSet.has(key)) continue;

    const src = nodes.get(edge.source), tgt = nodes.get(edge.target);
    if (!src || !tgt) continue;

    edgePoints.set(origKey, edge.reversed
      ? [{ x: tgt.x, y: tgt.y }, { x: src.x, y: src.y }]
      : [{ x: src.x, y: src.y }, { x: tgt.x, y: tgt.y }],
    );
  }

  // Chained edges
  for (const chain of dummyChains) {
    const key = chain.reversed
      ? edgeKey(chain.originalTarget, chain.originalSource)
      : edgeKey(chain.originalSource, chain.originalTarget);

    const points: Point[] = [];
    const src = nodes.get(chain.originalSource);
    if (src) points.push({ x: src.x, y: src.y });

    for (const did of chain.dummyIds) {
      const d = nodes.get(did);
      if (d) points.push({ x: d.x, y: d.y });
    }

    const tgt = nodes.get(chain.originalTarget);
    if (tgt) points.push({ x: tgt.x, y: tgt.y });

    if (chain.reversed) points.reverse();
    edgePoints.set(key, points);

    for (const did of chain.dummyIds) nodes.delete(did);
  }

  return edgePoints;
}

// ── Direction transform ─────────────────────────────────────────────────────

function applyDirection(nodes: Map<string, INode>, edgePoints: Map<string, Point[]>, cfg: EngineConfig): void {
  if (cfg.rankdir === 'TB') return;

  if (cfg.rankdir === 'BT') {
    let maxY = 0;
    for (const n of nodes.values()) maxY = Math.max(maxY, n.y + n.height / 2);
    for (const pts of edgePoints.values()) for (const p of pts) maxY = Math.max(maxY, p.y);
    for (const n of nodes.values()) n.y = maxY - n.y;
    for (const pts of edgePoints.values()) for (const p of pts) p.y = maxY - p.y;
  } else if (cfg.rankdir === 'LR' || cfg.rankdir === 'RL') {
    for (const n of nodes.values()) { [n.x, n.y] = [n.y, n.x]; [n.width, n.height] = [n.height, n.width]; }
    for (const pts of edgePoints.values()) for (const p of pts) [p.x, p.y] = [p.y, p.x];

    if (cfg.rankdir === 'RL') {
      let maxX = 0;
      for (const n of nodes.values()) maxX = Math.max(maxX, n.x + n.width / 2);
      for (const pts of edgePoints.values()) for (const p of pts) maxX = Math.max(maxX, p.x);
      for (const n of nodes.values()) n.x = maxX - n.x;
      for (const pts of edgePoints.values()) for (const p of pts) p.x = maxX - p.x;
    }
  }
}

// ── Compound groups ─────────────────────────────────────────────────────────

function computeGroups(
  nodes: Map<string, INode>, inputNodes: InputNode[], parentIds: Set<string>,
): Map<string, { x: number; y: number; width: number; height: number }> {
  const groups = new Map<string, { x: number; y: number; width: number; height: number }>();
  const GROUP_PADDING = 20;
  if (parentIds.size === 0) return groups;
  for (const pid of parentIds) {
    const children = [...nodes.values()].filter((n) => n.parent === pid);
    if (children.length === 0) { groups.set(pid, { x: 0, y: 0, width: 0, height: 0 }); continue; }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of children) {
      minX = Math.min(minX, c.x - c.width / 2);
      minY = Math.min(minY, c.y - c.height / 2);
      maxX = Math.max(maxX, c.x + c.width / 2);
      maxY = Math.max(maxY, c.y + c.height / 2);
    }

    groups.set(pid, { x: minX - GROUP_PADDING, y: minY - GROUP_PADDING, width: maxX - minX + GROUP_PADDING * 2, height: maxY - minY + GROUP_PADDING * 2 });
  }

  return groups;
}

// ── Utility ─────────────────────────────────────────────────────────────────

const EDGE_SEP = '\0';
export function edgeKey(source: string, target: string): string {
  return `${source}${EDGE_SEP}${target}`;
}

export function parseEdgeKey(key: string): [string, string] {
  const i = key.indexOf(EDGE_SEP);
  return [key.slice(0, i), key.slice(i + 1)];
}

function range(start: number, end: number): number[] {
  const r: number[] = [];
  if (start <= end) { for (let i = start; i < end; i++) r.push(i); }
  else { for (let i = start; i > end; i--) r.push(i); }
  return r;
}
