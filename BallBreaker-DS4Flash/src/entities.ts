import * as THREE from "three";
import { makeBallMaterial, makeCapsuleMaterial, makeParticleMaterial, makePaddleMaterial } from "./shaders";

export type PowerKind = "expand" | "multi" | "life" | "slow";

export interface BrickVisual {
  mesh: THREE.Mesh;
  mat: THREE.MeshPhongMaterial;
  visualColor: THREE.Color;
  x: number;
  z: number;
  hw: number;
  hd: number;
  row: number;
  hp: number;
  maxHp: number;
  flash: number;
  alive: boolean;
  power: PowerKind | null;
}

export function createBrick(w: number, d: number, height: number, color: number): BrickVisual {
  const mat = new THREE.MeshPhongMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.4,
    shininess: 30,
    specular: new THREE.Color(0x334455),
  });
  const geo = new THREE.BoxGeometry(w, height, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return {
    mesh,
    mat,
    visualColor: new THREE.Color(color),
    x: 0,
    z: 0,
    hw: w / 2,
    hd: d / 2,
    row: 0,
    hp: 1,
    maxHp: 1,
    flash: 0,
    alive: true,
    power: null,
  };
}

export function makePaddleMesh(): { mesh: THREE.Mesh; material: THREE.ShaderMaterial; geo: THREE.BoxGeometry } {
  const material = makePaddleMaterial();
  const geo = new THREE.BoxGeometry(2.3, 0.5, 0.4);
  const mesh = new THREE.Mesh(geo, material);
  return { mesh, material, geo };
}

export function makeBallMesh(): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
  const material = makeBallMaterial();
  const geo = new THREE.SphereGeometry(1, 32, 24);
  const mesh = new THREE.Mesh(geo, material);
  return { mesh, material };
}

export function makeCapsule(): { mesh: THREE.Group; material: THREE.ShaderMaterial } {
  const material = makeCapsuleMaterial();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.28, 8, 14), material);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.03, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 2;
  const group = new THREE.Group();
  group.add(body);
  group.add(ring);
  return { mesh: group, material };
}

export interface TrapParticle {
  live: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class Particles {
  private geo: THREE.BufferGeometry;
  private points: THREE.Points;
  private count: number;
  private attrPos: Float32Array;
  private attrColor: Float32Array;
  private attrScale: Float32Array;
  private attrLife: Float32Array;
  private cursor = 0;
  private pool: TrapParticle[] = [];
  private material: THREE.ShaderMaterial;

  constructor(count = 420, scene: THREE.Scene) {
    this.count = count;
    this.attrPos = new Float32Array(count * 3);
    this.attrColor = new Float32Array(count * 3);
    this.attrScale = new Float32Array(count);
    this.attrLife = new Float32Array(count);
    for (let i = 0; i < count; i++) this.attrLife[i] = 0;

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.attrPos, 3));
    this.geo.setAttribute("aColor", new THREE.BufferAttribute(this.attrColor, 3));
    this.geo.setAttribute("aScale", new THREE.BufferAttribute(this.attrScale, 1));
    this.geo.setAttribute("aLife", new THREE.BufferAttribute(this.attrLife, 1));
    this.geo.setDrawRange(0, count);

    this.material = makeParticleMaterial();
    this.points = new THREE.Points(this.geo, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);

    for (let i = 0; i < count; i++) {
      this.pool.push({
        live: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
      });
    }
  }

  burst(pos: THREE.Vector3, color: number, amount: number, speed: number, gravity = true, sizeScale = 1) {
    const c = new THREE.Color(color);
    for (let i = 0; i < amount; i++) {
      const p = this.pool[this.cursor];
      this.cursor = (this.cursor + 1) % this.count;
      p.live = true;
      const spread = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      p.vel.copy(spread).normalize().multiplyScalar(speed * (0.5 + Math.random() * 0.7));
      p.vel.y += Math.random() * speed * 0.7;
      p.pos.copy(pos);
      p.maxLife = 0.5 + Math.random() * 0.45;
      p.life = 1;
      const idx = this.cursor;
      this.attrPos[idx * 3] = p.pos.x;
      this.attrPos[idx * 3 + 1] = p.pos.y;
      this.attrPos[idx * 3 + 2] = p.pos.z;
      this.attrColor[idx * 3] = c.r;
      this.attrColor[idx * 3 + 1] = c.g;
      this.attrColor[idx * 3 + 2] = c.b;
      this.attrScale[idx] = (1.2 + Math.random() * 1.8) * sizeScale;
      this.attrLife[idx] = p.life;
    }
    this.markDirty();
  }

  update(dt: number) {
    let any = false;
    for (let i = 0; i < this.count; i++) {
      const p = this.pool[i];
      if (!p.live) continue;
      p.life -= dt / p.maxLife;
      if (p.life <= 0) {
        p.live = false;
        this.attrLife[i] = 0;
        continue;
      }
      p.pos.addScaledVector(p.vel, dt);
      p.vel.y -= 24 * dt;
      p.vel.multiplyScalar(1 - 1.6 * dt);
      p.pos.y = Math.max(0.02, p.pos.y);
      this.attrPos[i * 3] = p.pos.x;
      this.attrPos[i * 3 + 1] = p.pos.y;
      this.attrPos[i * 3 + 2] = p.pos.z;
      this.attrLife[i] = p.life;
      any = true;
    }
    if (any) {
      (this.attrPos as unknown as THREE.BufferAttribute).needsUpdate = true;
      (this.attrLife as unknown as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  private markDirty() {
    (this.attrPos as unknown as THREE.BufferAttribute).needsUpdate = true;
    (this.attrColor as unknown as THREE.BufferAttribute).needsUpdate = true;
    (this.attrScale as unknown as THREE.BufferAttribute).needsUpdate = true;
    (this.attrLife as unknown as THREE.BufferAttribute).needsUpdate = true;
  }
}