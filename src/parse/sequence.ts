import { TokenStream } from './tokenizer.js';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  alias?: string;
  type: 'participant' | 'actor';
}

export type SequenceStatement = Message | Note | Activation | Deactivation | Block;

export interface Message {
  kind: 'message';
  from: string;
  to: string;
  text: string;
  lineStyle: 'solid' | 'dotted';
  arrowHead: 'arrow' | 'cross' | 'open';
  activate?: boolean;
  deactivate?: boolean;
}

export interface Note {
  kind: 'note';
  position: 'left' | 'right' | 'over';
  participants: string[];
  text: string;
}

export interface Activation  { kind: 'activate'; participant: string; }
export interface Deactivation { kind: 'deactivate'; participant: string; }

export interface Block {
  kind: 'block';
  type: 'loop' | 'alt' | 'opt' | 'par' | 'critical' | 'break' | 'rect';
  label: string;
  branches: BlockBranch[];
}

export interface BlockBranch {
  label: string;
  statements: SequenceStatement[];
}

export interface SequenceAST {
  participants: Participant[];
  statements: SequenceStatement[];
}

// ── Parser ──────────────────────────────────────────────────────────────────

const ARROW_PATTERNS: [string, Message['lineStyle'], Message['arrowHead']][] = [
  ['-->>',  'dotted', 'arrow'],
  ['->>',   'solid',  'arrow'],
  ['--x',   'dotted', 'cross'],
  ['-x',    'solid',  'cross'],
  ['--\\)', 'dotted', 'open'],
  ['-\\)',  'solid',  'open'],
  ['-->',   'dotted', 'open'],
  ['->',    'solid',  'open'],
];

export function parseSequence(source: string): SequenceAST {
  const stream = new TokenStream(source);
  stream.expect(/^sequenceDiagram\s*$/i, 'Expected "sequenceDiagram"');

  const ast: SequenceAST = { participants: [], statements: [] };
  const known = new Set<string>();

  ast.statements = parseStatements(stream, ast, known, false);
  return ast;
}

// ── Internals ───────────────────────────────────────────────────────────────

function parseStatements(
  stream: TokenStream,
  ast: SequenceAST,
  known: Set<string>,
  insideBlock: boolean,
): SequenceStatement[] {
  const statements: SequenceStatement[] = [];

  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();

    if (insideBlock && /^end\s*$/i.test(line)) { stream.advance(); break; }
    if (insideBlock && /^(else|and|option)\b/i.test(line)) break;

    // participant / actor
    const pMatch = line.match(/^(participant|actor)\s+(\S+?)(?:\s+as\s+(.+))?$/i);
    if (pMatch) {
      stream.advance();
      const p: Participant = {
        id: pMatch[2],
        alias: pMatch[3]?.trim(),
        type: pMatch[1].toLowerCase() as 'participant' | 'actor',
      };
      if (!known.has(p.id)) { ast.participants.push(p); known.add(p.id); }
      continue;
    }

    // note
    const noteMatch = line.match(/^Note\s+(right of|left of|over)\s+(.+?):\s*(.+)$/i);
    if (noteMatch) {
      stream.advance();
      const position = noteMatch[1].toLowerCase().startsWith('right') ? 'right'
        : noteMatch[1].toLowerCase().startsWith('left') ? 'left' : 'over';
      const participants = noteMatch[2].split(',').map((s) => s.trim());
      participants.forEach((id) => ensure(id, ast, known));
      statements.push({ kind: 'note', position, participants, text: noteMatch[3].trim() });
      continue;
    }

    // activate / deactivate
    const actMatch = line.match(/^(activate|deactivate)\s+(\S+)$/i);
    if (actMatch) {
      stream.advance();
      ensure(actMatch[2], ast, known);
      statements.push({ kind: actMatch[1].toLowerCase() as 'activate' | 'deactivate', participant: actMatch[2] });
      continue;
    }

    // block (loop, alt, opt, par, critical, break, rect)
    const blockMatch = line.match(/^(loop|alt|opt|par|critical|break|rect)\s*(.*)?$/i);
    if (blockMatch) {
      stream.advance();
      statements.push(parseBlock(blockMatch[1].toLowerCase() as Block['type'], blockMatch[2]?.trim() ?? '', stream, ast, known));
      continue;
    }

    // message: A->>B: text
    const msg = tryParseMessage(line);
    if (msg) {
      stream.advance();
      ensure(msg.from, ast, known);
      ensure(msg.to, ast, known);
      statements.push(msg);
      continue;
    }

    stream.advance(); // skip unknown
  }

  return statements;
}

function tryParseMessage(line: string): Message | null {
  for (const [arrowStr, lineStyle, arrowHead] of ARROW_PATTERNS) {
    const m = line.match(new RegExp(`^(.+?)\\s*${arrowStr}\\s*(.+?)\\s*:\\s*(.+)$`));
    if (m) {
      let to = m[2].trim();
      let activate: boolean | undefined;
      let deactivate: boolean | undefined;

      if (to.endsWith('+'))      { to = to.slice(0, -1).trim(); activate = true; }
      else if (to.endsWith('-')) { to = to.slice(0, -1).trim(); deactivate = true; }

      return { kind: 'message', from: m[1].trim(), to, text: m[3].trim(), lineStyle, arrowHead, activate, deactivate };
    }
  }
  return null;
}

function parseBlock(
  type: Block['type'], label: string,
  stream: TokenStream, ast: SequenceAST, known: Set<string>,
): Block {
  const branches: BlockBranch[] = [];
  branches.push({ label, statements: parseStatements(stream, ast, known, true) });

  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();
    const cont = line.match(/^(else|and|option)\s*(.*)?$/i);
    if (cont) {
      stream.advance();
      branches.push({ label: cont[2]?.trim() ?? '', statements: parseStatements(stream, ast, known, true) });
    } else if (/^end\s*$/i.test(line)) {
      stream.advance(); break;
    } else break;
  }

  return { kind: 'block', type, label, branches };
}

function ensure(id: string, ast: SequenceAST, known: Set<string>): void {
  if (!known.has(id)) { ast.participants.push({ id, type: 'participant' }); known.add(id); }
}
