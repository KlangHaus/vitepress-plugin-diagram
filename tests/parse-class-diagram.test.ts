import { describe, it, expect } from 'vitest';
import { parseClassDiagram } from '../src/parse/class-diagram';

describe('Class diagram parser', () => {
  it('parses class declarations', () => {
    const ast = parseClassDiagram(`classDiagram
      class Animal
    `);
    expect(ast.classes.has('Animal')).toBe(true);
  });

  it('parses class with body', () => {
    const ast = parseClassDiagram(`classDiagram
      class Animal {
        +String name
        +int age
        +eat() void
        -sleep()
      }
    `);
    const cls = ast.classes.get('Animal')!;
    expect(cls.members).toHaveLength(4);
    expect(cls.members[0].visibility).toBe('public');
    expect(cls.members[0].isMethod).toBe(false);
    expect(cls.members[2].isMethod).toBe(true);
    expect(cls.members[3].visibility).toBe('private');
  });

  it('parses inheritance relationship', () => {
    const ast = parseClassDiagram(`classDiagram
      Animal <|-- Dog
    `);
    expect(ast.relationships).toHaveLength(1);
    expect(ast.relationships[0].type).toBe('inheritance');
    expect(ast.relationships[0].from).toBe('Animal');
    expect(ast.relationships[0].to).toBe('Dog');
  });

  it('parses composition relationship', () => {
    const ast = parseClassDiagram(`classDiagram
      Car *-- Engine
    `);
    expect(ast.relationships[0].type).toBe('composition');
  });

  it('parses aggregation relationship', () => {
    const ast = parseClassDiagram(`classDiagram
      Library o-- Book
    `);
    expect(ast.relationships[0].type).toBe('aggregation');
  });

  it('parses relationship with label', () => {
    const ast = parseClassDiagram(`classDiagram
      Animal <|-- Dog : extends
    `);
    expect(ast.relationships[0].label).toBe('extends');
  });

  it('parses annotations', () => {
    const ast = parseClassDiagram(`classDiagram
      class Shape
      <<Interface>> Shape
    `);
    expect(ast.classes.get('Shape')?.annotation).toBe('Interface');
  });

  it('parses direction', () => {
    const ast = parseClassDiagram(`classDiagram
      direction LR
      class A
    `);
    expect(ast.direction).toBe('LR');
  });

  it('parses member via colon syntax', () => {
    const ast = parseClassDiagram(`classDiagram
      class Duck
      Duck : +swim()
      Duck : +quack()
    `);
    const cls = ast.classes.get('Duck')!;
    expect(cls.members).toHaveLength(2);
    expect(cls.members[0].isMethod).toBe(true);
  });

  it('parses generic types', () => {
    const ast = parseClassDiagram(`classDiagram
      class List~T~ {
        +add(item T)
        +get(index int) T
      }
    `);
    const cls = ast.classes.get('List')!;
    expect(cls.generic).toBe('T');
  });
});
