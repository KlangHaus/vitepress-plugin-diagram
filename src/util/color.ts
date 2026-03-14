/** Lighten a hex color by `amount` (0–255). */
export function lighten(hex: string, amount: number): string {
  return adjustChannels(hex, amount);
}

/** Darken a hex color by `amount` (0–255). */
export function darken(hex: string, amount: number): string {
  return adjustChannels(hex, -amount);
}

function adjustChannels(hex: string, delta: number): string {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const r = clamp(parseInt(h.slice(0, 2), 16) + delta);
  const g = clamp(parseInt(h.slice(2, 4), 16) + delta);
  const b = clamp(parseInt(h.slice(4, 6), 16) + delta);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function clamp(v: number): number {
  return Math.min(255, Math.max(0, Math.round(v)));
}
