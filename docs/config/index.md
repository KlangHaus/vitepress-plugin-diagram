# Configuration

## Theme

Tilpas udseendet af diagrammer med et theme-objekt:

```ts
import { defineConfig } from 'vitepress';
import { diagramPlugin } from 'vitepress-plugin-diagram';

export default defineConfig({
  markdown: {
    config(md) {
      md.use(diagramPlugin, {
        theme: {
          nodeFill: '#e8f4fd',
          nodeStroke: '#2196F3',
          nodeTextColor: '#1a1a1a',
          edgeColor: '#666',
          fontSize: 14,
        },
      });
    },
  },
});
```

## Alle theme-egenskaber

| Egenskab | Standard | Beskrivelse |
|----------|----------|-------------|
| `background` | `transparent` | SVG baggrund |
| `nodeFill` | `#f9f9f9` | Node baggrundfarve |
| `nodeStroke` | `#333` | Node kantfarve |
| `nodeTextColor` | `#333` | Node tekstfarve |
| `edgeColor` | `#333` | Kant/pile farve |
| `arrowColor` | `#333` | Pilehoved farve |
| `labelColor` | `#333` | Label tekstfarve |
| `fontSize` | `14` | Skriftst\u00f8rrelse (px) |
| `fontFamily` | `"trebuchet ms", verdana, arial, sans-serif` | Skrifttype |

### Sequence-specifikke

| Egenskab | Standard | Beskrivelse |
|----------|----------|-------------|
| `lifeline` | `#999` | Livslinje farve |
| `activationFill` | `#e8e8e8` | Aktiveringsbar farve |
| `noteFill` | `#fefece` | Note baggrund |
| `noteStroke` | `#aaaa33` | Note kant |

### Class-specifikke

| Egenskab | Standard | Beskrivelse |
|----------|----------|-------------|
| `classHeaderFill` | `#e8e8e8` | Klasse-header baggrund |
| `classSectionStroke` | `#ccc` | Sektions-separator farve |

## Layout-konfiguration

### Flowchart

```ts
md.use(diagramPlugin, {
  flowchart: {
    nodeSpacing: 50,    // Horisontal afstand mellem nodes
    rankSpacing: 50,    // Vertikal afstand mellem r\u00e6kker
    marginX: 20,        // Horisontal margin
    marginY: 20,        // Vertikal margin
  },
});
```

### Sequence

```ts
md.use(diagramPlugin, {
  sequence: {
    participantSpacing: 150,  // Afstand mellem deltagere
    messageSpacing: 40,       // Afstand mellem beskeder
    headerHeight: 50,         // H\u00f8jde p\u00e5 header-omr\u00e5det
    noteWidth: 120,           // Bredde p\u00e5 noter
  },
});
```

### Class Diagram

```ts
md.use(diagramPlugin, {
  classDiagram: {
    nodeSpacing: 60,    // Afstand mellem klasser
    rankSpacing: 80,    // Afstand mellem hierarchy-niveauer
  },
});
```

## DiagramOptions type

```ts
interface DiagramOptions {
  theme?: Partial<Theme>;
  flowchart?: {
    nodeSpacing?: number;
    rankSpacing?: number;
    marginX?: number;
    marginY?: number;
  };
  sequence?: {
    participantSpacing?: number;
    messageSpacing?: number;
    headerHeight?: number;
    noteWidth?: number;
  };
  classDiagram?: {
    nodeSpacing?: number;
    rankSpacing?: number;
  };
}
```

## Standalone brug

`renderDiagram` kan bruges udenfor VitePress:

```ts
import { renderDiagram } from 'vitepress-plugin-diagram';

const svg = renderDiagram(`graph TD
  A --> B --> C
`, {
  theme: { nodeFill: '#dff0d8' },
});

// svg er en string med <svg>...</svg>
```

Returnerer `null` hvis diagramtypen ikke genkendes.
