import * as THREE from 'three';
import { PADDLE, WORLD } from '../core/Constants.js';
import { createPaddleMaterial } from '../shaders/materials.js';

export class Paddle {
  constructor(scene) {
    this.scene = scene;
    this.halfWidth = PADDLE.WIDTH * 0.5;
    this.velocityX = 0;
    this._disposables = [];

    this.mesh = new THREE.Group();
    this.mesh.position.set(0, PADDLE.Y, PADDLE.Z);

    this.materials = [];
    this._buildBody();

    scene.add(this.mesh);
    this._maxX = WORLD.WIDTH * 0.5 - WORLD.WALL_THICKNESS - this.halfWidth - 0.05;
  }

  _add(mesh) {
    this.mesh.add(mesh);
    this._disposables.push(mesh.geometry);
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((m) => this._disposables.push(m));
    } else {
      this._disposables.push(mesh.material);
    }
    return mesh;
  }

  _buildBody() {
    const w = PADDLE.WIDTH;
    const h = PADDLE.HEIGHT;
    const d = PADDLE.DEPTH;

    const bodyMat = createPaddleMaterial(0x2ec8ff, 0.9);
    const darkMat = createPaddleMaterial(0x1268a8, 0.7);
    const accentMat = createPaddleMaterial(0x9ef6ff, 1.0);
    const capMat = createPaddleMaterial(0x55e0ff, 0.95);
    this.materials = [bodyMat, darkMat, accentMat, capMat];
    this.material = bodyMat;

    // Main chassis — wide, deep bar
    const body = this._add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, h * 0.72, d * 0.88), bodyMat));
    body.position.set(0, -h * 0.05, 0);

    // Upper bevel / face plate (stepped for depth)
    const face = this._add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, h * 0.38, d * 0.55), accentMat));
    face.position.set(0, h * 0.28, d * 0.12);

    // Front bumper strip (catch surface for the ball)
    const bumper = this._add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h * 0.22, d * 0.22), accentMat));
    bumper.position.set(0, h * 0.42, d * 0.32);

    // Lower keel for mass / silhouette
    const keel = this._add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, h * 0.28, d * 0.5), darkMat));
    keel.position.set(0, -h * 0.38, -d * 0.05);

    // Side pods (classic Arkanoid wing look)
    const podGeo = new THREE.BoxGeometry(w * 0.16, h * 0.95, d * 1.05);
    const leftPod = this._add(new THREE.Mesh(podGeo, capMat));
    leftPod.position.set(-w * 0.42, 0, 0.02);
    const rightPod = this._add(new THREE.Mesh(podGeo.clone(), capMat));
    rightPod.position.set(w * 0.42, 0, 0.02);
    this._disposables.push(rightPod.geometry);

    // Outer caps — slightly angled via scale for a chunkier end
    const capGeo = new THREE.BoxGeometry(w * 0.12, h * 1.05, d * 0.75);
    const leftCap = this._add(new THREE.Mesh(capGeo, bodyMat));
    leftCap.position.set(-w * 0.48, 0.02, d * 0.08);
    leftCap.rotation.z = 0.12;
    const rightCap = this._add(new THREE.Mesh(capGeo.clone(), bodyMat));
    rightCap.position.set(w * 0.48, 0.02, d * 0.08);
    rightCap.rotation.z = -0.12;
    this._disposables.push(rightCap.geometry);

    // Top rail glow
    const rail = this._add(
      new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.62, h * 0.1, d * 0.18),
        new THREE.MeshBasicMaterial({ color: 0xb8ffff, transparent: true, opacity: 0.75 }),
      ),
    );
    rail.position.set(0, h * 0.52, d * 0.38);

    // Underside shadow bar for 3D read
    const shadow = this._add(
      new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.68, h * 0.08, d * 0.7),
        new THREE.MeshBasicMaterial({ color: 0x041018, transparent: true, opacity: 0.55 }),
      ),
    );
    shadow.position.set(0, -h * 0.55, -0.05);

    // Subtle pitch so the front lip reads in 2.5D camera
    this.mesh.rotation.x = -0.22;
  }

  get bounds() {
    const p = this.mesh.position;
    return {
      minX: p.x - this.halfWidth,
      maxX: p.x + this.halfWidth,
      minY: p.y - PADDLE.HEIGHT * 0.5,
      maxY: p.y + PADDLE.HEIGHT * 0.5,
      centerX: p.x,
      halfWidth: this.halfWidth,
    };
  }

  setTargetX(x) {
    this.mesh.position.x = THREE.MathUtils.clamp(x, -this._maxX, this._maxX);
  }

  update(dt, input, playfieldHalfWidth) {
    const prev = this.mesh.position.x;
    if (input.moveX !== 0) {
      this.mesh.position.x += input.moveX * PADDLE.SPEED * dt;
      this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -this._maxX, this._maxX);
    } else if (input.hasPointer) {
      const target = input.pointerX * playfieldHalfWidth;
      this.mesh.position.x = THREE.MathUtils.clamp(target, -this._maxX, this._maxX);
    }
    this.velocityX = (this.mesh.position.x - prev) / Math.max(dt, 1e-5);
    const t = this.material.uniforms.uTime.value + dt;
    for (const m of this.materials) {
      if (m.uniforms?.uTime) m.uniforms.uTime.value = t;
    }
  }

  reset() {
    this.mesh.position.x = 0;
    this.velocityX = 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
    for (const d of this._disposables) {
      if (d && typeof d.dispose === 'function') d.dispose();
    }
    this._disposables = [];
  }
}
