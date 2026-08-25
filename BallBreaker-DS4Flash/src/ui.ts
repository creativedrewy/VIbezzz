export interface Floater {
  el: HTMLDivElement;
  t: number;
  dur: number;
  vx: number;
  vy: number;
  baseTop: number;
}

export class UI {
  private scoreEl: HTMLElement;
  private levelEl: HTMLElement;
  private livesEl: HTMLElement;
  private comboEl: HTMLElement;
  private bannerEl: HTMLElement;
  private bannerText: HTMLElement;
  private bannerSub: HTMLElement;
  private startEl: HTMLElement;
  private gameOverEl: HTMLElement;
  private finalScore: HTMLElement;
  private finalLevel: HTMLElement;
  private powerbar: HTMLElement;
  private powerFill: HTMLElement;
  private soundbar: HTMLElement;
  private floatersEl: HTMLElement;
  private floaters: Floater[] = [];
  private projector: ((v: { x: number; y: number; z: number }) => { x: number; y: number }) | null = null;
  private bannerTimer = 0;
  onStart: (() => void) | null = null;
  onRestart: (() => void) | null = null;
  onToggleSound: (() => void) | null = null;

  constructor() {
    const $ = (id: string) => document.getElementById(id)!;
    this.scoreEl = $("score");
    this.levelEl = $("level");
    this.livesEl = $("lives");
    this.comboEl = $("combo");
    this.bannerEl = $("banner");
    this.bannerText = $("banner-text");
    this.bannerSub = $("banner-sub");
    this.startEl = $("start");
    this.gameOverEl = $("gameover");
    this.finalScore = $("final-score");
    this.finalLevel = $("final-level");
    this.powerbar = $("powerbar");
    this.powerFill = this.powerbar.querySelector(".fill") as HTMLElement;
    this.soundbar = $("soundbar");
    this.floatersEl = $("floaters");

    $("start-btn").addEventListener("click", () => this.onStart?.());
    $("restart-btn").addEventListener("click", () => this.onRestart?.());
    this.soundbar.addEventListener("click", () => this.onToggleSound?.());
  }

  setProjector(p: (v: { x: number; y: number; z: number }) => { x: number; y: number }) {
    this.projector = p;
  }

  setScore(n: number) {
    this.scoreEl.textContent = String(Math.floor(n)).padStart(7, "0");
  }

  setLevel(n: number) {
    this.levelEl.textContent = String(n);
  }

  setLives(n: number) {
    this.livesEl.textContent = "❤".repeat(Math.max(0, n));
  }

  setCombo(combo: number) {
    if (combo >= 2) {
      this.comboEl.textContent = `COMBO ×${combo}`;
      this.comboEl.classList.add("on");
    } else {
      this.comboEl.className = "";
      this.comboEl.textContent = "";
    }
  }

  setPowerRatio(ratio: number) {
    if (ratio > 0) {
      this.powerbar.style.opacity = "1";
      this.powerFill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    } else {
      this.powerbar.style.opacity = "0";
    }
  }

  showMenu() {
    this.startEl.classList.remove("hidden");
    this.gameOverEl.classList.add("hidden");
  }

  hideMenu() {
    this.startEl.classList.add("hidden");
  }

  startMatch() {
    this.startEl.classList.add("hidden");
    this.gameOverEl.classList.add("hidden");
  }

  showGameOver(score: number, level: number, best: number) {
    this.finalScore.textContent = String(Math.floor(score));
    this.finalLevel.textContent = `REACHED LEVEL ${level} · BEST ${Math.max(best, Math.floor(score))}`;
    this.gameOverEl.classList.remove("hidden");
  }

  showBanner(text: string, sub = "") {
    const el = this.bannerEl;
    el.classList.remove("show");
    void el.offsetWidth;
    this.bannerText.textContent = text;
    this.bannerSub.textContent = sub;
    this.bannerText.className = "text";
    this.bannerText.style.background = "";
    this.bannerText.style.webkitTextFillColor = "";
    el.classList.add("show");
    this.bannerTimer = 1.5;
  }

  floatScore(world: { x: number; y: number; z: number }, text: string, cls = "") {
    if (!this.projector) return;
    const s = this.projector(world);
    const el = document.createElement("div");
    el.className = `floater ${cls}`.trim();
    el.textContent = text;
    this.floatersEl.appendChild(el);
    this.floaters.push({
      el,
      t: 0,
      dur: 0.9,
      vx: (Math.random() - 0.5) * 30,
      vy: -60,
      baseTop: s.y,
    });
    el.style.left = `${s.x}px`;
    el.style.top = `${s.y}px`;
  }

  updateFloaters(dt: number) {
    for (let i = this.floaters.length - 1; i >= 0; i--) {
      const f = this.floaters[i];
      f.t += dt;
      const k = f.t / f.dur;
      const x = f.baseTop + f.vx * k;
      const y = f.baseTop + f.vy * k * k;
      f.el.style.transform = `translate(-50%, -50%) translate(${0}px, ${y - f.baseTop}px)`;
      f.el.style.left = `${x}px`;
      f.el.style.opacity = String(1 - k);
      if (k >= 1) {
        f.el.remove();
        this.floaters.splice(i, 1);
      }
    }
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerEl.classList.remove("show");
    }
  }

  setSoundMuted(muted: boolean) {
    this.soundbar.classList.toggle("muted", muted);
    this.soundbar.textContent = muted ? "✕" : "♪";
  }
}