import * as THREE from "three";

function rawMaterial(
  uniforms: Record<string, THREE.IUniform>,
  vertexShader: string,
  fragmentShader: string,
  extra: Partial<THREE.ShaderMaterialParameters> = {}
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    ...extra,
  });
}

export function makeFloorMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    {
      uTime: { value: 0 },
      uBall: { value: new THREE.Vector2(99, 99) },
      uArena: { value: new THREE.Vector4(-7.6, 7.6, -5.0, 5.0) },
    },
    `
      varying vec3 vWorld;
      void main() {
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      uniform float uTime;
      uniform vec2 uBall;
      uniform vec4 uArena;
      varying vec3 vWorld;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
        vec2 p = vWorld.xz;
        float inArena = step(uArena.x, p.x) * step(p.x, uArena.y) *
                        step(uArena.z, p.y) * step(p.y, uArena.w);

        // ---- cosmic backdrop (everything outside the table) ----
        float n1 = noise(p * 0.16 + vec2(uTime * 0.03, 0.0));
        float n2 = noise(p * 0.32 + vec2(0.0, uTime * 0.02) + 7.3);
        float n3 = noise(p * 0.08 - vec2(uTime * 0.015, uTime * 0.01) + 3.1);
        vec3 deep = vec3(0.02, 0.02, 0.07);
        vec3 nebA = vec3(0.18, 0.06, 0.35);
        vec3 nebB = vec3(0.05, 0.18, 0.42);
        vec3 nebC = vec3(0.40, 0.10, 0.55);
        vec3 back = deep;
        back = mix(back, nebA, smoothstep(0.35, 0.85, n1));
        back = mix(back, nebB, smoothstep(0.30, 0.80, n2));
        back = mix(back, nebC, smoothstep(0.60, 0.95, n3) * 0.6);
        back += vec3(0.2, 0.4, 1.0) * pow(n1, 3.0) * 0.25;
        back += vec3(1.0, 0.4, 0.8) * pow(n2, 4.0) * 0.18;
        float galaxy = sin(atan(p.y, p.x) * 2.0 + length(p) * 0.2 - uTime * 0.1);
        back += vec3(0.16, 0.5, 0.9) * (0.5 + 0.5 * galaxy) * 0.05;
        float star = smoothstep(0.86, 0.95, noise(floor(p * 0.7) * 0.7));
        back += star * vec3(0.8, 0.9, 1.0) * (0.5 + 0.5 * sin(uTime * 2.0 + floor(p.x * 0.7) * 11.0)) * 0.5;

        float hue = 0.5 + 0.5 * sin(p.x * 0.4 + uTime * 0.5);
        vec3 arenaCol = mix(vec3(0.045, 0.10, 0.19), vec3(0.14, 0.03, 0.16), hue);
        vec3 col = mix(back, arenaCol, inArena);

        // rectangular matte frame hugging the walls so the arena pops
        vec3 arenaCenter = vec3((uArena.x + uArena.y) * 0.5, 0.0, (uArena.z + uArena.w) * 0.5);
        vec2 ac = p - arenaCenter.xz;
        vec2 halfW = vec2((uArena.y - uArena.x) * 0.5, (uArena.w - uArena.z) * 0.5);
        vec2 dq = abs(ac) - halfW;
        float sdf = max(dq.x, dq.y);
        float frame = 1.0 - smoothstep(0.25, 1.5, sdf);
        float edgeGlow = 0.5 + 0.3 * sin(uTime * 1.8);
        col += vec3(0.25, 0.62, 1.0) * frame * (1.0 - inArena) * edgeGlow * 0.9;

        vec2 g = fract(p * 14.0);
        float line = step(g.x, 0.035) + step(g.y, 0.035);
        line *= inArena;
        col += vec3(0.35, 0.85, 1.0) * line * (0.055 + 0.045 * sin(uTime * 1.6));

        vec2 delta = p - uBall;
        float d = length(delta);
        float ringR = 0.6 + 0.12 * sin(uTime * 6.0);
        float ring = 1.0 - smoothstep(0.05, 0.22, abs(d - ringR));
        col += vec3(0.7, 0.3, 1.0) * ring * inArena * 0.55;
        col += vec3(0.4, 0.95, 1.0) * exp(-d * 2.4) * inArena * 0.6;

        col += vec3(0.12, 0.35, 0.75) * (0.5 + 0.5 * sin(p.x * 0.6 - uTime * 0.9)) * inArena * 0.06;

        col *= 0.93 + 0.07 * sin(uTime * 2.1);
        col = mix(col, back, 0.18 * (1.0 - inArena));
        col += vec3(0.6, 0.2, 0.9) * inArena * 0.02;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  );
}

export function makeSkyMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    { uTime: { value: 0 } },
    `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      uniform float uTime;
      varying vec3 vPos;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
        vec3 dir = normalize(vPos);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 top = vec3(0.06, 0.08, 0.26);
        vec3 bot = vec3(0.02, 0.02, 0.09);
        vec3 col = mix(bot, top, pow(h, 1.2));

        float n1 = noise(vec2(dir.x * 1.6, dir.y * 3.0) + uTime * 0.02);
        float n2 = noise(vec2(dir.y * 4.0, dir.x * 2.2) - uTime * 0.015 + 5.2);
        col = mix(col, vec3(0.20, 0.08, 0.42), smoothstep(0.45, 0.9, n1) * smoothstep(0.1, 0.5, h));
        col = mix(col, vec3(0.06, 0.22, 0.5), smoothstep(0.5, 0.95, n2) * (1.0 - h * 0.5));

        float starN = noise(dir.xz * 26.0 + uTime * 0.01);
        float star = smoothstep(0.72, 0.9, starN);
        star *= smoothstep(0.04, 0.5, dir.y);
        float tw = 0.6 + 0.4 * sin(uTime * 2.2 + floor(dir.xz * 26.0).x * 11.0);
        col += star * vec3(0.8, 0.9, 1.0) * tw * h;

        col += vec3(0.30, 0.10, 0.42) * smoothstep(0.0, 0.35, h) * exp(-dir.y * 6.0);
        float band = noise(vec2(dir.x * 3.0, 0.4) + uTime * 0.05);
        col += vec3(0.12, 0.22, 0.45) * band * smoothstep(0.0, 0.3, h);
        col += vec3(0.05, 0.12, 0.3) * (0.5 + 0.5 * sin(dir.x * 4.0 - uTime * 0.6));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    { side: THREE.BackSide, depthWrite: false }
  );
}

export function makeBallMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    { uTime: { value: 0 }, uColor: { value: new THREE.Color(0.35, 0.95, 1.0) } },
    `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vView;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float fres = pow(1.0 - abs(dot(n, v)), 2.4);
        float pulse = 1.0 + 0.25 * sin(uTime * 9.0);

        vec3 col = uColor * (0.28 + 0.5 * abs(dot(n, v)));
        col += vec3(1.0, 0.85, 0.7) * fres * 2.8 * pulse;
        col += uColor * 2.4 * fres * 1.8;
        col += vec3(1.0) * pow(fres, 4.0) * 1.2;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  );
}

export function makePaddleMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    {
      uTime: { value: 0 },
      uHalfW: { value: 1.15 },
      uHeight: { value: 0.5 },
      uPulse: { value: 1.0 },
    },
    `
      varying vec3 vLocal;
      void main() {
        vLocal = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      uniform float uTime;
      uniform float uHalfW;
      uniform float uHeight;
      uniform float uPulse;
      varying vec3 vLocal;

      void main() {
        vec2 p = vLocal.xz / vec2(uHalfW, 0.3);
        float edge = 1.0 - smoothstep(0.78, 1.0, abs(p.x));
        float hot = 1.0 - smoothstep(0.0, 0.62, abs(p.x));
        float top = smoothstep(0.0, 0.5, 1.0 - abs(p.y));

        vec3 body = mix(vec3(0.01, 0.025, 0.05), vec3(0.045, 0.09, 0.17), top);
        vec3 cyan = vec3(0.2, 1.0, 0.92);
        vec3 mag = vec3(0.85, 0.25, 1.0);

        vec3 col = body;
        col += cyan * (edge * 1.7) * (0.7 + 0.3 * sin(uTime * 3.0));
        col += cyan * hot * 0.5 * uPulse;
        col += mag * hot * 0.28;
        col += vec3(0.05, 0.12, 0.22) * top * 0.6;

        gl_FragColor = vec4(col, 1.0);
      }
    `
  );
}

export function makeShadowMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    { uStrength: { value: 0.55 } },
    `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    `
      uniform float uStrength;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv * 2.0 - 1.0;
        float d = length(c);
        float a = (1.0 - smoothstep(0.25, 1.0, d)) * uStrength;
        gl_FragColor = vec4(0.0, 0.0, 0.0, a);
      }
    `,
    { transparent: true, depthWrite: false, blending: THREE.MultiplyBlending }
  );
}

export function makeParticleMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    { uSize: { value: 640 } },
    `
      attribute vec3 aColor;
      attribute float aScale;
      attribute float aLife;
      uniform float uSize;
      varying vec3 vColor;
      varying float vLife;
      void main() {
        vColor = aColor;
        vLife = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aScale * (uSize / max(0.1, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,
    `
      varying vec3 vColor;
      varying float vLife;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d) * vLife;
        vec3 col = vColor * (0.55 + 0.75 * a);
        gl_FragColor = vec4(col * a, a);
      }
    `,
    { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
  );
}

export function makeCapsuleMaterial(): THREE.ShaderMaterial {
  return rawMaterial(
    { uColor: { value: new THREE.Color(0.3, 1.0, 0.55) }, uTime: { value: 0 } },
    `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    `
      uniform vec3 uColor;
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float fres = pow(1.0 - abs(dot(n, v)), 2.0);
        vec3 col = uColor * (0.35 + 0.5 * abs(dot(n, v))) + uColor * fres * 2.2;
        col *= 0.9 + 0.2 * sin(uTime * 5.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  );
}
