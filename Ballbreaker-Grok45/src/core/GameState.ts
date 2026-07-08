import { GAME, type ScreenId } from './Constants';

class GameState {
  score = 0;
  lives = GAME.START_LIVES;
  level = 1;
  screen: ScreenId = 'start';
  isPlaying = false;
  ballLaunched = false;
  bricksRemaining = 0;
  won = false;
  isMuted = false;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.score = 0;
    this.lives = GAME.START_LIVES;
    this.level = 1;
    this.screen = 'start';
    this.isPlaying = false;
    this.ballLaunched = false;
    this.bricksRemaining = 0;
    this.won = false;
    this.isMuted = false;
  }
}

export const gameState = new GameState();
