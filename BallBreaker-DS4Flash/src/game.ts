import * as THREE from "three";
import { Input } from "./input";
import { SoundFX } from "./audio";
import { PostFX } from "./postfx";
import { UI } from "./ui";
import { Particles, createBrick, makeBallMesh, makeCapsule, makePaddleMesh, type BrickVisual, type PowerKind } from "./entities";
import { buildLevel, brickColor, brickScore } from "./levels";
import { makeFloorMaterial, makeSkyMaterial, makeShadowMaterial } from "./shaders";

const WALLX = 7.0;
const WALLZ = 4.55;
const BALL_R = 0.16;
const PADDLE_Z = -3.55;
const PADDLE_BASE_HALFW = 1.15;
const PADDLE_SPEED = 15;
const MAX_ANGLE = 1.19;
const BRICK_LEFT = -6.4;
const BRICK_DEPTH_START = 0.7;

const POWER_TYPES = ["expand", "multi", "life", "slow"] as const;
type PowerName = PowerKind;
const POWER_COLORS: Record<PowerName, number> = {
  expand: 0x29f6ff,
  multi: 0xff4de1,
  life: 0x6cff8a,
  slow: 0xffd23e,
};

interface Ball {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  pos: THREE.Vector3;
  vel: THREE.Vector2;
  speed: number;
  attached: boolean;
  trail: { mesh: THREE.Mesh; life: number }[];
  trailT: number;
}

interface Capsule {
  group: THREE.Group;
  mat: THREE.ShaderMaterial;
  type: PowerName;
  x: number;
  z: number;
  spin: number;
}

type Mode = "start" | "play" | "busy" | "over";

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private postfx: PostFX;
  private input: Input;
  private sound = new SoundFX();
  private ui: UI;
  private particles: Particles;

  private floorMat!: THREE.ShaderMaterial;
  private skyMat!: THREE.ShaderMaterial;
  private ballLight: THREE.PointLight;

  private paddle: ReturnType<typeof makePaddleMesh>;
  private paddleX = 0;
  private halfW = PADDLE_BASE_HALFW;
  private paddlePulse = 0;

  private balls: Ball[] = [];
  private bricks: BrickVisual[] = [];
  private capsules: Capsule[] = [];

  private mode: Mode = "start";
  private ballAttached = true;

  private level = 1;
  private lives = 3;
  private score = 0;
  private best = 0;
  private combo = 0;
  private multiplier = 1;

  private expandTime = 0;
  private slowTime = 0;
  private busyTime = 0;
  private levelPending = 1;
  private shakeT = 0;

  private clock = new THREE.Clock();
  private elapsed = 0;
  private raf = 0;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.toneMapping = THREE.NoToneMapping;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    this.camera.position.set(0, 7.4, 5.6);

    this.input = new Input(canvas);
    this.input.setCamera(this.camera);
    this.ui = new UI();
    this.postfx = new PostFX(1, 1);

    this.scene.background = new THREE.Color(0x03040b);
    this.scene.fog = new THREE.FogExp2(0x05040f, 0.028);

    const hemi = new THREE.HemisphereLight(0x5268ff, 0x0a0a16, 0.9);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xbfe8ff, 0.8);
    dir.position.set(-6, 12, 6);
    this.scene.add(dir);
    this.ballLight = new THREE.PointLight(0x66e0ff, 20, 26, 2);
    this.ballLight.position.set(0, 2, 0);
    this.scene.add(this.ballLight);

    this.buildTable();
    this.particles = new Particles(420, this.scene);

    this.paddle = makePaddleMesh();
    this.paddle.mesh.position.set(0, 0.25, PADDLE_Z);
    this.scene.add(this.paddle.mesh);

    if (typeof localStorage !== "undefined") {
      this.best = Number(localStorage.getItem("bb-best") || 0);
    }

    this.input.onAction = () => this.attemptAction();
    this.input.onPointer = (x) => {
      this.pointerSeen = true;
      this.pointerTarget = x;
      this.keyDriven = false;
    };
    this.ui.onStart = () => this.attemptAction();
    this.ui.onRestart = () => this.attemptAction();
    this.ui.onToggleSound = () => {
      this.sound.ensure();
      this.ui.setSoundMuted(this.sound.toggle());
    };
    this.ui.setProjector((v) => {
      const p = new THREE.Vector3(v.x, v.y, v.z).project(this.camera);
      return {
        x: (p.x * 0.5 + 0.5) * this.canvas.clientWidth,
        y: (-p.y * 0.5 + 0.5) * this.canvas.clientHeight,
      };
    });

    window.addEventListener("resize", this.onResize);
    window.addEventListener("blur", () => this.input.left = this.input.right = false);
    this.ui.showMenu();
    this.onResize();
  }

  private pointerSeen = false;
  private pointerTarget = 0;
  private keyDriven = false;

  private buildTable() {
    const FLOOR_MARGIN = 2.1;
    const floorGeo = new THREE.PlaneGeometry(
      2 * (WALLX + FLOOR_MARGIN),
      2 * (WALLZ + FLOOR_MARGIN),
      1,
      1
    );
    floorGeo.rotateX(-Math.PI / 2);
    this.floorMat = makeFloorMaterial();
    this.floorMat.uniforms.uArena.value.set(-WALLX - 0.7, WALLX + 0.7, -WALLZ - 0.7, WALLZ + 0.7);
    const ground = new THREE.Mesh(floorGeo, this.floorMat);
    ground.position.y = 0;
    this.scene.add(ground);

    const skyGeo = new THREE.SphereGeometry(80, 24, 16);
    this.skyMat = makeSkyMaterial();
    const sky = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(sky);

    const frameMat = new THREE.MeshBasicMaterial({
      color: 0x29f6ff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const frameMat2 = frameMat.clone();
    frameMat2.color = new THREE.Color(0xff4de1);

    const barGeo = new THREE.BoxGeometry(0.1, 0.5, 2 * WALLZ);
    const leftBar = new THREE.Mesh(barGeo, frameMat);
    leftBar.position.set(-WALLX, 0.25, 0);
    const rightBar = new THREE.Mesh(barGeo, frameMat2);
    rightBar.position.set(WALLX, 0.25, 0);
    const barGeo2 = new THREE.BoxGeometry(2 * WALLX, 0.5, 0.1);
    const farBar = new THREE.Mesh(barGeo2, frameMat);
    farBar.position.set(0, 0.25, WALLZ);
    const nearBar = new THREE.Mesh(barGeo2, frameMat2);
    nearBar.position.set(0, 0.25, -WALLZ);
    this.scene.add(leftBar, rightBar, farBar, nearBar);

    const shadowMat = makeShadowMaterial();
    const topStrip = new THREE.Mesh(new THREE.PlaneGeometry(2 * WALLX, 2 * WALLZ), shadowMat);
    topStrip.rotation.x = -Math.PI / 2;
    topStrip.position.y = 0.006;
    topStrip.scale.y = 1;
    this.scene.add(topStrip);
  }

  private createBall(): Ball {
    const { mesh, material } = makeBallMesh();
    mesh.scale.setScalar(BALL_R);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), makeShadowMaterial());
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.setScalar(BALL_R * 4.2);
    shadow.position.y = -BALL_R;
    shadow.material = (shadow.material as THREE.ShaderMaterial).clone();
    (shadow.material as THREE.ShaderMaterial).uniforms.uStrength.value = 0.5;
    mesh.add(shadow);
    this.scene.add(mesh);
    const pos = new THREE.Vector3(this.paddleX, BALL_R, PADDLE_Z + 0.55);
    return {
      mesh,
      material,
      pos,
      vel: new THREE.Vector2(0, 1),
      speed: this.baseSpeed(),
      attached: true,
      trail: [],
      trailT: 0,
    };
  }

  private baseSpeed() {
    return Math.min(9.4, 6.2 + 0.4 * (this.level - 1));
  }

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.fitCamera(w, h);
    this.postfx.resize(Math.max(2, Math.round(w * this.renderer.getPixelRatio())), Math.max(2, Math.round(h * this.renderer.getPixelRatio())));
  };

  private fitCamera(w: number, h: number) {
    const aspect = w / h;
    this.camera.aspect = aspect;
    const corners: [number, number][] = [
      [-WALLX, 0, -WALLZ],
      [WALLX, 0, -WALLZ],
      [-WALLX, 0, WALLZ],
      [WALLX, 0, WALLZ],
    ].map((c) => [c[0], c[2]] as [number, number]);
    const v = new THREE.Vector3();
    let fov = 42;
    const fill = 1.08;
    for (let it = 0; it < 5; it++) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
      let m = 0;
      for (const [x, z] of corners) {
        v.set(x, 0, z).project(this.camera);
        m = Math.max(m, Math.abs(v.x), Math.abs(v.y));
      }
      if (Math.abs(m - fill) < 0.002) break;
      const target = Math.atan(Math.tan((fov * Math.PI) / 360) * (m / fill));
      fov = Math.min(175, Math.max(25, (target * 360) / Math.PI));
    }
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  private attemptAction() {
    this.sound.ensure();
    if (this.mode === "start") {
      this.ui.hideMenu();
      this.begin();
    } else if (this.mode === "play" && this.ballAttached) {
      this.launch();
    } else if (this.mode === "over") {
      this.begin();
    }
  }

  private begin() {
    this.mode = "play";
    this.score = 0;
    this.lives = 3;
    this.combo = 0;
    this.multiplier = 1;
    this.level = 1;
    this.resetPower();
    this.clearDynamic();
    this.ui.setCombo(0);
    this.ui.startMatch();
    this.ui.setScore(0);
    this.ui.setLives(3);
    this.startLevel(1);
  }

  private startLevel(level: number) {
    this.level = level;
    this.clearDynamic();
    const spec = buildLevel(level);
    const brickW = 1.45;
    const brickD = 0.3;
    const startX = BRICK_LEFT + brickW / 2;
    const spacingX = (2 * Math.abs(BRICK_LEFT) - brickW) / (spec.cols - 1);
    for (let r = 0; r < spec.rows; r++) {
      for (let c = 0; c < spec.cols; c++) {
        const hp = spec.hp[r][c];
        if (hp <= 0) continue;
        const x = startX + c * spacingX;
        const z = BRICK_DEPTH_START + r * 0.56;
        const color = brickColor(hp, r, spec.rows);
        const b = createBrick(brickW, brickD, 0.42, color);
        b.x = x;
        b.z = z;
        b.row = r;
        b.hp = hp;
        b.maxHp = hp;
        b.mesh.position.set(x, 0.21, z);
        b.power = this.rollPower();
        this.scene.add(b.mesh);
        this.bricks.push(b);
      }
    }
    const aliveCount = this.bricks.length;
    if (aliveCount < 3) {
      // generated layout was (pathologically) sparse: guarantee a playable wall
      for (let c = 0; c < 6; c++) {
        const x = BRICK_LEFT + (2 * Math.abs(BRICK_LEFT) / 6) * c + 0.6;
        const color = brickColor(2, 0, spec.rows);
        const b = createBrick(brickW, brickD, 0.42, color);
        b.x = x;
        b.z = BRICK_DEPTH_START + (c % 2) * 0.56;
        b.row = c % 2;
        b.hp = 2;
        b.maxHp = 2;
        b.mesh.position.set(x, 0.21, b.z);
        b.power = null;
        this.scene.add(b.mesh);
        this.bricks.push(b);
      }
    }
    const ball = this.createBall();
    this.balls.push(ball);
    this.ballAttached = true;
    this.ui.setLevel(level);
    this.ui.showBanner(`LEVEL ${level}`, "BRACE YOURSELF");
  }

  private rollPower(): PowerName | null {
    if (Math.random() > 0.16) return null;
    const r = Math.random();
    if (r < 0.34) return "expand";
    if (r < 0.6) return "multi";
    if (r < 0.78) return "slow";
    return "life";
  }

  private clearDynamic() {
    for (const b of this.bricks) this.scene.remove(b.mesh);
    this.bricks = [];
    for (const cap of this.capsules) this.scene.remove(cap.group);
    this.capsules = [];
    for (const ball of this.balls) {
      this.scene.remove(ball.mesh);
      for (const t of ball.trail) this.scene.remove(t.mesh);
    }
    this.balls = [];
  }

  private resetPower() {
    this.expandTime = 0;
    this.slowTime = 0;
    this.halfW = PADDLE_BASE_HALFW;
    this.paddle.material.uniforms.uHalfW.value = this.halfW;
  }

  private launch() {
    const ball = this.balls[0];
    if (!ball || !ball.attached) return;
    ball.attached = false;
    const bias = this.pointerSeen ? THREE.MathUtils.clamp((this.pointerTarget - this.paddleX) / 4, -0.6, 0.6) : 0;
    const ang = bias;
    ball.vel.set(Math.sin(ang) * 0.3, Math.cos(ang));
    ball.vel.normalize().multiplyScalar(ball.speed);
    this.sound.launch();
  }

  private removeBall(ball: Ball) {
    this.scene.remove(ball.mesh);
    for (const t of ball.trail) this.scene.remove(t.mesh);
    const i = this.balls.indexOf(ball);
    if (i >= 0) this.balls.splice(i, 1);
  }

  private gameOver() {
    this.mode = "over";
    this.sound.gameOver();
    if (this.score > this.best) {
      this.best = Math.floor(this.score);
      try {
        localStorage.setItem("bb-best", String(this.best));
      } catch {
        /* ignore */
      }
    }
    this.ui.showGameOver(this.score, this.level, this.best);
  }

  private doMoveBall(ball: Ball, dt: number) {
    if (ball.attached) {
      ball.pos.x = this.paddleX;
      ball.mesh.position.copy(ball.pos);
      return;
    }

    ball.pos.x += ball.vel.x * dt;
    ball.pos.z += ball.vel.y * dt;

    if (ball.pos.x < -WALLX + BALL_R) {
      ball.pos.x = -WALLX + BALL_R;
      ball.vel.x *= -1;
      this.onWallHit(ball);
    } else if (ball.pos.x > WALLX - BALL_R) {
      ball.pos.x = WALLX - BALL_R;
      ball.vel.x *= -1;
      this.onWallHit(ball);
    }
    if (ball.pos.z > WALLZ - BALL_R) {
      ball.pos.z = WALLZ - BALL_R;
      ball.vel.y *= -1;
      this.combo = 0;
      this.ui.setCombo(0);
      this.sound.wall();
      this.particles.burst(new THREE.Vector3(ball.pos.x, 0.3, WALLZ - 0.1), 0x29f6ff, 10, 3.5);
    }

    if (ball.pos.z < -(WALLZ + 0.3)) {
      this.removeBall(ball);
      return;
    }

    if (
      ball.vel.y < 0 &&
      ball.pos.z <= PADDLE_Z + 0.34 &&
      ball.pos.z >= PADDLE_Z - 0.55 &&
      Math.abs(ball.pos.x - this.paddleX) <= this.halfW + BALL_R * 0.6
    ) {
      const hit = THREE.MathUtils.clamp((ball.pos.x - this.paddleX) / this.halfW, -1, 1);
      const ang = hit * MAX_ANGLE;
      ball.vel.set(Math.sin(ang), Math.cos(ang)).normalize();
      ball.speed = Math.min(this.baseSpeed() + 1.6, ball.speed + 0.14);
      ball.vel.multiplyScalar(ball.speed);
      ball.pos.z = PADDLE_Z + 0.34 + BALL_R;
      this.sound.paddle();
      this.paddlePulse = 1;
      this.combo = 0;
      this.ui.setCombo(0);
      this.particles.burst(new THREE.Vector3(ball.pos.x, 0.3, PADDLE_Z), 0x29f6ff, 8, 3);
    }

    for (const b of this.bricks) {
      if (!b.alive) continue;
      const minX = b.x - b.hw;
      const maxX = b.x + b.hw;
      const minZ = b.z - b.hd;
      const maxZ = b.z + b.hd;
      const cx = THREE.MathUtils.clamp(ball.pos.x, minX, maxX);
      const cz = THREE.MathUtils.clamp(ball.pos.z, minZ, maxZ);
      const dx = ball.pos.x - cx;
      const dz = ball.pos.z - cz;
      if (dx * dx + dz * dz > BALL_R * BALL_R) continue;

      if (Math.abs(dx) > Math.abs(dz)) {
        ball.vel.x *= -1;
      } else {
        ball.vel.y *= -1;
      }
      this.hitBrick(b, new THREE.Vector3(ball.pos.x, 0.2, ball.pos.z));
      if (!b.alive) break;
    }

    ball.mesh.position.copy(ball.pos);
  }

  private onWallHit(ball: Ball) {
    this.combo = 0;
    this.ui.setCombo(0);
    this.sound.wall();
    this.shakeT = Math.max(this.shakeT, 0.12);
    this.particles.burst(new THREE.Vector3(ball.pos.x, 0.3, ball.pos.z), 0x29f6ff, 6, 2.6);
  }

  private hitBrick(b: BrickVisual, at: THREE.Vector3) {
    b.flash = 1;
    if (b.hp > 1) {
      b.hp -= 1;
      this.sound.steel();
      this.particles.burst(at, b.visualColor.getHex(), 10, 3.2);
      return;
    }
    b.alive = false;
    this.scene.remove(b.mesh);
    this.combo += 1;
    this.multiplier = Math.min(8, 1 + Math.floor(this.combo / 4));
    const base = brickScore(b.maxHp, b.row, 6);
    const gained = base * this.multiplier;
    this.score += gained;
    this.ui.setScore(this.score);
    this.sound.brick(base, this.level);
    this.ui.setCombo(this.combo);
    this.particles.burst(at, b.visualColor.getHex(), 26, 5.4);
    this.ui.floatScore(
      { x: b.x, y: 0.9, z: b.z },
      `+${gained}`,
      this.multiplier > 1 ? (this.multiplier > 3 ? "pink big" : "cyan big") : ""
    );
    if (b.power) this.spawnCapsule(b.x, b.z, b.power);

    if (this.bricks.every((bb) => !bb.alive)) {
      this.onLevelCleared();
    }
  }

  private spawnCapsule(x: number, z: number, type: PowerName) {
    const { mesh: group, material } = makeCapsule();
    const color = POWER_COLORS[type];
    material.uniforms.uColor.value.setHex(color);
    material.uniforms.uColor.value.multiplyScalar(1.4);
    this.scene.add(group);
    this.capsules.push({ group, mat: material, type, x, z, spin: Math.random() * 6.28 });
  }

  private onLevelCleared() {
    if (this.mode !== "play") return;
    this.mode = "busy";
    this.levelPending = this.level + 1;
    this.busyTime = 1.7;
    this.sound.levelClear();
    this.ui.showBanner(`LEVEL ${this.level} CLEAR!`, `+${500 + this.level * 250} BONUS`);
    this.score += 500 + this.level * 250;
    this.ui.setScore(this.score);
    for (const cap of this.capsules) this.scene.remove(cap.group);
    this.capsules = [];
    for (const ball of this.balls) {
      this.scene.remove(ball.mesh);
      for (const t of ball.trail) this.scene.remove(t.mesh);
    }
    this.balls = [];
  }

  private applyPower(type: PowerName, x: number) {
    this.sound.power(POWER_TYPES.indexOf(type));
    if (type === "expand") {
      this.expandTime = 12;
      this.halfW = PADDLE_BASE_HALFW * 1.45;
      this.paddle.material.uniforms.uHalfW.value = this.halfW;
      this.ui.floatScore({ x, y: 1, z: -3 }, "PADDLE +", "cyan");
    } else if (type === "multi") {
      const moving = this.balls.filter((b) => !b.attached);
      if (moving.length >= 4) return;
      const toSpawn = Math.min(2, 4 - moving.length);
      for (let k = 0; k < toSpawn; k++) {
        const src = moving[k % Math.max(1, moving.length)];
        const ball = this.createBall();
        ball.attached = false;
        ball.pos = src.pos.clone();
        const ang = ((k + 1) % 2 === 0 ? 1 : -1) * (0.5 + k * 0.15);
        ball.vel.set(Math.sin(ang), Math.cos(ang)).normalize().multiplyScalar(ball.speed);
        this.balls.push(ball);
      }
      this.ui.floatScore({ x, y: 1, z: -3 }, "MULTI BALL!", "pink");
    } else if (type === "life") {
      if (this.lives < 5) this.lives += 1;
      this.ui.setLives(this.lives);
      this.sound.oneUp();
      this.ui.floatScore({ x, y: 1, z: -3 }, "1 UP", "green");
    } else if (type === "slow") {
      this.slowTime = 8;
      for (const b of this.balls) b.speed = Math.max(4.2, b.speed * 0.62);
      this.ui.floatScore({ x, y: 1, z: -3 }, "SLOWMO", "cyan");
    }
  }

  private updatePaddle(dt: number) {
    let target = this.paddleX;
    if (this.input.left) {
      target = this.paddleX - PADDLE_SPEED * dt;
      this.keyDriven = true;
    } else if (this.input.right) {
      target = this.paddleX + PADDLE_SPEED * dt;
      this.keyDriven = true;
    } else if (this.keyDriven) {
      // keys just released: hold last keyboard position, don't snap to stale pointer
      target = this.paddleX;
    } else if (this.pointerSeen) {
      target = this.pointerTarget;
    }
    const clamp = WALLX - this.halfW;
    target = THREE.MathUtils.clamp(target, -clamp, clamp);
    this.paddleX += (target - this.paddleX) * (1 - Math.exp(-dt * 16));
    this.paddle.mesh.position.x = this.paddleX;

    this.paddlePulse *= Math.exp(-dt * 8);
    this.paddle.material.uniforms.uPulse.value = 0.6 + this.paddlePulse * 1.8;
  }

  private updateCapsules(dt: number) {
    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const cap = this.capsules[i];
      cap.z -= 4.4 * dt;
      cap.spin += dt * 2.2;
      cap.group.rotation.y = cap.spin;
      cap.group.position.set(cap.x, 0.4, cap.z);
      if (cap.z < -(WALLZ + 0.4)) {
        this.scene.remove(cap.group);
        this.capsules.splice(i, 1);
        continue;
      }
      if (
        Math.abs(cap.z - PADDLE_Z) < 0.5 &&
        Math.abs(cap.x - this.paddleX) < this.halfW + 0.2
      ) {
        const at = new THREE.Vector3(cap.x, 0.5, PADDLE_Z);
        this.particles.burst(at, POWER_COLORS[cap.type], 18, 4.5);
        this.scene.remove(cap.group);
        this.capsules.splice(i, 1);
        this.applyPower(cap.type, cap.x);
        continue;
      }
    }
  }

  private spawnTrails(dt: number) {
    for (const ball of this.balls) {
      if (ball.attached) continue;
      ball.trailT -= dt;
      if (ball.trailT > 0) continue;
      ball.trailT = 0.018;
      const g = new THREE.SphereGeometry(BALL_R * 0.85, 12, 10);
      const m = new THREE.MeshBasicMaterial({
        color: 0x2bd6ff,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.copy(ball.pos);
      this.scene.add(mesh);
      ball.trail.push({ mesh, life: 0.32 });
      if (ball.trail.length > 12) {
        const t = ball.trail.shift()!;
        this.scene.remove(t.mesh);
        t.mesh.geometry.dispose();
        (t.mesh.material as THREE.Material).dispose();
      }
    }
    for (const ball of this.balls) {
      for (const t of ball.trail) {
        t.life -= dt;
        (t.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (t.life / 0.32) * 0.45);
      }
      ball.trail = ball.trail.filter((t) => {
        if (t.life <= 0) {
          this.scene.remove(t.mesh);
          t.mesh.geometry.dispose();
          (t.mesh.material as THREE.Material).dispose();
          return false;
        }
        return true;
      });
    }
  }

  private updateBrickFlashes(dt: number) {
    for (const b of this.bricks) {
      if (!b.alive) continue;
      if (b.flash > 0) {
        b.flash -= dt * 6;
        const k = Math.max(0, b.flash);
        b.mat.emissiveIntensity = 0.4 + k * 3.2;
      } else {
        b.mat.emissiveIntensity = 0.4;
      }
    }
  }

  private updateTimers(dt: number) {
    if (this.expandTime > 0) {
      this.expandTime -= dt;
      if (this.expandTime <= 0) {
        this.halfW = PADDLE_BASE_HALFW;
        this.paddle.material.uniforms.uHalfW.value = this.halfW;
      }
    }
    if (this.slowTime > 0) {
      this.slowTime -= dt;
      if (this.slowTime <= 0) {
        for (const b of this.balls) b.speed = this.baseSpeed();
      }
    }
    const powerFrac = Math.max(this.expandTime > 0 ? this.expandTime / 12 : 0, this.slowTime > 0 ? this.slowTime / 8 : 0);
    this.ui.setPowerRatio(powerFrac);
  }

  private updateBossBallCheck() {
    if (this.mode !== "play") return;
    if (this.balls.length > 0) return;
    this.lives -= 1;
    this.ui.setLives(this.lives);
    this.combo = 0;
    this.ui.setCombo(0);
    if (this.lives <= 0) {
      this.gameOver();
      return;
    }
    this.sound.lifeLost();
    this.shakeT = Math.max(this.shakeT, 0.4);
    this.ui.showBanner("BALL LOST", `${this.lives} ${this.lives === 1 ? "LIFE" : "LIVES"} REMAINING`);
    const ball = this.createBall();
    this.balls.push(ball);
    this.ballAttached = true;
  }

  private update(dt: number) {
    this.elapsed += dt;
    this.updateTimers(dt);
    this.updatePaddle(dt);
    this.updateCapsules(dt);

    if (this.mode === "play") {
      this.spawnTrails(dt);
      const steps = Math.max(1, Math.ceil(dt / 0.006));
      const sdt = dt / steps;
      for (let s = 0; s < steps; s++) {
        for (const ball of [...this.balls]) {
          if (!this.balls.includes(ball)) continue;
          this.doMoveBall(ball, sdt);
        }
      }
      this.updateBossBallCheck();
      this.updateBrickFlashes(dt);
    } else if (this.mode === "busy") {
      this.busyTime -= dt;
      if (this.busyTime <= 0) {
        this.mode = "play";
        this.startLevel(this.levelPending);
      }
    }

    this.particles.update(dt);
    this.ui.updateFloaters(dt);

    if (this.ballAttached && this.balls.length) {
      this.ballLight.position.set(this.paddleX, 1.4, PADDLE_Z + 0.5);
    } else if (this.balls.length) {
      const b = this.balls[0];
      this.ballLight.position.set(b.pos.x, 1.6, b.pos.z);
    }

    const ballFocus = this.balls.find((b) => !b.attached);
    const focusX = ballFocus ? ballFocus.pos.x : this.paddleX;
    this.camera.position.x += (focusX * 0.1 - this.camera.position.x) * (1 - Math.exp(-dt * 4));
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      this.camera.position.x += (Math.random() - 0.5) * 0.16 * this.shakeT;
      this.camera.position.y += (Math.random() - 0.5) * 0.16 * this.shakeT;
    }
    this.camera.lookAt(0, 0.1, 0);

    this.floorMat.uniforms.uTime.value = this.elapsed;
    const fb = ballFocus;
    this.floorMat.uniforms.uBall.value.set(
      fb ? fb.pos.x : this.paddleX,
      fb ? fb.pos.z : PADDLE_Z + 0.5
    );
    this.skyMat.uniforms.uTime.value = this.elapsed;
    for (const ball of this.balls) ball.material.uniforms.uTime.value = this.elapsed;
  }

  start() {
    const tick = () => {
      if (this.disposed) return;
      const dt = Math.min(this.clock.getDelta(), 0.033);
      this.update(dt);
      this.postfx.render(this.renderer, this.scene, this.camera, this.elapsed);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.input.dispose();
    window.removeEventListener("resize", this.onResize);
    this.postfx.dispose();
    this.renderer.dispose();
  }
}