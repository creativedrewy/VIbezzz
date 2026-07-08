export class InputSystem {
  constructor(rendererDom) {
    this.dom = rendererDom;
    this.keys = new Set();
    this.moveX = 0;
    this.pointerX = 0;
    this.hasPointer = false;
    this.launchPressed = false;
    this._pointerActive = false;

    this._onKeyDown = (e) => this.onKeyDown(e);
    this._onKeyUp = (e) => this.onKeyUp(e);
    this._onPointerMove = (e) => this.onPointerMove(e);
    this._onPointerDown = (e) => this.onPointerDown(e);
    this._onPointerUp = (e) => this.onPointerUp(e);
    this._onContext = (e) => e.preventDefault();

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this.dom.addEventListener('pointermove', this._onPointerMove);
    this.dom.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointerup', this._onPointerUp);
    this.dom.addEventListener('contextmenu', this._onContext);
  }

  onKeyDown(e) {
    if (e.repeat) return;
    this.keys.add(e.code);
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      this.launchPressed = true;
    }
  }

  onKeyUp(e) {
    this.keys.delete(e.code);
  }

  onPointerMove(e) {
    const rect = this.dom.getBoundingClientRect();
    if (rect.width <= 0) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerX = nx;
    this.hasPointer = true;
  }

  onPointerDown(e) {
    this._pointerActive = true;
    this.onPointerMove(e);
    this.launchPressed = true;
  }

  onPointerUp() {
    this._pointerActive = false;
  }

  update() {
    let keyboard = 0;
    if (this.keys.has('ArrowLeft') || this.keys.has('KeyA')) keyboard -= 1;
    if (this.keys.has('ArrowRight') || this.keys.has('KeyD')) keyboard += 1;
    this.moveX = keyboard;
  }

  consumeLaunch() {
    if (this.launchPressed) {
      this.launchPressed = false;
      return true;
    }
    return false;
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.dom.removeEventListener('pointermove', this._onPointerMove);
    this.dom.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointerup', this._onPointerUp);
    this.dom.removeEventListener('contextmenu', this._onContext);
  }
}
