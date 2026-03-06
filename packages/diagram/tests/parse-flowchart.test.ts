import { describe, it, expect } from 'vitest';
import { parseFlowchart } from '../src/parse/flowchart';

describe('Flowchart parser', () => {
  it('parses basic graph header', () => {
    const ast = parseFlowchart('graph TD\n  A --> B');
    expect(ast.direction).toBe('TD');
    expect(ast.nodes.size).toBe(2);
    expect(ast.edges).toHaveLength(1);
  });

  it('parses flowchart keyword', () => {
    const ast = parseFlowchart('flowchart LR\n  A --> B');
    expect(ast.direction).toBe('LR');
  });

  it('parses node shapes', () => {
    const ast = parseFlowchart(`graph TD
      A[Rectangle]
      B(Rounded)
      C((Circle))
      D{Diamond}
      E{{Hexagon}}
      F([Stadium])
    `);
    expect(ast.nodes.get('A')?.shape).toBe('rect');
    expect(ast.nodes.get('A')?.label).toBe('Rectangle');
    expect(ast.nodes.get('B')?.shape).toBe('round');
    expect(ast.nodes.get('C')?.shape).toBe('circle');
    expect(ast.nodes.get('D')?.shape).toBe('diamond');
    expect(ast.nodes.get('E')?.shape).toBe('hexagon');
    expect(ast.nodes.get('F')?.shape).toBe('stadium');
  });

  it('parses edge types', () => {
    const ast = parseFlowchart(`graph TD
      A --> B
      B -.-> C
      C ==> D
      D --- E
    `);
    expect(ast.edges).toHaveLength(4);
    expect(ast.edges[0].lineStyle).toBe('solid');
    expect(ast.edges[0].arrowType).toBe('arrow');
    expect(ast.edges[1].lineStyle).toBe('dotted');
    expect(ast.edges[2].lineStyle).toBe('thick');
    expect(ast.edges[3].arrowType).toBe('none');
  });

  it('parses edge labels', () => {
    const ast = parseFlowchart('graph TD\n  A -->|yes| B');
    expect(ast.edges[0].label).toBe('yes');
  });

  it('parses node chains', () => {
    const ast = parseFlowchart('graph TD\n  A --> B --> C');
    expect(ast.edges).toHaveLength(2);
    expect(ast.edges[0].source).toBe('A');
    expect(ast.edges[0].target).toBe('B');
    expect(ast.edges[1].source).toBe('B');
    expect(ast.edges[1].target).toBe('C');
  });

  it('parses subgraphs', () => {
    const ast = parseFlowchart(`graph TD
      subgraph sg1 Sub Graph
        A --> B
      end
      C --> A
    `);
    expect(ast.subgraphs).toHaveLength(1);
    expect(ast.subgraphs[0].id).toBe('sg1');
    expect(ast.subgraphs[0].nodeIds).toContain('A');
    expect(ast.subgraphs[0].nodeIds).toContain('B');
  });

  it('handles comments', () => {
    const ast = parseFlowchart(`graph TD
      %% This is a comment
      A --> B
    `);
    expect(ast.nodes.size).toBe(2);
  });
});
