import Phaser from 'phaser';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GlowPipeline, ChromaticPipeline } from './shaders/pipelines';

const W = 800;
const H = 600;

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scene.start('StartScene');
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: W,
  height: H,
  parent: 'game-container',
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, StartScene, GameScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  callbacks: {
    postBoot: (game: Phaser.Game) => {
      const renderer = game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer.pipelines) {
        renderer.pipelines.addPostPipeline('GlowPipeline', GlowPipeline);
        renderer.pipelines.addPostPipeline('ChromaticPipeline', ChromaticPipeline);
      }
    },
  },
};

const game = new Phaser.Game(config);
