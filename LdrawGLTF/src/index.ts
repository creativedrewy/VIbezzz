import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/examples/jsm/materials/LDrawConditionalLineMaterial.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// ── DOM refs ────────────────────────────────────────────────
const canvas = document.getElementById('viewport') as HTMLCanvasElement;
const dropZone = document.getElementById('drop-zone')!;
const btnOpen = document.getElementById('btn-open')!;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const statusEl = document.getElementById('status')!;
const fileInput = document.getElementById('file-input') as HTMLInputElement;

// ── Three.js setup ──────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0b1120);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(150, 200, 250);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.minDistance = 5;
controls.maxDistance = 4000;

// Lights
const ambientLight = new THREE.AmbientLight(0xddeeff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(200, 400, 300);
scene.add(dirLight);

const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight2.position.set(-200, 100, -100);
scene.add(dirLight2);

// Ground grid
const gridHelper = new THREE.GridHelper(400, 40, 0x1a2a44, 0x111b2e);
scene.add(gridHelper);

// ── LDraw loader ────────────────────────────────────────────
const LDRAW_PARTS_LIBRARY =
  'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/complete/ldraw/';

const ldrawLoader = new LDrawLoader();
ldrawLoader.setPartsLibraryPath(LDRAW_PARTS_LIBRARY);
ldrawLoader.setConditionalLineMaterial(LDrawConditionalLineMaterial);

// Preload the official LDraw colour definitions, then add default fallbacks
const materialsReady = ldrawLoader
  .preloadMaterials(LDRAW_PARTS_LIBRARY + 'LDConfig.ldr')
  .then(() => {
    console.log('LDraw materials preloaded');
  })
  .catch(() => {
    console.warn('Could not preload LDraw materials, using defaults');
    ldrawLoader.addDefaultMaterials();
  });

// Track whatever model is currently in the scene
let currentModel: THREE.Group | null = null;

// ── Status helpers ──────────────────────────────────────────
function setStatus(msg: string, loading = false) {
  statusEl.textContent = msg;
  statusEl.className = loading ? 'loading' : '';
}

// ── Load an LDraw text blob ─────────────────────────────────
async function loadLDrawText(text: string, fileName: string) {
  setStatus(`Loading ${fileName}...`, true);
  btnExport.disabled = true;

  // Make sure the material library is ready before we parse
  await materialsReady;

  ldrawLoader.parse(
    text,
    (group: THREE.Group) => {
      // Remove previous model
      if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }

      // LDraw uses a coordinate system where Y is up but inverted
      group.rotation.x = Math.PI;

      // Centre and fit to view
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();

      group.position.sub(center);
      group.position.y += box.getSize(new THREE.Vector3()).y / 2;

      camera.position.set(size * 0.8, size * 0.8, size * 0.8);
      camera.near = size / 100;
      camera.far = size * 100;
      camera.updateProjectionMatrix();
      controls.target.set(0, box.getSize(new THREE.Vector3()).y / 4, 0);
      controls.update();

      scene.add(group);
      currentModel = group;

      // Hide the empty drop zone prompt
      dropZone.classList.remove('empty');

      btnExport.disabled = false;
      setStatus(`${fileName} loaded`);
    },
    (error: unknown) => {
      console.error('LDraw parse error:', error);
      setStatus(`Error loading ${fileName}`);
    },
  );
}

// ── File reading helper ─────────────────────────────────────
function handleFiles(files: FileList | File[]) {
  const file = files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    loadLDrawText(reader.result as string, file.name);
  };
  reader.readAsText(file);
}

// ── Drag & drop ─────────────────────────────────────────────
let dragCounter = 0;

window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  dropZone.classList.add('active');
});

window.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dragCounter--;
  if (dragCounter <= 0) {
    dragCounter = 0;
    dropZone.classList.remove('active');
  }
});

window.addEventListener('dragover', (e) => {
  e.preventDefault();
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  dropZone.classList.remove('active');

  if (e.dataTransfer?.files.length) {
    handleFiles(e.dataTransfer.files);
  }
});

// ── File‐picker button ──────────────────────────────────────
btnOpen.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  if (fileInput.files?.length) {
    handleFiles(fileInput.files);
    fileInput.value = ''; // reset so same file can be re-opened
  }
});

// ── GLB export ──────────────────────────────────────────────
btnExport.addEventListener('click', async () => {
  if (!currentModel) return;

  setStatus('Exporting GLB...', true);
  btnExport.disabled = true;

  try {
    // Clone the model and strip all line geometry (edge lines / conditional lines)
    // so the exported GLB only contains mesh surfaces
    const exportModel = currentModel.clone(true);
    const toRemove: THREE.Object3D[] = [];
    exportModel.traverse((child) => {
      if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
        toRemove.push(child);
      }
    });
    for (const obj of toRemove) {
      obj.parent?.remove(obj);
    }

    const exporter = new GLTFExporter();
    const glb = await exporter.parseAsync(exportModel, { binary: true }) as ArrayBuffer;

    // Trigger download
    const blob = new Blob([glb], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentModel.userData.fileName || 'model').replace(/\.[^.]+$/, '') + '.glb';
    a.click();
    URL.revokeObjectURL(url);

    setStatus('GLB exported!');
  } catch (err) {
    console.error('GLB export error:', err);
    setStatus('Export failed');
  } finally {
    btnExport.disabled = false;
  }
});

// ── Resize handling ─────────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Render loop ─────────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Start with the "empty" prompt visible
dropZone.classList.add('empty');
