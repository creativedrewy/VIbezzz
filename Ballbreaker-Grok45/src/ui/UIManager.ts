import { eventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import type { ScreenId } from '../core/Constants';
import type { LivesPayload, ScorePayload, ScreenPayload } from '../core/EventBus';
import { LEVELS, LEVEL_COUNT, getLevel, clampLevel } from '../level/Levels';

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
  btnMenu: HTMLButtonElement;
  levelGrid: HTMLElement;
  levelName: HTMLElement;
  selectedLevel = 1;

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
    this.btnMenu = requireEl<HTMLButtonElement>('btn-menu');
    this.levelGrid = requireEl('level-grid');
    this.levelName = requireEl('level-name');

    this.buildLevelButtons();

    this.btnStart.addEventListener('click', () => {
      eventBus.emit(Events.GAME_START, { level: this.selectedLevel });
    });
    this.btnRestart.addEventListener('click', () => {
      eventBus.emit(Events.GAME_RESTART);
    });
    this.btnMenu.addEventListener('click', () => {
      eventBus.emit(Events.GAME_MENU);
    });

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

    this.selectLevel(1);
  }

  private buildLevelButtons(): void {
    this.levelGrid.replaceChildren();
    for (const level of LEVELS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'level-btn';
      btn.dataset.level = String(level.id);
      btn.textContent = String(level.id);
      btn.title = `Level ${level.id}: ${level.name}`;
      btn.setAttribute('aria-label', `Level ${level.id}: ${level.name}`);
      // pointerdown so selection still works if something steals click
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectLevel(level.id);
      });
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectLevel(level.id);
      });
      this.levelGrid.appendChild(btn);
    }
  }

  selectLevel(level: number): void {
    this.selectedLevel = clampLevel(level);
    gameState.startLevel = this.selectedLevel;
    const def = getLevel(this.selectedLevel);
    this.levelName.textContent = `Level ${def.id} — ${def.name}`;
    this.levelGrid.querySelectorAll('.level-btn').forEach((el) => {
      const btn = el as HTMLButtonElement;
      const isSelected = Number(btn.dataset.level) === this.selectedLevel;
      btn.classList.toggle('selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    eventBus.emit(Events.LEVEL_SELECT, { level: this.selectedLevel });
  }

  setScreen(screen: ScreenId): void {
    gameState.screen = screen;
    this.screenStart.classList.toggle('visible', screen === 'start');
    this.screenOver.classList.toggle('visible', screen === 'over');
    this.hud.classList.toggle('visible', screen === 'game');
  }

  showGameOver(won: boolean, score: number): void {
    if (won) {
      this.overTitle.textContent = 'You Win!';
      this.overSub.textContent = `Cleared levels ${gameState.startLevel}–${LEVEL_COUNT}`;
    } else {
      this.overTitle.textContent = 'Game Over';
      this.overSub.textContent = `Level ${gameState.level} · Final Score`;
    }
    this.overScore.textContent = String(score);
    this.hudLevel.textContent = String(gameState.level);
    this.setScreen('over');
  }

  syncHud(): void {
    const def = getLevel(gameState.level);
    this.hudScore.textContent = String(gameState.score);
    this.hudLives.textContent = String(gameState.lives);
    this.hudLevel.textContent = `${gameState.level}/${LEVEL_COUNT}`;
    void def;
  }
}
