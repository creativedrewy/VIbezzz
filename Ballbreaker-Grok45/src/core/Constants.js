export const CAMERA = {
  FOV: 42,
  NEAR: 0.1,
  FAR: 200,
  POS: { x: 0, y: -2.2, z: 28 },
  LOOK_AT: { x: 0, y: 1.5, z: 0 },
};

export const WORLD = {
  WIDTH: 16,
  HEIGHT: 22,
  DEPTH: 1.2,
  WALL_THICKNESS: 0.45,
};

export const PADDLE = {
  WIDTH: 2.8,
  HEIGHT: 0.42,
  DEPTH: 1.15,
  SPEED: 18,
  Y: -8.5,
  Z: 0,
  MAX_BOUNCE_ANGLE: Math.PI * 0.65,
};

export const BALL = {
  RADIUS: 0.28,
  SPEED: 12,
  MAX_SPEED: 18,
  SPEED_GAIN: 0.08,
  LAUNCH_ANGLE_SPREAD: 0.35,
};

export const BRICKS = {
  COLS: 10,
  ROWS: 6,
  WIDTH: 1.35,
  HEIGHT: 0.55,
  DEPTH: 0.65,
  GAP_X: 0.12,
  GAP_Y: 0.14,
  START_Y: 7.2,
  COLORS: [
    0xff3355,
    0xff7733,
    0xffdd33,
    0x33ff88,
    0x33ccff,
    0xaa66ff,
  ],
  POINTS: [60, 50, 40, 30, 20, 10],
};

export const GAME = {
  START_LIVES: 3,
  WIN_BONUS: 500,
};

export const COLORS = {
  BG: 0x050510,
  AMBIENT: 0x304070,
  DIRECTIONAL: 0xa0c8ff,
  WALL: 0x1a2a55,
  PADDLE: 0x44d4ff,
  BALL: 0xffffff,
  FLOOR: 0x0a1028,
  FOG: 0x050510,
};

export function _readSafeInsets() {
  const s = getComputedStyle(document.documentElement);
  return {
    top: parseInt(s.getPropertyValue('--ogp-safe-top-inset'), 10) || 0,
    bottom: parseInt(s.getPropertyValue('--ogp-safe-bottom-inset'), 10) || 0,
  };
}

const _insets = typeof document !== 'undefined' ? _readSafeInsets() : { top: 0, bottom: 0 };

export const SAFE_ZONE = {
  TOP_PX: Math.max(75, _insets.top),
  BOTTOM_PX: _insets.bottom,
  TOP_PERCENT: 8,
};
