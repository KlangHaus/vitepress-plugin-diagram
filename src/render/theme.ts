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
