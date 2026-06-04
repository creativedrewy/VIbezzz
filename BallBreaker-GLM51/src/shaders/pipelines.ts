import Phaser from 'phaser';

export class GlowPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private _intensity: number = 0;
  private _time: number = 0;

  constructor(game: Phaser.Game) {
    super({
      name: 'GlowPipeline',
      game,
      renderTarget: true,
      fragShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform sampler2D mainSampler;
        uniform float time;
        uniform float intensity;
        varying vec2 outTexCoord;

        void main() {
          vec2 uv = outTexCoord;
          vec4 col = texture2D(mainSampler, uv);

          float glow = 0.0;
          float blurSize = 0.003 + intensity * 0.002;

          for (float x = -3.0; x <= 3.0; x += 1.0) {
            for (float y = -3.0; y <= 3.0; y += 1.0) {
              vec2 offset = vec2(x, y) * blurSize;
              vec4 sample = texture2D(mainSampler, uv + offset);
              float brightness = dot(sample.rgb, vec3(0.2126, 0.7152, 0.0722));
              glow += brightness * (1.0 - abs(x) / 4.0) * (1.0 - abs(y) / 4.0);
            }
          }
          glow /= 49.0;

          vec3 glowCol = vec3(0.39, 0.4, 0.95) * glow * intensity * 3.0;

          float scanline = sin(uv.y * 800.0 + time * 2.0) * 0.015 * intensity;
          col.rgb += glowCol + scanline;

          float vignette = 1.0 - 0.3 * length(uv - 0.5);
          col.rgb *= vignette;

          gl_FragColor = col;
        }
      `,
    });
  }

  set intensity(value: number) {
    this._intensity = value;
  }

  get intensity(): number {
    return this._intensity;
  }

  onPreRender(): void {
    this._time += 0.016;
    this.set1f('time', this._time);
    this.set1f('intensity', this._intensity);
  }
}

export class ChromaticPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  private _amount: number = 0;
  private _time: number = 0;

  constructor(game: Phaser.Game) {
    super({
      name: 'ChromaticPipeline',
      game,
      renderTarget: true,
      fragShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform sampler2D mainSampler;
        uniform float time;
        uniform float amount;
        varying vec2 outTexCoord;

        void main() {
          vec2 uv = outTexCoord;
          float offset = amount * 0.003;

          float r = texture2D(mainSampler, uv + vec2(offset, 0.0)).r;
          float g = texture2D(mainSampler, uv).g;
          float b = texture2D(mainSampler, uv - vec2(offset, 0.0)).b;
          float a = texture2D(mainSampler, uv).a;

          gl_FragColor = vec4(r, g, b, a);
        }
      `,
    });
  }

  set amount(value: number) {
    this._amount = value;
  }

  get amount(): number {
    return this._amount;
  }

  onPreRender(): void {
    this._time += 0.016;
    this.set1f('time', this._time);
    this.set1f('amount', this._amount);
  }
}
