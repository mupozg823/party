export class SceneManager {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.nextScene = null;
    this.transitionAlpha = 0;
    this.transitioning = false;
    this.transitionSpeed = 0.03;
    this.transitionData = null;
  }

  add(name, scene) {
    this.scenes[name] = scene;
  }

  switchTo(name, data = null) {
    if (this.transitioning) return;
    this.nextScene = name;
    this.transitionData = data;
    this.transitioning = true;
    this.transitionAlpha = 0;
  }

  switchImmediate(name, data = null) {
    if (this.currentScene && this.scenes[this.currentScene]?.exit) {
      this.scenes[this.currentScene].exit();
    }
    this.currentScene = name;
    if (this.scenes[name]?.enter) {
      this.scenes[name].enter(data);
    }
  }

  update(dt) {
    if (this.transitioning) {
      this.transitionAlpha += this.transitionSpeed;
      if (this.transitionAlpha >= 1) {
        if (this.currentScene && this.scenes[this.currentScene]?.exit) {
          this.scenes[this.currentScene].exit();
        }
        this.currentScene = this.nextScene;
        if (this.scenes[this.currentScene]?.enter) {
          this.scenes[this.currentScene].enter(this.transitionData);
        }
        this.nextScene = null;
        this.transitionData = null;
      }
      if (this.transitionAlpha >= 2) {
        this.transitionAlpha = 0;
        this.transitioning = false;
      }
      return;
    }

    const scene = this.scenes[this.currentScene];
    if (scene?.update) {
      scene.update(dt);
    }
  }

  render(canvas) {
    const scene = this.scenes[this.currentScene];
    if (scene?.render) {
      scene.render(canvas);
    }

    if (this.transitioning) {
      const alpha = this.transitionAlpha <= 1
        ? this.transitionAlpha
        : 2 - this.transitionAlpha;
      canvas.setAlpha(alpha);
      canvas.drawRect(0, 0, canvas.width, canvas.height, '#000000');
      canvas.resetAlpha();
    }
  }

  getCurrentScene() {
    return this.scenes[this.currentScene];
  }
}
