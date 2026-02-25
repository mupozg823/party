export class TweenManager {
  constructor() {
    this.tweens = [];
  }

  add(target, props, duration, {
    easing = 'easeInOut',
    delay = 0,
    onComplete = null,
    onUpdate = null
  } = {}) {
    const tween = {
      target,
      startValues: {},
      endValues: props,
      duration,
      delay,
      elapsed: 0,
      easing,
      onComplete,
      onUpdate,
      active: true
    };

    for (const key in props) {
      tween.startValues[key] = target[key];
    }

    this.tweens.push(tween);
    return tween;
  }

  update(dt) {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const t = this.tweens[i];
      if (!t.active) {
        this.tweens.splice(i, 1);
        continue;
      }

      if (t.delay > 0) {
        t.delay -= dt;
        continue;
      }

      t.elapsed += dt;
      const progress = Math.min(t.elapsed / t.duration, 1);
      const eased = this.ease(progress, t.easing);

      for (const key in t.endValues) {
        t.target[key] = t.startValues[key] + (t.endValues[key] - t.startValues[key]) * eased;
      }

      if (t.onUpdate) t.onUpdate(progress);

      if (progress >= 1) {
        t.active = false;
        if (t.onComplete) t.onComplete();
        this.tweens.splice(i, 1);
      }
    }
  }

  ease(t, type) {
    switch (type) {
      case 'linear': return t;
      case 'easeIn': return t * t;
      case 'easeOut': return 1 - (1 - t) * (1 - t);
      case 'easeInOut': return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'bounce': return this.bounceOut(t);
      case 'elastic': return this.elasticOut(t);
      default: return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
  }

  bounceOut(t) {
    if (t < 1 / 2.75) return 7.5625 * t * t;
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }

  elasticOut(t) {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
  }

  clear() {
    this.tweens = [];
  }

  get count() {
    return this.tweens.length;
  }
}
