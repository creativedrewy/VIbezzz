import { GAME, type ScreenId } from './Constants';
import { LEVEL_COUNT, clampLevel } from '../level/Levels';

class GameState {
  score = 0;
  lives = GAME.START_LIVES;
  level = 1;
  startLevel = 1;
  screen: ScreenId = 'start';
  isPlaying = false;
  ballLaunched = false;
  bricksRemaining = 0;
  won = false;
  isMuted = false;
  /** True while clearing a level / loading next (blocks ball lives loss). */
  levelTransition = false;

  constructor() {
    this.reset();
  }

  reset(fromLevel?: number): void {
    const start = clampLevel(fromLevel ?? this.startLevel);
    this.startLevel = start;
    this.score = 0;
    this.lives = GAME.START_LIVES;
    this.level = start;
    this.screen = 'start';
    this.isPlaying = false;
    this.ballLaunched = false;
    this.bricksRemaining = 0;
    this.won = false;
    this.isMuted = false;
    this.levelTransition = false;
  }

  hasNextLevel(): boolean {
    return this.level < LEVEL_COUNT;
  }
}

export const gameState = new GameState();
