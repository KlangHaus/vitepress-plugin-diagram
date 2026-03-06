# Flowchart

Flowcharts use the `graph` or `flowchart` keyword followed by a direction.

## Directions

| Keyword | Direction |
|---------|-----------|
| `TD` / `TB` | Top to bottom |
| `BT` | Bottom to top |
| `LR` | Left to right |
| `RL` | Right to left |

### Top-Down

```mermaid
graph TD
  A --> B
  B --> C
```

### Left-Right

```mermaid
graph LR
  A --> B
  B --> C
```

## Node Shapes

### Rectangle

```mermaid
graph LR
  A[Rectangle]
```

### Rounded

```mermaid
graph LR
  A(Rounded)
```

### Circle

```mermaid
graph LR
  A((Circle))
```

### Diamond (decision)

```mermaid
graph LR
  A{Diamond}
```

### Hexagon

```mermaid
graph LR
  A{{Hexagon}}
```

### Stadium / pill

```mermaid
graph LR
  A([Stadium])
```

### All shapes together

```mermaid
graph LR
  A[Rectangle] --> B(Rounded)
  B --> C((Circle))
  C --> D{Diamond}
  D --> E{{Hexagon}}
  E --> F([Stadium])
```

## Edge Types

### Solid arrow

```mermaid
graph LR
  A --> B
```

### Dotted arrow

```mermaid
graph LR
  A -.-> B
```

### Thick arrow

```mermaid
graph LR
  A ==> B
```

### No arrow (line)

```mermaid
graph LR
  A --- B
```

### Circle arrow

```mermaid
graph LR
  A --o B
```

### Cross arrow

```mermaid
graph LR
  A --x B
```

## Edge Labels

```mermaid
graph TD
  A{Decision} -->|Yes| B[Do it]
  A -->|No| C[Skip it]
```

## Node Chains

Multiple nodes and edges on one line:

```mermaid
graph LR
  A --> B --> C --> D
```

## Subgraphs

Group nodes in subgraphs:

```mermaid
graph TD
  subgraph Frontend Frontend
    A[React] --> B[Components]
  end
  subgraph Backend Backend
    C[API] --> D[Database]
  end
  B --> C
```

## Full Example

```mermaid
graph TD
  Start[Start] --> Input[Receive input]
  Input --> Validate{Valid?}
  Validate -->|Yes| Process[Process data]
  Validate -->|No| Error[Show error]
  Error --> Input
  Process --> Save([Save to database])
  Save --> Done((Done))
```
