import * as THREE from "three";

// ─── Configuration ───────────────────────────────────────────────────────────
const WHEEL_RADIUS = 3;
const WHEEL_DEPTH = 1.4;
const SPIN_MIN_SPEED = 12; // rad/s
const SPIN_MAX_SPEED = 20;
const FRICTION = 0.97; // per-frame multiplier
const STOP_THRESHOLD = 0.005;

// Bright color palette for wheel faces
const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F1948A", "#82E0AA", "#F8C471", "#AED6F1", "#D2B4DE",
  "#A3E4D7", "#FAD7A0", "#A9CCE3", "#D5DBDB", "#F5B7B1",
];

// ─── State ───────────────────────────────────────────────────────────────────
let words: string[] = [];          // canonical list of unique names
let wheelLabels: string[] = [];    // labels on the wheel (may be duplicated)
let spinSpeed = 0;
let isSpinning = false;
let wheelGroup: THREE.Group;
let pointerMesh: THREE.Mesh;

// Parent group for static perspective tilt — wheel spins inside it
const tiltGroup = new THREE.Group();

// ─── Three.js Setup ──────────────────────────────────────────────────────────
const container = document.getElementById("canvas-container")!;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#0a0a1a");

// Camera angled slightly down so the wheel sits in the upper portion of the canvas
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 1, 9);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(5, 5, 8);
dirLight.castShadow = true;
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x6c63ff, 1.0);
fillLight.position.set(-3, -2, 4);
scene.add(fillLight);

// ─── Pointer (arrow on the right side of the wheel, pointing left) ──────────
// The pointer sits at the right edge of the wheel at mid-height,
// indicating which face is "selected" (the one facing the camera, angle = 0).
function createPointer(): THREE.Mesh {
  const shape = new THREE.Shape();
  // Left-pointing triangle (in X-Y plane, tip at -X)
  shape.moveTo(-0.6, 0);        // tip pointing left toward the wheel
  shape.lineTo(0.15, 0.3);      // upper right
  shape.lineTo(0.15, -0.3);     // lower right
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false });
  // Center the extrusion along Z
  geo.translate(0, 0, -0.1);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xdd2222,
    emissive: 0xdd2222,
    emissiveIntensity: 0.25,
    metalness: 0.6,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);

  // Position at the right side wall of the wheel, at mid-height, at the front
  // face position (z = faceRadius). faceRadius depends on n, so we'll use
  // WHEEL_RADIUS as a close approximation and update in buildWheel.
  mesh.position.set(WHEEL_DEPTH / 2 + 0.25, 0, WHEEL_RADIUS);

  return mesh;
}

// ─── Create text texture for a face ──────────────────────────────────────────
// faceWidth and faceHeight correspond to the geometry dimensions so the
// canvas aspect ratio matches the mesh face, preventing text stretch.
function createTextTexture(text: string, bgColor: string, faceWidth: number, faceHeight: number): THREE.CanvasTexture {
  const PIXELS_PER_UNIT = 256;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(faceWidth * PIXELS_PER_UNIT);
  canvas.height = Math.round(faceHeight * PIXELS_PER_UNIT);
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

  // Text
  ctx.fillStyle = "#1a1a2e";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Auto-size font
  let fontSize = 64;
  ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  while (ctx.measureText(text).width > canvas.width * 0.85 && fontSize > 16) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px 'Segoe UI', system-ui, sans-serif`;
  }

  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// ─── Build the n-gon wheel ──────────────────────────────────────────────────
function buildWheel(): void {
  // Remove old wheel from tilt group
  if (wheelGroup) {
    tiltGroup.remove(wheelGroup);
    wheelGroup.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
  }

  wheelGroup = new THREE.Group();
  if (words.length < 2) {
    wheelLabels = [...words];
    return;
  }

  // If fewer than 10 names, duplicate the list so each name appears twice
  if (words.length < 10) {
    // Interleave the duplicates so the same name isn't adjacent
    wheelLabels = [];
    for (const w of words) {
      wheelLabels.push(w);
    }
    for (const w of words) {
      wheelLabels.push(w);
    }
  } else {
    wheelLabels = [...words];
  }

  const n = wheelLabels.length;
  const angleStep = (Math.PI * 2) / n;
  const faceRadius = WHEEL_RADIUS * Math.cos(angleStep / 2);

  // Build each face as a separate box, positioned around the wheel
  for (let i = 0; i < n; i++) {
    const angle = i * angleStep;
    const color = COLORS[i % COLORS.length];

    // Face dimensions — chord length
    const chordLength = 2 * WHEEL_RADIUS * Math.sin(angleStep / 2);

    // Create a box for each segment
    const geo = new THREE.BoxGeometry(WHEEL_DEPTH, chordLength * 0.97, 0.08);

    // Create materials — front face gets the text (pass face dims for correct aspect ratio)
    const texture = createTextTexture(wheelLabels[i], color, WHEEL_DEPTH, chordLength * 0.97);
    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.1,
      roughness: 0.6,
    });
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.05,
      roughness: 0.5,
    });

    // Box materials: [+x, -x, +y, -y, +z (front), -z (back)]
    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, sideMat];
    const mesh = new THREE.Mesh(geo, materials);

    // Position the face on the polygon perimeter
    const midAngle = angle + angleStep / 2;
    mesh.position.set(0, Math.sin(midAngle) * faceRadius, Math.cos(midAngle) * faceRadius);

    // Rotate to face outward
    mesh.rotation.x = -(midAngle);

    wheelGroup.add(mesh);
  }

  // Add "hub" caps on left and right
  const hubGeo = new THREE.CylinderGeometry(WHEEL_RADIUS * 0.92, WHEEL_RADIUS * 0.92, WHEEL_DEPTH * 0.95, n, 1);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a4a,
    metalness: 0.4,
    roughness: 0.5,
  });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  hub.rotation.z = Math.PI / 2;
  wheelGroup.add(hub);

  // Center axle
  const axleGeo = new THREE.CylinderGeometry(0.15, 0.15, WHEEL_DEPTH + 0.5, 16);
  const axleMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });
  const axle = new THREE.Mesh(axleGeo, axleMat);
  axle.rotation.z = Math.PI / 2;
  wheelGroup.add(axle);

  // Hubcap decorations
  for (const side of [-1, 1]) {
    const capGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0xf7c948,
      metalness: 0.7,
      roughness: 0.2,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = side * (WHEEL_DEPTH / 2 + 0.15);
    wheelGroup.add(cap);
  }

  // Update pointer Z position to match actual face radius
  if (pointerMesh) {
    pointerMesh.position.z = faceRadius + 0.08;
  }

  // Add wheel to the tilt group (tilt is on the parent, spin is on this group)
  tiltGroup.add(wheelGroup);
}

// ─── Pointer angle constant ──────────────────────────────────────────────────
// The pointer sits at the right side of the wheel at y=0, z=faceRadius
// (the face facing the camera). This corresponds to angle 0 in our coordinate
// system where angle is measured as atan2(y, z).
const POINTER_ANGLE = 0;

// ─── Determine which face is at the pointer position ─────────────────────────
function getWinningIndex(): number {
  const n = wheelLabels.length;
  const angleStep = (Math.PI * 2) / n;
  const rot = wheelGroup.rotation.x;

  // A face originally at local angle α, after group rotation θ around X,
  // ends up at world angle (α - θ). For it to be at the pointer (angle 0):
  //   α - θ ≡ 0  →  α ≡ θ  (mod 2π)
  const targetLocalAngle = rot + POINTER_ANGLE;

  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < n; i++) {
    const midAngle = i * angleStep + angleStep / 2;
    // Angular distance between this face's local angle and the target
    let diff = midAngle - targetLocalAngle;
    // Normalize to [-π, π]
    diff = diff - Math.round(diff / (Math.PI * 2)) * (Math.PI * 2);
    const absDiff = Math.abs(diff);
    if (absDiff < bestDist) {
      bestDist = absDiff;
      bestIdx = i;
    }
  }
  return bestIdx;
}

// ─── Snap the wheel so the winning face is perfectly at the pointer ──────────
function snapToFace(faceIndex: number): void {
  const n = wheelLabels.length;
  const angleStep = (Math.PI * 2) / n;
  const midAngle = faceIndex * angleStep + angleStep / 2;

  // We need: midAngle - θ ≡ POINTER_ANGLE (mod 2π)  →  θ = midAngle - POINTER_ANGLE
  const targetRot = midAngle - POINTER_ANGLE;

  // Find the closest multiple of 2π so we don't jump backward
  const currentRot = wheelGroup.rotation.x;
  const fullTurns = Math.round((currentRot - targetRot) / (Math.PI * 2));
  wheelGroup.rotation.x = targetRot + fullTurns * Math.PI * 2;
}

// ─── Spin the wheel ──────────────────────────────────────────────────────────
function startSpin(): void {
  if (isSpinning || words.length < 2) return;
  beginSpin(SPIN_MIN_SPEED + Math.random() * (SPIN_MAX_SPEED - SPIN_MIN_SPEED));
}

function beginSpin(speed: number): void {
  isSpinning = true;
  spinSpeed = speed;

  // Hide previous winner
  const banner = document.getElementById("winner-banner")!;
  banner.classList.remove("visible");

  const spinBtn = document.getElementById("spin-btn") as HTMLButtonElement;
  spinBtn.disabled = true;
}

// ─── Drag-to-spin (mouse & touch) ───────────────────────────────────────────
const DRAG_SENSITIVITY = 0.008;   // radians per pixel of mouse movement
const FLING_MIN_SPEED = 2;        // minimum rad/s to count as a fling

let isDragging = false;
let dragLastY = 0;
let dragVelocitySamples: { dy: number; dt: number }[] = [];
let dragLastTime = 0;

function onDragStart(clientY: number): void {
  if (isSpinning) return;
  isDragging = true;
  dragLastY = clientY;
  dragLastTime = performance.now();
  dragVelocitySamples = [];

  // Hide previous winner on new interaction
  const banner = document.getElementById("winner-banner")!;
  banner.classList.remove("visible");
}

function onDragMove(clientY: number): void {
  if (!isDragging || !wheelGroup) return;

  const now = performance.now();
  const dy = clientY - dragLastY;
  const dt = now - dragLastTime;

  // Rotate the wheel in real-time based on drag distance
  wheelGroup.rotation.x += dy * DRAG_SENSITIVITY;

  // Record velocity sample (keep last ~5 samples for smoothing)
  if (dt > 0) {
    dragVelocitySamples.push({ dy, dt });
    if (dragVelocitySamples.length > 5) {
      dragVelocitySamples.shift();
    }
  }

  dragLastY = clientY;
  dragLastTime = now;
}

function onDragEnd(): void {
  if (!isDragging) return;
  isDragging = false;

  if (words.length < 2) return;

  // Compute average velocity from recent samples
  let totalDy = 0;
  let totalDt = 0;
  for (const s of dragVelocitySamples) {
    totalDy += s.dy;
    totalDt += s.dt;
  }

  if (totalDt > 0) {
    // Convert px/ms → rad/s
    const pxPerMs = totalDy / totalDt;
    const radPerSec = pxPerMs * DRAG_SENSITIVITY * 1000;

    if (Math.abs(radPerSec) >= FLING_MIN_SPEED) {
      beginSpin(Math.abs(radPerSec));
      return;
    }
  }
}

// Mouse events
renderer.domElement.addEventListener("mousedown", (e) => {
  onDragStart(e.clientY);
});
window.addEventListener("mousemove", (e) => {
  onDragMove(e.clientY);
});
window.addEventListener("mouseup", () => {
  onDragEnd();
});

// Touch events
renderer.domElement.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    onDragStart(e.touches[0].clientY);
  }
}, { passive: true });
window.addEventListener("touchmove", (e) => {
  if (e.touches.length === 1) {
    onDragMove(e.touches[0].clientY);
  }
}, { passive: true });
window.addEventListener("touchend", () => {
  onDragEnd();
});
window.addEventListener("touchcancel", () => {
  onDragEnd();
});

// ─── UI Hookup ───────────────────────────────────────────────────────────────
const wordInput = document.getElementById("word-input") as HTMLInputElement;
const spinBtn = document.getElementById("spin-btn") as HTMLButtonElement;
const chipListEl = document.getElementById("chip-list")!;

function renderChips(): void {
  chipListEl.innerHTML = "";
  words.forEach((word, index) => {
    const chip = document.createElement("span");
    chip.className = "chip";

    const label = document.createElement("span");
    label.textContent = word;

    const xBtn = document.createElement("button");
    xBtn.className = "chip-x";
    xBtn.textContent = "✕";
    xBtn.title = `Remove ${word}`;
    xBtn.addEventListener("click", () => removeWord(index));

    chip.appendChild(label);
    chip.appendChild(xBtn);
    chipListEl.appendChild(chip);
  });
}

const STORAGE_KEY = "wheelOfStandup_names";

function saveWords(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function addWord(word: string): void {
  const trimmed = word.trim();
  if (!trimmed) return;
  words.push(trimmed);
  saveWords();
  buildWheel();
  renderChips();
}

function removeWord(index: number): void {
  words.splice(index, 1);
  saveWords();
  buildWheel();
  renderChips();
}

wordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addWord(wordInput.value);
    wordInput.value = "";
  }
});

spinBtn.addEventListener("click", startSpin);

// ─── Load names from localStorage, or use defaults ──────────────────────────
const saved = localStorage.getItem(STORAGE_KEY);
if (saved) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      words = parsed;
    }
  } catch { /* ignore bad data */ }
}
if (words.length === 0) {
  words = ["Alice", "Bob", "Charlie", "Diana", "Eduardo",
           "Fiona", "George", "Hannah", "Ivan", "Julia"];
  saveWords();
}

// ─── Tilt group + Pointer ────────────────────────────────────────────────────
// The tilt group provides a static Y rotation for 3D perspective.
// The wheel spins purely around X inside it, avoiding Euler compound wobble.
tiltGroup.rotation.y = -0.25;
scene.add(tiltGroup);

pointerMesh = createPointer();
tiltGroup.add(pointerMesh);

// ─── Initial build ───────────────────────────────────────────────────────────
buildWheel();
renderChips();

// ─── Resize handler ──────────────────────────────────────────────────────────
function onResize(): void {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);
onResize();

// ─── Animation Loop ──────────────────────────────────────────────────────────
function animate(): void {
  requestAnimationFrame(animate);

  if (isSpinning && wheelGroup) {
    wheelGroup.rotation.x += spinSpeed * 0.016; // ~60fps timestep

    // Apply friction
    spinSpeed *= FRICTION;

    // Check if we've slowed down enough to stop
    if (spinSpeed < STOP_THRESHOLD) {
      spinSpeed = 0;
      isSpinning = false;

      // Determine winner (no snap — let it rest naturally)
      const winnerIdx = getWinningIndex();

      const spinBtnEl = document.getElementById("spin-btn") as HTMLButtonElement;
      spinBtnEl.disabled = false;

      const banner = document.getElementById("winner-banner")!;
      banner.textContent = `🎉 ${wheelLabels[winnerIdx]}!`;
      banner.classList.add("visible");
    }
  }

  renderer.render(scene, camera);
}

animate();
