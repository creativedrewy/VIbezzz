import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private won: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score?: number; won?: boolean }) {
    this.score = data.score ?? 0;
    this.won = data.won ?? false;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setPostPipeline(['GlowPipeline', 'ChromaticPipeline']);

    const glowP = this.getGlowPipeline();
    if (glowP) glowP.intensity = 0.6;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a0a3e, 0x0a1a3e, 1);
    bg.fillRect(0, 0, width, height);

    const colors = this.won
      ? [0x22c55e, 0x06b6d4, 0x6366f1]
      : [0xf43f5e, 0xf97316, 0xa855f7];
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.Between(60, 180);
      const glow = this.add.circle(x, y, r, colors[i % colors.length], 0.04);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.04, to: 0.1 },
        scale: { from: 1, to: 1.3 },
        duration: 3000 + i * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    const title = this.won ? 'YOU WIN!' : 'GAME OVER';
    const titleColor = this.won ? '#22c55e' : '#f43f5e';
    const strokeColor = this.won ? '#16a34a' : '#dc2626';

    this.add
      .text(width / 2, height / 2 - 80, title, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color: titleColor,
        stroke: strokeColor,
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: strokeColor,
          blur: 25,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `FINAL SCORE: ${this.score}`, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#e0e7ff',
      })
      .setOrigin(0.5);

    const restartText = this.add
      .text(width / 2, height / 2 + 80, 'Click or Press SPACE to Restart', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '22px',
        color: '#c7d2fe',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    if (this.won) {
      this.add.particles(width / 2, height / 2 - 80, undefined, {
        speed: { min: 30, max: 100 },
        scale: { start: 0.05, end: 0 },
        lifespan: 2000,
        alpha: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        tint: [0x22c55e, 0x06b6d4, 0x6366f1, 0xeab308],
        quantity: 4,
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Circle(0, 0, 40),
          quantity: 20,
        },
      });
    }

    this.input.on('pointerdown', () => this.restart());
    this.input.keyboard!.on('keydown-SPACE', () => this.restart());
  }

  private getGlowPipeline(): import('../shaders/pipelines').GlowPipeline | null {
    const pipelines = this.cameras.main.postPipelines as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    const p = pipelines.find(p => p.name === 'GlowPipeline');
    return p ? (p as unknown as import('../shaders/pipelines').GlowPipeline) : null;
  }

  private getChromaticPipeline(): import('../shaders/pipelines').ChromaticPipeline | null {
    const pipelines = this.cameras.main.postPipelines as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    const p = pipelines.find(p => p.name === 'ChromaticPipeline');
    return p ? (p as unknown as import('../shaders/pipelines').ChromaticPipeline) : null;
  }

  private restart() {
    this.scene.start('StartScene');
  }

  update() {
    const glowP = this.getGlowPipeline();
    if (glowP && glowP.intensity > 0.6) {
      glowP.intensity = Phaser.Math.Linear(glowP.intensity, 0.6, 0.05);
    }

    const chromaP = this.getChromaticPipeline();
    if (chromaP && chromaP.amount > 0) {
      chromaP.amount = Phaser.Math.Linear(chromaP.amount, 0, 0.05);
    }
  }
}
