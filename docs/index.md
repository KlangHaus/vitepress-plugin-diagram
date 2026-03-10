---
layout: home

hero:
  name: vitepress-plugin-mermaid-diagram
  text: Diagrams without mermaid.js
  tagline: Build-time Mermaid-compatible SVG rendering. No client-side JS. No heavy dependencies.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Diagram Types
      link: /diagrams/flowchart

features:
  - title: Zero client-side JS
    details: All parsing and SVG rendering happens at build time. Your users download pure SVG.
  - title: Mermaid-compatible syntax
    details: Use the familiar Mermaid syntax you already know. Drop-in replacement for mermaid.js code blocks.
  - title: 3 diagram types
    details: Flowcharts, sequence diagrams, and class diagrams with full shape and arrow support.
  - title: Zero dependencies
    details: Custom Sugiyama layout engine. No dagre, no mermaid.js. Just pure SVG output.
---

## Quick Example

Write this in your markdown:

````md
```mermaid
graph LR
  A[Markdown] --> B[Parser]
  B --> C[Layout Engine]
  C --> D[SVG Output]
```
````

And you get:

```mermaid
graph LR
  A[Markdown] --> B[Parser]
  B --> C[Layout Engine]
  C --> D[SVG Output]
```
