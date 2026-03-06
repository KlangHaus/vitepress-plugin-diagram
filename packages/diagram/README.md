# sugi

Zero-dependency diagram library. Parses Mermaid-compatible syntax, lays out with a custom Sugiyama engine, and outputs clean SVG strings — no browser, no DOM, no runtime dependencies.

## Install

```bash
pnpm add sugi
```

## Usage

### Simple rendering

```ts
import { render } from 'sugi'

const svg = render(`
graph TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Done]
  B -->|No| D[Retry]
`)

if (svg) {
  // Complete SVG string — write to file, embed in HTML, etc.
  fs.writeFileSync('diagram.svg', svg)
}
```

`render()` returns `null` if the diagram type is not recognized.

### With options

```ts
const svg = render(source, {
  theme: {
    processFill: '#dbeafe',
    processStroke: '#3b82f6',
    decisionFill: '#fef3c7',
    decisionStroke: '#f59e0b',
    fontSize: 13,
  },
  flowchart: {
    nodesep: 60,
    ranksep: 80,
    rankdir: 'LR',
  },
})
```

### Advanced: individual pipeline stages

Each stage of the pipeline is exported for advanced use cases:

```ts
import {
  parseFlowchart,
  layoutFlowchart,
  renderSVG,
  defaultTheme,
} from 'sugi'

// 1. Parse
const ast = parseFlowchart('graph TD\n  A --> B')

// 2. Layout
const layout = layoutFlowchart(ast, { rankdir: 'LR', nodesep: 80 })

// 3. Render
const svg = renderSVG(layout, 'flowchart', defaultTheme)
```

## Supported Diagrams

### Flowchart

```
graph TD
  A[Rectangle] --> B(Rounded)
  B --> C{Diamond}
  C -->|Yes| D((Circle))
  C -->|No| E{{Hexagon}}
  subgraph Group
    D
    E
  end
```

**Shapes:** `rect`, `round`, `circle`, `doubleCircle`, `diamond`, `hexagon`, `stadium`, `subroutine`, `cylinder`, `parallelogram`

**Edge styles:** solid (`-->`), dotted (`-.->`), thick (`==>`), with labels (`-->|label|`)

**Arrow types:** arrow, open, circle, cross

**Directions:** `TD`/`TB` (top-down), `LR` (left-right), `BT` (bottom-top), `RL` (right-left)

### Sequence Diagram

```
sequenceDiagram
  participant A as Alice
  actor B as Bob
  A->>B: Request
  B-->>A: Response
  Note right of A: Think about it
  alt success
    A->>B: Accept
  else failure
    A->>B: Reject
  end
```

**Participants:** `participant` (box) and `actor` (stick figure)

**Messages:** solid (`->>`), dotted (`-->>`), with arrow types

**Notes:** `Note left of`, `Note right of`, `Note over`

**Blocks:** `alt/else`, `opt`, `loop`, `par`, `critical`, `break`

### Class Diagram

```
classDiagram
  namespace Models {
    class Animal {
      <<abstract>>
      +String name
      #int age
      +makeSound()* void
    }
    class Dog {
      +fetch() void
    }
  }
  Animal <|-- Dog : extends
```

**Members:** attributes and methods with visibility (`+` public, `-` private, `#` protected, `~` internal)

**Annotations:** `<<interface>>`, `<<abstract>>`, `<<enum>>`, `<<service>>`

**Generics:** `class List~T~`

**Relationships:** inheritance (`<|--`), composition (`*--`), aggregation (`o--`), association (`-->`), dependency (`..>`), realization (`..|>`)

**Cardinality:** `"1" --> "*"`

## Layout Engine

The Sugiyama layout engine is a complete from-scratch implementation with zero dependencies. It replaces dagre with a 6-phase pipeline:

| Phase | Algorithm | Purpose |
|-------|-----------|---------|
| 1. Cycle removal | DFS back-edge reversal | Ensure DAG for ranking |
| 2. Rank assignment | Kahn's topological sort + longest path | Assign vertical layers |
| 3. Normalization | Dummy node insertion | Handle multi-rank edges |
| 4. Crossing minimization | Barycenter heuristic | Reduce edge crossings |
| 5. Coordinate assignment | Median alignment + spacing | Position nodes |
| 6. Denormalization | Dummy removal + bend points | Clean up edge routing |

### Configuration

```ts
interface EngineConfig {
  rankdir: 'TB' | 'BT' | 'LR' | 'RL'  // Layout direction
  nodesep: number                        // Horizontal spacing between nodes
  ranksep: number                        // Vertical spacing between ranks
  marginx: number                        // Horizontal margin
  marginy: number                        // Vertical margin
}
```

## Theming

All theme properties are optional — pass a partial object to override only what you need.

### Flowchart theme

| Property | Default | Description |
|----------|---------|-------------|
| `processFill` | `#e8f4fd` | Fill for rect/round/subroutine nodes |
| `processStroke` | `#4a90d9` | Stroke for process nodes |
| `decisionFill` | `#fff3e0` | Fill for diamond nodes |
| `decisionStroke` | `#e6a23c` | Stroke for diamond nodes |
| `terminalFill` | `#e8f5e9` | Fill for circle/stadium nodes |
| `terminalStroke` | `#67c23a` | Stroke for terminal nodes |
| `dataFill` | `#f3e8fd` | Fill for parallelogram/cylinder nodes |
| `dataStroke` | `#9b59b6` | Stroke for data nodes |
| `subgraphFill` | `#f8fafc` | Fill for subgraph backgrounds |
| `subgraphStroke` | `#c0d0e0` | Stroke for subgraph borders |
| `nodeTextColor` | `#1a3a5c` | Text color for all flowchart nodes |

### Edge theme

| Property | Default | Description |
|----------|---------|-------------|
| `edgeColor` | `#6b7b8d` | Edge line color |
| `edgeLabelColor` | `#4a5568` | Edge label text color |
| `edgeLabelBg` | `#ffffffdd` | Edge label background |
| `arrowColor` | `#6b7b8d` | Arrowhead color |

### Sequence theme

| Property | Default | Description |
|----------|---------|-------------|
| `participantFill` | `#e8f4fd` | Participant box fill |
| `participantStroke` | `#4a90d9` | Participant box stroke |
| `participantTextColor` | `#1a3a5c` | Participant label color |
| `actorColor` | `#4a90d9` | Actor stick figure color |
| `lifeline` | `#c0d0e0` | Lifeline dash color |
| `noteFill` | `#fef9e7` | Note background |
| `noteStroke` | `#d4ac0d` | Note border |
| `messageLabelColor` | `#2d3748` | Message text color |
| `blockStroke` | `#9b9b9b` | Fragment block border |
| `blockLabelFill` | `#f0f0f0` | Fragment label background |

### Class diagram theme

| Property | Default | Description |
|----------|---------|-------------|
| `classHeaderFill` | `#4a90d9` | Class header background |
| `classHeaderTextColor` | `#ffffff` | Class header text |
| `classBodyFill` | `#ffffff` | Class body background |
| `classStroke` | `#4a90d9` | Class border |
| `classTextColor` | `#2d3748` | Member text color |
| `annotationColor` | `#718096` | Stereotype annotation color |
| `namespaceFill` | `#f7fafc` | Namespace background |
| `namespaceStroke` | `#a0aec0` | Namespace border |
| `relationLabelColor` | `#4a5568` | Relationship label color |

### Global

| Property | Default | Description |
|----------|---------|-------------|
| `background` | `transparent` | SVG background |
| `fontSize` | `14` | Base font size |
| `fontFamily` | system fonts | Font stack |

## API Reference

### `render(source, options?)`

Parse and render a Mermaid-compatible diagram to SVG.

- **source** `string` — Mermaid syntax
- **options** `RenderOptions` — theme, layout config per diagram type
- **returns** `string | null` — SVG string or null if unrecognized

### Parsers

- `parseFlowchart(source)` → `FlowchartAST`
- `parseSequence(source)` → `SequenceAST`
- `parseClassDiagram(source)` → `ClassDiagramAST`
- `detectDiagramType(source)` → `'flowchart' | 'sequence' | 'classDiagram' | null`

### Layout

- `layoutFlowchart(ast, config?)` → `LayoutResult`
- `layoutSequence(ast, config?)` → `LayoutResult`
- `layoutClassDiagram(ast, config?)` → `LayoutResult`
- `sugiyamaLayout(nodes, edges, config?)` — low-level engine

### Render

- `renderSVG(layout, type, theme)` → `string`
- `defaultTheme` — default theme object
- `measureText(text)` / `measureNodeSize(text)` — text measurement utilities

## License

MIT
