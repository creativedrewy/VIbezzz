import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class UIManager {
  constructor() {
    this.screenStart = document.getElementById('screen-start');
    this.screenOver = document.getElementById('screen-over');
    this.hud = document.getElementById('hud');
    this.hudScore = document.getElementById('hud-score');
    this.hudLives = document.getElementById('hud-lives');
    this.hudLevel = document.getElementById('hud-level');
    this.overTitle = document.getElementById('over-title');
    this.overSub = document.getElementById('over-sub');
    this.overScore = document.getElementById('over-score');
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');

    this.btnStart.addEventListener('click', () => eventBus.emit(Events.GAME_START));
    this.btnRestart.addEventListener('click', () => eventBus.emit(Events.GAME_RESTART));

    eventBus.on(Events.SCORE_CHANGED, ({ score }) => {
      this.hudScore.textContent = String(score);
    });
    eventBus.on(Events.LIVES_CHANGED, ({ lives }) => {
      this.hudLives.textContent = String(lives);
    });
    eventBus.on(Events.SCREEN_CHANGE, ({ screen }) => this.setScreen(screen));
  }

  setScreen(screen) {
    gameState.screen = screen;
    this.screenStart.classList.toggle('visible', screen === 'start');
    this.screenOver.classList.toggle('visible', screen === 'over');
    this.hud.classList.toggle('visible', screen === 'game');
  }

  showGameOver(won, score) {
    this.overTitle.textContent = won ? 'You Win!' : 'Game Over';
    this.overSub.textContent = won ? 'All Bricks Cleared' : 'Final Score';
    this.overScore.textContent = String(score);
    this.hudLevel.textContent = String(gameState.level);
    this.setScreen('over');
  }

  syncHud() {
    this.hudScore.textContent = String(gameState.score);
    this.hudLives.textContent = String(gameState.lives);
    this.hudLevel.textContent = String(gameState.level);
  }
}
