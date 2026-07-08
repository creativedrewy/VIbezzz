import * as THREE from 'three';
import { BRICKS } from '../core/Constants.js';
import { createBrickMaterial } from '../shaders/materials.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class BrickField {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.bricks = [];
    this.materials = [];
    this._sharedGeo = new THREE.BoxGeometry(BRICKS.WIDTH, BRICKS.HEIGHT, BRICKS.DEPTH);
    scene.add(this.group);
    this.build();
  }

  build() {
    this.clear();
    const totalW = BRICKS.COLS * BRICKS.WIDTH + (BRICKS.COLS - 1) * BRICKS.GAP_X;
    const startX = -totalW * 0.5 + BRICKS.WIDTH * 0.5;
    let count = 0;

    for (let row = 0; row < BRICKS.ROWS; row++) {
      const color = BRICKS.COLORS[row % BRICKS.COLORS.length];
      const points = BRICKS.POINTS[row % BRICKS.POINTS.length];
      const mat = createBrickMaterial(color);
      this.materials.push(mat);

      for (let col = 0; col < BRICKS.COLS; col++) {
        const mesh = new THREE.Mesh(this._sharedGeo, mat);
        const x = startX + col * (BRICKS.WIDTH + BRICKS.GAP_X);
        const y = BRICKS.START_Y - row * (BRICKS.HEIGHT + BRICKS.GAP_Y);
        mesh.position.set(x, y, 0);
        mesh.userData = {
          alive: true,
          points,
          halfW: BRICKS.WIDTH * 0.5,
          halfH: BRICKS.HEIGHT * 0.5,
          row,
          col,
        };
        this.group.add(mesh);
        this.bricks.push(mesh);
        count++;
      }
    }
    gameState.bricksRemaining = count;
  }

  clear() {
    for (const b of this.bricks) {
      this.group.remove(b);
    }
    this.bricks = [];
    for (const m of this.materials) m.dispose();
    this.materials = [];
  }

  update(dt) {
    for (const m of this.materials) {
      if (m.uniforms) m.uniforms.uTime.value += dt;
    }
  }

  collideBall(ball) {
    if (!ball.launched) return null;
    const px = ball.position.x;
    const py = ball.position.y;
    const r = ball.radius;

    for (const brick of this.bricks) {
      if (!brick.userData.alive) continue;
      const bx = brick.position.x;
      const by = brick.position.y;
      const hw = brick.userData.halfW;
      const hh = brick.userData.halfH;

      const closestX = THREE.MathUtils.clamp(px, bx - hw, bx + hw);
      const closestY = THREE.MathUtils.clamp(py, by - hh, by + hh);
      const dx = px - closestX;
      const dy = py - closestY;
      if (dx * dx + dy * dy > r * r) continue;

      const overlapX = hw + r - Math.abs(px - bx);
      const overlapY = hh + r - Math.abs(py - by);

      if (overlapX < overlapY) {
        ball.velocity.x *= -1;
        ball.position.x = bx + Math.sign(px - bx || ball.velocity.x) * (hw + r + 0.01);
      } else {
        ball.velocity.y *= -1;
        ball.position.y = by + Math.sign(py - by || ball.velocity.y) * (hh + r + 0.01);
      }

      this.destroyBrick(brick);
      return brick;
    }
    return null;
  }

  destroyBrick(brick) {
    if (!brick.userData.alive) return;
    brick.userData.alive = false;
    brick.visible = false;
    gameState.bricksRemaining = Math.max(0, gameState.bricksRemaining - 1);
    gameState.score += brick.userData.points;
    eventBus.emit(Events.BRICK_DESTROYED, {
      points: brick.userData.points,
      remaining: gameState.bricksRemaining,
      position: brick.position.clone(),
      color: brick.material.uniforms?.uColor?.value?.getHex?.() ?? 0xffffff,
    });
    eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score });
  }

  dispose() {
    this.clear();
    this.scene.remove(this.group);
    this._sharedGeo.dispose();
  }
}
