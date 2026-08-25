export const GRID_ROWS = 6;
export const GRID_COLS = 8;

export interface LevelSpec {
  rows: number;
  cols: number;
  hp: number[][];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildLevel(level: number): LevelSpec {
  const rand = mulberry32(0xbeef + level * 7919);
  const rows = GRID_ROWS;
  const cols = GRID_COLS;
  const hp: number[][] = [];

  const extra = Math.min(4, 1 + Math.floor((level - 1) / 2));
  const holeChance = Math.min(0.42, 0.08 + (level - 1) * 0.05);
  const offset = Math.floor(rand() * cols);

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      let cellHp = 1 + extra;
      if (r >= rows - 2) cellHp += 1;
      if (r >= rows - 1) cellHp += 1;
      cellHp = Math.min(cellHp, 4);

      const patternHole = (c + r + offset) % 4 === 0 && level >= 2;
      if (patternHole && r % 2 === 1) {
        row.push(0);
        continue;
      }
      if (rand() < holeChance && level >= 2) {
        row.push(0);
        continue;
      }
      row.push(cellHp);
    }
    hp.push(row);
  }

  const barrier = Math.floor(rand() * cols);
  for (let c = 0; c < cols; c++) {
    if (c !== barrier && c !== (barrier + 1) % cols && rand() < 0.35) hp[rows - 1][c] = 0;
  }

  return { rows, cols, hp };
}

export function brickScore(hp: number, row: number, rows: number): number {
  const base = [60, 70, 85, 105, 130, 160][Math.max(0, Math.min(5, rows - 1 - row))] ?? 100;
  return base + (hp - 1) * 35;
}

export function brickColor(hp: number, row: number, rows: number): number {
  if (hp >= 4) return 0xffffff;
  if (hp === 3) return 0x9d6bff;
  if (hp === 2) return 0x6cff8a;
  const palette = [0xff2157, 0xff7a2b, 0xffd42e, 0x63ff8f, 0x3fe6ff, 0xa86cff];
  return palette[Math.max(0, Math.min(5, rows - 1 - row))];
}