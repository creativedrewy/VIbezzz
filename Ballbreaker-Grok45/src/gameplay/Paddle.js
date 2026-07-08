import * as THREE from 'three';
import { PADDLE, WORLD } from '../core/Constants.js';
import { createPaddleMaterial } from '../shaders/materials.js';

export class Paddle {
  constructor(scene) {
    this.scene = scene;
    this.halfWidth = PADDLE.WIDTH * 0.5;
    this.velocityX = 0;
    this.material = createPaddleMaterial();

    const geo = new THREE.BoxGeometry(PADDLE.WIDTH, PADDLE.HEIGHT, PADDLE.DEPTH, 1, 1, 1);
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.position.set(0, PADDLE.Y, PADDLE.Z);

    const edgeGeo = new THREE.BoxGeometry(PADDLE.WIDTH + 0.08, PADDLE.HEIGHT + 0.06, 0.08);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: 0x88eeff,
      transparent: true,
      opacity: 0.55,
    });
    this.edge = new THREE.Mesh(edgeGeo, edgeMat);
    this.edge.position.z = PADDLE.DEPTH * 0.5 + 0.02;
    this.mesh.add(this.edge);

    scene.add(this.mesh);
    this._maxX = WORLD.WIDTH * 0.5 - WORLD.WALL_THICKNESS - this.halfWidth - 0.05;
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
    if (this.material.uniforms) this.material.uniforms.uTime.value += dt;
  }

  reset() {
    this.mesh.position.x = 0;
    this.velocityX = 0;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.material.dispose();
    this.edge.geometry.dispose();
    this.edge.material.dispose();
  }
}
