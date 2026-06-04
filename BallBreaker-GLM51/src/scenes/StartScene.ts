import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private startText!: Phaser.GameObjects.Text;
  private timeElapsed: number = 0;

  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.timeElapsed = 0;

    this.cameras.main.setPostPipeline(['GlowPipeline']);

    const glowP = this.getGlowPipeline();
    if (glowP) glowP.intensity = 0.5;

    this.createBackground(width, height);

    this.add.particles(0, 0, undefined, {
      quantity: 2,
      speed: { min: 20, max: 60 },
      scale: { start: 0.04, end: 0 },
      lifespan: 4000,
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      emitting: true,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, width, height),
      },
      tint: [0x6366f1, 0x8b5cf6, 0x06b6d4, 0xf43f5e],
    });

    this.titleText = this.add
      .text(width / 2, height / 2 - 80, 'BALL BREAKER', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '56px',
        fontStyle: 'bold',
        color: '#e0e7ff',
        stroke: '#4f46e5',
        strokeThickness: 4,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#6366f1',
          blur: 20,
          fill: true,
        },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 10, 'Break them all.', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '20px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);

    this.startText = this.add
      .text(width / 2, height / 2 + 80, 'Click or Press SPACE to Start', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '22px',
        color: '#c7d2fe',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add
      .text(width / 2, height / 2 + 160, 'Keyboard: \u2190 \u2192 to move  |  Mouse: Move to control', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '14px',
        color: '#64748b',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 185, 'SPACE or Click to launch ball', {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '14px',
        color: '#64748b',
      })
      .setOrigin(0.5);

    this.input.on('pointerdown', () => this.startGame());
    this.input.keyboard!.on('keydown-SPACE', () => this.startGame());
  }

  private getGlowPipeline(): import('../shaders/pipelines').GlowPipeline | null {
    const pipelines = this.cameras.main.postPipelines as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    const p = pipelines.find(p => p.name === 'GlowPipeline');
    return p ? (p as unknown as import('../shaders/pipelines').GlowPipeline) : null;
  }

  private createBackground(w: number, h: number) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x1a0a3e, 0x0a1a3e, 1);
    bg.fillRect(0, 0, w, h);

    const colors = [0x6366f1, 0x8b5cf6, 0x06b6d4, 0xf43f5e, 0x10b981];
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const r = Phaser.Math.Between(80, 200);
      const glow = this.add.circle(x, y, r, colors[i], 0.04);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.04, to: 0.08 },
        scale: { from: 1, to: 1.2 },
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private startGame() {
    this.scene.start('GameScene');
  }

  update(_time: number, delta: number) {
    this.timeElapsed += delta * 0.001;
    this.titleText.y = this.scale.height / 2 - 80 + Math.sin(this.timeElapsed * 2) * 5;
  }
}
