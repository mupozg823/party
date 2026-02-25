import { Canvas } from './Canvas.js';
import { Input } from './Input.js';
import { SceneManager } from './SceneManager.js';
import { TweenManager } from './Tween.js';
import { AudioManager } from './Audio.js';

export class Game {
  constructor(canvasId, width = 1280, height = 720) {
    this.canvas = new Canvas(canvasId, width, height);
    this.input = new Input(this.canvas.canvas);
    this.scenes = new SceneManager();
    this.tweens = new TweenManager();
    this.audio = new AudioManager();

    this.lastTime = 0;
    this.running = false;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
  }

  start(initialScene, data = null) {
    this.running = true;
    this.scenes.switchImmediate(initialScene, data);
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loop(currentTime) {
    if (!this.running) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.frameCount++;
    this.fpsTimer += dt;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    this.input.update();
    this.tweens.update(dt);
    this.scenes.update(dt);

    this.canvas.clear('#1a1a2e');
    this.scenes.render(this.canvas);

    this.input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
  }
}
