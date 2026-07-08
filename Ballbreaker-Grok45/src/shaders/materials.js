import * as THREE from 'three';

const plasmaVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const plasmaFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying vec3 vPos;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv * 3.0;
    float t = uTime * 0.35;
    float n = noise(uv + vec2(t, -t * 0.7));
    n += 0.5 * noise(uv * 2.1 - vec2(t * 1.3, t * 0.4));
    n += 0.25 * noise(uv * 4.3 + t);
    float band = sin(vUv.y * 12.0 + n * 4.0 + t * 2.0) * 0.5 + 0.5;
    float glow = smoothstep(0.15, 0.9, n * band);
    vec3 col = mix(uColorA, uColorB, glow);
    col += vec3(0.15, 0.35, 0.8) * pow(glow, 3.0);
    float vignette = smoothstep(0.0, 0.45, vUv.x) * smoothstep(1.0, 0.55, vUv.x);
    vignette *= smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
    col *= 0.25 + 0.75 * vignette;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const glowBrickVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const glowBrickFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uPulse;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 N = normalize(vNormal);
    float rim = pow(1.0 - max(dot(N, vec3(0.0, 0.15, 1.0)), 0.0), 2.2);
    float edgeX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    float edgeY = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    float face = edgeX * edgeY;
    float pulse = 0.85 + 0.15 * sin(uTime * 3.0 + vWorldPos.x * 2.0 + vWorldPos.y);
    pulse = mix(1.0, pulse, uPulse);
    vec3 base = uColor * (0.35 + 0.55 * face) * pulse;
    vec3 glow = uColor * rim * 1.6;
    vec3 col = base + glow + vec3(0.08, 0.12, 0.22) * face;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const energyBallVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const energyBallFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.5);
    float core = 0.55 + 0.45 * sin(uTime * 8.0);
    vec3 col = uColor * core + vec3(0.6, 0.9, 1.0) * fresnel * 1.8;
    col += vec3(1.0) * pow(fresnel, 4.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const neonWallFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float scan = 0.5 + 0.5 * sin(vUv.y * 40.0 - uTime * 3.0);
    float edge = pow(1.0 - abs(vUv.x - 0.5) * 2.0, 1.5);
    float glow = scan * edge * 0.6 + 0.25;
    vec3 col = uColor * glow + vec3(0.2, 0.5, 1.0) * edge * 0.35;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const paddleFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float band = smoothstep(0.0, 0.4, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
    float sweep = 0.6 + 0.4 * sin(vUv.x * 12.0 - uTime * 6.0);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.2, 1.0))), 2.0);
    vec3 col = uColor * (0.35 + 0.5 * band * sweep) + vec3(0.5, 0.9, 1.0) * rim;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createPlasmaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(0x060818) },
      uColorB: { value: new THREE.Color(0x1a2868) },
    },
    vertexShader: plasmaVertex,
    fragmentShader: plasmaFragment,
    depthWrite: false,
  });
}

export function createBrickMaterial(colorHex) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 1 },
      uColor: { value: new THREE.Color(colorHex) },
    },
    vertexShader: glowBrickVertex,
    fragmentShader: glowBrickFragment,
  });
}

export function createBallMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xa8f0ff) },
    },
    vertexShader: energyBallVertex,
    fragmentShader: energyBallFragment,
  });
}

export function createWallMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x2848a0) },
    },
    vertexShader: plasmaVertex,
    fragmentShader: neonWallFragment,
  });
}

export function createPaddleMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x44d4ff) },
    },
    vertexShader: plasmaVertex,
    fragmentShader: paddleFragment,
  });
}
