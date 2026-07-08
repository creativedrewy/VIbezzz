// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (data?: any) => void;

class EventBus {
  private listeners = new Map<string, Set<EventCallback>>();

  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  once(event: string, callback: EventCallback): void {
    const wrapper: EventCallback = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  off(event: string, callback: EventCallback): void {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.delete(callback);
      if (cbs.size === 0) this.listeners.delete(event);
    }
  }

  emit(event: string, data?: unknown): void {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`EventBus error [${event}]:`, e);
        }
      });
    }
  }

  clear(event?: string): void {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
  }
}

export const eventBus = new EventBus();

export const Events = {
  GAME_START: 'game:start',
  GAME_OVER: 'game:over',
  GAME_WIN: 'game:win',
  GAME_RESTART: 'game:restart',
  SCREEN_CHANGE: 'screen:change',
  BALL_LAUNCH: 'ball:launch',
  BALL_LOST: 'ball:lost',
  BRICK_HIT: 'brick:hit',
  BRICK_DESTROYED: 'brick:destroyed',
  SCORE_CHANGED: 'score:changed',
  LIVES_CHANGED: 'lives:changed',
  LEVEL_CLEARED: 'level:cleared',
  PADDLE_HIT: 'paddle:hit',
} as const;

export type BrickDestroyedPayload = {
  points: number;
  remaining: number;
  position: import('three').Vector3;
  color: number;
};

export type ScorePayload = { score: number };
export type LivesPayload = { lives: number };
export type ScreenPayload = { screen: string };
export type GameOverPayload = { won: boolean; score: number };
