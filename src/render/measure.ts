const NARROW = 'ilI1|!.,;:\'"()[]{}/ tjfrJ';
const WIDE = 'mwMWGOQD@%';

export function measureText(text: string, fontSize = 14): { width: number; height: number } {
  const scale = fontSize / 14;
  let width = 0;
  for (const ch of text) {
    if (NARROW.includes(ch)) width += 5.0;
    else if (WIDE.includes(ch)) width += 11.0;
    else width += 8.4;
  }
  return { width: width * scale, height: fontSize * 1.4 * scale };
}

export function measureNodeSize(
  label: string, fontSize = 14, paddingX = 16, paddingY = 12,
): { width: number; height: number } {
  const lines = label.split('\n');
  const { height: lineHeight } = measureText('X', fontSize);
  let maxWidth = 0;
  for (const line of lines) {
    const { width } = measureText(line, fontSize);
    if (width > maxWidth) maxWidth = width;
  }
  return { width: maxWidth + paddingX * 2, height: lineHeight * lines.length + paddingY * 2 };
}
