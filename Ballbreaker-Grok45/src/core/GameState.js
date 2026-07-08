import { GAME } from './Constants.js';

class GameState {
  constructor() {
    this.reset();
  }

  reset() {
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
