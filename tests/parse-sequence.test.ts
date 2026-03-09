import { describe, it, expect } from 'vitest';
import { parseSequence } from '../src/parse/sequence';

describe('Sequence diagram parser', () => {
  it('parses participants', () => {
    const ast = parseSequence(`sequenceDiagram
      participant A
      participant B as Bob
    `);
    expect(ast.participants).toHaveLength(2);
    expect(ast.participants[0].id).toBe('A');
    expect(ast.participants[1].alias).toBe('Bob');
  });

  it('parses actors', () => {
    const ast = parseSequence(`sequenceDiagram
      actor User
    `);
    expect(ast.participants[0].type).toBe('actor');
  });

  it('parses messages', () => {
    const ast = parseSequence(`sequenceDiagram
      A->>B: Hello
      B-->>A: Hi back
    `);
    expect(ast.statements).toHaveLength(2);
    const msg1 = ast.statements[0];
    expect(msg1.kind).toBe('message');
    if (msg1.kind === 'message') {
      expect(msg1.from).toBe('A');
      expect(msg1.to).toBe('B');
      expect(msg1.text).toBe('Hello');
      expect(msg1.lineStyle).toBe('solid');
      expect(msg1.arrowHead).toBe('arrow');
    }
    const msg2 = ast.statements[1];
    if (msg2.kind === 'message') {
      expect(msg2.lineStyle).toBe('dotted');
    }
  });

  it('parses notes', () => {
    const ast = parseSequence(`sequenceDiagram
      participant A
      Note right of A: Important note
    `);
    const note = ast.statements[0];
    expect(note.kind).toBe('note');
    if (note.kind === 'note') {
      expect(note.position).toBe('right');
      expect(note.participants).toEqual(['A']);
      expect(note.text).toBe('Important note');
    }
  });

  it('parses loop blocks', () => {
    const ast = parseSequence(`sequenceDiagram
      A->>B: Request
      loop Every minute
        B->>A: Response
      end
    `);
    expect(ast.statements).toHaveLength(2);
    const block = ast.statements[1];
    expect(block.kind).toBe('block');
    if (block.kind === 'block') {
      expect(block.type).toBe('loop');
      expect(block.label).toBe('Every minute');
      expect(block.branches).toHaveLength(1);
    }
  });

  it('parses alt blocks', () => {
    const ast = parseSequence(`sequenceDiagram
      alt success
        A->>B: OK
      else failure
        A->>B: Error
      end
    `);
    const block = ast.statements[0];
    if (block.kind === 'block') {
      expect(block.type).toBe('alt');
      expect(block.branches).toHaveLength(2);
      expect(block.branches[0].label).toBe('success');
      expect(block.branches[1].label).toBe('failure');
    }
  });

  it('auto-creates participants from messages', () => {
    const ast = parseSequence(`sequenceDiagram
      Alice->>Bob: Hello
    `);
    expect(ast.participants).toHaveLength(2);
    expect(ast.participants[0].id).toBe('Alice');
    expect(ast.participants[1].id).toBe('Bob');
  });
});
