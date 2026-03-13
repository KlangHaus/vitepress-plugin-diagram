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

  // Flowchart — soft blue palette with semantic accents
  nodeFill: '#e8f4fd',
  nodeStroke: '#4a90d9',
  nodeTextColor: '#1a3a5c',
  decisionFill: '#fff3e0',
  decisionStroke: '#e6a23c',
  terminalFill: '#e8f5e9',
  terminalStroke: '#67c23a',
  processFill: '#e8f4fd',
  processStroke: '#4a90d9',
  dataFill: '#f3e8fd',
  dataStroke: '#9b59b6',
  subgraphFill: '#f8fafc',
  subgraphStroke: '#c0d0e0',
  subgraphLabelColor: '#5a7a9a',

  // Edges
  edgeColor: '#6b7b8d',
  edgeLabelColor: '#4a5568',
  edgeLabelBg: '#ffffffdd',
  arrowColor: '#6b7b8d',

  // Text
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Sequence — warm, distinct per role
  participantFill: '#e8f4fd',
  participantStroke: '#4a90d9',
  participantTextColor: '#1a3a5c',
  actorColor: '#4a90d9',
  lifeline: '#c0d0e0',
  activationFill: '#d0e4f5',
  noteFill: '#fef9e7',
  noteStroke: '#d4ac0d',
  noteTextColor: '#5a4e1a',
  blockStroke: '#9b9b9b',
  blockLabelFill: '#f0f0f0',
  blockLabelColor: '#4a4a4a',
  messageLabelColor: '#2d3748',

  // Class diagram
  classHeaderFill: '#4a90d9',
  classHeaderTextColor: '#ffffff',
  classBodyFill: '#ffffff',
  classStroke: '#4a90d9',
  classTextColor: '#2d3748',
  classSectionStroke: '#e2e8f0',
  annotationColor: '#718096',
  namespaceFill: '#f7fafc',
  namespaceStroke: '#a0aec0',
  namespaceLabelColor: '#4a5568',
  relationLabelColor: '#4a5568',
};

export const darkTheme: Theme = {
  background: 'transparent',

  // Flowchart — dark palette with semantic accents
  nodeFill: '#1e3a5f',
  nodeStroke: '#63b3ed',
  nodeTextColor: '#e2e8f0',
  decisionFill: '#4a3728',
  decisionStroke: '#f6ad55',
  terminalFill: '#1a3a2a',
  terminalStroke: '#68d391',
  processFill: '#1e3a5f',
  processStroke: '#63b3ed',
  dataFill: '#2d1f3d',
  dataStroke: '#b794f4',
  subgraphFill: '#1a202c',
  subgraphStroke: '#4a5568',
  subgraphLabelColor: '#a0aec0',

  // Edges
  edgeColor: '#a0aec0',
  edgeLabelColor: '#cbd5e0',
  edgeLabelBg: '#2d3748dd',
  arrowColor: '#a0aec0',

  // Text
  fontSize: 14,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Sequence
  participantFill: '#1e3a5f',
  participantStroke: '#63b3ed',
  participantTextColor: '#e2e8f0',
  actorColor: '#63b3ed',
  lifeline: '#4a5568',
  activationFill: '#2a4a6b',
  noteFill: '#3d3520',
  noteStroke: '#d4ac0d',
  noteTextColor: '#fef9e7',
  blockStroke: '#718096',
  blockLabelFill: '#2d3748',
  blockLabelColor: '#cbd5e0',
  messageLabelColor: '#e2e8f0',

  // Class diagram
  classHeaderFill: '#2b6cb0',
  classHeaderTextColor: '#ffffff',
  classBodyFill: '#1a202c',
  classStroke: '#63b3ed',
  classTextColor: '#e2e8f0',
  classSectionStroke: '#4a5568',
  annotationColor: '#a0aec0',
  namespaceFill: '#1a202c',
  namespaceStroke: '#4a5568',
  namespaceLabelColor: '#cbd5e0',
  relationLabelColor: '#cbd5e0',
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
    `.dark .vp-d-arrow-open{fill:#1a202c;stroke:${dark.arrowColor}}`,
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
