import { eventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { ScreenId } from '../core/Constants';
import type { LivesPayload, ScorePayload, ScreenPayload } from '../core/EventBus';

function requireEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

export class UIManager {
  screenStart: HTMLElement;
  screenOver: HTMLElement;
  hud: HTMLElement;
  hudScore: HTMLElement;
  hudLives: HTMLElement;
  hudLevel: HTMLElement;
  overTitle: HTMLElement;
  overSub: HTMLElement;
  overScore: HTMLElement;
  btnStart: HTMLButtonElement;
  btnRestart: HTMLButtonElement;

  constructor() {
    this.screenStart = requireEl('screen-start');
    this.screenOver = requireEl('screen-over');
    this.hud = requireEl('hud');
    this.hudScore = requireEl('hud-score');
    this.hudLives = requireEl('hud-lives');
    this.hudLevel = requireEl('hud-level');
    this.overTitle = requireEl('over-title');
    this.overSub = requireEl('over-sub');
    this.overScore = requireEl('over-score');
    this.btnStart = requireEl<HTMLButtonElement>('btn-start');
    this.btnRestart = requireEl<HTMLButtonElement>('btn-restart');

    this.btnStart.addEventListener('click', () => eventBus.emit(Events.GAME_START));
    this.btnRestart.addEventListener('click', () => eventBus.emit(Events.GAME_RESTART));

    eventBus.on(Events.SCORE_CHANGED, (data) => {
      const { score } = data as ScorePayload;
      this.hudScore.textContent = String(score);
    });
    eventBus.on(Events.LIVES_CHANGED, (data) => {
      const { lives } = data as LivesPayload;
      this.hudLives.textContent = String(lives);
    });
    eventBus.on(Events.SCREEN_CHANGE, (data) => {
      const { screen } = data as ScreenPayload;
      this.setScreen(screen as ScreenId);
    });
  }

  setScreen(screen: ScreenId): void {
    gameState.screen = screen;
    this.screenStart.classList.toggle('visible', screen === 'start');
    this.screenOver.classList.toggle('visible', screen === 'over');
    this.hud.classList.toggle('visible', screen === 'game');
  }

  showGameOver(won: boolean, score: number): void {
    this.overTitle.textContent = won ? 'You Win!' : 'Game Over';
    this.overSub.textContent = won ? 'All Bricks Cleared' : 'Final Score';
    this.overScore.textContent = String(score);
    this.hudLevel.textContent = String(gameState.level);
    this.setScreen('over');
  }

  syncHud(): void {
    this.hudScore.textContent = String(gameState.score);
    this.hudLives.textContent = String(gameState.lives);
    this.hudLevel.textContent = String(gameState.level);
  }
}
