import { BRICKS } from '../core/Constants';

export type LevelDef = {
  id: number;
  name: string;
  /** Rows of cells: '.' empty, '1'..'6' brick tier (color + points). */
  layout: readonly string[];
};

/**
 * 10 unique brick maps. All rows should share the same width per level.
 * Grid is centered in the playfield at build time.
 */
export const LEVELS: readonly LevelDef[] = [
  {
    id: 1,
    name: 'Standard',
    layout: [
      '6666666666',
      '5555555555',
      '4444444444',
      '3333333333',
      '2222222222',
      '1111111111',
    ],
  },
  {
    id: 2,
    name: 'Pyramid',
    layout: [
      '....66....',
      '...5555...',
      '..444444..',
      '.33333333.',
      '2222222222',
      '1111..1111',
    ],
  },
  {
    id: 3,
    name: 'Checker',
    layout: [
      '6.6.6.6.6.',
      '.5.5.5.5.5',
      '4.4.4.4.4.',
      '.3.3.3.3.3',
      '2.2.2.2.2.',
      '.1.1.1.1.1',
    ],
  },
  {
    id: 4,
    name: 'Diamond',
    layout: [
      '....66....',
      '...5555...',
      '..44..44..',
      '.33....33.',
      '..22..22..',
      '...1111...',
    ],
  },
  {
    id: 5,
    name: 'Walls',
    layout: [
      '6666666666',
      '6........6',
      '6555555556',
      '6........6',
      '6444444446',
      '6333333336',
      '6........6',
      '6222222226',
    ],
  },
  {
    id: 6,
    name: 'Smile',
    layout: [
      '..666666..',
      '.6......6.',
      '6..5..5..6',
      '6........6',
      '6.4....4.6',
      '6..4444..6',
      '.6......6.',
      '..666666..',
    ],
  },
  {
    id: 7,
    name: 'Zipper',
    layout: [
      '66666.....',
      '.....55555',
      '44444.....',
      '.....33333',
      '22222.....',
      '.....11111',
      '66666.....',
      '.....55555',
    ],
  },
  {
    id: 8,
    name: 'Fortress',
    layout: [
      '6666666666',
      '6.5.5.5.56',
      '65.5.5.5.6',
      '6.5.5.5.56',
      '644....446',
      '64......46',
      '6333333336',
      '6........6',
    ],
  },
  {
    id: 9,
    name: 'DNA',
    layout: [
      '6........6',
      '.5......5.',
      '..4....4..',
      '...3..3...',
      '....22....',
      '...3..3...',
      '..4....4..',
      '.5......5.',
      '6........6',
      '1........1',
    ],
  },
  {
    id: 10,
    name: 'Gauntlet',
    layout: [
      '6666666666',
      '5.5.5.5.55',
      '4444..4444',
      '3..3333..3',
      '2222..2222',
      '1.1.1.1.11',
      '666....666',
      '..555555..',
      '44......44',
      '3333333333',
    ],
  },
] as const;

export const LEVEL_COUNT = LEVELS.length;

export function getLevel(levelNumber: number): LevelDef {
  const idx = Math.max(0, Math.min(LEVEL_COUNT - 1, levelNumber - 1));
  return LEVELS[idx]!;
}

export function clampLevel(levelNumber: number): number {
  return Math.max(1, Math.min(LEVEL_COUNT, Math.floor(levelNumber)));
}

export type ParsedCell = {
  row: number;
  col: number;
  color: number;
  points: number;
};

export function parseLevelLayout(level: LevelDef): {
  cells: ParsedCell[];
  cols: number;
  rows: number;
} {
  const rows = level.layout.length;
  const cols = Math.max(...level.layout.map((r) => r.length));
  const cells: ParsedCell[] = [];

  for (let row = 0; row < rows; row++) {
    const line = level.layout[row] ?? '';
    for (let col = 0; col < cols; col++) {
      const ch = line[col] ?? '.';
      if (ch === '.' || ch === ' ' || ch === '0') continue;
      const tier = Math.max(1, Math.min(6, parseInt(ch, 10) || 1));
      const color = BRICKS.COLORS[tier - 1] ?? BRICKS.COLORS[0];
      const points = BRICKS.POINTS[tier - 1] ?? BRICKS.POINTS[BRICKS.POINTS.length - 1];
      cells.push({ row, col, color, points });
    }
  }

  return { cells, cols, rows };
}
