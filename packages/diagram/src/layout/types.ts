import type { Point } from '../util/math.js';

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: unknown;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  points: Point[];
  data: unknown;
}

export interface LayoutGroup {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  data: unknown;
}

export interface LayoutResult {
  width: number;
  height: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  groups: LayoutGroup[];
}
