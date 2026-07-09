import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Game, GameInput } from './Game';
import { backgroundShader } from './shaders';
import './style.css';

// ---------- DOM ----------
const canvas = document.getElementById('scene') as HTMLCanvasElement;
const hud = document.getElementById('hud') as HTMLElement;
const startScreen = document.getElementById('startScreen') as HTMLElement;
const gameOverScreen = document.getElementById('gameOverScreen') as HTMLElement;
const levelClear = document.getElementById('levelClear') as HTMLElement;
const scoreEl = document.getElementById('score') as HTMLElement;
const levelEl = document.getElementById('level') as HTMLElement;
const livesEl = document.getElementById('lives') as HTMLElement;
const finalScoreEl = document.getElementById('finalScore') as HTMLElement;

type State = 'start' | 'playing' | 'gameover';
let state: State = 'start';

// ---------- Renderer / Scene / Camera ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 5, 30);
camera.lookAt(0, 1, 0);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight(0x4060ff, 0.6));
const key = new THREE.PointLight(0xffffff, 1.4, 200);
key.position.set(0, 6, 18);
scene.add(key);

// ---------- Background shader plane ----------
const bgMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 } },
  vertexShader: backgroundShader.vertex,
  fragmentShader: backgroundShader.fragment,
  depthWrite: false,
});
const bg = new THREE.Mesh(new THREE.PlaneGeometry(140, 100), bgMat);
bg.position.set(0, 0, -12);
scene.add(bg);

// ---------- Game ----------
const game = new Game(scene, {
  onScore: (s) => (scoreEl.textContent = String(s)),
  onLives: (l) => (livesEl.textContent = String(l)),
  onLevel: (l) => (levelEl.textContent = String(l)),
  onLevelCleared: () => flash(levelClear, 'LEVEL CLEAR', 1100),
  onGameOver: () => endGame(),
});

// ---------- Post processing (bloom) ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.35, // strength
  0.25, // radius
  0.8 // threshold
);
composer.addPass(bloom);
composer.setSize(window.innerWidth, window.innerHeight);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ---------- Input ----------
const input: GameInput = {
  useMouse: false,
  targetX: 0,
  left: false,
  right: false,
  launch: false,
};
let launchRequested = false;

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();

function pointerToWorldX(clientX: number, clientY: number): number {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const ok = raycaster.ray.intersectPlane(groundPlane, hit);
  return ok ? hit.x : 0;
}

window.addEventListener('pointermove', (e) => {
  input.useMouse = true;
  input.targetX = pointerToWorldX(e.clientX, e.clientY);
});

function requestLaunch() {
  launchRequested = true;
}

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.useMouse = false;
      input.left = true;
      e.preventDefault();
      break;
    case 'ArrowRight':
    case 'KeyD':
      input.useMouse = false;
      input.right = true;
      e.preventDefault();
      break;
    case 'Space':
      e.preventDefault();
      if (state === 'start') startGame();
      else if (state === 'playing') requestLaunch();
      else if (state === 'gameover') restart();
      break;
    case 'Enter':
      if (state === 'gameover') restart();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;
});

canvas.addEventListener('pointerdown', () => {
  if (state === 'start') startGame();
  else if (state === 'playing') requestLaunch();
  else if (state === 'gameover') restart();
});

document.getElementById('startBtn')?.addEventListener('click', startGame);
document.getElementById('restartBtn')?.addEventListener('click', restart);

// ---------- State transitions ----------
function startGame() {
  if (state !== 'start') return;
  state = 'playing';
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  hud.classList.remove('hidden');
}

function restart() {
  game.reset();
  finalScoreEl.textContent = '0';
  gameOverScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  levelClear.classList.add('hidden');
  state = 'playing';
}

function endGame() {
  state = 'gameover';
  finalScoreEl.textContent = scoreEl.textContent ?? '0';
  hud.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
}

let flashTimer = 0;
function flash(el: HTMLElement, _text: string, ms: number) {
  el.classList.remove('hidden');
  flashTimer = ms;
}

// ---------- Resize ----------
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  bloom.setSize(w, h);
});

// ---------- Loop ----------
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);
  const t = clock.elapsedTime;

  // animate shaders regardless of game state
  bgMat.uniforms.uTime.value = t;
  for (const m of game.brickMaterials) m.uniforms.uTime.value = t;

  if (state === 'playing') {
    game.update(dt, { ...input, launch: launchRequested });
  }
  launchRequested = false;

  if (flashTimer > 0) {
    flashTimer -= dt * 1000;
    if (flashTimer <= 0) levelClear.classList.add('hidden');
  }

  composer.render();
}

animate();
