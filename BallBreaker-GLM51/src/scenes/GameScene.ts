import Phaser from 'phaser';
import { GlowPipeline, ChromaticPipeline } from '../shaders/pipelines';

const GAME_W = 800;
const GAME_H = 600;
const PADDLE_W = 120;
const PADDLE_H = 16;
const BALL_R = 8;
const BRICK_ROWS = 7;
const BRICK_COLS = 10;
const BRICK_W = 70;
const BRICK_H = 22;
const BRICK_PAD = 4;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = (GAME_W - BRICK_COLS * (BRICK_W + BRICK_PAD) + BRICK_PAD) / 2;
const BALL_SPEED = 380;
const PADDLE_SPEED = 600;

const ROW_COLORS = [
  0xf43f5e,
  0xf97316,
  0xeab308,
  0x22c55e,
  0x06b6d4,
  0x6366f1,
  0xa855f7,
];

const ROW_SCORES = [70, 60, 50, 40, 30, 20, 10];

export class GameScene extends Phaser.Scene {
  private paddle!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private ball!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private bricks!: Phaser.Physics.Arcade.StaticGroup;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private lives: number = 3;
  private ballLaunched: boolean = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private trailParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private combo: number = 0;
  private comboTimer: number = 0;
  private glowIntensity: number = 0.3;
  private chromaticAmount: number = 0;
  private bgGraphics!: Phaser.GameObjects.Graphics;
  private paddleGlow!: Phaser.GameObjects.Ellipse;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.score = 0;
    this.lives = 3;
    this.ballLaunched = false;
    this.combo = 0;
    this.comboTimer = 0;
    this.glowIntensity = 0.3;
    this.chromaticAmount = 0;

    this.setupPipelines();

    this.createBackground();
    this.createPaddle();
    this.createBall();
    this.createBricks();
    this.createHUD();
    this.createEffects();

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.physics.add.collider(
      this.ball,
      this.paddle,
      this.hitPaddle,
      undefined,
      this,
    );
    this.physics.add.collider(
      this.ball,
      this.bricks,
      this.hitBrick,
      undefined,
      this,
    );

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.paddle.x = Phaser.Math.Clamp(pointer.x, PADDLE_W / 2, GAME_W - PADDLE_W / 2);
    });

    this.input.on('pointerdown', () => {
      if (!this.ballLaunched) this.launchBall();
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      if (!this.ballLaunched) this.launchBall();
    });
  }

  private setupPipelines() {
    this.cameras.main.setPostPipeline(['GlowPipeline', 'ChromaticPipeline']);
  }

  private getGlowPipeline(): GlowPipeline | null {
    const pipelines = this.cameras.main.postPipelines as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    const p = pipelines.find(p => p.name === 'GlowPipeline');
    return p ? (p as unknown as GlowPipeline) : null;
  }

  private getChromaticPipeline(): ChromaticPipeline | null {
    const pipelines = this.cameras.main.postPipelines as Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    const p = pipelines.find(p => p.name === 'ChromaticPipeline');
    return p ? (p as unknown as ChromaticPipeline) : null;
  }

  private createBackground() {
    this.bgGraphics = this.add.graphics();
    const g = this.bgGraphics;
    g.fillGradientStyle(0x0a0a2e, 0x0a0a2e, 0x0f0a3a, 0x0a1a3e, 1);
    g.fillRect(0, 0, GAME_W, GAME_H);

    g.lineStyle(1, 0x1e1b4b, 0.15);
    for (let x = 0; x < GAME_W; x += 40) {
      g.lineBetween(x, 0, x, GAME_H);
    }
    for (let y = 0; y < GAME_H; y += 40) {
      g.lineBetween(0, y, GAME_W, y);
    }
  }

  private createPaddle() {
    const g = this.add.graphics();
    g.fillStyle(0x6366f1, 1);
    g.fillRoundedRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H, 6);
    g.fillStyle(0x818cf8, 1);
    g.fillRoundedRect(-PADDLE_W / 2 + 2, -PADDLE_H / 2 + 2, PADDLE_W - 4, PADDLE_H / 2 - 2, 4);

    g.generateTexture('paddle', PADDLE_W, PADDLE_H);
    g.destroy();

    this.paddle = this.physics.add.image(GAME_W / 2, GAME_H - 40, 'paddle');
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);

    this.paddleGlow = this.add.ellipse(this.paddle.x, this.paddle.y + 4, PADDLE_W + 20, 20, 0x6366f1, 0.12);
    this.tweens.add({
      targets: this.paddleGlow,
      alpha: { from: 0.12, to: 0.22 },
      scaleX: { from: 1, to: 1.05 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
    });
  }

  private createBall() {
    const size = BALL_R * 2 + 8;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(size / 2, size / 2, BALL_R);
    g.fillStyle(0xc7d2fe, 0.6);
    g.fillCircle(size / 2 - 2, size / 2 - 2, BALL_R * 0.5);

    g.generateTexture('ball', size, size);
    g.destroy();

    this.ball = this.physics.add.image(GAME_W / 2, GAME_H - 40 - PADDLE_H / 2 - size / 2, 'ball');
    this.ball.setCollideWorldBounds(false);
    this.ball.setBounce(1, 1);
    this.ball.setData('onPaddle', true);
  }

  private createBricks() {
    this.bricks = this.physics.add.staticGroup();

    for (let row = 0; row < BRICK_ROWS; row++) {
      const color = ROW_COLORS[row % ROW_COLORS.length];
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = BRICK_OFFSET_LEFT + col * (BRICK_W + BRICK_PAD) + BRICK_W / 2;
        const y = BRICK_OFFSET_TOP + row * (BRICK_H + BRICK_PAD) + BRICK_H / 2;

        const g = this.add.graphics();
        g.fillStyle(color, 1);
        g.fillRoundedRect(0, 0, BRICK_W, BRICK_H, 3);

        const lighter = Phaser.Display.Color.IntegerToColor(color).brighten(30).color;
        g.fillStyle(lighter, 0.4);
        g.fillRoundedRect(2, 2, BRICK_W - 4, BRICK_H / 2 - 2, 2);

        const key = `brick_${row}_${col}`;
        g.generateTexture(key, BRICK_W, BRICK_H);
        g.destroy();

        const brick = this.bricks.create(x, y, key);
        brick.setData('row', row);
        brick.setData('col', col);
        brick.setData('color', color);
        brick.setData('score', ROW_SCORES[row % ROW_SCORES.length]);
      }
    }
  }

  private createHUD() {
    this.scoreText = this.add.text(16, 12, 'SCORE: 0', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e0e7ff',
    });

    this.livesText = this.add.text(GAME_W - 16, 12, '', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f43f5e',
    });
    this.livesText.setOrigin(1, 0);
    this.updateLivesText();

    this.comboText = this.add.text(GAME_W / 2, 30, '', {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#eab308',
    });
    this.comboText.setOrigin(0.5);

    const divider = this.add.graphics();
    divider.lineStyle(1, 0x6366f1, 0.3);
    divider.lineBetween(0, 42, GAME_W, 42);
  }

  private updateLivesText() {
    const hearts = this.lives > 0 ? Array(this.lives).fill('\u2665').join(' ') : '';
    this.livesText.setText(hearts);
  }

  private createEffects() {
    this.trailParticles = this.add.particles(0, 0, undefined, {
      speed: { min: 5, max: 20 },
      scale: { start: 0.03, end: 0 },
      lifespan: 300,
      alpha: { start: 0.5, end: 0 },
      blendMode: 'ADD',
      tint: [0x6366f1, 0x818cf8, 0xa5b4fc, 0x06b6d4],
      emitting: false,
      quantity: 1,
    });
  }

  private spawnBrickParticles(brick: Phaser.Types.Physics.Arcade.ImageWithStaticBody) {
    const color = brick.getData('color') as number;
    const x = brick.x;
    const y = brick.y;

    const emitter = this.add.particles(x, y, undefined, {
      speed: { min: 80, max: 250 },
      scale: { start: 0.04, end: 0 },
      lifespan: 600,
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      tint: [color, Phaser.Display.Color.IntegerToColor(color).brighten(40).color],
      quantity: 16,
      emitting: false,
    });
    emitter.explode(16);
    this.time.delayedCall(700, () => emitter.destroy());
  }

  private showComboPopup(x: number, y: number, points: number) {
    const popup = this.add.text(x, y, `+${points}`, {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      duration: 700,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  private launchBall() {
    if (this.ballLaunched) return;
    this.ballLaunched = true;
    this.ball.setData('onPaddle', false);

    const angle = Phaser.Math.FloatBetween(-0.4, 0.4);
    const vx = Math.sin(angle) * BALL_SPEED;
    const vy = -Math.cos(angle) * BALL_SPEED;
    this.ball.setVelocity(vx, vy);

    this.trailParticles.start();
  }

  private hitPaddle(
    ballObj: Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
    paddleObj: Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
  ) {
    const diff = ballObj.x - paddleObj.x;
    const norm = diff / (PADDLE_W / 2);
    const angle = norm * (Math.PI / 3);
    ballObj.setVelocity(Math.sin(angle) * BALL_SPEED, -Math.cos(angle) * BALL_SPEED);

    this.combo = 0;
    this.comboText.setText('');
  }

  private hitBrick(
    ballObj: Phaser.Types.Physics.Arcade.ImageWithDynamicBody,
    brickObj: Phaser.Types.Physics.Arcade.ImageWithStaticBody,
  ) {
    const basePoints = brickObj.getData('score') as number;
    this.combo++;
    const multiplier = Math.min(this.combo, 10);
    const points = basePoints * multiplier;
    this.score += points;
    this.scoreText.setText(`SCORE: ${this.score}`);

    if (this.combo > 1) {
      this.comboText.setText(`COMBO x${multiplier}!`);
      this.comboTimer = 2000;
    }

    this.showComboPopup(brickObj.x, brickObj.y, points);
    this.spawnBrickParticles(brickObj);

    brickObj.destroy();

    this.glowIntensity = Math.min(1.5, 0.3 + this.combo * 0.12);
    this.chromaticAmount = Math.min(2.0, this.combo * 0.15);
    this.cameras.main.shake(60, 0.003 + this.combo * 0.001);

    if (this.bricks.countActive() === 0) {
      this.winLevel();
    }
  }

  private loseLife() {
    this.lives--;
    this.updateLivesText();

    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(200, 244, 63, 94, false);

    this.chromaticAmount = 3.0;

    if (this.lives <= 0) {
      this.trailParticles.stop();
      this.ball.setVelocity(0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', { score: this.score });
      });
      return;
    }

    this.resetBall();
  }

  private resetBall() {
    this.ballLaunched = false;
    this.ball.setData('onPaddle', true);
    this.ball.setVelocity(0, 0);
    this.ball.setPosition(this.paddle.x, GAME_H - 40 - PADDLE_H / 2 - (BALL_R * 2 + 8) / 2);
    this.trailParticles.stop();
    this.combo = 0;
    this.comboText.setText('');
  }

  private winLevel() {
    this.trailParticles.stop();
    this.cameras.main.flash(300, 99, 102, 241, false);
    this.glowIntensity = 2.0;

    this.time.delayedCall(800, () => {
      this.scene.start('GameOverScene', { score: this.score, won: true });
    });
  }

  update(_time: number, delta: number) {
    if (this.ballLaunched && this.ball.y > GAME_H + 20) {
      this.loseLife();
      return;
    }

    if (!this.ballLaunched && this.ball.getData('onPaddle')) {
      this.ball.x = this.paddle.x;
      this.ball.y = GAME_H - 40 - PADDLE_H / 2 - (BALL_R * 2 + 8) / 2;
    }

    if (this.cursors.left.isDown) {
      this.paddle.setVelocityX(-PADDLE_SPEED);
    } else if (this.cursors.right.isDown) {
      this.paddle.setVelocityX(PADDLE_SPEED);
    } else {
      this.paddle.setVelocityX(0);
    }

    if (this.ballLaunched) {
      const halfBall = (BALL_R * 2 + 8) / 2;
      if (this.ball.x - halfBall <= 0) {
        this.ball.x = halfBall;
        this.ball.setVelocity(Math.abs(this.ball.body.velocity.x), this.ball.body.velocity.y);
      } else if (this.ball.x + halfBall >= GAME_W) {
        this.ball.x = GAME_W - halfBall;
        this.ball.setVelocity(-Math.abs(this.ball.body.velocity.x), this.ball.body.velocity.y);
      }
      if (this.ball.y - halfBall <= 0) {
        this.ball.y = halfBall;
        this.ball.setVelocity(this.ball.body.velocity.x, Math.abs(this.ball.body.velocity.y));
      }

      const vel = (this.ball.body as Phaser.Physics.Arcade.Body).velocity;
      const speed = vel.length();
      if (speed > 0 && Math.abs(speed - BALL_SPEED) > 20) {
        const normalized = vel.normalize();
        this.ball.setVelocity(normalized.x * BALL_SPEED, normalized.y * BALL_SPEED);
      }

      this.trailParticles.setPosition(this.ball.x, this.ball.y);
    }

    if (this.paddleGlow) {
      this.paddleGlow.x = this.paddle.x;
      this.paddleGlow.y = this.paddle.y + 4;
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboText.setText('');
      }
    }

    this.glowIntensity = Phaser.Math.Linear(this.glowIntensity, 0.3, 0.02);
    this.chromaticAmount = Phaser.Math.Linear(this.chromaticAmount, 0, 0.03);

    const glowP = this.getGlowPipeline();
    if (glowP) {
      glowP.intensity = this.glowIntensity;
    }

    const chromaP = this.getChromaticPipeline();
    if (chromaP) {
      chromaP.amount = this.chromaticAmount;
    }
  }
}
