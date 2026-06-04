export const bgFrag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  float t = time * 0.3;

  float wave1 = sin(uv.x * 6.0 + t) * cos(uv.y * 4.0 + t * 0.7) * 0.5 + 0.5;
  float wave2 = sin(uv.x * 3.0 - t * 1.3) * cos(uv.y * 5.0 + t * 0.5) * 0.5 + 0.5;
  float pattern = mix(wave1, wave2, 0.5);

  vec3 col = mix(color1, color2, pattern);
  col *= 0.3 + 0.1 * sin(uv.y * 10.0 + t * 2.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const ballGlowFrag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform sampler2D mainSampler;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tex = texture2D(mainSampler, uv);

  float glow = 0.0;
  float radius = 0.015;
  for (float i = -4.0; i <= 4.0; i += 1.0) {
    for (float j = -4.0; j <= 4.0; j += 1.0) {
      vec2 offset = vec2(i, j) * radius;
      float sample = texture2D(mainSampler, uv + offset).a;
      glow += sample;
    }
  }
  glow /= 81.0;

  vec3 glowColor = vec3(0.3, 0.6, 1.0) * glow * 2.0;
  vec3 col = tex.rgb + glowColor * (1.0 - tex.a);

  gl_FragColor = vec4(col, max(tex.a, glow * 0.5));
}
`;

export const brickDestroyFrag = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform sampler2D mainSampler;
uniform vec2 resolution;
uniform float intensity;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  float distort = intensity * 0.02;
  uv.x += sin(uv.y * 50.0 + time * 10.0) * distort;
  uv.y += cos(uv.x * 50.0 + time * 10.0) * distort;

  vec4 tex = texture2D(mainSampler, uv);

  float scanline = sin(gl_FragCoord.y * 2.0 + time * 20.0) * 0.04 * intensity;
  vec3 col = tex.rgb + vec3(scanline);

  float vignette = 1.0 - intensity * 0.3 * length(uv - 0.5);
  col *= vignette;

  gl_FragColor = vec4(col, tex.a);
}
`;
