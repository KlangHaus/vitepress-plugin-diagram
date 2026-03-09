export interface Point {
  x: number;
  y: number;
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function pointsToPathD(points: Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y}` + rest.map((p) => ` L ${p.x} ${p.y}`).join('');
}

export function smoothPathD(points: Point[]): string {
  if (points.length < 3) return pointsToPathD(points);

  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;

  for (let i = 0; i < rest.length; i++) {
    const curr = rest[i];
    const prev = i === 0 ? first : rest[i - 1];
    const mid = midpoint(prev, curr);

    if (i === 0) {
      d += ` L ${mid.x} ${mid.y}`;
    } else {
      d += ` Q ${prev.x} ${prev.y} ${mid.x} ${mid.y}`;
    }

    if (i === rest.length - 1) {
      d += ` L ${curr.x} ${curr.y}`;
    }
  }

  return d;
}
