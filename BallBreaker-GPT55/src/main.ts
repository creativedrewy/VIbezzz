import './styles.css';
import * as THREE from 'three';

type GameState = 'start' | 'playing' | 'gameover';

type Brick = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>;
  bounds: THREE.Box3;
  alive: boolean;
  value: number;
};

type PixelParticle = {
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  life: number;
  maxLife: number;
};

const BOARD_WIDTH = 18;
const BOARD_HEIGHT = 28;
const HALF_W = BOARD_WIDTH / 2;
const HALF_H = BOARD_HEIGHT / 2;
const PADDLE_W = 4.2;
const PADDLE_H = 0.55;
const PADDLE_MAX_STRETCH = 1.82;
const BALL_R = 0.34;
const START_LIVES = 3;

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Missing app root');
}

app.innerHTML = `
  <canvas id="game"></canvas>
  <div class="hud">
    <div class="hud-pill"><span>Score</span><strong id="score">0</strong></div>
    <div class="hud-pill"><span>Lives</span><strong id="lives">3</strong></div>
  </div>
  <section class="screen active" id="start-screen">
    <div class="screen-panel">
      <p class="eyebrow">NEON IMPACT SYSTEM</p>
      <h1>Ball Breaker</h1>
      <p class="copy">Shatter the energy wall, ride the chromatic pulse, and keep the core alive.</p>
      <button id="start-button" type="button">Start Run</button>
    </div>
  </section>
  <section class="screen" id="gameover-screen">
    <div class="screen-panel">
      <p class="eyebrow">SIMULATION TERMINATED</p>
      <h2>Game Over</h2>
      <p class="copy">Final score <strong id="final-score">0</strong></p>
      <button id="restart-button" type="button">Run Again</button>
    </div>
  </section>
`;

const canvas = document.querySelector<HTMLCanvasElement>('#game')!;
const scoreEl = document.querySelector<HTMLElement>('#score')!;
const livesEl = document.querySelector<HTMLElement>('#lives')!;
const finalScoreEl = document.querySelector<HTMLElement>('#final-score')!;
const startScreen = document.querySelector<HTMLElement>('#start-screen')!;
const gameOverScreen = document.querySelector<HTMLElement>('#gameover-screen')!;
const startButton = document.querySelector<HTMLButtonElement>('#start-button')!;
const restartButton = document.querySelector<HTMLButtonElement>('#restart-button')!;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x05010c, 1);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-HALF_W, HALF_W, HALF_H, -HALF_H, 0.1, 100);
camera.position.z = 24;

const clock = new THREE.Clock();
const pointer = new THREE.Vector2(0, 0);
const keyboard = new Set<string>();
const tmpBox = new THREE.Box3();
let state: GameState = 'start';
let score = 0;
let lives = START_LIVES;
let ballVelocity = new THREE.Vector2(5.5, 8.6);
let shake = 0;
let lastHit = 0;
let paddleStretch = 1;

const commonUniforms = {
  uTime: { value: 0 },
  uBeat: { value: 0 }
};

const background = createBackground();
const paddle = createPaddle();
const ball = createBall();
const walls = createWalls();
const bricks: Brick[] = [];
const pixelParticles: PixelParticle[] = [];
const pixelGeometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);

scene.add(background, paddle, ball, ...walls);
createBricks();
resetBall(false);
syncHud();

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
window.addEventListener('keydown', (event) => {
  keyboard.add(event.key.toLowerCase());
  if ((state === 'start' || state === 'gameover') && (event.key === 'Enter' || event.key === ' ')) {
    startGame();
  }
});
window.addEventListener('keyup', (event) => keyboard.delete(event.key.toLowerCase()));
window.addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
window.addEventListener('pointerdown', () => {
  if (state !== 'playing') {
    startGame();
  }
});
window.addEventListener('resize', resize);
resize();
animate();

function startGame(): void {
  state = 'playing';
  score = 0;
  lives = START_LIVES;
  shake = 0;
  bricks.forEach((brick) => {
    brick.alive = true;
    brick.mesh.visible = true;
    brick.mesh.scale.set(1, 1, 1);
  });
  clearPixelParticles();
  paddle.position.x = 0;
  paddle.scale.set(1, 1, 1);
  paddleStretch = 1;
  resetBall(true);
  syncHud();
  startScreen.classList.remove('active');
  gameOverScreen.classList.remove('active');
}

function endGame(): void {
  state = 'gameover';
  finalScoreEl.textContent = String(score);
  gameOverScreen.classList.add('active');
}

function resetBall(launch: boolean): void {
  ball.position.set(paddle.position.x, -HALF_H + 2.4, 1.5);
  ballVelocity.set((Math.random() > 0.5 ? 1 : -1) * 4.8, launch ? 8.4 : 0);
}

function syncHud(): void {
  scoreEl.textContent = String(score);
  livesEl.textContent = String(lives);
}

function animate(): void {
  const dt = Math.min(clock.getDelta(), 0.033);
  const elapsed = clock.elapsedTime;
  commonUniforms.uTime.value = elapsed;
  commonUniforms.uBeat.value = Math.max(0, commonUniforms.uBeat.value - dt * 2.5);
  updateMaterials(elapsed);
  updatePixelParticles(dt);

  if (state === 'playing') {
    updateGame(dt, elapsed);
  } else {
    ball.rotation.x += dt * 1.1;
    ball.rotation.y += dt * 1.6;
    const targetX = pointer.x * (HALF_W - getPaddleHalfWidth());
    const previousX = paddle.position.x;
    paddle.position.x += (targetX - paddle.position.x) * 0.05;
    updatePaddleElastic(dt, previousX, paddle.position.x);
    if (state === 'start') {
      ball.position.x = paddle.position.x;
      ball.position.y = -HALF_H + 2.4 + Math.sin(elapsed * 2.8) * 0.24;
    }
  }

  const rumble = shake * Math.sin(elapsed * 70);
  camera.position.x = rumble * 0.08;
  camera.position.y = rumble * 0.04;
  shake = Math.max(0, shake - dt * 2.2);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function updateGame(dt: number, elapsed: number): void {
  const targetX = getTargetPaddleX(dt);
  const previousX = paddle.position.x;
  paddle.position.x += (targetX - paddle.position.x) * Math.min(1, dt * 16);
  updatePaddleElastic(dt, previousX, paddle.position.x);
  paddle.position.x = THREE.MathUtils.clamp(paddle.position.x, -HALF_W + getPaddleHalfWidth(), HALF_W - getPaddleHalfWidth());
  paddle.rotation.z = (targetX - paddle.position.x) * -0.025;

  ball.position.x += ballVelocity.x * dt;
  ball.position.y += ballVelocity.y * dt;
  ball.rotation.x += ballVelocity.y * dt * 0.8;
  ball.rotation.y += ballVelocity.x * dt * 0.8;

  collideWithWalls();
  collideWithPaddle(elapsed);
  collideWithBricks();

  if (ball.position.y < -HALF_H - 1.5) {
    lives -= 1;
    syncHud();
    if (lives <= 0) {
      endGame();
    } else {
      resetBall(true);
    }
  }

  if (bricks.every((brick) => !brick.alive)) {
    createBricks();
    ballVelocity.multiplyScalar(1.08);
  }
}

function getTargetPaddleX(dt: number): number {
  let keyboardMove = 0;
  if (keyboard.has('arrowleft') || keyboard.has('a')) {
    keyboardMove -= 1;
  }
  if (keyboard.has('arrowright') || keyboard.has('d')) {
    keyboardMove += 1;
  }
  if (keyboardMove !== 0) {
    return paddle.position.x + keyboardMove * 18 * dt;
  }
  return pointer.x * (HALF_W - getPaddleHalfWidth());
}

function updatePaddleElastic(dt: number, previousX: number, nextX: number): void {
  const speed = Math.abs(nextX - previousX) / Math.max(dt, 0.001);
  const speedStretch = THREE.MathUtils.clamp(speed / 19, 0, 1);
  const targetStretch = 1 + speedStretch * (PADDLE_MAX_STRETCH - 1);
  paddleStretch += (targetStretch - paddleStretch) * Math.min(1, dt * 18);
  paddleStretch += Math.sin(clock.elapsedTime * 24) * speedStretch * 0.01;
  paddleStretch = THREE.MathUtils.clamp(paddleStretch, 1, PADDLE_MAX_STRETCH);

  const squash = THREE.MathUtils.clamp(1 - (paddleStretch - 1) * 0.28, 0.72, 1);
  paddle.scale.set(paddleStretch, squash, 1 + (paddleStretch - 1) * 0.1);
  const material = paddle.material as THREE.ShaderMaterial;
  material.uniforms.uStretch.value = paddleStretch - 1;
}

function getPaddleHalfWidth(): number {
  return (PADDLE_W * paddle.scale.x) / 2;
}

function collideWithWalls(): void {
  if (ball.position.x <= -HALF_W + BALL_R) {
    ball.position.x = -HALF_W + BALL_R;
    ballVelocity.x = Math.abs(ballVelocity.x);
    pulse(0.35);
  }
  if (ball.position.x >= HALF_W - BALL_R) {
    ball.position.x = HALF_W - BALL_R;
    ballVelocity.x = -Math.abs(ballVelocity.x);
    pulse(0.35);
  }
  if (ball.position.y >= HALF_H - BALL_R) {
    ball.position.y = HALF_H - BALL_R;
    ballVelocity.y = -Math.abs(ballVelocity.y);
    pulse(0.45);
  }
}

function collideWithPaddle(elapsed: number): void {
  if (ballVelocity.y >= 0 || elapsed - lastHit < 0.04) {
    return;
  }
  const paddleBox = tmpBox.setFromObject(paddle);
  const closestX = THREE.MathUtils.clamp(ball.position.x, paddleBox.min.x, paddleBox.max.x);
  const closestY = THREE.MathUtils.clamp(ball.position.y, paddleBox.min.y, paddleBox.max.y);
  const dx = ball.position.x - closestX;
  const dy = ball.position.y - closestY;
  if (dx * dx + dy * dy <= BALL_R * BALL_R) {
    const offset = (ball.position.x - paddle.position.x) / getPaddleHalfWidth();
    const speed = Math.min(15.8, ballVelocity.length() + 0.25);
    const gummyBoost = (paddleStretch - 1) * 1.45;
    ballVelocity.set(offset * (7.2 + gummyBoost), Math.abs(ballVelocity.y) + 1.7).setLength(speed);
    ball.position.y = paddleBox.max.y + BALL_R;
    lastHit = elapsed;
    pulse(0.8);
  }
}

function collideWithBricks(): void {
  for (const brick of bricks) {
    if (!brick.alive) {
      continue;
    }
    brick.bounds.setFromObject(brick.mesh);
    const closestX = THREE.MathUtils.clamp(ball.position.x, brick.bounds.min.x, brick.bounds.max.x);
    const closestY = THREE.MathUtils.clamp(ball.position.y, brick.bounds.min.y, brick.bounds.max.y);
    const dx = ball.position.x - closestX;
    const dy = ball.position.y - closestY;
    if (dx * dx + dy * dy <= BALL_R * BALL_R) {
      brick.alive = false;
      createPixelExplosion(brick);
      brick.mesh.visible = false;
      score += brick.value;
      syncHud();
      const overlapX = Math.min(Math.abs(ball.position.x - brick.bounds.min.x), Math.abs(ball.position.x - brick.bounds.max.x));
      const overlapY = Math.min(Math.abs(ball.position.y - brick.bounds.min.y), Math.abs(ball.position.y - brick.bounds.max.y));
      if (overlapX < overlapY) {
        ballVelocity.x *= -1;
      } else {
        ballVelocity.y *= -1;
      }
      ballVelocity.multiplyScalar(1.012);
      pulse(1);
      break;
    }
  }
}

function pulse(power: number): void {
  commonUniforms.uBeat.value = Math.min(1.6, commonUniforms.uBeat.value + power);
  shake = Math.min(1, shake + power * 0.4);
}

function createPixelExplosion(brick: Brick): void {
  const material = brick.mesh.material as THREE.ShaderMaterial;
  const colorA = (material.uniforms.uColorA.value as THREE.Color).clone();
  const colorB = (material.uniforms.uColorB.value as THREE.Color).clone();
  const rows = 3;
  const cols = 9;
  const hitBias = new THREE.Vector2(
    Math.sign(ballVelocity.x || ball.position.x - brick.mesh.position.x),
    Math.sign(ballVelocity.y || ball.position.y - brick.mesh.position.y)
  );
  const brickSize = new THREE.Vector3();
  brick.bounds.getSize(brickSize);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (Math.random() < 0.16) {
        continue;
      }
      const u = col / (cols - 1);
      const v = row / (rows - 1);
      const color = colorA.clone().lerp(colorB, u * 0.68 + v * 0.32);
      const mesh = new THREE.Mesh(
        pixelGeometry,
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.95,
          depthWrite: false
        })
      );
      mesh.position.set(
        brick.mesh.position.x + (u - 0.5) * brickSize.x,
        brick.mesh.position.y + (v - 0.5) * brickSize.y,
        brick.mesh.position.z + 0.25
      );
      const outward = new THREE.Vector3(u - 0.5 + hitBias.x * 0.24, v - 0.5 + hitBias.y * 0.18, 0.35).normalize();
      const speed = 3.2 + Math.random() * 4.8;
      scene.add(mesh);
      pixelParticles.push({
        mesh,
        velocity: outward.multiplyScalar(speed).add(new THREE.Vector3(ballVelocity.x * 0.06, ballVelocity.y * 0.035, 1.2)),
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 18
        ),
        life: 0,
        maxLife: 0.48 + Math.random() * 0.42
      });
    }
  }
}

function updatePixelParticles(dt: number): void {
  for (let index = pixelParticles.length - 1; index >= 0; index -= 1) {
    const particle = pixelParticles[index];
    particle.life += dt;
    if (particle.life >= particle.maxLife) {
      scene.remove(particle.mesh);
      particle.mesh.material.dispose();
      pixelParticles.splice(index, 1);
      continue;
    }

    particle.velocity.y -= 7.5 * dt;
    particle.velocity.multiplyScalar(1 - dt * 0.55);
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += particle.spin.x * dt;
    particle.mesh.rotation.y += particle.spin.y * dt;
    particle.mesh.rotation.z += particle.spin.z * dt;

    const fade = 1 - particle.life / particle.maxLife;
    particle.mesh.material.opacity = fade * fade * 0.95;
    const scale = THREE.MathUtils.lerp(0.35, 1, fade);
    particle.mesh.scale.setScalar(scale);
  }
}

function clearPixelParticles(): void {
  pixelParticles.splice(0).forEach((particle) => {
    scene.remove(particle.mesh);
    particle.mesh.material.dispose();
  });
}

function createBackground(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(BOARD_WIDTH * 2.5, BOARD_HEIGHT * 2.5, 1, 1);
  const material = new THREE.ShaderMaterial({
    uniforms: commonUniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform float uBeat;
      varying vec2 vUv;
      float grid(vec2 uv, float scale) {
        vec2 g = abs(fract(uv * scale - 0.5) - 0.5) / fwidth(uv * scale);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float barrel = dot(uv, uv) * 0.09;
        vec2 crtUv = uv * (1.0 + barrel);
        float cells = grid(crtUv + vec2(0.0, uTime * 0.005), 24.0) * 0.16;
        float charRows = grid(vec2(crtUv.x * 0.52, crtUv.y + uTime * 0.012), 11.0) * 0.2;
        float scanDark = 0.58 + 0.42 * sin((vUv.y + uTime * 0.018) * 1050.0);
        float scanBright = smoothstep(0.975, 1.0, sin((vUv.y - uTime * 0.055) * 36.0));
        float phosphorNoise = fract(sin(dot(floor(vUv * vec2(190.0, 140.0)) + floor(uTime * 6.0), vec2(12.9898, 78.233))) * 43758.5453);
        float cursorBand = smoothstep(0.015, 0.0, abs(fract(crtUv.y * 8.0 - uTime * 0.09) - 0.5)) * 0.12;
        float vignette = smoothstep(1.32, 0.22, length(uv));
        vec3 base = vec3(0.0, 0.018, 0.006);
        vec3 phosphor = vec3(0.16, 1.0, 0.42);
        vec3 amber = vec3(1.0, 0.58, 0.14);
        vec3 color = base;
        color += phosphor * (cells + charRows + scanBright * 0.16 + cursorBand);
        color += amber * uBeat * 0.05;
        color *= scanDark;
        color += phosphor * phosphorNoise * 0.025;
        color *= vignette;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = -5;
  return mesh;
}

function createPaddle(): THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial> {
  const geometry = new THREE.BoxGeometry(PADDLE_W, PADDLE_H, 0.55, 18, 3, 1);
  const material = neonMaterial(new THREE.Color(0x6dff8d), new THREE.Color(0xffc04d));
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, -HALF_H + 1.3, 1);
  return mesh;
}

function createBall(): THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial> {
  const geometry = new THREE.IcosahedronGeometry(BALL_R, 5);
  const material = neonMaterial(new THREE.Color(0xd8ffe2), new THREE.Color(0x48ff79));
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function createWalls(): THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>[] {
  const material = neonMaterial(new THREE.Color(0x2dff63), new THREE.Color(0xd6ff7f));
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.2, BOARD_HEIGHT, 0.4), material);
  const right = left.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH, 0.2, 0.4), material);
  left.position.set(-HALF_W - 0.1, 0, 0.5);
  right.position.set(HALF_W + 0.1, 0, 0.5);
  top.position.set(0, HALF_H + 0.1, 0.5);
  return [left, right, top];
}

function createBricks(): void {
  bricks.splice(0).forEach((brick) => scene.remove(brick.mesh));
  const rows = 7;
  const cols = 9;
  const gap = 0.18;
  const brickW = (BOARD_WIDTH - 1.9 - gap * (cols - 1)) / cols;
  const brickH = 0.82;
  const startX = -BOARD_WIDTH / 2 + 0.95 + brickW / 2;
  const startY = HALF_H - 4.1;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const warmth = row / Math.max(1, rows - 1);
      const c1 = new THREE.Color().setHSL(0.36 - warmth * 0.22, 0.94, 0.56);
      const c2 = new THREE.Color().setHSL(0.22 - warmth * 0.08, 0.95, 0.56);
      const geometry = new THREE.BoxGeometry(brickW, brickH, 0.56, 8, 2, 1);
      const material = neonMaterial(c1, c2);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(startX + col * (brickW + gap), startY - row * (brickH + gap), 0.8);
      mesh.userData.phase = (row * 1.7 + col * 0.8) % Math.PI;
      scene.add(mesh);
      bricks.push({
        mesh,
        bounds: new THREE.Box3().setFromObject(mesh),
        alive: true,
        value: (rows - row) * 10
      });
    }
  }
}

function neonMaterial(colorA: THREE.Color, colorB: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...commonUniforms,
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uStretch: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uStretch;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec3 p = position;
        float centerPull = 1.0 - smoothstep(0.0, 2.1, abs(position.x));
        p.y += sin(position.x * 4.6 + uTime * 12.0) * uStretch * 0.055 * centerPull;
        p.z += sin(position.x * 7.0 + uTime * 3.0) * (0.018 + uStretch * 0.05);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float uTime;
      uniform float uBeat;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        float stripe = smoothstep(0.44, 0.5, abs(sin((vUv.x + vUv.y + uTime * 0.32) * 22.0)));
        float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
        vec3 color = mix(uColorA, uColorB, vUv.x + stripe * 0.18);
        color += rim * vec3(0.42, 0.9, 1.0);
        color *= 0.72 + stripe * 0.22 + uBeat * 0.16;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function updateMaterials(elapsed: number): void {
  bricks.forEach((brick, index) => {
    if (!brick.alive) {
      return;
    }
    brick.mesh.position.z = 0.8 + Math.sin(elapsed * 2 + index * 0.22) * 0.08;
  });
}

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  const worldAspect = BOARD_WIDTH / BOARD_HEIGHT;
  const screenAspect = width / height;
  if (screenAspect > worldAspect) {
    const viewW = BOARD_HEIGHT * screenAspect;
    camera.left = -viewW / 2;
    camera.right = viewW / 2;
    camera.top = HALF_H;
    camera.bottom = -HALF_H;
  } else {
    const viewH = BOARD_WIDTH / screenAspect;
    camera.left = -HALF_W;
    camera.right = HALF_W;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
  }
  camera.updateProjectionMatrix();
}
