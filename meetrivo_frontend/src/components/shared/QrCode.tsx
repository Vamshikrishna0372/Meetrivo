import { useMemo } from "react";

/**
 * Deterministic decorative QR-style matrix (frontend mock — no real encoding).
 * Produces a stable, QR-looking pattern from a seed string.
 */
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const cells = 21;
  const matrix = useMemo(() => {
    const grid: boolean[][] = [];
    let seed = hash(value);
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };
    for (let y = 0; y < cells; y++) {
      grid[y] = [];
      for (let x = 0; x < cells; x++) grid[y][x] = rand() > 0.5;
    }
    // finder squares
    const place = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || x === 6 || y === 0 || y === 6;
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || inner;
        }
    };
    place(0, 0);
    place(cells - 7, 0);
    place(0, cells - 7);
    return grid;
  }, [value]);

  const unit = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code">
      <rect width={size} height={size} fill="white" rx={8} />
      {matrix.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect
              key={`${x}-${y}`}
              x={x * unit}
              y={y * unit}
              width={unit}
              height={unit}
              fill="black"
              rx={unit * 0.18}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}
