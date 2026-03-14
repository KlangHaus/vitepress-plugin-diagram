import { TokenStream } from './tokenizer.js';
import type { Direction } from './types.js';

// ── Types ───────────────────────────────────────────────────────────────────

export type Visibility = 'public' | 'private' | 'protected' | 'internal' | null;

export interface ClassMember {
  name: string;
  visibility: Visibility;
  type?: string;
  isMethod: boolean;
  isStatic: boolean;
  isAbstract: boolean;
  parameters?: string;
  returnType?: string;
  raw: string;
}

export interface ClassDef {
  id: string;
  label?: string;
  generic?: string;
  annotation?: string;
  members: ClassMember[];
  namespace?: string;
}

export type RelationshipType =
  | 'inheritance' | 'composition' | 'aggregation' | 'association'
  | 'dependency' | 'realization' | 'link_solid' | 'link_dashed';

export interface ClassRelationship {
  from: string;
  to: string;
  type: RelationshipType;
  label?: string;
  fromCardinality?: string;
  toCardinality?: string;
}

export interface NamespaceDef {
  id: string;
  classIds: string[];
}

export type { Direction } from './types.js';

export interface ClassDiagramAST {
  classes: Map<string, ClassDef>;
  relationships: ClassRelationship[];
  namespaces: NamespaceDef[];
  direction?: Direction;
}

// ── Parser ──────────────────────────────────────────────────────────────────

const RELATIONSHIP_PATTERNS: [RegExp, RelationshipType][] = [
  [/<\|--/,   'inheritance'],
  [/--\|>/,   'inheritance'],
  [/\*--/,    'composition'],
  [/--\*/,    'composition'],
  [/o--/,     'aggregation'],
  [/--o/,     'aggregation'],
  [/<\.\./,   'realization'],
  [/\.\.\|>/, 'realization'],
  [/\.\.>/,   'dependency'],
  [/<\.\./,   'dependency'],
  [/-->/,     'association'],
  [/<--/,     'association'],
  [/--/,      'link_solid'],
  [/\.\./,    'link_dashed'],
];

export function parseClassDiagram(source: string): ClassDiagramAST {
  const stream = new TokenStream(source);
  stream.expect(/^classDiagram\s*$/i, 'Expected "classDiagram"');

  const ast: ClassDiagramAST = { classes: new Map(), relationships: [], namespaces: [] };

  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();

    // direction
    const dirMatch = line.match(/^direction\s+(TD|TB|BT|LR|RL)$/i);
    if (dirMatch) { stream.advance(); ast.direction = dirMatch[1].toUpperCase() as Direction; continue; }

    // namespace
    const nsMatch = line.match(/^namespace\s+(\S+)\s*\{?\s*$/);
    if (nsMatch) { stream.advance(); ast.namespaces.push(parseNamespace(nsMatch[1], stream, ast)); continue; }

    // class with body
    const classBodyMatch = line.match(/^class\s+(\S+?)(?:~(.+?)~)?\s*\{?\s*$/);
    if (classBodyMatch && line.includes('{')) {
      stream.advance();
      const cls = ensure(classBodyMatch[1], ast);
      if (classBodyMatch[2]) cls.generic = classBodyMatch[2];
      parseClassBody(cls, stream);
      continue;
    }

    // class declaration
    const classDeclMatch = line.match(/^class\s+(\S+?)(?:~(.+?)~)?(?:\s*:\s*(.+))?$/);
    if (classDeclMatch) {
      stream.advance();
      const cls = ensure(classDeclMatch[1], ast);
      if (classDeclMatch[2]) cls.generic = classDeclMatch[2];
      if (classDeclMatch[3]) cls.label = classDeclMatch[3];
      continue;
    }

    // annotation: <<Interface>> ClassName
    const annMatch = line.match(/^<<(.+?)>>\s+(\S+)$/);
    if (annMatch) { stream.advance(); ensure(annMatch[2], ast).annotation = annMatch[1]; continue; }

    // relationship
    const rel = tryParseRelationship(line);
    if (rel) { stream.advance(); ensure(rel.from, ast); ensure(rel.to, ast); ast.relationships.push(rel); continue; }

    // member via colon syntax: ClassName : +method()
    const memberMatch = line.match(/^(\S+)\s*:\s*(.+)$/);
    if (memberMatch && !line.includes('--') && !line.includes('..')) {
      stream.advance();
      ensure(memberMatch[1], ast).members.push(parseMember(memberMatch[2].trim()));
      continue;
    }

    stream.advance(); // skip unknown
  }

  return ast;
}

// ── Internals ───────────────────────────────────────────────────────────────

function tryParseRelationship(line: string): ClassRelationship | null {
  for (const [pattern, type] of RELATIONSHIP_PATTERNS) {
    const idx = line.search(pattern);
    if (idx === -1) continue;

    const match = line.match(pattern)!;
    let from = line.slice(0, idx).trim();
    let rest = line.slice(idx + match[0].length).trim();

    let fromCardinality: string | undefined;
    const fromCard = from.match(/^(.+?)\s+"(.+?)"$/);
    if (fromCard) { from = fromCard[1].trim(); fromCardinality = fromCard[2]; }

    let toCardinality: string | undefined;
    const toCard = rest.match(/^"(.+?)"\s+(.+)$/);
    if (toCard) { toCardinality = toCard[1]; rest = toCard[2]; }

    let to: string;
    let label: string | undefined;
    const labelMatch = rest.match(/^(\S+)\s*:\s*(.+)$/);
    if (labelMatch) { to = labelMatch[1]; label = labelMatch[2].trim(); }
    else { to = rest.split(/\s/)[0]; }

    if (!from || !to) continue;
    return { from, to, type, label, fromCardinality, toCardinality };
  }
  return null;
}

function parseClassBody(cls: ClassDef, stream: TokenStream): void {
  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();
    if (line === '}') { stream.advance(); return; }
    stream.advance();
    if (!line) continue;

    const annMatch = line.match(/^<<(.+?)>>$/);
    if (annMatch) { cls.annotation = annMatch[1]; continue; }

    cls.members.push(parseMember(line));
  }
}

function parseMember(raw: string): ClassMember {
  let s = raw.trim();
  let visibility: Visibility = null;
  let isStatic = false;
  let isAbstract = false;

  const visMap: Record<string, Visibility> = { '+': 'public', '-': 'private', '#': 'protected', '~': 'internal' };
  if (s[0] in visMap) { visibility = visMap[s[0]]; s = s.slice(1).trim(); }

  if (s.endsWith('$'))      { isStatic = true;   s = s.slice(0, -1).trim(); }
  else if (s.endsWith('*')) { isAbstract = true;  s = s.slice(0, -1).trim(); }

  const isMethod = s.includes('(');
  let name = s;
  let returnType: string | undefined;
  let parameters: string | undefined;

  if (isMethod) {
    const m = s.match(/^(.+?)\(([^)]*)\)(?:\s*(.+))?$/);
    if (m) { name = m[1].trim(); parameters = m[2].trim(); returnType = m[3]?.trim(); }
  } else {
    const m = s.match(/^(\S+)\s*:\s*(.+)$/);
    if (m) { name = m[1]; returnType = m[2].trim(); }
  }

  return { name, visibility, type: returnType, isMethod, isStatic, isAbstract, parameters, returnType, raw };
}

function parseNamespace(id: string, stream: TokenStream, ast: ClassDiagramAST): NamespaceDef {
  const ns: NamespaceDef = { id, classIds: [] };
  while (!stream.isAtEnd()) {
    const line = stream.peek()!.trim();
    if (line === '}') { stream.advance(); break; }
    const classMatch = line.match(/^class\s+(\S+)/);
    if (classMatch) { ensure(classMatch[1], ast).namespace = id; ns.classIds.push(classMatch[1]); }
    stream.advance();
  }
  return ns;
}

function ensure(id: string, ast: ClassDiagramAST): ClassDef {
  if (!ast.classes.has(id)) ast.classes.set(id, { id, members: [] });
  return ast.classes.get(id)!;
}
