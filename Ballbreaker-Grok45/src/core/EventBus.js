class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback(...args);
    };
    this.on(event, wrapper);
  }

  off(event, callback) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.delete(callback);
      if (cbs.size === 0) this.listeners.delete(event);
    }
  }

  emit(event, data) {
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

  clear(event) {
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
};
