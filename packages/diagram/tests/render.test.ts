import { describe, it, expect } from 'vitest';
import { render } from '../src/index';

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
    expect(svg).toContain('#ff0000');
  });
});
