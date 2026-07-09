// GLSL shader sources for the neon "2.5D" look.

export const backgroundShader = {
  vertex: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragment: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;

    void main() {
      vec2 uv = vUv;

      // deep space gradient
      vec3 base = mix(vec3(0.02, 0.01, 0.09), vec3(0.0, 0.05, 0.11), uv.y);

      // scrolling neon grid
      vec2 g = uv * vec2(26.0, 34.0);
      g.y += uTime * 0.12;
      vec2 f = abs(fract(g) - 0.5);
      float line = smoothstep(0.46, 0.5, max(f.x, f.y));

      // radial pulse through the grid
      float d = distance(uv, vec2(0.5, 0.55));
      float pulse = 0.5 + 0.5 * sin(uTime * 0.8 - d * 6.0);

      vec3 glow = vec3(0.16, 0.5, 1.0) * line * (0.35 + 0.65 * pulse);
      vec3 col = base + glow * 0.9;

      // vertical color shift for extra depth
      col += vec3(0.10, 0.0, 0.18) * smoothstep(0.0, 1.0, uv.y) * 0.5;

      // vignette
      float vig = smoothstep(1.05, 0.25, d);
      col *= vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export const brickShader = {
  vertex: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = cameraPosition - worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragment: /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform vec3 uColor;
    uniform float uTime;

    void main() {
      // travelling shimmer across the brick
      float shimmer = 0.5 + 0.5 * sin(vUv.x * 9.0 + uTime * 2.2);

      // edge highlight (bright border, darker core)
      float edge =
        smoothstep(0.0, 0.10, vUv.x) *
        smoothstep(0.0, 0.10, 1.0 - vUv.x) *
        smoothstep(0.0, 0.10, vUv.y) *
        smoothstep(0.0, 0.10, 1.0 - vUv.y);
      float border = 1.0 - edge;

      vec3 col = uColor * (0.45 + 0.55 * shimmer);
      col += uColor * border * 1.1;

      // fresnel rim glow
      float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.5);
      col += fres * uColor * 1.8;

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
