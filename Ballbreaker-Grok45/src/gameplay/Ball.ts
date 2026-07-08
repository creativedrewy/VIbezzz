import * as THREE from 'three';
import { BALL, PADDLE, WORLD } from '../core/Constants';
import { createBallMaterial } from '../shaders/materials';
import { eventBus, Events } from '../core/EventBus';
import type { Paddle } from './Paddle';

export class Ball {
  scene: THREE.Object3D;
  radius: number;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  speed: number;
  active = false;
  launched = false;
  glow: THREE.Mesh;

  constructor(scene: THREE.Object3D) {
    this.scene = scene;
    this.radius = BALL.RADIUS;
    this.material = createBallMaterial();
    const geo = new THREE.SphereGeometry(this.radius, 24, 24);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.velocity = new THREE.Vector2(0, 0);
    this.speed = BALL.SPEED;

    const glowGeo = new THREE.SphereGeometry(this.radius * 1.55, 16, 16);
    this.glow = new THREE.Mesh(
      glowGeo,
      new THREE.MeshBasicMaterial({
        color: 0x66ddff,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    this.mesh.add(this.glow);
    scene.add(this.mesh);
    this.resetOnPaddle(0);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  resetOnPaddle(paddleX: number): void {
    this.launched = false;
    this.active = true;
    this.speed = BALL.SPEED;
    this.velocity.set(0, 0);
    this.mesh.position.set(paddleX, PADDLE.Y + PADDLE.HEIGHT * 0.5 + this.radius + 0.05, 0);
  }

  launch(angleOffset = 0): void {
    if (this.launched) return;
    this.launched = true;
    const angle = Math.PI * 0.5 + angleOffset;
    this.velocity.set(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    eventBus.emit(Events.BALL_LAUNCH);
  }

  update(dt: number): void {
    if (this.material.uniforms?.uTime) {
      this.material.uniforms.uTime.value = (this.material.uniforms.uTime.value as number) + dt;
    }
    if (!this.launched || !this.active) return;

    this.mesh.position.x += this.velocity.x * dt;
    this.mesh.position.y += this.velocity.y * dt;

    const halfW = WORLD.WIDTH * 0.5 - WORLD.WALL_THICKNESS - this.radius;
    const top = WORLD.HEIGHT * 0.5 - WORLD.WALL_THICKNESS - this.radius;

    if (this.mesh.position.x < -halfW) {
      this.mesh.position.x = -halfW;
      this.velocity.x = Math.abs(this.velocity.x);
    } else if (this.mesh.position.x > halfW) {
      this.mesh.position.x = halfW;
      this.velocity.x = -Math.abs(this.velocity.x);
    }

    if (this.mesh.position.y > top) {
      this.mesh.position.y = top;
      this.velocity.y = -Math.abs(this.velocity.y);
    }

    this._normalizeSpeed();
  }

  stickToPaddle(paddleX: number): void {
    if (!this.launched) {
      this.mesh.position.x = paddleX;
      this.mesh.position.y = PADDLE.Y + PADDLE.HEIGHT * 0.5 + this.radius + 0.05;
    }
  }

  collidePaddle(paddle: Paddle): boolean {
    if (!this.launched || this.velocity.y > 0) return false;
    const b = paddle.bounds;
    const px = this.mesh.position.x;
    const py = this.mesh.position.y;
    const closestX = THREE.MathUtils.clamp(px, b.minX, b.maxX);
    const closestY = THREE.MathUtils.clamp(py, b.minY, b.maxY);
    const dx = px - closestX;
    const dy = py - closestY;
    if (dx * dx + dy * dy > this.radius * this.radius) return false;

    const hit = (px - b.centerX) / b.halfWidth;
    const clamped = THREE.MathUtils.clamp(hit, -1, 1);
    const angle = clamped * PADDLE.MAX_BOUNCE_ANGLE;
    this.speed = Math.min(this.speed + BALL.SPEED_GAIN, BALL.MAX_SPEED);
    this.velocity.x = Math.sin(angle) * this.speed + paddle.velocityX * 0.15;
    this.velocity.y = Math.abs(Math.cos(angle) * this.speed);
    this.mesh.position.y = b.maxY + this.radius + 0.01;
    this._normalizeSpeed();
    eventBus.emit(Events.PADDLE_HIT);
    return true;
  }

  isLost(): boolean {
    return this.mesh.position.y < PADDLE.Y - 2.5;
  }

  private _normalizeSpeed(): void {
    const len = this.velocity.length();
    if (len > 0.001) {
      this.velocity.multiplyScalar(this.speed / len);
      if (Math.abs(this.velocity.y) < this.speed * 0.35) {
        const sign = this.velocity.y >= 0 ? 1 : -1;
        this.velocity.y = sign * this.speed * 0.35;
        const sx = Math.sqrt(Math.max(this.speed * this.speed - this.velocity.y * this.velocity.y, 0));
        this.velocity.x = Math.sign(this.velocity.x || 1) * sx;
      }
    }
  }

  dispose(): void {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.glow.geometry.dispose();
    (this.glow.material as THREE.Material).dispose();
  }
}
