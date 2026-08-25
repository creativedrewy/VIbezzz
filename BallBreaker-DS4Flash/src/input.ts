import * as THREE from "three";

export class Input {
  private canvas: HTMLCanvasElement;
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private camera: THREE.Camera | null = null;
  private rect: DOMRect | null = null;

  left = false;
  right = false;
  pointerWorldX = 0;
  pointerActive = false;
  pointerSeen = false;

  onAction: (() => void) | null = null;
  onPointer: ((worldX: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("contextmenu", this.onCtx);
    canvas.addEventListener("pointercancel", this.onPointerUp);
  }

  setCamera(camera: THREE.Camera) {
    this.camera = camera;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("contextmenu", this.onCtx);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  private onCtx = (e: Event) => e.preventDefault();

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.left = true;
    if (k === "ArrowRight" || k === "d" || k === "D") this.right = true;
    if (k === " " || k === "Enter") {
      e.preventDefault();
      this.onAction?.();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") this.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") this.right = false;
  };

  private computeWorldX(clientX: number, clientY: number): number {
    if (!this.camera) return 0;
    if (!this.rect) this.rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((clientX - this.rect.left) / this.rect.width) * 2 - 1,
      -((clientY - this.rect.top) / this.rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(this.plane, hit)) {
      return hit.x;
    }
    return 0;
  }

  private onPointerMove = (e: PointerEvent) => {
    this.pointerSeen = true;
    if (e.pointerType === "mouse" && e.buttons === 0) {
      this.pointerActive = false;
    }
    this.pointerWorldX = this.computeWorldX(e.clientX, e.clientY);
    this.rect = null;
    this.onPointer?.(this.pointerWorldX);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.pointerSeen = true;
    this.pointerActive = true;
    this.pointerWorldX = this.computeWorldX(e.clientX, e.clientY);
    this.rect = null;
    this.onPointer?.(this.pointerWorldX);
    this.onAction?.();
  };

  private onPointerUp = () => {
    this.pointerActive = false;
  };
}