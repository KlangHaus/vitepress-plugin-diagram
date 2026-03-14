import { describe, it, expect } from 'vitest';
import { render, darkTheme } from '../src/index';

describe('render()', () => {
  it('renders a flowchart to SVG', () => {
    const svg = render(`graph TD
      A[Start] --> B{Decision}
      B -->|Yes| C[OK]
      B -->|No| D[Cancel]
    `);
    expect(svg).not.toBeNull();
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Start');
    expect(svg).toContain('Decision');
  });

  it('renders a sequence diagram to SVG', () => {
    const svg = render(`sequenceDiagram
      Alice->>Bob: Hello Bob
      Bob-->>Alice: Hi Alice
    `);
    expect(svg).not.toBeNull();
    expect(svg).toContain('<svg');
    expect(svg).toContain('Hello Bob');
  });

  it('renders a class diagram to SVG', () => {
    const svg = render(`classDiagram
      class Animal {
        +String name
        +eat() void
      }
      class Dog {
        +bark() void
      }
      Animal <|-- Dog
    `);
    expect(svg).not.toBeNull();
    expect(svg).toContain('<svg');
    expect(svg).toContain('Animal');
    expect(svg).toContain('Dog');
  });

  it('returns null for unknown diagram type', () => {
    expect(render('unknown diagram type')).toBeNull();
  });

  it('accepts theme options', () => {
    const svg = render('graph TD\n  A --> B', { theme: { processFill: '#ff0000' } });
    // Theme color is used in gradient def and referenced by shapes
    expect(svg).toContain('grad-ff0000');
  });
});

describe('responsive SVG', () => {
  it('includes both viewBox and width/height for responsive scaling', () => {
    const svg = render('graph TD\n  A --> B')!;
    const svgTag = svg.match(/<svg[^>]*>/)?.[0] ?? '';
    expect(svgTag).toContain('viewBox=');
    expect(svgTag).toContain('width=');
    expect(svgTag).toContain('height=');
  });
});

describe('dark mode', () => {
  it('includes dark mode styles by default', () => {
    const svg = render('graph TD\n  A --> B')!;
    expect(svg).toContain('<style>');
    expect(svg).toContain('.dark .vp-d-process');
  });

  it('can be disabled with darkTheme: false', () => {
    const svg = render('graph TD\n  A --> B', { darkTheme: false })!;
    expect(svg).not.toContain('<style>');
  });

  it('accepts custom dark theme colors', () => {
    const svg = render('graph TD\n  A --> B', { darkTheme: { processFill: '#abc123' } })!;
    expect(svg).toContain('#abc123');
  });

  it('exports darkTheme constant', () => {
    expect(darkTheme).toBeDefined();
    expect(darkTheme.processFill).toBe('#1a3038');
    expect(darkTheme.decisionFill).toBe('#3a2820');
    expect(darkTheme.terminalFill).toBe('#1e3028');
    expect(darkTheme.dataFill).toBe('#282036');
  });
});

describe('semantic CSS classes', () => {
  it('assigns vp-d-process class to rect nodes', () => {
    const svg = render('graph TD\n  A[Process]')!;
    expect(svg).toContain('vp-d-process');
  });

  it('assigns vp-d-decision class to diamond nodes', () => {
    const svg = render('graph TD\n  A{Decision}')!;
    expect(svg).toContain('vp-d-decision');
  });

  it('assigns vp-d-terminal class to stadium nodes', () => {
    const svg = render('graph TD\n  A([Terminal])')!;
    expect(svg).toContain('vp-d-terminal');
  });

  it('assigns vp-d-data class to cylinder nodes', () => {
    const svg = render('graph TD\n  A[(Database)]')!;
    expect(svg).toContain('vp-d-data');
  });

  it('assigns vp-d-node-text class to node labels', () => {
    const svg = render('graph TD\n  A[Hello]')!;
    expect(svg).toContain('vp-d-node-text');
  });

  it('assigns vp-d-edge class to edges', () => {
    const svg = render('graph TD\n  A --> B')!;
    expect(svg).toContain('vp-d-edge');
  });
});

describe('multiline labels', () => {
  it('renders newlines as tspan elements', () => {
    const svg = render('graph TD\n  A[Line 1\\nLine 2]')!;
    expect(svg).toContain('<tspan');
    expect(svg).toContain('Line 1');
    expect(svg).toContain('Line 2');
  });
});
