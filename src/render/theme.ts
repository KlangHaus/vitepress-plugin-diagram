export interface Theme {
  background: string;

  // Flowchart
  nodeFill: string;
  nodeStroke: string;
  nodeTextColor: string;
  decisionFill: string;
  decisionStroke: string;
  terminalFill: string;
  terminalStroke: string;
  processFill: string;
  processStroke: string;
  dataFill: string;
  dataStroke: string;
  subgraphFill: string;
  subgraphStroke: string;
  subgraphLabelColor: string;

  // Edges
  edgeColor: string;
  edgeLabelColor: string;
  edgeLabelBg: string;
  arrowColor: string;

  // Text
  fontSize: number;
  fontFamily: string;

  // Sequence
  participantFill: string;
  participantStroke: string;
  participantTextColor: string;
  actorColor: string;
  lifeline: string;
  activationFill: string;
  noteFill: string;
  noteStroke: string;
  noteTextColor: string;
  blockStroke: string;
  blockLabelFill: string;
  blockLabelColor: string;
  messageLabelColor: string;

  // Class diagram
  classHeaderFill: string;
  classHeaderTextColor: string;
  classBodyFill: string;
  classStroke: string;
  classTextColor: string;
  classSectionStroke: string;
  annotationColor: string;
  namespaceFill: string;
  namespaceStroke: string;
  namespaceLabelColor: string;
  relationLabelColor: string;
}

export const defaultTheme: Theme = {
  background: 'transparent',

  // Flowchart — warm teal + muted earth tones
  nodeFill: '#e6f5f0',
  nodeStroke: '#2a9d8f',
  nodeTextColor: '#264653',
  decisionFill: '#fdebd0',
  decisionStroke: '#e76f51',
  terminalFill: '#e8f0e4',
  terminalStroke: '#588157',
  processFill: '#e6f5f0',
  processStroke: '#2a9d8f',
  dataFill: '#ede4f5',
  dataStroke: '#7c6a93',
  subgraphFill: '#f6f7f8',
  subgraphStroke: '#bcc5ce',
  subgraphLabelColor: '#5c6b77',

  // Edges
  edgeColor: '#8fa3b0',
  edgeLabelColor: '#4a5c6a',
  edgeLabelBg: '#ffffffdd',
  arrowColor: '#8fa3b0',

  // Text
  fontSize: 14,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Sequence
  participantFill: '#e6f5f0',
  participantStroke: '#2a9d8f',
  participantTextColor: '#264653',
  actorColor: '#2a9d8f',
  lifeline: '#c4cfd6',
  activationFill: '#b7dfd5',
  noteFill: '#fdf6e3',
  noteStroke: '#dda15e',
  noteTextColor: '#5a3e1b',
  blockStroke: '#8fa3b0',
  blockLabelFill: '#eef1f4',
  blockLabelColor: '#4a5c6a',
  messageLabelColor: '#264653',

  // Class diagram
  classHeaderFill: '#2a9d8f',
  classHeaderTextColor: '#ffffff',
  classBodyFill: '#fdfdfd',
  classStroke: '#2a9d8f',
  classTextColor: '#3d4f5f',
  classSectionStroke: '#dfe5ea',
  annotationColor: '#6b7f8e',
  namespaceFill: '#f6f7f8',
  namespaceStroke: '#8fa3b0',
  namespaceLabelColor: '#4a5c6a',
  relationLabelColor: '#4a5c6a',
};

export const darkTheme: Theme = {
  background: 'transparent',

  // Flowchart — deep warm darks with vibrant accent strokes
  nodeFill: '#1a3038',
  nodeStroke: '#4fd1c5',
  nodeTextColor: '#e0e7ec',
  decisionFill: '#3a2820',
  decisionStroke: '#f0916c',
  terminalFill: '#1e3028',
  terminalStroke: '#7bc67b',
  processFill: '#1a3038',
  processStroke: '#4fd1c5',
  dataFill: '#282036',
  dataStroke: '#a78bcc',
  subgraphFill: '#181e24',
  subgraphStroke: '#3d4c56',
  subgraphLabelColor: '#8fa3b0',

  // Edges
  edgeColor: '#8299a6',
  edgeLabelColor: '#b0c0ca',
  edgeLabelBg: '#1e2830dd',
  arrowColor: '#8299a6',

  // Text
  fontSize: 14,
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Sequence
  participantFill: '#1a3038',
  participantStroke: '#4fd1c5',
  participantTextColor: '#e0e7ec',
  actorColor: '#4fd1c5',
  lifeline: '#3d4c56',
  activationFill: '#234540',
  noteFill: '#332b18',
  noteStroke: '#dda15e',
  noteTextColor: '#f5e6c8',
  blockStroke: '#5c6f7a',
  blockLabelFill: '#1e2830',
  blockLabelColor: '#b0c0ca',
  messageLabelColor: '#e0e7ec',

  // Class diagram
  classHeaderFill: '#1f7a6e',
  classHeaderTextColor: '#f0faf8',
  classBodyFill: '#181e24',
  classStroke: '#4fd1c5',
  classTextColor: '#d0dce3',
  classSectionStroke: '#3d4c56',
  annotationColor: '#8fa3b0',
  namespaceFill: '#181e24',
  namespaceStroke: '#3d4c56',
  namespaceLabelColor: '#b0c0ca',
  relationLabelColor: '#b0c0ca',
};

/**
 * Generate CSS rules that override diagram colors when an ancestor has `.dark`.
 * Inline SVG presentation attributes have lower specificity than CSS rules,
 * so these selectors override the light-mode fill/stroke attributes automatically.
 */
export function generateDarkModeStyles(dark: Theme): string {
  return [
    // Flowchart nodes
    `.dark .vp-d-process{fill:${dark.processFill};stroke:${dark.processStroke}}`,
    `.dark .vp-d-decision{fill:${dark.decisionFill};stroke:${dark.decisionStroke}}`,
    `.dark .vp-d-terminal{fill:${dark.terminalFill};stroke:${dark.terminalStroke}}`,
    `.dark .vp-d-data{fill:${dark.dataFill};stroke:${dark.dataStroke}}`,
    `.dark .vp-d-node-text{fill:${dark.nodeTextColor}}`,
    // Edges
    `.dark .vp-d-edge{stroke:${dark.edgeColor}}`,
    `.dark .vp-d-edge-label{fill:${dark.edgeLabelColor}}`,
    `.dark .vp-d-edge-label-bg{fill:${dark.edgeLabelBg}}`,
    // Subgraphs
    `.dark .vp-d-subgraph{fill:${dark.subgraphFill};stroke:${dark.subgraphStroke}}`,
    `.dark .vp-d-subgraph-label{fill:${dark.subgraphLabelColor}}`,
    // Arrow markers
    `.dark .vp-d-arrow-filled{fill:${dark.arrowColor}}`,
    `.dark .vp-d-arrow-stroke{stroke:${dark.arrowColor}}`,
    `.dark .vp-d-arrow-open{fill:#181e24;stroke:${dark.arrowColor}}`,
    // Sequence
    `.dark .vp-d-participant{fill:${dark.participantFill};stroke:${dark.participantStroke}}`,
    `.dark .vp-d-participant-text{fill:${dark.participantTextColor}}`,
    `.dark .vp-d-lifeline{stroke:${dark.lifeline}}`,
    `.dark .vp-d-actor circle,.dark .vp-d-actor line{stroke:${dark.actorColor}}`,
    `.dark .vp-d-note{fill:${dark.noteFill};stroke:${dark.noteStroke}}`,
    `.dark .vp-d-note-text{fill:${dark.noteTextColor}}`,
    `.dark .vp-d-message{stroke:${dark.edgeColor}}`,
    `.dark .vp-d-message-label{fill:${dark.messageLabelColor}}`,
    `.dark .vp-d-block{stroke:${dark.blockStroke}}`,
    `.dark .vp-d-block-label-bg{fill:${dark.blockLabelFill};stroke:${dark.blockStroke}}`,
    `.dark .vp-d-block-label{fill:${dark.blockLabelColor}}`,
    // Class diagram
    `.dark .vp-d-class-header{fill:${dark.classHeaderFill};stroke:${dark.classStroke}}`,
    `.dark .vp-d-class-header-text{fill:${dark.classHeaderTextColor}}`,
    `.dark .vp-d-class-body{fill:${dark.classBodyFill};stroke:${dark.classStroke}}`,
    `.dark .vp-d-class-text{fill:${dark.classTextColor}}`,
    `.dark .vp-d-class-section{stroke:${dark.classSectionStroke}}`,
    `.dark .vp-d-annotation{fill:${dark.annotationColor}}`,
    `.dark .vp-d-namespace{fill:${dark.namespaceFill};stroke:${dark.namespaceStroke}}`,
    `.dark .vp-d-namespace-label{fill:${dark.namespaceLabelColor}}`,
    `.dark .vp-d-relation-label{fill:${dark.relationLabelColor}}`,
  ].join('\n');
}

/**
 * Pre-generated dark mode CSS using the default dark theme.
 * Import this in your VitePress theme to enable automatic dark mode support.
 *
 * @example
 * ```ts
 * // .vitepress/theme/index.ts
 * import { darkModeCSS } from 'vitepress-plugin-mermaid-diagram';
 * ```
 */
export const darkModeCSS: string = generateDarkModeStyles(darkTheme);
