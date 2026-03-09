import type { SequenceAST, SequenceStatement } from '../parse/sequence.js';
import type { LayoutResult, LayoutNode, LayoutEdge, LayoutGroup } from './types.js';
import { measureNodeSize } from '../render/measure.js';

export interface SequenceLayoutConfig {
  participantSpacing?: number;
  messageSpacing?: number;
  headerHeight?: number;
  noteWidth?: number;
  padding?: number;
}

interface Column {
  id: string;
  x: number;
  width: number;
  label: string;
  type: 'participant' | 'actor';
}

export function layoutSequence(ast: SequenceAST, config: SequenceLayoutConfig = {}): LayoutResult {
  const spacing = config.participantSpacing ?? 150;
  const msgSpacing = config.messageSpacing ?? 40;
  const headerH = config.headerHeight ?? 50;
  const padding = config.padding ?? 20;
  const boxH = 36;

  const columns: Column[] = ast.participants.map((p, i) => {
    const label = p.alias ?? p.id;
    const { width } = measureNodeSize(label);
    return { id: p.id, x: 0, width: Math.max(width, 80), label, type: p.type };
  });

  // Position columns so the first one has room for its full width
  let cx = columns.length > 0 ? columns[0].width / 2 : 0;
  for (const col of columns) {
    col.x = cx;
    cx += spacing;
  }

  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const groups: LayoutGroup[] = [];

  // participant headers
  for (const col of columns) {
    nodes.push({
      id: `participant-${col.id}`, x: col.x, y: boxH / 2,
      width: col.width, height: boxH,
      data: { kind: 'participant-box', ...col },
    });
  }

  let currentY = headerH;
  const colX = (id: string) => columns.find((c) => c.id === id)?.x ?? 0;

  function walk(statements: SequenceStatement[]) {
    for (const stmt of statements) {
      switch (stmt.kind) {
        case 'message': {
          currentY += msgSpacing;
          const fromX = colX(stmt.from), toX = colX(stmt.to);
          const isSelf = stmt.from === stmt.to;

          if (isSelf) {
            edges.push({
              id: `msg-${edges.length}`, source: stmt.from, target: stmt.to,
              points: [
                { x: fromX, y: currentY }, { x: fromX + 40, y: currentY },
                { x: fromX + 40, y: currentY + 20 }, { x: fromX, y: currentY + 20 },
              ],
              data: stmt,
            });
            currentY += 20;
          } else {
            edges.push({
              id: `msg-${edges.length}`, source: stmt.from, target: stmt.to,
              points: [{ x: fromX, y: currentY }, { x: toX, y: currentY }],
              data: stmt,
            });
          }
          break;
        }

        case 'note': {
          currentY += msgSpacing;
          const noteW = config.noteWidth ?? 120;
          const noteH = 30;
          const firstCol = colX(stmt.participants[0]);

          let noteX: number;
          if (stmt.position === 'right') noteX = firstCol + 60;
          else if (stmt.position === 'left') noteX = firstCol - 60 - noteW;
          else {
            const lastCol = stmt.participants.length > 1 ? colX(stmt.participants[stmt.participants.length - 1]) : firstCol;
            noteX = (firstCol + lastCol) / 2 - noteW / 2;
          }

          nodes.push({
            id: `note-${nodes.length}`, x: noteX + noteW / 2, y: currentY,
            width: noteW, height: noteH, data: stmt,
          });
          break;
        }

        case 'activate': case 'deactivate':
          break;

        case 'block': {
          currentY += msgSpacing * 0.5;
          const blockStartY = currentY;

          for (let i = 0; i < stmt.branches.length; i++) {
            if (i > 0) currentY += 10;
            walk(stmt.branches[i].statements);
          }

          currentY += msgSpacing * 0.5;

          const minX = columns.length > 0 ? columns[0].x - columns[0].width / 2 - 10 : 0;
          const maxX = columns.length > 0 ? columns[columns.length - 1].x + columns[columns.length - 1].width / 2 + 10 : 200;

          groups.push({
            id: `block-${groups.length}`,
            x: minX, y: blockStartY, width: maxX - minX, height: currentY - blockStartY,
            label: `${stmt.type}${stmt.label ? ' [' + stmt.label + ']' : ''}`,
            data: stmt,
          });
          break;
        }
      }
    }
  }

  walk(ast.statements);

  // lifelines
  const totalHeight = currentY + headerH;
  for (const col of columns) {
    nodes.push({
      id: `lifeline-${col.id}`, x: col.x, y: headerH,
      width: 0, height: currentY - headerH + boxH,
      data: { kind: 'lifeline', participantId: col.id },
    });
  }

  const totalWidth = columns.length > 0
    ? columns[columns.length - 1].x + columns[columns.length - 1].width / 2 + padding
    : 200;

  return { width: totalWidth, height: totalHeight, nodes, edges, groups };
}
