import * as THREE from 'three';
import { CAMERA, COLORS, WORLD, BALL, GAME } from './Constants.js';
import { eventBus, Events } from './EventBus.js';
import { gameState } from './GameState.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Paddle } from '../gameplay/Paddle.js';
import { Ball } from '../gameplay/Ball.js';
import { BrickField } from '../gameplay/BrickField.js';
import { UIManager } from '../ui/UIManager.js';
import { createPlasmaMaterial, createWallMaterial } from '../shaders/materials.js';

export class Game {
  constructor() {
    this.clock = new THREE.Clock();
    this.shaderMats = [];
    this.particles = [];
    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupLights();
    this.setupArena();
    this.setupGameplay();
    this.setupUI();
    this.setupEventListeners();
    this.renderer.setAnimationLoop(() => this.animate());
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(COLORS.BG, 1);
    document.getElementById('game-container').appendChild(this.renderer.domElement);
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(COLORS.FOG, 0.012);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      CAMERA.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA.NEAR,
      CAMERA.FAR,
    );
    this.camera.position.set(CAMERA.POS.x, CAMERA.POS.y, CAMERA.POS.z);
    this.camera.lookAt(CAMERA.LOOK_AT.x, CAMERA.LOOK_AT.y, CAMERA.LOOK_AT.z);
  }

  setupLights() {
    this.scene.add(new THREE.AmbientLight(COLORS.AMBIENT, 0.65));
    const key = new THREE.DirectionalLight(COLORS.DIRECTIONAL, 0.9);
    key.position.set(4, 10, 12);
    this.scene.add(key);
    const rim = new THREE.PointLight(0x4488ff, 1.2, 40);
    rim.position.set(0, 4, 6);
    this.scene.add(rim);
  }

  setupArena() {
    this.playfieldRoot = new THREE.Group();
    this.scene.add(this.playfieldRoot);

    const plasma = createPlasmaMaterial();
    this.shaderMats.push(plasma);
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), plasma);
    bg.position.z = -3;
    this.playfieldRoot.add(bg);

    const floorMat = new THREE.MeshStandardMaterial({
      color: COLORS.FLOOR,
      metalness: 0.4,
      roughness: 0.65,
      emissive: 0x0a1630,
      emissiveIntensity: 0.4,
    });
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD.WIDTH + 1, WORLD.HEIGHT + 1, 0.25),
      floorMat,
    );
    floor.position.z = -0.55;
    this.playfieldRoot.add(floor);

    const wallMat = createWallMaterial();
    this.shaderMats.push(wallMat);
    const wallH = WORLD.HEIGHT + WORLD.WALL_THICKNESS * 2;
    const wallGeo = new THREE.BoxGeometry(WORLD.WALL_THICKNESS, wallH, WORLD.DEPTH);
    const left = new THREE.Mesh(wallGeo, wallMat);
    left.position.set(-WORLD.WIDTH * 0.5, 0, 0);
    const right = new THREE.Mesh(wallGeo, wallMat);
    right.position.set(WORLD.WIDTH * 0.5, 0, 0);
    const topGeo = new THREE.BoxGeometry(WORLD.WIDTH + WORLD.WALL_THICKNESS * 2, WORLD.WALL_THICKNESS, WORLD.DEPTH);
    const top = new THREE.Mesh(topGeo, wallMat);
    top.position.set(0, WORLD.HEIGHT * 0.5, 0);
    this.playfieldRoot.add(left, right, top);

    const railGeo = new THREE.BoxGeometry(WORLD.WIDTH - WORLD.WALL_THICKNESS, 0.06, 0.08);
    const railMat = new THREE.MeshBasicMaterial({ color: 0x55aaff, transparent: true, opacity: 0.35 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, -WORLD.HEIGHT * 0.5 + 1.2, 0.4);
    this.playfieldRoot.add(rail);

    this.playfieldRoot.rotation.x = -0.18;
    this.playfieldRoot.position.y = 0.4;
  }

  setupGameplay() {
    this.input = new InputSystem(this.renderer.domElement);
    this.paddle = new Paddle(this.playfieldRoot);
    this.ball = new Ball(this.playfieldRoot);
    this.bricks = new BrickField(this.playfieldRoot);
    this.playfieldHalf = WORLD.WIDTH * 0.5 - WORLD.WALL_THICKNESS - 0.2;
    this.shaderMats.push(this.paddle.material, this.ball.material, ...this.bricks.materials);
  }

  setupUI() {
    this.ui = new UIManager();
    this.ui.setScreen('start');
  }

  setupEventListeners() {
    eventBus.on(Events.GAME_START, () => this.startGame());
    eventBus.on(Events.GAME_RESTART, () => this.restartGame());
    eventBus.on(Events.BRICK_DESTROYED, (data) => this.spawnBurst(data.position, data.color));
  }

  startGame() {
    gameState.reset();
    gameState.isPlaying = true;
    gameState.screen = 'game';
    this.clearParticles();
    this.bricks.build();
    this.paddle.reset();
    this.ball.resetOnPaddle(this.paddle.mesh.position.x);
    this.ui.syncHud();
    this.ui.setScreen('game');
    this.ui.setLaunchHint(true);
    eventBus.emit(Events.SCORE_CHANGED, { score: 0 });
    eventBus.emit(Events.LIVES_CHANGED, { lives: gameState.lives });
  }

  clearParticles() {
    for (const p of this.particles) {
      this.playfieldRoot.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this.particles = [];
  }

  restartGame() {
    this.startGame();
  }

  endGame(won) {
    gameState.isPlaying = false;
    gameState.won = won;
    if (won) gameState.score += GAME.WIN_BONUS;
    this.ui.showGameOver(won, gameState.score);
    eventBus.emit(Events.GAME_OVER, { won, score: gameState.score });
  }

  loseBall() {
    gameState.lives -= 1;
    eventBus.emit(Events.LIVES_CHANGED, { lives: gameState.lives });
    eventBus.emit(Events.BALL_LOST);
    if (gameState.lives <= 0) {
      this.endGame(false);
      return;
    }
    this.ball.resetOnPaddle(this.paddle.mesh.position.x);
    this.ui.setLaunchHint(true);
  }

  spawnBurst(position, colorHex) {
    const color = new THREE.Color(colorHex || 0xffffff);
    for (let i = 0; i < 10; i++) {
      const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(position);
      mesh.position.z = 0.2;
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 6,
        Math.random() * 2,
      );
      this.playfieldRoot.add(mesh);
      this.particles.push({ mesh, vel, life: 0.45 + Math.random() * 0.25, age: 0 });
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.age += dt;
      p.mesh.position.x += p.vel.x * dt;
      p.mesh.position.y += p.vel.y * dt;
      p.mesh.position.z += p.vel.z * dt;
      p.vel.y -= 8 * dt;
      p.mesh.material.opacity = Math.max(0, 1 - p.age / p.life);
      p.mesh.scale.setScalar(Math.max(0.01, 1 - p.age / p.life));
      if (p.age >= p.life) {
        this.playfieldRoot.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  animate() {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    for (const m of this.shaderMats) {
      if (m?.uniforms?.uTime) m.uniforms.uTime.value = t;
    }
    this.bricks.update(dt);

    this.input.update();

    if (gameState.isPlaying) {
      this.paddle.update(dt, this.input, this.playfieldHalf);

      if (!this.ball.launched) {
        this.ball.stickToPaddle(this.paddle.mesh.position.x);
        if (this.input.consumeLaunch()) {
          const spread = (Math.random() - 0.5) * BALL.LAUNCH_ANGLE_SPREAD;
          this.ball.launch(spread);
          this.ui.setLaunchHint(false);
        }
      } else {
        this.input.consumeLaunch();
        this.ball.update(dt);
        this.ball.collidePaddle(this.paddle);
        this.bricks.collideBall(this.ball);

        if (gameState.bricksRemaining <= 0) {
          this.endGame(true);
        } else if (this.ball.isLost()) {
          this.loseBall();
        }
      }
    } else {
      this.input.consumeLaunch();
      this.paddle.update(dt * 0.5, this.input, this.playfieldHalf);
    }

    this.updateParticles(dt);
    this.playfieldRoot.rotation.y = Math.sin(t * 0.15) * 0.03;

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
