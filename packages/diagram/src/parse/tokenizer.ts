export type DiagramType = 'flowchart' | 'sequence' | 'classDiagram';

export function detectDiagramType(source: string): DiagramType | null {
  const firstLine = source.trim().split('\n')[0].trim();
  if (/^(graph|flowchart)\s+(TD|TB|BT|LR|RL)/i.test(firstLine)) return 'flowchart';
  if (/^sequenceDiagram\s*$/i.test(firstLine)) return 'sequence';
  if (/^classDiagram\s*$/i.test(firstLine)) return 'classDiagram';
  return null;
}

export class TokenStream {
  private lines: string[];
  private pos = 0;

  constructor(source: string) {
    this.lines = source
      .split('\n')
      .map((line) => line.replace(/%%.*$/, '').trimEnd())
      .filter((line) => line.trim() !== '');
  }

  peek(): string | null {
    return this.pos < this.lines.length ? this.lines[this.pos] : null;
  }

  advance(): string {
    if (this.pos >= this.lines.length) throw new Error('Unexpected end of input');
    return this.lines[this.pos++];
  }

  match(pattern: RegExp): RegExpMatchArray | null {
    const line = this.peek();
    if (line === null) return null;
    const m = line.match(pattern);
    if (m) this.pos++;
    return m;
  }

  expect(pattern: RegExp, errorMsg: string): RegExpMatchArray {
    const m = this.match(pattern);
    if (!m) throw new Error(`${errorMsg} at line ${this.pos + 1}: "${this.peek()}"`);
    return m;
  }

  isAtEnd(): boolean {
    return this.pos >= this.lines.length;
  }

  remaining(): string[] {
    return this.lines.slice(this.pos);
  }
}
