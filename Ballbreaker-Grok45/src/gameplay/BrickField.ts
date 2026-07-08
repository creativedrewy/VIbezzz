import * as THREE from 'three';
import { BRICKS } from '../core/Constants';
import { createBrickMaterial } from '../shaders/materials';
import { eventBus, Events } from '../core/EventBus';
import { gameState } from '../core/GameState';
import { getLevel, parseLevelLayout } from '../level/Levels';
import type { Ball } from './Ball';

export type BrickUserData = {
  alive: boolean;
  points: number;
  halfW: number;
  halfH: number;
  row: number;
  col: number;
};

type BrickMesh = THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial> & {
  userData: BrickUserData;
};

export class BrickField {
  scene: THREE.Object3D;
  group: THREE.Group;
  bricks: BrickMesh[] = [];
  materials: THREE.ShaderMaterial[] = [];
  private _sharedGeo: THREE.BoxGeometry;

  constructor(scene: THREE.Object3D) {
    this.scene = scene;
    this.group = new THREE.Group();
    this._sharedGeo = new THREE.BoxGeometry(BRICKS.WIDTH, BRICKS.HEIGHT, BRICKS.DEPTH);
    scene.add(this.group);
    this.build(1);
  }

  build(levelNumber: number): void {
    this.clear();
    const level = getLevel(levelNumber);
    const { cells, cols, rows } = parseLevelLayout(level);

    const totalW = cols * BRICKS.WIDTH + Math.max(0, cols - 1) * BRICKS.GAP_X;
    const totalH = rows * BRICKS.HEIGHT + Math.max(0, rows - 1) * BRICKS.GAP_Y;
    const startX = -totalW * 0.5 + BRICKS.WIDTH * 0.5;
    const startY = BRICKS.START_Y - (totalH > 6 ? (totalH - 6 * (BRICKS.HEIGHT + BRICKS.GAP_Y)) * 0.15 : 0);

    const matByColor = new Map<number, THREE.ShaderMaterial>();
    let count = 0;

    for (const cell of cells) {
      let mat = matByColor.get(cell.color);
      if (!mat) {
        mat = createBrickMaterial(cell.color);
        matByColor.set(cell.color, mat);
        this.materials.push(mat);
      }

      const mesh = new THREE.Mesh(this._sharedGeo, mat) as BrickMesh;
      const x = startX + cell.col * (BRICKS.WIDTH + BRICKS.GAP_X);
      const y = startY - cell.row * (BRICKS.HEIGHT + BRICKS.GAP_Y);
      mesh.position.set(x, y, 0);
      mesh.userData = {
        alive: true,
        points: cell.points,
        halfW: BRICKS.WIDTH * 0.5,
        halfH: BRICKS.HEIGHT * 0.5,
        row: cell.row,
        col: cell.col,
      };
      this.group.add(mesh);
      this.bricks.push(mesh);
      count++;
    }

    gameState.bricksRemaining = count;
  }

  clear(): void {
    for (const b of this.bricks) {
      this.group.remove(b);
    }
    this.bricks = [];
    for (const m of this.materials) m.dispose();
    this.materials = [];
  }

  update(dt: number): void {
    for (const m of this.materials) {
      if (m.uniforms?.uTime) {
        m.uniforms.uTime.value = (m.uniforms.uTime.value as number) + dt;
      }
    }
  }

  collideBall(ball: Ball): BrickMesh | null {
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

  destroyBrick(brick: BrickMesh): void {
    if (!brick.userData.alive) return;
    brick.userData.alive = false;
    brick.visible = false;
    gameState.bricksRemaining = Math.max(0, gameState.bricksRemaining - 1);
    gameState.score += brick.userData.points;

    const colorUniform = brick.material.uniforms?.uColor?.value as THREE.Color | undefined;
    eventBus.emit(Events.BRICK_DESTROYED, {
      points: brick.userData.points,
      remaining: gameState.bricksRemaining,
      position: brick.position.clone(),
      color: colorUniform?.getHex?.() ?? 0xffffff,
    });
    eventBus.emit(Events.SCORE_CHANGED, { score: gameState.score });
  }

  dispose(): void {
    this.clear();
    this.scene.remove(this.group);
    this._sharedGeo.dispose();
  }
}
