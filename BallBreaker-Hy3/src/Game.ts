import * as THREE from 'three';
import { brickShader } from './shaders';

export interface GameInput {
  useMouse: boolean;
  targetX: number;
  left: boolean;
  right: boolean;
  launch: boolean;
}

export interface GameCallbacks {
  onScore: (score: number) => void;
  onLives: (lives: number) => void;
  onLevel: (level: number) => void;
  onLifeLost?: () => void;
  onLevelCleared?: () => void;
  onGameOver: () => void;
}

const FIELD = { halfWidth: 11, top: 14, bottom: -14 };
const PADDLE = { width: 3.2, height: 0.6, depth: 1.4, y: -12, speed: 20 };
const BALL = { radius: 0.38, baseSpeed: 15 };
const BRICK = {
  rows: 6,
  cols: 11,
  width: 1.7,
  height: 0.85,
  depth: 1.4,
  gapX: 0.18,
  gapY: 0.22,
  topY: 10.5,
};

const ROW_COLORS = [
  new THREE.Color('#ff2e63'),
  new THREE.Color('#ff7b00'),
  new THREE.Color('#ffd60a'),
  new THREE.Color('#2ec4b6'),
  new THREE.Color('#4cc9f0'),
  new THREE.Color('#b15bff'),
];

interface Brick {
  mesh: THREE.Mesh;
  alive: boolean;
  points: number;
  material: THREE.ShaderMaterial;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

export class Game {
  readonly scene: THREE.Scene;
  private readonly cb: GameCallbacks;

  paddle!: THREE.Mesh;
  ball!: THREE.Mesh;
  bricks: Brick[] = [];
  brickMaterials: THREE.ShaderMaterial[] = [];
  private particles: Particle[] = [];
  private particleGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);

  score = 0;
  lives = 3;
  level = 1;
  ballStuck = true;
  velocity = new THREE.Vector3();

  constructor(scene: THREE.Scene, cb: GameCallbacks) {
    this.scene = scene;
    this.cb = cb;
    this.initMaterials();
    this.buildWalls();
    this.buildPaddle();
    this.buildBall();
    this.buildBricks();
    this.resetBallOnPaddle();
  }

  private get speed() {
    return BALL.baseSpeed + (this.level - 1) * 2.5;
  }

  private initMaterials() {
    for (const c of ROW_COLORS) {
      this.brickMaterials.push(
        new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: c.clone() },
            uTime: { value: 0 },
          },
          vertexShader: brickShader.vertex,
          fragmentShader: brickShader.fragment,
        })
      );
    }
  }

  private buildWalls() {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.15, 0.55, 1.0) });
    const make = (w: number, h: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), mat);
      m.position.set(x, y, 0);
      this.scene.add(m);
    };
    make(0.5, FIELD.top - FIELD.bottom + 1, -FIELD.halfWidth - 0.25, (FIELD.top + FIELD.bottom) / 2);
    make(0.5, FIELD.top - FIELD.bottom + 1, FIELD.halfWidth + 0.25, (FIELD.top + FIELD.bottom) / 2);
    make(FIELD.halfWidth * 2 + 1, 0.5, 0, FIELD.top + 0.25);
  }

  private buildPaddle() {
    const geo = new THREE.BoxGeometry(PADDLE.width, PADDLE.height, PADDLE.depth);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a0a18,
      emissive: new THREE.Color(0.2, 0.8, 1.0),
      emissiveIntensity: 1.4,
      metalness: 0.5,
      roughness: 0.25,
    });
    this.paddle = new THREE.Mesh(geo, mat);
    this.paddle.position.set(0, PADDLE.y, 0);
    this.scene.add(this.paddle);
  }

  private buildBall() {
    const geo = new THREE.SphereGeometry(BALL.radius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: new THREE.Color(1.0, 0.85, 0.4),
      emissiveIntensity: 2.2,
      metalness: 0.1,
      roughness: 0.2,
    });
    this.ball = new THREE.Mesh(geo, mat);
    this.scene.add(this.ball);
  }

  private buildBricks() {
    const geo = new THREE.BoxGeometry(BRICK.width, BRICK.height, BRICK.depth);
    const startX = -((BRICK.cols - 1) * (BRICK.width + BRICK.gapX)) / 2;

    for (let r = 0; r < BRICK.rows; r++) {
      for (let c = 0; c < BRICK.cols; c++) {
        const mat = this.brickMaterials[r % this.brickMaterials.length];
        const mesh = new THREE.Mesh(geo, mat);
        const x = startX + c * (BRICK.width + BRICK.gapX);
        const y = BRICK.topY - r * (BRICK.height + BRICK.gapY);
        mesh.position.set(x, y, 0);
        this.scene.add(mesh);
        this.bricks.push({
          mesh,
          alive: true,
          points: (BRICK.rows - r) * 10,
          material: mat,
        });
      }
    }
  }

  private resetBallOnPaddle() {
    this.ballStuck = true;
    this.velocity.set(0, 0, 0);
    this.ball.position.set(this.paddle.position.x, PADDLE.y + PADDLE.height / 2 + BALL.radius, 0);
  }

  private launchBall() {
    const a = (Math.random() * 0.4 - 0.2) - 0.05; // slight bias upward
    const s = this.speed;
    this.velocity.set(Math.sin(a) * s, Math.cos(a) * s, 0);
    this.ballStuck = false;
  }

  /** Full restart from game over. */
  reset() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    for (const b of this.bricks) {
      b.alive = true;
      b.mesh.visible = true;
    }
    this.clearParticles();
    this.resetBallOnPaddle();
    this.cb.onScore(this.score);
    this.cb.onLives(this.lives);
    this.cb.onLevel(this.level);
  }

  private clearBricks() {
    for (const b of this.bricks) {
      b.alive = false;
      b.mesh.visible = false;
    }
  }

  private nextLevel() {
    this.level++;
    this.clearBricks();
    this.buildBricks();
    this.resetBallOnPaddle();
    this.cb.onLevel(this.level);
  }

  private loseLife() {
    this.lives--;
    this.cb.onLives(this.lives);
    this.clearParticles();
    if (this.lives <= 0) {
      this.cb.onGameOver();
    } else {
      this.resetBallOnPaddle();
      this.cb.onLifeLost?.();
    }
  }

  private addScore(p: number) {
    this.score += p;
    this.cb.onScore(this.score);
  }

  private spawnParticles(pos: THREE.Vector3, color: THREE.Color) {
    for (let i = 0; i < 14; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: color.clone() });
      const m = new THREE.Mesh(this.particleGeo, mat);
      m.position.copy(pos);
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 11,
        Math.random() * 11 + 2,
        (Math.random() - 0.5) * 5
      );
      this.scene.add(m);
      this.particles.push({ mesh: m, vel: v, life: 0.8, maxLife: 0.8 });
    }
  }

  private clearParticles() {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles = [];
  }

  update(dt: number, input: GameInput) {
    // ---- paddle movement ----
    const limit = FIELD.halfWidth - PADDLE.width / 2;
    if (input.useMouse) {
      const tx = clamp(input.targetX, -limit, limit);
      this.paddle.position.x += (tx - this.paddle.position.x) * Math.min(1, dt * 18);
    } else {
      let dir = 0;
      if (input.left) dir -= 1;
      if (input.right) dir += 1;
      this.paddle.position.x = clamp(
        this.paddle.position.x + dir * PADDLE.speed * dt,
        -limit,
        limit
      );
    }

    // ---- ball ----
    if (this.ballStuck) {
      this.ball.position.set(
        this.paddle.position.x,
        PADDLE.y + PADDLE.height / 2 + BALL.radius,
        0
      );
      if (input.launch) this.launchBall();
    } else {
      this.moveBall(dt);
    }

    this.updateParticles(dt);

    // ---- level cleared? ----
    if (this.bricks.every((b) => !b.alive)) {
      this.cb.onLevelCleared?.();
      this.nextLevel();
    }
  }

  private moveBall(dt: number) {
    const pos = this.ball.position;
    const r = BALL.radius;

    // keep constant speed
    if (this.velocity.lengthSq() > 0) this.velocity.setLength(this.speed);

    pos.x += this.velocity.x * dt;
    pos.y += this.velocity.y * dt;

    // side + top walls
    if (pos.x - r < -FIELD.halfWidth) {
      pos.x = -FIELD.halfWidth + r;
      this.velocity.x = Math.abs(this.velocity.x);
    }
    if (pos.x + r > FIELD.halfWidth) {
      pos.x = FIELD.halfWidth - r;
      this.velocity.x = -Math.abs(this.velocity.x);
    }
    if (pos.y + r > FIELD.top) {
      pos.y = FIELD.top - r;
      this.velocity.y = -Math.abs(this.velocity.y);
    }

    this.collidePaddle();
    this.collideBricks();

    if (pos.y - r < FIELD.bottom) this.loseLife();
  }

  private collidePaddle() {
    const r = BALL.radius;
    const pos = this.ball.position;
    const hw = PADDLE.width / 2;
    const hh = PADDLE.height / 2;
    const dx = pos.x - this.paddle.position.x;
    const dy = pos.y - PADDLE.y;
    const cx = clamp(dx, -hw, hw);
    const cy = clamp(dy, -hh, hh);
    const nx = dx - cx;
    const ny = dy - cy;

    if (nx * nx + ny * ny < r * r && this.velocity.y < 0) {
      const offset = clamp(dx / hw, -1, 1);
      const angle = offset * (Math.PI / 3);
      const s = this.speed;
      this.velocity.set(Math.sin(angle) * s, Math.abs(Math.cos(angle)) * s, 0);
      pos.y = PADDLE.y + hh + r + 0.001;
    }
  }

  private collideBricks() {
    const r = BALL.radius;
    const pos = this.ball.position;

    for (const b of this.bricks) {
      if (!b.alive) continue;
      const bc = b.mesh.position;
      const hw = BRICK.width / 2;
      const hh = BRICK.height / 2;
      const dx = pos.x - bc.x;
      const dy = pos.y - bc.y;
      const cx = clamp(dx, -hw, hw);
      const cy = clamp(dy, -hh, hh);
      const nx = dx - cx;
      const ny = dy - cy;

      if (nx * nx + ny * ny < r * r) {
        // resolve normal
        const normal = new THREE.Vector3(nx, ny, 0);
        if (normal.lengthSq() < 1e-6) {
          const penX = hw - Math.abs(dx);
          const penY = hh - Math.abs(dy);
          if (penX < penY) normal.set(Math.sign(dx) || 1, 0, 0);
          else normal.set(0, Math.sign(dy) || 1, 0);
        }
        normal.normalize();

        const dist = Math.sqrt(nx * nx + ny * ny);
        const overlap = r - dist;
        pos.addScaledVector(normal, overlap);

        const vdot = this.velocity.dot(normal);
        this.velocity.addScaledVector(normal, -2 * vdot);

        b.alive = false;
        b.mesh.visible = false;
        this.addScore(b.points);
        this.spawnParticles(bc, b.material.uniforms.uColor.value as THREE.Color);
        break; // one brick per frame keeps it stable
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }
      p.vel.y -= 20 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.setScalar(Math.max(0.001, p.life / p.maxLife));
      p.mesh.rotation.x += dt * 6;
      p.mesh.rotation.y += dt * 6;
    }
  }
}
