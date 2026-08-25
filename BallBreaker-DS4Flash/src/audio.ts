export class SoundFX {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastBrick = 0;
  muted = false;

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  toggle(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    slideTo?: number,
    delay = 0
  ) {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  launch() {
    this.tone(180, 0.16, "square", 0.18, 520);
  }

  paddle() {
    this.tone(300, 0.07, "square", 0.14, 220);
    this.tone(600, 0.05, "sine", 0.1, 400);
  }

  wall() {
    this.tone(220, 0.06, "triangle", 0.12, 160);
  }

  brick(rowScore: number, level: number) {
    const now = performance.now();
    if (now - this.lastBrick < 28) return;
    this.lastBrick = now;
    const f = 320 + rowScore * 3.2 + level * 22;
    this.tone(f, 0.08, "square", 0.1, f * 1.35);
  }

  steel() {
    this.tone(140, 0.09, "sawtooth", 0.12, 90);
    this.tone(420, 0.05, "triangle", 0.08, 300);
  }

  power(type: number) {
    const base = [720, 540, 980, 300][type] ?? 600;
    this.tone(base, 0.07, "square", 0.12);
    this.tone(base * 1.25, 0.07, "square", 0.12, undefined, 0.06);
    this.tone(base * 1.5, 0.1, "square", 0.12, undefined, 0.12);
  }

  lifeLost() {
    this.tone(440, 0.12, "sawtooth", 0.14, 220);
    this.tone(220, 0.22, "sawtooth", 0.12, 110, 0.1);
    this.tone(110, 0.3, "square", 0.1, 55, 0.2);
  }

  levelClear() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this.tone(n, 0.14, "square", 0.12, undefined, i * 0.09));
  }

  oneUp() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => this.tone(n, 0.12, "sine", 0.12, undefined, i * 0.07));
  }

  gameOver() {
    const notes = [440, 349, 262, 196];
    notes.forEach((n, i) => this.tone(n, 0.22, "triangle", 0.14, undefined, i * 0.16));
  }
}