import * as THREE from "three";

const QUAD_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

function makeRt(w: number, h: number, depth: boolean): THREE.WebGLRenderTarget {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    depthBuffer: depth,
    stencilBuffer: false,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    generateMipmaps: false,
  });
  rt.texture.colorSpace = THREE.NoColorSpace;
  return rt;
}

function makeBrightMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uThreshold: { value: 0.7 },
    },
    vertexShader: QUAD_VERT,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uThreshold;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
        float k = smoothstep(uThreshold, uThreshold + 0.35, lum) + smoothstep(0.0, 0.45, lum) * 0.22;
        gl_FragColor = vec4(c * k, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
}

const BLUR_WEIGHTS = [0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216];

function makeBlurMaterial(): THREE.ShaderMaterial {
  const lines = BLUR_WEIGHTS.map((w, i) => {
    if (i === 0) {
      return `vec3 sum = texture2D(tDiffuse, vUv).rgb * ${w.toFixed(6)};`;
    }
    return [
      `sum += texture2D(tDiffuse, vUv + vec2(float(${i})) * uTexel).rgb * ${w.toFixed(6)};`,
      `sum += texture2D(tDiffuse, vUv - vec2(float(${i})) * uTexel).rgb * ${w.toFixed(6)};`,
    ].join("\n");
  });
  return new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse: { value: null },
      uTexel: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader: QUAD_VERT,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec2 uTexel;
      varying vec2 vUv;
      void main() {
        ${lines.join("\n")}
        gl_FragColor = vec4(sum, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
}

function makeCompositeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: null },
      tBloom: { value: null },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    },
    vertexShader: QUAD_VERT,
    fragmentShader: `
      uniform sampler2D tScene;
      uniform sampler2D tBloom;
      uniform float uTime;
      uniform vec2 uRes;
      varying vec2 vUv;

      vec3 aces(vec3 x) {
        return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
      }

      void main() {
        vec3 scene = texture2D(tScene, vUv).rgb;
        vec3 bloom = texture2D(tBloom, vUv).rgb;
        vec3 col = scene + bloom * 1.5;

        vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
        col *= 1.0 - 0.24 * smoothstep(0.55, 1.15, length(p));

        col += vec3(0.006, 0.005, 0.01);
        col *= 0.985 + 0.015 * sin(vUv.y * uRes.y * 1.25 + uTime * 2.0);

        col = aces(col * 1.16);
        col = pow(col, vec3(0.4545));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
}

export class PostFX {
  private rtScene: THREE.WebGLRenderTarget;
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private quad: THREE.Mesh;
  private cam: THREE.OrthographicCamera;
  private brightMat: THREE.ShaderMaterial;
  private blurH: THREE.ShaderMaterial;
  private blurV: THREE.ShaderMaterial;
  private compMat: THREE.ShaderMaterial;
  private w = 1;
  private h = 1;

  constructor(w: number, h: number) {
    this.rtScene = makeRt(w, h, true);
    this.rtA = makeRt(Math.max(1, (w / 2) | 0), Math.max(1, (h / 2) | 0), false);
    this.rtB = makeRt(Math.max(1, (w / 2) | 0), Math.max(1, (h / 2) | 0), false);
    this.w = w;
    this.h = h;

    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.quad.frustumCulled = false;

    this.brightMat = makeBrightMaterial();
    this.blurH = makeBlurMaterial();
    this.blurV = makeBlurMaterial();
    this.compMat = makeCompositeMaterial();
  }

  resize(w: number, h: number) {
    this.w = Math.max(1, w);
    this.h = Math.max(1, h);
    this.rtScene.setSize(this.w, this.h);
    this.rtA.setSize(Math.max(1, (w / 2) | 0), Math.max(1, (h / 2) | 0));
    this.rtB.setSize(Math.max(1, (w / 2) | 0), Math.max(1, (h / 2) | 0));
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, time: number) {
    this.compMat.uniforms.uTime.value = time;
    this.compMat.uniforms.uRes.value.set(this.w, this.h);

    renderer.setRenderTarget(this.rtScene);
    renderer.clear(true, true, false);
    renderer.render(scene, camera);

    renderer.setRenderTarget(this.rtA);
    this.quad.material = this.brightMat;
    this.brightMat.uniforms.tDiffuse.value = this.rtScene.texture;
    renderer.render(this.quad, this.cam);

    for (let i = 0; i < 2; i++) {
      renderer.setRenderTarget(this.rtB);
      this.quad.material = this.blurH;
      this.blurH.uniforms.tDiffuse.value = this.rtA.texture;
      this.blurH.uniforms.uTexel.value.set(1 / this.rtA.width, 0);
      renderer.render(this.quad, this.cam);

      renderer.setRenderTarget(this.rtA);
      this.quad.material = this.blurV;
      this.blurV.uniforms.tDiffuse.value = this.rtB.texture;
      this.blurV.uniforms.uTexel.value.set(0, 1 / this.rtB.height);
      renderer.render(this.quad, this.cam);
    }

    renderer.setRenderTarget(null);
    this.compMat.uniforms.tScene.value = this.rtScene.texture;
    this.compMat.uniforms.tBloom.value = this.rtA.texture;
    this.quad.material = this.compMat;
    renderer.render(this.quad, this.cam);
  }

  dispose() {
    this.rtScene.dispose();
    this.rtA.dispose();
    this.rtB.dispose();
    this.quad.geometry.dispose();
    this.brightMat.dispose();
    this.blurH.dispose();
    this.blurV.dispose();
    this.compMat.dispose();
  }
}